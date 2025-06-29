
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '@/hooks/useAccounts';
import { NewAccountDialog } from '@/components/NewAccountDialog';
import { CreateAdminUserDialog } from '@/components/CreateAdminUserDialog';
import { RoleGuard } from '@/components/RoleGuard';
import { usePermissions } from '@/hooks/useNewAuth';
import { SuperAdminHeader } from '@/components/superadmin/SuperAdminHeader';
import { SuperAdminSidebar } from '@/components/superadmin/SuperAdminSidebar';
import { DashboardView } from '@/components/superadmin/DashboardView';
import { CompaniesTable } from '@/components/superadmin/CompaniesTable';
import { SettingsView } from '@/components/superadmin/SettingsView';

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
        <SuperAdminHeader profile={profile} />
        
        <div className="flex">
          <SuperAdminSidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <main className="flex-1 p-8">
            {activeTab === 'dashboard' && (
              <DashboardView 
                metrics={metrics}
                accounts={accounts}
                loading={loading}
              />
            )}
            
            {activeTab === 'companies' && (
              <CompaniesTable
                accounts={accounts}
                loading={loading}
                error={error}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
                onCreateCompany={() => setIsCreateCompanyOpen(true)}
                onCreateAdminUser={handleCreateAdminUser}
                onToggleStatus={toggleCompanyStatus}
                onDeleteCompany={deleteCompany}
                createAccountMutationPending={createAccountMutation.isPending}
                updateAccountMutationPending={updateAccountMutation.isPending}
                deleteAccountMutationPending={deleteAccountMutation.isPending}
              />
            )}
            
            {activeTab === 'settings' && <SettingsView />}
          </main>
        </div>
        
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
      </div>
    </RoleGuard>
  );
};

export default SuperAdmin;
