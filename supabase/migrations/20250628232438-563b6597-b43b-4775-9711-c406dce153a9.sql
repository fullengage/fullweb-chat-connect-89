
-- Primeiro, vamos remover algumas políticas conflitantes e criar políticas mais específicas

-- Remover política muito permissiva na tabela users
DROP POLICY IF EXISTS "Users can call get_valid_users function" ON public.users;

-- Criar políticas para a tabela accounts (necessárias para o Super Admin)
DROP POLICY IF EXISTS "Superadmins can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Superadmins can manage all accounts" ON public.accounts;

CREATE POLICY "Superadmins can view all accounts" ON public.accounts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins can insert accounts" ON public.accounts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins can update accounts" ON public.accounts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins can delete accounts" ON public.accounts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- Políticas para permitir que superadmins criem usuários admin
DROP POLICY IF EXISTS "Superadmins can create admin users" ON public.users;
DROP POLICY IF EXISTS "Admins can view users in their account" ON public.users;

CREATE POLICY "Superadmins can create admin users" ON public.users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users manager
            WHERE manager.auth_user_id = auth.uid() 
            AND manager.role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users manager
            WHERE manager.auth_user_id = auth.uid() 
            AND manager.role = 'superadmin'
        )
    );

CREATE POLICY "Admins can view users in their account" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users manager
            WHERE manager.auth_user_id = auth.uid() 
            AND manager.role = 'admin'
            AND manager.account_id = users.account_id
        )
    );

-- Habilitar RLS na tabela accounts se ainda não estiver habilitado
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam informações básicas de planos
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;
CREATE POLICY "Anyone can view plans" ON public.plans
    FOR SELECT USING (true);

-- Habilitar RLS na tabela plans se ainda não estiver habilitado
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
