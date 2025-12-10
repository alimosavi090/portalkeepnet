# Deployment Guide - Secure-DataVault

راهنمای کامل استقرار پروژه در محیط production

## 📋 پیش‌نیازها

### سرور
- Ubuntu 20.04+ یا Debian 11+
- حداقل 2GB RAM
- 20GB فضای دیسک
- دسترسی root یا sudo

### نرم‌افزارها
- Node.js 20.x
- PostgreSQL 14+
- Nginx (برای reverse proxy)
- PM2 (برای process management)

---

## 🚀 روش 1: استقرار مستقیم

### 1. نصب Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### 2. راه‌اندازی Database

```bash
# Switch to postgres user
sudo -u postgres psql

# در PostgreSQL:
CREATE DATABASE secure_datavault;
CREATE USER vpn_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE secure_datavault TO vpn_user;
\q
```

### 3. Clone و Setup پروژه

```bash
# Clone repository
cd /var/www
sudo git clone <your-repo-url> secure-datavault
cd secure-datavault

# Install dependencies
npm install --production

# Create .env file
sudo nano .env
```

محتوای `.env`:

```env
DATABASE_URL=postgresql://vpn_user:your-secure-password@localhost:5432/secure_datavault
SESSION_SECRET=your-generated-secret-key-min-32-chars
NODE_ENV=production
PORT=5000
UPLOAD_DIR=/var/www/secure-datavault/uploads
MAX_FILE_SIZE=5242880
```

### 4. Build پروژه

```bash
npm run build
```

### 5. راه‌اندازی Database Schema

```bash
npm run db:push
```

### 6. ایجاد Admin اولیه

```bash
# اجرای یک اسکریپت Node.js
node -e "
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createAdmin() {
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query(
    'INSERT INTO admins (username, password) VALUES ($1, $2)',
    ['admin', hash]
  );
  console.log('Admin created successfully');
  process.exit(0);
}

createAdmin();
"
```

> ⚠️ **مهم**: بعد از اولین ورود، حتماً رمز عبور را تغییر دهید!

### 7. اجرا با PM2

```bash
# Start application
pm2 start npm --name "secure-datavault" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
# دستور نمایش داده شده را اجرا کنید
```

### 8. تنظیم Nginx

```bash
sudo nano /etc/nginx/sites-available/secure-datavault
```

محتوا:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/secure-datavault/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

فعال‌سازی:

```bash
sudo ln -s /etc/nginx/sites-available/secure-datavault /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. SSL با Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## 🐳 روش 2: استقرار با Docker

### 1. نصب Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose
```

### 2. Clone پروژه

```bash
git clone <your-repo-url>
cd secure-datavault
```

### 3. تنظیم Environment

```bash
cp .env.example .env
nano .env
```

### 4. اجرا

```bash
docker-compose up -d
```

### 5. مشاهده Logs

```bash
docker-compose logs -f
```

---

## 🔒 تنظیمات امنیتی

### 1. Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. PostgreSQL Security

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

فقط اجازه اتصال local:

```
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
```

### 3. Fail2ban (محافظت در برابر brute force)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

### 4. تنظیمات Nginx Security Headers

اضافه کردن به config Nginx:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# Status
pm2 status

# Logs
pm2 logs secure-datavault

# Restart
pm2 restart secure-datavault

# Stop
pm2 stop secure-datavault
```

### Database Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-db.sh
```

محتوا:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U vpn_user secure_datavault | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-db.sh
```

---

## 🔄 به‌روزرسانی

```bash
cd /var/www/secure-datavault

# Pull latest changes
git pull

# Install new dependencies
npm install --production

# Build
npm run build

# Run migrations if any
npm run db:push

# Restart
pm2 restart secure-datavault
```

---

## 🐛 عیب‌یابی

### بررسی Logs

```bash
# PM2 logs
pm2 logs secure-datavault --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### مشکلات رایج

**1. Database connection error**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U vpn_user -d secure_datavault -h localhost
```

**2. Port already in use**
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

**3. Permission errors**
```bash
# Fix uploads directory permissions
sudo chown -R www-data:www-data /var/www/secure-datavault/uploads
sudo chmod -R 755 /var/www/secure-datavault/uploads
```

---

## 📈 بهینه‌سازی Performance

### 1. PostgreSQL Tuning

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

تنظیمات پیشنهادی (برای 2GB RAM):

```
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
```

### 2. Nginx Caching

اضافه کردن به Nginx config:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache my_cache;
    proxy_cache_valid 200 5m;
    # ... rest of config
}
```

---

## ✅ Checklist استقرار

- [ ] سرور آماده و به‌روز شده
- [ ] PostgreSQL نصب و تنظیم شده
- [ ] Database ساخته شده
- [ ] پروژه clone و build شده
- [ ] Environment variables تنظیم شده
- [ ] Admin اولیه ساخته شده
- [ ] PM2 راه‌اندازی شده
- [ ] Nginx تنظیم شده
- [ ] SSL نصب شده
- [ ] Firewall فعال شده
- [ ] Backup خودکار تنظیم شده
- [ ] Monitoring فعال شده

---

**نکته**: این راهنما برای استقرار production است. برای development از `npm run dev` استفاده کنید.
