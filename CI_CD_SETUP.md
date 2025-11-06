# 🚀 GitHub Actions CI/CD Setup Guide

This guide walks you through setting up automated deployment using GitHub Actions for the Book Reviews application.

## 📋 **Overview**

The GitHub Actions workflow (`.github/workflows/terraform-deploy.yml`) provides:

- **🏗️ Infrastructure Deployment**: Terraform-based Azure resource provisioning
- **🐳 Container Management**: Automated Docker image building and ACR deployment  
- **☸️ Application Deployment**: Kubernetes deployment to AKS
- **🌐 Frontend Deployment**: React app deployment to Azure App Service
- **🔒 Security Scanning**: Terraform security validation with Checkov

## 🔐 **Prerequisites - Azure Service Principal Setup**

### Step 1: Create Azure Service Principal

```bash
# Login to Azure CLI
az login

# Set your subscription (if you have multiple)
az account set --subscription "<your-subscription-id>"

# Create service principal for GitHub Actions
az ad sp create-for-rbac \
  --name "github-actions-bookreviews" \
  --role "Contributor" \
  --scopes "/subscriptions/<your-subscription-id>" \
  --sdk-auth

# The output will look like this (save these values):
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", 
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### Step 2: Grant Additional Permissions

```bash
# Get the service principal object ID
SP_OBJECT_ID=$(az ad sp show --id "<client-id-from-above>" --query id -o tsv)

# Grant Key Vault Administrator role (for managing secrets)
az role assignment create \
  --assignee-object-id $SP_OBJECT_ID \
  --role "Key Vault Administrator" \
  --scope "/subscriptions/<your-subscription-id>"

# Grant ACR Push/Pull permissions (for container registry)
az role assignment create \
  --assignee-object-id $SP_OBJECT_ID \
  --role "AcrPush" \
  --scope "/subscriptions/<your-subscription-id>"
```

## ⚙️ **GitHub Repository Setup**

### Step 1: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

| Secret Name | Value | Description |
|-------------|--------|-------------|
| `ARM_CLIENT_ID` | `<clientId from service principal>` | Azure Service Principal Client ID |
| `ARM_CLIENT_SECRET` | `<clientSecret from service principal>` | Azure Service Principal Secret |
| `ARM_SUBSCRIPTION_ID` | `<subscriptionId from service principal>` | Azure Subscription ID |
| `ARM_TENANT_ID` | `<tenantId from service principal>` | Azure Tenant ID |

### Step 2: Create terraform.tfvars

Create `terraform/terraform.tfvars` with your configuration:

```hcl
# Copy from terraform.tfvars.example and customize
project_name = "bookreviews"
environment  = "prod"
location     = "East US"

# Make sure these names are globally unique
acr_name           = "bookreviewsacr2024"
key_vault_name     = "bookreviews-kv-2024"  
app_service_name   = "bookreviews-app-2024"
mysql_server_name  = "bookreviews-mysql-2024"
cosmos_db_name     = "bookreviews-cosmos-2024"

# Customize other settings as needed
custom_domain     = "api.bookreviews.com"
letsencrypt_email = "admin@bookreviews.com"
```

## 🚀 **Deployment Workflows**

### Automatic Deployment (Push to Main)

```bash
# Any push to main branch triggers full deployment
git add .
git commit -m "Deploy application updates"
git push origin main

# GitHub Actions will automatically:
# 1. Deploy/update infrastructure with Terraform
# 2. Build Docker images for backend and microservice  
# 3. Push images to Azure Container Registry
# 4. Update Kubernetes deployments with new images
# 5. Deploy React frontend to App Service
```

### Pull Request Validation

```bash
# Create PR triggers validation workflow
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Create PR in GitHub

