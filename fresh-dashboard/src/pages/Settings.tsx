import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Database, Globe, Trash2, Check, Users as UsersIcon, UserPlus, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected';
  lastSync?: string;
}

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
  status: 'active' | 'invited' | 'inactive';
  last_sign_in?: string;
  created_at: string;
}

interface NewMemberForm {
  email: string;
  full_name: string;
  role: string;
  department: string;
}

const Settings: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@example.com',
    phone: '+230 5XXX-XXXX',
    role: 'admin',
    department: 'finance'
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState<NewMemberForm>({
    email: '',
    full_name: '',
    role: 'viewer',
    department: 'finance'
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'New expense submitted',
      description: 'Marketing department submitted a new expense for approval',
      date: '2024-01-15',
      read: false,
      type: 'info'
    },
    {
      id: '2',
      title: 'Budget threshold exceeded',
      description: 'zimazë department has exceeded 90% of allocated budget',
      date: '2024-01-14',
      read: false,
      type: 'warning'
    },
    {
      id: '3',
      title: 'Invoice payment received',
      description: 'Payment received for invoice INV-2024-001',
      date: '2024-01-13',
      read: true,
      type: 'success'
    },
    {
      id: '4',
      title: 'Failed transaction',
      description: 'Bank reconciliation found unmatched transaction',
      date: '2024-01-12',
      read: true,
      type: 'error'
    }
  ]);

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Stripe',
      description: 'Payment processing and invoicing',
      status: 'connected',
      lastSync: '2024-01-15 10:30 AM'
    },
    {
      id: '2',
      name: 'QuickBooks',
      description: 'Accounting software integration',
      status: 'disconnected'
    },
    {
      id: '3',
      name: 'Slack',
      description: 'Team notifications and alerts',
      status: 'connected',
      lastSync: '2024-01-15 11:45 AM'
    },
    {
      id: '4',
      name: 'Google Drive',
      description: 'Document storage and backup',
      status: 'connected',
      lastSync: '2024-01-15 09:15 AM'
    }
  ]);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoadingMembers(true);
      
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data: { users }, error } = await supabase.auth.admin.listUsers();

      if (error) throw error;

      const members: TeamMember[] = users.map(user => {
        const status: 'active' | 'invited' | 'inactive' = user.email_confirmed_at ? 'active' : 'invited';
        return {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || 'Unknown',
          role: user.user_metadata?.role || 'viewer',
          department: user.user_metadata?.department || 'Not assigned',
          status,
          last_sign_in: user.last_sign_in_at || undefined,
          created_at: user.created_at
        };
      });

      setTeamMembers(members);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast.error('Failed to load team members');
      
      setTeamMembers([
        {
          id: '1',
          email: 'd@eeee.mu',
          full_name: 'Admin User',
          role: 'admin',
          department: 'finance',
          status: 'active',
          last_sign_in: new Date().toISOString(),
          created_at: '2024-01-01T00:00:00Z'
        }
      ]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleInviteMember = async () => {
    try {
      if (!newMember.email || !newMember.full_name) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { error } = await supabase.auth.admin.inviteUserByEmail(newMember.email, {
        data: {
          full_name: newMember.full_name,
          role: newMember.role,
          department: newMember.department
        },
        redirectTo: `${window.location.origin}/dashboard`
      });

      if (error) throw error;

      toast.success(`Invitation sent to ${newMember.email}`);
      setIsInviteDialogOpen(false);
      setNewMember({
        email: '',
        full_name: '',
        role: 'viewer',
        department: 'finance'
      });
      
      await loadTeamMembers();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Failed to send invitation');
    }
  };

  const handleUpdateMemberRole = async (userId: string, newRole: string) => {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { role: newRole }
      });

      if (error) throw error;

      toast.success('Member role updated successfully');
      await loadTeamMembers();
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
    }
  };

  const handleRemoveMember = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from the team?`)) {
      return;
    }

    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      toast.success('Member removed successfully');
      await loadTeamMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleSaveProfile = () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Profile updated successfully!');
    console.log('Saving profile data:', profileData);
  };

  const handleCancelProfile = () => {
    setProfileData({
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex.johnson@example.com',
      phone: '+230 5XXX-XXXX',
      role: 'admin',
      department: 'finance'
    });
    toast.info('Changes cancelled');
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    toast.success('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    console.log('Password changed');
  };

  const handleEndSession = (sessionType: string) => {
    toast.success(`${sessionType} session ended successfully`);
    console.log(`Ending ${sessionType} session`);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    toast.success('Marked as read');
  };

  const handleClearAllNotifications = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
      toast.success('All notifications cleared');
    }
  };

  const handleToggleIntegration = (id: string) => {
    setIntegrations(integrations.map(intg => 
      intg.id === id 
        ? { 
            ...intg, 
            status: intg.status === 'connected' ? 'disconnected' : 'connected',
            lastSync: intg.status === 'disconnected' ? new Date().toLocaleString() : intg.lastSync
          } 
        : intg
    ));
    const integration = integrations.find(i => i.id === id);
    if (integration) {
      toast.success(`${integration.name} ${integration.status === 'connected' ? 'disconnected' : 'connected'}`);
    }
  };

  const handleExportData = () => {
    toast.success('Data export started. You will receive an email when ready.');
    console.log('Exporting data...');
  };

  const handleDeleteAllData = () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      toast.error('Data deletion initiated. This may take a few minutes.');
      console.log('Deleting all data...');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'accountant': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'invited': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your financial dashboard preferences and system settings</p>
        </div>
        <Button 
          className="border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
          onClick={() => toast.success('Configuration exported successfully')}
        >
          Export Configuration
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-7">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden md:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            <span className="hidden md:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden md:inline">Data</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden md:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="mauritius">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mauritius">Mauritius Time (MUT) - GMT+4</SelectItem>
                      <SelectItem value="est">Eastern Time (ET) - GMT-5</SelectItem>
                      <SelectItem value="cst">Central Time (CT) - GMT-6</SelectItem>
                      <SelectItem value="pst">Pacific Time (PT) - GMT-8</SelectItem>
                      <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                      <SelectItem value="cet">Central European Time (CET) - GMT+1</SelectItem>
                      <SelectItem value="aest">Australian Eastern Time (AEST) - GMT+10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue="mur">
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mur">Mauritian Rupee (MUR) - ₨</SelectItem>
                      <SelectItem value="usd">US Dollar (USD) - $</SelectItem>
                      <SelectItem value="eur">Euro (EUR) - €</SelectItem>
                      <SelectItem value="gbp">British Pound (GBP) - £</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-gray-500">Switch to dark theme</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact View</Label>
                    <p className="text-sm text-gray-500">Reduce spacing between elements</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Charts</Label>
                    <p className="text-sm text-gray-500">Display charts on dashboard</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animations</Label>
                    <p className="text-sm text-gray-500">Enable UI animations</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-refresh Data</Label>
                    <p className="text-sm text-gray-500">Refresh data every 5 minutes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input 
                    id="first-name" 
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input 
                    id="last-name" 
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={profileData.role}
                  onValueChange={(value) => setProfileData({...profileData, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Department Manager</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Primary Department</Label>
                <Select 
                  value={profileData.department}
                  onValueChange={(value) => setProfileData({...profileData, department: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="musique">musiquë</SelectItem>
                    <SelectItem value="zimaze">zimazë</SelectItem>
                    <SelectItem value="boucan">bōucan</SelectItem>
                    <SelectItem value="talent">talënt</SelectItem>
                    <SelectItem value="moris">mōris</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  className="border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
                  onClick={handleCancelProfile}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage team members and their access permissions</CardDescription>
                </div>
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="member-email">Email Address *</Label>
                        <Input
                          id="member-email"
                          type="email"
                          placeholder="member@example.com"
                          value={newMember.email}
                          onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-name">Full Name *</Label>
                        <Input
                          id="member-name"
                          placeholder="John Doe"
                          value={newMember.full_name}
                          onChange={(e) => setNewMember({...newMember, full_name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-role">Role</Label>
                        <Select value={newMember.role} onValueChange={(value) => setNewMember({...newMember, role: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="manager">Department Manager</SelectItem>
                            <SelectItem value="accountant">Accountant</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-department">Department</Label>
                        <Select value={newMember.department} onValueChange={(value) => setNewMember({...newMember, department: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="musique">musiquë</SelectItem>
                            <SelectItem value="zimaze">zimazë</SelectItem>
                            <SelectItem value="boucan">bōucan</SelectItem>
                            <SelectItem value="talent">talënt</SelectItem>
                            <SelectItem value="moris">mōris</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInviteMember}>
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMembers ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading team members...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sign In</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.full_name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(member.role)}>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{member.department}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(member.status)}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.last_sign_in 
                            ? new Date(member.last_sign_in).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
                              onClick={() => {
                                const newRole = prompt('Enter new role (admin, manager, accountant, viewer):');
                                if (newRole) handleUpdateMemberRole(member.id, newRole);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-red-600"
                              onClick={() => handleRemoveMember(member.id, member.email)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleChangePassword}>Change Password</Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable 2FA</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Session Management</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-500">Chrome on Windows • Active now</p>
                    </div>
                    <Button 
                      className="border border-gray-300 bg-transparent hover:bg-gray-100 text-sm text-gray-700"
                      onClick={() => handleEndSession('Current')}
                    >
                      End Session
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mobile Session</p>
                      <p className="text-sm text-gray-500">Safari on iPhone • 2 hours ago</p>
                    </div>
                    <Button 
                      className="border border-gray-300 bg-transparent hover:bg-gray-100 text-sm text-gray-700"
                      onClick={() => handleEndSession('Mobile')}
                    >
                      End Session
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences and history</CardDescription>
                </div>
                <Button 
                  className="border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
                  onClick={handleClearAllNotifications}
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg border ${
                        notification.read ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                            <p className="text-xs text-gray-400 mt-2">{notification.date}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getNotificationColor(notification.type)}>
                              {notification.type}
                            </Badge>
                            {!notification.read && (
                              <Button
                                className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              className="h-8 w-8 p-0 border border-gray-300 bg-transparent hover:bg-gray-100 text-red-600"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export, backup, and manage your financial data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Data Export</h3>
                <p className="text-sm text-gray-600">
                  Export all your financial data including expenses, income, invoices, and reports in CSV or JSON format.
                </p>
                <Button onClick={handleExportData}>
                  Export All Data
                </Button>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-medium">Data Backup</h3>
                <p className="text-sm text-gray-600">
                  Create a backup of all your data. Backups are stored securely and can be restored at any time.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Last Backup</p>
                      <p className="text-sm text-gray-500">January 15, 2024 at 10:30 AM</p>
                    </div>
                    <Button className="border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700">
                      Restore
                    </Button>
                  </div>
                  <Button>Create New Backup</Button>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-medium text-red-600">Danger Zone</h3>
                <p className="text-sm text-gray-600">
                  Permanently delete all your data. This action cannot be undone.
                </p>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteAllData}
                >
                  Delete All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect and manage third-party services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div 
                    key={integration.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{integration.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                      {integration.lastSync && (
                        <p className="text-xs text-gray-400 mt-2">Last synced: {integration.lastSync}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        className={
                          integration.status === 'connected' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                        }
                      >
                        {integration.status}
                      </Badge>
                      <Button
                        className={
                          integration.status === 'connected'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }
                        onClick={() => handleToggleIntegration(integration.id)}
                      >
                        {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;