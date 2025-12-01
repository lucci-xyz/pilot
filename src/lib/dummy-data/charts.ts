import { SpendChartData, ChartDataPoint } from "./types";

// Generate dates for the last N days
function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
}

// Generate months for the last N months
function getLastNMonths(n: number): string[] {
  const months: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    months.push(date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }));
  }
  return months;
}

// Daily spend data (last 30 days)
const dailyDates = getLastNDays(30);
export const dailySpendData: ChartDataPoint[] = dailyDates.map((date, i) => ({
  date,
  value: Math.round(800 + Math.random() * 600 + Math.sin(i * 0.3) * 200),
  label: new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
}));

// Weekly spend data (last 12 weeks)
const weeklyDates = getLastNDays(84).filter((_, i) => i % 7 === 0);
export const weeklySpendData: ChartDataPoint[] = weeklyDates.map((date, i) => ({
  date,
  value: Math.round(6000 + Math.random() * 3000 + Math.sin(i * 0.5) * 1500),
  label: `Week ${i + 1}`,
}));

// Monthly spend data (last 12 months)
const monthlyLabels = getLastNMonths(12);
export const monthlySpendData: ChartDataPoint[] = monthlyLabels.map((label, i) => ({
  date: label,
  value: Math.round(15000 + i * 1500 + Math.random() * 5000),
  label,
}));

export const spendChartData: SpendChartData = {
  daily: dailySpendData,
  weekly: weeklySpendData,
  monthly: monthlySpendData,
};

// Bot comparison data
export const botComparisonData = [
  { name: "Ticket Classifier", spend: 12500, requests: 145000 },
  { name: "FAQ Responder", spend: 15200, requests: 230000 },
  { name: "Lead Qualifier", spend: 14500, requests: 98000 },
  { name: "Blog Writer", spend: 11200, requests: 28000 },
  { name: "Report Generator", spend: 13500, requests: 18000 },
  { name: "Welcome Bot", spend: 5800, requests: 45000 },
];

// Project comparison data
export const projectComparisonData = [
  { name: "Customer Support", spend: 45200, bots: 4 },
  { name: "Sales Assistant", spend: 32100, bots: 3 },
  { name: "Content Generation", spend: 28700, bots: 3 },
  { name: "Data Analysis", spend: 22500, bots: 2 },
  { name: "User Onboarding", spend: 15800, bots: 3 },
  { name: "Product Feedback", spend: 14200, bots: 2 },
];

// Bot performance over time (requests per day for a specific bot)
export const botPerformanceData = getLastNDays(14).map((date, i) => ({
  date,
  requests: Math.round(1000 + Math.random() * 500 + Math.sin(i * 0.8) * 300),
  errors: Math.round(Math.random() * 15),
  latency: Math.round(150 + Math.random() * 100),
}));

// Spend by model type
export const spendByModelData = [
  { model: "gpt-4o", spend: 85000, percentage: 52 },
  { model: "gpt-4o-mini", spend: 62000, percentage: 38 },
  { model: "claude-3", spend: 12500, percentage: 8 },
  { model: "other", spend: 3500, percentage: 2 },
];

