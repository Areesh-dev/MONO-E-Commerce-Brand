import { Link, NavLink } from 'react-router-dom';

const preloaders = {
    '/': () => import('../../pages/Home'),
    '/products': () => import('../../pages/Products'),
    '/products/': () => import('../../pages/ProductDetail'),
    '/categories': () => import('../../pages/Categories'),
    '/faq': () => import('../../pages/FAQ'),
    '/cart': () => import('../../pages/Cart'),
    '/profile': () => import('../../pages/Profile'),
    '/profile/orders': () => import('../../pages/Orders'),
};

export default function PrefetchLink({ to, children, className, end, ...rest }) {
    const preload = () => {
        const exact = preloaders[to];
        if (exact) { exact().catch(() => { }); return; }
        for (const [prefix, loader] of Object.entries(preloaders)) {
            if (prefix.endsWith('/') && to.startsWith(prefix)) {
                loader().catch(() => { });
                return;
            }
        }
    };

    const commonProps = {
        to,
        onMouseEnter: preload,
        onFocus: preload,
        onTouchStart: preload,
        ...rest,
    };

    const isNavStyle =
        typeof className === 'function' ||
        typeof children === 'function' ||
        end !== undefined;

    if (isNavStyle) {
        return (
            <NavLink className={className} end={end} {...commonProps}>
                {children}
            </NavLink>
        );
    }

    return (
        <Link className={className} {...commonProps}>
            {children}
        </Link>
    );
}