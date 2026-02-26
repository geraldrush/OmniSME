# SME E-commerce Enabler Platform

A lightweight, zero-cost-to-start e-commerce platform specifically tailored for South African SMEs with integrated local payment gateways and courier services.

## Platform Overview

The SME E-commerce Enabler empowers small and medium-sized enterprises to launch and manage their own online stores with minimal technical complexity. Built with a microservices architecture, it scales seamlessly from zero cost to enterprise-grade infrastructure.

## Zero-Cost Before Scaling

This platform is architected for **zero operational costs until you reach production scale**:

### Free Technologies Stack
- **Frontend**: React.js (free, open-source)
- **Backend**: Node.js + Express (free, open-source)
- **Database**: PostgreSQL (free, open-source)
- **Containerization**: Docker & docker-compose (free)
- **CI/CD**: GitHub Actions (free tier)
- **Monitoring**: Prometheus + Grafana (free, open-source)
- **Logging**: ELK Stack - Elasticsearch, Logstash, Kibana (free, open-source)

### Free Cloud Hosting (Before Scaling)
- **Azure Free Tier**: $200 credit + always-free services
- **AWS Free Tier**: 12 months free for eligible services
- **Docker Compose Locally**: Development without any cloud costs

## Architecture

### Microservices

```
api-gateway          - Single entry point, routing, rate limiting
user-service         - Authentication, authorization, profiles
product-service      - Product catalog, inventory, search
order-service        - Order management, status updates
payment-service      - Payment orchestration (PayFast, Ozow)
shipping-service     - Shipping rates, labels (Courier Guy, Bob Go, Pargo)
subscription-service - Subscription management, billing
job-board-service    - Lead generation from successful stores
```

### Frontend Applications

```
admin-panel          - SME store management interface
customer-storefront  - Customer-facing online store
```

## Quick Start

### Local Development (Zero Cost)

```bash
# Prerequisites
- Docker
- Docker Compose
- Node.js 18+
- PostgreSQL 14+ OR Docker PostgreSQL image

# Clone and setup
git clone <repo>
cd SME_ecommerce

# Start all services with docker-compose
docker-compose up -d

# Services will be available at:
- API Gateway: http://localhost:3000
- Admin Panel: http://localhost:3001
- Customer Storefront: http://localhost:3002
- PostgreSQL: localhost:5432
```

### Project Structure

```
SME_ecommerce/
├── frontend/                    # Frontend applications
│   ├── admin-panel/            # SME store builder
│   └── customer-storefront/    # Customer-facing store
├── services/                    # Backend microservices
│   ├── api-gateway/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   ├── shipping-service/
│   ├── subscription-service/
│   └── job-board-service/
├── database/                    # Database schemas, migrations
├── infrastructure/              # Docker, docker-compose, K8s configs
├── shared/                      # Shared libraries, utilities
├── .github/workflows/           # CI/CD pipelines
└── docs/                        # Documentation
```

## Feature Matrix

### SME Store Builder
- [x] Store setup & customization
- [x] Product management
- [x] Order management
- [x] Payment gateway configuration
- [x] Shipping provider setup
- [x] Subscription management
- [x] Basic analytics

### Customer Experience
- [x] Product browsing & search
- [x] Shopping cart & checkout
- [x] Multiple payment options
- [x] Order tracking
- [x] User accounts

### Payment Gateways
- [ ] PayFast integration (with ITN webhooks)
- [ ] Ozow integration (multi-tenant support)
- [ ] Recurring billing support

### Shipping Providers
- [ ] The Courier Guy (via Ship Logic API)
- [ ] Bob Go (multi-carrier routing)
- [ ] Pargo (Click & Collect)

## Deployment Strategies

### Phase 1: Local Development
```bash
docker-compose up
# Runs all services locally - completely free
```

### Phase 2: Single Cloud Instance (Azure Free Tier)
- 1x Free App Service instance
- PostgreSQL free tier
- Free bandwidth for first month

### Phase 3: Containerized Production (Low Cost)
- Azure Container Instances or App Service
- Managed PostgreSQL
- Estimated cost: ~$50-150/month for basic load

### Phase 4: Enterprise Scale (Pay-as-you-grow)
- Azure Kubernetes Service (AKS) with auto-scaling
- Azure Database for PostgreSQL - Hyperscale
- Cost: Scales with usage

## Integration Endpoints

### PayFast
- **Redirect URL**: `/payment/payfast/redirect`
- **ITN Webhook**: `/payment/payfast/notify`
- **Signature Verification**: MD5-based

### Ozow
- **Webhook**: `/payment/ozow/webhook`
- **Sub-merchant Support**: Via API key management

### The Courier Guy
- **Quote Request**: POST `/shipping/quote`
- **Booking**: POST `/shipping/book`
- **Tracking**: GET `/shipping/track/{reference}`

### Bob Go
- **Rate Comparison**: POST `/shipping/bob-go/rates`
- **Booking**: POST `/shipping/bob-go/book`

### Pargo
- **Service Finder**: GET `/shipping/pargo/services`
- **Booking**: POST `/shipping/pargo/book`

## Security

- [ ] OAuth2/JWT authentication
- [ ] Role-based access control (RBAC)
- [ ] API key management
- [ ] Data encryption at rest
- [ ] TLS/HTTPS in transit
- [ ] Input validation & sanitization
- [ ] Rate limiting per tenant
- [ ] PCI DSS compliance consideration
- [ ] Regular security audits

## Database Schema (Multi-Tenant)

```sql
-- Each entity includes tenant_id for isolation
-- Tables: users, sme_stores, products, orders, customers, 
--         payments, shipping_labels, subscriptions, leads
```

## Monitoring & Observability (Free Stack)

- **Prometheus**: Metrics collection
- **Grafana**: Visualization & alerting
- **ELK Stack**: Centralized logging
- **Health Checks**: Built-in service health endpoints

## Development Roadmap

### MVP (Phase 1)
- [ ] API Gateway & routing
- [ ] User service (authentication)
- [ ] Product service
- [ ] Basic order service
- [ ] PayFast integration (redirect-based)
- [ ] Admin panel (React)
- [ ] Customer storefront (React SSR)

### Phase 2
- [ ] Subscription service
- [ ] Bob Go shipping integration
- [ ] Advanced analytics
- [ ] Ozow integration

### Phase 3
- [ ] Pargo integration
- [ ] Job board lead service
- [ ] Mobile app (React Native)
- [ ] Marketing tools

## Cost Estimation

### Before Scaling (Free)
- All development: $0
- Local testing: $0
- CI/CD (GitHub Actions): $0

### First 1,000 Transactions/Month (Azure Free Tier)
- Compute: $0 (free tier)
- Database: $0-15 (free tier)
- Storage: $0 (free tier)
- **Total: $0-15/month**

### Production Ready (5,000+ Transactions/Month)
- API Gateway: $15-30
- Database: $30-50
- App Services: $20-50
- **Total: $65-130/month**

### Enterprise Scale (50,000+ Transactions/Month)
- Kubernetes: $100-200
- Database Hyperscale: $100-300
- Load Balancing: $30-50
- **Total: $230-550/month**

## Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

[Choose appropriate license - MIT recommended for open-source]

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Community: [Slack/Discord channel]

## Local Development

See [DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed setup instructions.

## API Documentation

See [API_DOCS.md](docs/API_DOCS.md) for complete API reference.

## Deployment Guide

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for cloud deployment instructions.

---

Built with ❤️ for South African SMEs | Zero Cost to Start | Enterprise Ready
