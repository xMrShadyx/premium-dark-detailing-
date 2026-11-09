import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getEnabledServices } from "@/config";
import { cn } from "@/lib/cn";
import {
  createGalleryItem,
  deleteGalleryItem,
  galleryUrl,
  listGallery,
  updateGalleryItem,
  uploadGalleryImage,
  type GalleryRow,
} from "./api";
import { extensionFor, prepareImage } from "./image";
import { S } from "./strings";
import { inputClass, serviceTitle } from "./ui";

function UploadForm({ sb, nextOrder, onDone }: { sb: SupabaseClient; nextOrder: number; onDone: () => Promise<void> }) {
  const services = getEnabledServices();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [titleBg, setTitleBg] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [before, setBefore] = useState<File | null>(null);
  const [after, setAfter] = useState<File | null>(null);
  const [publish, setPublish] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [formKey, setFormKey] = useState(0);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!serviceId || !titleBg.trim() || !titleEn.trim() || !before || !after) {
      setMessage({ ok: false, text: S.fillAll });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const [b, a] = await Promise.all([prepareImage(before), prepareImage(after)]);
      const id = crypto.randomUUID();
      const beforePath = `${serviceId}/${id}-before.${extensionFor(b)}`;
      const afterPath = `${serviceId}/${id}-after.${extensionFor(a)}`;
      await uploadGalleryImage(sb, beforePath, b);
      await uploadGalleryImage(sb, afterPath, a);
      await createGalleryItem(sb, {
        service_id: serviceId,
        title_bg: titleBg.trim(),
        title_en: titleEn.trim(),
        description_bg: null,
        description_en: null,
        before_path: beforePath,
        after_path: afterPath,
        published: publish,
        sort_order: nextOrder,
      });
      setTitleBg("");
      setTitleEn("");
      setBefore(null);
      setAfter(null);
      setFormKey((k) => k + 1); // clears the file inputs
      setMessage({ ok: true, text: S.uploaded });
      await onDone();
    } catch {
      setMessage({ ok: false, text: S.errorGeneric });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form key={formKey} onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2">
      <h3 className="font-display text-lg font-semibold sm:col-span-2">{S.uploadTitle}</h3>
      <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
        {S.service}
        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={inputClass}>
          {services.map((s) => <option key={s.id} value={s.id}>{s.title.bg}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {S.titleBg}
        <input value={titleBg} maxLength={120} onChange={(e) => setTitleBg(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {S.titleEn}
        <input value={titleEn} maxLength={120} onChange={(e) => setTitleEn(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {S.before}
        <input type="file" accept="image/*" onChange={(e) => setBefore(e.target.files?.[0] ?? null)} className="text-sm text-fg-muted file:mr-3 file:min-h-11 file:rounded-full file:border file:border-line file:bg-bg file:px-4 file:text-fg" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {S.after}
        <input type="file" accept="image/*" onChange={(e) => setAfter(e.target.files?.[0] ?? null)} className="text-sm text-fg-muted file:mr-3 file:min-h-11 file:rounded-full file:border file:border-line file:bg-bg file:px-4 file:text-fg" />
      </label>
      <p className="text-xs text-fg-muted sm:col-span-2">{S.photoHint}</p>
      <label className="flex items-center gap-3 text-sm sm:col-span-2">
        <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="h-5 w-5 accent-accent" />
        {S.publishNow}
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 aria-hidden="true" size={17} className="animate-spin" /> : <Upload aria-hidden="true" size={17} />}
          {busy ? S.uploading : S.upload}
        </Button>
        <p role="status" aria-live="polite" className={cn("text-sm", message?.ok ? "text-success" : "text-error")}>
          {message?.text}
        </p>
      </div>
    </form>
  );
}

export function GalleryPanel({ sb }: { sb: SupabaseClient }) {
  const [rows, setRows] = useState<GalleryRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await listGallery(sb));
      setError(false);
    } catch {
      setError(true);
    }
  }, [sb]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    try {
      await action();
      await load();
    } catch {
      setError(true);
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  };

  /** Swaps sort order with the neighbour (falls back to list positions when they are equal). */
  const move = (index: number, delta: -1 | 1) => {
    if (!rows) return;
    const other = rows[index + delta];
    const current = rows[index];
    if (!other || !current) return;
    const same = current.sort_order === other.sort_order;
    const a = same ? index : current.sort_order;
    const b = same ? index + delta : other.sort_order;
    void act(current.id, async () => {
      await updateGalleryItem(sb, current.id, { sort_order: b });
      await updateGalleryItem(sb, other.id, { sort_order: a });
    });
  };

  const nextOrder = rows && rows.length > 0 ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;

  return (
    <section aria-labelledby="gallery-admin-title" className="flex flex-col gap-5">
      <h2 id="gallery-admin-title" className="font-display text-xl font-semibold">{S.galleryTitle}</h2>
      <UploadForm sb={sb} nextOrder={nextOrder} onDone={load} />

      {error && <p role="alert" className="rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{S.errorGeneric}</p>}

      {!rows ? (
        <p className="flex items-center gap-2 text-fg-muted"><Loader2 aria-hidden="true" size={18} className="animate-spin" /> {S.loading}</p>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-6 py-10 text-center text-fg-muted">{S.galleryEmpty}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rows.map((row, index) => (
            <li key={row.id} className={cn("flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4", !row.published && "opacity-75")}>
              <div className="grid grid-cols-2 gap-2">
                {[row.before_path, row.after_path].map((path, i) => (
                  <img key={path} src={galleryUrl(sb, path)} alt={i === 0 ? S.before : S.after} loading="lazy" className="aspect-[3/4] w-full rounded-xl bg-bg-2 object-cover" />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{row.title_bg}</p>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", row.published ? "bg-success/15 text-success" : "bg-surface-hover text-fg-muted")}>
                  {row.published ? S.published : S.hidden}
                </span>
              </div>
              <p className="text-sm text-fg-muted">{serviceTitle(row.service_id)} · {row.title_en}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" disabled={busyId === row.id} onClick={() => void act(row.id, () => updateGalleryItem(sb, row.id, { published: !row.published }))}>
                  {row.published ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}
                  {row.published ? S.unpublish : S.publish}
                </Button>
                <Button size="sm" variant="ghost" aria-label={`${S.moveUp}: ${row.title_bg}`} disabled={index === 0 || busyId !== null} onClick={() => move(index, -1)}>
                  <ArrowUp aria-hidden="true" size={16} />
                </Button>
                <Button size="sm" variant="ghost" aria-label={`${S.moveDown}: ${row.title_bg}`} disabled={index === rows.length - 1 || busyId !== null} onClick={() => move(index, 1)}>
                  <ArrowDown aria-hidden="true" size={16} />
                </Button>
                {confirmId === row.id ? (
                  <Button size="sm" variant="secondary" className="ml-auto border-error text-error" disabled={busyId === row.id} onClick={() => void act(row.id, () => deleteGalleryItem(sb, row))}>
                    <Trash2 aria-hidden="true" size={16} /> {S.confirmDelete}
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setConfirmId(row.id)}>
                    <Trash2 aria-hidden="true" size={16} /> {S.deleteItem}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
