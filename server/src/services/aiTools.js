import { admin } from '../lib/supabase.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PRODUCT_FIELDS =
  'id,name,slug,price,image_url,is_popular,stock,category:categories(id,name,slug)';
const MAX_QTY_PER_LINE = 10;
const SEARCH_LIMIT = 8;

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'for', 'and', 'with', 'under', 'over', 'below', 'above', 'less',
  'than', 'show', 'me', 'some', 'any', 'all', 'of', 'in', 'rs', 'pkr', 'price',
  'cheap', 'best', 'good', 'new', 'men', 'mens', 'women', 'womens',
]);

export const TOOL_DEFINITIONS = [
  {
    name: 'search_products',
    description:
      'Search active products. Use a short keyword for query (e.g. "hoodie", "black jacket"). Put price limits in min_price / max_price, not in query. Returns up to 8 products.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keywords only, e.g. "hoodie".' },
        category_slug: { type: 'string', description: 'Exact category slug from get_categories.' },
        min_price: { type: 'number', description: 'Minimum price in PKR.' },
        max_price: { type: 'number', description: 'Maximum price in PKR.' },
        in_stock_only: { type: 'boolean' },
        sort: { type: 'string', enum: ['relevance', 'price_asc', 'price_desc', 'newest'] },
      },
    },
  },
  {
    name: 'get_product',
    description: 'Get full details of one product, including sizes and stock per size. Provide id or slug.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        slug: { type: 'string' },
      },
    },
  },
  {
    name: 'get_categories',
    description: 'List all active categories with their slugs.',
  },
  {
    name: 'get_popular_products',
    description: 'List up to 8 popular products.',
  },
  {
    name: 'get_new_arrivals',
    description: 'List up to 8 newest products.',
  },
  {
    name: 'get_site_content',
    description: 'Get public brand content: mission, vision, why_choose_us, or faq.',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['mission', 'vision', 'why_choose_us', 'faq'] },
      },
      required: ['type'],
    },
  },
  {
    name: 'get_cart',
    description: "Get the signed-in user's bag with cart_item_id for every line. Requires sign-in.",
  },
  {
    name: 'add_to_cart',
    description:
      'Add a product to the signed-in user\'s bag. If the product has sizes, pass the size name the user chose (e.g. "M"). If size is missing the tool returns SIZE_REQUIRED with available_sizes.',
    parameters: {
      type: 'object',
      properties: {
        product_id: { type: 'string', description: 'Product id (or slug).' },
        size: { type: 'string', description: 'Size name like "M", or a size id.' },
        quantity: { type: 'integer', description: 'Defaults to 1.' },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'update_cart_quantity',
    description: 'Set the quantity of one bag line. Quantity 0 removes the line. Needs cart_item_id.',
    parameters: {
      type: 'object',
      properties: {
        cart_item_id: { type: 'string' },
        quantity: { type: 'integer' },
      },
      required: ['cart_item_id', 'quantity'],
    },
  },
  {
    name: 'remove_from_cart',
    description: 'Remove one line from the bag. Needs cart_item_id.',
    parameters: {
      type: 'object',
      properties: { cart_item_id: { type: 'string' } },
      required: ['cart_item_id'],
    },
  },
  {
    name: 'clear_cart',
    description: 'Empty the whole bag. Only call after the user explicitly confirmed.',
  },
  {
    name: 'get_user_orders',
    description: "List the signed-in user's 10 most recent orders.",
  },
  {
    name: 'get_order_details',
    description: "Get one of the signed-in user's orders by id.",
    parameters: {
      type: 'object',
      properties: { order_id: { type: 'string' } },
      required: ['order_id'],
    },
  },
  {
    name: 'get_wishlist',
    description: "Get the signed-in user's wishlist (saved products). Requires sign-in.",
  },
  {
    name: 'add_to_wishlist',
    description: "Save a product to the signed-in user's wishlist.",
    parameters: {
      type: 'object',
      properties: { product_id: { type: 'string', description: 'Product id (or slug).' } },
      required: ['product_id'],
    },
  },
  {
    name: 'remove_from_wishlist',
    description: "Remove a product from the signed-in user's wishlist.",
    parameters: {
      type: 'object',
      properties: { product_id: { type: 'string', description: 'Product id (or slug).' } },
      required: ['product_id'],
    },
  },
];

const WISHLIST_TABLE = 'wishlist_items';
const WISHLIST_USER_COL = 'user_id';
const WISHLIST_PRODUCT_COL = 'product_id';

const PUBLIC_TOOLS = new Set([
  'search_products',
  'get_product',
  'get_categories',
  'get_popular_products',
  'get_new_arrivals',
  'get_site_content',
]);

export const MUTATING_TOOLS = new Set([
  'add_to_cart',
  'update_cart_quantity',
  'remove_from_cart',
  'clear_cart',
]);

export const CART_TOOLS = new Set(['get_cart', ...MUTATING_TOOLS]);

export const WISHLIST_MUTATING_TOOLS = new Set(['add_to_wishlist', 'remove_from_wishlist']);

const isUuid = (v) => typeof v === 'string' && UUID_RE.test(v);

function toNumber(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function productShape(p) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    image_url: p.image_url,
    category: p.category?.name || null,
    is_popular: !!p.is_popular,
    stock: Number(p.stock ?? 0),
  };
}

