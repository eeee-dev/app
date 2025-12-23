#!/bin/bash
FTP_HOST="ftp.eeee.mu"
FTP_USER="u384688932.david"
FTP_PASS="poupS123*"

echo "Checking FTP directory structure..."
curl -s --list-only ftp://${FTP_HOST}/public_html/ --user ${FTP_USER}:${FTP_PASS} | head -20
echo ""
echo "Checking assets directory..."
curl -s --list-only ftp://${FTP_HOST}/public_html/assets/ --user ${FTP_USER}:${FTP_PASS} | head -20
