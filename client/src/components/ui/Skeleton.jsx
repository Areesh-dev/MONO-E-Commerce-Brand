export default function Skeleton({ className = '', as: As = 'div', ...rest }) {
  return <As className={`skeleton ${className}`} aria-hidden="true" {...rest} />;
}