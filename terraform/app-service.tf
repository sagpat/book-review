# ==============================================================================
# APP SERVICE PLAN
# ==============================================================================

resource "azurerm_service_plan" "main" {
  name                = var.app_service_plan_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.app_service_plan_sku
  tags                = var.common_tags

  lifecycle {
    ignore_changes = [tags]
  }
}

# ==============================================================================
# APP SERVICE (WEB APP)
# ==============================================================================

resource "azurerm_linux_web_app" "main" {
  name                = var.app_service_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_service_plan.main.location
  service_plan_id     = azurerm_service_plan.main.id
  https_only          = true
  tags                = var.common_tags

  # Site configuration
  site_config {
    always_on                         = true
    http2_enabled                     = true
    ftps_state                       = "Disabled"
    minimum_tls_version              = "1.2"
    scm_minimum_tls_version          = "1.2"
    use_32_bit_worker                = false
    websockets_enabled               = false
    container_registry_use_managed_identity = true

    # Application stack
    application_stack {
      node_version = var.app_service_node_version
    }

    # CORS configuration
    cors {
      allowed_origins = [
        "https://*.azurewebsites.net",
        "https://api.bookreviews.com",
        "https://bookreviews.com",
        "http://localhost:3000",
        "http://localhost:5173"
      ]
      support_credentials = true
    }
  }

  # Application settings
  app_settings = {
    # Build settings
    "SCM_DO_BUILD_DURING_DEPLOYMENT"         = "true"
    "ENABLE_ORYX_BUILD"                      = "true"
    "XDT_MicrosoftApplicationInsights_Mode"  = "Recommended"
    
    # Node.js settings
    "WEBSITE_NODE_DEFAULT_VERSION"           = "18-lts"
    "NODE_ENV"                              = "production"
    
    # Application Insights
    "APPINSIGHTS_INSTRUMENTATIONKEY"         = azurerm_application_insights.main.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING"  = azurerm_application_insights.main.connection_string
    
    # API Configuration
    "REACT_APP_API_BASE_URL"                = "https://${var.custom_domain}"
    "REACT_APP_ENVIRONMENT"                 = var.environment
    
    # Security headers
    "X-Content-Type-Options"                = "nosniff"
    "X-Frame-Options"                       = "DENY"
    "X-XSS-Protection"                      = "1; mode=block"
    "Strict-Transport-Security"             = "max-age=31536000; includeSubDomains"
    "Content-Security-Policy"               = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-src 'none';"
  }

  # Connection strings (if needed)
  connection_string {
    name  = "DefaultConnection"
    type  = "SQLAzure"
    value = "Server=tcp:${azurerm_mysql_flexible_server.main.fqdn},1433;Initial Catalog=${azurerm_mysql_flexible_database.bookreviews.name};Persist Security Info=False;User ID=${var.mysql_admin_login};Password=${var.mysql_admin_password != null ? var.mysql_admin_password : random_password.mysql_admin_password[0].result};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }

  # Virtual network integration
  virtual_network_subnet_id = azurerm_subnet.app_service.id

  # Identity for Key Vault access
  identity {
    type = "SystemAssigned"
  }

  # Logs configuration
  logs {
    detailed_error_messages = true
    failed_request_tracing  = true
    
    application_logs {
      file_system_level = "Information"
    }
    
    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 35
      }
    }
  }

  # Backup configuration
  backup {
    name     = "DefaultBackup"
    enabled  = true
    schedule {
      frequency_interval       = 1
      frequency_unit          = "Day"
      keep_at_least_one_backup = true
      retention_period_days    = 7
      start_time              = "2023-01-01T02:00:00Z"
    }
    storage_account_url = "${azurerm_storage_account.backup.primary_blob_endpoint}${azurerm_storage_container.backup.name}${azurerm_storage_account.backup.primary_access_key}"
  }

  lifecycle {
    ignore_changes = [
      tags,
      app_settings["WEBSITE_ENABLE_SYNC_UPDATE_SITE"],
      app_settings["WEBSITE_RUN_FROM_PACKAGE"]
    ]
  }

  depends_on = [
    azurerm_service_plan.main,
    azurerm_subnet.app_service,
    azurerm_application_insights.main
  ]
}

# ==============================================================================
# STORAGE ACCOUNT FOR BACKUPS
# ==============================================================================

resource "azurerm_storage_account" "backup" {
  name                     = "${var.project_name}backup${random_string.storage_suffix.result}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = var.common_tags

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "random_string" "storage_suffix" {
  length  = 4
  special = false
  upper   = false
}

resource "azurerm_storage_container" "backup" {
  name                  = "app-backups"
  storage_account_name  = azurerm_storage_account.backup.name
  container_access_type = "private"
}

# ==============================================================================
# CUSTOM DOMAIN AND SSL (Optional)
# ==============================================================================

# Custom domain binding (uncomment when domain is configured)
# resource "azurerm_app_service_custom_hostname_binding" "main" {
#   hostname            = var.custom_domain
#   app_service_name    = azurerm_linux_web_app.main.name
#   resource_group_name = azurerm_resource_group.main.name
# }

# ==============================================================================
# APP SERVICE DEPLOYMENT SLOTS (Optional)
# ==============================================================================

resource "azurerm_linux_web_app_slot" "staging" {
  count          = var.environment == "prod" ? 1 : 0
  name           = "staging"
  app_service_id = azurerm_linux_web_app.main.id
  https_only     = true
  tags           = var.common_tags

  site_config {
    always_on                         = false
    http2_enabled                     = true
    ftps_state                       = "Disabled"
    minimum_tls_version              = "1.2"
    use_32_bit_worker                = false
    container_registry_use_managed_identity = true

    application_stack {
      node_version = var.app_service_node_version
    }

    cors {
      allowed_origins = [
        "https://*.azurewebsites.net",
        "http://localhost:3000",
        "http://localhost:5173"
      ]
      support_credentials = true
    }
  }

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION"           = "18-lts"
    "NODE_ENV"                              = "staging"
    "REACT_APP_API_BASE_URL"                = "https://staging-${var.custom_domain}"
    "REACT_APP_ENVIRONMENT"                 = "staging"
    "APPINSIGHTS_INSTRUMENTATIONKEY"         = azurerm_application_insights.main.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING"  = azurerm_application_insights.main.connection_string
  }

  identity {
    type = "SystemAssigned"
  }

  lifecycle {
    ignore_changes = [tags]
  }
}