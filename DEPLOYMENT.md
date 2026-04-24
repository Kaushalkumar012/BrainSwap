# Deployment Guide

Complete guide for deploying SkillSwap to production environments.

## Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] Code reviewed and merged to main branch
- [ ] Environment variables configured for production
- [ ] Database migrations applied
- [ ] Security audit completed (`npm audit`)
- [ ] Performance testing done
- [ ] Backup strategy in place

## Environment Variables

### Backend Production `.env`

```env
# Server
PORT=8080
NODE_ENV=production

# Database
DB_HOST=your-prod-db-host
DB_PORT=3306
DB_USER=prod_user
DB_PASSWORD=strong_password_here
DB_NAME=skillswap_prod

# JWT
JWT_SECRET=generate_with_crypto_randomBytes_32
JWT_EXPIRES_IN=7d

# Security
ENABLE_RATE_LIMIT=true
ENABLE_HELMET=true
CORS_ORIGIN=https://your-domain.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Features
ENABLE_REALTIME=true
ENABLE_GAMIFICATION=true
```

**Generate secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment Options

### Option 1: Docker Container Deployment

#### Using Docker Compose

1. **Update `.env` for production**
```bash
cp .env.example .env
# Edit .env with production values
```

2. **Build and push images**
```bash
docker-compose build
docker tag skillswap-frontend:latest your-registry/skillswap-frontend:latest
docker tag skillswap-backend:latest your-registry/skillswap-backend:latest
docker push your-registry/skillswap-frontend:latest
docker push your-registry/skillswap-backend:latest
```

3. **Deploy on production server**
```bash
# On production server
docker-compose pull
docker-compose up -d
```

#### Production Docker Compose Override
Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_prod_data:/var/lib/mysql
    restart: always

  backend:
    environment:
      NODE_ENV: production
      LOG_LEVEL: info
    restart: always
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    restart: always
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  mysql_prod_data:
    driver: local

# Use: docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Option 2: Cloud Platform Deployment

#### Vercel (Frontend)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
- Go to vercel.com
- Import repository
- Set build command: `npm run build`
- Set output directory: `dist`
- Add environment variables if needed

3. **Deploy**
```bash
vercel deploy --prod
```

#### Railway (Backend + Database)

1. **Create Railway project**
- Connect GitHub repository
- Select `skillswap-backend` directory

2. **Add MySQL service**
- Add service → MySQL
- Connect to backend

3. **Set environment variables**
```bash
Railway Dashboard → Variables
```

4. **Deploy**
```bash
railway up
```

#### AWS EC2

1. **Launch EC2 instance**
```bash
# Ubuntu 22.04 LTS
# Security group: Allow ports 22, 80, 443, 3306, 8080
```

2. **Install dependencies**
```bash
sudo apt update
sudo apt install -y curl git
curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

3. **Install Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

4. **Clone repository**
```bash
git clone <repo-url>
cd 'Skill bridge'
```

5. **Deploy with Docker Compose**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

6. **Setup SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
# Update nginx configuration with SSL paths
```

### Option 3: Kubernetes Deployment

Create Kubernetes manifests:

**backend-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: skillswap-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: skillswap-backend
  template:
    metadata:
      labels:
        app: skillswap-backend
    spec:
      containers:
      - name: backend
        image: your-registry/skillswap-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: skillswap-config
              key: db-host
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: skillswap-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /api/health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Deploy:**
```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f mysql-statefulset.yaml
```

## Database Migration

### Backup Existing Database
```bash
mysqldump -u root -p skillswap > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Apply Schema
```bash
mysql -u root -p skillswap < skillswap-backend/schema.sql
```

### Restore from Backup (if needed)
```bash
mysql -u root -p skillswap < backup_YYYYMMDD_HHMMSS.sql
```

## Monitoring & Logging

### Application Monitoring

#### Backend Logs
```bash
# Docker
docker logs -f skillswap-backend

# Production logs location
tail -f skillswap-backend/logs/combined.log
```

#### Health Checks
```bash
curl http://localhost:8080/api/health
```

### Setup ELK Stack (optional)

1. **Deploy Elasticsearch, Logstash, Kibana**
2. **Configure backend to send logs to Logstash**
3. **Monitor in Kibana dashboard**

### Setup Monitoring with Prometheus

Configure in backend:
```javascript
const prometheus = require('prom-client');
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

## Performance Optimization

### Frontend
1. Enable gzip compression in Nginx
2. Use CDN for static assets
3. Implement lazy loading
4. Optimize images

### Backend
1. Enable query caching
2. Use connection pooling
3. Implement API response caching
4. Use Redis for sessions

### Database
1. Add indexes for frequently queried columns
2. Archive old data
3. Setup replication for high availability

## Security Hardening

### SSL/TLS Certificate
```bash
# Let's Encrypt with auto-renewal
sudo certbot certonly --standalone -d your-domain.com
sudo certbot renew --dry-run
```

### Firewall Configuration
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3306/tcp (internal only)
```

### Database Security
```bash
# Remove default accounts
mysql -u root -p
> DELETE FROM mysql.user WHERE User='';
> DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
> FLUSH PRIVILEGES;
```

### API Rate Limiting
Already configured in backend security middleware.

## Continuous Deployment

### GitHub Actions (Already Configured)

The repository includes GitHub Actions workflows:
- `backend-test.yml` - Runs on every push/PR
- `frontend-test.yml` - Runs on every push/PR

### Manual Deployment Command
```bash
# Trigger deployment
git push origin main
# GitHub Actions automatically tests and builds
# Deploy when ready: docker pull && docker-compose up -d
```

## Rollback Procedure

### Docker Compose Rollback
```bash
# Keep previous version
docker-compose down
git checkout previous-tag
docker-compose up -d
```

### Database Rollback
```bash
# From backup
mysql -u root -p skillswap < backup_before_migration.sql
```

## Maintenance

### Regular Backups
```bash
# Daily automated backup
0 2 * * * mysqldump -u root -p password skillswap | gzip > /backups/skillswap_$(date +\%Y\%m\%d).sql.gz
```

### Log Rotation
Already configured in Docker logging drivers.

### Dependency Updates
```bash
npm audit fix
npm update
npm audit fix --audit-level=moderate
```

## Health Checks

Monitor these endpoints:
- `GET /api/health` - API health
- `GET /` - API info
- `Frontend /health` - Frontend health (via Nginx)

## Troubleshooting

### Backend not starting
```bash
docker logs skillswap-backend
# Check environment variables and database connection
```

### High memory usage
```bash
docker stats skillswap-backend
# Restart if needed
docker restart skillswap-backend
```

### Database connection issues
```bash
# Check MySQL
docker logs skillswap-mysql
# Verify connection string
```

## Cost Optimization

1. Use spot instances on AWS
2. Implement auto-scaling
3. Cache aggressively
4. Archive old data
5. Monitor and cleanup unused resources

---

**Last Updated**: 2026-04-24
**Version**: 1.0.0
