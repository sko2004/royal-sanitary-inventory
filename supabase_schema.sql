-- Run this in Supabase: Project > SQL Editor > New query > Run

create extension if not exists "uuid-ossp";

create table if not exists items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null default 'General',
  sku text,
  unit text not null default 'pcs',
  current_stock numeric not null default 0,
  low_stock_threshold numeric not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stock_movements (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references items(id) on delete cascade,
  type text not null check (type in ('in', 'out')),
  quantity numeric not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_movements_item_id on stock_movements(item_id);
create index if not exists idx_movements_created_at on stock_movements(created_at desc);

-- Enable Row Level Security
alter table items enable row level security;
alter table stock_movements enable row level security;

-- POC policy: allow anon key full access (tighten later with auth if needed)
create policy "Allow all on items" on items
  for all using (true) with check (true);

create policy "Allow all on stock_movements" on stock_movements
  for all using (true) with check (true);

-- Optional: seed a couple of sample items
insert into items (name, category, sku, unit, current_stock, low_stock_threshold)
values
  ('PVC Pipe 1 inch', 'Pipes', 'PVC-1IN', 'pcs', 40, 10),
  ('Cement OPC 50kg', 'Cement', 'CEM-OPC50', 'bag', 25, 5),
  ('Tap Fitting Brass 1/2 inch', 'Fittings', 'TAP-BR-12', 'pcs', 12, 5);