function stem(word) {
  const w = String(word).toLowerCase();
  if (w.endsWith('ies') && w.length - 3 >= 4) return w.slice(0, -3);
  if (w.endsWith('es') && w.length - 2 >= 4) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length - 1 >= 3) return w.slice(0, -1);
  return w;
}

function searchTerms(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w))
    .slice(0, 5)
    .map(stem);
}

async function findActiveProduct(ref) {
  const value = String(ref || '').trim();
  if (!value) return null;
  const { data } = await admin
    .from('products')
    .select('id,name,slug,price,stock,status')
    .eq(isUuid(value) ? 'id' : 'slug', value)
    .eq('status', 'active')
    .maybeSingle();
  return data || null;
}

async function getProductSizes(productId) {
  const { data } = await admin
    .from('product_sizes')
    .select('size_id, stock, size:sizes(id,name,display_order,is_active)')
    .eq('product_id', productId);

  return (data || [])
    .filter((s) => s.size && s.size.is_active !== false)
    .sort((a, b) => (a.size.display_order ?? 0) - (b.size.display_order ?? 0))
    .map((s) => ({ id: s.size_id, name: s.size.name, stock: Number(s.stock ?? 0) }));
}

function resolveSize(sizes, input) {
  const raw = String(input || '').trim();
  if (!raw) return null;
  const lower = raw.toLowerCase().replace(/^size\s+/, '');
  return (
    sizes.find((s) => s.id === raw) ||
    sizes.find((s) => String(s.name).toLowerCase() === lower) ||
    null
  );
}

async function lineStockLimit(productId, sizeId) {
  if (sizeId) {
    const { data } = await admin
      .from('product_sizes')
      .select('stock')
      .eq('product_id', productId)
      .eq('size_id', sizeId)
      .maybeSingle();
    return Number(data?.stock ?? 0);
  }
  const { data } = await admin.from('products').select('stock').eq('id', productId).maybeSingle();
  return Number(data?.stock ?? 0);
}

export async function getCartSnapshot(userId) {
  const { data, error } = await admin
    .from('cart_items')
    .select(
      'id, quantity, size_id, product:products(id,name,slug,price,image_url,status), size:sizes(id,name)',
    )
    .eq('user_id', userId);

  if (error) {
    console.error('[ai:cart_snapshot]', error.message);
    return null;
  }

  const items = (data || []).map((i) => {
    const unitPrice = Number(i.product?.price || 0);
    return {
      cart_item_id: i.id,
      product_id: i.product?.id || null,
      product_name: i.product?.name || 'Unavailable product',
      slug: i.product?.slug || null,
      image_url: i.product?.image_url || null,
      size_name: i.size?.name || null,
      quantity: i.quantity,
      unit_price: unitPrice,
      subtotal: unitPrice * i.quantity,
      available: i.product?.status === 'active',
    };
  });

  return {
    items,
    item_count: items.reduce((s, i) => s + i.quantity, 0),
    total: items.filter((i) => i.available).reduce((s, i) => s + i.subtotal, 0),
  };
}


