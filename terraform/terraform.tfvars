# General Configuration
resource_group_name = "rg-book-review-prod"
location           = "polandcentral"
environment        = "prod"

# Web App Configuration
sites_book_review = "azurebookreview"

# App Service Plan Configuration
serverfarms_book_review_asp = "azurebookreviewasp"
app_service_plan_sku       = "B2"

# Container Registry Configuration
registries_book_review_acr = "azurebookreviewacr"
acr_sku                   = "Standard"

# Tags
tags = {
  Environment = "stage"
  Project     = "book-review-app"
  ManagedBy   = "Terraform"
}