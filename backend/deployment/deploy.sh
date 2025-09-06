#!/bin/bash

# Deployment script for HayProf application
# Run this after the initial EC2 setup is complete

set -e  # Exit on any error

echo "🚀 Starting HayProf deployment..."

# Check if we're in the right directory
if [[ ! -f "docker-compose.yml" ]]; then
    echo "❌ Error: docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi

# Check if environment files exist
if [[ ! -f "backend/.env" ]]; then
    echo "⚠️  Backend .env file not found. Creating from example..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env file with your configuration before continuing."
    read -p "Press Enter when you've configured backend/.env..."
fi

if [[ ! -f "frontend/.env" ]]; then
    echo "⚠️  Frontend .env file not found. Creating from example..."
    cp frontend/.env.example frontend/.env
    echo "📝 Please edit frontend/.env file with your configuration before continuing."
    read -p "Press Enter when you've configured frontend/.env..."
fi

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose down --remove-orphans || true
docker-compose up -d --build

# Wait for containers to be ready
echo "⏳ Waiting for containers to be ready..."
sleep 30

# Generate Laravel application key if not set
echo "🔑 Generating Laravel application key..."
docker exec hayprof-backend php artisan key:generate --force

# Run database migrations
echo "🗄️  Running database migrations..."
docker exec hayprof-backend php artisan migrate --force

# Create storage link
echo "🔗 Creating storage link..."
docker exec hayprof-backend php artisan storage:link

# Cache configuration
echo "⚡ Caching configuration..."
docker exec hayprof-backend php artisan config:cache
docker exec hayprof-backend php artisan route:cache
docker exec hayprof-backend php artisan view:cache

# Set proper permissions
echo "🔐 Setting proper permissions..."
docker exec hayprof-backend chown -R www-data:www-data /var/www/html/storage
docker exec hayprof-backend chown -R www-data:www-data /var/www/html/bootstrap/cache

# Display status
echo "📊 Checking container status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your application should now be accessible at:"
echo "  - Frontend: http://$(curl -s ifconfig.me):80"
echo "  - Backend API: http://$(curl -s ifconfig.me):80/api"
echo ""
echo "📋 Next steps:"
echo "  1. Configure Nginx reverse proxy (see nginx-config.conf)"
echo "  2. Set up SSL certificate with Let's Encrypt"
echo "  3. Configure your domain DNS"
echo "  4. Test all application features"
echo ""
echo "🔍 Useful commands:"
echo "  - View logs: docker logs hayprof-backend"
echo "  - Restart containers: docker-compose restart"
echo "  - Update app: git pull && ./deployment/deploy.sh"
echo ""