async function searchProducts(args) {
  let categoryId = null;

  if (args.category_slug) {
    const { data: cat } = await admin
      .from('categories')
      .select('id')
      .eq('slug', String(args.category_slug))
      .eq('status', 'active')
      .maybeSingle();
    if (!cat) return { products: [], note: 'UNKNOWN_CATEGORY' };
    categoryId = cat.id;
  }

  const terms = searchTerms(args.query);
  const textTerms = [];

  if (terms.length) {
    let categories = [];
    if (!categoryId) {
      const { data } = await admin.from('categories').select('id,name,slug').eq('status', 'active');
      categories = data || [];
    }
    for (const term of terms) {
      const match = !categoryId
        ? categories.find((c) => stem(c.name) === term || stem(c.slug) === term)
        : null;
      if (match) categoryId = match.id;
      else textTerms.push(term);
    }
  }

  let q = admin.from('products').select(PRODUCT_FIELDS).eq('status', 'active');

  if (categoryId) q = q.eq('category_id', categoryId);
  for (const term of textTerms) {
    q = q.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }

  const minPrice = toNumber(args.min_price);
  const maxPrice = toNumber(args.max_price);
  if (minPrice !== null) q = q.gte('price', minPrice);
  if (maxPrice !== null) q = q.lte('price', maxPrice);
  if (args.in_stock_only === true || args.in_stock_only === 'true') q = q.gt('stock', 0);

  if (args.sort === 'price_asc') q = q.order('price', { ascending: true });
  else if (args.sort === 'price_desc') q = q.order('price', { ascending: false });
  else if (args.sort === 'newest') q = q.order('created_at', { ascending: false });
  else q = q.order('is_popular', { ascending: false });

  const { data, error } = await q.limit(SEARCH_LIMIT);
  if (error) {
    console.error('[ai:search_products]', error.message);
    return { error: 'QUERY_FAILED' };
  }
  return { products: (data || []).map(productShape), count: (data || []).length };
}

async function getProduct(args) {
  const ref = args.id || args.slug;
  if (!ref) return { error: 'MISSING_ID' };

  const value = String(ref).trim();
  const { data: product, error } = await admin
    .from('products')
    .select(
      'id,name,slug,description,price,image_url,is_popular,stock,status,category:categories(id,name,slug)',
    )
    .eq(isUuid(value) ? 'id' : 'slug', value)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !product) return { error: 'NOT_FOUND' };

  const sizes = await getProductSizes(product.id);

  return {
    product: {
      ...productShape(product),
      description: product.description || '',
      has_sizes: sizes.length > 0,
      sizes,
    },
  };
}

async function addToCart(args, userId) {
  const qty = Math.floor(Number(args.quantity ?? 1));
  if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
    return { error: 'INVALID_QUANTITY', max: MAX_QTY_PER_LINE };
  }

  const product = await findActiveProduct(args.product_id);
  if (!product) return { error: 'PRODUCT_UNAVAILABLE' };

  const sizes = await getProductSizes(product.id);
  let sizeId = null;
  let sizeName = null;
  let stockLimit = Number(product.stock ?? 0);

  if (sizes.length > 0) {
    const inStock = sizes.filter((s) => s.stock > 0);
    if (inStock.length === 0) return { error: 'OUT_OF_STOCK', product_name: product.name };

    if (!args.size) {
      return { error: 'SIZE_REQUIRED', product_name: product.name, available_sizes: inStock };
    }

    const match = resolveSize(sizes, args.size);
    if (!match || match.stock <= 0) {
      return { error: 'SIZE_UNAVAILABLE', product_name: product.name, available_sizes: inStock };
    }
    sizeId = match.id;
    sizeName = match.name;
    stockLimit = match.stock;
  }

  let lineQuery = admin
    .from('cart_items')
    .select('id,quantity')
    .eq('user_id', userId)
    .eq('product_id', product.id);
  lineQuery = sizeId ? lineQuery.eq('size_id', sizeId) : lineQuery.is('size_id', null);
  const { data: existing } = await lineQuery.maybeSingle();

  const newQty = (existing?.quantity || 0) + qty;
  if (newQty > stockLimit) {
    return {
      error: 'INSUFFICIENT_STOCK',
      product_name: product.name,
      size_name: sizeName,
      available: stockLimit,
      already_in_cart: existing?.quantity || 0,
    };
  }
  if (newQty > MAX_QTY_PER_LINE) {
    return { error: 'LINE_LIMIT_REACHED', max: MAX_QTY_PER_LINE, already_in_cart: existing?.quantity || 0 };
  }

  if (existing) {
    const { error } = await admin
      .from('cart_items')
      .update({ quantity: newQty })
      .eq('id', existing.id)
      .eq('user_id', userId);
    if (error) {
      console.error('[ai:add_to_cart] update failed:', error.message);
      return { error: 'CART_UPDATE_FAILED' };
    }
  } else {
    const { error } = await admin.from('cart_items').insert({
      user_id: userId,
      product_id: product.id,
      size_id: sizeId,
      quantity: qty,
    });
    if (error) {
      console.error('[ai:add_to_cart] insert failed:', error.message, error.code);
      return { error: 'CART_INSERT_FAILED' };
    }
  }

  return {
    ok: true,
    action: 'cart_updated',
    product_name: product.name,
    size_name: sizeName,
    added: qty,
    quantity_in_cart: newQty,
  };
}

