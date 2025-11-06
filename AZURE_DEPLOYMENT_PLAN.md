# 🚀 Azure Deployment Plan - Book Review Application

## 📋 Deployment Overview

This plan covers deploying the Book Review application suite to Microsoft Azure using:
- **Frontend**: Azure App Service (React)
- **Backend Services**: Azure Kubernetes Service (AKS)  
- **API Gateway**: NGINX Ingress Controller (Primary) + Optional APIM
- **Container Registry**: Azure Container Registry (ACR)

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    AZURE CLOUD                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────┐    ┌─────────────────────────────────────────────────┐    │
│  │   Users/Browser  │───▶│            Azure App Service                    │    │
│  │                  │    │         (React Frontend)                        │    │
│  └──────────────────┘    │     https://bookreviews.azurewebsites.net       │    │
│                          └─────────────────────┬───────────────────────────┘    │
│                                                │ HTTPS API Calls                │
│                                                ▼                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                 Azure Kubernetes Service (AKS)                          │    │
│  │                    bookreviews-aks-cluster                              │    │
│  │                                                                         │    │
│  │  ┌───────────────────────────────────────────────────────────────────┐  │    │
│  │  │                 NGINX Ingress Controller                          │  │    │
│  │  │              https://api.bookreviews.com                          │  │    │
│  │  │                                                                   │  │    │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │  │    │
│  │  │  │SSL/TLS      │ │Rate Limiting│ │Load Balance │ │CORS & Auth  │  │  │    │
│  │  │  │Termination  │ │& Security   │ │& Routing    │ │Headers      │  │  │    │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │  │    │
│  │  └─────────────────────┬─────────────────────────────────────────────┘  │    │
│  │                        │ Path-based Routing                             │    │
│  │                        ▼                                                │    │
│  │  ┌─────────────────┐              ┌─────────────────┐                   │    │
│  │  │  Main Backend   │◄────────────▶│   Microservice  │                   │    │
│  │  │   (Express)     │              │   (Express)     │                   │    │
│  │  │   Port: 3001    │              │   Port: 3002    │                   │    │
│  │  │                 │              │                 │                   │    │
│  │  │ • Books CRUD    │              │ • Recommendations│                  │    │
│  │  │ • Reviews CRUD  │              │ • Analytics     │                   │    │
│  │  │ • User Auth     │              │ • Notifications │                   │    │
│  │  │ • Health Checks │              │ • Search & Docs │                   │    │
│  │  └─────────────────┘              └─────────────────┘                   │    │
│  │           │                     │                                       │    │
│  └───────────┼─────────────────────┼───────────────────────────────────────┘    │
│              │                     │                                            │
│              ▼                     ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                        Azure Databases                                  │    │
│  │                                                                         │    │
│  │  ┌─────────────────┐              ┌─────────────────┐                   │    │
│  │  │ Azure Database  │              │   Azure Cosmos  │                   │    │
│  │  │   for MySQL     │              │       DB        │                   │    │
│  │  │                 │              │   (MongoDB API) │                   │    │
│  │  │ • Users         │              │                 │                   │    │
│  │  │ • Books         │              │ • Analytics     │                   │    │
│  │  │ • Reviews       │              │ • Recommendations│                  │    │
│  │  └─────────────────┘              └─────────────────┘                   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                  Supporting Azure Services                              │    │
│  │                                                                         │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │    │
│  │  │    ACR      │ │    Key      │ │  App        │ │  Monitor &  │        │    │
│  │  │ Container   │ │   Vault     │ │ Insights    │ │   Logs      │        │    │
│  │  │ Registry    │ │             │ │             │ │             │        │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🎯 Deployment Strategy

### Phase 1: Infrastructure Setup
1. **Azure Container Registry (ACR)**
2. **Azure Kubernetes Service (AKS)**  
3. **Azure Database for MySQL**
4. **Azure Cosmos DB (MongoDB API)**
5. **Azure Key Vault**

### Phase 2: Container & API Setup
1. **Build and Push Container Images**
2. **Deploy Backend Services to AKS**
3. **Configure Azure API Management**
4. **Set up Ingress and Load Balancing**

### Phase 3: Frontend Deployment  
1. **Build React Application**
2. **Deploy to Azure App Service**
3. **Configure Custom Domain & SSL**
4. **Set Environment Variables**

### Phase 4: Integration & Testing
1. **Configure Cross-Service Communication**
2. **Set up Monitoring & Logging**
3. **Performance Testing**
4. **Security Configuration**

## 🔗 Frontend-Backend Connectivity in Azure

### Connection Flow:
```
React Frontend (App Service)
    ↓ HTTPS Calls
Azure API Management Gateway  
    ↓ Internal Network
AKS Backend Services
    ↓ Private Endpoints
Azure Databases
```

