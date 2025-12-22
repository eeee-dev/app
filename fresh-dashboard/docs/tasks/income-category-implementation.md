# Income Category Breakdown Implementation Plan

## Overview
Implement a system where income/invoices can be broken down into multiple categories that feed into different departments.

## Database Schema Changes

### 1. Create Income Categories Table
```sql
CREATE TABLE app_40611b53f9_income_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES app_40611b53f9_departments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_income_categories_dept ON app_40611b53f9_income_categories(department_id);
```

### 2. Create Income Category Breakdown Table
```sql
CREATE TABLE app_40611b53f9_income_breakdowns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  income_id UUID REFERENCES app_40611b53f9_income(id) ON DELETE CASCADE,
  category_id UUID REFERENCES app_40611b53f9_income_categories(id),
  amount DECIMAL(15, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_income_breakdowns_income ON app_40611b53f9_income_breakdowns(income_id);
CREATE INDEX idx_income_breakdowns_category ON app_40611b53f9_income_breakdowns(category_id);
```

### 3. Add Project Reference to Income
```sql
ALTER TABLE app_40611b53f9_income 
ADD COLUMN project_name TEXT,
ADD COLUMN project_reference TEXT;
```

## Implementation Steps

1. **Database Setup** - Create tables for categories and breakdowns
2. **Seed Default Categories** - Add common categories from MT Connect project
3. **Update Income Form** - Add category breakdown interface
4. **Category Management** - CRUD for income categories
5. **Department Integration** - Link categories to departments
6. **Reporting** - Show category breakdown in reports

## Default Categories (Based on MT Connect)
- Creative Direction & Event Concept
- Logo Design
- Design Derivatives (Flyer/Pattern/BG)
- Presentation Design
- Screen/LED Content Management
- Sustenance (Food, Drink, Fuel)
- Backdrop Animation
- Walk-in & Ambience Music
- Video Coverage
- Photography
- Management & Coordination

## UI Components Needed
1. CategoryBreakdownForm - Add/edit category allocations
2. CategoryManager - Manage income categories
3. IncomeCategoryChart - Visualize category distribution
4. DepartmentRevenueView - Show revenue by department from categories