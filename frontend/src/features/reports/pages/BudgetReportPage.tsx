import React, { useState } from 'react';
import { Download, FileSpreadsheet, PieChart } from 'lucide-react';
import { useAccountingStore, Budget } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { BudgetProgressWidget } from '../../../components/ui/BudgetProgressWidget';
import { AccountantNav } from '../../../components/ui/AccountantNav';
import { exportBudgetReportPdf, exportBudgetReportCsv } from '../../../lib/pdfExport';
import { BudgetPieChartModal } from '../../budgets/components/BudgetPieChartModal';
import { DocumentSignatureStamp } from '../../../components/ui/DocumentSignatureStamp';

export const BudgetReportPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { budgets, getBudgetAchievedAmount } = useAccountingStore();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [selectedPieBudget, setSelectedPieBudget] = useState<Budget | null>(null);

  const filteredBudgets = budgets.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.analyticName.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Budget>[] = [
    {
      key: 'name',
      header: 'Budget',
      render: (b) => <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{b.name}</span>,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      width: '120px',
      render: (b) => <span style={{ fontSize: '13px' }}>{b.startDate}</span>,
    },
    {
      key: 'endDate',
      header: 'End Date',
      width: '120px',
      render: (b) => <span style={{ fontSize: '13px' }}>{b.endDate}</span>,
    },
    {
      key: 'analyticName',
      header: 'Analytic Cost Center',
    },
    {
      key: 'committedAmount',
      header: 'Committed (₹)',
      align: 'right',
      render: (b) => <span>₹{b.committedAmount.toLocaleString()}</span>,
    },
    {
      key: 'achieved',
      header: 'Achieved (₹)',
      align: 'right',
      render: (b) => {
        const achieved = getBudgetAchievedAmount(b);
        return <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{achieved.toLocaleString()}</span>;
      },
    },
    {
      key: 'state',
      header: 'Status',
      align: 'center',
      render: (b) => <StatusBadge status={b.state === 'Confirmed' ? 'completed' : b.state === 'Revised' ? 'due' : 'neutral'} label={b.state} />,
    },
    {
      key: 'actions',
      header: 'Pie Chart',
      align: 'center',
      width: '100px',
      render: (b) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPieBudget(b);
          }}
          leftIcon={<PieChart size={14} style={{ color: 'var(--color-primary)' }} />}
        >
          View
        </Button>
      ),
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
          <DataTable
            columns={columns}
            data={filteredBudgets}
            keyExtractor={(b) => b.id}
            onRowClick={(b) => setSelectedPieBudget(b)}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredBudgets.map((b) => {
              const achieved = getBudgetAchievedAmount(b);
              return (
                <div key={b.id} className="card-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{b.name}</h3>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{b.analyticName}</span>
                      </div>
                      <StatusBadge status={b.state === 'Confirmed' ? 'completed' : b.state === 'Revised' ? 'due' : 'neutral'} label={b.state} />
                    </div>

                    <div style={{ margin: '14px 0 12px 0' }}>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                        Period: <strong>{b.startDate}</strong> to <strong>{b.endDate}</strong>
                      </div>
                      <BudgetProgressWidget committed={b.committedAmount} achieved={achieved} type={b.type} />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedPieBudget(b)}
                      leftIcon={<PieChart size={14} style={{ color: 'var(--color-primary)' }} />}
                    >
                      Open Pie Chart
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DocumentSignatureStamp
          documentRef="UF-BUDGET-2026-REP"
          signatoryName="Pritam Denria"
          signatoryRole="Chief Financial Officer / Budget Controller"
        />
      </div>

      {/* Interactive Pie Chart Modal */}
      {selectedPieBudget && (
        <BudgetPieChartModal
          isOpen={true}
          onClose={() => setSelectedPieBudget(null)}
          budget={selectedPieBudget}
          achievedAmount={getBudgetAchievedAmount(selectedPieBudget)}
        />
      )}
    </div>
  );
};

export default BudgetReportPage;
