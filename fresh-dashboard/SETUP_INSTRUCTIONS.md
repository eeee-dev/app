# Income Category Breakdown Setup Instructions

## 🚀 Quick Setup

### Step 1: Run Database Migration

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/ssekkfxkigyavgljszpc
   - Click "SQL Editor" in the left sidebar

2. **Run the Migration Script**
   - Open the file: `/workspace/fresh-dashboard/supabase-migrations/001_income_categories.sql`
   - Copy the entire content
   - Paste it into the Supabase SQL Editor
   - Click "Run" button

3. **Verify Tables Created**
   - Go to "Table Editor" in Supabase
   - You should see two new tables:
     - `app_40611b53f9_income_categories` (14 default categories)
     - `app_40611b53f9_income_breakdowns`

### Step 2: Test the Application

1. **Start the development server** (if not already running):
   ```bash
   cd /workspace/fresh-dashboard
   pnpm run dev
   ```

2. **Login to the application**
   - Use your credentials to login

3. **Navigate to Income page**
   - Click "Income" in the sidebar
   - You should now see the new "Add Income with Category Breakdown" button

4. **Test the feature**
   - Click "Add Income with Category Breakdown"
   - Enter invoice details (e.g., MT Connect project - Rs 1,840,575)
   - Add category breakdowns:
     - Creative Direction: Rs 300,000
     - Photography: Rs 100,000
     - Video Production: Rs 220,000
     - etc.
   - Save and verify the breakdown appears

## 📊 Features Implemented

### 1. Income Category Management
- 14 pre-defined categories mapped to ë ecosystem divisions
- Each category has a color code for visual distinction
- Categories can be activated/deactivated

### 2. Category Breakdown Entry
- Add multiple categories to a single income entry
- Automatic percentage calculation
- Visual validation (total must equal invoice amount)
- Real-time breakdown preview

### 3. Visual Analytics
- Pie chart showing category distribution
- Bar chart showing division allocation
- Category-wise income reports
- Project-based category tracking

## 🎨 Default Categories

| Category | Division | Color |
|----------|----------|-------|
| Creative Direction | ë • zimazë | Purple |
| Logo Design | ë • zimazë | Pink |
| Design Work | ë • zimazë | Orange |
| Presentation Design | ë • zimazë | Green |
| Screen Content | ë • zimazë | Indigo |
| Video Production | ë • bōucan | Red |
| Photography | ë • bōucan | Orange |
| Content Capture | ë • bōucan | Teal |
| Animation | ë • zimazë | Purple |
| Music & Audio | ë • musiquë | Cyan |
| Talent Management | ë • talënt | Lime |
| Event Management | ë • mōris | Green |
| Sustenance | ë • admin | Gray |
| Other Services | ë • admin | Gray |

## 🔧 Troubleshooting

### Issue: Tables not created
- **Solution**: Make sure you're logged into the correct Supabase project
- Verify the project ref: `ssekkfxkigyavgljszpc`

### Issue: Permission denied
- **Solution**: Check that RLS policies are enabled
- Re-run the migration script

### Issue: Categories not showing
- **Solution**: Check browser console for errors
- Verify Supabase connection in `.env` file

## 📝 Next Steps

After completing this setup, you can:

1. **Add Division Structure** - Implement the full ë ecosystem hierarchy
2. **Department Dashboards** - Create individual views for each division
3. **Advanced Reports** - Generate division-wise financial reports
4. **Budget Allocation** - Track division budgets vs actual income

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Verify Supabase connection
3. Ensure migration script ran successfully
4. Check that you're logged in with valid credentials