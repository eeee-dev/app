import { supabase } from '@/lib/supabase';

export interface Department {
  id: string;
  name: string;
  code: string;
  budget: number;
  spent: number;
  manager?: string;
  description?: string;
  employees: number;
  projects: number;
  status: 'active' | 'inactive' | 'archived';
  created_at?: string;
  updated_at?: string;
}

const TABLE_NAME = 'app_72505145eb_departments';

export const departmentsService = {
  async getAll(): Promise<Department[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Department | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(department: Omit<Department, 'created_at' | 'updated_at'>): Promise<Department> {
    const { data, error} = await supabase
      .from(TABLE_NAME)
      .insert([department])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, department: Partial<Department>): Promise<Department> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...department, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Export convenience function
export async function getDepartments(): Promise<Department[]> {
  return departmentsService.getAll();
}