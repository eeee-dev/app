import { supabase } from '@/lib/supabase';

export interface Project {
  id: string;
  name: string;
  code: string;
  department_id?: string;
  description?: string;
  budget: number;
  spent: number;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'planning' | 'on-hold' | 'completed' | 'cancelled';
  manager?: string;
  team_size: number;
  created_at?: string;
  updated_at?: string;
}

export const projectsService = {
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(project: Omit<Project, 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, project: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...project, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};