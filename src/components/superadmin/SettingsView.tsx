
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const SettingsView: React.FC = () => {
  return (
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
};
