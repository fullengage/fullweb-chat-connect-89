
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

const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - pronto para integração com Supabase
  const [metrics, setMetrics] = useState({
    activeCompanies: 19,
    trialCompanies: 5,
    blockedCompanies: 2,
    totalCompanies: 26,
    mrr: 8400
  });

  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: 'Clínica Vida',
      cnpj: '12.345.678/0001-90',
      email: 'contato@clinicavida.com',
      status: 'active',
      plans: { name: 'Pro', price: 497 },
      subscriptions: [{ due_date: '2024-06-23', last_payment: '2024-05-23', status: 'overdue' }],
      created_at: '2024-01-15'
    },
    {
      id: 2,
      name: 'Agência ZYX',
      cnpj: '98.765.432/0001-10',
      email: 'contato@agenciazyx.com',
      status: 'active',
      plans: { name: 'Básico', price: 297 },
      subscriptions: [{ due_date: '2024-06-26', last_payment: '2024-05-26', status: 'overdue' }],
      created_at: '2024-02-10'
    },
    {
      id: 3,
      name: 'TechStart Solutions',
      cnpj: '11.222.333/0001-44',
      email: 'hello@techstart.com',
      status: 'active',
      plans: { name: 'Pro', price: 497 },
      subscriptions: [{ due_date: '2024-07-15', last_payment: '2024-06-15', status: 'active' }],
      created_at: '2024-03-05'
    },
    {
      id: 4,
      name: 'Consultoria ABC',
      cnpj: '55.666.777/0001-88',
      email: 'info@consultoriaabc.com',
      status: 'trial',
      plans: { name: 'Trial', price: 0 },
      subscriptions: [{ due_date: '2024-07-05', last_payment: null, status: 'trial' }],
      created_at: '2024-06-05'
    },
    {
      id: 5,
      name: 'Empresa Beta',
      cnpj: '99.888.777/0001-66',
      email: 'contato@beta.com',
      status: 'blocked',
      plans: { name: 'Básico', price: 297 },
      subscriptions: [{ due_date: '2024-06-10', last_payment: '2024-05-10', status: 'blocked' }],
      created_at: '2024-01-20'
    }
  ]);

  const [plans] = useState([
    { id: 1, name: 'Trial', price: 0 },
    { id: 2, name: 'Básico', price: 297 },
    { id: 3, name: 'Pro', price: 497 }
  ]);

  // Formulário de nova empresa
  const [newCompany, setNewCompany] = useState({
    name: '',
    cnpj: '',
    email: '',
    plan_id: '',
    is_trial: false
  });

  // Carregar dados iniciais (mock)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const createCompany = async () => {
    if (!newCompany.name || !newCompany.plan_id) return;
    
    setLoading(true);
    
    setTimeout(() => {
      const selectedPlan = plans.find(p => p.id.toString() === newCompany.plan_id);
      const newId = Math.max(...companies.map(c => c.id)) + 1;
      
      const dueDate = new Date();
      if (newCompany.is_trial) {
        dueDate.setDate(dueDate.getDate() + 30);
      } else {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }
      
      const company = {
        id: newId,
        name: newCompany.name,
        cnpj: newCompany.cnpj,
        email: newCompany.email,
        status: newCompany.is_trial ? 'trial' : 'active',
        plans: selectedPlan,
        subscriptions: [{
          due_date: dueDate.toISOString(),
          last_payment: newCompany.is_trial ? null : new Date().toISOString(),
          status: newCompany.is_trial ? 'trial' : 'active'
        }],
        created_at: new Date().toISOString()
      };
      
      setCompanies(prev => [company, ...prev]);
      
      const newStatus = newCompany.is_trial ? 'trial' : 'active';
      setMetrics(prev => ({
        ...prev,
        totalCompanies: prev.totalCompanies + 1,
        [newStatus === 'trial' ? 'trialCompanies' : 'activeCompanies']: prev[newStatus === 'trial' ? 'trialCompanies' : 'activeCompanies'] + 1,
        mrr: newStatus === 'active' ? prev.mrr + (selectedPlan?.price || 0) : prev.mrr
      }));
      
      setNewCompany({ name: '', cnpj: '', email: '', plan_id: '', is_trial: false });
      setIsCreateCompanyOpen(false);
      setLoading(false);
    }, 1000);
  };

  const toggleCompanyStatus = async (companyId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    
    setCompanies(prev => prev.map(company => 
      company.id === companyId 
        ? { 
            ...company, 
            status: newStatus,
            subscriptions: company.subscriptions.map(sub => ({ ...sub, status: newStatus }))
          }
        : company
    ));
    
    setMetrics(prev => ({
      ...prev,
      activeCompanies: newStatus === 'active' ? prev.activeCompanies + 1 : prev.activeCompanies - 1,
      blockedCompanies: newStatus === 'blocked' ? prev.blockedCompanies + 1 : prev.blockedCompanies - 1
    }));
  };

  const deleteCompany = async (companyId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    const company = companies.find(c => c.id === companyId);
    if (!company) return;
    
    setCompanies(prev => prev.filter(c => c.id !== companyId));
    
    setMetrics(prev => ({
      ...prev,
      totalCompanies: prev.totalCompanies - 1,
      [company.status === 'active' ? 'activeCompanies' : 
       company.status === 'trial' ? 'trialCompanies' : 'blockedCompanies']: 
       prev[company.status === 'active' ? 'activeCompanies' : 
           company.status === 'trial' ? 'trialCompanies' : 'blockedCompanies'] - 1,
      mrr: company.status === 'active' ? prev.mrr - (company.plans?.price || 0) : prev.mrr
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Ativa', className: 'bg-green-100 text-green-800' },
      trial: { label: 'Trial', className: 'bg-blue-100 text-blue-800' },
      blocked: { label: 'Bloqueada', className: 'bg-red-100 text-red-800' },
      overdue: { label: 'Em Débito', className: 'bg-orange-100 text-orange-800' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.active;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getDaysOverdue = (dueDate?: string) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = statusFilter === 'all';
    
    if (statusFilter === 'overdue') {
      const daysOverdue = getDaysOverdue(company.subscriptions?.[0]?.due_date);
      matchesStatus = daysOverdue > 0 && company.status === 'active';
    } else {
      matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  const overdueCompanies = companies.filter(company => {
    const daysOverdue = getDaysOverdue(company.subscriptions?.[0]?.due_date);
    return daysOverdue > 0 && company.status === 'active';
  });

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
          {overdueCompanies.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {overdueCompanies.length}
            </span>
          )}
        </Button>
        
        <Select defaultValue="user">
          <SelectTrigger className="w-auto">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Super Admin</span>
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
          <CardTitle className="text-sm font-medium">Em Trial</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{metrics.trialCompanies}</div>
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

  const AlertsSection = () => (
    overdueCompanies.length > 0 && (
      <Alert className="mb-8 border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <span>
              {overdueCompanies.length} empresa{overdueCompanies.length > 1 ? 's' : ''} com pagamento em atraso
            </span>
            <Button size="sm" variant="outline" className="ml-4" onClick={() => setActiveTab('companies')}>
              Ver Detalhes
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  );

  const CompaniesTable = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Empresas</CardTitle>
            <CardDescription>Gerencie todas as contas do sistema</CardDescription>
          </div>
          
          <Dialog open={isCreateCompanyOpen} onOpenChange={setIsCreateCompanyOpen}>
            <DialogTrigger asChild>
              <Button disabled={loading}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Empresa</DialogTitle>
                <DialogDescription>
                  Cadastre uma nova empresa no sistema
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Empresa</Label>
                  <Input 
                    id="name" 
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                    placeholder="Digite o nome da empresa" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input 
                    id="cnpj" 
                    value={newCompany.cnpj}
                    onChange={(e) => setNewCompany({...newCompany, cnpj: e.target.value})}
                    placeholder="00.000.000/0000-00" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={newCompany.email}
                    onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                    placeholder="contato@empresa.com" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="plan">Plano</Label>
                  <Select value={newCompany.plan_id} onValueChange={(value) => setNewCompany({...newCompany, plan_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} - R$ {plan.price}/mês
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="trial"
                    checked={newCompany.is_trial}
                    onChange={(e) => setNewCompany({...newCompany, is_trial: e.target.checked})}
                  />
                  <Label htmlFor="trial">Iniciar em trial (30 dias)</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateCompanyOpen(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button onClick={createCompany} disabled={loading || !newCompany.name || !newCompany.plan_id}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Criar Empresa
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="blocked">Bloqueadas</SelectItem>
              <SelectItem value="overdue">Em Débito</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Empresa</th>
                    <th className="text-left p-4 font-medium">CNPJ</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Plano</th>
                    <th className="text-left p-4 font-medium">Vencimento</th>
                    <th className="text-left p-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => {
                    const subscription = company.subscriptions?.[0];
                    const daysOverdue = getDaysOverdue(subscription?.due_date);
                    const status = daysOverdue > 0 && company.status === 'active' ? 'overdue' : company.status;
                    
                    return (
                      <tr key={company.id} className="border-b hover:bg-muted/25">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{company.name}</div>
                            {daysOverdue > 0 && company.status === 'active' && (
                              <div className="text-sm text-red-600">
                                {daysOverdue} dias em atraso
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{company.cnpj}</td>
                        <td className="p-4">{getStatusBadge(status)}</td>
                        <td className="p-4">{company.plans?.name || 'N/A'}</td>
                        <td className="p-4 text-sm">
                          {subscription?.due_date ? new Date(subscription.due_date).toLocaleDateString('pt-BR') : 'N/A'}
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
                              title={company.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                              onClick={() => toggleCompanyStatus(company.id, company.status)}
                              className={company.status === 'blocked' ? 'text-green-600' : 'text-red-600'}
                            >
                              {company.status === 'blocked' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Excluir"
                              onClick={() => deleteCompany(company.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const DashboardView = () => (
    <div className="space-y-8">
      <MetricsCards />
      <AlertsSection />
      
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
                {companies.slice(0, 5).map((company) => (
                  <div key={company.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-sm text-muted-foreground">{company.plans?.name || 'N/A'}</div>
                    </div>
                    {getStatusBadge(company.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : overdueCompanies.length > 0 ? (
              <div className="space-y-3">
                {overdueCompanies.map((company) => {
                  const daysOverdue = getDaysOverdue(company.subscriptions?.[0]?.due_date);
                  return (
                    <div key={company.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <div className="font-medium text-red-900">{company.name}</div>
                        <div className="text-sm text-red-700">{daysOverdue} dias em atraso</div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => toggleCompanyStatus(company.id, company.status)}
                      >
                        Bloquear
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum alerta no momento
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Planos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map(plan => (
                <div key={plan.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium">{plan.name}</h4>
                  <p className="text-2xl font-bold">R$ {plan.price}</p>
                  <p className="text-sm text-muted-foreground">por mês</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
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

  if (loading && companies.length === 0) {
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'companies' && <CompaniesTable />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default SuperAdmin;
