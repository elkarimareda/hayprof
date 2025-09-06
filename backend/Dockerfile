FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
  git curl unzip \
  libpng-dev libonig-dev libxml2-dev libzip-dev \
  && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create working directory
WORKDIR /var/www

# Copy only composer files
COPY composer.* ./

# Install dependencies if composer.json exists
RUN if [ -f "composer.json" ]; then \
  composer install --no-scripts --no-autoloader; \
  fi

# Copy application files
COPY . .

# Finalize installation
RUN if [ -f "composer.json" ]; then \
  composer install --no-scripts --no-autoloader; \
  composer dump-autoload --optimize; \
  fi

EXPOSE 8000

# Create an entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]