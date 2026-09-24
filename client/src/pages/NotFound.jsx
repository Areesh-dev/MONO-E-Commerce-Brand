import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <>
      <Helmet><title>Page Not Found</title></Helmet>
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 text-center">
        <h1 className="heading-editorial text-8xl text-ink-white">404</h1>
        <p className="mt-4 text-sm text-ink-dim">This page doesn't exist.</p>
        <Link to="/" className="mt-8"><Button>Back Home</Button></Link>
      </div>
    </>
  );
}