# 🔧 Azure Environment Configuration Guide

## Overview

This guide explains how the frontend connects to the backend when deployed in Azure and provides detailed environment configuration for each service.

## 🏗️ Azure Architecture Flow with NGINX Ingress

```
┌─────────────────┐     HTTPS      ┌─────────────────────────┐
│   User Browser  │ ──────────────▶│    Azure App Service    │
│                 │                │    (React Frontend)     │
└─────────────────┘                └─────────┬───────────────┘
                                             │ API Calls
                                             │ HTTPS
                                             ▼
                                   ┌─────────────────────────┐
                                   │  Azure API Management   │
                                   │      (APIM Gateway)     │
                                   │        (optional)       │
                                   │  ┌─────────────────┐    │
                                   │  │ Authentication  │    │
                                   │  │ Rate Limiting   │    │
                                   │  │ Request Routing │    │
                                   │  │ SSL Termination │    │
                                   │  └─────────────────┘    │
                                   └─────────┬───────────────┘
                                             │ External Network
                                             │ HTTPS
                                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Azure Kubernetes Service (AKS)                  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │                    NGINX Ingress Controller                  │      │
│  │                                                              │      │
│  │  ┌─────────────────┐  ┌─────────────────┐                    │      │
│  │  │ SSL Termination │  │ Load Balancing  │                    │      │
│  │  │ Rate Limiting   │  │ Path Routing    │                    │      │
│  │  │ CORS Handling   │  │ Health Checks   │                    │      │
│  │  └─────────────────┘  └─────────────────┘                    │      │
│  └─────────────────────┬────────────────────────────────────────┘      │
│                        │ Internal Cluster Network                      │
│                        ▼                                               │
│  ┌─────────────────┐              ┌─────────────────┐                  │
│  │  Main Backend   │◄────────────▶│   Microservice  │                  │
│  │   (Express)     │              │   (Express)     │                  │
│  │                 │              │                 │                  │
│  │ • Authentication│              │ • Recommendations│                 │
│  │ • Books CRUD    │              │ • Analytics     │                  │
│  │ • Reviews CRUD  │              │ • Notifications │                  │
│  │ • User Mgmt     │              │ • Search        │                  │
│  └─────────┬───────┘              └─────────┬───────┘                  │
└────────────┼────────────────────────────────┼──────────────────────────┘
             │                                │
             ▼                                ▼
┌─────────────────┐                ┌──────────────────┐
│ Azure Database  │                │ Azure Cosmos DB  │
│   for MySQL     │                │  (MongoDB API)   │
│                 │                │                  │
│ • Users         │                │ • Analytics      │
│ • Books         │                │ • Recommendations│
│ • Reviews       │                │ • Cache Data     │
└─────────────────┘                └──────────────────┘
```

## 🔗 Frontend-Backend Connectivity

### Connection Flow with NGINX Ingress:

1. **User Access**: Users access the React app via `https://bookreviews-frontend.azurewebsites.net`

2. **API Calls**: React app makes HTTPS requests to NGINX Ingress external IP:
   ```javascript
   // In React components
   const API_BASE_URL = process.env.VITE_REACT_APP_API_URL; // NGINX Ingress external IP/domain
   const response = await fetch(`${API_BASE_URL}/api/books`);
   ```

3. **NGINX Ingress Routing**: NGINX Ingress Controller routes requests based on path and host:
   ```
   api.bookreviews.com/api/auth/*        → Main Backend Service (AKS)
   api.bookreviews.com/api/books/*       → Main Backend Service (AKS)  
   api.bookreviews.com/api/reviews/*     → Main Backend Service (AKS)
   api.bookreviews.com/api/recommendations/* → Microservice (AKS)
   api.bookreviews.com/api/analytics/*   → Microservice (AKS)
   api.bookreviews.com/api/notifications/* → Microservice (AKS)
   api.bookreviews.com/api/search/*      → Microservice (AKS)
   api.bookreviews.com/api-docs          → Microservice (AKS)
   ```

4. **APIM Integration** (Optional): For advanced API management:
   ```
   Frontend → NGINX Ingress → APIM (internal) → Backend Services
   ```