async function removeFromCart(args, userId) {
  if (!isUuid(args.cart_item_id)) return { error: 'INVALID_CART_ITEM_ID' };

  const { data, error } = await admin
    .from('cart_items')
    .delete()
    .eq('id', args.cart_item_id)
    .eq('user_id', userId)
    .select('id');

  if (error) return { error: 'DELETE_FAILED' };
  if (!data || data.length === 0) return { error: 'NOT_FOUND' };
  return { ok: true, action: 'cart_updated', removed: true };
}

async function updateCartQuantity(args, userId) {
  if (!isUuid(args.cart_item_id)) return { error: 'INVALID_CART_ITEM_ID' };
  const qty = Math.floor(Number(args.quantity));
  if (!Number.isFinite(qty) || qty < 0 || qty > MAX_QTY_PER_LINE) {
    return { error: 'INVALID_QUANTITY', max: MAX_QTY_PER_LINE };
  }

  const { data: line } = await admin
    .from('cart_items')
    .select('id, product_id, size_id, product:products(name)')
    .eq('id', args.cart_item_id)
    .eq('user_id', userId)
    .maybeSingle();
  if (!line) return { error: 'NOT_FOUND' };

  if (qty === 0) return removeFromCart({ cart_item_id: line.id }, userId);

  const limit = await lineStockLimit(line.product_id, line.size_id);
  if (qty > limit) {
    return { error: 'INSUFFICIENT_STOCK', product_name: line.product?.name, available: limit };
  }

  const { error } = await admin
    .from('cart_items')
    .update({ quantity: qty })
    .eq('id', line.id)
    .eq('user_id', userId);
  if (error) return { error: 'UPDATE_FAILED' };

  return { ok: true, action: 'cart_updated', product_name: line.product?.name, quantity: qty };
}

async function clearCart(userId) {
  const { data, error } = await admin
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .select('id');
  if (error) return { error: 'DELETE_FAILED' };
  return { ok: true, action: 'cart_updated', removed_lines: (data || []).length };
}


async function getWishlist(userId) {
  const { data, error } = await admin
    .from(WISHLIST_TABLE)
    .select(
      `product:products(id,name,slug,price,image_url,is_popular,stock,status,category:categories(id,name,slug))`,
    )
    .eq(WISHLIST_USER_COL, userId);

  if (error) {
    console.error('[ai:get_wishlist]', error.message);
    return { error: 'QUERY_FAILED' };
  }

  const products = (data || [])
    .map((row) => row.product)
    .filter((p) => p && p.status === 'active')
    .map(productShape);

  return { products, count: products.length };
}

async function resolveProductId(ref) {
  const value = String(ref || '').trim();
  if (!value) return null;
  if (isUuid(value)) return value;
  const { data } = await admin.from('products').select('id').eq('slug', value).maybeSingle();
  return data?.id || null;
}

async function addToWishlist(args, userId) {
  const product = await findActiveProduct(args.product_id);
  if (!product) return { error: 'PRODUCT_UNAVAILABLE' };

  const { data: existing } = await admin
    .from(WISHLIST_TABLE)
    .select(WISHLIST_PRODUCT_COL)
    .eq(WISHLIST_USER_COL, userId)
    .eq(WISHLIST_PRODUCT_COL, product.id)
    .maybeSingle();

  if (existing) {
    return { ok: true, already_saved: true, product_name: product.name };
  }

  const { error } = await admin
    .from(WISHLIST_TABLE)
    .insert({ [WISHLIST_USER_COL]: userId, [WISHLIST_PRODUCT_COL]: product.id });

  if (error) {
    console.error('[ai:add_to_wishlist] insert failed:', error.message, error.code);
    return { error: 'WISHLIST_INSERT_FAILED' };
  }

  return { ok: true, action: 'wishlist_updated', product_name: product.name };
}

