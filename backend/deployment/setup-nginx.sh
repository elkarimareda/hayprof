#!/bin/bash

# Nginx Setup Script for HayProf
# This script configures Nginx for hayprof.com with SSL termination

set -e

echo "🌐 Setting up Nginx for HayProf..."

# Check if we're in the right directory
if [[ ! -f "backend/deployment/nginx-config.conf" ]]; then
    echo "❌ Error: nginx-config.conf not found. Please run this script from the project root directory."
    echo "   Current directory: $(pwd)"
    echo "   Expected path: backend/deployment/nginx-config.conf"
    exit 1
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt update
    sudo apt install nginx -y
    sudo systemctl enable nginx
else
    echo "✅ Nginx is already installed"
fi

# Get domain name (default to hayprof.com)
DOMAIN=${1:-hayprof.com}
echo "🌍 Configuring Nginx for domain: $DOMAIN"

# Create a temporary config file with the correct domain
TEMP_CONFIG="/tmp/nginx-hayprof.conf"
cp backend/deployment/nginx-config.conf "$TEMP_CONFIG"

# If domain is not hayprof.com, replace it in the config
if [[ "$DOMAIN" != "hayprof.com" ]]; then
    sed -i "s/hayprof\.com/$DOMAIN/g" "$TEMP_CONFIG"
fi

# Copy the Nginx configuration
echo "📋 Copying Nginx configuration..."
sudo cp "$TEMP_CONFIG" /etc/nginx/sites-available/hayprof

# Clean up temp file
rm "$TEMP_CONFIG"

# Remove default site
echo "🗑️  Removing default Nginx site..."
sudo rm -f /etc/nginx/sites-enabled/default

# Enable the hayprof site
echo "🔗 Enabling HayProf site..."
sudo ln -sf /etc/nginx/sites-available/hayprof /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi

# Start/reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl start nginx
sudo systemctl reload nginx

# Check Nginx status
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running successfully"
else
    echo "❌ Nginx failed to start"
    sudo systemctl status nginx
    exit 1
fi

echo ""
echo "🎉 Nginx setup completed successfully!"
echo ""
echo "📋 Configuration details:"
echo "  - Domain: $DOMAIN"
echo "  - Document root: /var/www/hayprof/frontend/dist"
echo "  - API proxy: http://localhost:8000"
echo "  - SSL certificates: /etc/letsencrypt/live/$DOMAIN/"
echo ""
echo "🚀 Next steps:"
echo "  1. Make sure your application is running: docker-compose up -d"
echo "  2. Setup SSL certificate: ./backend/deployment/setup-ssl.sh $DOMAIN"
echo "  3. Point your domain DNS to this server's IP address"
echo ""
