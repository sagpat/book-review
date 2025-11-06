# Book Reviews App - Terraform Deployment Guide

This guide provides comprehensive instructions for deploying the Book Reviews application infrastructure using Terraform.

## 🏗️ **Infrastructure Overview**

The Terraform configuration creates:

- **Azure Resource Group**: Container for all resources
- **Azure Container Registry (ACR)**: Container image registry
- **Azure Kubernetes Service (AKS)**: Kubernetes cluster with NGINX Ingress
- **Azure Database for MySQL**: Primary database
- **Azure Cosmos DB**: MongoDB API for analytics
- **Azure App Service**: Frontend React application hosting
- **Azure Key Vault**: Secrets and certificate management
- **Virtual Network**: Secure network configuration
- **Application Insights**: Monitoring and telemetry

## 📋 **Prerequisites**

### Required Tools
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Install Terraform
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update && sudo apt-get install helm
```

### Azure Login
```bash
# Login to Azure
az login

# Set subscription (if you have multiple)
az account set --subscription "your-subscription-id"

# Verify current subscription
az account show
```

## ⚙️ **Configuration**

### 1. Create terraform.tfvars
Create a `terraform/terraform.tfvars` file with your specific values:

```hcl
# General Configuration
project_name         = "bookreviews"
environment         = "prod"
location           = "East US"
resource_group_name = "bookreviews-rg"

# Container Registry
acr_name = "bookreviewsacr2024"  # Must be globally unique
acr_sku  = "Basic"

# AKS Configuration
aks_name                 = "bookreviews-aks"
aks_node_count          = 2
aks_node_vm_size        = "Standard_B2s"
aks_enable_auto_scaling = true
aks_min_count           = 1
aks_max_count           = 5

# Database Configuration
mysql_server_name    = "bookreviews-mysql-2024"  # Must be globally unique
mysql_admin_login    = "mysqladmin"
mysql_admin_password = "YourSecurePassword123!"  # Use Azure Key Vault in production
mysql_sku_name      = "B_Gen5_1"
mysql_storage_mb    = 5120

cosmos_db_name              = "bookreviews-cosmos-2024"  # Must be globally unique
cosmos_db_consistency_level = "Session"

# App Service Configuration
app_service_plan_name = "bookreviews-plan"
app_service_plan_sku  = "B1"
app_service_name      = "bookreviews-frontend-2024"  # Must be globally unique
app_service_node_version = "18-lts"

# Key Vault Configuration
key_vault_name = "bookreviews-kv-2024"  # Must be globally unique

# Domain and SSL
custom_domain      = "api.bookreviews.com"
letsencrypt_email  = "admin@bookreviews.com"

# Common Tags
common_tags = {
  Project     = "BookReviews"
  Environment = "Production" 
  ManagedBy   = "Terraform"
  Owner       = "DevOps Team"
}
```

### 2. Optional: Remote State Configuration
For production deployments, configure remote state storage:

```hcl
# Uncomment in providers.tf
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "terraformstatestg2024"
    container_name      = "tfstate"
    key                = "bookreviews.terraform.tfstate"
  }
}
```

Create the remote state storage:
```bash
# Create resource group for Terraform state
az group create --name terraform-state-rg --location "East US"

# Create storage account
az storage account create \
  --resource-group terraform-state-rg \
  --name terraformstatestg2024 \
  --sku Standard_LRS \
  --encryption-services blob

# Create container
az storage container create \
  --name tfstate \
  --account-name terraformstatestg2024
```

## 🚀 **Deployment Steps**

### 1. Initialize Terraform
```bash
cd terraform/
terraform init
```

### 2. Validate Configuration
```bash
terraform validate
terraform fmt
```

### 3. Plan Deployment
```bash
terraform plan -out=tfplan
```

### 4. Apply Infrastructure
```bash
terraform apply tfplan
```

The deployment will take approximately 15-20 minutes.

## 📝 **Post-Deployment Steps**

### 1. Configure kubectl
```bash
# Get AKS credentials
az aks get-credentials \
  --resource-group bookreviews-rg \
  --name bookreviews-aks \
  --overwrite-existing

# Verify cluster connection
kubectl get nodes
kubectl get namespaces
```

### 2. Verify NGINX Ingress Controller
```bash
# Check NGINX Ingress Controller status
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx

# Get LoadBalancer IP (may take a few minutes)
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

### 3. Verify cert-manager
```bash
# Check cert-manager status
kubectl get pods -n cert-manager
kubectl get clusterissuers
```

### 4. Container Images (Automated via GitHub Actions)

