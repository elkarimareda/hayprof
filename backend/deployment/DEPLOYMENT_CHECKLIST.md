# 🚀 Quick Deployment Checklist

## Before You Start

-   [ ] AWS Account with EC2 access
-   [ ] Domain name (optional but recommended)
-   [ ] SSH key pair for EC2

## Step 1: Create EC2 Instance

-   [ ] Launch Ubuntu 22.04 LTS instance (t3.medium minimum)
-   [ ] Configure security group (SSH, HTTP, HTTPS)
-   [ ] Download/save your key pair

## Step 2: Initial Server Setup

```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Upload and run initial setup script
wget https://raw.githubusercontent.com/yourusername/hayprof/main/deployment/ec2-initial-setup.sh
chmod +x ec2-initial-setup.sh
./ec2-initial-setup.sh

# Logout and login again for Docker permissions
exit
ssh -i your-key.pem ubuntu@your-ec2-ip
```

## Step 3: Deploy Application

```bash
# Clone repository
cd /var/www/hayprof
git clone https://github.com/yourusername/hayprof.git .

# Setup environment
./deployment/setup-env.sh

# Deploy application
./deployment/deploy.sh
```

## Step 4: Configure Domain & SSL

```bash
# Point your domain to EC2 IP address in DNS settings
# Then run SSL setup
./deployment/setup-ssl.sh yourdomain.com
```

## Step 5: Final Verification

-   [ ] Visit https://yourdomain.com
-   [ ] Test user registration/login
-   [ ] Test course creation
-   [ ] Check all API endpoints work
-   [ ] Verify file uploads work

## Production Checklist

-   [ ] SSL certificate installed and working
-   [ ] Database backups configured
-   [ ] Monitoring set up
-   [ ] Log rotation configured
-   [ ] Security groups properly configured
-   [ ] Regular security updates scheduled

## Useful Commands

### Application Management

```bash
# View application logs
docker logs hayprof-backend
docker logs hayprof-nginx

# Restart application
docker-compose restart

# Update application
git pull origin main
./deployment/deploy.sh

# Database backup
docker exec hayprof-mysql mysqldump -u hayprof_user -p hayprof > backup.sql
```

### Server Management

```bash
# Check system resources
htop
df -h
free -h

# Check nginx status
sudo systemctl status nginx

# View nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# SSL certificate status
sudo certbot certificates
```

## Troubleshooting

### Common Issues

1. **Container won't start**: Check logs with `docker logs container_name`
2. **Database connection error**: Verify environment variables and container network
3. **SSL issues**: Ensure domain DNS is properly configured
4. **Permission errors**: Check file ownership and permissions

### Getting Help

-   Check application logs: `docker logs hayprof-backend`
-   Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
-   Check container status: `docker ps`
-   Check system resources: `htop` or `free -h`
