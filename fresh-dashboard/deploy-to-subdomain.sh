#!/bin/bash
echo "Deploying to app.eeee.mu..."

# Upload all files from dist/
cd dist
for file in $(find . -type f -name "*" ! -name "*.png" ! -name "*.jpg" ! -name "*.jpeg"); do
  filepath="${file#./}"
  dir=$(dirname "$filepath")
  
  if [ "$dir" != "." ]; then
    curl -s --ftp-create-dirs -T "$file" "ftp://ftp.eeee.mu/public_html/app/$filepath" --user "u384688932.david:poupS123*"
  else
    curl -s -T "$file" "ftp://ftp.eeee.mu/public_html/app/$filepath" --user "u384688932.david:poupS123*"
  fi
  echo "✓ Uploaded: $filepath"
done

# Upload image files separately
for file in $(find . -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \)); do
  filepath="${file#./}"
  dir=$(dirname "$filepath")
  
  if [ "$dir" != "." ]; then
    curl -s --ftp-create-dirs -T "$file" "ftp://ftp.eeee.mu/public_html/app/$filepath" --user "u384688932.david:poupS123*"
  else
    curl -s -T "$file" "ftp://ftp.eeee.mu/public_html/app/$filepath" --user "u384688932.david:poupS123*"
  fi
  echo "✓ Uploaded: $filepath"
done

echo ""
echo "=========================================="
echo "Deployment complete!"
echo "Your app is now live at: https://app.eeee.mu"
echo "=========================================="
