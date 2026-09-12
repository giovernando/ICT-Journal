import { useCallback, useEffect, useMemo, useState } from "react";
import { parsePnlInput } from "@/lib/money";
import { formatRRValue, parseRRInput, rrToInput, sanitizeRRInput } from "@/lib/rr";
import { emptyTradeDraft } from "@/lib/trade-options";
import type { Trade, TradeDraft } from "@/types/trade";

export type TradeFormErrors = Partial<Record<keyof TradeDraft, string | undefined>>;

interface Options {
  initial?: Trade | null;
  onSubmit: (draft: TradeDraft) => void;
}

export function useTradeForm({ initial, onSubmit }: Options) {
  const [draft, setDraft] = useState<TradeDraft>(() =>
    initial ? stripMeta(initial) : emptyTradeDraft(),
  );
  const [errors, setErrors] = useState<TradeFormErrors>({});
  const [rrInput, setRrInput] = useState(() => rrToInput(initial?.rr));
  const [pnlInput, setPnlInput] = useState(() =>
    initial?.pnl ? String(initial.pnl) : "",
  );

  useEffect(() => {
    setDraft(initial ? stripMeta(initial) : emptyTradeDraft());
    setRrInput(rrToInput(initial?.rr));
    setPnlInput(initial?.pnl ? String(initial.pnl) : "");
    setErrors({});
  }, [initial]);

  const setField = useCallback(<K extends keyof TradeDraft>(key: K, value: TradeDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  /** Real-time: sanitise characters, normalise value, surface a clear error immediately. */
  const setRR = useCallback((raw: string) => {
    const clean = sanitizeRRInput(raw);
    setRrInput(clean);
    const { value, error } = parseRRInput(clean);
    setDraft((prev) => ({ ...prev, rr: value }));
    setErrors((prev) => ({ ...prev, rr: error }));
  }, []);

  /** Money input: keep the raw text (minus only at the front), store parsed number. */
  const setPnl = useCallback((raw: string) => {
    const negative = raw.trim().startsWith("-");
    const digits = raw.replace(/[^0-9.,]/g, "");
    const clean = (negative ? "-" : "") + digits;
    setPnlInput(clean);
    setDraft((prev) => ({ ...prev, pnl: digits ? parsePnlInput(clean) : 0 }));
  }, []);

  /** Toggle profit <-> loss without needing a minus key on the keyboard. */
  const togglePnlSign = useCallback(() => {
    setPnlInput((prev) => {
      const next = prev.startsWith("-") ? prev.slice(1) : `-${prev}`;
      setDraft((d) => ({ ...d, pnl: next.replace(/[^0-9.,]/g, "") ? parsePnlInput(next) : 0 }));
      return next;
    });
  }, []);

  const setScreenshotFile = useCallback(async (file: File | null) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setDraft((prev) => ({ ...prev, screenshot: dataUrl }));
  }, []);

  const validate = useCallback((): TradeFormErrors => {
    const next: TradeFormErrors = {};
    if (!draft.date) next.date = "Tanggal & waktu wajib diisi";
    if (!draft.pair.trim()) next.pair = "Pair wajib diisi";
    if (!draft.entryModel.trim()) next.entryModel = "Entry model wajib diisi";
    const rr = parseRRInput(rrInput);
    if (rrInput.trim() && rr.value === null) {
      next.rr = rr.error ?? "Format RR tidak valid (contoh: 2, -1, atau 1:3.5)";
    }
    return next;
  }, [draft, rrInput]);

  const submit = useCallback(() => {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return false;
    onSubmit({ ...draft, pair: draft.pair.trim().toUpperCase() });
    return true;
  }, [draft, onSubmit, validate]);

  const reset = useCallback(() => {
    setDraft(emptyTradeDraft());
    setRrInput("");
    setPnlInput("");
    setErrors({});
  }, []);

  const isEditing = useMemo(() => Boolean(initial), [initial]);

  const rrPreview = useMemo(
    () => (rrInput.trim() && draft.rr !== null ? formatRRValue(draft.rr) : null),
    [rrInput, draft.rr],
  );

  return {
    draft,
    errors,
    rrInput,
    rrPreview,
    pnlInput,
    setPnl,
    togglePnlSign,
    isEditing,
    setField,
    setRR,
    setScreenshotFile,
    submit,
    reset,
  };
}

function stripMeta(trade: Trade): TradeDraft {
  const { id: _id, createdAt: _createdAt, ...rest } = trade;
  return rest;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
