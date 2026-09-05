import React, { useState } from 'react';
import { Printer, TrendingUp, TrendingDown, IndianRupee, Download } from 'lucide-react';
import { useAccountingStore } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { AccountantNav } from '../../../components/ui/AccountantNav';

export const ProfitLossReportPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { invoices, bills, accounts } = useAccountingStore();
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Compute Revenue / Sales Income
  const salesIncome = invoices
    .filter((inv) => inv.status !== 'Draft' && inv.status !== 'Cancelled' && inv.date.startsWith(selectedYear))
    .reduce((s, inv) => s + inv.total, 0);

  // Compute Purchase Costs
  const purchaseExpenses = bills
    .filter((b) => b.status !== 'Draft' && b.status !== 'Cancelled' && b.date.startsWith(selectedYear))
    .reduce((s, b) => s + b.total, 0);

  // Operational Expenses from ledger accounts
  const otherExpenses = accounts
    .filter((a) => a.type === 'Expense' && a.code !== '5000')
    .reduce((s, a) => s + a.balance, 0);

  const totalExpenses = purchaseExpenses + otherExpenses;
  const netIncome = salesIncome - totalExpenses;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/reports/pnl" onNavigate={onNavigate} />

      <div className="content-header">
        <div>
          <h1 className="page-title">Profit & Loss Statement (Income Statement)</h1>
          <p className="page-subtitle">
            Financial performance summary: Operating revenues, cost of sales, operational overheads, and net profit
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            className="form-input select-filter"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="2026">Fiscal Year 2026</option>
            <option value="2025">Fiscal Year 2025</option>
          </select>

          <Button variant="outline" onClick={() => window.print()} leftIcon={<Printer size={15} />}>
            Print Statement
          </Button>
          <Button
            variant="primary"
            onClick={() => alert(`Exported P&L for FY ${selectedYear} as financial PDF.`)}
            leftIcon={<Download size={15} strokeWidth={2} />}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-badge teal">
            <TrendingUp size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">₹{salesIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="stat-label">Total Operating Revenue</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-badge amber">
            <TrendingDown size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">₹{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="stat-label">Total Operating Expenses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-badge teal">
            <IndianRupee size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number" style={{ color: netIncome >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
              {netIncome >= 0 ? '+' : ''}${netIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="stat-label">Net Fiscal Earnings (Profit)</div>
          </div>
        </div>
      </div>

      {/* Detailed Statement Card Panel */}
      <div className="card-panel">
        <div className="card-header">
          <h2 className="card-title">Fiscal Year {selectedYear} Income & Expense Breakdown</h2>
          <span className="badge-pill badge-completed">Accrual Basis Accounting</span>
        </div>

        <table className="custom-table" style={{ border: '1px solid var(--color-border)', borderRadius: '8px' }}>
          <tbody>
            {/* Income Section */}
            <tr style={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>
              <td colSpan={2} style={{ color: 'var(--color-primary)', fontSize: '15px' }}>
                1. REVENUE / OPERATING INCOME
              </td>
            </tr>
            <tr>
              <td style={{ paddingLeft: '32px' }}>Gross Invoiced Sales Revenue (Customer Invoices)</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{salesIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
            <tr style={{ fontWeight: 700, borderBottom: '2px solid var(--color-border)' }}>
              <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>TOTAL REVENUE:</td>
              <td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>₹{salesIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>

            {/* Expenses Section */}
            <tr style={{ backgroundColor: 'var(--color-surface-hover)', fontWeight: 700 }}>
              <td colSpan={2} style={{ color: 'var(--color-warning-text)', fontSize: '15px', paddingTop: '16px' }}>
                2. COST OF SALES & OPERATIONAL EXPENSES
              </td>
            </tr>
            <tr>
              <td style={{ paddingLeft: '32px' }}>Direct Purchases & Raw Materials (Vendor Bills)</td>
              <td style={{ textAlign: 'right' }}>₹{purchaseExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
            <tr>
              <td style={{ paddingLeft: '32px' }}>Operational, Administrative & Overhead Expenses</td>
              <td style={{ textAlign: 'right' }}>₹{otherExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
            <tr style={{ fontWeight: 700, borderBottom: '2px solid var(--color-border)' }}>
              <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>TOTAL EXPENDITURE:</td>
              <td style={{ textAlign: 'right', color: 'var(--color-warning-text)' }}>₹{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>

            {/* Net Profit Summary */}
            <tr
              style={{
                backgroundColor: 'var(--color-surface-active)',
                fontWeight: 800,
                fontSize: '15px',
                borderTop: '2px solid var(--color-border)',
              }}
            >
              <td style={{ textAlign: 'right', color: netIncome >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                NET OPERATING INCOME / (LOSS):
              </td>
              <td style={{ textAlign: 'right', color: netIncome >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>₹{netIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfitLossReportPage;
