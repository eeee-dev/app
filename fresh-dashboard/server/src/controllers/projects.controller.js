import { executeQuery } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all projects
export const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await executeQuery(`
    SELECT 
      p.*,
      d.name as department_name,
      DATEDIFF(p.end_date, CURDATE()) as days_remaining
    FROM projects p
    LEFT JOIN departments d ON p.department_id = d.id
    ORDER BY p.created_at DESC
  `);

  res.json({
    success: true,
    data: projects
  });
});

// Get project by ID
export const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const projects = await executeQuery(`
    SELECT 
      p.*,
      d.name as department_name,
      DATEDIFF(p.end_date, CURDATE()) as days_remaining
    FROM projects p
    LEFT JOIN departments d ON p.department_id = d.id
    WHERE p.id = ?
  `, [id]);

  if (projects.length === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'Project not found' 
    });
  }

  res.json({
    success: true,
    data: projects[0]
  });
});

// Create project
export const createProject = asyncHandler(async (req, res) => {
  const { 
    name, code, department_id, description, budget, 
    start_date, end_date, status, manager, team_size 
  } = req.body;

  const projectId = `proj-${Date.now()}`;

  await executeQuery(`
    INSERT INTO projects 
    (id, name, code, department_id, description, budget, spent, start_date, end_date, status, manager, team_size, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, NOW(), NOW())
  `, [
    projectId, name, code, department_id || null, description || null, 
    budget || 0, start_date || null, end_date || null, 
    status || 'active', manager || null, team_size || 0
  ]);

  const newProject = await executeQuery(
    'SELECT * FROM projects WHERE id = ?',
    [projectId]
  );

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: newProject[0]
  });
});

// Update project
export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    name, code, department_id, description, budget, 
    start_date, end_date, status, manager, team_size 
  } = req.body;

  // Check if project exists
  const existing = await executeQuery('SELECT id FROM projects WHERE id = ?', [id]);
  
  if (existing.length === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'Project not found' 
    });
  }

  await executeQuery(`
    UPDATE projects 
    SET name = ?, code = ?, department_id = ?, description = ?, budget = ?, 
        start_date = ?, end_date = ?, status = ?, manager = ?, team_size = ?, updated_at = NOW()
    WHERE id = ?
  `, [
    name, code, department_id || null, description || null, budget, 
    start_date || null, end_date || null, status, manager || null, team_size, id
  ]);

  const updatedProject = await executeQuery(
    'SELECT * FROM projects WHERE id = ?',
    [id]
  );

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: updatedProject[0]
  });
});

// Delete project
export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await executeQuery('DELETE FROM projects WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'Project not found' 
    });
  }

  res.json({
    success: true,
    message: 'Project deleted successfully'
  });
});

// Get project statistics
export const getProjectStats = asyncHandler(async (req, res) => {
  const stats = await executeQuery(`
    SELECT 
      COUNT(*) as total_projects,
      SUM(budget) as total_budget,
      SUM(spent) as total_spent,
      SUM(team_size) as total_team_size,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects
    FROM projects
  `);

  res.json({
    success: true,
    data: stats[0]
  });
});