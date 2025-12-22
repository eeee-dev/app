// Local storage utility functions for persisting data

export const storage = {
  getDepartments: () => {
    try {
      const data = localStorage.getItem('departments');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading departments from localStorage:', error);
      return null;
    }
  },

  saveDepartments: (departments: unknown[]) => {
    try {
      localStorage.setItem('departments', JSON.stringify(departments));
    } catch (error) {
      console.error('Error saving departments to localStorage:', error);
    }
  },

  getProjects: () => {
    try {
      const data = localStorage.getItem('projects');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading projects from localStorage:', error);
      return null;
    }
  },

  saveProjects: (projects: unknown[]) => {
    try {
      localStorage.setItem('projects', JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects to localStorage:', error);
    }
  },

  clear: () => {
    try {
      localStorage.removeItem('departments');
      localStorage.removeItem('projects');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};