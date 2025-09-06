#!/bin/bash

# EC2 Initial Setup Script for HayProf Application
# Run this script on a fresh Ubuntu 22.04 EC2 instance

set -e  # Exit on any error

echo "🚀 Starting EC2 setup for HayProf application..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
sudo apt install -y curl wget git unzip vim htop

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
rm get-docker.sh

# Install Docker Compose
echo "🔨 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx

# Install Certbot for SSL
echo "🔒 Installing Certbot for SSL certificates..."
sudo apt install certbot python3-certbot-nginx -y

# Configure UFW firewall
echo "🔥 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/hayprof
sudo chown ubuntu:ubuntu /var/www/hayprof

# Configure Git (optional)
echo "⚙️ Configuring Git..."
read -p "Enter your Git username (optional): " git_username
read -p "Enter your Git email (optional): " git_email

if [[ ! -z "$git_username" ]]; then
    git config --global user.name "$git_username"
fi

if [[ ! -z "$git_email" ]]; then
    git config --global user.email "$git_email"
fi

# Set up log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/hayprof > /dev/null <<EOF
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# Create swap file (if not exists)
echo "💾 Setting up swap file..."
if [[ ! -f /swapfile ]]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Install additional monitoring tools
echo "📊 Installing monitoring tools..."
sudo apt install -y htop iotop nethogs

# Display installation summary
echo "✅ EC2 setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "  - System updated"
echo "  - Docker & Docker Compose installed"
echo "  - Node.js 18 installed"
echo "  - Nginx installed and enabled"
echo "  - Certbot installed"
echo "  - UFW firewall configured"
echo "  - Application directory created: /var/www/hayprof"
echo "  - Log rotation configured"
echo "  - Swap file created (2GB)"
echo ""
echo "⚠️  IMPORTANT: You need to logout and login again for Docker group permissions to take effect!"
echo ""
echo "🚀 Next steps:"
echo "  1. Logout and login again: exit"
echo "  2. Clone your repository: cd /var/www/hayprof && git clone <your-repo-url> ."
echo "  3. Configure environment files"
echo "  4. Run the deployment script"
echo ""
