import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, User, FileEdit, DollarSign, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  status: 'success' | 'failed' | 'pending';
  ipAddress?: string;
}

const AuditTrail: React.FC = () => {
  const auditLogs: AuditLog[] = [
    {
      id: 1,
      timestamp: '2024-12-15 14:30:25',
      user: 'John Doe',
      action: 'CREATE',
      entity: 'Expense',
      entityId: 'EXP-2024-00123',
      details: 'Created new expense for studio equipment',
      status: 'success',
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      timestamp: '2024-12-15 13:45:12',
      user: 'Jane Smith',
      action: 'UPDATE',
      entity: 'Budget',
      entityId: 'BUD-2024-00456',
      details: 'Updated budget allocation for musiquë department',
      status: 'success',
      ipAddress: '192.168.1.101'
    },
    {
      id: 3,
      timestamp: '2024-12-15 12:15:48',
      user: 'Robert Chen',
      action: 'DELETE',
      entity: 'Invoice',
      entityId: 'INV-2024-00789',
      details: 'Deleted duplicate invoice record',
      status: 'success',
      ipAddress: '192.168.1.102'
    },
    {
      id: 4,
      timestamp: '2024-12-15 11:20:33',
      user: 'Admin User',
      action: 'LOGIN',
      entity: 'System',
      entityId: 'AUTH-001',
      details: 'User logged in from new device',
      status: 'success',
      ipAddress: '203.0.113.45'
    },
    {
      id: 5,
      timestamp: '2024-12-15 10:05:17',
      user: 'System',
      action: 'BACKUP',
      entity: 'Database',
      entityId: 'DB-001',
      details: 'Automatic daily backup completed',
      status: 'success'
    },
    {
      id: 6,
      timestamp: '2024-12-15 09:45:22',
      user: 'Maria Garcia',
      action: 'APPROVE',
      entity: 'Payment',
      entityId: 'PAY-2024-00321',
      details: 'Approved vendor payment',
      status: 'success',
      ipAddress: '192.168.1.103'
    },
    {
      id: 7,
      timestamp: '2024-12-15 08:30:15',
      user: 'System',
      action: 'SECURITY',
      entity: 'System',
      entityId: 'SEC-001',
      details: 'Failed login attempt detected',
      status: 'failed',
      ipAddress: '198.51.100.23'
    },
    {
      id: 8,
      timestamp: '2024-12-14 16:45:09',
      user: 'David Wilson',
      action: 'EXPORT',
      entity: 'Report',
      entityId: 'REP-2024-00567',
      details: 'Exported financial report to PDF',
      status: 'success',
      ipAddress: '192.168.1.104'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <FileEdit className="h-4 w-4 text-blue-500" />;
      case 'UPDATE':
        return <FileEdit className="h-4 w-4 text-purple-500" />;
      case 'DELETE':
        return <FileEdit className="h-4 w-4 text-red-500" />;
      case 'LOGIN':
        return <User className="h-4 w-4 text-green-500" />;
      case 'APPROVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'EXPORT':
        return <History className="h-4 w-4 text-orange-500" />;
      case 'BACKUP':
        return <History className="h-4 w-4 text-blue-500" />;
      case 'SECURITY':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Audit Trail
            </CardTitle>
            <CardDescription>
              Track all system activities and user actions
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Real-time Logging
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 text-sm font-medium text-gray-500 pb-2 border-b">
            <div className="col-span-1">Time & User</div>
            <div className="col-span-1">Action</div>
            <div className="col-span-1">Entity</div>
            <div className="col-span-1">Status & Details</div>
          </div>

          {auditLogs.map((log) => (
            <div key={log.id} className="grid grid-cols-4 items-center py-3 border-b hover:bg-gray-50 rounded px-2">
              <div className="col-span-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{log.timestamp.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500">{log.timestamp.split(' ')[1]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-600">{log.user}</p>
                </div>
                {log.ipAddress && (
                  <p className="text-xs text-gray-400 mt-1">IP: {log.ipAddress}</p>
                )}
              </div>

              <div className="col-span-1">
                <div className="flex items-center gap-2">
                  {getActionIcon(log.action)}
                  <div>
                    <Badge variant="outline" className="font-mono">
                      {log.action}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{log.entity}</p>
                  <p className="text-xs text-gray-500 font-mono">{log.entityId}</p>
                </div>
              </div>

              <div className="col-span-1">
                <div className="flex items-center justify-between">
                  {getStatusBadge(log.status)}
                  {getStatusIcon(log.status)}
                </div>
                <p className="text-sm mt-2">{log.details}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>Showing {auditLogs.length} recent audit logs</p>
              <p className="text-xs mt-1">Logs are retained for 90 days</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-gray-50">
                <History className="h-3 w-3 mr-1" />
                Total Logs: 1,247
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                98% Success Rate
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditTrail;