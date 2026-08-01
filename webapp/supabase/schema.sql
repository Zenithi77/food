-- Хүнс маркет — Supabase схем
-- Ажиллуулах: Supabase Dashboard → SQL Editor → New query → энэ бүх кодыг буулгаад "Run"

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null default '',
  password_hash text not null,
  role text not null default 'CUSTOMER',
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamptz not null default now()
);

alter table categories add column if not exists image_url text;

create table if not exists subcategories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid not null references categories(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric not null,
  unit text not null,
  category_id uuid not null references categories(id),
  subcategory_id uuid references subcategories(id),
  image_url text not null,
  stock integer not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  status text not null default 'PENDING',
  total numeric not null,
  address text not null default '',
  phone text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null,
  price numeric not null
);

create index if not exists idx_subcategories_category_id on subcategories(category_id);
create index if not exists idx_products_category_id on products(category_id);
create index if not exists idx_products_subcategory_id on products(subcategory_id);
create index if not exists idx_products_stock on products(stock);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_order_items_order_id on order_items(order_id);

-- Row Level Security — сервер тал маань зөвхөн service_role түлхүүрээр хандах тул
-- (service_role нь RLS-ийг үргэлж алгасдаг), энгийн клиент (anon)-аас шууд бичихийг хаана.
alter table users enable row level security;
alter table categories enable row level security;
alter table subcategories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Бүтээгдэхүүн, ангиллыг хэн ч (anon) уншиж болно (дэлгүүрийн жагсаалт нээлттэй байх ёстой тул)
drop policy if exists "Public read categories" on categories;
create policy "Public read categories" on categories for select using (true);

drop policy if exists "Public read subcategories" on subcategories;
create policy "Public read subcategories" on subcategories for select using (true);

drop policy if exists "Public read products" on products;
create policy "Public read products" on products for select using (true);

-- users/orders/order_items нь зөвхөн service_role-оор (манай Next.js сервер) хандана,
-- тиймээс энд public select/write policy зориудаар нэмээгүй болно.

-- Захиалга үүсгэх функц: нөөц шалгах, дүн тооцох, захиалга+мөрүүд үүсгэх,
-- нөөц хасахыг НЭГ Postgres гүйлгээ (transaction) дотор атомик байдлаар хийнэ.
create or replace function create_order(
  p_user_id uuid,
  p_address text,
  p_phone text,
  p_note text,
  p_items jsonb -- [{"product_id": "uuid", "quantity": 2}, ...]
) returns uuid
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product products%rowtype;
  v_subtotal numeric := 0;
  v_shipping numeric;
  v_vat numeric;
  v_total numeric;
begin
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from products where id = (v_item->>'product_id')::uuid for update;
    if not found then
      raise exception 'Зарим бараа боломжгүй боллоо.';
    end if;
    if v_product.stock < (v_item->>'quantity')::int then
      raise exception '% барааны нөөц хүрэлцэхгүй байна.', v_product.name;
    end if;
    v_subtotal := v_subtotal + v_product.price * (v_item->>'quantity')::int;
  end loop;

  v_shipping := case when v_subtotal >= 50000 then 0 else 5000 end;
  v_vat := v_subtotal * 0.1;
  v_total := v_subtotal + v_shipping + v_vat;

  insert into orders (user_id, status, total, address, phone, note)
  values (p_user_id, 'PENDING', v_total, p_address, p_phone, p_note)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from products where id = (v_item->>'product_id')::uuid;

    insert into order_items (order_id, product_id, quantity, price)
    values (v_order_id, v_product.id, (v_item->>'quantity')::int, v_product.price);

    update products set stock = stock - (v_item->>'quantity')::int where id = v_product.id;
  end loop;

  return v_order_id;
end;
$$;
