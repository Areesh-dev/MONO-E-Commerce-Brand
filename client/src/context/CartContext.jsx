import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { validateCoupon as validateCouponRequest, couponErrorMessage } from '../lib/coupons';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const subtotalRef = useRef(0);

  const load = useCallback(async (silent = false) => {
    if (!user) { setItems([]); return; }
    if (!silent) setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('cart_items')
      .select(`
        id, quantity, size_id,
        product:products(id,name,slug,price,image_url,stock,status),
        size:sizes(id,name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (err) {
      setError(err.message);
      if (!silent) setLoading(false);
      return;
    }

    const ids = (data || []).map((i) => i.product?.id).filter(Boolean);
    let sizeStock = {};
    if (ids.length) {
      const { data: ps } = await supabase
        .from('product_sizes')
        .select('product_id, size_id, stock')
        .in('product_id', ids);
      for (const r of ps || []) sizeStock[`${r.product_id}:${r.size_id}`] = r.stock;
    }

    setItems((data || []).map((it) => ({
      ...it,
      effectiveStock: it.size_id
        ? (sizeStock[`${it.product?.id}:${it.size_id}`] ?? 0)
        : (it.product?.stock ?? 0),
    })));
    if (!silent) setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Reset coupon state when user logs out.
  useEffect(() => {
    if (!user) setAppliedCoupon(null);
  }, [user]);

  const add = useCallback(async (product, quantity = 1, sizeId = null) => {
    if (!user) throw new Error('Sign in required');
    if (!product?.id) throw new Error('Invalid product');
    if (product.status !== 'active') throw new Error('Product unavailable');
    if (quantity < 1) throw new Error('Invalid quantity');

    if (sizeId) {
      const { data: ps } = await supabase
        .from('product_sizes').select('stock')
        .eq('product_id', product.id).eq('size_id', sizeId).maybeSingle();
      if (!ps) throw new Error('Size unavailable');
      if (ps.stock < quantity) throw new Error(`Only ${ps.stock} in stock`);
    } else if ((product.stock ?? 0) < quantity) {
      throw new Error('Out of stock');
    }

    const existing = items.find(
      (it) => it.product?.id === product.id && (it.size_id || null) === sizeId
    );
    const nextQty = (existing?.quantity || 0) + quantity;

    if (existing) {
      const { error: err } = await supabase
        .from('cart_items').update({ quantity: nextQty }).eq('id', existing.id);
      if (err) throw err;
    } else {
      const { error: err } = await supabase
        .from('cart_items').insert({
          user_id: user.id, product_id: product.id, size_id: sizeId, quantity,
        });
      if (err) throw err;
    }
    await load(true);
  }, [user, items, load]);

  const updateQty = useCallback(async (itemId, quantity) => {
    if (quantity < 1) throw new Error('Invalid quantity');
    const item = items.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found');
    if (quantity > item.effectiveStock) throw new Error(`Only ${item.effectiveStock} in stock`);

    const { error: err } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    if (err) throw err;
    await load(true);
  }, [items, load]);

  const updateSize = useCallback(async (itemId, newSizeId) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found');

    const { data: ps } = await supabase
      .from('product_sizes').select('stock')
      .eq('product_id', item.product.id).eq('size_id', newSizeId).maybeSingle();
    if (!ps || ps.stock < item.quantity) throw new Error('Size unavailable in requested quantity');

    const { error: err } = await supabase.from('cart_items').update({ size_id: newSizeId }).eq('id', itemId);
    if (err) {
      if (err.code === '23505') throw new Error('That size is already in your cart');
      throw err;
    }
    await load(true);
  }, [items, load]);

  const remove = useCallback(async (itemId) => {
    const { error: err } = await supabase.from('cart_items').delete().eq('id', itemId);
    if (err) throw err;
    await load(true);
  }, [load]);

  const clear = useCallback(async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    await load(true);
  }, [user, load]);

  const { subtotal, count, hasIssues } = useMemo(() => {
    let subtotal = 0, count = 0, hasIssues = false;
    for (const it of items) {
      subtotal += Number(it.product?.price || 0) * it.quantity;
      count += it.quantity;
      if (!it.product || it.product.status !== 'active' || it.effectiveStock < it.quantity) {
        hasIssues = true;
      }
    }
    return { subtotal, count, hasIssues };
  }, [items]);

  const discountAmount = appliedCoupon?.discount_amount || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const applyCoupon = useCallback(async (code) => {
    if (!code?.trim()) throw new Error('Enter a coupon code');
    const res = await validateCouponRequest(code.trim());
    if (!res.valid) {
      const msg = couponErrorMessage(res.error_code);
      const e = new Error(msg);
      e.code = res.error_code;
      throw e;
    }
    setAppliedCoupon({
      code: res.code,
      description: res.description,
      discount_type: res.discount_type,
      discount_value: Number(res.discount_value || 0),
      discount_amount: Number(res.discount_amount || 0),
    });
    return res;
  }, []);

  const removeCoupon = useCallback(() => setAppliedCoupon(null), []);

  useEffect(() => {
    if (!appliedCoupon) { subtotalRef.current = subtotal; return; }
    if (subtotalRef.current === subtotal) return;
    subtotalRef.current = subtotal;

    let active = true;
    (async () => {
      try {
        const res = await validateCouponRequest(appliedCoupon.code);
        if (!active) return;
        if (res.valid) {
          setAppliedCoupon((prev) => prev ? { ...prev, discount_amount: Number(res.discount_amount) } : null);
        } else {
          setAppliedCoupon(null);
          toast.error('Coupon is no longer valid for your cart.');
        }
      } catch { /* silent */ }
    })();
    return () => { active = false; };
  }, [subtotal, appliedCoupon]);

  return (
    <CartContext.Provider value={{
      items, loading, error,
      add, updateQty, updateSize, remove, clear,
      subtotal, discountAmount, total, count, hasIssues,
      appliedCoupon, applyCoupon, removeCoupon,
      refresh: () => load(false),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};