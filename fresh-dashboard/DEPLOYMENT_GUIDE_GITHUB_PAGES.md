# 🚀 GitHub Pages Deployment Guide

## Prerequisites
- GitHub account
- Git installed on your local machine
- Repository created on GitHub

## Step-by-Step Deployment Instructions

### 1. Initialize Git Repository (if not already done)
```bash
cd /workspace/shadcn-ui
git init
git add .
git commit -m "Initial commit: Financial Dashboard"
```

### 2. Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository named `shadcn-ui` (or your preferred name)
3. **Do NOT** initialize with README, .gitignore, or license
4. Copy the repository URL

### 3. Link Local Repository to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/shadcn-ui.git
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Source: **GitHub Actions**
5. Click **Save**

### 5. Configure Repository Settings
The deployment workflow is already configured in `.github/workflows/deploy.yml`

**Important Configuration Files:**
- ✅ `vite.config.ts` - Updated with `base: '/shadcn-ui/'`
- ✅ `.github/workflows/deploy.yml` - GitHub Actions workflow
- ✅ Build configuration optimized

### 6. Trigger Deployment
**Option A: Automatic Deployment (Recommended)**
```bash
# Make any change and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

**Option B: Manual Deployment**
1. Go to your repository on GitHub
2. Click **Actions** tab
3. Click **Deploy to GitHub Pages** workflow
4. Click **Run workflow** button
5. Select branch: `main`
6. Click **Run workflow**

### 7. Monitor Deployment
1. Go to **Actions** tab in your repository
2. Watch the deployment progress
3. Wait for both "build" and "deploy" jobs to complete (usually 2-3 minutes)
4. Green checkmark ✅ means successful deployment

### 8. Access Your Deployed Application
Your application will be available at:
```
https://YOUR_USERNAME.github.io/shadcn-ui/
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## 🔧 Configuration Details

### Vite Configuration (`vite.config.ts`)
```typescript
export default defineConfig({
  base: '/shadcn-ui/', // Must match your repository name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
```

**Important:** If your repository name is different, update the `base` path:
- Repository name: `my-dashboard` → `base: '/my-dashboard/'`
- Repository name: `finance-app` → `base: '/finance-app/'`

### GitHub Actions Workflow
The workflow automatically:
1. Checks out code
2. Sets up Node.js 20
3. Installs pnpm
4. Installs dependencies
5. Builds the application
6. Deploys to GitHub Pages

---

## 🐛 Troubleshooting

### Issue: 404 Error on Deployed Site
**Solution:** Check that `base` in `vite.config.ts` matches your repository name exactly.

### Issue: Workflow Fails
**Solution:** 
1. Check Actions tab for error details
2. Ensure GitHub Pages is enabled in repository settings
3. Verify workflow has write permissions

### Issue: Assets Not Loading
**Solution:** 
1. Verify `base` path in `vite.config.ts`
2. Check that all asset imports use relative paths
3. Rebuild and redeploy

### Issue: Blank Page After Deployment
**Solution:**
1. Check browser console for errors
2. Verify routing configuration in `App.tsx`
3. Ensure `BrowserRouter` is used (not `HashRouter`)

---

## 📝 Manual Deployment (Alternative Method)

If you prefer manual deployment without GitHub Actions:

### 1. Build Locally
```bash
cd /workspace/shadcn-ui
pnpm run build
```

### 2. Install gh-pages Package
```bash
pnpm add -D gh-pages
```

### 3. Add Deploy Script to package.json
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

### 4. Deploy
```bash
pnpm run deploy
```

### 5. Configure GitHub Pages
1. Go to repository **Settings** → **Pages**
2. Source: Select **gh-pages** branch
3. Folder: **/ (root)**
4. Click **Save**

---

## 🔒 Security Considerations

### Environment Variables
If your application uses environment variables:

1. **Never commit `.env` files to GitHub**
2. Add secrets in GitHub repository settings:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Add your secrets (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

3. Update workflow to use secrets:
```yaml
- name: Build
  run: pnpm run build
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

---

## 🎯 Post-Deployment Checklist

After successful deployment, verify:
- ✅ Application loads without errors
- ✅ All pages are accessible
- ✅ Navigation works correctly
- ✅ Forms submit properly
- ✅ Data persistence works (localStorage)
- ✅ Assets (images, icons) load correctly
- ✅ Responsive design works on mobile
- ✅ No console errors in browser

---

## 🔄 Updating Your Deployment

To update your deployed application:

```bash
# Make your changes
git add .
git commit -m "Update: [describe your changes]"
git push origin main
```

GitHub Actions will automatically rebuild and redeploy your application.

---

## 📊 Deployment Status

**Current Configuration:**
- ✅ Vite config updated with base path
- ✅ GitHub Actions workflow created
- ✅ Build optimized for production
- ✅ Manual chunks configured for better caching
- ✅ Source maps disabled for smaller bundle

**Expected Deployment Time:** 2-3 minutes

**Expected URL Format:** `https://YOUR_USERNAME.github.io/shadcn-ui/`

---

## 💡 Tips for Success

1. **Test Locally First:** Always run `pnpm run build` and test the `dist` folder locally before deploying
2. **Use Relative Paths:** Ensure all asset imports use relative paths or the `@/` alias
3. **Monitor Actions:** Check the Actions tab regularly for deployment status
4. **Keep Dependencies Updated:** Regularly update packages for security and performance
5. **Use Branch Protection:** Consider protecting the `main` branch to prevent accidental deployments

---

## 📞 Need Help?

If you encounter issues:
1. Check the **Actions** tab for detailed error logs
2. Review the **Troubleshooting** section above
3. Verify all configuration files are correct
4. Ensure GitHub Pages is enabled in repository settings

---

**Deployment Ready!** 🎉

Your financial dashboard is now configured for GitHub Pages deployment. Follow the steps above to publish your application to the web!