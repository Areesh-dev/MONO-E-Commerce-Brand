import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import ImageUploadField from './ImageUploadField';
import { slugify } from '../../lib/admin';
import ProductSizesField from '../product/ProductSizesField';

export default function ResourceForm({ fields, defaultValues = {}, initialValues, onSubmit, onCancel, submitLabel = 'Save' }) {
  const isEdit = !!initialValues;
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { ...defaultValues, ...(initialValues || {}) },
  });

  const [asyncOptions, setAsyncOptions] = useState({});

  useEffect(() => {
    let active = true;
    fields.filter((f) => f.type === 'async-select' && f.loadOptions).forEach((f) => {
      Promise.resolve(f.loadOptions())
        .then((opts) => {
          if (active) setAsyncOptions((s) => ({ ...s, [f.name]: opts }));
        })
        .catch(() => {
          if (active) setAsyncOptions((s) => ({ ...s, [f.name]: [{ value: '', label: 'Could not load options' }] }));
        });
    });
    return () => { active = false; };
  }, [fields]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {fields.map((f) => {
        const err = errors[f.name]?.message;

        if (f.type === 'text') {
          return (
            <Input key={f.name} label={f.label} placeholder={f.placeholder} error={err}
              {...register(f.name, {
                required: f.required && `${f.label} is required`,
                onChange: f.slugFrom ? (e) => {
                  if (!isEdit || !watch(f.slugFrom)) setValue(f.slugFrom, slugify(e.target.value));
                } : undefined,
              })}
            />
          );
        }

        if (f.type === 'textarea') {
          return (
            <div key={f.name}>
              <label className="block mb-2 text-[10px] uppercase tracking-nav text-ink-dim">{f.label}</label>
              <textarea rows={f.rows || 4} placeholder={f.placeholder}
                {...register(f.name, { required: f.required && `${f.label} is required` })}
                className="w-full px-4 py-3 bg-ink-surface border border-ink-line text-ink-white placeholder:text-ink-muted text-sm focus:border-ink-text focus:outline-none resize-none"
              />
              {err && <p className="mt-1 text-xs text-ink-soft">{err}</p>}
            </div>
          );
        }

        if (f.type === 'number') {
          const numberRegister = f.nullable
            ? {
              setValueAs: (v) => {
                if (v === '' || v === null || v === undefined) return null;
                const n = Number(v);
                return Number.isNaN(n) ? null : n;
              },
            }
            : { valueAsNumber: true };

          return (
            <Input
              key={f.name}
              type="number"
              label={f.label}
              step={f.step}
              min={f.min}
              error={err}
              {...register(f.name, {
                required: f.required && `${f.label} is required`,
                min: f.min,
                ...numberRegister,
              })}
            />
          );
        }

        if (f.type === 'date') {
          return (
            <Input
              key={f.name}
              type="datetime-local"
              label={f.label}
              error={err}
              {...register(f.name)}
            />
          );
        }

        if (f.type === 'select') {
          return (
            <Select key={f.name} label={f.label} error={err} options={f.options}
              {...register(f.name, { required: f.required && `${f.label} is required` })}
            />
          );
        }

        if (f.type === 'async-select') {
          return (
            <Controller
              key={f.name}
              name={f.name}
              control={control}
              rules={{ required: f.required && `${f.label} is required` }}
              render={({ field }) => {
                const value = field.value ?? '';
                const options = asyncOptions[f.name] || [{ value, label: 'Loading…' }];
                return (
                  <Select
                    label={f.label}
                    error={err}
                    options={options}
                    name={field.name}
                    value={value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                );
              }}
            />
          );
        }

        if (f.type === 'toggle') {
          return (
            <Controller key={f.name} name={f.name} control={control} render={({ field }) => (
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)}
                  className="w-4 h-4 accent-ink-white" />
                <span className="text-xs uppercase tracking-nav text-ink-text">{f.label}</span>
              </label>
            )} />
          );
        }

        if (f.type === 'image') {
          return (
            <Controller key={f.name} name={f.name} control={control} render={({ field }) => (
              <ImageUploadField value={field.value} onChange={field.onChange} bucket={f.bucket} label={f.label} />
            )} />
          );
        }

        if (f.type === 'slug') {
          return (
            <Input key={f.name} label={f.label} placeholder={f.placeholder} error={err}
              {...register(f.name, { required: f.required && `${f.label} is required` })}
            />
          );
        }

        if (f.type === 'sizes') {
          return (
            <Controller
              key={f.name}
              name={f.name}
              control={control}
              render={({ field }) => (
                <ProductSizesField value={field.value || []} onChange={field.onChange} />
              )}
            />
          );
        }

        return null;
      })}

      <div className="flex justify-end gap-3 pt-4 border-t border-ink-line">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" loading={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}