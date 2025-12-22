# 💻 Mac Installation Guide - Financial Dashboard

## Prerequisites

Before installing, ensure you have:
- macOS 10.15 (Catalina) or later
- Administrator access to your Mac
- Internet connection

---

## Step 1: Install Homebrew (if not already installed)

Homebrew is a package manager for Mac that makes installing software easy.

### Check if Homebrew is installed:
```bash
brew --version
```

### If not installed, install Homebrew:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the on-screen instructions. After installation, run:
```bash
brew doctor
```

---

## Step 2: Install Node.js

### Option A: Install via Homebrew (Recommended)
```bash
# Install Node.js (includes npm)
brew install node

# Verify installation
node --version
npm --version
```

### Option B: Download from Official Website
1. Go to https://nodejs.org
2. Download the LTS version for macOS
3. Run the installer (.pkg file)
4. Follow installation wizard

**Required Version:** Node.js 18.x or higher (20.x recommended)

---

## Step 3: Install pnpm

pnpm is a fast, disk space efficient package manager.

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
```

---

## Step 4: Download the Project

### Option A: Download from GitHub (if you have the repository)
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/shadcn-ui.git

# Navigate to project directory
cd shadcn-ui
```

### Option B: Download ZIP file
1. Download the project ZIP file
2. Extract it to your desired location
3. Open Terminal and navigate to the folder:
```bash
cd /path/to/extracted/shadcn-ui
```

**To find the path:**
- Drag the folder from Finder into Terminal
- Or right-click folder → Services → New Terminal at Folder

---

## Step 5: Install Project Dependencies

```bash
# Make sure you're in the project directory
cd /path/to/shadcn-ui

# Install all dependencies
pnpm install
```

This will take 2-5 minutes depending on your internet speed.

---

## Step 6: Run the Application

### Development Mode (for local use)
```bash
# Start the development server
pnpm run dev
```

You'll see output like:
```
  VITE v6.4.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Open your browser and go to:** `http://localhost:5173`

### Production Build (for deployment)
```bash
# Build the application
pnpm run build

# Preview the production build
pnpm run preview
```

---

## Step 7: Accessing the Application

### Local Development
- **URL:** http://localhost:5173
- **Browser:** Chrome, Safari, Firefox, or Edge
- **Hot Reload:** Changes auto-refresh the page

### Stopping the Server
Press `Ctrl + C` in the Terminal to stop the development server.

---

## Troubleshooting

### Issue: "command not found: brew"
**Solution:** Homebrew is not installed. Go back to Step 1.

### Issue: "command not found: node" or "command not found: npm"
**Solution:** Node.js is not installed or not in PATH. Reinstall Node.js from Step 2.

### Issue: "command not found: pnpm"
**Solution:** Run `npm install -g pnpm` again.

### Issue: Port 5173 already in use
**Solution:** 
```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
pnpm run dev -- --port 3000
```

### Issue: Permission denied errors
**Solution:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Issue: Build fails with TypeScript errors
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
pnpm run build
```

### Issue: "Cannot find module '@vitejs/plugin-react-swc'"
**Solution:** This has been fixed in the latest version. Make sure you have the updated `vite.config.ts` file.

---

## File Structure

After installation, your project structure will look like:
```
shadcn-ui/
├── node_modules/          # Dependencies (auto-generated)
├── public/                # Static assets
├── src/                   # Source code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── lib/              # Utilities
│   └── App.tsx           # Main app component
├── dist/                 # Production build (after build)
├── package.json          # Project configuration
├── vite.config.ts        # Vite configuration
└── README.md             # Project documentation
```

---

## Environment Variables (Optional)

If you're using Supabase or other services:

1. **Create `.env` file** in the project root:
```bash
touch .env
```

2. **Add your environment variables:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Restart the development server** for changes to take effect.

---

## Updating the Application

To update to the latest version:

```bash
# Pull latest changes (if using Git)
git pull origin main

# Reinstall dependencies
pnpm install

# Restart the server
pnpm run dev
```

---

## Uninstalling

To completely remove the application:

```bash
# Remove project directory
rm -rf /path/to/shadcn-ui

# Optional: Uninstall global packages
npm uninstall -g pnpm

# Optional: Uninstall Node.js via Homebrew
brew uninstall node
```

---

## Performance Tips

### Speed up development:
1. **Close unnecessary applications** to free up RAM
2. **Use Chrome DevTools** for debugging (Cmd + Option + I)
3. **Clear browser cache** if experiencing issues

### Optimize build:
```bash
# Analyze bundle size
pnpm run build -- --mode production

# Check for outdated packages
pnpm outdated
```

---

## Keyboard Shortcuts (in Terminal)

- `Ctrl + C` - Stop the server
- `Cmd + T` - New Terminal tab
- `Cmd + K` - Clear Terminal
- `Cmd + W` - Close Terminal tab

---

## System Requirements

**Minimum:**
- macOS 10.15 (Catalina)
- 4 GB RAM
- 2 GB free disk space
- Dual-core processor

**Recommended:**
- macOS 12 (Monterey) or later
- 8 GB RAM or more
- 5 GB free disk space
- Quad-core processor

---

## Quick Start Commands Summary

```bash
# 1. Install Homebrew (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js
brew install node

# 3. Install pnpm
npm install -g pnpm

# 4. Navigate to project
cd /path/to/shadcn-ui

# 5. Install dependencies
pnpm install

# 6. Run the app
pnpm run dev

# 7. Open browser to http://localhost:5173
```

---

## Getting Help

If you encounter issues:

1. **Check the error message** in Terminal
2. **Search the error** on Google or Stack Overflow
3. **Review the Troubleshooting section** above
4. **Check project documentation** in README.md
5. **Verify all prerequisites** are installed correctly

---

## Additional Resources

- **Node.js Documentation:** https://nodejs.org/docs
- **pnpm Documentation:** https://pnpm.io
- **Vite Documentation:** https://vitejs.dev
- **React Documentation:** https://react.dev
- **Homebrew Documentation:** https://docs.brew.sh

---

## Security Notes

1. **Never commit `.env` files** to version control
2. **Keep Node.js updated** for security patches
3. **Use HTTPS** when deploying to production
4. **Regularly update dependencies:**
   ```bash
   pnpm update
   ```

---

## Next Steps After Installation

1. **Explore the application** - Navigate through all pages
2. **Test features** - Try creating expenses, invoices, etc.
3. **Customize settings** - Configure your preferences
4. **Add your data** - Import or manually enter your financial data
5. **Deploy to production** - Follow VERCEL_DEPLOYMENT_GUIDE.md

---

**Installation Complete!** 🎉

Your financial dashboard is now running on your Mac. Access it at `http://localhost:5173` in your browser.

For deployment to a live server, see `VERCEL_DEPLOYMENT_GUIDE.md`.