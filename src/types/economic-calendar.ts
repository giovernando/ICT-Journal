export type EconomicCurrency = "USD" | "EUR" | "GBP";
export type EconomicImpact = "High" | "Medium" | "Low" | "Holiday";

export interface EconomicEvent {
  id: string;
  title: string;
  currency: EconomicCurrency;
  impact: EconomicImpact;
  date: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
}
