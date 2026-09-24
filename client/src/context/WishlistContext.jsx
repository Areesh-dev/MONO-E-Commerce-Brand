import {
    createContext, useContext, useEffect, useState, useCallback, useMemo, useRef,
} from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WISHLIST_EVENT = 'wishlist:changed';

const WISHLIST_SELECT = `
  id,
  product_id,
  created_at,
  product:products(
    id,name,slug,price,image_url,stock,status,
    category:categories(id,name,slug)
  )
`;

function friendlyError(err, fallback) {
    if (!err) return new Error(fallback);
    if (err.code === '42501') {
        return new Error('Permission denied by the database. Check wishlist_items grants and RLS policies.');
    }
    if (err.message === 'AUTH_REQUIRED') return new Error('Please sign in first.');
    return new Error(err.message || fallback);
}

export function WishlistProvider({ children }) {
    const { user } = useAuth();
    const userId = user?.id ?? null;

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const pending = useRef(new Set());
    const loadSeq = useRef(0);

    const ids = useMemo(() => new Set(items.map((i) => i.product_id)), [items]);

    const load = useCallback(async (silent = false) => {
        const seq = ++loadSeq.current;

        if (!userId) {
            setItems([]);
            setLoading(false);
            return;
        }
        if (!silent) setLoading(true);
        setError(null);

        const { data, error: err } = await supabase
            .from('wishlist_items')
            .select(WISHLIST_SELECT)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (seq !== loadSeq.current) return; 

        if (err) {
            console.error('[wishlist] load failed:', err);
            setError(err.message);
        } else {
            setItems((data || []).filter((row) => row.product));
        }
        if (!silent) setLoading(false);
    }, [userId]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        const { data: sub } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
                setTimeout(() => load(true), 0);
            }
        });
        return () => sub?.subscription?.unsubscribe?.();
    }, [load]);

    useEffect(() => {
        const onExternalChange = () => load(true);
        window.addEventListener(WISHLIST_EVENT, onExternalChange);
        return () => window.removeEventListener(WISHLIST_EVENT, onExternalChange);
    }, [load]);

    const add = useCallback(async (productId) => {
        if (!userId) throw friendlyError({ message: 'AUTH_REQUIRED' });
        if (!productId) throw new Error('Invalid product');
        if (ids.has(productId) || pending.current.has(productId)) return;

        pending.current.add(productId);
        try {
            const { data: inserted, error: err } = await supabase
                .from('wishlist_items')
                .insert({ user_id: userId, product_id: productId })
                .select(WISHLIST_SELECT)
                .maybeSingle();

            if (err && err.code !== '23505') {
                console.error('[wishlist] add failed:', err);
                throw friendlyError(err, 'Could not save item.');
            }

            if (inserted?.product) {
                setItems((prev) =>
                    prev.some((r) => r.product_id === productId) ? prev : [inserted, ...prev],
                );
            } else {
                await load(true);
            }
        } finally {
            pending.current.delete(productId);
        }
    }, [userId, ids, load]);

    const remove = useCallback(async (productId) => {
        if (!userId) throw friendlyError({ message: 'AUTH_REQUIRED' });
        if (!productId) throw new Error('Invalid product');
        if (pending.current.has(productId)) return;

        pending.current.add(productId);

        let removedRow = null;
        setItems((prev) => {
            removedRow = prev.find((r) => r.product_id === productId) || null;
            return prev.filter((r) => r.product_id !== productId);
        });

        const rollback = () => {
            if (!removedRow) return;
            setItems((prev) =>
                prev.some((r) => r.product_id === productId)
                    ? prev
                    : [removedRow, ...prev].sort(
                        (a, b) => new Date(b.created_at) - new Date(a.created_at),
                    ),
            );
        };

        try {
            const { data, error: err } = await supabase
                .from('wishlist_items')
                .delete()
                .eq('user_id', userId)
                .eq('product_id', productId)
                .select('id');

            if (err) {
                console.error('[wishlist] delete failed:', err);
                rollback();
                throw friendlyError(err, 'Could not remove item.');
            }

            if (!data || data.length === 0) {
                console.warn('[wishlist] delete matched 0 rows', { userId, productId });
                const { data: stillThere } = await supabase
                    .from('wishlist_items')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('product_id', productId)
                    .maybeSingle();

                await load(true);

                if (stillThere) {
                    throw new Error(
                        'The database refused to remove this item. Check the DELETE grant / policy on wishlist_items.',
                    );
                }
            }
        } finally {
            pending.current.delete(productId);
        }
    }, [userId, load]);

    const toggle = useCallback(async (productId) => {
        if (ids.has(productId)) await remove(productId);
        else await add(productId);
    }, [ids, add, remove]);

    const has = useCallback((productId) => ids.has(productId), [ids]);
    const refresh = useCallback(() => load(false), [load]);

    const value = useMemo(() => ({
        items,
        ids,
        count: ids.size,
        loading,
        error,
        add,
        remove,
        toggle,
        has,
        refresh,
    }), [items, ids, loading, error, add, remove, toggle, has, refresh]);

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
    return ctx;
};