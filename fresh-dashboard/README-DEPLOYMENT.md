# 🚀 Auto-Deployment Setup Guide

This project is configured for **automatic deployment** to your FTP server using GitHub Actions.

## 📋 Prerequisites

1. **GitHub Repository** - Your code must be in a GitHub repository
2. **FTP Server Access** - Your hosting provider's FTP credentials
3. **GitHub Account** - With access to repository settings

## 🔧 Setup Instructions

### Step 1: Push Code to GitHub

If you haven't already, create a GitHub repository and push your code:

```bash
cd /workspace/fresh-dashboard

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit with auto-deployment setup"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following:

| Secret Name | Value | Example |
|------------|-------|---------|
| `FTP_SERVER` | Your FTP server address | `ftp.eeee.mu` or `185.xxx.xxx.xxx` |
| `FTP_USERNAME` | Your FTP username | `your_ftp_username` |
| `FTP_PASSWORD` | Your FTP password | `your_ftp_password` |

**⚠️ Important:** Keep these credentials secret! Never commit them to your code.

### Step 3: Configure FTP Server Directory (Optional)

If your FTP server requires a specific directory path:

1. Open `.github/workflows/deploy.yml`
2. Find the line: `server-dir: ./`
3. Change it to your target directory, e.g., `server-dir: /public_html/` or `server-dir: /htdocs/`

## 🎯 How It Works

### Automatic Deployment Trigger

Every time you push code to the `main` branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

GitHub Actions will automatically:
1. ✅ Install dependencies (`pnpm install`)
2. ✅ Build the application (`pnpm run build`)
3. ✅ Deploy to your FTP server
4. ✅ Your app is live at https://app.eeee.mu

### Manual Deployment Trigger

You can also trigger deployment manually:

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **Build and Deploy to FTP** workflow
4. Click **Run workflow** → **Run workflow**

## 📊 Monitoring Deployments

### View Deployment Status

1. Go to **Actions** tab in your GitHub repository
2. Click on the latest workflow run
3. View real-time deployment logs

### Deployment Notifications

- ✅ **Success**: Green checkmark appears on your commit
- ❌ **Failure**: Red X appears - click to view error logs

## 🔄 Current Deployment Methods

### Method 1: GitHub Actions (Automatic) ⭐ Recommended
```bash
git push origin main
# Automatically builds and deploys
```

### Method 2: Manual FTP Deployment (Backup)
```bash
cd /workspace/fresh-dashboard
pnpm run build
python deploy-ftp.py
```

## 🛠️ Troubleshooting

### Deployment Fails

**Check these common issues:**

1. **FTP Credentials** - Verify secrets are correct in GitHub Settings
2. **FTP Server Path** - Ensure `server-dir` in `deploy.yml` is correct
3. **FTP Port** - Default is 21, some servers use 22 (SFTP)
4. **Build Errors** - Check if `pnpm run build` succeeds locally

### View Error Logs

1. Go to **Actions** tab
2. Click the failed workflow run
3. Expand the failed step to see error details

### Test FTP Connection

```bash
# Test FTP connection manually
ftp ftp.eeee.mu
# Enter username and password
# If connection fails, contact your hosting provider
```

## 📝 Workflow File Location

- **Workflow**: `.github/workflows/deploy.yml`
- **Modify**: Edit this file to customize deployment behavior

## 🔐 Security Best Practices

1. ✅ **Never commit FTP credentials** to your code
2. ✅ **Use GitHub Secrets** for all sensitive data
3. ✅ **Enable 2FA** on your GitHub account
4. ✅ **Rotate FTP passwords** regularly
5. ✅ **Use SFTP** instead of FTP if available (more secure)

## 🎉 Benefits of Auto-Deployment

- ⚡ **Instant Updates** - Push code, it goes live automatically
- 🔄 **Consistent Builds** - Same build process every time
- 📊 **Deployment History** - Track every deployment in GitHub Actions
- 🚫 **No Manual Steps** - Eliminate human error
- 👥 **Team Collaboration** - Multiple developers can deploy safely

## 📞 Support

If you encounter issues:

1. Check GitHub Actions logs for error details
2. Verify FTP credentials with your hosting provider
3. Test manual deployment: `python deploy-ftp.py`
4. Contact your hosting provider for FTP server issues

---

## 🚀 Quick Start Checklist

- [ ] Push code to GitHub repository
- [ ] Add `FTP_SERVER` secret in GitHub Settings
- [ ] Add `FTP_USERNAME` secret in GitHub Settings
- [ ] Add `FTP_PASSWORD` secret in GitHub Settings
- [ ] Push a commit to `main` branch
- [ ] Check Actions tab for deployment status
- [ ] Visit https://app.eeee.mu to verify deployment

**That's it! Your app now deploys automatically on every push to GitHub.** 🎉