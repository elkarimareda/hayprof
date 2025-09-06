# 🌐 HayProf.com Deployment Guide

## 🚀 Quick Deployment for hayprof.com

### Prerequisites
- AWS EC2 account
- Domain `hayprof.com` with DNS access
- SSH key pair

## Step 1: Create EC2 Instance

### AWS Console Setup
1. **Launch Instance**: Ubuntu 22.04 LTS
2. **Instance Type**: t3.medium (2 vCPU, 4GB RAM)
3. **Storage**: 20GB gp3 SSD
4. **Security Group**: 
   - SSH (22) - Your IP
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0
5. **Key Pair**: Create or select existing

## Step 2: Configure DNS

### Point hayprof.com to EC2
1. Get your EC2 public IP address
2. Create DNS A records:
   ```
   hayprof.com         A    YOUR_EC2_IP
   www.hayprof.com     A    YOUR_EC2_IP
   ```

## Step 3: Deploy Application

### Connect to EC2
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### Run Automated Setup
```bash
# Download and run initial setup
curl -O https://raw.githubusercontent.com/elkarimareda/hayprof/main/deployment/ec2-initial-setup.sh
chmod +x ec2-initial-setup.sh
./ec2-initial-setup.sh

# Logout and login again for Docker permissions
exit
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### Deploy HayProf
```bash
# Clone repository
cd /var/www/hayprof
git clone https://github.com/elkarimareda/hayprof.git .

# Setup environment (will default to hayprof.com)
./deployment/setup-env.sh

# Deploy application
./deployment/deploy.sh
```

### Setup SSL Certificate
```bash
# This will automatically use hayprof.com
./deployment/setup-ssl.sh
```

## Step 4: Verify Deployment

### Check Services
```bash
# Verify containers are running
docker ps

# Check application logs
docker logs hayprof-backend
docker logs hayprof-nginx

# Test website
curl -I https://hayprof.com
```

### Access Your Site
- **Frontend**: https://hayprof.com
- **API**: https://hayprof.com/api
- **Admin Panel**: https://hayprof.com/admin (if implemented)

## Production Configuration

### Environment Files Created
```
backend/.env          # Laravel configuration
frontend/.env         # React configuration  
.env                  # Docker Compose secrets
```

### Nginx Configuration
- Serves React app from root
- Proxies API requests to Laravel
- SSL termination
- Gzip compression
- Security headers

### Database
- MySQL 8.0 container
- Persistent data volumes
- Secure credentials
- Auto-backup ready

## Monitoring & Maintenance

### Regular Tasks
```bash
# Update application
cd /var/www/hayprof
git pull origin main
./deployment/deploy.sh

# View logs
docker logs -f hayprof-backend
sudo tail -f /var/log/nginx/access.log

# Backup database
docker exec hayprof-mysql mysqldump -u hayprof_user -p hayprof > backup_$(date +%Y%m%d).sql
```

### SSL Certificate
- Auto-renews every 60 days
- Check status: `sudo certbot certificates`
- Manual renewal: `sudo certbot renew`

### Security
- UFW firewall enabled
- Regular security updates
- Secure password generation
- HTTPS enforced

## Troubleshooting

### Common Issues
```bash
# Container won't start
docker logs hayprof-backend

# SSL not working
sudo certbot certificates
sudo nginx -t

# Database connection error
docker exec -it hayprof-mysql mysql -u hayprof_user -p

# Check disk space
df -h

# Check memory usage
free -h
```

### Support
- Application logs: `/var/log/nginx/`
- Container logs: `docker logs <container>`
- System logs: `journalctl -f`

## Cost Estimate
- **EC2 t3.medium**: ~$30/month
- **20GB Storage**: ~$2/month
- **Bandwidth**: ~$1-5/month
- **Total**: ~$35-40/month

---

**🎉 Your HayProf application is now live at https://hayprof.com!**

### Next Steps:
1. Test all functionality
2. Set up monitoring (CloudWatch)
3. Configure automated backups
4. Set up CI/CD pipeline
5. Monitor performance and scale as needed
