# Financial Dashboard Backend API

Backend API server for the Financial Management Dashboard application.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your database credentials:

```bash
cp .env.example .env
```

Edit `.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u384688932_david
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### 3. Setup Database

Run the database migration to create tables:

```bash
# Connect to your MySQL database and run:
mysql -u your_username -p u384688932_david < migrations/001_initial_schema.sql
```

### 4. Start Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "role": "viewer"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "viewer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Department Endpoints

#### Get All Departments
```http
GET /api/departments
Authorization: Bearer {token}
```

#### Create Department
```http
POST /api/departments
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Marketing",
  "code": "MKT",
  "budget": 50000,
  "manager": "Jane Smith"
}
```

#### Update Department
```http
PUT /api/departments/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Marketing",
  "budget": 60000
}
```

#### Delete Department
```http
DELETE /api/departments/:id
Authorization: Bearer {token}
```

### Project Endpoints

#### Get All Projects
```http
GET /api/projects
Authorization: Bearer {token}
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Website Redesign",
  "code": "WEB-2025",
  "department_id": "musique",
  "budget": 80000,
  "start_date": "2025-01-01",
  "end_date": "2025-06-30",
  "manager": "John Doe",
  "team_size": 5
}
```

### Expense Endpoints

#### Get All Expenses
```http
GET /api/expenses
Authorization: Bearer {token}
```

#### Create Expense
```http
POST /api/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Office supplies",
  "amount": 1500,
  "category": "Office",
  "date": "2025-01-15",
  "department_id": "musique"
}
```

### Income Endpoints

#### Get All Income
```http
GET /api/income
Authorization: Bearer {token}
```

#### Create Income
```http
POST /api/income
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoice_number": "INV-2025-001",
  "client_name": "Tech Solutions Inc.",
  "amount": 12500,
  "date": "2025-01-15",
  "due_date": "2025-02-15",
  "status": "pending"
}
```

## 🔒 Authentication & Authorization

All API endpoints (except `/api/auth/register` and `/api/auth/login`) require authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer {your_token_here}
```

### User Roles

- **admin**: Full access to all features
- **manager**: Can create/edit departments, projects, expenses, income
- **accountant**: Can view and manage financial records
- **viewer**: Read-only access

## 🗄️ Database Schema

### Tables

- **users**: User accounts and authentication
- **departments**: Department information
- **projects**: Project management
- **expenses**: Expense tracking
- **income**: Income/revenue tracking
- **invoices**: Invoice management
- **audit_log**: System audit trail

## 🛠️ Development

### Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # Database connection
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.js
│   │   ├── departments.controller.js
│   │   └── ...
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # Authentication
│   │   ├── validation.js # Input validation
│   │   └── errorHandler.js
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   │   ├── auth.routes.js
│   │   ├── departments.routes.js
│   │   └── ...
│   ├── utils/           # Utility functions
│   └── index.js         # Server entry point
├── migrations/          # Database migrations
│   └── 001_initial_schema.sql
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

### Adding New Endpoints

1. Create controller in `src/controllers/`
2. Create routes in `src/routes/`
3. Add validation rules in `src/middleware/validation.js`
4. Import and use routes in `src/index.js`

## 🚀 Deployment

### Production Checklist

1. ✅ Set `NODE_ENV=production` in `.env`
2. ✅ Use strong JWT secrets
3. ✅ Configure CORS for your domain
4. ✅ Set up SSL/HTTPS
5. ✅ Configure rate limiting
6. ✅ Set up logging
7. ✅ Configure database backups
8. ✅ Set up monitoring

### Deploy to Server

```bash
# On your server
cd /path/to/server
npm install --production
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start src/index.js --name "financial-api"
pm2 save
pm2 startup
```

## 📝 Environment Variables

See `.env.example` for all available configuration options.

## 🔧 Troubleshooting

### Database Connection Issues

1. Verify database credentials in `.env`
2. Check if MySQL server is running
3. Ensure database `u384688932_david` exists
4. Check firewall settings

### Authentication Issues

1. Verify JWT_SECRET is set in `.env`
2. Check token expiration settings
3. Ensure CORS is configured correctly

## 📞 Support

For issues or questions, contact the development team.

## 📄 License

Proprietary - All rights reserved