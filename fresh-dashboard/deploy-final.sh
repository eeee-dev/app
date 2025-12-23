#!/bin/bash
echo "Deploying to office.eeee.mu..."

# Upload all files from dist/
cd dist
for file in $(find . -type f); do
  filepath="${file#./}"
  dir=$(dirname "$filepath")
  
  if [ "$dir" != "." ]; then
    curl -s --ftp-create-dirs -T "$file" "ftp://ftp.eeee.mu/public_html/office/$filepath" --user "u384688932.david:poupS123*"
  else
    curl -s -T "$file" "ftp://ftp.eeee.mu/public_html/office/$filepath" --user "u384688932.david:poupS123*"
  fi
  echo "Uploaded: $filepath"
done

echo "Deployment complete!"
