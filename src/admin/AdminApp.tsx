import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { CalendarDays, ExternalLink, Images, Inbox, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getSupabase } from "@/lib/supabase";
import { BASE_PATH } from "@/lib/locale";
import { cn } from "@/lib/cn";
import { isAdmin, listInquiries, type InquiryRow } from "./api";
import { InquiriesPanel } from "./InquiriesPanel";
import { SchedulePanel } from "./SchedulePanel";
import { GalleryPanel } from "./GalleryPanel";
import { S } from "./strings";
import { inputClass } from "./ui";

type Tab = "inquiries" | "schedule" | "gallery";

function Centered({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-4 px-4 py-12">{children}</div>;
}

function LoginScreen({ sb }: { sb: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) setError(S.loginFailed);
  };

  return (
    <Centered>
      <h1 className="font-display text-3xl font-semibold">{S.loginTitle}</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
        <label className="flex flex-col gap-2 text-sm font-medium">
          {S.email}
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          {S.password}
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </label>
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 aria-hidden="true" size={17} className="animate-spin" />}
          {busy ? S.signingIn : S.signIn}
        </Button>
      </form>
      <a href={BASE_PATH} className="text-sm text-fg-muted hover:text-fg">← {S.viewSite}</a>
    </Centered>
  );
}

export function AdminApp() {
  const [sb, setSb] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [admin, setAdmin] = useState<boolean | undefined>(undefined);
  const [tab, setTab] = useState<Tab>(() => {
    const h = window.location.hash.slice(1);
    return h === "schedule" || h === "gallery" ? h : "inquiries";
  });
  const [inquiries, setInquiries] = useState<InquiryRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const configured = getSupabase() !== null;

  useEffect(() => {
    document.title = S.appTitle;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
  }, []);

  useEffect(() => {
    const promise = getSupabase();
    if (!promise) return;
    let unsub: (() => void) | undefined;
    void promise.then(async (client) => {
      setSb(client);
      const { data } = await client.auth.getSession();
      setSession(data.session);
      const { data: sub } = client.auth.onAuthStateChange((_event, next) => setSession(next));
      unsub = () => sub.subscription.unsubscribe();
    });
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (!sb || !session) {
      setAdmin(undefined);
      return;
    }
    isAdmin(sb).then(setAdmin, () => setAdmin(false));
  }, [sb, session]);

  const reload = useCallback(async () => {
    if (!sb) return;
    try {
      setLoadError(false);
      setInquiries(await listInquiries(sb));
    } catch {
      setLoadError(true);
    }
  }, [sb]);

  useEffect(() => {
    if (!admin) return;
    void reload();
    const timer = window.setInterval(() => void reload(), 60_000);
    return () => window.clearInterval(timer);
  }, [admin, reload]);

  const selectTab = (next: Tab) => {
    setTab(next);
    window.history.replaceState(null, "", `#${next}`);
  };

  if (!configured) {
    return (
      <Centered>
        <h1 className="font-display text-2xl font-semibold">{S.notConfiguredTitle}</h1>
        <p className="text-fg-muted">{S.notConfiguredText}</p>
      </Centered>
    );
  }

  if (!sb || session === undefined || (session && admin === undefined)) {
    return (
      <Centered>
        <p className="flex items-center gap-2 text-fg-muted">
          <Loader2 aria-hidden="true" size={18} className="animate-spin" /> {S.loading}
        </p>
      </Centered>
    );
  }

  if (!session) return <LoginScreen sb={sb} />;

  if (!admin) {
    return (
      <Centered>
        <h1 className="font-display text-2xl font-semibold">{S.noAccessTitle}</h1>
        <p className="text-fg-muted">{S.noAccessText}</p>
        <Button variant="secondary" onClick={() => void sb.auth.signOut()}>
          <LogOut aria-hidden="true" size={17} /> {S.signOut}
        </Button>
      </Centered>
    );
  }

  const newCount = inquiries?.filter((i) => i.status === "new").length ?? 0;
  const tabs: { id: Tab; label: string; icon: typeof Inbox; badge?: number }[] = [
    { id: "inquiries", label: S.tabs.inquiries, icon: Inbox, badge: newCount },
    { id: "schedule", label: S.tabs.schedule, icon: CalendarDays },
    { id: "gallery", label: S.tabs.gallery, icon: Images },
  ];

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <h1 className="font-display text-lg font-semibold">{S.appTitle}</h1>
          <div className="ml-auto flex items-center gap-1">
            <a href={BASE_PATH} className="flex h-11 items-center gap-1.5 rounded-full px-3 text-sm text-fg-muted hover:text-fg">
              <ExternalLink aria-hidden="true" size={16} /> {S.viewSite}
            </a>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => void sb.auth.signOut()}
              className="flex h-11 items-center gap-1.5 rounded-full px-3 text-sm text-fg-muted hover:text-fg"
            >
              <LogOut aria-hidden="true" size={16} /> {S.signOut}
            </button>
          </div>
          <nav aria-label={S.appTitle} className="w-full">
            <ul className="flex flex-wrap gap-1">
              {tabs.map(({ id, label, icon: Icon, badge }) => (
                <li key={id}>
                  <button
                    type="button"
                    aria-current={tab === id ? "page" : undefined}
                    onClick={() => selectTab(id)}
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors sm:px-4",
                      tab === id ? "bg-surface-hover text-fg" : "text-fg-muted hover:text-fg",
                    )}
                  >
                    <Icon aria-hidden="true" size={17} />
                    {label}
                    {!!badge && (
                      <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-bg" aria-label={S.newBadge(badge)}>
                        {badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {loadError && tab !== "gallery" && (
          <p role="alert" className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
            {S.errorGeneric}
            <Button size="sm" variant="secondary" onClick={() => void reload()}>{S.retry}</Button>
          </p>
        )}
        {tab === "inquiries" && <InquiriesPanel sb={sb} inquiries={inquiries} onChanged={reload} />}
        {tab === "schedule" && <SchedulePanel inquiries={inquiries} />}
        {tab === "gallery" && <GalleryPanel sb={sb} />}
      </main>
    </div>
  );
}
