# Financial Dashboard - Fresh Installation

## 🎯 Overview

A comprehensive financial management dashboard built with React, TypeScript, and Supabase authentication.

## ✨ Features

- **User Authentication**: Secure login, signup, and password reset with Supabase
- **Expense Tracking**: Record and categorize business expenses with VAT calculation
- **Income Management**: Track revenue streams with VAT handling
- **Invoice System**: Create and manage invoices
- **Department Management**: Organize by departments and cost centers
- **Project Tracking**: Monitor project-based finances
- **Budget Planning**: Set and track budgets
- **Reports & Analytics**: Generate financial reports and insights
- **Tax Returns**: Mauritius VAT return calculations
- **Bank Statement Processing**: Upload and process bank statements
- **Purchase Orders**: Manage procurement workflow

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **UI Framework**: Shadcn-UI + Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **Build Tool**: Vite 6
- **Routing**: React Router v7
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts

## 📦 Installation

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Setup Steps

1. **Install dependencies:**
```bash
pnpm install
```

2. **Environment variables are already configured in `.env`**

3. **Run development server:**
```bash
pnpm run dev
```

4. **Build for production:**
```bash
pnpm run build
```

## 🚀 Deployment to Vercel

### Method 1: Push to GitHub First (Recommended)

1. **Initialize Git and push to GitHub:**
```bash
cd /workspace/fresh-dashboard
git init
git add .
git commit -m "Fresh financial dashboard installation"
git remote add origin https://github.com/eeee-dev/admin.git
git branch -M main
git push -u origin main --force
```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Import repository: `eeee-dev/admin`
   - Framework Preset: **Vite**
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
   - Add environment variables:
     - `VITE_SUPABASE_URL` = `https://ssekkfxkigyavgljszpc.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZWtrZnhraWd5YXZnbGpzenBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDY5ODYsImV4cCI6MjA4MTMyMjk4Nn0.WwpNzeqzyrd9IdpQPmdm5F5XkoKpVO57MFLMu-zKCJA`
   - Click **Deploy**

3. **Configure custom domain:**
   - Project Settings → Domains
   - Add: `e-office.mgx.world`

### Method 2: Direct Vercel CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## 🔐 Authentication Setup

The app uses Supabase Authentication. **First-time users must sign up:**

1. Go to your deployed URL (e.g., `https://e-office.mgx.world`)
2. Click **"Sign Up"**
3. Enter email and password
4. Check email for verification link (if email confirmation is enabled)
5. Sign in with your credentials

## 📁 Project Structure

```
/workspace/fresh-dashboard/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── layout/         # Layout (Header, Sidebar)
│   │   └── ui/             # Shadcn-UI components
│   ├── contexts/
│   │   └── AuthContext.tsx # Auth state management
│   ├── lib/
│   │   ├── auth.ts         # Auth service
│   │   ├── supabase.ts     # Supabase client
│   │   └── utils.ts        # Utilities
│   ├── pages/              # All page components
│   ├── App.tsx             # Main app with routing
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── .env                    # Environment variables
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.ts          # Vite config
└── vercel.json             # Vercel config
```

## 🐛 Troubleshooting

### Build Errors

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml dist
pnpm install
pnpm run build
```

### Blank Page After Deployment

- Check browser console for errors
- Verify environment variables in Vercel
- Ensure `dist` folder contains `index.html` and `assets/`
- Check Vercel deployment logs

### Authentication Not Working

- Verify Supabase credentials in Vercel environment variables
- Check Supabase dashboard → Authentication → URL Configuration
- Add your Vercel URL to Supabase allowed redirect URLs

### 404 Errors on Page Refresh

- Ensure `vercel.json` has proper rewrites configuration (already included)
- Check Vercel deployment settings

## 📝 Important Notes

- **All authentication is handled by Supabase** - no local user storage
- **Database tables are created via SQL** - see `database-setup.sql`
- **Environment variables must be set in Vercel** for production
- **First user must sign up** before accessing the dashboard

## 🆘 Support

For deployment issues:
1. Check Vercel build logs
2. Verify all environment variables are set
3. Test locally with `pnpm run build && pnpm run preview`
4. Check Supabase dashboard for backend status

---

**Built with ❤️ using React 19, TypeScript, Vite 6, and Supabase**Testing auto-deployment
