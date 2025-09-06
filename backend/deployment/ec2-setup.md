# AWS EC2 Deployment Guide for HayProf

## Overview

This guide will help you deploy the HayProf application (Laravel backend + React frontend) to AWS EC2.

## Prerequisites

-   AWS Account with EC2 access
-   Domain name (optional but recommended)
-   SSH key pair for EC2 access

## Step 1: Create EC2 Instance

### Instance Configuration

-   **AMI**: Ubuntu Server 22.04 LTS
-   **Instance Type**: t3.medium (2 vCPU, 4 GB RAM) - minimum recommended
-   **Storage**: 20 GB gp3 SSD
-   **Security Group**: Create new with the following rules:
    -   SSH (22) - Your IP only
    -   HTTP (80) - 0.0.0.0/0
    -   HTTPS (443) - 0.0.0.0/0
    -   MySQL (3306) - Security Group only (for internal access)
    -   Custom TCP (3000) - 0.0.0.0/0 (for React dev server, can be removed in production)

### Launch Steps

1. Go to AWS EC2 Console
2. Click "Launch Instance"
3. Choose Ubuntu Server 22.04 LTS
4. Select t3.medium instance type
5. Configure storage (20 GB)
6. Create or select existing key pair
7. Configure security group as above
8. Launch instance

## Step 2: Connect to EC2 Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## Step 3: Initial Server Setup

Run the setup script (see ec2-initial-setup.sh) or follow manual steps below.

### Manual Setup Steps

#### Update System

```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for docker group to take effect
exit
```

#### Install Node.js and npm

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Step 4: Deploy Application

### Clone Repository

```bash
git clone https://github.com/elkarimareda/hayprof.git
cd hayprof
```

### Environment Configuration

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend environment
nano backend/.env
# Update database and other settings (see environment section below)

# Edit frontend environment
nano frontend/.env
# Update API URLs and other settings
```

### Environment Variables

#### Backend (.env)

```env
APP_NAME=HayProf
APP_ENV=production
APP_KEY=base64:your-app-key-here
APP_DEBUG=false
APP_URL=https://yourdomain.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=hayprof
DB_USERNAME=hayprof_user
DB_PASSWORD=your-secure-password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

#### Frontend (.env)

```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_URL=https://yourdomain.com
```

### Build and Deploy

```bash
# Build frontend
cd frontend
npm install
npm run build
cd ..

# Start Docker containers
docker-compose up -d

# Setup Laravel
docker exec hayprof-backend php artisan key:generate
docker exec hayprof-backend php artisan migrate
docker exec hayprof-backend php artisan storage:link
docker exec hayprof-backend php artisan config:cache
docker exec hayprof-backend php artisan route:cache
docker exec hayprof-backend php artisan view:cache
```

## Step 5: Configure Nginx

Create Nginx configuration (see nginx configuration files).

## Step 6: SSL Certificate (Optional but Recommended)

### Using Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

## Step 7: Configure Domain (If applicable)

1. Update your domain's DNS settings to point to your EC2 instance's public IP
2. Create an A record: yourdomain.com -> EC2_PUBLIC_IP

## Step 8: Final Checks

1. Visit your domain/IP in browser
2. Check that the React app loads
3. Test API endpoints
4. Verify database connection
5. Check logs for any errors

## Monitoring and Maintenance

### View Logs

```bash
# Application logs
docker logs hayprof-backend
docker logs hayprof-frontend

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Backup Database

```bash
docker exec hayprof-mysql mysqldump -u hayprof_user -p hayprof > backup.sql
```

### Update Application

```bash
git pull origin main
cd frontend && npm run build
docker-compose down
docker-compose up -d --build
```

## Security Recommendations

1. **Firewall**: Configure UFW
2. **SSH**: Disable password authentication, use key-based only
3. **Updates**: Set up automatic security updates
4. **Monitoring**: Set up CloudWatch monitoring
5. **Backups**: Regular database and file backups
6. **SSL**: Always use HTTPS in production

## Troubleshooting

### Common Issues

1. **Permission errors**: Check file permissions and ownership
2. **Database connection**: Verify environment variables and Docker network
3. **Build failures**: Check Node.js version and npm dependencies
4. **SSL issues**: Verify domain DNS and certificate installation

### Useful Commands

```bash
# Restart all services
docker-compose restart

# Check container status
docker ps

# View container logs
docker logs container_name

# Access container shell
docker exec -it container_name bash
```
