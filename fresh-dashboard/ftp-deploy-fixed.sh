#!/bin/bash
FTP_HOST="ftp.eeee.mu"
FTP_USER="u384688932.david"
FTP_PASS="poupS123*"
FTP_DIR="/public_html"

echo "Deploying with correct directory structure..."
cd dist

# First, upload index.html to root
echo "Uploading index.html..."
curl -T index.html ftp://${FTP_HOST}${FTP_DIR}/ --user ${FTP_USER}:${FTP_PASS}

# Create assets directory and upload all files
echo "Creating assets directory..."
curl -Q "MKD ${FTP_DIR}/assets" ftp://${FTP_HOST}/ --user ${FTP_USER}:${FTP_PASS} 2>/dev/null

echo "Uploading all asset files..."
cd assets
for file in *; do
    if [ -f "$file" ]; then
        echo "  Uploading assets/$file..."
        curl -T "$file" ftp://${FTP_HOST}${FTP_DIR}/assets/ --user ${FTP_USER}:${FTP_PASS}
    fi
done
cd ..

# Upload other root files
for file in favicon.svg robots.txt _redirects; do
    if [ -f "$file" ]; then
        echo "Uploading $file..."
        curl -T "$file" ftp://${FTP_HOST}${FTP_DIR}/ --user ${FTP_USER}:${FTP_PASS}
    fi
done

echo "Deployment complete!"
