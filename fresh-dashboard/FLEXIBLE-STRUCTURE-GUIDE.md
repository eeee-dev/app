# Flexible Project-Department Structure Guide

## Overview

The Financial Management Dashboard now supports a **flexible many-to-many relationship** between projects and departments, allowing for more realistic business scenarios.

## What Changed?

### Database Structure

1. **New Junction Table**: `app_72505145eb_project_departments`
   - Links projects to multiple departments
   - Tracks allocation percentage for each relationship
   - Allows notes for each assignment

2. **Updated Tables**:
   - `app_72505145eb_expenses`: `department_id` is now optional
   - `app_72505145eb_enhanced_income`: Already had optional `department_id`
   - `app_72505145eb_purchase_orders`: Added `project_id` column, `department_id` is now optional

### Key Features

#### 1. Projects Can Span Multiple Departments
- A single project can now be assigned to multiple departments
- Each assignment can have an allocation percentage (e.g., Engineering 60%, Design 40%)
- Perfect for cross-functional initiatives

#### 2. Flexible Financial Record Assignment
You can now assign expenses, income, and purchase orders in three ways:

**Option A: Department Only**
- For department-specific costs not tied to a project
- Example: Office supplies for the Marketing department

**Option B: Project Only**
- For project costs that span multiple departments
- Example: Cloud hosting for a multi-department project

**Option C: Both Department and Project**
- For tracking both dimensions
- Example: Developer salary (Engineering dept) working on Project X

**Option D: Neither (Admin/General)**
- For company-wide administrative costs
- Example: CEO salary, company insurance

## User Interface Updates

### Expenses Page
- Department field is now **optional** (can be left blank for admin costs)
- Project field is **optional** and shows all projects
- Blue info box explains the flexible assignment options
- Table shows "Admin/General" for records without department
- Table shows "Not assigned" for records without project

### Income Page
- Both department and project fields are **optional**
- Supports the same flexible assignment patterns
- Enhanced filtering by department and project

### Purchase Orders Page
- Now connected to Supabase (was using localStorage)
- Department field is **optional**
- Project field is **optional**
- Supports all assignment patterns

### Projects Page
- Still requires a primary department for backward compatibility
- Future enhancement: Support multiple departments in the UI

## Migration Guide

### For Existing Users

1. **Run the Migration Script**:
   - Go to Supabase SQL Editor
   - Execute the SQL from `migration-project-departments.sql`
   - This will:
     - Create the new junction table
     - Add `project_id` to purchase orders
     - Make department fields optional
     - Migrate existing project-department relationships

2. **No Data Loss**:
   - All existing data remains intact
   - Existing project-department relationships are automatically migrated to the new junction table

### For New Users

- The `final-setup.sql` will be updated to include all these changes
- No migration needed, everything works out of the box

## Best Practices

### When to Use Each Assignment Pattern

1. **Department Only**:
   - Regular operational expenses
   - Department-specific subscriptions
   - Team-specific purchases

2. **Project Only**:
   - Cross-departmental project costs
   - Shared infrastructure
   - Multi-team initiatives

3. **Both Department & Project**:
   - When you need dual tracking
   - Detailed cost allocation
   - Department-specific project expenses

4. **Neither (Admin/General)**:
   - Executive salaries
   - Company-wide insurance
   - General administrative costs
   - Legal and compliance fees

## Analytics & Reporting

### Enhanced Filtering
- Filter expenses by department, project, or both
- View admin/general costs separately
- Track project costs across multiple departments

### Future Enhancements
- Project-Department allocation dashboard
- Cross-department project analytics
- Budget tracking by allocation percentage

## Technical Details

### Database Schema

```sql
-- Junction table for many-to-many relationship
CREATE TABLE app_72505145eb_project_departments (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES app_72505145eb_projects(id),
  department_id TEXT REFERENCES app_72505145eb_departments(id),
  allocation_percentage DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, department_id)
);

-- Updated expenses table
ALTER TABLE app_72505145eb_expenses 
  ALTER COLUMN department_id DROP NOT NULL;

-- Updated purchase_orders table
ALTER TABLE app_72505145eb_purchase_orders 
  ADD COLUMN project_id UUID REFERENCES app_72505145eb_projects(id),
  ALTER COLUMN department_id DROP NOT NULL;
```

### Service Layer

New service: `src/services/project-departments.ts`
- Manages project-department relationships
- Supports bulk operations
- Handles allocation percentages

Updated services:
- `src/services/expenses.ts`: Supports optional department
- `src/services/income.ts`: Already supported optional fields
- `src/services/purchase-orders.ts`: New service connecting to Supabase

## Support

For questions or issues:
1. Check the migration script output for any errors
2. Verify all tables were created successfully
3. Test creating records with different assignment patterns
4. Report any issues with specific error messages

## Roadmap

Future enhancements planned:
- [ ] UI for managing project-department assignments
- [ ] Allocation percentage visualization
- [ ] Budget tracking by allocation
- [ ] Cross-department project reports
- [ ] Department workload analytics