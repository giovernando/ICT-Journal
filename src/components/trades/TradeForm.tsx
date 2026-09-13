import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/kit/Button";
import { Field } from "@/components/kit/Field";
import { Input, Textarea } from "@/components/kit/Input";
import { ChevronDown } from "lucide-react";
import { ChoiceGroup } from "@/components/trades/ChoiceGroup";
import { useTradeForm } from "@/hooks/useTradeForm";
import { CURRENCY_OPTIONS } from "@/lib/money";
import {
  BIAS_OPTIONS,
  BIAS_TONE,
  DOL_OPTIONS,
  ENTRY_MODEL_OPTIONS,
  KILLZONE_OPTIONS,
  POSITION_OPTIONS,
  POSITION_TONE,
  QUARTAL_OPTIONS,
  RAID_OPTIONS,
  STATUS_OPTIONS,
  STATUS_TONE,
} from "@/lib/trade-options";
import type { Currency, Quartal, Trade, TradeDraft } from "@/types/trade";

const RR_EXAMPLES = [
  { label: "1:2", value: "1:2", tone: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" },
  {
    label: "1:3.5",
    value: "1:3.5",
    tone: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  },
  { label: "-1 (SL)", value: "-1", tone: "border-rose-500/25 bg-rose-500/10 text-rose-400" },
  { label: "0 (BE)", value: "0", tone: "border-border/70 bg-card/50 text-muted-foreground" },
] as const;

function SuggestionInput({
  id,
  value,
  options,
  placeholder,
  onChange,
}: {
  id: string;
  value: string;
  options: readonly string[];
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const visibleOptions = showAll
    ? options
    : options.filter((option) => option.toLowerCase().includes(value.toLowerCase()));

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        className="pr-10"
        onFocus={() => {
          setShowAll(true);
          setOpen(true);
        }}
        onChange={(event) => {
          setShowAll(false);
          setOpen(true);
          onChange(event.target.value);
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Buka pilihan"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          setShowAll(true);
          setOpen((current) => !current);
        }}
        className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-muted-foreground"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && visibleOptions.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-black/20">
          {visibleOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
                setShowAll(false);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-900 transition-colors hover:bg-slate-100"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface TradeFormProps {
  initial?: Trade | null;
  onSubmit: (draft: TradeDraft) => void;
  onCancel?: () => void;
}

export function TradeForm({ initial, onSubmit, onCancel }: TradeFormProps) {
  const form = useTradeForm({
    initial: initial ?? null,
    onSubmit: (draft) => {
      onSubmit(draft);
    },
  });
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const { draft, errors } = form;

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const ok = form.submit();
        if (ok && !form.isEditing) form.reset();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date & Time" htmlFor={fid("date")} error={errors.date}>
          <Input
            id={fid("date")}
            type="datetime-local"
            value={draft.date}
            onChange={(e) => form.setField("date", e.target.value)}
          />
        </Field>

        <Field label="Pair" htmlFor={fid("pair")} error={errors.pair} hint="Contoh: EURUSD, XAUUSD, BTCUSDT">
          <Input
            id={fid("pair")}
            value={draft.pair}
            placeholder="XAUUSD"
            autoComplete="off"
            className="uppercase"
            onChange={(e) => form.setField("pair", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bias">
          <ChoiceGroup
            value={draft.bias}
            options={BIAS_OPTIONS}
            tones={BIAS_TONE}
            onChange={(v) => form.setField("bias", v)}
          />
        </Field>
        <Field label="Position">
          <ChoiceGroup
            value={draft.position}
            options={POSITION_OPTIONS}
            tones={POSITION_TONE}
            onChange={(v) => form.setField("position", v)}
          />
        </Field>
      </div>

      <Field label="Status / Result">
        <ChoiceGroup
          value={draft.status}
          options={STATUS_OPTIONS}
          tones={STATUS_TONE}
          onChange={(v) => form.setField("status", v)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Draw on Liquidity (DOL)"
          htmlFor={fid("dol")}
          hint="Misal: Daily High, Previous Session Low"
        >
          <SuggestionInput
            id={fid("dol")}
            value={draft.dol}
            options={DOL_OPTIONS}
            placeholder="PDH/L"
            onChange={(value) => form.setField("dol", value)}
          />
        </Field>

        <Field label="Entry Model" htmlFor={fid("entryModel")} error={errors.entryModel}>
          <SuggestionInput
            id={fid("entryModel")}
            value={draft.entryModel}
            options={ENTRY_MODEL_OPTIONS}
            placeholder="FVG"
            onChange={(value) => form.setField("entryModel", value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Killzone" htmlFor={fid("killzone")}>
          <SuggestionInput
            id={fid("killzone")}
            value={draft.killzone}
            options={KILLZONE_OPTIONS}
            placeholder="Asian"
            onChange={(value) => form.setField("killzone", value as (typeof KILLZONE_OPTIONS)[number])}
          />
        </Field>

        <Field
          label="Risk to Reward"
          htmlFor={fid("rr")}
          error={errors.rr}
          hint={
            form.rrPreview
              ? `Tersimpan sebagai ${form.rrPreview}`
              : "Gunakan titik/koma desimal dan ':' untuk rasio"
          }
        >
          <div className="space-y-2">
            <div className="relative">
              <Input
                id={fid("rr")}
                inputMode="text"
                autoComplete="off"
                aria-describedby={fid("rr-help")}
                aria-invalid={errors.rr ? true : undefined}
                value={form.rrInput}
                placeholder="1:2"
                className={errors.rr ? "border-rose-500/60 focus:border-rose-500/60 pr-11" : "pr-11"}
                onChange={(e) => form.setRR(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key.length === 1 && !/[0-9.,:-]/.test(e.key) && !e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                  }
                }}
              />
              <span
                tabIndex={0}
                role="note"
                aria-label="Panduan pengisian RR"
                className="group absolute right-3 top-1/2 -translate-y-1/2 cursor-help select-none rounded-full border border-border/70 bg-card/60 px-1.5 text-[11px] font-bold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                ?
                <span className="pointer-events-none invisible absolute bottom-full right-0 z-20 mb-2 w-60 rounded-xl border border-border/70 bg-[#0d1117]/95 p-3 text-left text-[11px] font-normal leading-relaxed text-muted-foreground opacity-0 shadow-xl backdrop-blur-md transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100">
                  <strong className="text-foreground">Cara isi RR</strong>
                  <br />
                  Profit: tulis <span className="text-emerald-400">2</span> atau{" "}
                  <span className="text-emerald-400">1:3.5</span> (risk:reward).
                  <br />
                  Loss: pakai minus, misal <span className="text-rose-400">-1</span> saat kena SL
                  penuh.
                  <br />
                  BE / Running boleh dikosongkan.
                </span>
              </span>
            </div>
            <div id={fid("rr-help")} className="flex flex-wrap gap-1.5">
              {RR_EXAMPLES.map((ex) => (
                <button
                  key={ex.value}
                  type="button"
                  onClick={() => form.setRR(ex.value)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${ex.tone} ${
                    form.rrInput === ex.value ? "ring-1 ring-ring/50" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Quartal" htmlFor={fid("quartal")}>
          <SuggestionInput
            id={fid("quartal")}
            value={draft.quartal}
            options={QUARTAL_OPTIONS}
            placeholder="Q1"
            onChange={(value) => form.setField("quartal", value as Quartal)}
          />
        </Field>

        <Field
          label="Raid on Liquidity / POI"
          htmlFor={fid("raid")}
          hint="Misal: Monday H/L, PDH/L, SMT"
        >
          <SuggestionInput
            id={fid("raid")}
            value={draft.raid}
            options={RAID_OPTIONS}
            placeholder="PDH/L"
            onChange={(value) => form.setField("raid", value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Profit / Loss"
          htmlFor={fid("pnl")}
          hint="Loss pakai minus, contoh: -150.5. Tekan tombol +/− untuk ubah tanda."
        >
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Input
              id={fid("pnl")}
              type="text"
              inputMode="text"
              autoComplete="off"
              value={form.pnlInput}
              placeholder="0"
              className={form.pnlInput.startsWith("-") ? "text-rose-400" : undefined}
              onChange={(e) => form.setPnl(e.target.value)}
            />
            <button
              type="button"
              onClick={form.togglePnlSign}
              aria-label="Ubah profit menjadi loss"
              className={`h-11 rounded-xl border px-3 text-sm font-bold transition-colors ${
                form.pnlInput.startsWith("-")
                  ? "border-rose-500/40 bg-rose-500/15 text-rose-400"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {form.pnlInput.startsWith("-") ? "−" : "+"}
            </button>
          </div>
        </Field>
        <Field label="Mata Uang" htmlFor={fid("currency")}>
          <SuggestionInput
            id={fid("currency")}
            value={draft.currency}
            options={CURRENCY_OPTIONS}
            placeholder="USD"
            onChange={(value) => form.setField("currency", value as Currency)}
          />
        </Field>
      </div>

      <Field label="Screenshot TradingView" htmlFor={fid("screenshot")} hint="Tempel URL chart atau unggah gambar">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            id={fid("screenshot")}
            value={draft.screenshot?.startsWith("data:") ? "" : (draft.screenshot ?? "")}
            placeholder="https://www.tradingview.com/x/..."
            onChange={(e) => form.setField("screenshot", e.target.value || null)}
            disabled={Boolean(draft.screenshot?.startsWith("data:"))}
          />
          <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border/70 bg-card/40 px-4 text-xs font-semibold text-muted-foreground backdrop-blur-md transition-colors hover:border-border hover:text-foreground">
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void form.setScreenshotFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        {draft.screenshot ? (
          <div className="mt-2 flex items-center gap-3">
            <img
              src={draft.screenshot}
              alt="Preview screenshot chart"
              className="h-16 w-28 rounded-lg border border-border/60 object-cover"
            />
            <Button variant="ghost" size="sm" onClick={() => form.setField("screenshot", null)}>
              Hapus gambar
            </Button>
          </div>
        ) : null}
      </Field>

      <Field label="Notes" htmlFor={fid("notes")}>
        <Textarea
          id={fid("notes")}
          value={draft.notes}
          placeholder="Catatan eksekusi, emosi, konfirmasi tambahan..."
          onChange={(e) => form.setField("notes", e.target.value)}
        />
      </Field>

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
        ) : (
          <Button variant="ghost" onClick={form.reset}>
            Reset
          </Button>
        )}
        <Button type="submit">{form.isEditing ? "Simpan perubahan" : "Catat trade"}</Button>
      </div>
    </form>
  );
}
