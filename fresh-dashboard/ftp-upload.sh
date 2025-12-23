#!/bin/bash

FTP_HOST="ftp.eeee.mu"
FTP_USER="u384688932.david"
FTP_PASS="poupS123*"
FTP_DIR="/public_html"

echo "Starting FTP deployment..."

# Use curl for FTP upload (more reliable in containers)
cd dist

# Upload index.html
echo "Uploading index.html..."
curl -T index.html ftp://${FTP_HOST}${FTP_DIR}/ --user ${FTP_USER}:${FTP_PASS}

# Upload all files in assets directory
echo "Uploading assets..."
for file in assets/*; do
    if [ -f "$file" ]; then
        curl -T "$file" ftp://${FTP_HOST}${FTP_DIR}/assets/ --user ${FTP_USER}:${FTP_PASS} --ftp-create-dirs
    fi
done

# Upload other files
for file in favicon.svg robots.txt _redirects; do
    if [ -f "$file" ]; then
        echo "Uploading $file..."
        curl -T "$file" ftp://${FTP_HOST}${FTP_DIR}/ --user ${FTP_USER}:${FTP_PASS}
    fi
done

echo "Deployment complete!"
