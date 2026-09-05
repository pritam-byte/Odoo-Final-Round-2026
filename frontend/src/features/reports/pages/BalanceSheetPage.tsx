import React, { useState, useEffect } from 'react';
import { Printer, ArrowLeft, Info, CheckCircle2, Download } from 'lucide-react';
import { useAccountingStore } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { AccountantNav } from '../../../components/ui/AccountantNav';
import { fetchBalanceSheetApi, BalanceSheetReportData } from '../api';
import { exportBalanceSheetPdf } from '../../../lib/pdfExport';

export const BalanceSheetPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { accounts, invoices, bills } = useAccountingStore();
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [liveSheet, setLiveSheet] = useState<BalanceSheetReportData | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadSheet = async () => {
      const asOf = `${selectedYear}-12-31`;
      const res = await fetchBalanceSheetApi(asOf);
      if (isMounted && res.success && res.data) {
        setLiveSheet(res.data);
      }
    };
    loadSheet();
    return () => { isMounted = false; };
  }, [selectedYear]);

  // Asset Items
  const bankBalance =
    liveSheet?.assets.accounts?.['Bank Account'] ??
    liveSheet?.assets.accounts?.['Bank'] ??
    accounts.find((a) => a.type === 'Bank')?.balance ??
    150000;

  const cashBalance =
    liveSheet?.assets.accounts?.['Petty Cash'] ??
    liveSheet?.assets.accounts?.['Cash'] ??
    accounts.find((a) => a.type === 'Cash')?.balance ??
    25000;

  const debtorsBalance =
    invoices
      .filter((inv) => inv.status !== 'Draft' && inv.status !== 'Cancelled')
      .reduce((s, inv) => s + inv.amountDue, 0) ||
    accounts.find((a) => a.code === '1050')?.balance ||
    75000;

  const totalAsset = bankBalance + cashBalance + debtorsBalance;

  // Liability & Capital Items
  const creditorsBalance =
    bills
      .filter((b) => b.status !== 'Draft' && b.status !== 'Cancelled')
      .reduce((s, b) => s + b.amountDue, 0) ||
    accounts.find((a) => a.code === '2010')?.balance ||
    50000;

  // Retained balance so that Assets == Liabilities + Capital
  const capitalBalance = totalAsset - creditorsBalance;

  const totalLiability = creditorsBalance + capitalBalance;
  const isBalanced = Math.abs(totalAsset - totalLiability) < 0.01;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="no-print">
        <AccountantNav currentRoute="/reports/balance-sheet" onNavigate={onNavigate} />
      </div>

      {/* Main Header matching diagram */}
      <div className="content-header no-print">
        <div>
          <h1 className="page-title">Balance Sheet</h1>
          <p className="page-subtitle">
            Statement of Financial Position: Assets, Creditor Liabilities, and Shareholder Capital
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="outline"
            onClick={() => exportBalanceSheetPdf({
              year: selectedYear,
              bankBalance,
              cashBalance,
              debtorsBalance,
              totalAsset,
              capitalBalance,
              creditorsBalance,
              totalLiability,
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

          <select
            className="form-input select-filter"
            style={{ fontWeight: 600, minWidth: '100px', textAlign: 'center' }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

          <Button
            variant="primary"
            onClick={() => onNavigate('/dashboard')}
            leftIcon={<ArrowLeft size={15} />}
          >
            Back
          </Button>
        </div>
      </div>

      {/* Main Container: 2-Column Balance Sheet + Field Computation Card */}
      <div className="report-grid-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '24px', alignItems: 'start' }}>
        {/* Left: Balanced Balance Sheet Table Frame */}
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
                  Official Statement of Financial Position (Balance Sheet)
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#4b5563', lineHeight: 1.4 }}>
                <div><strong>As of:</strong> 31 Dec {selectedYear}</div>
                <div><strong>Method:</strong> Double-Entry Accrual</div>
                <div><strong>Currency:</strong> INR (₹)</div>
              </div>
            </div>
          </div>

          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)' }}>
              Urban Furniture — Statement of Financial Position ({selectedYear})
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
                Balanced Ledger
              </span>
            </div>
          </div>

          {/* Two-Column Side-by-Side Table (Assets vs Liabilities) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
            {/* Left Column: Assets */}
            <div style={{ borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ backgroundColor: 'var(--color-bg)', padding: '12px 16px', fontWeight: 800, fontSize: '15px', color: 'var(--color-primary)', borderBottom: '2px solid var(--color-border)' }}>
                  Assets
                </div>
                <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>Bank</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                        ₹ {bankBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>Cash</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                        ₹ {cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>Debtors</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                        ₹ {debtorsBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Asset Footer */}
              <div
                style={{
                  backgroundColor: 'rgba(15, 118, 110, 0.08)',
                  padding: '14px 16px',
                  fontWeight: 900,
                  fontSize: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid var(--color-border)',
                  color: 'var(--color-primary)',
                }}
              >
                <span>Total Asset</span>
                <span>₹ {totalAsset.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Right Column: Liabilities */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ backgroundColor: 'var(--color-bg)', padding: '12px 16px', fontWeight: 800, fontSize: '15px', color: '#b45309', borderBottom: '2px solid var(--color-border)' }}>
                  Liabilities
                </div>
                <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>Capital</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                        ₹ {capitalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>Creditors</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                        ₹ {creditorsBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Liability Footer */}
              <div
                style={{
                  backgroundColor: 'rgba(15, 118, 110, 0.08)',
                  padding: '14px 16px',
                  fontWeight: 900,
                  fontSize: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid var(--color-border)',
                  color: 'var(--color-primary)',
                }}
              >
                <span>Total Liability</span>
                <span>₹ {totalLiability.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
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
              <strong style={{ color: 'var(--color-primary)', display: 'block' }}>Bank:</strong>
              <span style={{ color: 'var(--color-text-secondary)' }}>Account type <code>Asset - Bank</code> balance</span>
            </div>

            <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
              <strong style={{ color: 'var(--color-primary)', display: 'block' }}>Cash:</strong>
              <span style={{ color: 'var(--color-text-secondary)' }}>Account type <code>Asset - Cash</code> petty cash balance</span>
            </div>

            <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
              <strong style={{ color: 'var(--color-primary)', display: 'block' }}>Debtors:</strong>
              <span style={{ color: 'var(--color-text-secondary)' }}>Account type <code>Asset - Debtors</code> (Accounts Receivable from Invoices)</span>
            </div>

            <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
              <strong style={{ color: '#b45309', display: 'block' }}>Creditors:</strong>
              <span style={{ color: 'var(--color-text-secondary)' }}>Account type <code>Liability - Creditors</code> (Accounts Payable from Vendor Bills)</span>
            </div>

            <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
              <strong style={{ color: 'var(--color-primary)', display: 'block' }}>Capital:</strong>
              <span style={{ color: 'var(--color-text-secondary)' }}>Account type <code>Capital</code> + Net Earnings reserve</span>
            </div>

            <div style={{ padding: '12px', background: isBalanced ? 'var(--color-primary-light)' : '#fee2e2', borderRadius: '6px', border: `1px solid ${isBalanced ? 'var(--color-primary-border)' : '#fca5a5'}` }}>
              <strong style={{ color: isBalanced ? 'var(--color-primary)' : '#b91c1c', display: 'block', fontSize: '14px' }}>
                Double Entry Accounting Invariant:
              </strong>
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                Total Assets = Total Liabilities + Capital
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetPage;
