
-- Primeiro, vamos remover TODAS as políticas atuais e criar políticas mais restritivas
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
DROP POLICY IF EXISTS "Superadmins can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Superadmins can insert accounts" ON public.accounts;
DROP POLICY IF EXISTS "Superadmins can update accounts" ON public.accounts;
DROP POLICY IF EXISTS "Superadmins can delete accounts" ON public.accounts;
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;

-- Políticas para a tabela USERS (mais restritivas)
-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth_user_id = auth.uid());

-- Superadmins podem ver todos os usuários
CREATE POLICY "Superadmins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users su
            WHERE su.auth_user_id = auth.uid() 
            AND su.role = 'superadmin'
        )
    );

-- Admins podem ver usuários da sua conta
CREATE POLICY "Admins can view account users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users admin
            WHERE admin.auth_user_id = auth.uid() 
            AND admin.role = 'admin'
            AND admin.account_id = users.account_id
        )
    );

-- Service role para edge functions
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL USING (current_setting('role') = 'service_role');

-- Políticas para a tabela ACCOUNTS (muito restritivas)
-- APENAS superadmins podem ver contas
CREATE POLICY "Only superadmins can view accounts" ON public.accounts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- APENAS superadmins podem criar contas
CREATE POLICY "Only superadmins can create accounts" ON public.accounts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- APENAS superadmins podem atualizar contas
CREATE POLICY "Only superadmins can update accounts" ON public.accounts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- APENAS superadmins podem deletar contas
CREATE POLICY "Only superadmins can delete accounts" ON public.accounts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_user_id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- Políticas para PLANS (todos podem ver)
CREATE POLICY "Everyone can view plans" ON public.plans
    FOR SELECT USING (true);

-- Garantir que RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
