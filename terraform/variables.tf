# ==============================================================================
# GENERAL CONFIGURATION
# ==============================================================================

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "bookreviews"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
  default     = "bookreviews-rg"
}

# ==============================================================================
# TAGS CONFIGURATION
# ==============================================================================

variable "common_tags" {
  description = "Common tags to be applied to all resources"
  type        = map(string)
  default = {
    Project     = "BookReviews"
    Environment = "Production"
    ManagedBy   = "Terraform"
    Owner       = "DevOps Team"
  }
}

# ==============================================================================
# CONTAINER REGISTRY CONFIGURATION
# ==============================================================================

variable "acr_name" {
  description = "Name of the Azure Container Registry"
  type        = string
  default     = "bookreviewsacr"
}

variable "acr_sku" {
  description = "SKU for Azure Container Registry"
  type        = string
  default     = "Basic"
  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.acr_sku)
    error_message = "ACR SKU must be Basic, Standard, or Premium."
  }
}

# ==============================================================================
# AKS CONFIGURATION
# ==============================================================================

variable "aks_name" {
  description = "Name of the AKS cluster"
  type        = string
  default     = "bookreviews-aks"
}

variable "aks_kubernetes_version" {
  description = "Kubernetes version for AKS cluster"
  type        = string
  default     = null # Use latest stable version
}

variable "aks_node_count" {
  description = "Initial number of nodes in AKS cluster"
  type        = number
  default     = 2
}

variable "aks_node_vm_size" {
  description = "VM size for AKS nodes"
  type        = string
  default     = "Standard_B2s"
}

variable "aks_enable_auto_scaling" {
  description = "Enable auto-scaling for AKS node pool"
  type        = bool
  default     = true
}

variable "aks_min_count" {
  description = "Minimum number of nodes for auto-scaling"
  type        = number
  default     = 1
}

variable "aks_max_count" {
  description = "Maximum number of nodes for auto-scaling"
  type        = number
  default     = 5
}

variable "aks_network_plugin" {
  description = "Network plugin for AKS (azure or kubenet)"
  type        = string
  default     = "azure"
}

# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================

variable "mysql_server_name" {
  description = "Name of the MySQL server"
  type        = string
  default     = "bookreviews-mysql"
}

variable "mysql_admin_login" {
  description = "Administrator login for MySQL server"
  type        = string
  default     = "mysqladmin"
}

variable "mysql_admin_password" {
  description = "Administrator password for MySQL server"
  type        = string
  sensitive   = true
  default     = null # Will be generated if not provided
}

variable "mysql_sku_name" {
  description = "SKU name for MySQL server"
  type        = string
  default     = "B_Gen5_1"
}

variable "mysql_storage_mb" {
  description = "Storage capacity for MySQL server in MB"
  type        = number
  default     = 5120
}

variable "mysql_version" {
  description = "Version of MySQL server"
  type        = string
  default     = "8.0"
}

variable "cosmos_db_name" {
  description = "Name of the Cosmos DB account"
  type        = string
  default     = "bookreviews-cosmos"
}

variable "cosmos_db_offer_type" {
  description = "Offer type for Cosmos DB"
  type        = string
  default     = "Standard"
}

variable "cosmos_db_consistency_level" {
  description = "Consistency level for Cosmos DB"
  type        = string
  default     = "Session"
}

# ==============================================================================
# APP SERVICE CONFIGURATION
# ==============================================================================

variable "app_service_plan_name" {
  description = "Name of the App Service Plan"
  type        = string
  default     = "bookreviews-plan"
}

variable "app_service_plan_sku" {
  description = "SKU for App Service Plan"
  type        = string
  default     = "B1"
}

variable "app_service_name" {
  description = "Name of the App Service for frontend"
  type        = string
  default     = "bookreviews-frontend"
}

variable "app_service_node_version" {
  description = "Node.js version for App Service"
  type        = string
  default     = "18-lts"
}

# ==============================================================================
# KEY VAULT CONFIGURATION
# ==============================================================================

variable "key_vault_name" {
  description = "Name of the Key Vault"
  type        = string
  default     = "bookreviews-kv"
}

variable "key_vault_sku" {
  description = "SKU for Key Vault"
  type        = string
  default     = "standard"
}

# ==============================================================================
# NGINX INGRESS CONFIGURATION
# ==============================================================================

variable "nginx_ingress_namespace" {
  description = "Namespace for NGINX Ingress Controller"
  type        = string
  default     = "ingress-nginx"
}

variable "nginx_ingress_replica_count" {
  description = "Number of NGINX Ingress Controller replicas"
  type        = number
  default     = 2
}

variable "cert_manager_namespace" {
  description = "Namespace for cert-manager"
  type        = string
  default     = "cert-manager"
}

# ==============================================================================
# NETWORK CONFIGURATION
# ==============================================================================

variable "vnet_address_space" {
  description = "Address space for the virtual network"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "aks_subnet_address_prefix" {
  description = "Address prefix for AKS subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "app_service_subnet_address_prefix" {
  description = "Address prefix for App Service subnet"
  type        = string
  default     = "10.0.2.0/24"
}

# ==============================================================================
# DOMAIN AND SSL CONFIGURATION
# ==============================================================================

variable "custom_domain" {
  description = "Custom domain for the application"
  type        = string
  default     = "api.bookreviews.com"
}

variable "letsencrypt_email" {
  description = "Email for Let's Encrypt certificate generation"
  type        = string
  default     = "admin@bookreviews.com"
}

# ==============================================================================
# APPLICATION CONFIGURATION
# ==============================================================================

variable "application_insights_name" {
  description = "Name of Application Insights instance"
  type        = string
  default     = "bookreviews-insights"
}

variable "log_analytics_workspace_name" {
  description = "Name of Log Analytics Workspace"
  type        = string
  default     = "bookreviews-logs"
}