# GitHub Actions will:
# 1. Run Terraform plan (no apply)
# 2. Run security scan with Checkov
# 3. Add plan output as PR comment
```

### Manual Deployment Control

1. Go to **Actions** tab in your GitHub repository
2. Select **Azure Infrastructure and Application Deployment** workflow
3. Click **Run workflow** 
4. Choose deployment options:
   - ☑️ **Deploy infrastructure with Terraform**: Creates/updates Azure resources
   - ☑️ **Build and deploy applications**: Builds containers and deploys apps
   - ⚠️ **Destroy all infrastructure**: Removes all Azure resources (DANGER!)

## 📊 **Monitoring Deployments**

### GitHub Actions Logs

- View real-time deployment progress in **Actions** tab
- Each job shows detailed logs for troubleshooting
- Terraform plans are displayed in PR comments

### Azure Resources Monitoring

```bash
# Check infrastructure deployment
az group show --name bookreviews-rg

# Check AKS cluster
az aks show --resource-group bookreviews-rg --name bookreviews-aks

# Check container images in ACR
az acr repository list --name <acr-name>
az acr repository show-tags --name <acr-name> --repository book-review-backend
```

### Kubernetes Monitoring

```bash
# Get cluster credentials (after infrastructure deployment)
az aks get-credentials --resource-group bookreviews-rg --name bookreviews-aks

# Check deployment status
kubectl get pods
kubectl get deployments  
kubectl get services
kubectl get ingress

# Check application logs
kubectl logs deployment/book-review-backend
kubectl logs deployment/book-review-microservice
```

## 🔧 **Customizing the Workflow**

### Modify Deployment Trigger

Edit `.github/workflows/terraform-deploy.yml`:

```yaml
# Deploy only on specific paths
on:
  push:
    branches:
      - main
    paths:
      - 'terraform/**'
      - 'book-review-backend/**'
      - 'book-review-recommended-backend/**'
      - 'book-review-app/**'
```

### Add Environment-Specific Deployments

```yaml
# Add staging environment
- name: Deploy to Staging
  if: github.ref == 'refs/heads/develop'
  run: terraform apply -var-file="terraform.staging.tfvars"
```

### Add Notification Integration

```yaml
# Add Slack notification
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🛠️ **Troubleshooting**

### Common Issues

1. **Authentication Failures**
   ```bash
   # Verify service principal permissions
   az role assignment list --assignee <client-id> --output table
   ```

2. **Terraform State Issues**
   ```bash
   # Initialize Terraform state (in Actions or locally)
   terraform init -reconfigure
   ```

3. **Image Push Failures**
   ```bash
   # Check ACR permissions
   az acr check-name --name <acr-name>
   az acr show --name <acr-name> --query loginServer
   ```

4. **AKS Connection Issues**
   ```bash
   # Reset cluster credentials
   az aks get-credentials --resource-group bookreviews-rg --name bookreviews-aks --overwrite-existing
   ```

### Debug Workflow Locally

```bash
# Use act to run GitHub Actions locally
npm install -g @github/act
act -j terraform

# Or use Azure CLI for manual steps
az login --service-principal -u $ARM_CLIENT_ID -p $ARM_CLIENT_SECRET --tenant $ARM_TENANT_ID
```

## 🚀 **Best Practices**

### Security
- ✅ Use GitHub secrets for sensitive data
- ✅ Rotate service principal credentials regularly  
- ✅ Enable branch protection rules
- ✅ Review Terraform plans before merging PRs

### Performance  
- ✅ Use Docker layer caching for faster builds
- ✅ Implement Terraform state locking with remote backend
- ✅ Use parallel jobs where possible

### Reliability
- ✅ Add health checks to deployments
- ✅ Implement rollback strategies
- ✅ Monitor deployment success/failure
- ✅ Set up alerting for critical failures

## 📚 **Next Steps**

1. **Set up monitoring**: Configure Application Insights alerts
2. **Add testing**: Include unit/integration tests in pipeline  
3. **Environment promotion**: Add staging → production workflow
4. **Security hardening**: Implement image scanning and vulnerability checks
5. **Documentation**: Keep deployment procedures updated

Your CI/CD pipeline is now ready for automated Azure deployments! 🎉