5. **AKS Internal**: Services communicate internally within the cluster:
   ```
   bookreviews-backend-service:3001      (Main Backend)
   bookreviews-microservice-service:3002 (Microservice)
   ```

6. **Database Access**: Backend services connect to Azure databases via private endpoints

## 📋 Environment Configuration

### 🌐 Frontend (Azure App Service)

**File**: `book-review-app/.env.production`

```bash
# API Configuration - NGINX Ingress
VITE_REACT_APP_API_URL=https://api.bookreviews.com
VITE_MICROSERVICE_API_URL=https://api.bookreviews.com/api

# Alternative: Direct IP (if custom domain not configured)
# VITE_REACT_APP_API_URL=https://20.124.45.67  # NGINX Ingress external IP
# VITE_MICROSERVICE_API_URL=https://20.124.45.67/api

# Security
VITE_REACT_APP_ENCRYPTION_KEY=prod-encryption-key-change-in-production
VITE_BOOK_APP_BE_MS_API_KEY=nginx-ingress-api-key-from-secret

# App Configuration  
VITE_APP_NAME=Book Review Library
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_RECOMMENDATIONS=true
VITE_ENABLE_ADVANCED_SEARCH=true

# Debugging (disabled in production)
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=warn

# Azure Services
VITE_AZURE_APP_INSIGHTS_KEY=your-app-insights-instrumentation-key
```

### 🔧 Main Backend (AKS ConfigMap + Secrets)

**ConfigMap** (`k8s/01-configmap-secrets.yaml`):
```yaml
data:
  NODE_ENV: "production"
  PORT: "3001"
  
  # Database Configuration
  DB_HOST: "bookreviews-mysql.mysql.database.azure.com"
  DB_NAME: "book_review"
  DB_PORT: "3306"
  
  # CORS Configuration
  ALLOWED_ORIGINS: "https://bookreviews-frontend.azurewebsites.net,https://bookreviews-apim.azure-api.net"
  
  # Features
  LOG_LEVEL: "info"
  RATE_LIMIT_MAX_REQUESTS: "200"
```

**Secrets**:
```yaml
data:
  # Database (base64 encoded)
  DB_USER: Ym9va3Jldmlld2FkbWlu  # bookreviewadmin
  DB_PASS: Qm9va1Jldmlldz0yMDI0IQ==  # BookReview@2024!
  
  # JWT
  JWT_SECRET: <base64-encoded-strong-secret>
  
  # API Keys
  API_KEY: <base64-encoded-api-key>
```

### 🎯 Microservice (AKS ConfigMap + Secrets)

**ConfigMap**:
```yaml
data:
  NODE_ENV: "production"
  PORT: "3002"
  
  # MongoDB Configuration
  MONGODB_HOST: "bookreviews-cosmos.mongo.cosmos.azure.com"
  MONGODB_PORT: "10255"
  MONGODB_DB_NAME: "book_review_microservice"
  
  # Redis Configuration (if using Azure Cache for Redis)
  REDIS_HOST: "bookreviews-redis.redis.cache.windows.net"
  REDIS_PORT: "6380"
  
  # External Services
  MAIN_BACKEND_URL: "http://bookreviews-backend-service:3001"
```

**Secrets**:
```yaml
data:
  # MongoDB Connection (base64 encoded)
  MONGODB_URI: <cosmos-db-connection-string-base64>
  
  # Redis Connection (base64 encoded)  
  REDIS_URL: <azure-redis-connection-string-base64>
  
  # JWT for microservice
  JWT_SECRET: <base64-encoded-microservice-jwt-secret>
```

## 🔐 Security Configuration

### 1. Network Security

```bash
# Private AKS cluster with internal load balancer
az aks create --enable-private-cluster \
  --load-balancer-sku standard \
  --enable-managed-identity

# VNet integration for App Service
az webapp vnet-integration add \
  --resource-group bookreviews-rg \
  --name bookreviews-frontend \
  --vnet MyVNet --subnet AppServiceSubnet
```

### 2. API Management Security

