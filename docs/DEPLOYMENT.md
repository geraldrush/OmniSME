# Deployment Guide

## Zero-Cost Deployment Strategy

This guide covers deploying the SME E-commerce Enabler platform **at zero cost** before scaling.

## Phase 1: Local Development (Free)

Already done! Run `docker-compose up` locally.

**Cost**: $0

## Phase 2: Azure Free Tier Deployment

### Prerequisites

- Azure account (get $200 free credit)
- Azure CLI installed
- Docker installed locally

### Step 1: Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name sme-ecommerce-rg \
  --location eastus

# Create Container Registry (free tier)
az acr create \
  --resource-group sme-ecommerce-rg \
  --name smeecommerce \
  --sku Free

# Create App Service Plan (free tier)
az appservice plan create \
  --name sme-app-plan \
  --resource-group sme-ecommerce-rg \
  --is-linux \
  --sku F1

# Create PostgreSQL server (free tier grants)
az postgres server create \
  --resource-group sme-ecommerce-rg \
  --name sme-db-server \
  --location eastus \
  --admin-user sme_user \
  --admin-password 'YourSecurePassword123!' \
  --sku-name B_Gen5_1 \
  --storage-size 5120

# Create Redis Cache (free tier option)
az redis create \
  --resource-group sme-ecommerce-rg \
  --name sme-redis \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

### Step 2: Build and Push Docker Images

```bash
# Login to Azure Container Registry
az acr login --name smeecommerce

# Build images
docker-compose build

# Tag images (example for one service)
docker tag sme-ecommerce-api-gateway:latest smeecommerce.azurecr.io/api-gateway:latest

# Push to registry
docker push smeecommerce.azurecr.io/api-gateway:latest

# Repeat for all services...
for service in api-gateway user-service product-service order-service payment-service shipping-service subscription-service job-board-service; do
  docker tag sme-ecommerce:$service:latest smeecommerce.azurecr.io/$service:latest
  docker push smeecommerce.azurecr.io/$service:latest
done
```

### Step 3: Deploy Services

```bash
# Deploy API Gateway
az webapp create \
  --resource-group sme-ecommerce-rg \
  --plan sme-app-plan \
  --name sme-api-gateway \
  --deployment-container-image-name smeecommerce.azurecr.io/api-gateway:latest

# Configure web app
az webapp config appsettings set \
  --resource-group sme-ecommerce-rg \
  --name sme-api-gateway \
  --settings \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false \
    DOCKER_REGISTRY_SERVER_URL=https://smeecommerce.azurecr.io \
    DOCKER_REGISTRY_SERVER_USERNAME=$(az acr credential show --name smeecommerce --query username -o tsv) \
    DOCKER_REGISTRY_SERVER_PASSWORD=$(az acr credential show --name smeecommerce --query passwords[0].value -o tsv)

# Enable continuous deployment
az webapp deployment container config \
  --resource-group sme-ecommerce-rg \
  --name sme-api-gateway \
  --enable-continuous-deployment
```

### Step 4: Deploy Frontend (Static Web App)

```bash
# Create Static Web App
az staticwebapp create \
  --resource-group sme-ecommerce-rg \
  --name sme-admin-panel \
  --source https://github.com/YOUR_USERNAME/SME_ecommerce \
  --branch main \
  --app-location "frontend/admin-panel" \
  --output-location "build"

# Build and deploy customer storefront
az staticwebapp create \
  --resource-group sme-ecommerce-rg \
  --name sme-customer-storefront \
  --source https://github.com/YOUR_USERNAME/SME_ecommerce \
  --branch main \
  --app-location "frontend/customer-storefront" \
  --output-location "build"
```

**Free Tier Cost**: 
- 1 GiB storage: Free
- 100 GB bandwidth: Free
- 1 managed identity: Free
- **Total**: $0

## Phase 3: Scaling with Azure Kubernetes Service (AKS)

When you outgrow free tier, use AKS for unlimited scaling.

