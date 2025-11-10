# App Service Plan
resource "azurerm_service_plan" "book_review_asp" {
  name                = var.serverfarms_book_review_asp
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.app_service_plan_sku

  tags = var.tags
}

# Web App
resource "azurerm_linux_web_app" "book_review" {
  name                = var.sites_book_review
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.book_review_asp.id

  site_config {
    always_on                              = true
    container_registry_use_managed_identity = false
    ftps_state                            = "AllAllowed"
    http2_enabled                         = false
    minimum_tls_version                   = "1.2"
    use_32_bit_worker                     = true
    websockets_enabled                    = false

    application_stack {
      docker_image_name        = "mcr.microsoft.com/appsvc/staticsite"
      docker_registry_url      = "https://mcr.microsoft.com"
    }

    ip_restriction {
      action      = "Allow"
      ip_address  = "0.0.0.0/0"
      name        = "Allow all"
      priority    = 1
    }

    scm_ip_restriction {
      action      = "Allow"
      ip_address  = "0.0.0.0/0"
      name        = "Allow all"
      priority    = 1
    }
  }

  client_affinity_enabled    = false
  client_certificate_enabled = false
  https_only                 = false

  tags = var.tags
}