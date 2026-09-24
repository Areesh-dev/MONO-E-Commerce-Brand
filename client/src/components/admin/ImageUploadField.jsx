import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { uploadImage } from '../../lib/upload';

export default function ImageUploadField({ value, onChange, bucket, label = 'Image' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(bucket, file);
      onChange(url);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block mb-2 text-[10px] uppercase tracking-nav text-ink-dim">{label}</label>
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 border border-ink-line bg-ink-surface flex items-center justify-center overflow-hidden flex-shrink-0">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] uppercase tracking-editorial text-ink-muted">None</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 h-9 px-4 border border-ink-line text-[10px] uppercase tracking-editorial text-ink-white hover:border-ink-white disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-2 h-9 px-4 border border-ink-line text-[10px] uppercase tracking-editorial text-ink-dim hover:text-ink-white"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            className="w-full h-9 px-3 bg-ink-surface border border-ink-line text-ink-white placeholder:text-ink-muted text-xs focus:border-ink-text focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}