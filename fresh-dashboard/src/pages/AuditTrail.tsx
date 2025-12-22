import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarIcon, 
  Search, 
  Download, 
  Eye, 
  RefreshCw, 
  User, 
  FileText, 
  DollarSign, 
  Building, 
  Briefcase, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Trash2,
  LogIn,
  Settings,
  Users,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const AuditTrail: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const auditLogs = [
    { id: 1, timestamp: '2025-12-16 09:30:15', user: 'John Doe', action: 'CREATE', entity: 'Expense', entityId: 'EXP-001', details: 'Created new expense record', ipAddress: '192.168.1.100', status: 'success' },
    { id: 2, timestamp: '2025-12-16 09:25:42', user: 'Jane Smith', action: 'UPDATE', entity: 'Invoice', entityId: 'INV-045', details: 'Updated invoice status to paid', ipAddress: '192.168.1.101', status: 'success' },
    { id: 3, timestamp: '2025-12-16 09:15:18', user: 'Admin User', action: 'DELETE', entity: 'Department', entityId: 'DEPT-003', details: 'Deleted department record', ipAddress: '192.168.1.102', status: 'success' },
    { id: 4, timestamp: '2025-12-16 08:45:33', user: 'John Doe', action: 'LOGIN', entity: 'System', entityId: 'AUTH-001', details: 'User logged in', ipAddress: '192.168.1.100', status: 'success' },
    { id: 5, timestamp: '2025-12-16 08:30:22', user: 'Jane Smith', action: 'EXPORT', entity: 'Report', entityId: 'REP-012', details: 'Exported financial report', ipAddress: '192.168.1.101', status: 'success' },
    { id: 6, timestamp: '2025-12-15 16:20:55', user: 'System', action: 'BACKUP', entity: 'Database', entityId: 'DB-001', details: 'Automatic database backup', ipAddress: '127.0.0.1', status: 'success' },
    { id: 7, timestamp: '2025-12-15 14:15:10', user: 'Admin User', action: 'UPDATE', entity: 'User', entityId: 'USER-007', details: 'Updated user permissions', ipAddress: '192.168.1.102', status: 'success' },
    { id: 8, timestamp: '2025-12-15 11:05:47', user: 'John Doe', action: 'CREATE', entity: 'Project', entityId: 'PROJ-023', details: 'Created new project', ipAddress: '192.168.1.100', status: 'success' },
    { id: 9, timestamp: '2025-12-15 10:40:33', user: 'Jane Smith', action: 'FAILED_LOGIN', entity: 'System', entityId: 'AUTH-002', details: 'Failed login attempt', ipAddress: '192.168.1.105', status: 'failed' },
    { id: 10, timestamp: '2025-12-14 17:55:21', user: 'System', action: 'MAINTENANCE', entity: 'System', entityId: 'SYS-001', details: 'System maintenance window', ipAddress: '127.0.0.1', status: 'info' },
  ];

  const users = ['John Doe', 'Jane Smith', 'Admin User', 'System'];
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'BACKUP', 'FAILED_LOGIN', 'MAINTENANCE'];
  const entities = ['Expense', 'Income', 'Invoice', 'Department', 'Project', 'User', 'Report', 'System', 'Database'];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <FileText className="h-4 w-4" />;
      case 'UPDATE': return <RefreshCw className="h-4 w-4" />;
      case 'DELETE': return <Trash2 className="h-4 w-4" />;
      case 'LOGIN': return <LogIn className="h-4 w-4" />;
      case 'EXPORT': return <Download className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'LOGIN': return 'bg-purple-100 text-purple-800';
      case 'EXPORT': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesDate = !dateRange.from || !dateRange.to || 
      (new Date(log.timestamp) >= dateRange.from && new Date(log.timestamp) <= dateRange.to);
    const matchesUser = !userFilter || log.user === userFilter;
    const matchesAction = !actionFilter || log.action === actionFilter;
    const matchesEntity = !entityFilter || log.entity === entityFilter;
    const matchesSearch = !searchQuery || 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDate && matchesUser && matchesAction && matchesEntity && matchesSearch;
  });

  const handleClearFilters = () => {
    setDateRange({});
    setUserFilter('');
    setActionFilter('');
    setEntityFilter('');
    setSearchQuery('');
  };

  const handleExportLogs = () => {
    alert('Exporting audit logs...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Trail</h1>
          <p className="text-gray-600">Track all system activities and user actions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button onClick={handleClearFilters} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter audit logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
                    onSelect={(range) => setDateRange(range || {})}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* User Filter */}
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user} value={user}>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {user}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      <div className="flex items-center">
                        {getActionIcon(action)}
                        <span className="ml-2">{action}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity Filter */}
            <div className="space-y-2">
              <Label>Entity</Label>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entities.map((entity) => (
                    <SelectItem key={entity} value={entity}>
                      <div className="flex items-center">
                        {entity === 'Expense' && <DollarSign className="h-4 w-4 mr-2" />}
                        {entity === 'Department' && <Building className="h-4 w-4 mr-2" />}
                        {entity === 'Project' && <Briefcase className="h-4 w-4 mr-2" />}
                        {entity === 'System' && <Settings className="h-4 w-4 mr-2" />}
                        {!['Expense', 'Department', 'Project', 'System'].includes(entity) && <FileText className="h-4 w-4 mr-2" />}
                        {entity}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <Label>Search</Label>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search in logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Showing {filteredLogs.length} of {auditLogs.length} logs
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              Real-time Updates
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {log.timestamp}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {log.user}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("flex items-center space-x-1", getActionColor(log.action))}>
                        {getActionIcon(log.action)}
                        <span>{log.action}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {log.entity === 'Expense' && <DollarSign className="h-4 w-4 mr-2 text-gray-400" />}
                        {log.entity === 'Department' && <Building className="h-4 w-4 mr-2 text-gray-400" />}
                        {log.entity === 'Project' && <Briefcase className="h-4 w-4 mr-2 text-gray-400" />}
                        {log.entity === 'System' && <Settings className="h-4 w-4 mr-2 text-gray-400" />}
                        {!['Expense', 'Department', 'Project', 'System'].includes(log.entity) && <FileText className="h-4 w-4 mr-2 text-gray-400" />}
                        <span>{log.entity}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {log.entityId}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{log.ipAddress}</code>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("flex items-center space-x-1", getStatusColor(log.status))}>
                        {getStatusIcon(log.status)}
                        <span className="capitalize">{log.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No logs found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters or search query</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Page 1 of 1 • {filteredLogs.length} logs
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Logs Today</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed Actions</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <div className="p-2 rounded-lg bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Response Time</p>
                <p className="text-2xl font-bold">120ms</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditTrail;