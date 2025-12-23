import { executeQuery } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all expenses
export const getAllExpenses = asyncHandler(async (req, res) => {
  const expenses = await executeQuery(`
    SELECT 
      e.*,
      d.name as department_name,
      p.name as project_name,
      u.full_name as created_by_name
    FROM expenses e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN projects p ON e.project_id = p.id
    LEFT JOIN users u ON e.created_by = u.id
    ORDER BY e.date DESC
  `);

  res.json({
    success: true,
    data: expenses
  });
});

// Get expense by ID
export const getExpenseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const expenses = await executeQuery(`
    SELECT 
      e.*,
      d.name as department_name,
      p.name as project_name,
      u.full_name as created_by_name
    FROM expenses e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN projects p ON e.project_id = p.id
    LEFT JOIN users u ON e.created_by = u.id
    WHERE e.id = ?
  `, [id]);

  if (expenses.length === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'Expense not found' 
    });
  }

  res.json({
    success: true,
    data: expenses[0]
  });
});

// Create expense
export const createExpense = asyncHandler(async (req, res) => {
  const { 
    description, amount, category, date, status, 
    department_id, project_id, receipt_url, notes 
  } = req.body;

  const expenseId = `exp-${Date.now()}`;

  await executeQuery(`
    INSERT INTO expenses 
    (id, description, amount, category, date, status, department_id, project_id, receipt_url, notes, created_by, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `, [
    expenseId, description, amount, category, date, 
    status || 'pending', department_id || null, project_id || null, 
    receipt_url || null, notes || null, req.user.id
  ]);

  // Update department spent if department_id provided
  if (department_id) {
    await executeQuery(
      'UPDATE departments SET spent = spent + ? WHERE id = ?',
      [amount, department_id]
    );
  }

  // Update project spent if project_id provided
  if (project_id) {
    await executeQuery(
      'UPDATE projects SET spent = spent + ? WHERE id = ?',
      [amount, project_id]
    );
  }

  const newExpense = await executeQuery(
    'SELECT * FROM expenses WHERE id = ?',
    [expenseId]
  );

  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: newExpense[0]
  });
});

// Update expense
export const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    description, amount, category, date, status, 
    department_id, project_id, receipt_url, notes 
  } = req.body;

  // Get old expense data
  const oldExpense = await executeQuery('SELECT * FROM expenses WHERE id = ?', [id]);
  
  if (oldExpense.length === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'Expense not found' 
    });
  }

  const old = oldExpense[0];

  // Update expense
  await executeQuery(`
    UPDATE expenses 
    SET description = ?, amount = ?, category = ?, date = ?, status = ?, 
        department_id = ?, project_id = ?, receipt_url = ?, notes = ?, updated_at = NOW()
    WHERE id = ?
  `, [
    description, amount, category, date, status, 
    department_id || null, project_id || null, receipt_url || null, notes || null, id
  ]);

  // Adjust department spent if changed
  if (old.department_id !== department_id || old.amount !== amount) {
    if (old.department_id) {
      await executeQuery(
        'UPDATE departments SET spent = spent - ? WHERE id = ?',
        [old.amount, old.department_id]
      );
    }
    if (department_id) {
      await executeQuery(
        'UPDATE departments SET spent = spent + ? WHERE id = ?',
        [amount, department_id]
      );
    }
  }

  // Adjust project spent if changed
  if (old.project_id !== project_id || old.amount !== amount) {
    if (old.project_id) {
      await executeQuery(
        'UPDATE projects SET spent = spent - ? WHERE id = ?',
        [old.amount, old.project_id]
      );
    }
    if (project_id) {
      await executeQuery(
        'UPDATE projects SET spent = spent + ? WHERE id = ?',
        [amount, project_id]
      );
    }
  }

  const updatedExpense = await executeQuery(
    'SELECT * FROM expenses WHERE id = ?',
    [id]
  );

  res.json({
    success: true,
    message: 'Expense updated successfully',
    data: updatedExpense[0]
  });
});

// Update expense status
export const updateExpenseStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await executeQuery(
    'UPDATE expenses SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'Expense not found' 
    });
  }

  res.json({
    success: true,
    message: 'Expense status updated successfully'
  });
});

// Delete expense
export const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get expense data before deletion
  const expense = await executeQuery('SELECT * FROM expenses WHERE id = ?', [id]);
  
  if (expense.length === 0) {
    return res.status(404).json({ 
      success: false, 
      error: 'Expense not found' 
    });
  }

  const exp = expense[0];

  // Delete expense
  await executeQuery('DELETE FROM expenses WHERE id = ?', [id]);

  // Adjust department spent
  if (exp.department_id) {
    await executeQuery(
      'UPDATE departments SET spent = spent - ? WHERE id = ?',
      [exp.amount, exp.department_id]
    );
  }

  // Adjust project spent
  if (exp.project_id) {
    await executeQuery(
      'UPDATE projects SET spent = spent - ? WHERE id = ?',
      [exp.amount, exp.project_id]
    );
  }

  res.json({
    success: true,
    message: 'Expense deleted successfully'
  });
});

// Get expense statistics
export const getExpenseStats = asyncHandler(async (req, res) => {
  const stats = await executeQuery(`
    SELECT 
      COUNT(*) as total_expenses,
      SUM(amount) as total_amount,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
      COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
      SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approved_amount
    FROM expenses
  `);

  res.json({
    success: true,
    data: stats[0]
  });
});