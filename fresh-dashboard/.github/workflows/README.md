# GitHub Actions Workflows

This directory contains automated workflows for the Financial Management Dashboard.

## Available Workflows

### `deploy.yml` - Automatic Deployment
- **Trigger**: Push to `main` branch or manual trigger
- **Actions**: Build app → Deploy to FTP server
- **Requirements**: GitHub Secrets (FTP_SERVER, FTP_USERNAME, FTP_PASSWORD)

## Setup Instructions

See `README-DEPLOYMENT.md` in the project root for complete setup guide.
