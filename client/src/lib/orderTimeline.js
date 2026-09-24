import { supabase } from './supabase';

export const ORDER_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export const STATUS_LABELS = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export async function fetchOrderTimeline(orderId) {
  const { data, error } = await supabase
    .from('order_status_history')
    .select('id, status, note, created_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export function buildTimeline(currentStatus, history) {
  const historyByStatus = new Map();
  for (const h of history) {
    if (!historyByStatus.has(h.status)) historyByStatus.set(h.status, h);
  }

  if (currentStatus === 'cancelled') {
    const steps = ORDER_FLOW
      .filter((s) => historyByStatus.has(s))
      .map((s) => ({
        key: s,
        label: STATUS_LABELS[s],
        state: 'completed',
        at: historyByStatus.get(s).created_at,
        note: historyByStatus.get(s).note,
      }));
    const cancelledEvent = historyByStatus.get('cancelled');
    steps.push({
      key: 'cancelled',
      label: STATUS_LABELS.cancelled,
      state: 'cancelled',
      at: cancelledEvent?.created_at,
      note: cancelledEvent?.note,
    });
    return steps;
  }

  const currentIdx = ORDER_FLOW.indexOf(currentStatus);

  return ORDER_FLOW.map((s, i) => {
    const event = historyByStatus.get(s);
    let state;
    if (i < currentIdx) state = 'completed';
    else if (i === currentIdx) state = 'current';
    else state = 'upcoming';

    if (event && state === 'upcoming') state = 'completed';

    return {
      key: s,
      label: STATUS_LABELS[s],
      state,
      at: event?.created_at || null,
      note: event?.note || null,
    };
  });
}