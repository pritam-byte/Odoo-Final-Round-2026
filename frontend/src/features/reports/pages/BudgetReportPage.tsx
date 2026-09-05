import React, { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useAccountingStore, Budget } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { BudgetProgressWidget } from '../../../components/ui/BudgetProgressWidget';
import { AccountantNav } from '../../../components/ui/AccountantNav';
import { exportBudgetReportPdf, exportBudgetReportCsv } from '../../../lib/pdfExport';

export const BudgetReportPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { budgets, getBudgetAchievedAmount } = useAccountingStore();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');

  const filteredBudgets = budgets.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.analyticName.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Budget>[] = [
    {
      key: 'name',
      header: 'Budget Title',
      render: (b) => <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{b.name}</span>,
    },
    {
      key: 'analyticName',
      header: 'Analytic Cost Center',
    },
    {
      key: 'period',
      header: 'Period',
      render: (b) => (
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {b.startDate} to {b.endDate}
        </span>
      ),
    },
    {
      key: 'committedAmount',
      header: 'Committed ($)',
      align: 'right',
      render: (b) => <span>₹{b.committedAmount.toLocaleString()}</span>,
    },
    {
      key: 'achieved',
      header: 'Achieved ($)',
      align: 'right',
      render: (b) => {
        const achieved = getBudgetAchievedAmount(b);
        return <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{achieved.toLocaleString()}</span>;
      },
    },
    {
      key: 'variance',
      header: 'Variance / Achievement %',
      align: 'center',
      render: (b) => {
        const achieved = getBudgetAchievedAmount(b);
        const percent = b.committedAmount > 0 ? Math.round((achieved / b.committedAmount) * 100) : 0;
        return (
          <div style={{ width: '140px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
              <span>{percent}%</span>
              <span>{b.type}</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, percent)}%`,
                  height: '100%',
                  backgroundColor: percent >= 100 ? 'var(--color-primary)' : 'var(--color-warning)',
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'state',
      header: 'Status',
      align: 'center',
      render: (b) => <StatusBadge status={b.state === 'Confirmed' ? 'completed' : 'neutral'} label={b.state} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="no-print">
        <AccountantNav currentRoute="/reports/budget" onNavigate={onNavigate} />
      </div>

      <div className="content-header no-print">
        <div>
          <h1 className="page-title">Budget Variance & Performance Report</h1>
          <p className="page-subtitle">
            Consolidated comparison of committed analytical budgets vs actual achieved ledger invoices & bills
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
          <Button
            variant="outline"
            onClick={() => exportBudgetReportCsv(filteredBudgets, getBudgetAchievedAmount)}
            leftIcon={<FileSpreadsheet size={15} />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            onClick={() => exportBudgetReportPdf(filteredBudgets, getBudgetAchievedAmount)}
            leftIcon={<Download size={15} strokeWidth={2} />}
          >
            Export PDF
          </Button>
        </div>
      </div>

      <div className="card-panel printable-document">
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            className="form-input search-bar-input"
            style={{ maxWidth: '360px' }}
            placeholder="Search by budget title or cost center..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Total budgets analyzed: <strong>{filteredBudgets.length}</strong>
          </span>
        </div>

        {viewMode === 'list' ? (
          <DataTable columns={columns} data={filteredBudgets} keyExtractor={(b) => b.id} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredBudgets.map((b) => {
              const achieved = getBudgetAchievedAmount(b);
              return (
                <div key={b.id} className="card-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{b.name}</h3>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{b.analyticName}</span>
                    </div>
                    <StatusBadge status={b.state === 'Confirmed' ? 'completed' : 'neutral'} label={b.state} />
                  </div>

                  <div style={{ margin: '14px 0 8px 0' }}>
                    <BudgetProgressWidget committed={b.committedAmount} achieved={achieved} type={b.type} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetReportPage;