### Configuration:
- **Frontend**: Direct calls to NGINX Ingress endpoints
- **NGINX Ingress**: Routes requests to backend services with SSL termination  
- **AKS**: Internal service-to-service communication
- **Security**: JWT tokens, API keys, network isolation

## 📦 Container Strategy

### Images to Build:
1. **book-review-backend** → ACR
2. **book-review-microservice** → ACR  

### Registry Structure:
```
bookreviewsacr.azurecr.io/
├── book-review-backend:v1.0.0
├── book-review-backend:latest  
├── book-review-microservice:v1.0.0
└── book-review-microservice:latest
```

## 🛠️ Implementation Steps

### Step 1: Azure Resource Creation
```bash
# Resource Group
az group create --name bookreviews-rg --location eastus

# Container Registry
az acr create --resource-group bookreviews-rg \
  --name bookreviewsacr --sku Basic

# AKS Cluster  
az aks create --resource-group bookreviews-rg \
  --name bookreviews-aks \
  --node-count 2 \
  --attach-acr bookreviewsacr

# App Service Plan
az appservice plan create --name bookreviews-plan \
  --resource-group bookreviews-rg --sku B1

# App Service
az webapp create --resource-group bookreviews-rg \
  --plan bookreviews-plan --name bookreviews-frontend
```

### Step 2: Database Setup
```bash
# MySQL Database
az mysql flexible-server create \
  --resource-group bookreviews-rg \
  --name bookreviews-mysql \
  --admin-user bookreviewadmin

# Cosmos DB (MongoDB API)
az cosmosdb create \
  --resource-group bookreviews-rg \
  --name bookreviews-cosmos \
  --kind MongoDB
```

### Step 3: Container Build & Push
```bash
# Login to ACR
az acr login --name bookreviewsacr

# Build and push backend
docker build -t bookreviewsacr.azurecr.io/book-review-backend:v1.0.0 \
  ./book-review-backend/
docker push bookreviewsacr.azurecr.io/book-review-backend:v1.0.0

# Build and push microservice  
docker build -t bookreviewsacr.azurecr.io/book-review-microservice:v1.0.0 \
  ./book-review-recommended-backend/
docker push bookreviewsacr.azurecr.io/book-review-microservice:v1.0.0
```

### Step 4: AKS Deployment
```yaml
# Kubernetes manifests for backend services
# Deploy via kubectl apply -f k8s/
```

### Step 5: APIM Configuration
```bash
### Step 5: NGINX Ingress Configuration

# Install NGINX Ingress Controller
kubectl apply -f k8s/00-nginx-ingress-setup.yaml

# Deploy application with ingress
kubectl apply -f k8s/04-ingress-loadbalancer.yaml

# Verify ingress controller
kubectl get pods -n ingress-nginx
kubectl get svc -n ingress-nginx

### Step 6: Optional APIM Configuration

# If additional API management features are needed
az apim create --resource-group bookreviews-rg \
  --name bookreviews-apim \
  --location eastus \
  --publisher-name "BookReviews" \
  --publisher-email "admin@bookreviews.com" \
  --sku-name Developer
```

### Step 6: Frontend Deployment
```bash
# Build React app with Azure endpoints
npm run build

# Deploy to App Service
az webapp deployment source config-zip \
  --resource-group bookreviews-rg \
  --name bookreviews-frontend \
  --src build.zip
```

## 🔐 Security Configuration

### Network Security:
- **Private AKS Cluster** with internal load balancer
- **VNet Integration** between App Service and AKS
- **Private Endpoints** for databases
- **Network Security Groups** for traffic control

