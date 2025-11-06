# ==============================================================================
# AZURE KUBERNETES SERVICE (AKS)
# ==============================================================================

resource "azurerm_kubernetes_cluster" "main" {
  name                = var.aks_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "${var.project_name}-aks"
  kubernetes_version  = var.aks_kubernetes_version

  # Default node pool configuration
  default_node_pool {
    name                = "system"
    node_count          = var.aks_node_count
    vm_size             = var.aks_node_vm_size
    vnet_subnet_id      = azurerm_subnet.aks.id
    enable_auto_scaling = var.aks_enable_auto_scaling
    min_count           = var.aks_enable_auto_scaling ? var.aks_min_count : null
    max_count           = var.aks_enable_auto_scaling ? var.aks_max_count : null
    os_disk_size_gb     = 30
    os_disk_type        = "Managed"
    type                = "VirtualMachineScaleSets"
    
    # Node pool tags
    tags = var.common_tags

    # Upgrade settings
    upgrade_settings {
      max_surge = "10%"
    }
  }

  # Managed Identity configuration
  identity {
    type = "SystemAssigned"
  }

  # Network configuration
  network_profile {
    network_plugin     = var.aks_network_plugin
    load_balancer_sku  = "standard"
    outbound_type      = "loadBalancer"
    dns_service_ip     = "10.2.0.10"
    docker_bridge_cidr = "172.17.0.1/16"
    service_cidr       = "10.2.0.0/24"
  }

  # Enable various AKS features
  role_based_access_control_enabled = true
  
  # Azure AD integration
  azure_active_directory_role_based_access_control {
    managed = true
  }

  # Auto-scaler profile
  auto_scaler_profile {
    balance_similar_node_groups      = false
    expander                        = "random"
    max_graceful_termination_sec    = "600"
    max_node_provisioning_time      = "15m"
    max_unready_nodes               = 3
    max_unready_percentage          = 45
    new_pod_scale_up_delay          = "10s"
    scale_down_delay_after_add      = "10m"
    scale_down_delay_after_delete   = "20s"
    scale_down_delay_after_failure  = "3m"
    scan_interval                   = "10s"
    scale_down_unneeded             = "10m"
    scale_down_unready              = "20m"
    scale_down_utilization_threshold = "0.5"
  }

  # Monitoring with Azure Monitor
  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  }

  # HTTP application routing (disabled for production)
  http_application_routing_enabled = false

  # Key Vault secrets provider
  key_vault_secrets_provider {
    secret_rotation_enabled  = true
    secret_rotation_interval = "2m"
  }

  # Workload identity (for OIDC)
  oidc_issuer_enabled       = true
  workload_identity_enabled = true

  tags = var.common_tags

  depends_on = [
    azurerm_subnet.aks,
    azurerm_log_analytics_workspace.main
  ]

  lifecycle {
    ignore_changes = [
      default_node_pool[0].node_count,
      kubernetes_version,
      tags
    ]
  }
}

# ==============================================================================
# NGINX INGRESS CONTROLLER
# ==============================================================================

# Create namespace for NGINX Ingress Controller
resource "kubernetes_namespace" "nginx_ingress" {
  depends_on = [azurerm_kubernetes_cluster.main]
  
  metadata {
    name = var.nginx_ingress_namespace
    labels = {
      name = var.nginx_ingress_namespace
    }
  }
}

