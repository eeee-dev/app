# Financial Dashboard - Enhanced File Structure

```
shadcn-ui/
├── src/
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # Application entry point
│   ├── index.css                  # Global styles
│   ├── vite-env.d.ts              # Vite type definitions
│   │
│   ├── components/                # Reusable UI components
│   │   ├── ui/                    # Shadcn-ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── Header.tsx         # Application header
│   │   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   │    └── Layout.tsx         # Main layout wrapper
│   │   │
│   │   ├── dashboard/             # Dashboard components
│   │   │   ├── StatsCards.tsx     # Statistics cards
│   │   │   ├── DepartmentOverview.tsx
│   │   │   ├── RecentExpenses.tsx
│   │   │   ├── FinancialAnalytics.tsx
│   │   │   ├── Notifications.tsx
│   │   │   ├── AuditTrail.tsx
│   │   │   ├── ProjectManagement.tsx
│   │   │   └── ExportReports.tsx
│   │   │
│   │   ├── projects/              # Project management components
│   │   │   ├── ProjectList.tsx    # Project listing with filters
│   │   │   ├── ProjectForm.tsx    # Create/edit project form
│   │   │   ├── ProjectCard.tsx    # Individual project card
│   │   │   ├── ProjectDetails.tsx # Project detail view
│   │   │   ├── ProjectFinancials.tsx # Project financial summary
│   │   │   ├── TeamManagement.tsx # Project team assignment
│   │   │   └── ProjectStatusBadge.tsx # Project status indicator
│   │   │
│   │   ├── clients/               # Client management components
│   │   │   ├── ClientList.tsx     # Client directory
│   │   │   ├── ClientForm.tsx     # Create/edit client form
│   │   │   ├── ClientCard.tsx     # Individual client card
│   │   │   ├── ClientProfile.tsx  # Client detail view
│   │   │   ├── ClientTransactions.tsx # Client transaction history
│   │   │   ├── ClientDocuments.tsx # Client document management
│   │   │   └── ClientStatusBadge.tsx # Client status indicator
│   │   │
│   │   ├── income/                # Enhanced income components
│   │   │   ├── IncomeList.tsx     # Income listing with filters
│   │   │   ├── IncomeForm.tsx     # Create/edit income form
│   │   │   ├── IncomeCard.tsx     # Individual income entry
│   │   │   ├── PaymentTracking.tsx # Payment status management
│   │   │   ├── RecurringIncome.tsx # Recurring income management
│   │   │    └── IncomeScanner.tsx  # Invoice scanning/OCR
│   │   │
│   │   ├── expenses/              # Enhanced expense components
│   │   │   ├── ExpenseList.tsx    # Expense listing with filters
│   │   │   ├── ExpenseForm.tsx    # Create/edit expense form
│   │   │   ├── ExpenseCard.tsx    # Individual expense entry
│   │   │   ├── ExpenseApproval.tsx # Expense approval workflow
│   │   │   ├── ExpenseCategories.tsx # Expense category management
│   │   │    └── ReceiptUpload.tsx  # Receipt upload and processing
│   │   │
│   │   ├── reports/               # Reporting components
│   │   │   ├── ReportBuilder.tsx  # Custom report builder
│   │   │   ├── ReportTemplates.tsx # Predefined report templates
│   │   │   ├── FinancialSummary.tsx # Financial summary report
│   │   │   ├── ProjectReport.tsx  # Project-specific reports
│   │   │   ├── ClientReport.tsx   # Client-specific reports
│   │   │   └── ExportOptions.tsx  # Report export options
│   │   │
│   │   ├── forms/                 # Enhanced form components
│   │   │   ├── ValidatedInput.tsx # Input with real-time validation
│   │   │   ├── FormValidation.tsx # Form validation utilities
│   │   │   ├── DepartmentSelect.tsx # Department selection with validation
│   │   │   ├── ProjectSelect.tsx  # Project selection (filtered by department)
│   │   │   ├── ClientSelect.tsx   # Client selection with search
│   │   │    └── CurrencyInput.tsx  # Currency input with formatting
│   │   │
│   │   ├── banking/               # Banking integration components
│   │   │   ├── BankStatementUpload.tsx
│   │   │   ├── TransactionMatcher.tsx
│   │   │    └── BankReconciliation.tsx
│   │   │
│   │   └── import/                # Bulk import components
│   │       ├── BulkImportWizard.tsx
│   │       └── ImportTemplates.tsx
│   │
│   ├── pages/                     # Application pages
│   │   ├── Dashboard.tsx          # Main dashboard
│   │   ├── Expenses.tsx           # Expenses management page
│   │   ├── Income.tsx             # Enhanced income tracking page
│   │   ├── Projects.tsx           # Project management page
│   │   ├── Clients.tsx            # Client management page
│   │   ├── Invoices.tsx           # Invoice management page
│   │   ├── Reports.tsx            # Reports and analytics page
│   │   ├── BankStatements.tsx     # Bank statement management
│   │   └── Settings.tsx           # User and system settings
│   │
│   ├── lib/                       # Library and utility functions
│   │   ├── supabase.ts            # Enhanced Supabase client with new services
│   │   ├── api/                   # API service modules
│   │   │   ├── projectService.ts  # Project API service
│   │   │   ├── clientService.ts   # Client API service
│   │   │   ├── incomeService.ts   # Enhanced income service
│   │   │   ├── expenseService.ts  # Enhanced expense service
│   │   │   ├── reportService.ts   # Report generation service
│   │   │   └── validationService.ts # Form validation service
│   │   │
│   │   ├── utils/                 # Utility functions
│   │   │   ├── currency.ts        # Currency formatting and calculations
│   │   │   ├── date.ts           # Date formatting and utilities
│   │   │   ├── validation.ts     # Validation helper functions
│   │   │   ├── formatters.ts     # Data formatting utilities
│   │   │   └── calculations.ts   # Financial calculations
│   │   │
│   │   └── types/                 # TypeScript type definitions
│   │       ├── index.ts          # Main type exports
│   │       ├── project.ts        # Project related types
│   │       ├── client.ts         # Client related types
│   │       ├── income.ts         # Income related types
│   │       ├── expense.ts        # Expense related types
│   │       ├── department.ts     # Department related types
│   │       └── api.ts            # API response types
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useProjects.ts        # Project data and operations
│   │   ├── useClients.ts         # Client data and operations
│   │   ├── useIncome.ts          # Income data and operations
│   │   ├── useExpenses.ts        # Expense data and operations
│   │   ├── useDepartments.ts     # Department data and operations
│   │   ├── useFormValidation.ts  # Form validation hooks
│   │   └── useRealTimeUpdates.ts # Real-time data updates
│   │
│   └── services/                  # Business logic services
│       ├── projectManager.ts      # Project management logic
│       ├── clientManager.ts       # Client management logic
│       ├── financialCalculator.ts # Financial calculations
│       ├── reportGenerator.ts     # Report generation logic
│       └── notificationService.ts # Notification and alerts
│
├── public/                        # Static assets
│   ├── assets/                   # Images and icons
│   ├── favicon.svg
│   └── robots.txt
│
├── database/                      # Database scripts and migrations
│   ├── migrations/               # Database migration scripts
│   │   ├── 001_create_projects_table.sql
│   │   ├── 002_create_clients_table.sql
│   │   ├── 003_enhance_income_table.sql
│   │   ├── 004_enhance_expenses_table.sql
│   │   ├── 005_create_project_team_members.sql
│   │    └── 006_add_constraints_indexes.sql
│   │
│   ├── seeds/                    # Seed data for development
│   │   ├── departments.sql
│   │   ├── projects.sql
│   │   ├── clients.sql
│   │    └── sample_data.sql
│   │
│   └── functions/                # Database functions
│       ├── update_project_spent.sql
│       ├── update_department_spent.sql
│       ├── calculate_project_financials.sql
│       └── validate_project_budget.sql
│
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── services/
│   │
│   ├── integration/              # Integration tests
│   │   ├── api/
│   │   └── database/
│   │
│    └── e2e/                      # End-to-end tests
│       ├── dashboard.spec.ts
│       ├── projects.spec.ts
│       ├── clients.spec.ts
│       └── income.spec.ts
│
├── docs/                         # Documentation
│   ├── api/                      # API documentation
│   │   ├── projects.md
│   │   ├── clients.md
│   │   ├── income.md
│   │    └── expenses.md
│   │
│   ├── database/                 # Database documentation
│   │   ├── schema.md
│   │   ├── relationships.md
│   │    └── constraints.md
│   │
│    └── guides/                   # User and developer guides
│       ├── getting-started.md
│       ├── project-management.md
│       ├── client-management.md
│        └── reporting.md
│
├── config/                       # Configuration files
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│    └── eslint.config.js
│
└── root files                   # Project configuration
    ├── package.json
    ├── tsconfig.json
    ├── README.md
    ├── todo.md                  # Development task list
    ├── architect.plantuml       # System architecture diagram
    ├── class_diagram.plantuml   # Class diagram
    ├── sequence_diagram.plantuml # Sequence diagram
    ├── er_diagram.plantuml      # Database ER diagram
    ├── ui_navigation.plantuml   # UI navigation flow
    ├── system_design.md         # This system design document
    └── file_tree.md            # This file structure document
```

