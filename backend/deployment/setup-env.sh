#!/bin/bash

# Production Environment Setup for HayProf
# This script sets up production environment variables

set -e

echo "⚙️ Setting up production environment..."

# Check if we're in the right directory (project root with backend and frontend folders)
if [[ ! -d "backend" ]] || [[ ! -d "frontend" ]]; then
    echo "❌ Error: This script must be run from the project root directory."
    echo "   Current directory: $(pwd)"
    echo "   Expected structure: project-root/backend/ and project-root/frontend/"
    echo "   Please run: cd /path/to/project-root && ./backend/deployment/setup-env.sh"
    exit 1
fi

# Function to generate random password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Function to generate app key
generate_app_key() {
    openssl rand -base64 32
}

# Collect domain information
read -p "Enter your domain name [hayprof.com]: " DOMAIN
DOMAIN=${DOMAIN:-hayprof.com}
read -p "Enter your admin email [admin@hayprof.com]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@hayprof.com}

# Generate secure passwords
DB_PASSWORD=$(generate_password)
DB_ROOT_PASSWORD=$(generate_password)
APP_KEY="base64:$(generate_app_key)"

# Create backend .env file
echo "📝 Creating backend .env file..."
cat > backend/.env << EOF
APP_NAME=HayProf
APP_ENV=production
APP_KEY=$APP_KEY
APP_DEBUG=false
APP_URL=https://$DOMAIN

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=hayprof
DB_USERNAME=hayprof_user
DB_PASSWORD=$DB_PASSWORD

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
MAIL_HOST=localhost
MAIL_PORT=587
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@$DOMAIN"
MAIL_FROM_NAME="HayProf"

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

VITE_PUSHER_APP_KEY="\${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="\${PUSHER_HOST}"
VITE_PUSHER_PORT="\${PUSHER_PORT}"
VITE_PUSHER_SCHEME="\${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="\${PUSHER_APP_CLUSTER}"
EOF

# Create frontend .env file
echo "📝 Creating frontend .env file..."
cat > frontend/.env << EOF
VITE_API_URL=https://$DOMAIN/api
VITE_APP_URL=https://$DOMAIN
EOF

# Create deployment .env file for Docker Compose
echo "📝 Creating deployment .env file..."
cat > .env << EOF
DB_PASSWORD=$DB_PASSWORD
DB_ROOT_PASSWORD=$DB_ROOT_PASSWORD
DOMAIN=$DOMAIN
ADMIN_EMAIL=$ADMIN_EMAIL
EOF

# Set proper permissions
chmod 600 backend/.env frontend/.env .env

echo "✅ Production environment setup completed!"
echo ""
echo "🔐 Generated secure passwords (save these safely):"
echo "  Database Password: $DB_PASSWORD"
echo "  Root Password: $DB_ROOT_PASSWORD"
echo "  App Key: $APP_KEY"
echo ""
echo "⚠️  IMPORTANT: Save these passwords in a secure location!"
echo ""
echo "📁 Environment files created:"
echo "  - backend/.env"
echo "  - frontend/.env"
echo "  - .env (for Docker Compose)"
echo ""
echo "🚀 Next steps:"
echo "  1. Review and customize the environment files if needed"
echo "  2. Run the deployment script: ./deployment/deploy.sh"
echo "  3. Configure SSL: ./deployment/setup-ssl.sh $DOMAIN"
echo ""
