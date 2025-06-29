import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  Bell,
  Settings,
  BarChart3,
  Lock,
  Unlock,
  Eye,
  Edit,
  Trash2,
  LogOut,
  User,
  Loader2
} from 'lucide-react';
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '@/hooks/useAccounts';
import { NewAccountDialog } from '@/components/NewAccountDialog';
import { CreateAdminUserDialog } from '@/components/CreateAdminUserDialog';
import { RoleGuard } from '@/components/RoleGuard';
import { usePermissions } from '@/hooks/useNewAuth';

const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{id: number, name: string} | null>(null);
  
  const { profile, isSuperAdmin } = usePermissions();

  // Hooks do Supabase
  const { data: accounts = [], isLoading: loading, error } = useAccounts();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();

  // Calcular métricas baseadas nos dados reais
  const metrics = React.useMemo(() => {
    const activeCompanies = accounts.filter(acc => acc.is_active).length;
    const totalCompanies = accounts.length;
    const blockedCompanies = accounts.filter(acc => !acc.is_active).length;
    
    return {
      activeCompanies,
      trialCompanies: 0, // Pode ser implementado com base no plan_id
      blockedCompanies,
      totalCompanies,
      mrr: 0 // Pode ser calculado com base nos planos
    };
  }, [accounts]);

  const handleCreateCompany = async (accountData: any) => {
    try {
      const newAccount = await createAccountMutation.mutateAsync({
        name: accountData.name,
        email: accountData.email,
        phone: accountData.phone,
        cnpj: accountData.cnpj,
        city: accountData.city,
        state: accountData.state,
        industry: accountData.industry,
        description: accountData.description,
        plan_id: accountData.plan_id,
        is_active: true
      });
      
      setIsCreateCompanyOpen(false);
      
      // Após criar a empresa, perguntar se quer criar um admin
      setSelectedAccount({ id: newAccount.id, name: newAccount.name });
      setIsCreateAdminOpen(true);
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  const handleCreateAdminUser = (accountId: number, accountName: string) => {
    setSelectedAccount({ id: accountId, name: accountName });
    setIsCreateAdminOpen(true);
  };

  const toggleCompanyStatus = async (accountId: number, currentStatus: boolean) => {
    try {
      await updateAccountMutation.mutateAsync({
        id: accountId,
        name: accounts.find(acc => acc.id === accountId)?.name || '',
        email: accounts.find(acc => acc.id === accountId)?.email || '',
        is_active: !currentStatus
      });
    } catch (error) {
      console.error('Error toggling company status:', error);
    }
  };

  const deleteCompany = async (accountId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      await deleteAccountMutation.mutateAsync(accountId);
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {isActive ? 'Ativa' : 'Bloqueada'}
      </Badge>
    );
  };

  const filteredCompanies = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = statusFilter === 'all';
    
    if (statusFilter === 'active') {
      matchesStatus = account.is_active;
    } else if (statusFilter === 'blocked') {
      matchesStatus = !account.is_active;
    }
    
    return matchesSearch && matchesStatus;
  });

  // Verificar se o usuário é superadmin
  if (!isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="border-red-200 bg-red-50 max-w-md">
          <Lock className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Acesso negado. Esta área é restrita a Super Administradores.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const Header = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Hub - Super Admin</h1>
          <p className="text-sm text-gray-500">Painel de Administração</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
        </Button>
        
        <Select defaultValue="user">
          <SelectTrigger className="w-auto">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{profile?.name || 'Super Admin'}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="profile">Perfil</SelectItem>
            <SelectItem value="logout">
              <div className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className="bg-gray-50 w-64 min-h-screen border-r border-gray-200">
      <div className="p-6">
        <nav className="space-y-2">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Visão Geral
          </Button>
          
          <Button
            variant={activeTab === 'companies' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('companies')}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Empresas
          </Button>
          
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        </nav>
      </div>
    </div>
  );

  const MetricsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{metrics.activeCompanies}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{metrics.totalCompanies}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bloqueadas</CardTitle>
          <Lock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{metrics.blockedCompanies}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">MRR</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {metrics.mrr.toLocaleString()}</div>
        </CardContent>
      </Card>
    </div>
  );

  const CompaniesTable = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Empresas</CardTitle>
            <CardDescription>Gerencie todas as contas do sistema</CardDescription>
          </div>
          
          <Button 
            onClick={() => setIsCreateCompanyOpen(true)}
            disabled={loading || createAccountMutation.isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Empresa
          </Button>
        </div>
        
        <div className="flex space-x-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="blocked">Bloqueadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Erro ao carregar empresas: {error.message}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Empresa</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">CNPJ</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Plano</th>
                    <th className="text-left p-4 font-medium">Criado em</th>
                    <th className="text-left p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((account) => (
                    <tr key={account.id} className="border-b hover:bg-muted/25">
                      <td className="p-4">
                        <div className="font-medium">{account.name}</div>
                        {account.city && account.state && (
                          <div className="text-sm text-muted-foreground">
                            {account.city}, {account.state}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{account.email}</td>
                      <td className="p-4 text-sm text-muted-foreground">{account.cnpj || 'N/A'}</td>
                      <td className="p-4">{getStatusBadge(account.is_active)}</td>
                      <td className="p-4">{account.plan_name || 'N/A'}</td>
                      <td className="p-4 text-sm">
                        {new Date(account.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" title="Ver detalhes">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            title="Criar Admin"
                            onClick={() => handleCreateAdminUser(account.id, account.name)}
                            className="text-blue-600"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            title={account.is_active ? 'Bloquear' : 'Desbloquear'}
                            onClick={() => toggleCompanyStatus(account.id, account.is_active)}
                            className={account.is_active ? 'text-red-600' : 'text-green-600'}
                            disabled={updateAccountMutation.isPending}
                          >
                            {account.is_active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            title="Excluir"
                            onClick={() => deleteCompany(account.id)}
                            className="text-red-600"
                            disabled={deleteAccountMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
      
      <NewAccountDialog
        open={isCreateCompanyOpen}
        onOpenChange={setIsCreateCompanyOpen}
        onSave={handleCreateCompany}
      />
      
      <CreateAdminUserDialog
        open={isCreateAdminOpen}
        onOpenChange={setIsCreateAdminOpen}
        accountId={selectedAccount?.id || 0}
        accountName={selectedAccount?.name || ''}
        onSuccess={() => {
          // Optionally refresh data or show success message
        }}
      />
    </Card>
  );

  const DashboardView = () => (
    <div className="space-y-8">
      <MetricsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Empresas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.slice(0, 5).map((account) => (
                  <div key={account.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{account.name}</div>
                      <div className="text-sm text-muted-foreground">{account.plan_name || 'N/A'}</div>
                    </div>
                    {getStatusBadge(account.is_active)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Conexão com Banco</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Total de Empresas</span>
                <span className="font-medium">{metrics.totalCompanies}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Empresas Ativas</span>
                <span className="font-medium text-green-600">{metrics.activeCompanies}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Status da Conexão com Supabase</Label>
              <div className="flex items-center space-x-2 mt-1">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Conectado</span>
              </div>
            </div>
            <div>
              <Label>URL da API</Label>
              <Input value="https://brjjbrtbgrvbhnbfksxc.supabase.co" disabled />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading && accounts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard requireSuperAdmin>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CRM Hub - Super Admin</h1>
              <p className="text-sm text-gray-500">Painel de Administração</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
            
            <Select defaultValue="user">
              <SelectTrigger className="w-auto">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{profile?.name || 'Super Admin'}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profile">Perfil</SelectItem>
                <SelectItem value="logout">
                  <div className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex">
          {/* Sidebar */}
          <div className="bg-gray-50 w-64 min-h-screen border-r border-gray-200">
            <div className="p-6">
              <nav className="space-y-2">
                <Button
                  variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('dashboard')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Visão Geral
                </Button>
                
                <Button
                  variant={activeTab === 'companies' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('companies')}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Empresas
                </Button>
                
                <Button
                  variant={activeTab === 'settings' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Button>
              </nav>
            </div>
          </div>
          
          <main className="flex-1 p-8">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* ... keep existing code (metrics cards) */}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* ... keep existing code (recent companies and system status cards) */}
                </div>
              </div>
            )}
            {activeTab === 'companies' && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Empresas</CardTitle>
                      <CardDescription>Gerencie todas as contas do sistema</CardDescription>
                    </div>
                    
                    <Button 
                      onClick={() => setIsCreateCompanyOpen(true)}
                      disabled={loading || createAccountMutation.isPending}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Empresa
                    </Button>
                  </div>
                  
                  <div className="flex space-x-4 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar empresas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="active">Ativas</SelectItem>
                        <SelectItem value="blocked">Bloqueadas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* ... keep existing code (companies table) */}
                </CardContent>
                
                <NewAccountDialog
                  open={isCreateCompanyOpen}
                  onOpenChange={setIsCreateCompanyOpen}
                  onSave={handleCreateCompany}
                />
                
                <CreateAdminUserDialog
                  open={isCreateAdminOpen}
                  onOpenChange={setIsCreateAdminOpen}
                  accountId={selectedAccount?.id || 0}
                  accountName={selectedAccount?.name || ''}
                  onSuccess={() => {
                    // Optionally refresh data or show success message
                  }}
                />
              </Card>
            )}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* ... keep existing code (settings view) */}
              </div>
            )}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
};

export default SuperAdmin;
