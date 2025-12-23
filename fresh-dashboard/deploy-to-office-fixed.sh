#!/bin/bash

# FTP Configuration
FTP_HOST="ftp.eeee.mu"
FTP_USER="u384688932.david"
FTP_PASS="poupS123*"
REMOTE_DIR="/public_html/office"

echo "Starting deployment to ${REMOTE_DIR}..."

cd dist

# Upload index.html with --ftp-create-dirs flag
echo "Uploading index.html..."
curl -T index.html "ftp://${FTP_HOST}${REMOTE_DIR}/" --user "${FTP_USER}:${FTP_PASS}" --ftp-create-dirs

# Upload all assets
echo "Uploading assets..."
for file in assets/*; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "  - $filename"
        curl -T "$file" "ftp://${FTP_HOST}${REMOTE_DIR}/assets/" --user "${FTP_USER}:${FTP_PASS}" --ftp-create-dirs
    fi
done

# Upload other files
for file in /images/photo1766526592.jpg robots.txt _redirects; do
    if [ -f "$file" ]; then
        echo "Uploading $file..."
        curl -T "$file" "ftp://${FTP_HOST}${REMOTE_DIR}/" --user "${FTP_USER}:${FTP_PASS}" --ftp-create-dirs
    fi
done

echo "Deployment to ${REMOTE_DIR} complete!"
echo ""
echo "Your application is now available at: https://office.eeee.mu"
echo "Please clear your browser cache (Ctrl+Shift+R) and try logging in!"