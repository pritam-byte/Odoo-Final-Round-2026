import React, { useState, useEffect } from 'react';
import { Printer, ArrowLeft, Info, Download } from 'lucide-react';
import { useAccountingStore } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { AccountantNav } from '../../../components/ui/AccountantNav';
import { fetchProfitLossApi, ProfitLossReportData } from '../api';
import { exportProfitLossPdf } from '../../../lib/pdfExport';
import { DocumentSignatureStamp } from '../../../components/ui/DocumentSignatureStamp';
import { CustomSelect } from '../../../components/ui/CustomSelect';

export const ProfitLossReportPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { invoices, bills, accounts } = useAccountingStore();
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [liveReport, setLiveReport] = useState<ProfitLossReportData | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadReport = async () => {
      const start = `${selectedYear}-01-01`;
      const end = `${selectedYear}-12-31`;
      const res = await fetchProfitLossApi(start, end);
      if (isMounted && res.success && res.data) {
        setLiveReport(res.data);
      }
    };
    loadReport();
    return () => { isMounted = false; };
  }, [selectedYear]);

  // Income Computations
  const salesIncome = liveReport
    ? liveReport.income.total
    : invoices
        .filter((inv) => inv.status !== 'Draft' && inv.status !== 'Cancelled' && (inv.date.startsWith(selectedYear) || !inv.date))
        .reduce((s, inv) => s + inv.total, 0) ||
      accounts.filter((a) => a.type === 'Income').reduce((s, a) => s + a.balance, 0);

  const totalIncome = salesIncome;

  // Expense Computations
  const purchaseExpenses = liveReport
    ? (liveReport.expenses.accounts?.['Cost of Goods Sold'] ?? liveReport.expenses.total)
    : bills
        .filter((b) => b.status !== 'Draft' && b.status !== 'Cancelled' && (b.date.startsWith(selectedYear) || !b.date))
        .reduce((s, b) => s + b.total, 0) ||
      accounts.filter((a) => a.name.toLowerCase().includes('cost of goods') || a.name.toLowerCase().includes('purchase')).reduce((s, a) => s + a.balance, 0);

  const otherExpenses = liveReport
    ? (liveReport.expenses.total - (liveReport.expenses.accounts?.['Cost of Goods Sold'] ?? 0))
    : accounts
        .filter((a) => a.type === 'Expense' && !a.name.toLowerCase().includes('cost of goods') && !a.name.toLowerCase().includes('purchase'))
        .reduce((s, a) => s + a.balance, 0);

  const totalExpenses = purchaseExpenses + otherExpenses;
  const netIncome = totalIncome - totalExpenses;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="no-print">
        <AccountantNav currentRoute="/reports/pnl" onNavigate={onNavigate} />
      </div>

      {/* Main Content Header matching diagram */}
      <div className="content-header no-print">
        <div>
          <h1 className="page-title">Profit and Loss Report</h1>
          <p className="page-subtitle">
            Financial performance statement showing operating income, cost of sales, operational overheads, and net profit
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            variant="outline"
            onClick={() => exportProfitLossPdf({
              year: selectedYear,
              totalIncome,
              salesIncome,
              totalExpenses,
              purchaseExpenses,
              otherExpenses,
              netIncome,
            })}
            leftIcon={<Download size={15} />}
          >
            Export PDF
          </Button>

          <Button
            variant="outline"
            onClick={() => window.print()}
            leftIcon={<Printer size={15} />}
          >
            Print
          </Button>

          <CustomSelect
            value={selectedYear}
            onChange={(v) => setSelectedYear(v)}
            options={[
              { value: '2026', label: '2026' },
              { value: '2025', label: '2025' },
              { value: '2024', label: '2024' },
            ]}
            width={110}
          />

          <Button
            variant="primary"
            onClick={() => onNavigate('/dashboard')}
            leftIcon={<ArrowLeft size={15} />}
          >
            Back
          </Button>
        </div>
      </div>

      {/* Grid: Statement Table + Field Computation Guide */}
      <div className="report-grid-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '24px', alignItems: 'start' }}>
        {/* Left: Profit and Loss Report Document Frame */}
        <div
          className="card-panel printable-document"
          style={{
            padding: '24px',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Print-Only Corporate Document Header */}
          <div className="print-only-header" style={{ display: 'none', borderBottom: '2px solid var(--color-primary)', paddingBottom: '12px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--color-primary)', fontWeight: 800 }}>
                  Urban Furniture Enterprise Pvt. Ltd.
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#4b5563', fontWeight: 600 }}>
                  Official Statement of Profit and Loss (Income Statement)
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#4b5563', lineHeight: 1.4 }}>
                <div><strong>Fiscal Period:</strong> FY {selectedYear}</div>
                <div><strong>Accounting Method:</strong> Accrual Basis</div>
                <div><strong>Currency:</strong> INR (₹)</div>
              </div>
            </div>
          </div>

          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)' }}>
              Urban Furniture — Profit and Loss Report ({selectedYear})
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Accrual Basis
            </span>
          </div>

          <table className="custom-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '14px', fontWeight: 700 }}>Account / Category</th>
                <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: '14px', fontWeight: 700, width: '180px' }}>Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {/* Income Header Row */}
              <tr style={{ backgroundColor: 'rgba(15, 118, 110, 0.08)', fontWeight: 800 }}>
                <td style={{ padding: '12px 14px', color: 'var(--color-primary)', fontSize: '15px' }}>Income</td>
                <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--color-primary)', fontSize: '15px' }}>
                  ₹ {totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
              {/* Income Sub-rows */}
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '10px 14px 10px 32px', color: 'var(--color-text-primary)' }}>Income from Sales</td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>
                  ₹ {salesIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Spacer */}
              <tr>
                <td colSpan={2} style={{ padding: '6px' }}></td>
              </tr>

              {/* Expenses Header Row */}
              <tr style={{ backgroundColor: 'rgba(217, 119, 6, 0.08)', fontWeight: 800 }}>
                <td style={{ padding: '12px 14px', color: '#b45309', fontSize: '15px' }}>Expenses</td>
                <td style={{ padding: '12px 14px', textAlign: 'right', color: '#b45309', fontSize: '15px' }}>
                  ₹ {totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
              {/* Expenses Sub-rows */}
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '10px 14px 10px 32px', color: 'var(--color-text-primary)' }}>Purchase Expense</td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>
                  ₹ {purchaseExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '10px 14px 10px 32px', color: 'var(--color-text-primary)' }}>Other Expense</td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>
                  ₹ {otherExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* Spacer */}
              <tr>
                <td colSpan={2} style={{ padding: '6px' }}></td>
              </tr>

              {/* Net Income Summary Row */}
              <tr
                style={{
                  backgroundColor: netIncome >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  fontWeight: 900,
                  fontSize: '16px',
                  borderTop: '2px solid var(--color-border)',
                  borderBottom: '3px double var(--color-border)',
                }}
              >
                <td style={{ padding: '14px', color: netIncome >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                  Net Income
                </td>
                <td style={{ padding: '14px', textAlign: 'right', color: netIncome >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                  ₹ {netIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          <DocumentSignatureStamp
            documentRef={`UF-PNL-${selectedYear}-09`}
            firstDesignation="Chief Accountant"
            secondDesignation="Managing Director"
          />
        </div>

        {/* Right: Field Computation Architecture Card */}
        <div
          className="card-panel computation-card no-print"
          style={{
            padding: '24px',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
            <Info size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
              Field Computation Engine
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
              <strong style={{ color: 'var(--color-primary)', display: 'block' }}>Income:</strong>
              <span style={{ color: 'var(--color-text-secondary)' }}>Total of all recognized income streams</span>
            </div>

            <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
              <strong style={{ color: 'var(--color-primary)', display: 'block' }}>Income from Sales:</strong>
              <span style={{ color: 'var(--color-text-secondary)' }}>Total of account type <code>Income</code> (Customer Invoices)</span>
            </div>

            <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
              <strong style={{ color: '#b45309', display: 'block' }}>Expenses:</strong>
              <span style={{ color: 'var(--color-text-secondary)' }}>Total of all operating and direct expenses</span>
            </div>

            <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
              <strong style={{ color: '#b45309', display: 'block' }}>Purchase Expense:</strong>
              <span style={{ color: 'var(--color-text-secondary)' }}>Total of account type <code>Expense</code> (Cost of Goods / Vendor Bills)</span>
            </div>

            <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
              <strong style={{ color: '#b45309', display: 'block' }}>Other Expense:</strong>
              <span style={{ color: 'var(--color-text-secondary)' }}>Total of account type <code>Other Expense</code> / Overheads</span>
            </div>

            <div style={{ padding: '12px', background: 'var(--color-primary-light)', borderRadius: '6px', border: '1px solid var(--color-primary-border)' }}>
              <strong style={{ color: 'var(--color-primary)', display: 'block', fontSize: '14px' }}>Net Income:</strong>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Difference of Income − Expenses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReportPage;
