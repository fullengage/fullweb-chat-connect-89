
-- Primeiro, vamos remover TODAS as políticas existentes nas tabelas users e accounts
DROP POLICY IF EXISTS "Users can call get_valid_users function" ON public.users;
DROP POLICY IF EXISTS "Superadmins can view all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Superadmins can manage all accounts" ON public.accounts;
DROP POLICY IF EXISTS "Superadmins can insert accounts" ON public.accounts;
DROP POLICY IF EXISTS "Superadmins can update accounts" ON public.accounts;
DROP POLICY IF EXISTS "Superadmins can delete accounts" ON public.accounts;
DROP POLICY IF EXISTS "Superadmins can create admin users" ON public.users;
DROP POLICY IF EXISTS "Superadmins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view users in their account" ON public.users;
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;

-- Agora vamos criar as políticas corretas sem recursão
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

-- Para usuários, vamos usar uma abordagem diferente para evitar recursão
-- Permitir que usuários autenticados vejam apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth_user_id = auth.uid());

-- Permitir que o service role faça operações (necessário para edge functions)
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL USING (true);

-- Habilitar RLS nas tabelas
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Política simples para planos (todos podem ver)
CREATE POLICY "Anyone can view plans" ON public.plans
    FOR SELECT USING (true);
