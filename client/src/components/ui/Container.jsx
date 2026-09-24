export default function Container({ children, className = '', size = 'default' }) {
  const sizes = {
    narrow: 'max-w-3xl',
    default: 'max-w-7xl',
    wide: 'max-w-[1400px]',
    full: 'max-w-none',
  };
  return (
    <div className={`mx-auto w-full px-4 sm:px-6 lg:px-12 ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
}