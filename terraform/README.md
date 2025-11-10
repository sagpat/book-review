# Terraform Book Review Infrastructure

This directory contains Terraform configurations to deploy the Book Review application infrastructure on Azure.

## Structure

```
terraform/
├── main.tf                    # Main Terraform configuration with provider and resource group
├── variables.tf               # Variable definitions
├── outputs.tf                 # Output definitions
├── acr.tf                     # Azure Container Registry configuration
├── app-service.tf            # App Service Plan and Web App configuration
├── terraform.tfvars.example  # Example variables file
└── README.md                 # This file
```

## Resources Created

1. **Resource Group** - Container for all resources
2. **Azure Container Registry (ACR)** - For storing Docker images
3. **App Service Plan** - Hosting plan for the web application
4. **Linux Web App** - The main application hosting service

## Prerequisites

1. **Azure CLI** installed and configured
2. **Terraform** installed (version >= 1.0)
3. **Azure subscription** with appropriate permissions

## Usage

### 1. Authentication

```bash
# Login to Azure
az login

# Set the subscription (if you have multiple)
az account set --subscription "your-subscription-id"
```

### 2. Initialize Terraform

```bash
cd terraform
terraform init
```

### 3. Configure Variables

Copy the example variables file and customize it:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` to match your requirements:

```hcl
resource_group_name = "rg-book-review-dev"
location           = "East US"
environment        = "dev"
sites_book_review  = "mybookreview-dev"
# ... other variables
```

### 4. Plan and Apply

```bash
# Review the execution plan
terraform plan

# Apply the configuration
terraform apply
```

### 5. Destroy (when needed)

```bash
terraform destroy
```

## Outputs

After successful deployment, Terraform will output:

- Resource group name and location
- Azure Container Registry name and login server
- App Service Plan ID and name
- Web App name, URL, and hostname

## Customization

### Environment-Specific Deployments

For different environments, you can:

1. Use different `.tfvars` files:
   ```bash
   terraform plan -var-file="dev.tfvars"
   terraform apply -var-file="prod.tfvars"
   ```

2. Use Terraform workspaces:
   ```bash
   terraform workspace new dev
   terraform workspace new prod
   terraform workspace select dev
   ```

### Scaling

To change the App Service Plan SKU, update the `app_service_plan_sku` variable:

- **Development**: `B1` or `S1`
- **Production**: `P1v2`, `P2v2`, or `P3v2`

### Security

For production deployments, consider:

1. Enabling ACR admin user only when needed
2. Configuring proper IP restrictions
3. Enabling HTTPS only
4. Setting up proper authentication and authorization

## Troubleshooting

### Common Issues

1. **Resource name conflicts**: Ensure resource names are globally unique (especially ACR and Web App names)
2. **Permission issues**: Verify your Azure account has Contributor access to the subscription
3. **Region availability**: Some SKUs may not be available in all regions

### Useful Commands

```bash
# Check Terraform state
terraform state list

# View specific resource
terraform state show azurerm_linux_web_app.book_review

# Import existing resources (if needed)
terraform import azurerm_resource_group.main /subscriptions/{subscription-id}/resourceGroups/{rg-name}
```

## Next Steps

After infrastructure is deployed:

1. Configure CI/CD pipelines to build and push Docker images to ACR
2. Update Web App to use custom Docker images from ACR
3. Configure environment variables and app settings
4. Set up monitoring and logging
5. Configure custom domains and SSL certificates