### Application Security:
- **Azure Key Vault** for secrets management
- **Managed Identity** for service authentication
- **SSL/TLS** termination at NGINX Ingress (Let's Encrypt)
- **JWT Validation** at service level

### Environment Variables:
```bash
# Frontend (App Service)
REACT_APP_API_URL=https://bookreviews-api.azure-api.net
REACT_APP_API_BASE_URL=https://api.bookreviews.com

# Backend (AKS ConfigMaps/Secrets)
DB_HOST=bookreviews-mysql.mysql.database.azure.com
MONGODB_URI=<COSMOS_DB_CONNECTION_STRING>
JWT_SECRET=<KEY_VAULT_SECRET>
```

## 📊 Monitoring & Observability

### Azure Services:
- **Application Insights** - Application performance monitoring
- **Azure Monitor** - Infrastructure monitoring  
- **Log Analytics** - Centralized logging
- **Azure Alerts** - Proactive alerting

### Metrics to Track:
- API response times
- Container resource usage
- Database performance
- Frontend user experience
- Error rates and exceptions

## 💰 Cost Estimation

### Monthly Costs (Approximate):
- **App Service B1**: ~$13/month
- **AKS (2 B2s nodes)**: ~$140/month  
- **ACR Basic**: ~$5/month
- **NGINX Ingress**: Included with AKS (no additional cost)
- **Optional APIM Developer**: ~$50/month
- **Azure Database MySQL**: ~$20/month
- **Cosmos DB**: ~$24/month (minimal usage)
- **Monitoring & Logs**: ~$10/month

**Total Estimated**: ~$262/month

## 🚀 Deployment Timeline

### Week 1: Infrastructure
- [ ] Azure resource provisioning
- [ ] Network configuration
- [ ] Database setup

### Week 2: Containerization  
- [ ] Dockerfile optimization
- [ ] Container registry setup
- [ ] AKS deployment manifests

### Week 3: Backend Deployment
- [ ] AKS service deployment
- [ ] NGINX Ingress Controller setup
- [ ] SSL certificate configuration (cert-manager)
- [ ] Optional APIM configuration
- [ ] Database connections

### Week 4: Frontend Integration
- [ ] App Service deployment
- [ ] Environment configuration
- [ ] End-to-end testing

## � Deployment Files Created

```
book-review/
├── �📋 AZURE_DEPLOYMENT_PLAN.md           # This comprehensive plan
├── 🔧 AZURE_ENVIRONMENT_CONFIG.md        # Environment & connectivity guide
├── 
├── 📦 k8s/                               # Kubernetes manifests
│   ├── 00-namespace.yaml                 # Kubernetes namespace
│   ├── 01-configmap-secrets.yaml         # Configuration and secrets
│   ├── 02-backend-deployment.yaml        # Main backend deployment
│   ├── 03-microservice-deployment.yaml   # Microservice deployment
│   └── 04-ingress-loadbalancer.yaml      # Ingress and load balancer
│
├── 🏗️ terraform/                        # Infrastructure as Code
│   ├── 00-master-deploy.sh              # Master deployment orchestrator
│   ├── 01-setup-infrastructure.sh        # Azure resources setup
│   ├── 02-build-push-images.sh          # Container build & push
│   ├── 03-deploy-to-aks.sh              # AKS deployment
│   └── 05-deploy-frontend.sh            # App Service deployment
│
├── 🐳 Dockerfiles (Enhanced)
│   ├── book-review-backend/Dockerfile    # Optimized backend image
│   └── book-review-recommended-backend/Dockerfile  # Optimized microservice image

## 🚀 Quick Start Commands

### Complete Infrastructure Deployment
```bash
cd terraform/
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init
terraform plan
terraform apply
```

### Automated CI/CD Deployment (Recommended):
```bash
# 1. Configure GitHub Secrets (one-time setup)
# - ARM_CLIENT_ID, ARM_CLIENT_SECRET, ARM_SUBSCRIPTION_ID, ARM_TENANT_ID

# 2. Push code to main branch - triggers automatic deployment:
git add .
git commit -m "Deploy infrastructure and applications"
git push origin main

# GitHub Actions will automatically:
# ✅ Deploy infrastructure with Terraform
# ✅ Build and push Docker images to ACR  
# ✅ Deploy backend services to AKS
# ✅ Deploy React frontend to App Service
```

### Manual Deployment Steps (if needed):
```bash
# 1. Get AKS credentials
az aks get-credentials --resource-group bookreviews-rg --name bookreviews-aks

# 2. Build & push containers to ACR (or use GitHub Actions)
docker build -t <acr-url>/book-review-backend:latest ./book-review-backend
docker push <acr-url>/book-review-backend:latest

# 3. Deploy applications to AKS
kubectl apply -f k8s/

# 4. Frontend deployment via App Service
npm run build && az webapp deployment source config-zip ...
```

## 📋 Prerequisites Checklist

- [ ] Azure CLI installed and configured (`az login`)
- [ ] Docker installed and running
- [ ] kubectl installed  
- [ ] Node.js 18+ and npm installed
- [ ] Azure subscription with appropriate permissions
- [ ] Estimated budget: ~$262/month for Azure resources

## 📝 Next Steps

1. **Review deployment plan and architecture**
2. **Configure Terraform**: Copy `terraform/terraform.tfvars.example` to `terraform/terraform.tfvars` and customize
3. **Execute deployment**: Follow the master script prompts
4. **Configure custom domains** (optional): See AZURE_ENVIRONMENT_CONFIG.md
5. **Set up monitoring**: Configure Application Insights and alerts
6. **Implement CI/CD**: GitHub Actions or Azure DevOps pipeline

## 📞 Support & Documentation

- **Architecture Guide**: [AZURE_DEPLOYMENT_PLAN.md](./AZURE_DEPLOYMENT_PLAN.md)
- **Environment Config**: [AZURE_ENVIRONMENT_CONFIG.md](./AZURE_ENVIRONMENT_CONFIG.md)  
- **Development Guide**: [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Local Setup**: [README.md](./README.md)

The deployment is fully automated and production-ready! 🎉