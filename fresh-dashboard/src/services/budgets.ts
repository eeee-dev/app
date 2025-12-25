import { supabase } from '../lib/supabase';

export interface Budget {
  id: string;
  user_id: string;
  department_id: string;
  allocated: number;
  spent: number;
  fiscal_year: number;
  quarter: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetInput {
  department_id: string;
  allocated: number;
  fiscal_year: number;
  quarter: number;
  notes?: string;
}

export interface UpdateBudgetInput {
  allocated?: number;
  quarter?: number;
  notes?: string;
}

/**
 * Fetch all budgets for the current user
 */
export async function getBudgets(): Promise<Budget[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('app_72505145eb_budgets')
    .select('*')
    .eq('user_id', user.id)
    .order('fiscal_year', { ascending: false })
    .order('quarter', { ascending: false });

  if (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get budgets for a specific fiscal year
 */
export async function getBudgetsByYear(fiscal_year: number): Promise<Budget[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('app_72505145eb_budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('fiscal_year', fiscal_year)
    .order('quarter', { ascending: true });

  if (error) {
    console.error('Error fetching budgets by year:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get budget for a specific department, year, and quarter
 */
export async function getBudgetByDepartmentAndPeriod(
  department_id: string,
  fiscal_year: number,
  quarter: number
): Promise<Budget | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('app_72505145eb_budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('department_id', department_id)
    .eq('fiscal_year', fiscal_year)
    .eq('quarter', quarter)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching budget:', error);
    throw error;
  }

  return data || null;
}

/**
 * Create a new budget
 */
export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if budget already exists for this department/year/quarter
  const existing = await getBudgetByDepartmentAndPeriod(
    input.department_id,
    input.fiscal_year,
    input.quarter
  );

  if (existing) {
    throw new Error('Budget already exists for this department, year, and quarter');
  }

  const { data, error } = await supabase
    .from('app_72505145eb_budgets')
    .insert({
      user_id: user.id,
      department_id: input.department_id,
      allocated: input.allocated,
      fiscal_year: input.fiscal_year,
      quarter: input.quarter,
      notes: input.notes,
      spent: 0, // Initialize spent to 0
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating budget:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing budget
 */
export async function updateBudget(
  id: string,
  input: UpdateBudgetInput
): Promise<Budget> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('app_72505145eb_budgets')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only update their own budgets
    .select()
    .single();

  if (error) {
    console.error('Error updating budget:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a budget
 */
export async function deleteBudget(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('app_72505145eb_budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // Ensure user can only delete their own budgets

  if (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
}

/**
 * Calculate total spent for a budget based on actual expenses
 * This should be called periodically or after expense changes
 */
export async function recalculateBudgetSpent(budget_id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // First, get the budget details
  const { data: budget, error: budgetError } = await supabase
    .from('app_72505145eb_budgets')
    .select('department_id, fiscal_year, quarter')
    .eq('id', budget_id)
    .eq('user_id', user.id)
    .single();

  if (budgetError) {
    console.error('Error fetching budget for recalculation:', budgetError);
    throw budgetError;
  }

  // Calculate the date range for the quarter
  const startDate = new Date(budget.fiscal_year, (budget.quarter - 1) * 3, 1);
  const endDate = new Date(budget.fiscal_year, budget.quarter * 3, 0);

  // Sum up expenses for this department in this period
  const { data: expenses, error: expensesError } = await supabase
    .from('app_72505145eb_expenses')
    .select('amount')
    .eq('user_id', user.id)
    .eq('department_id', budget.department_id)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  if (expensesError) {
    console.error('Error fetching expenses for budget calculation:', expensesError);
    throw expensesError;
  }

  const totalSpent = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0) || 0;

  // Update the budget with the calculated spent amount
  const { error: updateError } = await supabase
    .from('app_72505145eb_budgets')
    .update({ 
      spent: totalSpent,
      updated_at: new Date().toISOString(),
    })
    .eq('id', budget_id)
    .eq('user_id', user.id);

  if (updateError) {
    console.error('Error updating budget spent amount:', updateError);
    throw updateError;
  }
}

/**
 * Get budget summary statistics
 */
export async function getBudgetSummary(fiscal_year: number) {
  const budgets = await getBudgetsByYear(fiscal_year);

  const summary = {
    totalAllocated: 0,
    totalSpent: 0,
    totalRemaining: 0,
    budgetCount: budgets.length,
    overBudgetCount: 0,
    utilizationRate: 0,
  };

  budgets.forEach(budget => {
    summary.totalAllocated += budget.allocated;
    summary.totalSpent += budget.spent;
    if (budget.spent > budget.allocated) {
      summary.overBudgetCount++;
    }
  });

  summary.totalRemaining = summary.totalAllocated - summary.totalSpent;
  summary.utilizationRate = summary.totalAllocated > 0 
    ? (summary.totalSpent / summary.totalAllocated) * 100 
    : 0;

  return summary;
}