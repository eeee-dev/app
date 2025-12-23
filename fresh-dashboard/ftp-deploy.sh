#!/bin/bash

# FTP credentials
FTP_HOST="ftp.eeee.mu"
FTP_USER="u384688932.david"
FTP_PASS="poupS123*"
FTP_DIR="/public_html"

echo "Starting FTP deployment to office.eeee.mu..."

# Install lftp if not available
if ! command -v lftp &> /dev/null; then
    echo "Installing lftp..."
    apt-get update -qq && apt-get install -y lftp
fi

# Deploy using lftp
lftp -c "
set ftp:ssl-allow no
open -u $FTP_USER,$FTP_PASS $FTP_HOST
lcd dist
cd $FTP_DIR
mirror --reverse --delete --verbose --parallel=10
bye
"

echo "Deployment complete! Your app should now be live at https://office.eeee.mu"