```yaml
# APIM Policy Configuration
policies:
  - name: "cors"
    value: |
      <cors allow-credentials="true">
        <allowed-origins>
          <origin>https://bookreviews-frontend.azurewebsites.net</origin>
        </allowed-origins>
        <allowed-methods>
          <method>GET</method>
          <method>POST</method>
          <method>PUT</method>
          <method>DELETE</method>
        </allowed-methods>
      </cors>
  
  - name: "rate-limit"  
    value: |
      <rate-limit calls="200" renewal-period="60" />
  
  - name: "jwt-validation"
    value: |
      <validate-jwt header-name="Authorization" failed-validation-httpcode="401">
        <openid-config url="https://your-identity-provider/.well-known/openid_configuration" />
      </validate-jwt>
```

### 3. Database Security

```bash
# MySQL Firewall Rules
az mysql flexible-server firewall-rule create \
  --resource-group bookreviews-rg \
  --name bookreviews-mysql \
  --rule-name "AllowAKSSubnet" \
  --start-ip-address 10.0.2.0 \
  --end-ip-address 10.0.2.255

# Cosmos DB IP Rules  
az cosmosdb network-rule add \
  --resource-group bookreviews-rg \
  --name bookreviews-cosmos \
  --subnet /subscriptions/.../subnets/AKSSubnet
```

## 📊 Monitoring Configuration

### Application Insights

```javascript
// Frontend monitoring
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: process.env.VITE_AZURE_APP_INSIGHTS_KEY,
    enableAutoRouteTracking: true
  }
});

appInsights.loadAppInsights();
```

### Backend Monitoring

```typescript
// Backend monitoring
import * as appInsights from 'applicationinsights';

appInsights.setup(process.env.AZURE_APP_INSIGHTS_KEY)
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .start();
```

## 🚀 Deployment Process

### 1. Infrastructure Setup
```bash
# Run master deployment script
## 🚀 Deployment Commands

### Terraform Deployment
```bash
# Navigate to terraform directory
cd terraform/

# Copy and customize configuration
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your specific values

# Initialize and deploy
terraform init
terraform plan
terraform apply
```
```

### 2. Manual Steps After Deployment

1. **Update APIM Subscription Keys**:
   ```bash
   # Get APIM subscription key
   az apim subscription list --service-name bookreviews-apim \
     --resource-group bookreviews-rg
   
   # Update frontend environment
   az webapp config appsettings set \
     --resource-group bookreviews-rg \
     --name bookreviews-frontend \
     --settings VITE_BOOK_APP_BE_MS_API_KEY="your-apim-subscription-key"
   ```

2. **Configure Custom Domains** (Optional):
   ```bash
   # Frontend custom domain
   az webapp config hostname add \
     --resource-group bookreviews-rg \
     --webapp-name bookreviews-frontend \
     --hostname bookreviews.yourdomain.com
   
   # APIM custom domain  
   az apim update \
     --resource-group bookreviews-rg \
     --name bookreviews-apim \
     --set hostnameConfigurations[0].hostName=api.yourdomain.com
   ```

3. **SSL Certificates**:
   ```bash
   # App Service SSL
   az webapp config ssl bind \
     --resource-group bookreviews-rg \
     --name bookreviews-frontend \
     --certificate-thumbprint <thumbprint> \
     --ssl-type SNI
   ```

## 🧪 Testing Connectivity

### Health Check Endpoints

```bash
# Test AKS services
kubectl port-forward -n bookreviews svc/bookreviews-backend-service 8001:3001
curl http://localhost:8001/api/health

kubectl port-forward -n bookreviews svc/bookreviews-microservice-service 8002:3002  
curl http://localhost:8002/api/health

# Test via APIM Gateway
curl https://bookreviews-apim.azure-api.net/api/health

# Test Frontend
curl https://bookreviews-frontend.azurewebsites.net
```

### End-to-End Testing

```bash
# Test complete flow
curl -X POST https://bookreviews-apim.azure-api.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test with JWT token  
curl -X GET https://bookreviews-apim.azure-api.net/api/books \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

This configuration ensures secure, scalable communication between all components of your Book Review application deployed in Azure! 🚀