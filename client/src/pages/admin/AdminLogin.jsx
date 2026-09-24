import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PasswordToggle from '../../components/ui/PasswordToggle';
import { supabase } from '../../lib/supabase';
import { brand } from '../../config/brand';

export default function AdminLogin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Not authorized');
      }

      navigate('/admin/dashboard', { replace: true });
    } catch (e) {
      toast.error(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <span className="heading-editorial text-2xl tracking-editorial text-ink-white">{brand.name}</span>
          <div className="mt-3 flex items-center justify-center gap-2 text-ink-dim">
            <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-editorial">Admin Access</span>
          </div>
        </div>

        <div className="border border-ink-line bg-ink-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Email" type="email" autoComplete="email"
              {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message}
              endAdornment={
                <PasswordToggle
                  visible={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                />
              }
            />
            <Button type="submit" loading={loading} className="w-full">Sign In</Button>
          </form>
        </div>

        <p className="mt-6 text-[10px] uppercase tracking-editorial text-ink-muted text-center">
          Authorized personnel only.
        </p>
      </div>
    </div>
  );
}