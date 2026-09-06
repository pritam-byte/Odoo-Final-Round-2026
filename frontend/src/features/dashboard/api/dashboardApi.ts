import { apiGet } from '../../../lib/apiClient';

export interface DashboardSummary {
  totalReceivables: number;
  totalPayables: number;
  totalLiquidCash: number;
  activeBudgetsCount: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export interface FinancialTrendPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface FinancialTrendResponse {
  period: { start: string; end: string };
  hasData: boolean;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  trend: FinancialTrendPoint[];
}

export interface CashFlowPoint {
  month: string;
  received: number;
  paid: number;
  netCash: number;
}

export interface CashFlowResponse {
  period: { start: string; end: string };
  hasData: boolean;
  totalReceived: number;
  totalPaid: number;
  cashFlow: CashFlowPoint[];
}

export interface AgingBucket {
  range: string;
  amount: number;
  count: number;
}

export interface ReceivablesAgingResponse {
  totalOutstanding: number;
  invoiceCount: number;
  hasData: boolean;
  buckets: AgingBucket[];
}

export interface BudgetUtilizationItem {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  status: string;
  analyticName: string;
  responsibleName: string;
  committedAmount: number;
  achievedAmount: number;
  utilizationPercent: number;
  color: 'teal' | 'amber' | 'red';
}

export interface BudgetUtilizationResponse {
  hasData: boolean;
  achievedCount: number;
  budgetCount: number;
  committedCount: number;
  budgets: BudgetUtilizationItem[];
}

export interface DebtorItem {
  customerId: string;
  customerName: string;
  customerEmail: string;
  outstandingAmount: number;
  invoiceCount: number;
  overdueCount: number;
}

export interface TopDebtorsResponse {
  hasData: boolean;
  totalOutstanding: number;
  debtors: DebtorItem[];
}

export interface ActivityItem {
  id: string;
  type: 'INVOICE' | 'BILL' | 'PAYMENT' | 'JOURNAL_ENTRY';
  reference: string;
  partnerName: string;
  amount: number;
  date: string;
  createdAt: string;
  status: string;
  paymentState?: string;
  description: string;
}

export interface RecentActivityResponse {
  hasData: boolean;
  activities: ActivityItem[];
}

export type DateFilterPeriod = '30d' | '6m' | 'fy' | 'custom';

export async function fetchDashboardSummary() {
  return apiGet<DashboardSummary>('/dashboard/summary');
}

export async function fetchFinancialTrend(params?: {
  period?: DateFilterPeriod;
  months?: number;
  startDate?: string;
  endDate?: string;
}) {
  return apiGet<FinancialTrendResponse>('/dashboard/financial-trend', params);
}

export async function fetchCashFlow(params?: {
  period?: DateFilterPeriod;
  months?: number;
  startDate?: string;
  endDate?: string;
}) {
  return apiGet<CashFlowResponse>('/dashboard/cash-flow', params);
}

export async function fetchReceivablesAging() {
  return apiGet<ReceivablesAgingResponse>('/dashboard/receivables-aging');
}

export async function fetchBudgetUtilization() {
  return apiGet<BudgetUtilizationResponse>('/dashboard/budget-utilization');
}

export async function fetchTopDebtors(limit = 5) {
  return apiGet<TopDebtorsResponse>('/dashboard/top-debtors', { limit });
}

export async function fetchRecentActivity(limit = 10) {
  return apiGet<RecentActivityResponse>('/dashboard/recent-activity', { limit });
}
