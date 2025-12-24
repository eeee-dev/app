import { supabase } from '@/lib/supabase';
import { IncomeCategory, IncomeBreakdown, IncomeBreakdownWithCategory } from '@/lib/incomeCategoryTypes';

const CATEGORIES_TABLE = 'app_72505145eb_income_categories';
const BREAKDOWNS_TABLE = 'app_72505145eb_income_breakdowns';

interface BreakdownQueryResult {
  category_id: string;
  amount: string | number;
  income_id: string;
  categories: Array<{
    name: string;
    department_id?: string;
  }>;
  income: Array<{
    date: string;
  }>;
}

interface CategorySummary {
  category_id: string;
  category_name: string;
  department_id?: string;
  total_amount: number;
  breakdown_count: number;
}

interface DepartmentRevenue {
  department_id: string;
  department_name: string;
  total_revenue: number;
  category_count: number;
}

export const incomeCategoriesService = {
  // ============ Income Categories ============
  
  async getAllCategories(): Promise<IncomeCategory[]> {
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getCategoryById(id: string): Promise<IncomeCategory | null> {
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createCategory(category: Omit<IncomeCategory, 'id' | 'created_at' | 'updated_at'>): Promise<IncomeCategory> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const categoryData = {
      ...category,
      user_id: user?.id
    };

    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .insert([categoryData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, category: Partial<IncomeCategory>): Promise<IncomeCategory> {
    const { data, error } = await supabase
      .from(CATEGORIES_TABLE)
      .update({ ...category, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from(CATEGORIES_TABLE)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // ============ Income Breakdowns ============

  async getBreakdownsByIncomeId(incomeId: string): Promise<IncomeBreakdownWithCategory[]> {
    const { data, error } = await supabase
      .from(BREAKDOWNS_TABLE)
      .select(`
        *,
        categories:category_id (
          name,
          description,
          department_id
        )
      `)
      .eq('income_id', incomeId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async createBreakdown(breakdown: Omit<IncomeBreakdown, 'id' | 'created_at' | 'updated_at'>): Promise<IncomeBreakdown> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const breakdownData = {
      ...breakdown,
      user_id: user?.id
    };

    const { data, error } = await supabase
      .from(BREAKDOWNS_TABLE)
      .insert([breakdownData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createMultipleBreakdowns(
    incomeId: string, 
    breakdowns: Array<{ category_id: string; amount: number; notes?: string }>
  ): Promise<IncomeBreakdown[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const breakdownsData = breakdowns.map(b => ({
      income_id: incomeId,
      category_id: b.category_id,
      amount: b.amount,
      notes: b.notes,
      user_id: user?.id
    }));

    const { data, error } = await supabase
      .from(BREAKDOWNS_TABLE)
      .insert(breakdownsData)
      .select();
    
    if (error) throw error;
    return data || [];
  },

  async updateBreakdown(id: string, breakdown: Partial<IncomeBreakdown>): Promise<IncomeBreakdown> {
    const { data, error } = await supabase
      .from(BREAKDOWNS_TABLE)
      .update({ ...breakdown, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteBreakdown(id: string): Promise<void> {
    const { error } = await supabase
      .from(BREAKDOWNS_TABLE)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteAllBreakdownsForIncome(incomeId: string): Promise<void> {
    const { error } = await supabase
      .from(BREAKDOWNS_TABLE)
      .delete()
      .eq('income_id', incomeId);
    
    if (error) throw error;
  },

  // ============ Analytics & Reporting ============

  async getCategoryBreakdownSummary(startDate?: string, endDate?: string): Promise<CategorySummary[]> {
    let query = supabase
      .from(BREAKDOWNS_TABLE)
      .select(`
        category_id,
        amount,
        income_id,
        categories:category_id (
          name,
          department_id
        ),
        income:income_id (
          date
        )
      `);

    if (startDate) {
      query = query.gte('income.date', startDate);
    }
    if (endDate) {
      query = query.lte('income.date', endDate);
    }

    const { data, error } = await query;
    
    if (error) throw error;

    // Aggregate by category
    const summaryMap: Record<string, CategorySummary> = {};
    
    (data || []).forEach((breakdown: BreakdownQueryResult) => {
      const categoryId = breakdown.category_id;
      const categoryInfo = breakdown.categories && breakdown.categories.length > 0 ? breakdown.categories[0] : null;
      
      if (!summaryMap[categoryId]) {
        summaryMap[categoryId] = {
          category_id: categoryId,
          category_name: categoryInfo?.name || 'Unknown',
          department_id: categoryInfo?.department_id,
          total_amount: 0,
          breakdown_count: 0
        };
      }
      summaryMap[categoryId].total_amount += parseFloat(breakdown.amount.toString());
      summaryMap[categoryId].breakdown_count += 1;
    });

    return Object.values(summaryMap);
  },

  async getDepartmentRevenueByCategoryBreakdown(startDate?: string, endDate?: string): Promise<DepartmentRevenue[]> {
    const summary = await this.getCategoryBreakdownSummary(startDate, endDate);
    
    // Group by department
    const deptRevenueMap: Record<string, DepartmentRevenue> = {};
    
    summary.forEach((item: CategorySummary) => {
      const deptId = item.department_id || 'unassigned';
      if (!deptRevenueMap[deptId]) {
        deptRevenueMap[deptId] = {
          department_id: deptId,
          department_name: deptId === 'unassigned' ? 'Unassigned' : deptId,
          total_revenue: 0,
          category_count: 0
        };
      }
      deptRevenueMap[deptId].total_revenue += item.total_amount;
      deptRevenueMap[deptId].category_count += 1;
    });

    return Object.values(deptRevenueMap);
  }
};