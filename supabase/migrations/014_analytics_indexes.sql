
create index if not exists orders_status_created_idx
  on public.orders(status, created_at desc);

create index if not exists orders_created_idx
  on public.orders(created_at desc);

create index if not exists order_items_order_idx
  on public.order_items(order_id);

create index if not exists order_items_product_idx
  on public.order_items(product_id);

create index if not exists products_category_active_popular_idx
  on public.products(category_id, is_popular desc, created_at desc)
  where status = 'active';

create index if not exists products_popular_active_idx
  on public.products(is_popular desc, created_at desc)
  where status = 'active' and is_popular = true;

create index if not exists products_stock_idx
  on public.products(stock) where status = 'active';

create index if not exists product_sizes_stock_idx
  on public.product_sizes(stock);

update public.orders
set subtotal = total_amount
where subtotal is null;