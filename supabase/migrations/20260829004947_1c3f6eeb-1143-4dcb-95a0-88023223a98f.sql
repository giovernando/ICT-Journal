CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  pair TEXT NOT NULL DEFAULT '',
  bias TEXT NOT NULL DEFAULT 'Bullish',
  dol TEXT NOT NULL DEFAULT '',
  entry_model TEXT NOT NULL DEFAULT '',
  killzone TEXT NOT NULL DEFAULT 'NY AM',
  position TEXT NOT NULL DEFAULT 'Long',
  status TEXT NOT NULL DEFAULT 'Running',
  rr NUMERIC,
  screenshot TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trades TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trades TO authenticated;
GRANT ALL ON public.trades TO service_role;

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read trades" ON public.trades FOR SELECT USING (true);
CREATE POLICY "Anyone can insert trades" ON public.trades FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update trades" ON public.trades FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete trades" ON public.trades FOR DELETE USING (true);

CREATE INDEX trades_date_idx ON public.trades (date DESC);