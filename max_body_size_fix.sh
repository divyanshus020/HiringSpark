#!/bin/bash

# Script to increase Nginx client_max_body_size to 100M
# Usage: sudo ./max_body_size_fix.sh

NGINX_CONF="/etc/nginx/nginx.conf"
MAX_SIZE="100M"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (sudo ./max_body_size_fix.sh)"
  exit 1
fi

echo "Checking Nginx configuration at $NGINX_CONF..."

if [ ! -f "$NGINX_CONF" ]; then
    echo "Error: $NGINX_CONF not found. Please verify Nginx installation."
    exit 1
fi

# Backup
cp "$NGINX_CONF" "$NGINX_CONF.backup_$(date +%F_%T)"
echo "Backup created."

# Check if client_max_body_size exists in http block context
# This simple grep might find it in comments or other scopes, but sed will replace the first occurrence globally or we just attempt to insert if not found.
# A more robust approach:
if grep -q "client_max_body_size" "$NGINX_CONF"; then
    echo "Updating client_max_body_size..."
    sed -i "s/client_max_body_size .*/client_max_body_size $MAX_SIZE;/" "$NGINX_CONF"
else
    echo "Adding client_max_body_size to http block..."
    # Insert after 'http {'
    sed -i "/http {/a \    client_max_body_size $MAX_SIZE;" "$NGINX_CONF"
fi

# Also check sites-enabled for specific server overrides and list them
echo "Checking sites-enabled for overrides..."
grep -r "client_max_body_size" /etc/nginx/sites-enabled/ || echo "No overrides found in sites-enabled."

echo "Testing Nginx config..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Configuration valid. Restarting Nginx..."
    systemctl restart nginx
    echo "Done! Upload info: 100M limit apply."
else
    echo "Config check failed. Please check errors above."
    exit 1
fi
