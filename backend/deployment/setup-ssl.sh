#!/bin/bash

# SSL Setup Script for HayProf Application
# Run this after domain DNS is configured

set -e

echo "🔒 Setting up SSL certificate with Let's Encrypt..."

# Check if domain is provided
if [[ -z "$1" ]]; then
    read -p "Enter your domain name [hayprof.com]: " DOMAIN
    DOMAIN=${DOMAIN:-hayprof.com}
else
    DOMAIN=$1
fi

if [[ -z "$DOMAIN" ]]; then
    echo "❌ Error: Domain name is required"
    exit 1
fi

echo "🌐 Setting up SSL for domain: $DOMAIN"

# Update Nginx configuration with actual domain
echo "📝 Updating Nginx configuration..."
sudo sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/hayprof

# Test Nginx configuration
echo "🔧 Testing Nginx configuration..."
sudo nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

# Obtain SSL certificate
echo "🔒 Obtaining SSL certificate..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Set up auto-renewal
echo "⏰ Setting up auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test auto-renewal
echo "🧪 Testing auto-renewal..."
sudo certbot renew --dry-run

echo "✅ SSL setup completed successfully!"
echo ""
echo "🌐 Your site should now be accessible at:"
echo "  https://$DOMAIN"
echo ""
echo "📝 SSL certificate will auto-renew every 60 days"
echo "📊 Check renewal status: sudo certbot certificates"
