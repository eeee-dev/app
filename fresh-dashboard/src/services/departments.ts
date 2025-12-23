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

export const departmentsService = {
  async getAll(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Department | null> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(department: Omit<Department, 'created_at' | 'updated_at'>): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .insert([department])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, department: Partial<Department>): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .update({ ...department, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};