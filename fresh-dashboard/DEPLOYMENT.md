# Deployment Guide - Financial Dashboard

## 🎯 Option B: Frontend-Only with Direct Supabase Integration

This application connects directly to Supabase from the frontend. No backend server required!

## 📋 Prerequisites

1. **Supabase Account** - Already configured at https://ssekkfxkigyavgljszpc.supabase.co
2. **FTP Access** - To upload files to https://office.eeee.mu
3. **Modern Web Browser** - For users to access the application

## 🔧 Setup Steps

### Step 1: Create Database Tables in Supabase

1. Go to Supabase SQL Editor:
   👉 https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc/sql/new

2. Copy the entire contents of `supabase-setup.sql` file

3. Paste into the SQL Editor and click "Run"

4. Verify tables were created:
   - departments
   - projects
   - expenses
   - income
   - invoices
   - budgets

### Step 2: Build the Production Frontend

```bash
cd /workspace/fresh-dashboard
pnpm run build
```

This creates an optimized production build in the `dist/` folder.

### Step 3: Upload to FTP Server

Upload the contents of the `dist/` folder to your FTP server:

**FTP Details Needed:**
- Host: ftp.eeee.mu (or your FTP host)
- Username: your_ftp_username
- Password: your_ftp_password
- Directory: /public_html/ (or your web root)

**Upload these files:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── [other files]
```

### Step 4: Configure Domain

Ensure your domain https://office.eeee.mu points to the directory where you uploaded the files.

### Step 5: Test the Application

1. Visit https://office.eeee.mu
2. Sign up for a new account (uses Supabase Auth)
3. Test creating departments, projects, expenses, etc.

## 🔐 Authentication

The application uses Supabase Authentication:
- **Sign Up**: Users can create accounts
- **Login**: Email/password authentication
- **Session Management**: Automatic token refresh
- **Password Reset**: Email-based password recovery

## 📊 Database Structure

### Tables Created:
1. **departments** - Department management with budgets
2. **projects** - Project tracking with department links
3. **expenses** - Expense records with approval workflow
4. **income** - Revenue/invoice tracking
5. **invoices** - Invoice generation
6. **budgets** - Budget planning and tracking

### Row Level Security (RLS):
- All tables have RLS enabled
- Authenticated users can read/write all data
- Anonymous users cannot access any data

## 🚀 Features

- ✅ Real-time data synchronization
- ✅ Secure authentication
- ✅ Responsive design (mobile-friendly)
- ✅ Dark mode support
- ✅ Export to CSV functionality
- ✅ Budget tracking and alerts
- ✅ Department and project management
- ✅ Expense approval workflow
- ✅ Invoice generation

## 🔧 Configuration

Environment variables are configured in `.env.production`:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## 📝 Maintenance

### Updating the Application:
1. Make changes to the code
2. Run `pnpm run build`
3. Upload new `dist/` contents to FTP

### Database Migrations:
Run SQL commands in Supabase SQL Editor for schema changes.

### Backup:
Supabase automatically backs up your database. You can also export data via the Supabase dashboard.

## 🐛 Troubleshooting

**Issue: "Failed to fetch" errors**
- Check Supabase project is active
- Verify CORS settings in Supabase dashboard
- Ensure environment variables are correct

**Issue: Authentication not working**
- Verify Supabase Auth is enabled
- Check email templates are configured
- Ensure redirect URLs include your domain

**Issue: Data not saving**
- Check RLS policies are correctly set
- Verify user is authenticated
- Check browser console for errors

## 📞 Support

For issues:
1. Check browser console for errors
2. Review Supabase logs in dashboard
3. Verify all SQL tables were created successfully

## 🎉 Success Checklist

- [ ] SQL script executed in Supabase
- [ ] All 6 tables created successfully
- [ ] Production build completed (`pnpm run build`)
- [ ] Files uploaded to FTP server
- [ ] Domain points to correct directory
- [ ] Can access https://office.eeee.mu
- [ ] Can sign up for new account
- [ ] Can create departments, projects, expenses
- [ ] Data persists after page refresh

---

**Deployment Type**: Static Frontend + Supabase Backend
**Hosting Required**: Any static file hosting (FTP, cPanel, Netlify, Vercel, etc.)
**Database**: Supabase PostgreSQL (managed)
**Authentication**: Supabase Auth (managed)