## Key Implementation Notes

### 1. Database Migration Strategy
- All new tables follow naming convention: `app_[app_id]_[table_name]`
- Foreign key relationships maintain data integrity
- Row Level Security policies for data isolation
- Database functions for complex business logic

### 2. API Service Structure
- Each entity has dedicated service module
- Services handle validation, business logic, and database operations
- Consistent error handling and response formats
- Real-time subscriptions for live updates

### 3. Component Organization
- Feature-based component grouping
- Reusable UI components in `components/ui/`
- Business logic components in feature directories
- Form components with built-in validation

### 4. Type Safety
- Comprehensive TypeScript interfaces for all data structures
- Strict type checking for API responses
- Type-safe form validation
- Consistent error types

### 5. Testing Strategy
- Unit tests for components, hooks, and utilities
- Integration tests for API services
- E2E tests for critical user flows
- Database migration tests

### 6. Performance Considerations
- Pagination for large data sets
- Optimized database queries with proper indexes
- Lazy loading for non-critical components
- Caching strategies for frequently accessed data

## Development Workflow

1. **Database First**: Create migrations for new tables and relationships
2. **API Services**: Implement backend services with proper validation
3. **Type Definitions**: Define TypeScript interfaces for new entities
4. **UI Components**: Build React components with proper state management
5. **Integration**: Connect components to API services
6. **Testing**: Write comprehensive tests for new functionality
7. **Documentation**: Update documentation for new features

## Integration Points

### Existing Features to Enhance:
- **Expense Management**: Add project classification and enhanced validation
- **Income Tracking**: Add client/project association and payment tracking
- **Dashboard**: Add project and client overview widgets
- **Reports**: Add project and client-specific reporting

### New Features to Implement:
- **Project Management**: Complete project lifecycle management
- **Client Management**: Comprehensive client information system
- **Enhanced Forms**: Real-time validation and duplicate detection
- **Advanced Reporting**: Custom report builder and templates

## Security Considerations

1. **Row Level Security**: Department and user-based data access control
2. **Input Validation**: Server-side validation for all user inputs
3. **API Rate Limiting**: Prevent abuse of API endpoints
4. **Audit Logging**: Track all financial transactions and changes
5. **Data Encryption**: Sensitive data encryption at rest and in transit

## Deployment Checklist

- [ ] Database migrations applied successfully
- [ ] Row Level Security policies configured
- [ ] Environment variables set for production
- [ ] Performance testing completed
- [ ] Security audit completed
- [ ] User training materials prepared
- [ ] Rollback plan documented
- [ ] Monitoring and alerting configured

---

*This file structure provides a clear roadmap for implementing the enhanced financial dashboard features while maintaining consistency with the existing codebase.*