```bash
# Create AKS cluster
az aks create \
  --resource-group sme-ecommerce-rg \
  --name sme-aks \
  --node-count 3 \
  --vm-set-type VirtualMachineScaleSets \
  --load-balancer-sku standard \
  --enable-managed-identity \
  --network-plugin azure

# Get credentials
az aks get-credentials \
  --resource-group sme-ecommerce-rg \
  --name sme-aks

# Deploy services to Kubernetes
kubectl apply -f infrastructure/k8s/
```

### Estimated Monthly Costs at Scale

| Component | Configuration | Monthly Cost |
|-----------|---|---|
| Compute | 3 Standard B2s nodes | $96 |
| Database | Managed PostgreSQL | $60-120 |
| Redis | Standard 2GB | $25-50 |
| Storage | 100GB | $2-5 |
| Load Balancer | Basic | $15 |
| Bandwidth | 1TB/month | $80-120 |
| **TOTAL** | Production Ready | **$278-406** |

## Using Terraform for IaC

For reproducible deployments, use Terraform:

```bash
cd infrastructure/terraform

# Initialize
terraform init

# Plan deployment
terraform plan -var-file="dev.tfvars"

# Apply
terraform apply -var-file="dev.tfvars"
```

See [infrastructure/terraform/README.md](../infrastructure/terraform/README.md) for details.

## GitHub Actions CI/CD

Automatically deploy on push to main:

```yaml
# .github/workflows/deploy.yml already configured
# Just set these secrets in GitHub:
- AZURE_CREDENTIALS
- REGISTRY_USERNAME
- REGISTRY_PASSWORD
- DATABASE_URL
```

## Monitoring & Logging

### Azure Monitor

```bash
# Create Application Insights
az monitor app-insights component create \
  --app sme-insights \
  --location eastus \
  --resource-group sme-ecommerce-rg \
  --kind web

# Link to services
# (Add instrumentation key to environment variables)
```

### Logs

```bash
# View logs
az webapp log tail \
  --name sme-api-gateway \
  --resource-group sme-ecommerce-rg
```

## Database Migrations

```bash
# Run migrations on deployed database
az postgres db create \
  --server-name sme-db-server \
  --database-name sme_ecommerce

# Execute init.sql
psql -h sme-db-server.postgres.database.azure.com \
  -U sme_user@sme-db-server \
  -d sme_ecommerce \
  -f database/init.sql
```

## Rollback Procedures

```bash
# Rollback to previous image
az webapp config container set \
  --name sme-api-gateway \
  --resource-group sme-ecommerce-rg \
  --docker-custom-image-name smeecommerce.azurecr.io/api-gateway:v1.0.0

# Restart service
az webapp restart \
  --name sme-api-gateway \
  --resource-group sme-ecommerce-rg
```

## Securing Secrets

```bash
# Create Key Vault
az keyvault create \
  --name sme-vault \
  --resource-group sme-ecommerce-rg

# Store secrets
az keyvault secret set \
  --vault-name sme-vault \
  --name PayFastMerchantID \
  --value "your_merchant_id"

# Reference in app
# Add Key Vault URL to app settings
```

## Cleanup

```bash
# Delete entire resource group (WARNING: deletes everything)
az group delete --name sme-ecommerce-rg --yes --no-wait
```

## Cost Optimization Tips

1. **Use spot VMs** for non-critical workloads (80% savings)
2. **Reserved instances** (30-40% savings for 1-year commitment)
3. **Right-size resources** - monitor usage and adjust
4. **Clean up unused resources** regularly
5. **Use auto-scaling** to avoid over-provisioning
6. **Archive old logs** to cheaper storage tiers

## Next Steps

1. Deploy to Azure Free Tier
2. Set up CI/CD with GitHub Actions
3. Monitor with Application Insights
4. Set up SSL/TLS certificates
5. Configure custom domain names
6. Implement auto-scaling policies

---

For more Azure guidance, see [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/architecture/framework/)
