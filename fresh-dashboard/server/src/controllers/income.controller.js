import { executeQuery } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all income
export const getAllIncome = asyncHandler(async (req, res) => {
  const income = await executeQuery(`
    SELECT 
      i.*,
      d.name as department_name,
      p.name as project_name
    FROM income i
    LEFT JOIN departments d ON i.department_id = d.id
    LEFT JOIN projects p ON i.project_id = p.id
    ORDER BY i.date DESC
  `);

  res.json({
    success: true,
    data: income
  });
});

// Get income by ID
export const getIncomeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const income = await executeQuery(`
    SELECT 
      i.*,
      d.name as department_name,
      p.name as project_name
    FROM income i
    LEFT JOIN departments d ON i.department_id = d.id
    LEFT JOIN projects p ON i.project_id = p.id
    WHERE i.id = ?
  `, [id]);

  if (income.length === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'Income record not found' 
    });
  }

  res.json({
    success: true,
    data: income[0]
  });
});

// Create income
export const createIncome = asyncHandler(async (req, res) => {
  const { 
    invoice_number, client_name, client_email, client_phone, client_address,
    amount, date, due_date, status, department_id, project_id, description 
  } = req.body;

  const incomeId = `inc-${Date.now()}`;

  await executeQuery(`
    INSERT INTO income 
    (id, invoice_number, client_name, client_email, client_phone, client_address, amount, date, due_date, status, department_id, project_id, description, created_by, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `, [
    incomeId, invoice_number, client_name, client_email || null, client_phone || null, 
    client_address || null, amount, date, due_date || null, status || 'pending', 
    department_id || null, project_id || null, description || null, req.user.id
  ]);

  const newIncome = await executeQuery(
    'SELECT * FROM income WHERE id = ?',
    [incomeId]
  );

  res.status(201).json({
    success: true,
    message: 'Income record created successfully',
    data: newIncome[0]
  });
});

// Update income
export const updateIncome = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    invoice_number, client_name, client_email, client_phone, client_address,
    amount, date, due_date, status, department_id, project_id, description 
  } = req.body;

  // Check if income exists
  const existing = await executeQuery('SELECT id FROM income WHERE id = ?', [id]);
  
  if (existing.length === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'Income record not found' 
    });
  }

  await executeQuery(`
    UPDATE income 
    SET invoice_number = ?, client_name = ?, client_email = ?, client_phone = ?, 
        client_address = ?, amount = ?, date = ?, due_date = ?, status = ?, 
        department_id = ?, project_id = ?, description = ?, updated_at = NOW()
    WHERE id = ?
  `, [
    invoice_number, client_name, client_email || null, client_phone || null, 
    client_address || null, amount, date, due_date || null, status, 
    department_id || null, project_id || null, description || null, id
  ]);

  const updatedIncome = await executeQuery(
    'SELECT * FROM income WHERE id = ?',
    [id]
  );

  res.json({
    success: true,
    message: 'Income record updated successfully',
    data: updatedIncome[0]
  });
});

// Update income status
export const updateIncomeStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await executeQuery(
    'UPDATE income SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'Income record not found' 
    });
  }

  res.json({
    success: true,
    message: 'Income status updated successfully'
  });
});

// Delete income
export const deleteIncome = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await executeQuery('DELETE FROM income WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'Income record not found' 
    });
  }

  res.json({
    success: true,
    message: 'Income record deleted successfully'
  });
});

// Get income statistics
export const getIncomeStats = asyncHandler(async (req, res) => {
  const stats = await executeQuery(`
    SELECT 
      COUNT(*) as total_records,
      SUM(amount) as total_amount,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
      COUNT(CASE WHEN status = 'received' THEN 1 END) as received_count,
      SUM(CASE WHEN status = 'received' THEN amount ELSE 0 END) as received_amount,
      COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
      SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue_amount
    FROM income
  `);

  res.json({
    success: true,
    data: stats[0]
  });
});