# Install NGINX Ingress Controller using Helm
resource "helm_release" "nginx_ingress" {
  depends_on = [
    azurerm_kubernetes_cluster.main,
    kubernetes_namespace.nginx_ingress
  ]

  name       = "ingress-nginx"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  version    = "4.8.0"
  namespace  = var.nginx_ingress_namespace

  # Core configuration values
  values = [yamlencode({
    controller = {
      replicaCount = var.nginx_ingress_replica_count
      
      # Node selector for Linux nodes
      nodeSelector = {
        "kubernetes.io/os" = "linux"
      }
      
      # Service configuration
      service = {
        type                     = "LoadBalancer"
        externalTrafficPolicy   = "Local"
        loadBalancerIP          = ""
        annotations = {
          "service.beta.kubernetes.io/azure-load-balancer-health-probe-request-path" = "/healthz"
          "service.beta.kubernetes.io/azure-dns-label-name"                          = "bookreviews-api"
        }
      }
      
      # Metrics and monitoring
      metrics = {
        enabled = true
        serviceMonitor = {
          enabled = false # Enable if using Prometheus
        }
      }
      
      # Pod annotations for monitoring
      podAnnotations = {
        "prometheus.io/scrape" = "true"
        "prometheus.io/port"   = "10254"
      }
      
      # Resource limits
      resources = {
        requests = {
          cpu    = "100m"
          memory = "90Mi"
        }
        limits = {
          cpu    = "500m"
          memory = "500Mi"
        }
      }
      
      # Autoscaling configuration
      autoscaling = {
        enabled     = true
        minReplicas = 2
        maxReplicas = 10
        targetCPUUtilizationPercentage = 50
      }
      
      # Additional configuration
      config = {
        "use-forwarded-headers"      = "true"
        "compute-full-forwarded-for" = "true"
        "use-proxy-protocol"         = "false"
      }
    }
    
    # Admission webhooks configuration
    admissionWebhooks = {
      patch = {
        nodeSelector = {
          "kubernetes.io/os" = "linux"
        }
      }
    }
  })]

  timeout = 600

  lifecycle {
    ignore_changes = [version]
  }
}

# ==============================================================================
# CERT-MANAGER FOR SSL CERTIFICATES
# ==============================================================================

# Create namespace for cert-manager
resource "kubernetes_namespace" "cert_manager" {
  depends_on = [azurerm_kubernetes_cluster.main]
  
  metadata {
    name = var.cert_manager_namespace
    labels = {
      name                         = var.cert_manager_namespace
      "cert-manager.io/disable-validation" = "true"
    }
  }
}

# Install cert-manager using Helm
resource "helm_release" "cert_manager" {
  depends_on = [
    azurerm_kubernetes_cluster.main,
    kubernetes_namespace.cert_manager
  ]

  name       = "cert-manager"
  repository = "https://charts.jetstack.io"
  chart      = "cert-manager"
  version    = "v1.13.0"
  namespace  = var.cert_manager_namespace

  values = [yamlencode({
    installCRDs = true
    
    nodeSelector = {
      "kubernetes.io/os" = "linux"
    }
    
    webhook = {
      nodeSelector = {
        "kubernetes.io/os" = "linux"
      }
    }
    
    cainjector = {
      nodeSelector = {
        "kubernetes.io/os" = "linux"
      }
    }
    
    # Resource configuration
    resources = {
      requests = {
        cpu    = "10m"
        memory = "32Mi"
      }
      limits = {
        cpu    = "100m"
        memory = "128Mi"
      }
    }
  })]

  timeout = 600

  lifecycle {
    ignore_changes = [version]
  }
}

# Create Let's Encrypt ClusterIssuer
resource "kubernetes_manifest" "letsencrypt_issuer" {
  depends_on = [helm_release.cert_manager]
  
  manifest = {
    apiVersion = "cert-manager.io/v1"
    kind       = "ClusterIssuer"
    metadata = {
      name = "letsencrypt-prod"
    }
    spec = {
      acme = {
        server = "https://acme-v02.api.letsencrypt.org/directory"
        email  = var.letsencrypt_email
        privateKeySecretRef = {
          name = "letsencrypt-prod"
        }
        solvers = [{
          http01 = {
            ingress = {
              class = "nginx"
            }
          }
        }]
      }
    }
  }
}

# Create Let's Encrypt Staging ClusterIssuer (for testing)
resource "kubernetes_manifest" "letsencrypt_staging_issuer" {
  depends_on = [helm_release.cert_manager]
  
  manifest = {
    apiVersion = "cert-manager.io/v1"
    kind       = "ClusterIssuer"
    metadata = {
      name = "letsencrypt-staging"
    }
    spec = {
      acme = {
        server = "https://acme-staging-v02.api.letsencrypt.org/directory"
        email  = var.letsencrypt_email
        privateKeySecretRef = {
          name = "letsencrypt-staging"
        }
        solvers = [{
          http01 = {
            ingress = {
              class = "nginx"
            }
          }
        }]
      }
    }
  }
}