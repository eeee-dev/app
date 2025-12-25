# Automatic Deployment Setup Guide

This guide explains how to set up automatic deployment for the Financial Management Dashboard using GitHub Actions.

## Overview

Every time you push code to the `main` branch, GitHub Actions will automatically:
1. Install dependencies
2. Build the production app
3. Deploy to https://app.eeee.mu via FTP

## Setup Instructions

### Step 1: Push Code to GitHub

```bash
cd /workspace/fresh-dashboard
git add .
git commit -m "Add budget integration and auto-deployment"
git push origin main
```

### Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these three secrets:

| Secret Name | Value |
|------------|-------|
| `FTP_SERVER` | `ftp.eeee.mu` |
| `FTP_USERNAME` | `u384688932.davidnew` |
| `FTP_PASSWORD` | `poupS123*` |

### Step 3: Enable GitHub Actions

1. Go to your repository's **Actions** tab
2. If prompted, click "I understand my workflows, go ahead and enable them"

## How It Works

### Automatic Deployment
- **Trigger**: Every push to `main` branch
- **Duration**: ~3-5 minutes
- **Result**: Updated app at https://app.eeee.mu

### Manual Deployment
1. Go to **Actions** tab
2. Select **Deploy to FTP** workflow
3. Click **Run workflow** button
4. Click **Run workflow** to confirm

## Workflow File

The workflow is defined in `.github/workflows/deploy.yml`:

- Uses Ubuntu latest runner
- Node.js 18
- NPM for dependency management
- FTP-Deploy-Action for file transfer

## Troubleshooting

### Build Fails
- Check that `package.json` scripts are correct
- Verify all dependencies are in `package.json`
- Review build logs in Actions tab

### Deployment Fails
- Verify FTP credentials in GitHub Secrets
- Check FTP server is accessible
- Confirm server directory path is correct

### Files Not Updating
- Clear browser cache
- Check FTP server for uploaded files
- Verify `dist/` directory contains built files

## Security Notes

- Never commit FTP credentials to the repository
- Use GitHub Secrets for sensitive data
- The `.gitignore` file excludes `.env` and sensitive files

## Manual Deployment (Alternative)

If you need to deploy manually without GitHub Actions:

```bash
# Build the app
npm run build

# Deploy via FTP (requires lftp)
lftp -e "mirror -R dist/ /home/u384688932/domains/eeee.mu/public_html/app/; quit" -u u384688932.davidnew,poupS123* ftp.eeee.mu
```

## Next Steps

After setup is complete:
1. Make a test change to verify auto-deployment works
2. Monitor the Actions tab for deployment status
3. Check https://app.eeee.mu to see your changes live

## Support

If you encounter issues:
- Review GitHub Actions logs for error messages
- Check FTP server logs
- Verify all secrets are correctly configured