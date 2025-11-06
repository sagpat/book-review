# ==============================================================================
# AZURE KEY VAULT
# ==============================================================================

resource "azurerm_key_vault" "main" {
  name                        = var.key_vault_name
  location                    = azurerm_resource_group.main.location
  resource_group_name         = azurerm_resource_group.main.name
  enabled_for_disk_encryption = true
  enabled_for_deployment      = true
  enabled_for_template_deployment = true
  purge_protection_enabled    = false # Set to true for production
  soft_delete_retention_days  = 7
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  sku_name                    = var.key_vault_sku
  tags                        = var.common_tags

  # Network ACLs
  network_acls {
    bypass         = "AzureServices"
    default_action = "Allow" # Change to "Deny" for production and configure specific access

    # Allow access from AKS subnet
    virtual_network_subnet_ids = [
      azurerm_subnet.aks.id,
      azurerm_subnet.app_service.id
    ]
  }

  lifecycle {
    ignore_changes = [tags]
  }
}

# ==============================================================================
# KEY VAULT ACCESS POLICIES
# ==============================================================================

# Access policy for current user/service principal (for Terraform)
resource "azurerm_key_vault_access_policy" "terraform" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_client_config.current.object_id

  key_permissions = [
    "Backup", "Create", "Decrypt", "Delete", "Encrypt", "Get", "Import",
    "List", "Purge", "Recover", "Restore", "Sign", "UnwrapKey", "Update",
    "Verify", "WrapKey", "Release", "Rotate", "GetRotationPolicy", "SetRotationPolicy"
  ]

  secret_permissions = [
    "Backup", "Delete", "Get", "List", "Purge", "Recover", "Restore", "Set"
  ]

  certificate_permissions = [
    "Backup", "Create", "Delete", "DeleteIssuers", "Get", "GetIssuers",
    "Import", "List", "ListIssuers", "ManageContacts", "ManageIssuers",
    "Purge", "Recover", "Restore", "SetIssuers", "Update"
  ]
}

# Access policy for AKS cluster managed identity
resource "azurerm_key_vault_access_policy" "aks" {
  depends_on   = [azurerm_kubernetes_cluster.main]
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_kubernetes_cluster.main.identity[0].principal_id

  secret_permissions = [
    "Get", "List"
  ]

  certificate_permissions = [
    "Get", "List"
  ]
}

# Access policy for App Service managed identity
resource "azurerm_key_vault_access_policy" "app_service" {
  depends_on   = [azurerm_linux_web_app.main]
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_web_app.main.identity[0].principal_id

  secret_permissions = [
    "Get", "List"
  ]

  certificate_permissions = [
    "Get", "List"
  ]
}

# ==============================================================================
# KEY VAULT SECRETS
# ==============================================================================

# Database connection strings
resource "azurerm_key_vault_secret" "mysql_connection_string" {
  depends_on   = [azurerm_key_vault_access_policy.terraform]
  name         = "mysql-connection-string"
  value        = "Server=${azurerm_mysql_flexible_server.main.fqdn};Database=${azurerm_mysql_flexible_database.bookreviews.name};Uid=${var.mysql_admin_login};Pwd=${var.mysql_admin_password != null ? var.mysql_admin_password : random_password.mysql_admin_password[0].result};SslMode=Required;"
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.common_tags

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "azurerm_key_vault_secret" "cosmos_connection_string" {
  depends_on   = [azurerm_key_vault_access_policy.terraform]
  name         = "cosmos-connection-string"
  value        = azurerm_cosmosdb_account.main.connection_strings[0]
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.common_tags

  lifecycle {
    ignore_changes = [tags]
  }
}

# JWT Secret for authentication
resource "random_password" "jwt_secret" {
  length  = 32
  special = true
}

resource "azurerm_key_vault_secret" "jwt_secret" {
  depends_on   = [azurerm_key_vault_access_policy.terraform]
  name         = "jwt-secret"
  value        = random_password.jwt_secret.result
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.common_tags

  lifecycle {
    ignore_changes = [tags]
  }
}

# API Keys for external services
resource "random_password" "api_key" {
  length  = 24
  special = false
  upper   = true
}

resource "azurerm_key_vault_secret" "api_key" {
  depends_on   = [azurerm_key_vault_access_policy.terraform]
  name         = "api-key"
  value        = random_password.api_key.result
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.common_tags

  lifecycle {
    ignore_changes = [tags]
  }
}

# Redis connection string (if Redis is used)
resource "azurerm_key_vault_secret" "redis_connection_string" {
  depends_on   = [azurerm_key_vault_access_policy.terraform]
  name         = "redis-connection-string"
  value        = "redis://localhost:6379" # Update with actual Redis connection
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.common_tags

  lifecycle {
    ignore_changes = [tags]
  }
}

# Application Insights instrumentation key
resource "azurerm_key_vault_secret" "app_insights_key" {
  depends_on   = [azurerm_key_vault_access_policy.terraform]
  name         = "app-insights-instrumentation-key"
  value        = azurerm_application_insights.main.instrumentation_key
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.common_tags

  lifecycle {
    ignore_changes = [tags]
  }
}

# Container Registry credentials
resource "azurerm_key_vault_secret" "acr_username" {
  depends_on   = [azurerm_key_vault_access_policy.terraform]
  name         = "acr-username"
  value        = azurerm_container_registry.main.admin_username
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.common_tags

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "azurerm_key_vault_secret" "acr_password" {
  depends_on   = [azurerm_key_vault_access_policy.terraform]
  name         = "acr-password"
  value        = azurerm_container_registry.main.admin_password
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.common_tags

  lifecycle {
    ignore_changes = [tags]
  }
}

# ==============================================================================
# KEY VAULT CERTIFICATES (Optional)
# ==============================================================================

# Self-signed certificate for development/testing
resource "azurerm_key_vault_certificate" "self_signed" {
  depends_on   = [azurerm_key_vault_access_policy.terraform]
  name         = "bookreviews-ssl-cert"
  key_vault_id = azurerm_key_vault.main.id
  tags         = var.common_tags

  certificate_policy {
    issuer_parameters {
      name = "Self"
    }

    key_properties {
      exportable = true
      key_size   = 2048
      key_type   = "RSA"
      reuse_key  = true
    }

    lifetime_action {
      action {
        action_type = "AutoRenew"
      }

      trigger {
        days_before_expiry = 30
      }
    }

    secret_properties {
      content_type = "application/x-pkcs12"
    }

    x509_certificate_properties {
      extended_key_usage = ["1.3.6.1.5.5.7.3.1"]

      key_usage = [
        "cRLSign",
        "dataEncipherment",
        "digitalSignature",
        "keyAgreement",
        "keyCertSign",
        "keyEncipherment",
      ]

      subject_alternative_names {
        dns_names = [
          var.custom_domain,
          "*.${var.custom_domain}",
          "${var.app_service_name}.azurewebsites.net"
        ]
      }

      subject            = "CN=${var.custom_domain}"
      validity_in_months = 12
    }
  }

  lifecycle {
    ignore_changes = [tags]
  }
}

# ==============================================================================
# DIAGNOSTIC SETTINGS FOR KEY VAULT
# ==============================================================================

resource "azurerm_monitor_diagnostic_setting" "key_vault" {
  name                       = "key-vault-diagnostics"
  target_resource_id         = azurerm_key_vault.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "AuditEvent"
  }

  metric {
    category = "AllMetrics"
  }

  lifecycle {
    ignore_changes = [log_analytics_workspace_id]
  }
}