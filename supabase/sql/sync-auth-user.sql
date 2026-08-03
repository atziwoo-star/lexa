-- Ejecutar en el SQL editor del proyecto de Supabase (después de `prisma migrate deploy`).
-- Mantiene public.users en sync con auth.users cuando alguien se registra.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- updated_at no tiene default en la base: Prisma lo maneja a nivel de aplicación
  -- vía @updatedAt, así que este trigger (que hace un insert crudo) debe fijarlo a mano.
  insert into public.users (id, nombre, email, rol, idiomas, zona_horaria, moneda_preferida, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.email,
    'ALUMNO',
    '{}',
    coalesce(new.raw_user_meta_data->>'zona_horaria', 'UTC'),
    coalesce(new.raw_user_meta_data->>'moneda_preferida', 'USD'),
    now()
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
