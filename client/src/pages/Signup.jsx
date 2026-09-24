import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ArrowUpRight } from 'lucide-react';
import AuthShell, { Field, EditorialSubmit } from '../components/auth/AuthShell';
import PasswordToggle from '../components/ui/PasswordToggle';
import Seo from '../components/seo/Seo';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const password = watch('password') || '';
  const strength = Math.min(4, Math.floor(password.length / 3));

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const data = await signUp(values);
      if (data?.user && !data?.session) {
        toast.success('Check your email to confirm your account');
        navigate('/login');
      } else {
        toast.success('Account created');
        navigate('/', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Create Account" noIndex />

      <AuthShell
        eyebrow="Join the club"
        title={'Create\nAccount.'}
        subtitle="Track orders, save pieces, and get early access to limited releases."
        crosslink={
          <p className="text-sm text-ink-dim">
            Already a member?{' '}
            <Link
              to="/login"
              className="group inline-flex items-center gap-1 text-ink-white hover:text-ink-text transition-colors"
            >
              <span className="border-b border-ink-white/40 group-hover:border-ink-white transition-colors pb-0.5">
                Sign in
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
            id="signup-name"
            number="01"
            label="Full Name"
            type="text"
            placeholder="Your full name"
            autoComplete="name"
            error={errors.name?.message}
            registration={register('name', {
              required: 'Enter your name',
              minLength: { value: 2, message: 'Too short' },
              maxLength: { value: 80, message: 'Too long' },
            })}
          />

          <Field
            id="signup-email"
            number="02"
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

          <div>
            <Field
              id="signup-password"
              number="03"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              error={errors.password?.message}
              registration={register('password', {
                required: 'Create a password',
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
              endAdornment={
                <PasswordToggle
                  visible={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                />
              }
            />

            {/* Strength bars */}
            {password.length > 0 && (
              <div className="mt-3 flex items-center gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-px flex-1 transition-colors duration-300 ${i <= strength ? 'bg-ink-white' : 'bg-ink-line'
                      }`}
                  />
                ))}
                <span className="ml-3 text-[9px] uppercase tracking-editorial text-ink-muted tabular-nums">
                  {strength <= 1 ? 'Weak' : strength <= 2 ? 'Okay' : strength <= 3 ? 'Good' : 'Strong'}
                </span>
              </div>
            )}
          </div>

          <div className="pt-4">
            <EditorialSubmit loading={loading}>
              Create Account
            </EditorialSubmit>
          </div>

          <p className="text-[10px] uppercase tracking-editorial text-ink-muted leading-relaxed pt-2">
            By continuing you agree to our{' '}
            <Link to="/terms" className="text-ink-text hover:text-ink-white underline underline-offset-4 transition-colors">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy-policy" className="text-ink-text hover:text-ink-white underline underline-offset-4 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </AuthShell>
    </>
  );
}