
-- Limpar todas as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Superadmins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view account users" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
DROP POLICY IF EXISTS "Service role can update users" ON public.users;

DROP POLICY IF EXISTS "Only superadmins can view accounts" ON public.accounts;
DROP POLICY IF EXISTS "Only superadmins can create accounts" ON public.accounts;
DROP POLICY IF EXISTS "Only superadmins can update accounts" ON public.accounts;
DROP POLICY IF EXISTS "Only superadmins can delete accounts" ON public.accounts;

DROP POLICY IF EXISTS "Everyone can view plans" ON public.plans;

-- Criar função auxiliar para verificar papel do usuário (evita recursão)
CREATE OR REPLACE FUNCTION public.get_user_role(user_auth_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE auth_user_id = user_auth_id LIMIT 1;
$$;

-- Criar função auxiliar para verificar account_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_account_id(user_auth_id uuid)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT account_id FROM public.users WHERE auth_user_id = user_auth_id LIMIT 1;
$$;

-- Políticas para USERS (sem recursão)
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Superadmins can view all users" ON public.users
    FOR SELECT USING (public.get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Admins can view account users" ON public.users
    FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'admin' 
        AND account_id = public.get_user_account_id(auth.uid())
    );

-- Service role para operações do sistema
CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL USING (current_user = 'service_role');

-- Políticas para ACCOUNTS (apenas superadmins)
CREATE POLICY "Superadmins can view accounts" ON public.accounts
    FOR SELECT USING (public.get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Superadmins can insert accounts" ON public.accounts
    FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Superadmins can update accounts" ON public.accounts
    FOR UPDATE USING (public.get_user_role(auth.uid()) = 'superadmin');

CREATE POLICY "Superadmins can delete accounts" ON public.accounts
    FOR DELETE USING (public.get_user_role(auth.uid()) = 'superadmin');

-- Política para PLANS (todos podem ver)
CREATE POLICY "Everyone can view plans" ON public.plans
    FOR SELECT USING (true);

-- Garantir que RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
