# Resource Group
output "resource_group_name" {
  description = "Name of the created resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "Location of the created resource group"
  value       = azurerm_resource_group.main.location
}

# Container Registry
output "acr_name" {
  description = "Name of the Azure Container Registry"
  value       = azurerm_container_registry.book_review_acr.name
}

output "acr_login_server" {
  description = "Login server URL for the Azure Container Registry"
  value       = azurerm_container_registry.book_review_acr.login_server
}

# App Service Plan
output "app_service_plan_id" {
  description = "ID of the App Service Plan"
  value       = azurerm_service_plan.book_review_asp.id
}

output "app_service_plan_name" {
  description = "Name of the App Service Plan"
  value       = azurerm_service_plan.book_review_asp.name
}

# Web App
output "web_app_name" {
  description = "Name of the Web App"
  value       = azurerm_linux_web_app.book_review.name
}

output "web_app_url" {
  description = "Default URL of the Web App"
  value       = "https://${azurerm_linux_web_app.book_review.default_hostname}"
}

output "web_app_default_hostname" {
  description = "Default hostname of the Web App"
  value       = azurerm_linux_web_app.book_review.default_hostname
}