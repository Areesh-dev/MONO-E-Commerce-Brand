
export function preloadCriticalRoutes() {
  const load = () => {
    import('../pages/Products');
    import('../pages/ProductDetail');
    import('../pages/Categories');
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(load, { timeout: 3000 });
  } else {
    setTimeout(load, 2000);
  }
}