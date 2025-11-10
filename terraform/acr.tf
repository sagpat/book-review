# Azure Container Registry
resource "azurerm_container_registry" "book_review_acr" {
  name                = var.registries_book_review_acr
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = var.acr_sku
  admin_enabled       = false

  public_network_access_enabled = true
  zone_redundancy_enabled      = false
  anonymous_pull_enabled       = false
  data_endpoint_enabled        = false
  network_rule_bypass_option   = "AzureServices"

  tags = var.tags
}