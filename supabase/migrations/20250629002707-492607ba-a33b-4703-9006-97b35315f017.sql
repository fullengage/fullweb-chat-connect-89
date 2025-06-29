
-- Criar trigger para criar perfil de usuário automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, name, role, isactive, account_id)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', new.email), 
    'cliente', 
    true,
    1 -- Atribuir à conta padrão (ID 1)
  );
  RETURN new;
END;
$$;

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Garantir que existe uma conta padrão
INSERT INTO public.accounts (id, name, email, plan_id) 
VALUES (1, 'Conta Padrão', 'conta@sistema.com', 1)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email;
