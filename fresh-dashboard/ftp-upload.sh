#!/bin/bash

# FTP Configuration
FTP_HOST="ftp.eeee.mu"
FTP_USER="office@eeee.mu"
FTP_PASS="9xDragon!"
REMOTE_DIR="/public_html/office"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting deployment to ${FTP_HOST}${REMOTE_DIR}...${NC}"

# Upload index.html
echo "Uploading index.html..."
curl -T "dist/index.html" "ftp://${FTP_HOST}${REMOTE_DIR}/" --user "${FTP_USER}:${FTP_PASS}"

# Upload assets directory
echo "Uploading assets..."
for file in dist/assets/*; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "Uploading $filename..."
        curl -T "$file" "ftp://${FTP_HOST}${REMOTE_DIR}/assets/" --user "${FTP_USER}:${FTP_PASS}"
    fi
done

# Upload logo files
echo "Uploading logo files..."
curl -T "dist/assets/e_logo.png" "ftp://${FTP_HOST}${REMOTE_DIR}/assets/" --user "${FTP_USER}:${FTP_PASS}"

# Upload favicon
echo "Uploading /images/favicon.jpg..."
curl -T "/images/favicon.jpg" "ftp://${FTP_HOST}${REMOTE_DIR}/" --user "${FTP_USER}:${FTP_PASS}"

# Upload robots.txt
echo "Uploading robots.txt..."
curl -T "dist/robots.txt" "ftp://${FTP_HOST}${REMOTE_DIR}/" --user "${FTP_USER}:${FTP_PASS}"

# Upload _redirects for SPA routing
echo "Uploading _redirects..."
curl -T "dist/_redirects" "ftp://${FTP_HOST}${REMOTE_DIR}/" --user "${FTP_USER}:${FTP_PASS}"

echo -e "${GREEN}Deployment complete!${NC}"