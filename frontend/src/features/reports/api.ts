import { apiGet, ApiResponse } from '../../lib/apiClient';

export interface ProfitLossReportData {
  period: {
    startDate?: string;
    endDate?: string;
  };
  income: {
    accounts: Record<string, number>;
    total: number;
  };
  expenses: {
    accounts: Record<string, number>;
    total: number;
  };
  netProfit: number;
}

export interface BalanceSheetReportData {
  asOfDate: string;
  assets: {
    accounts: Record<string, number>;
    total: number;
  };
  liabilities: {
    accounts: Record<string, number>;
    total: number;
  };
  capital: {
    accounts: Record<string, number>;
    total: number;
  };
  totalLiabilitiesAndCapital: number;
}

export async function fetchProfitLossApi(startDate?: string, endDate?: string): Promise<ApiResponse<ProfitLossReportData>> {
  return apiGet<ProfitLossReportData>('/reporting/profit-and-loss', { startDate, endDate });
}

export async function fetchBalanceSheetApi(asOfDate?: string): Promise<ApiResponse<BalanceSheetReportData>> {
  return apiGet<BalanceSheetReportData>('/reporting/balance-sheet', { asOfDate });
}
