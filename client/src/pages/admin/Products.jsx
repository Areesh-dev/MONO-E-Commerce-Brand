import { useCallback, useEffect, useRef, useState } from 'react';
import ResourceManager from '../../components/admin/ResourceManager';
import { STATUS_OPTIONS, listTable } from '../../lib/admin';
import { supabase } from '../../lib/supabase';

const fmt = (n) =>
  `Rs ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(n) || 0)}`;

export default function AdminProducts() {
  const [initialSizes, setInitialSizes] = useState({});
  const [sizesLoaded, setSizesLoaded] = useState(false);
  const mounted = useRef(true);

  // Reusable: runs on mount and again after every product save
  const loadSizes = useCallback(async () => {
    const { data, error } = await supabase
      .from('product_sizes')
      .select('product_id, size_id, stock');

    if (!mounted.current) return;
    if (error) {
      console.error('[admin] loading sizes failed:', error.message);
    } else {
      const byProduct = {};
      for (const row of data || []) {
        (byProduct[row.product_id] ||= []).push({ size_id: row.size_id, stock: row.stock });
      }
      setInitialSizes(byProduct);
    }
    setSizesLoaded(true);
  }, []);

  useEffect(() => {
    mounted.current = true;
    loadSizes();
    return () => { mounted.current = false; };
  }, [loadSizes]);

  if (!sizesLoaded) {
    return (
      <div className="flex items-center justify-center py-32 text-xs uppercase tracking-editorial text-ink-dim">
        Loading…
      </div>
    );
  }

  return (
    <ResourceManager
      table="products"
      select="*,category:categories(id,name)"
      title="Products"
      description="Manage your catalog."
      searchKeys={['name', 'slug']}
      orderBy={{ column: 'created_at', ascending: false }}
      rowLabel="product"
      onSaved={loadSizes}
      mapInitialValues={(row) => {
        // Strip the joined category object; the form only needs category_id
        const { category, ...rest } = row;
        return {
          ...rest,
          category_id: row.category_id || '',
          description: row.description ?? '',
          image_url: row.image_url ?? '',
          sizes: initialSizes[row.id] || [],
        };
      }}
      columns={[
        {
          key: 'image_url',
          label: '',
          width: 'w-16',
          render: (r) => r.image_url
            ? <img src={r.image_url} alt="" className="w-10 h-10 object-cover border border-ink-line" />
            : <div className="w-10 h-10 bg-ink-surface border border-ink-line" />,
        },
        {
          key: 'name',
          label: 'Name',
          render: (r) => (
            <div>
              <p className="text-ink-white">{r.name}</p>
              {r.category?.name && (
                <p className="text-[10px] uppercase tracking-editorial text-ink-dim mt-0.5">
                  {r.category.name}
                </p>
              )}
            </div>
          ),
        },
        {
          key: 'price',
          label: 'Price',
          render: (r) => <span className="tabular-nums">{fmt(r.price)}</span>,
        },
        {
          key: 'stock',
          label: 'Stock',
          width: 'w-20',
          render: (r) => (
            <span className={r.stock > 0 ? 'text-ink-white tabular-nums' : 'text-ink-muted tabular-nums'}>
              {r.stock}
            </span>
          ),
        },
        {
          key: 'is_popular',
          label: 'Popular',
          width: 'w-20',
          render: (r) => r.is_popular ? <span className="text-ink-white">★</span> : <span className="text-ink-line">—</span>,
        },
        { key: 'status', label: 'Status' },
      ]}
      formFields={[
        { name: 'name', label: 'Name', type: 'text', required: true, slugFrom: 'slug' },
        { name: 'slug', label: 'Slug', type: 'slug', required: true },
        {
          name: 'category_id',
          label: 'Category',
          type: 'async-select',
          loadOptions: async () => {
            const rows = await listTable('categories', { select: 'id,name' });
            return [{ value: '', label: 'None' }, ...rows.map((c) => ({ value: c.id, label: c.name }))];
          },
        },
        { name: 'price', label: 'Price (Rs)', type: 'number', required: true, min: 0, step: 0.01 },
        { name: 'stock', label: 'Base Stock (used when no sizes)', type: 'number', required: true, min: 0 },
        { name: 'description', label: 'Description', type: 'textarea', rows: 5 },
        { name: 'image_url', label: 'Image', type: 'image', bucket: 'product-images' },
        { name: 'sizes', label: 'Available Sizes', type: 'sizes' },
        { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, required: true },
        { name: 'is_popular', label: 'Featured as Popular', type: 'toggle' },
      ]}
      defaultValues={{
        status: 'active',
        is_popular: false,
        stock: 0,
        price: 0,
        category_id: '',
        description: '',
        image_url: '',
        sizes: [],
      }}
    />
  );
}