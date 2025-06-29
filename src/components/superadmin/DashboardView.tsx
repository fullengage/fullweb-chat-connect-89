
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { MetricsCards } from './MetricsCards';

interface Account {
  id: number;
  name: string;
  plan_name?: string;
  is_active: boolean;
}

interface DashboardViewProps {
  metrics: {
    activeCompanies: number;
    totalCompanies: number;
    blockedCompanies: number;
    mrr: number;
  };
  accounts: Account[];
  loading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  metrics, 
  accounts, 
  loading 
}) => {
  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {isActive ? 'Ativa' : 'Bloqueada'}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <MetricsCards metrics={metrics} />
      
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
};
