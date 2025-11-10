# General variables
variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
  default     = "rg-book-review-prod"
}

variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "East US"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Environment = "prod"
    Project     = "book-review"
    Owner       = "DevOps"
  }
}

# Web App variables
variable "sites_book_review" {
  description = "Name of the web app"
  type        = string
  default     = "azurebookreview"
}

# App Service Plan variables
variable "serverfarms_book_review_asp" {
  description = "Name of the app service plan"
  type        = string
  default     = "azurebookreviewasp"
}

variable "app_service_plan_sku" {
  description = "SKU for the App Service Plan"
  type        = string
  default     = "P1v2"
}

# Container Registry variables
variable "registries_book_review_acr" {
  description = "Name of the container registry"
  type        = string
  default     = "azurebookreviewacr"
}

variable "acr_sku" {
  description = "SKU for Azure Container Registry"
  type        = string
  default     = "Standard"
}