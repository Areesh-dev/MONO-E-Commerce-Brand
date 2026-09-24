import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { KeyRound, Image as ImageIcon, Check, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ImageUploadField from '../../components/admin/ImageUploadField';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { updateSettings, updateSetting } from '../../lib/branding';
import { brand } from '../../config/brand';

export default function AdminSettings() {
  const { user, updatePassword } = useAuth();
  const { settings, update: updateLocal, refresh } = useBranding();

  const [logoUrl, setLogoUrl] = useState('');
  const [logoAlt, setLogoAlt] = useState('');
  const [savingLogo, setSavingLogo] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    setLogoUrl(settings.logo_url || '');
    setLogoAlt(settings.logo_alt || '');
  }, [settings.logo_url, settings.logo_alt]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const [savingPassword, setSavingPassword] = useState(false);

  const onPasswordSubmit = async ({ password }) => {
    setSavingPassword(true);
    try {
      await updatePassword(password);
      toast.success('Password updated');
      reset();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogoSave = async () => {
    setSavingLogo(true);
    try {
      await updateSettings({
        logo_url: logoUrl || '',
        logo_alt: logoAlt || '',
      });
      updateLocal({ logo_url: logoUrl, logo_alt: logoAlt });
      await refresh();
      toast.success('Logo updated');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingLogo(false);
    }
  };

  const handleLogoRemove = async () => {
    setSavingLogo(true);
    try {
      await updateSetting('logo_url', '');
      setLogoUrl('');
      updateLocal({ logo_url: '' });
      await refresh();
      setConfirmRemove(false);
      toast.success('Logo removed — text brand name will be used');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingLogo(false);
    }
  };

  const logoDirty =
    logoUrl !== (settings.logo_url || '') ||
    logoAlt !== (settings.logo_alt || '');

  return (
    <div className="max-w-2xl space-y-8">
      <header>
        <h1 className="heading-editorial text-2xl text-ink-white">Settings</h1>
        <p className="mt-1 text-xs text-ink-dim">
          Manage brand identity and your admin account.
        </p>
      </header>

      {/* ── Logo / Branding ───────────────────────── */}
      <section className="border border-ink-line bg-ink-card">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-ink-line">
          <ImageIcon className="w-4 h-4 text-ink-soft" strokeWidth={1.5} />
          <h2 className="text-[11px] uppercase tracking-editorial text-ink-white">
            Brand Logo
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-ink-dim leading-relaxed">
            Upload a logo to replace the text brand name across the site.
            Recommended: transparent PNG or SVG, at least 200px wide.
          </p>

          <ImageUploadField
            value={logoUrl}
            onChange={setLogoUrl}
            bucket="site-assets"
            label="Logo Image"
          />

          <Input
            label="Logo Alt Text (for accessibility)"
            value={logoAlt}
            onChange={(e) => setLogoAlt(e.target.value)}
            placeholder={brand.name}
            maxLength={120}
          />

          {/* Live preview */}
          <div className="border border-ink-line bg-ink-surface p-5">
            <span className="block text-[10px] uppercase tracking-editorial text-ink-muted mb-4">
              Preview
            </span>
            <div className="flex items-center justify-center h-16 bg-ink border border-ink-line">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={logoAlt || brand.name}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className="heading-editorial text-2xl tracking-editorial text-ink-white">
                  {brand.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {logoUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmRemove(true)}
                disabled={savingLogo}
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Logo
              </Button>
            )}
            <div className="ml-auto flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setLogoUrl(settings.logo_url || '');
                  setLogoAlt(settings.logo_alt || '');
                }}
                disabled={!logoDirty || savingLogo}
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleLogoSave}
                loading={savingLogo}
                disabled={!logoDirty}
              >
                <Check className="w-3.5 h-3.5" /> Save Logo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Account ──────────────────────────────── */}
      <section className="border border-ink-line bg-ink-card p-6">
        <h2 className="text-[11px] uppercase tracking-editorial text-ink-white mb-5">
          Account
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-dim">Email</dt>
            <dd className="text-ink-white">{user?.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-dim">User ID</dt>
            <dd className="text-ink-text font-mono text-xs">{user?.id}</dd>
          </div>
        </dl>
      </section>

      {/* ── Password ──────────────────────────────── */}
      <section className="border border-ink-line bg-ink-card">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-ink-line">
          <KeyRound className="w-4 h-4 text-ink-soft" strokeWidth={1.5} />
          <h2 className="text-[11px] uppercase tracking-editorial text-ink-white">
            Change Password
          </h2>
        </div>

        <form onSubmit={handleSubmit(onPasswordSubmit)} className="p-6 space-y-5">
          <Input
            label="New Password"
            type="password"
            autoComplete="new-password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Min 8 characters' },
            })}
            error={errors.password?.message}
          />
          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            {...register('confirm', {
              required: 'Please confirm',
              validate: (v) => v === watch('password') || 'Passwords do not match',
            })}
            error={errors.confirm?.message}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={savingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </section>

      <ConfirmDialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={handleLogoRemove}
        loading={savingLogo}
        title="Remove Logo"
        message="The site will fall back to the text brand name."
      />
    </div>
  );
}