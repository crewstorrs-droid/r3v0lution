-- Run this in your Supabase SQL Editor

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  images text[] default '{}',
  sizes text[] default '{}',
  colors text[] default '{}',
  category text default 'Graphic Tees',
  stock integer default 0,
  featured boolean default false,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  shipping_address jsonb not null,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null default 6.99,
  total numeric(10,2) not null,
  status text not null default 'pending',
  stripe_payment_intent text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table products enable row level security;
alter table orders enable row level security;

-- Public can read products
create policy "Products are publicly readable" on products for select using (true);

-- Only service role can write products and orders (via API routes)
-- (Service role bypasses RLS by default)

-- Create storage bucket for product images
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow public reads from product-images bucket
create policy "Product images are public" on storage.objects for select using (bucket_id = 'product-images');

-- Allow authenticated uploads (admin only via service role in practice)
create policy "Allow uploads" on storage.objects for insert with check (bucket_id = 'product-images');
