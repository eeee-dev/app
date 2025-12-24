import { supabase } from '@/lib/supabase';

export interface ProjectDepartment {
  id: string;
  project_id: string;
  department_id: string;
  allocation_percentage: number;
  notes?: string;
  created_at?: string;
}

const TABLE_NAME = 'app_72505145eb_project_departments';

export const projectDepartmentsService = {
  async getByProjectId(projectId: string): Promise<ProjectDepartment[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('project_id', projectId)
      .order('allocation_percentage', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByDepartmentId(departmentId: string): Promise<ProjectDepartment[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('department_id', departmentId)
      .order('allocation_percentage', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(projectDepartment: Omit<ProjectDepartment, 'id' | 'created_at'>): Promise<ProjectDepartment> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([projectDepartment])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, projectDepartment: Partial<ProjectDepartment>): Promise<ProjectDepartment> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(projectDepartment)
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
  },

  async deleteByProjectId(projectId: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('project_id', projectId);
    
    if (error) throw error;
  },

  async bulkCreate(projectId: string, departments: Array<{ department_id: string; allocation_percentage: number; notes?: string }>): Promise<void> {
    // First, delete existing relationships
    await this.deleteByProjectId(projectId);
    
    // Then create new ones
    if (departments.length > 0) {
      const records = departments.map(dept => ({
        project_id: projectId,
        department_id: dept.department_id,
        allocation_percentage: dept.allocation_percentage,
        notes: dept.notes
      }));

      const { error } = await supabase
        .from(TABLE_NAME)
        .insert(records);
      
      if (error) throw error;
    }
  }
};