async function removeFromWishlist(args, userId) {
  const productId = await resolveProductId(args.product_id);
  if (!productId) return { error: 'NOT_FOUND' };

  const { data, error } = await admin
    .from(WISHLIST_TABLE)
    .delete()
    .eq(WISHLIST_USER_COL, userId)
    .eq(WISHLIST_PRODUCT_COL, productId)
    .select(WISHLIST_PRODUCT_COL);

  if (error) return { error: 'DELETE_FAILED' };
  if (!data || data.length === 0) return { error: 'NOT_IN_WISHLIST' };
  return { ok: true, action: 'wishlist_updated', removed: true };
}


export async function executeTool(name, args = {}, ctx = {}) {
  const userId = ctx.userId || null;
  if (!PUBLIC_TOOLS.has(name) && !userId) return { error: 'AUTH_REQUIRED' };

  try {
    switch (name) {
      case 'search_products':
        return await searchProducts(args);

      case 'get_product':
        return await getProduct(args);

      case 'get_categories': {
        const { data } = await admin
          .from('categories')
          .select('id,name,slug')
          .eq('status', 'active')
          .order('display_order');
        return { categories: data || [] };
      }

      case 'get_popular_products': {
        const { data } = await admin
          .from('products')
          .select(PRODUCT_FIELDS)
          .eq('status', 'active')
          .eq('is_popular', true)
          .limit(8);
        return { products: (data || []).map(productShape) };
      }

      case 'get_new_arrivals': {
        const { data } = await admin
          .from('products')
          .select(PRODUCT_FIELDS)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8);
        return { products: (data || []).map(productShape) };
      }

      case 'get_site_content': {
        const t = args.type;
        if (t === 'mission' || t === 'vision') {
          const { data } = await admin
            .from('content_sections')
            .select('title,content')
            .eq('key', t)
            .eq('status', 'active')
            .maybeSingle();
          return { content: data || null };
        }
        if (t === 'why_choose_us') {
          const { data } = await admin
            .from('why_choose_us')
            .select('title,description')
            .eq('status', 'active')
            .order('display_order');
          return { items: data || [] };
        }
        if (t === 'faq') {
          const { data } = await admin
            .from('faqs')
            .select('question,answer')
            .eq('status', 'active')
            .order('display_order');
          return { faqs: data || [] };
        }
        return { error: 'UNKNOWN_TYPE' };
      }

      case 'get_cart': {
        const cart = await getCartSnapshot(userId);
        return cart ? { cart } : { error: 'QUERY_FAILED' };
      }

      case 'add_to_cart':
        return await addToCart(args, userId);

      case 'update_cart_quantity':
        return await updateCartQuantity(args, userId);

      case 'remove_from_cart':
        return await removeFromCart(args, userId);

      case 'clear_cart':
        return await clearCart(userId);

      case 'get_wishlist':
        return await getWishlist(userId);

      case 'add_to_wishlist':
        return await addToWishlist(args, userId);

      case 'remove_from_wishlist':
        return await removeFromWishlist(args, userId);

      case 'get_user_orders': {
        const { data, error } = await admin
          .from('orders')
          .select('id,total_amount,status,created_at,order_items(product_name,quantity,size_name,price)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
        if (error) return { error: 'QUERY_FAILED' };
        return { orders: data || [] };
      }

      case 'get_order_details': {
        if (!isUuid(args.order_id)) return { error: 'NOT_FOUND' };
        const { data, error } = await admin
          .from('orders')
          .select('id,total_amount,status,created_at,order_items(product_name,quantity,size_name,price)')
          .eq('id', args.order_id)
          .eq('user_id', userId)
          .maybeSingle();
        if (error || !data) return { error: 'NOT_FOUND' };
        return { order: data };
      }

      default:
        return { error: 'UNKNOWN_TOOL' };
    }
  } catch (err) {
    console.error(`[ai:${name}] crashed:`, err?.message);
    return { error: 'TOOL_FAILED' };
  }
}