**✅ Container images are automatically built and pushed via GitHub Actions when code is pushed to main branch.**

The CI/CD pipeline will:
- Build Docker images for backend and microservice
- Push images to ACR with latest and commit SHA tags
- Update Kubernetes manifests with new image references
- Deploy applications to AKS

**Manual build (if needed):**
```bash
# Get ACR login server from Terraform output
ACR_LOGIN_SERVER=$(terraform output -raw acr_login_server)

# Login to ACR
az acr login --name $(terraform output -raw acr_login_server | cut -d'.' -f1)

# Build and push backend image
cd ../book-review-backend
docker build -t $ACR_LOGIN_SERVER/book-review-backend:latest .
docker push $ACR_LOGIN_SERVER/book-review-backend:latest

# Build and push microservice image
cd ../book-review-recommended-backend  
docker build -t $ACR_LOGIN_SERVER/book-review-microservice:latest .
docker push $ACR_LOGIN_SERVER/book-review-microservice:latest
```

### 5. Deploy Applications to AKS (Automated via GitHub Actions)

**✅ Applications are automatically deployed via GitHub Actions after successful infrastructure deployment.**

The CI/CD pipeline will:
- Update Kubernetes manifests with new ACR image URLs
- Deploy applications to AKS using `kubectl apply`
- Verify deployment status

**Manual deployment (if needed):**
```bash
# Update image references in k8s manifests with ACR URL
cd ../k8s
ACR_LOGIN_SERVER=$(terraform output -raw acr_login_server)
sed -i "s|image: .*book-review-backend.*|image: $ACR_LOGIN_SERVER/book-review-backend:latest|g" 02-backend-deployment.yaml
sed -i "s|image: .*book-review-microservice.*|image: $ACR_LOGIN_SERVER/book-review-microservice:latest|g" 03-microservice-deployment.yaml

# Apply Kubernetes manifests
kubectl apply -f .

# Check deployment status
kubectl get pods
kubectl get services
kubectl get ingress
```

### 6. Configure DNS
Point your custom domain to the NGINX Ingress LoadBalancer IP:
```bash
# Get the LoadBalancer IP
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Create DNS A record:
# api.bookreviews.com -> <LoadBalancer IP>
```

### 6. Deploy Frontend to App Service (Automated via GitHub Actions)

**✅ Frontend is automatically built and deployed via GitHub Actions after infrastructure deployment.**

The CI/CD pipeline will:
- Install npm dependencies
- Build React application for production
- Create deployment package
- Deploy to Azure App Service

**Manual deployment (if needed):**
```bash
cd ../book-review-app

# Install dependencies
npm ci

# Build for production
npm run build

# Create deployment package
cd dist && zip -r ../app.zip . && cd ..

# Deploy to App Service
az webapp deployment source config-zip \
  --resource-group $(terraform output -raw resource_group_name) \
  --name $(terraform output -raw app_service_name) \
  --src app.zip
```

## 🔒 **Security Configuration**

### 1. Key Vault Integration
Retrieve secrets from Key Vault:
```bash
# List secrets
az keyvault secret list --vault-name $(terraform output -raw key_vault_name)

# Get specific secret
az keyvault secret show \
  --vault-name $(terraform output -raw key_vault_name) \
  --name mysql-connection-string
```

### 2. Update Kubernetes Secrets
```bash
# Create secrets from Key Vault
kubectl create secret generic mysql-secret \
  --from-literal=connection-string="$(az keyvault secret show --vault-name $(terraform output -raw key_vault_name) --name mysql-connection-string --query value -o tsv)"

kubectl create secret generic cosmos-secret \
  --from-literal=connection-string="$(az keyvault secret show --vault-name $(terraform output -raw key_vault_name) --name cosmos-connection-string --query value -o tsv)"
```

## 🔧 **Customization**

### Scaling AKS
```hcl
# In terraform.tfvars
aks_node_count = 3
aks_max_count  = 10
```

### Upgrading SKUs
```hcl
# In terraform.tfvars
acr_sku              = "Standard"  # or "Premium"
app_service_plan_sku = "S1"       # Scale up
mysql_sku_name       = "B_Gen5_2" # More CPU/RAM
```

### Adding Environments
Create separate `.tfvars` files for different environments:
- `terraform.dev.tfvars`
- `terraform.staging.tfvars`
- `terraform.prod.tfvars`

Deploy with:
```bash
terraform plan -var-file="terraform.dev.tfvars"
terraform apply -var-file="terraform.dev.tfvars"
```

## 🧪 **Testing and Validation**

