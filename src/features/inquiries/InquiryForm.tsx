import { useEffect, useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2, Copy, Info, Loader2, MessageCircle, Send } from "lucide-react";
import { useLocale } from "@/app/providers/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { getEnabledServices, getServiceById, siteConfig } from "@/config";
import { viberHref } from "@/lib/contact";
import { localize } from "@/lib/locale";
import { cn } from "@/lib/cn";
import { useInquiryIntent } from "./InquiryIntentContext";
import {
  emptyInquiry,
  INQUIRY_FIELDS,
  validateInquiry,
  type InquiryErrors,
  type InquiryField,
  type InquiryValues,
} from "./inquiry.schema";
import { isDemoMode, submitInquiry } from "./inquiry.service";
import { buildInquiryMessage } from "./viber";

type Feedback =
  | { kind: "success" | "error" | "info"; text: string }
  | null;

const inputClass =
  "w-full rounded-xl border bg-bg px-4 py-3 text-fg placeholder:text-fg-muted/60 " +
  "transition-colors focus:border-accent focus:outline-none";

function todayIso(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

/** `onSent` runs after the server accepted the inquiry (the booking window uses it to close). */
export function InquiryForm({ onSent }: { onSent?: () => void } = {}) {
  const { t } = useTranslation();
  const { lang } = useLocale();
  const { serviceId: intendedService } = useInquiryIntent();
  const uid = useId();

  const services = useMemo(() => getEnabledServices(), []);
  const serviceIds = useMemo(() => services.map((s) => s.id), [services]);
  const viberLink = viberHref(siteConfig.contact.viber);
  const demo = isDemoMode();

  const [values, setValues] = useState<InquiryValues>(emptyInquiry);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [manualCopy, setManualCopy] = useState<string | null>(null);

  // "Ask about this service" on a card preselects the service here.
  useEffect(() => {
    if (intendedService && serviceIds.includes(intendedService)) {
      setValues((v) => ({ ...v, serviceId: intendedService }));
      setErrors((e) => ({ ...e, serviceId: undefined }));
    }
  }, [intendedService, serviceIds]);

  const id = (field: InquiryField) => `${uid}-${field}`;

  const set = <K extends InquiryField>(field: K, value: InquiryValues[K]) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  /** Validates; on failure shows errors and focuses the first invalid field. */
  const validate = (): InquiryValues | null => {
    const result = validateInquiry(values, serviceIds);
    if (result.ok) {
      setErrors({});
      return result.data;
    }
    setErrors(result.errors);
    setFeedback({ kind: "error", text: t("status.fixErrors") });
    const first = INQUIRY_FIELDS.find((f) => result.errors[f]);
    if (first) document.getElementById(id(first))?.focus();
    return null;
  };

  const message = (data: InquiryValues) => {
    const service = getServiceById(data.serviceId);
    return buildInquiryMessage(data, service ? localize(service.title, lang) : data.serviceId, lang, t);
  };

  /** Copies inside the click handler; falls back to a selectable text box. */
  const copyText = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setManualCopy(null);
      return true;
    } catch {
      setManualCopy(text);
      return false;
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const data = validate();
    if (!data) return;

    setSubmitting(true);
    setFeedback(null);
    const result = await submitInquiry(data, lang);
    setSubmitting(false);

    if (result.status === "accepted") {
      setFeedback({ kind: "success", text: t("status.accepted") });
      setValues(emptyInquiry);
      onSent?.();
    } else if (result.status === "demo") {
      setFeedback({ kind: "info", text: t("status.demo") });
    } else {
      // Keep everything the visitor typed (SRS §6.3).
      setFeedback({
        kind: "error",
        text: t(result.reason === "network" ? "status.errorNetwork" : "status.errorServer"),
      });
    }
  };

  const onCopy = async () => {
    const data = validate();
    if (!data) return;
    const ok = await copyText(message(data));
    setFeedback(ok ? { kind: "success", text: t("status.copied") } : { kind: "info", text: t("status.copyManual") });
  };

  const onViber = async () => {
    const data = validate();
    if (!data || !viberLink) return;
    const ok = await copyText(message(data));
    // Never claim the message was sent: we only open the chat (SRS §6.4).
    setFeedback({
      kind: "info",
      text: t(ok ? "status.viberOpened" : "status.viberOpenedManual", { number: siteConfig.contact.viber }),
    });
    window.location.href = viberLink;
  };

  const field = (name: InquiryField, label: ReactNode, control: ReactNode, optional = false) => (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id(name)} className="text-sm font-medium text-fg">
        {label}
        {optional && <span className="ml-1.5 font-normal text-fg-muted">({t("form.optional")})</span>}
      </label>
      {control}
      {errors[name] && (
        <p id={`${id(name)}-error`} className="flex items-start gap-1.5 text-sm text-error">
          <AlertCircle aria-hidden="true" size={15} className="mt-0.5 shrink-0" />
          {t(errors[name] as string)}
        </p>
      )}
    </div>
  );

  const a11y = (name: InquiryField) => ({
    id: id(name),
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id(name)}-error` : undefined,
  });

  const borderFor = (name: InquiryField) => (errors[name] ? "border-error" : "border-line");

  const FeedbackIcon = feedback?.kind === "success" ? CheckCircle2 : feedback?.kind === "error" ? AlertCircle : Info;

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5" aria-describedby={demo ? `${uid}-demo` : undefined}>
      {demo && (
        <p
          id={`${uid}-demo`}
          className="flex items-start gap-2.5 rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-fg"
        >
          <Info aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-accent" />
          <span>
            <strong className="font-semibold">{t("form.demoTitle")}</strong> {t("form.demoText")}
          </span>
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "name",
          t("form.name"),
          <input
            {...a11y("name")}
            type="text"
            autoComplete="name"
            maxLength={100}
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className={cn(inputClass, borderFor("name"))}
          />,
        )}
        {field(
          "phone",
          t("form.phone"),
          <input
            {...a11y("phone")}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+359 88 123 4567"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={cn(inputClass, borderFor("phone"))}
          />,
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "email",
          t("form.email"),
          <input
            {...a11y("email")}
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            className={cn(inputClass, borderFor("email"))}
          />,
          true,
        )}
        {field(
          "serviceId",
          t("form.service"),
          <select
            {...a11y("serviceId")}
            value={values.serviceId}
            onChange={(e) => set("serviceId", e.target.value)}
            className={cn(inputClass, borderFor("serviceId"), "appearance-none")}
          >
            <option value="" disabled>
              {t("form.servicePlaceholder")}
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {localize(s.title, lang)}
              </option>
            ))}
          </select>,
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "vehicle",
          t("form.vehicle"),
          <input
            {...a11y("vehicle")}
            type="text"
            maxLength={100}
            placeholder={t("form.vehiclePlaceholder")}
            value={values.vehicle}
            onChange={(e) => set("vehicle", e.target.value)}
            className={cn(inputClass, borderFor("vehicle"))}
          />,
          true,
        )}
        {field(
          "preferredDate",
          t("form.date"),
          <input
            {...a11y("preferredDate")}
            type="date"
            min={todayIso()}
            value={values.preferredDate}
            onChange={(e) => set("preferredDate", e.target.value)}
            className={cn(inputClass, borderFor("preferredDate"))}
          />,
          true,
        )}
      </div>

      {field(
        "message",
        t("form.message"),
        <textarea
          {...a11y("message")}
          rows={5}
          maxLength={2000}
          placeholder={t("form.messagePlaceholder")}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          className={cn(inputClass, borderFor("message"), "resize-y")}
        />,
      )}

      {/* Honeypot — invisible to people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>{t("form.honeypot")}</label>
        <input
          id={id("website")}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <input
            {...a11y("consent")}
            type="checkbox"
            checked={values.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-accent"
          />
          <label htmlFor={id("consent")} className="text-sm text-fg-muted">
            {t("form.consent")}
          </label>
        </div>
        {errors.consent && (
          <p id={`${id("consent")}-error`} className="flex items-start gap-1.5 text-sm text-error">
            <AlertCircle aria-hidden="true" size={15} className="mt-0.5 shrink-0" />
            {t(errors.consent)}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
        <Button type="submit" disabled={submitting} aria-busy={submitting}>
          {submitting ? (
            <Loader2 aria-hidden="true" size={18} className="animate-spin motion-reduce:animate-none" />
          ) : (
            <Send aria-hidden="true" size={17} />
          )}
          {submitting ? t("form.submitting") : t("form.submit")}
        </Button>
        {viberLink && (
          <Button variant="secondary" onClick={onViber}>
            <MessageCircle aria-hidden="true" size={17} />
            {t("form.viber")}
          </Button>
        )}
        <Button variant="secondary" onClick={onCopy}>
          <Copy aria-hidden="true" size={17} />
          {t("form.copy")}
        </Button>
      </div>

      <div role="status" aria-live="polite" className="empty:hidden">
        {feedback && (
          <p
            className={cn(
              "flex items-start gap-2 rounded-xl px-4 py-3 text-sm",
              feedback.kind === "success" && "bg-success/10 text-success",
              feedback.kind === "error" && "bg-error/10 text-error",
              feedback.kind === "info" && "bg-surface-hover text-fg",
            )}
          >
            <FeedbackIcon aria-hidden="true" size={17} className="mt-0.5 shrink-0" />
            {feedback.text}
          </p>
        )}
      </div>

      {manualCopy && (
        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-manual`} className="text-sm text-fg-muted">
            {t("form.manualCopyLabel")}
          </label>
          <textarea
            id={`${uid}-manual`}
            readOnly
            rows={8}
            value={manualCopy}
            onFocus={(e) => e.currentTarget.select()}
            className={cn(inputClass, "border-line font-mono text-sm")}
          />
        </div>
      )}
    </form>
  );
}
