
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Building2, Settings } from 'lucide-react';

interface SuperAdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="bg-gray-50 w-64 min-h-screen border-r border-gray-200">
      <div className="p-6">
        <nav className="space-y-2">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onTabChange('dashboard')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Visão Geral
          </Button>
          
          <Button
            variant={activeTab === 'companies' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onTabChange('companies')}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Empresas
          </Button>
          
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onTabChange('settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        </nav>
      </div>
    </div>
  );
};
