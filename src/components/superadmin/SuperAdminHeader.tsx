
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, LogOut, User } from 'lucide-react';
import { UserProfile } from '@/hooks/useNewAuth';

interface SuperAdminHeaderProps {
  profile: UserProfile | undefined;
}

export const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({ profile }) => {
  return (
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
};