### 1. Infrastructure Tests
```bash
# Test database connectivity
kubectl run mysql-test --image=mysql:8.0 --rm -it --restart=Never -- \
  mysql -h$(terraform output -raw mysql_server_fqdn) \
        -u$(terraform output -raw mysql_admin_login) \
        -p$(terraform output -raw mysql_connection_string | cut -d';' -f4 | cut -d'=' -f2) \
        -e "SHOW DATABASES;"

# Test NGINX Ingress
curl -k https://$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}')/healthz
```

### 2. Application Tests
```bash
# Test frontend
curl https://$(terraform output -raw app_service_url)

# Test backend APIs (once deployed)
curl https://api.bookreviews.com/health
curl https://api.bookreviews.com/api/books
```

## 🗑️ **Cleanup**

To destroy all infrastructure:
```bash
terraform destroy
```

**Warning**: This will delete all data. Ensure you have backups if needed.

## 📊 **Cost Optimization**

### Development Environment
```hcl
aks_node_vm_size        = "Standard_B2s"
aks_node_count          = 1
aks_enable_auto_scaling = false
mysql_sku_name          = "B_Gen5_1"
app_service_plan_sku    = "F1"  # Free tier
```

### Production Environment
```hcl
aks_node_vm_size        = "Standard_D2s_v3"
aks_node_count          = 3
aks_enable_auto_scaling = true
mysql_sku_name          = "GP_Gen5_2"
app_service_plan_sku    = "P1v2"
```

## 🆘 **Troubleshooting**

### Common Issues

1. **Resource Name Conflicts**
   - Ensure globally unique names for ACR, Key Vault, App Service
   - Add random suffix if needed

2. **AKS Node Pool Issues**
   ```bash
   kubectl get nodes
   kubectl describe node <node-name>
   ```

3. **NGINX Ingress Not Ready**
   ```bash
   kubectl get pods -n ingress-nginx
   kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
   ```

4. **SSL Certificate Issues**
   ```bash
   kubectl get certificates
   kubectl describe certificate <cert-name>
   kubectl get clusterissuers
   ```

5. **Database Connection Issues**
   - Check firewall rules
   - Verify network security groups
   - Test connection from AKS pod

### Useful Commands
```bash
# Get all Terraform outputs
terraform output

# Show sensitive outputs
terraform output -json

# Refresh Terraform state
terraform refresh

# Import existing resources (if needed)
terraform import azurerm_resource_group.main /subscriptions/<sub-id>/resourceGroups/<rg-name>
```

## 📚 **Additional Resources**

- [Azure Terraform Provider Documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [AKS Best Practices](https://docs.microsoft.com/en-us/azure/aks/best-practices)
- [NGINX Ingress Controller Documentation](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager Documentation](https://cert-manager.io/docs/)

## 🔄 **GitHub Actions CI/CD Setup**

The project includes a comprehensive GitHub Actions workflow (`.github/workflows/terraform-deploy.yml`) that automates:

### Features
- ✅ **Infrastructure deployment** with Terraform
- ✅ **Container image building** and pushing to ACR  
- ✅ **Application deployment** to AKS and App Service
- ✅ **Security scanning** with Checkov
- ✅ **Pull request validation** with Terraform plan

### Required GitHub Secrets

Configure these secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):

```bash
# Azure Service Principal credentials
ARM_CLIENT_ID=<your-service-principal-client-id>
ARM_CLIENT_SECRET=<your-service-principal-client-secret>
ARM_SUBSCRIPTION_ID=<your-azure-subscription-id>  
ARM_TENANT_ID=<your-azure-tenant-id>
```

### Create Azure Service Principal

```bash
# Create service principal for GitHub Actions
az ad sp create-for-rbac \
  --name "github-actions-bookreviews" \
  --role contributor \
  --scopes /subscriptions/<your-subscription-id> \
  --sdk-auth

# Output will provide the credentials for GitHub secrets
```

### Workflow Triggers

- **Push to main**: Deploys infrastructure and applications
- **Pull Request**: Runs Terraform plan and security scan
- **Manual Dispatch**: Allows selective deployment of infrastructure/apps

### Manual Deployment Control

Use workflow dispatch to control deployment:

1. Go to **Actions** tab in GitHub
2. Select **Azure Infrastructure and Application Deployment**
3. Click **Run workflow**
4. Choose options:
   - ✅ Deploy infrastructure with Terraform
   - ✅ Build and deploy applications  
   - ❌ Destroy all infrastructure (danger!)

### Alternative CI/CD Options

- **Azure DevOps**: For enterprise workflows
- **GitLab CI/CD**: For GitLab-based projects
- **Jenkins**: For on-premises CI/CD