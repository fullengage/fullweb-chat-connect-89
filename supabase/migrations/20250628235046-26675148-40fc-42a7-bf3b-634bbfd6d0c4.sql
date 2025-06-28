
-- Remover a constraint atual de role que está causando o problema
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Criar uma nova constraint que aceita os roles corretos incluindo 'admin'
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('superadmin', 'admin', 'agent', 'agente', 'user', 'usuario'));

-- Verificar se RLS está habilitado na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
