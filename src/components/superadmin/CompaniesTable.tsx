
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  Edit,
  Trash2,
  User,
  Loader2
} from 'lucide-react';

interface Account {
  id: number;
  name: string;
  email: string;
  cnpj?: string;
  city?: string;
  state?: string;
  is_active: boolean;
  plan_name?: string;
  created_at: string;
}

interface CompaniesTableProps {
  accounts: Account[];
  loading: boolean;
  error: any;
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onCreateCompany: () => void;
  onCreateAdminUser: (accountId: number, accountName: string) => void;
  onToggleStatus: (accountId: number, currentStatus: boolean) => void;
  onDeleteCompany: (accountId: number) => void;
  createAccountMutationPending: boolean;
  updateAccountMutationPending: boolean;
  deleteAccountMutationPending: boolean;
}

export const CompaniesTable: React.FC<CompaniesTableProps> = ({
  accounts,
  loading,
  error,
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onCreateCompany,
  onCreateAdminUser,
  onToggleStatus,
  onDeleteCompany,
  createAccountMutationPending,
  updateAccountMutationPending,
  deleteAccountMutationPending
}) => {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Empresas</CardTitle>
            <CardDescription>Gerencie todas as contas do sistema</CardDescription>
          </div>
          
          <Button 
            onClick={onCreateCompany}
            disabled={loading || createAccountMutationPending}
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
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
                            onClick={() => onCreateAdminUser(account.id, account.name)}
                            className="text-blue-600"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            title={account.is_active ? 'Bloquear' : 'Desbloquear'}
                            onClick={() => onToggleStatus(account.id, account.is_active)}
                            className={account.is_active ? 'text-red-600' : 'text-green-600'}
                            disabled={updateAccountMutationPending}
                          >
                            {account.is_active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            title="Excluir"
                            onClick={() => onDeleteCompany(account.id)}
                            className="text-red-600"
                            disabled={deleteAccountMutationPending}
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
    </Card>
  );
};
