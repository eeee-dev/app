#!/bin/bash

# FTP Configuration
FTP_HOST="ftp.eeee.mu"
FTP_USER="u335245997"
FTP_PASS="Eeeemu2025"
REMOTE_DIR="/public_html/office"

echo "Starting deployment to $REMOTE_DIR..."

# Upload index.html
echo "Uploading index.html..."
curl --ftp-create-dirs -T "dist/index.html" \
  "ftp://${FTP_HOST}${REMOTE_DIR}/" \
  --user "${FTP_USER}:${FTP_PASS}"

# Upload all assets
echo "Uploading assets..."
for file in dist/assets/*; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    echo "  - $filename"
    curl -T "$file" \
      "ftp://${FTP_HOST}${REMOTE_DIR}/assets/" \
      --user "${FTP_USER}:${FTP_PASS}"
  fi
done

# Upload robots.txt if exists
if [ -f "dist/robots.txt" ]; then
  echo "Uploading robots.txt..."
  curl -T "dist/robots.txt" \
    "ftp://${FTP_HOST}${REMOTE_DIR}/" \
    --user "${FTP_USER}:${FTP_PASS}"
fi

# Upload _redirects if exists
if [ -f "dist/_redirects" ]; then
  echo "Uploading _redirects..."
  curl -T "dist/_redirects" \
    "ftp://${FTP_HOST}${REMOTE_DIR}/" \
    --user "${FTP_USER}:${FTP_PASS}"
fi

echo "Deployment to $REMOTE_DIR complete!"
echo ""
echo "Your application is now available at: https://eeee.mu/office"
echo "Please clear your browser cache (Ctrl+Shift+R) and test the application!"