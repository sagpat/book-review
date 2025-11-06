# ==============================================================================
# RESOURCE GROUP OUTPUTS
# ==============================================================================

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Location of the resource group"
  value       = azurerm_resource_group.main.location
}

# ==============================================================================
# NETWORKING OUTPUTS
# ==============================================================================

output "virtual_network_id" {
  description = "ID of the virtual network"
  value       = azurerm_virtual_network.main.id
}

output "aks_subnet_id" {
  description = "ID of the AKS subnet"
  value       = azurerm_subnet.aks.id
}

output "app_service_subnet_id" {
  description = "ID of the App Service subnet"
  value       = azurerm_subnet.app_service.id
}

# ==============================================================================
# CONTAINER REGISTRY OUTPUTS
# ==============================================================================

output "acr_login_server" {
  description = "Login server URL for Azure Container Registry"
  value       = azurerm_container_registry.main.login_server
}

output "acr_admin_username" {
  description = "Admin username for Azure Container Registry"
  value       = azurerm_container_registry.main.admin_username
  sensitive   = true
}

output "acr_admin_password" {
  description = "Admin password for Azure Container Registry"
  value       = azurerm_container_registry.main.admin_password
  sensitive   = true
}

# ==============================================================================
# AKS OUTPUTS
# ==============================================================================

output "aks_cluster_name" {
  description = "Name of the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.name
}

output "aks_cluster_id" {
  description = "ID of the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.id
}

output "aks_fqdn" {
  description = "FQDN of the AKS cluster"
  value       = azurerm_kubernetes_cluster.main.fqdn
}

output "aks_kube_config" {
  description = "Kubernetes configuration for AKS cluster"
  value       = azurerm_kubernetes_cluster.main.kube_config_raw
  sensitive   = true
}

output "aks_cluster_ca_certificate" {
  description = "AKS cluster CA certificate"
  value       = azurerm_kubernetes_cluster.main.kube_config.0.cluster_ca_certificate
  sensitive   = true
}

output "aks_client_certificate" {
  description = "AKS client certificate"
  value       = azurerm_kubernetes_cluster.main.kube_config.0.client_certificate
  sensitive   = true
}

output "aks_client_key" {
  description = "AKS client key"
  value       = azurerm_kubernetes_cluster.main.kube_config.0.client_key
  sensitive   = true
}

output "aks_host" {
  description = "AKS cluster host"
  value       = azurerm_kubernetes_cluster.main.kube_config.0.host
}

# ==============================================================================
# DATABASE OUTPUTS
# ==============================================================================

output "mysql_server_fqdn" {
  description = "FQDN of the MySQL server"
  value       = azurerm_mysql_flexible_server.main.fqdn
}

output "mysql_database_name" {
  description = "Name of the MySQL database"
  value       = azurerm_mysql_flexible_database.bookreviews.name
}

output "mysql_admin_login" {
  description = "Admin login for MySQL server"
  value       = azurerm_mysql_flexible_server.main.administrator_login
  sensitive   = true
}

output "mysql_connection_string" {
  description = "MySQL connection string"
  value       = "Server=${azurerm_mysql_flexible_server.main.fqdn};Database=${azurerm_mysql_flexible_database.bookreviews.name};Uid=${var.mysql_admin_login};Pwd=${var.mysql_admin_password != null ? var.mysql_admin_password : random_password.mysql_admin_password[0].result};SslMode=Required;"
  sensitive   = true
}

output "cosmos_db_endpoint" {
  description = "Endpoint URL for Cosmos DB"
  value       = azurerm_cosmosdb_account.main.endpoint
}

output "cosmos_db_primary_key" {
  description = "Primary key for Cosmos DB"
  value       = azurerm_cosmosdb_account.main.primary_key
  sensitive   = true
}

output "cosmos_db_connection_strings" {
  description = "Connection strings for Cosmos DB"
  value       = azurerm_cosmosdb_account.main.connection_strings
  sensitive   = true
}

# ==============================================================================
# APP SERVICE OUTPUTS
# ==============================================================================

output "app_service_name" {
  description = "Name of the App Service"
  value       = azurerm_linux_web_app.main.name
}

output "app_service_url" {
  description = "URL of the App Service"
  value       = "https://${azurerm_linux_web_app.main.default_hostname}"
}

output "app_service_default_hostname" {
  description = "Default hostname of the App Service"
  value       = azurerm_linux_web_app.main.default_hostname
}

output "app_service_identity_principal_id" {
  description = "Principal ID of the App Service managed identity"
  value       = azurerm_linux_web_app.main.identity[0].principal_id
}

# ==============================================================================
# KEY VAULT OUTPUTS
# ==============================================================================

output "key_vault_id" {
  description = "ID of the Key Vault"
  value       = azurerm_key_vault.main.id
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = azurerm_key_vault.main.name
}

# ==============================================================================
# NGINX INGRESS OUTPUTS
# ==============================================================================

output "nginx_ingress_namespace" {
  description = "Namespace for NGINX Ingress Controller"
  value       = var.nginx_ingress_namespace
}

output "nginx_ingress_controller_ip" {
  description = "External IP address of NGINX Ingress Controller LoadBalancer"
  value       = "Run 'kubectl get svc -n ${var.nginx_ingress_namespace}' to get the external IP"
}

# ==============================================================================
# MONITORING OUTPUTS
# ==============================================================================

output "log_analytics_workspace_id" {
  description = "ID of the Log Analytics Workspace"
  value       = azurerm_log_analytics_workspace.main.id
}

output "application_insights_instrumentation_key" {
  description = "Instrumentation key for Application Insights"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Connection string for Application Insights"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}

# ==============================================================================
# GENERATED SECRETS OUTPUTS
# ==============================================================================

output "jwt_secret" {
  description = "Generated JWT secret"
  value       = random_password.jwt_secret.result
  sensitive   = true
}

output "api_key" {
  description = "Generated API key"
  value       = random_password.api_key.result
  sensitive   = true
}

# ==============================================================================
# DEPLOYMENT INFORMATION
# ==============================================================================

output "deployment_information" {
  description = "Key information for deployment"
  value = {
    resource_group      = azurerm_resource_group.main.name
    acr_login_server   = azurerm_container_registry.main.login_server
    aks_cluster_name   = azurerm_kubernetes_cluster.main.name
    app_service_url    = "https://${azurerm_linux_web_app.main.default_hostname}"
    key_vault_name     = azurerm_key_vault.main.name
    custom_domain      = var.custom_domain
  }
}

# ==============================================================================
# NEXT STEPS
# ==============================================================================

output "next_steps" {
  description = "Next steps after Terraform deployment"
  value = <<-EOT
  
  🎉 Infrastructure deployed successfully!
  
  Next steps:
  1. Get AKS credentials: az aks get-credentials --resource-group ${azurerm_resource_group.main.name} --name ${azurerm_kubernetes_cluster.main.name}
  2. Check NGINX Ingress: kubectl get svc -n ${var.nginx_ingress_namespace}
  3. Build and push images to ACR: ${azurerm_container_registry.main.login_server}
  4. Deploy applications to AKS using kubectl apply -f k8s/
  5. Configure custom domain DNS to point to NGINX Ingress LoadBalancer IP
  6. Deploy frontend to App Service: ${azurerm_linux_web_app.main.name}
  
  Important URLs:
  - App Service: https://${azurerm_linux_web_app.main.default_hostname}
  - Key Vault: ${azurerm_key_vault.main.vault_uri}
  - ACR: ${azurerm_container_registry.main.login_server}
  
  EOT
}