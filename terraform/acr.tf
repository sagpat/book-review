# ==============================================================================
# AZURE CONTAINER REGISTRY
# ==============================================================================

resource "azurerm_container_registry" "main" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = var.acr_sku
  admin_enabled       = true
  tags                = var.common_tags

  # Enable content trust for production
  trust_policy {
    enabled = false # Set to true for production
  }

  # Retention policy for images
  retention_policy {
    enabled = false # Set to true and configure for production
    days    = 7
  }

  # Georeplications for high availability (Premium SKU only)
  dynamic "georeplications" {
    for_each = var.acr_sku == "Premium" ? [1] : []
    content {
      location                = "West US 2"
      zone_redundancy_enabled = false
      tags                    = var.common_tags
    }
  }

  lifecycle {
    ignore_changes = [
      retention_policy,
      trust_policy
    ]
  }
}

# Role assignment to allow AKS to pull images from ACR
resource "azurerm_role_assignment" "aks_acr_pull" {
  depends_on                       = [azurerm_kubernetes_cluster.main]
  scope                           = azurerm_container_registry.main.id
  role_definition_name            = "AcrPull"
  principal_id                    = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
  skip_service_principal_aad_check = true
}

# Additional role assignment for managed identity
resource "azurerm_role_assignment" "aks_acr_pull_identity" {
  depends_on                       = [azurerm_kubernetes_cluster.main]
  scope                           = azurerm_container_registry.main.id
  role_definition_name            = "AcrPull"
  principal_id                    = azurerm_kubernetes_cluster.main.identity[0].principal_id
  skip_service_principal_aad_check = true
}