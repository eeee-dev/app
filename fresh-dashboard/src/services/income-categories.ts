import { supabase } from '@/lib/supabase';

export interface IncomeCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeBreakdown {
  id: string;
  income_id: string;
  category_id: string;
  amount: number;
  percentage?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  category?: IncomeCategory;
}

export interface CreateIncomeCategoryInput {
  name: string;
  description?: string;
}

export interface CreateIncomeBreakdownInput {
  income_id: string;
  category_id: string;
  amount: number;
  percentage?: number;
  notes?: string;
}

// Income Categories CRUD
export async function getIncomeCategories(): Promise<IncomeCategory[]> {
  const { data, error } = await supabase
    .from('app_72505145eb_income_categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createIncomeCategory(input: CreateIncomeCategoryInput): Promise<IncomeCategory> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('app_72505145eb_income_categories')
    .insert({
      user_id: user.id,
      name: input.name,
      description: input.description,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateIncomeCategory(
  id: string,
  input: Partial<CreateIncomeCategoryInput>
): Promise<IncomeCategory> {
  const { data, error } = await supabase
    .from('app_72505145eb_income_categories')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteIncomeCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('app_72505145eb_income_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Income Breakdowns CRUD
export async function getIncomeBreakdowns(incomeId: string): Promise<IncomeBreakdown[]> {
  const { data, error } = await supabase
    .from('app_72505145eb_income_breakdowns')
    .select(`
      *,
      category:app_72505145eb_income_categories(*)
    `)
    .eq('income_id', incomeId)
    .order('created_at');

  if (error) throw error;
  return data || [];
}

export async function createIncomeBreakdown(
  input: CreateIncomeBreakdownInput
): Promise<IncomeBreakdown> {
  const { data, error } = await supabase
    .from('app_72505145eb_income_breakdowns')
    .insert(input)
    .select(`
      *,
      category:app_72505145eb_income_categories(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function createMultipleBreakdowns(
  incomeId: string,
  breakdowns: Array<{ category_id: string; amount: number; notes?: string }>
): Promise<IncomeBreakdown[]> {
  const { data, error } = await supabase
    .from('app_72505145eb_income_breakdowns')
    .insert(
      breakdowns.map(b => ({
        income_id: incomeId,
        category_id: b.category_id,
        amount: b.amount,
        notes: b.notes,
      }))
    )
    .select(`
      *,
      category:app_72505145eb_income_categories(*)
    `);

  if (error) throw error;
  return data || [];
}

export async function updateIncomeBreakdown(
  id: string,
  input: Partial<CreateIncomeBreakdownInput>
): Promise<IncomeBreakdown> {
  const { data, error } = await supabase
    .from('app_72505145eb_income_breakdowns')
    .update(input)
    .eq('id', id)
    .select(`
      *,
      category:app_72505145eb_income_categories(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteIncomeBreakdown(id: string): Promise<void> {
  const { error } = await supabase
    .from('app_72505145eb_income_breakdowns')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function validateBreakdownTotal(incomeId: string): Promise<{
  valid: boolean;
  incomeTotal: number;
  breakdownTotal: number;
  remaining: number;
}> {
  // Get income total
  const { data: income, error: incomeError } = await supabase
    .from('app_72505145eb_enhanced_income')
    .select('amount')
    .eq('id', incomeId)
    .single();

  if (incomeError) throw incomeError;

  // Get breakdown total
  const { data: breakdowns, error: breakdownError } = await supabase
    .from('app_72505145eb_income_breakdowns')
    .select('amount')
    .eq('income_id', incomeId);

  if (breakdownError) throw breakdownError;

  const incomeTotal = income?.amount || 0;
  const breakdownTotal = breakdowns?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;
  const remaining = incomeTotal - breakdownTotal;

  return {
    valid: breakdownTotal <= incomeTotal,
    incomeTotal,
    breakdownTotal,
    remaining,
  };
}

// Export service object for backward compatibility
export const incomeCategoriesService = {
  getAllCategories: getIncomeCategories,
  createCategory: createIncomeCategory,
  updateCategory: updateIncomeCategory,
  deleteCategory: deleteIncomeCategory,
  getBreakdowns: getIncomeBreakdowns,
  getBreakdownsByIncomeId: getIncomeBreakdowns, // Alias for compatibility
  createBreakdown: createIncomeBreakdown,
  createMultipleBreakdowns,
  updateBreakdown: updateIncomeBreakdown,
  deleteBreakdown: deleteIncomeBreakdown,
  validateBreakdownTotal,
};