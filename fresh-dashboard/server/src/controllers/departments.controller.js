import { executeQuery } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all departments
export const getAllDepartments = asyncHandler(async (req, res) => {
  const departments = await executeQuery(`
    SELECT 
      d.*,
      COUNT(DISTINCT p.id) as project_count,
      COUNT(DISTINCT e.id) as expense_count,
      COALESCE(SUM(e.amount), 0) as total_expenses
    FROM departments d
    LEFT JOIN projects p ON d.id = p.department_id
    LEFT JOIN expenses e ON d.id = e.department_id
    GROUP BY d.id
    ORDER BY d.name
  `);

  res.json({
    success: true,
    data: departments
  });
});

// Get department by ID
export const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const departments = await executeQuery(`
    SELECT 
      d.*,
      COUNT(DISTINCT p.id) as project_count,
      COUNT(DISTINCT e.id) as expense_count,
      COALESCE(SUM(e.amount), 0) as total_expenses
    FROM departments d
    LEFT JOIN projects p ON d.id = p.department_id
    LEFT JOIN expenses e ON d.id = e.department_id
    WHERE d.id = ?
    GROUP BY d.id
  `, [id]);

  if (departments.length === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'Department not found' 
    });
  }

  res.json({
    success: true,
    data: departments[0]
  });
});

// Create department
export const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, budget, manager, description, employees, projects, status } = req.body;

  const result = await executeQuery(`
    INSERT INTO departments 
    (name, code, budget, spent, manager, description, employees, projects, status, created_at, updated_at) 
    VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, NOW(), NOW())
  `, [name, code, budget || 0, manager || null, description || null, employees || 0, projects || 0, status || 'active']);

  const newDepartment = await executeQuery(
    'SELECT * FROM departments WHERE id = ?',
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    message: 'Department created successfully',
    data: newDepartment[0]
  });
});

// Update department
export const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, code, budget, manager, description, employees, projects, status } = req.body;

  // Check if department exists
  const existing = await executeQuery('SELECT id FROM departments WHERE id = ?', [id]);
  
  if (existing.length === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'Department not found' 
    });
  }

  await executeQuery(`
    UPDATE departments 
    SET name = ?, code = ?, budget = ?, manager = ?, description = ?, 
        employees = ?, projects = ?, status = ?, updated_at = NOW()
    WHERE id = ?
  `, [name, code, budget, manager, description, employees, projects, status, id]);

  const updatedDepartment = await executeQuery(
    'SELECT * FROM departments WHERE id = ?',
    [id]
  );

  res.json({
    success: true,
    message: 'Department updated successfully',
    data: updatedDepartment[0]
  });
});

// Delete department
export const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if department has projects
  const projects = await executeQuery(
    'SELECT COUNT(*) as count FROM projects WHERE department_id = ?',
    [id]
  );

  if (projects[0].count > 0) {
    return res.status(400).json({ 
      success: false, 
      error: 'Cannot delete department with active projects' 
    });
  }

  const result = await executeQuery('DELETE FROM departments WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'Department not found' 
    });
  }

  res.json({
    success: true,
    message: 'Department deleted successfully'
  });
});

// Get department statistics
export const getDepartmentStats = asyncHandler(async (req, res) => {
  const stats = await executeQuery(`
    SELECT 
      COUNT(*) as total_departments,
      SUM(budget) as total_budget,
      SUM(spent) as total_spent,
      SUM(employees) as total_employees,
      SUM(projects) as total_projects
    FROM departments
  `);

  res.json({
    success: true,
    data: stats[0]
  });
});