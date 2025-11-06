# ==============================================================================
# AZURE DATABASE FOR MYSQL
# ==============================================================================

resource "azurerm_mysql_flexible_server" "main" {
  name                   = var.mysql_server_name
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  administrator_login    = var.mysql_admin_login
  administrator_password = var.mysql_admin_password != null ? var.mysql_admin_password : random_password.mysql_admin_password[0].result

  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  
  sku_name   = var.mysql_sku_name
  version    = var.mysql_version
  
  storage {
    auto_grow_enabled = true
    size_gb          = var.mysql_storage_mb / 1024
  }

  # High availability configuration (optional)
  high_availability {
    mode = "ZoneRedundant"
  }

  # Maintenance window
  maintenance_window {
    day_of_week  = 0
    start_hour   = 8
    start_minute = 0
  }

  tags = var.common_tags

  lifecycle {
    ignore_changes = [
      administrator_password,
      tags
    ]
  }
}

# MySQL database
resource "azurerm_mysql_flexible_database" "bookreviews" {
  name                = "bookreviews"
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_mysql_flexible_server.main.name
  charset             = "utf8mb4"
  collation          = "utf8mb4_unicode_ci"
}

# Firewall rule to allow Azure services
resource "azurerm_mysql_flexible_server_firewall_rule" "azure_services" {
  name                = "AllowAzureServices"
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_mysql_flexible_server.main.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "0.0.0.0"
}

# Firewall rule for AKS subnet
resource "azurerm_mysql_flexible_server_firewall_rule" "aks_subnet" {
  name                = "AllowAKSSubnet"
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_mysql_flexible_server.main.name
  start_ip_address    = cidrhost(var.aks_subnet_address_prefix, 0)
  end_ip_address      = cidrhost(var.aks_subnet_address_prefix, -1)
}

# ==============================================================================
# AZURE COSMOS DB
# ==============================================================================

resource "azurerm_cosmosdb_account" "main" {
  name                = var.cosmos_db_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = var.cosmos_db_offer_type
  kind                = "MongoDB"

  enable_automatic_failover = false
  enable_multiple_write_locations = false

  # Consistency policy
  consistency_policy {
    consistency_level       = var.cosmos_db_consistency_level
    max_interval_in_seconds = 300
    max_staleness_prefix    = 100000
  }

  # Geo location configuration
  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }

  # Backup configuration
  backup {
    type                = "Periodic"
    interval_in_minutes = 240
    retention_in_hours  = 8
    storage_redundancy  = "Geo"
  }

  # Capabilities for MongoDB API
  capabilities {
    name = "EnableMongo"
  }

  capabilities {
    name = "MongoDBv3.4"
  }

  capabilities {
    name = "mongoEnableDocLevelTTL"
  }

  capabilities {
    name = "DisableRateLimitingResponses"
  }

  # Network access
  is_virtual_network_filter_enabled = true
  public_network_access_enabled     = true

  # Virtual network rules
  virtual_network_rule {
    id                                   = azurerm_subnet.aks.id
    ignore_missing_vnet_service_endpoint = false
  }

  tags = var.common_tags

  lifecycle {
    ignore_changes = [tags]
  }
}

# Cosmos DB MongoDB database
resource "azurerm_cosmosdb_mongo_database" "main" {
  name                = "bookreviews"
  resource_group_name = azurerm_cosmosdb_account.main.resource_group_name
  account_name        = azurerm_cosmosdb_account.main.name
}

# Collections for different data types
resource "azurerm_cosmosdb_mongo_collection" "users" {
  name                = "users"
  resource_group_name = azurerm_cosmosdb_account.main.resource_group_name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_mongo_database.main.name

  default_ttl_seconds = 0
  shard_key          = "_id"

  # Throughput configuration
  throughput = 400

  # Indexes
  index {
    keys   = ["_id"]
    unique = true
  }

  index {
    keys   = ["email"]
    unique = true
  }
}

resource "azurerm_cosmosdb_mongo_collection" "analytics" {
  name                = "analytics"
  resource_group_name = azurerm_cosmosdb_account.main.resource_group_name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_mongo_database.main.name

  default_ttl_seconds = 2592000 # 30 days
  shard_key          = "userId"

  # Throughput configuration
  throughput = 400

  # Indexes
  index {
    keys   = ["_id"]
    unique = true
  }

  index {
    keys   = ["userId", "timestamp"]
    unique = false
  }

  index {
    keys   = ["event", "timestamp"]
    unique = false
  }
}

resource "azurerm_cosmosdb_mongo_collection" "recommendations" {
  name                = "recommendations"
  resource_group_name = azurerm_cosmosdb_account.main.resource_group_name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_mongo_database.main.name

  default_ttl_seconds = 604800 # 7 days
  shard_key          = "userId"

  # Throughput configuration
  throughput = 400

  # Indexes
  index {
    keys   = ["_id"]
    unique = true
  }

  index {
    keys   = ["userId"]
    unique = false
  }

  index {
    keys   = ["bookId", "score"]
    unique = false
  }
}