# 🚀 Startup Checklist

## Pre-Launch Verification

Use this checklist to verify everything is working before you start development.

---

## ✅ System Requirements Check

- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git installed (`git --version`)
- [ ] Terminal/Command prompt available

## ✅ Repository Setup

- [ ] Repository cloned locally
- [ ] `.env.example` copied to `.env`
- [ ] Environment variables reviewed and set
- [ ] Git configured (`git config user.name` and `git config user.email`)

## ✅ Docker Infrastructure

- [ ] All services started: `docker-compose up -d`
- [ ] All containers running: `docker-compose ps` ✔ 10/10
- [ ] No errors in logs: `docker-compose logs`

## ✅ Service Health Checks

- [ ] API Gateway healthy: `curl http://localhost:3000/health`
- [ ] User Service healthy: `curl http://localhost:3001/health`
- [ ] Product Service healthy: `curl http://localhost:3002/health`
- [ ] Order Service healthy: `curl http://localhost:3003/health`
- [ ] Payment Service healthy: `curl http://localhost:3004/health`
- [ ] Shipping Service healthy: `curl http://localhost:3005/health`
- [ ] Subscription Service healthy: `curl http://localhost:3006/health`
- [ ] Job Board Service healthy: `curl http://localhost:3007/health`

## ✅ Database Setup

- [ ] PostgreSQL running: `docker-compose ps postgres`
- [ ] Database initialized: Check tables with `\dt`
- [ ] Connection working: `docker-compose exec postgres psql -U sme_user -d sme_ecommerce`
- [ ] Tables created: At least 20+ tables visible

## ✅ Frontend Applications

- [ ] Admin Panel loads: Visit `http://localhost:3100`
- [ ] Admin Panel displays dashboard tabs
- [ ] Customer Storefront loads: Visit `http://localhost:3101`
- [ ] Storefront displays hero section and products area

## ✅ Monitoring & Observability

- [ ] Prometheus running: `curl http://localhost:9090`
- [ ] Grafana running: Visit `http://localhost:3050`
- [ ] Grafana login works: admin/admin
- [ ] Redis connected: `docker-compose exec redis redis-cli ping`

## ✅ API Functionality

```bash
# Test API Gateway
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'
```
- [ ] Signup endpoint responds
- [ ] Response is valid JSON
- [ ] No error messages

```bash
# Test product retrieval
curl http://localhost:3000/api/v1/products
```
- [ ] Products endpoint responds
- [ ] Returns valid JSON array
- [ ] Status is 200

## ✅ File Structure

- [ ] `services/` folder has 8 subdirectories
- [ ] `frontend/` has admin-panel and customer-storefront
- [ ] `database/init.sql` exists and has SQL
- [ ] `docker-compose.yml` is present
- [ ] Documentation files exist in `docs/`

## ✅ Configuration

- [ ] `.env` file created (not in `.env.example`)
- [ ] `.env` is in `.gitignore`
- [ ] `NODE_ENV` is set to 'development'
- [ ] `DATABASE_URL` points to postgres service
- [ ] `REDIS_URL` points to redis service
- [ ] `JWT_SECRET` is set (non-empty)

## ✅ Documentation

- [ ] `README.md` is readable and relevant
- [ ] `QUICKSTART.md` provides quick setup
- [ ] `docs/DEVELOPMENT.md` has development guide
- [ ] `docs/API_DOCS.md` has API reference
- [ ] `docs/DEPLOYMENT.md` has deployment info

## ✅ Version Control

- [ ] Git is initialized
- [ ] `.gitignore` includes sensitive files
- [ ] Initial commit can be made
- [ ] Remote origin is set

---

## 🔧 Troubleshooting

If any check fails, follow these steps:

### Services Not Starting
```bash
# Clean and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
docker-compose logs -f
```

### Port Conflicts
```bash
# macOS/Linux: Find what's using port
lsof -i :3000

# Windows: Find what's using port
netstat -ano | findstr :3000

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Database Issues
```bash
# Check database logs
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U sme_user -d sme_ecommerce

# Reset database
docker-compose down postgres
docker-compose up postgres -d
```

### API Not Responding
```bash
# Check specific service logs
docker-compose logs api-gateway

# Test connectivity
curl -v http://localhost:3000/health

# Check if container is running
docker-compose ps api-gateway
```

---

## 📋 Development Preparation

- [ ] IDE/Editor installed (VS Code recommended)
- [ ] Essential VS Code extensions installed (ESLint, Prettier, REST Client)
- [ ] Postman or Insomnia installed for API testing
- [ ] Favorite browser dev tools open
- [ ] Git configured for commits

## 📚 Initial Learning

- [ ] Read `QUICKSTART.md` (5 minutes)
- [ ] Read `docs/DEVELOPMENT.md` (15 minutes)
- [ ] Review `docs/API_DOCS.md` for endpoints (10 minutes)
- [ ] Skim `database/init.sql` for schema understanding (10 minutes)

## 🎯 First Task (Choose One)

- [ ] **Task 1**: Create a test product via API
  ```bash
  curl -X POST http://localhost:3000/api/v1/products \
    -H "Content-Type: application/json" \
    -d '{"product_name":"Test","price":99.99}'
  ```

- [ ] **Task 2**: Test React admin panel functionality
  - Navigate to http://localhost:3100
  - Click through different tabs
  - Try loading data

- [ ] **Task 3**: Create a test user
  ```bash
  curl -X POST http://localhost:3000/api/v1/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email":"dev@example.com","password":"secure123","full_name":"Dev User"}'
  ```

- [ ] **Task 4**: Query the database
  ```bash
  docker-compose exec postgres psql -U sme_user -d sme_ecommerce
  SELECT COUNT(*) FROM products;
  ```

---

## ✨ Success Criteria

You're ready to start development when:

- [x] All 8 services are running
- [x] All health checks pass
- [x] Admin panel displays in browser
- [x] At least one API endpoint responds
- [x] Database is initialized
- [x] Documentation is accessible
- [x] Git is configured

---

## 🚀 Ready to Code?

Once all checks pass:

1. **Pick a service** to work on (e.g., `product-service`)
2. **Navigate to it**: `cd services/product-service`
3. **Install dependencies**: `npm install` (first time only)
4. **Start development**: `npm run dev`
5. **Make changes** to the code
6. **Files auto-reload** via nodemon
7. **Test your changes** via API calls or browser

## 📞 Need Help?

1. Check `QUICKSTART.md` for quick answers
2. Check `docs/DEVELOPMENT.md` for detailed setup
3. Check `docs/API_DOCS.md` for API questions
4. Review service code in `services/` folder
5. Check Docker logs: `docker-compose logs -f`

---

## ✅ Completion

**Mark date when setup complete**: _____________

**Next milestone**: First feature implementation

**Estimated time to first deploy**: 1-2 weeks

---

This checklist ensures your development environment is fully functional and ready for productive work. 🎉

Happy coding! 🚀
