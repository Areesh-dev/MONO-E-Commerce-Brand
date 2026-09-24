import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL;

const ERROR_MESSAGES = {
  INVALID_CODE: 'Enter a valid coupon code.',
  NOT_FOUND: 'Coupon not found.',
  INACTIVE: 'This coupon is no longer available.',
  NOT_STARTED: 'This coupon is not active yet.',
  EXPIRED: 'This coupon has expired.',
  MIN_ORDER: 'Your order does not meet the minimum amount.',
  USAGE_LIMIT: 'This coupon has reached its usage limit.',
  USER_LIMIT: 'You have already used this coupon.',
  EMPTY_CART: 'Add items to your cart first.',
  UNKNOWN: 'Could not apply coupon.',
};

export function couponErrorMessage(code) {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN;
}

export async function validateCoupon(code) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${API_URL}/api/coupons/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ code }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(body.error || 'VALIDATION_FAILED');
    err.code = body.error;
    throw err;
  }

  return body;
}