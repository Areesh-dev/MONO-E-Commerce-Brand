import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowUpRight } from 'lucide-react';
import AuthShell, { Field, EditorialSubmit } from '../components/auth/AuthShell';
import PasswordToggle from '../components/ui/PasswordToggle';
import Seo from '../components/seo/Seo';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await signIn(values);
      toast.success('Welcome back');
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Sign In" noIndex />

      <AuthShell
        eyebrow="Account"
        title={'Sign\nIn.'}
        subtitle="Access your cart, orders, and saved pieces — all in one place."
        crosslink={
          <p className="text-sm text-ink-dim">
            New here?{' '}
            <Link
              to="/signup"
              className="group inline-flex items-center gap-1 text-ink-white hover:text-ink-text transition-colors"
            >
              <span className="border-b border-ink-white/40 group-hover:border-ink-white transition-colors pb-0.5">
                Create an account
              </span>
              <ArrowUpRight
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          <Field
            id="login-email"
            number="01"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            registration={register('email', {
              required: 'Enter your email',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email',
              },
            })}
          />

          <Field
            id="login-password"
            number="02"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            registration={register('password', { required: 'Enter your password' })}
            endAdornment={
              <PasswordToggle
                visible={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
              />
            }
          />

          <div className="pt-4">
            <EditorialSubmit loading={loading}>
              Sign In
            </EditorialSubmit>
          </div>
        </form>
      </AuthShell>
    </>
  );
}