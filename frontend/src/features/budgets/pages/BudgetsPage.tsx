import React, { useState } from 'react';
import { Plus, Check, ArrowLeft, RotateCcw, XCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useAccountingStore, Budget } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { BudgetProgressWidget } from '../../../components/ui/BudgetProgressWidget';
import { AccountantNav } from '../../../components/ui/AccountantNav';

export const BudgetsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { budgets, analytics, addBudget, updateBudgetState, getBudgetAchievedAmount, getBudgetMatchedTransactions } =
    useAccountingStore();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [inspectingBudget, setInspectingBudget] = useState<Budget | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [responsible, setResponsible] = useState('Pritam Admin');
  const [analyticId, setAnalyticId] = useState(analytics[0]?.id || '');
  const [committedAmount, setCommittedAmount] = useState<number>(150000);
  const [error, setError] = useState('');

  const openCreateModal = () => {
    setName('');
    setStartDate('2026-07-01');
    setEndDate('2026-09-30');
    setResponsible('Pritam Admin');
    setAnalyticId(analytics[0]?.id || '');
    setCommittedAmount(100000);
    setError('');
    setIsCreateModalOpen(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Budget Name is required.');
      return;
    }

    const matchedAnalytic = analytics.find((a) => a.id === analyticId) || analytics[0];

    addBudget({
      name,
      startDate,
      endDate,
      responsible,
      analyticId: matchedAnalytic?.id || 'an1',
      analyticName: matchedAnalytic?.name || 'General Operations',
      type: matchedAnalytic?.type || 'Expense',
      committedAmount: Number(committedAmount) || 0,
      state: 'Draft',
    });

    setIsCreateModalOpen(false);
  };

  const filteredBudgets = budgets.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.analyticName.toLowerCase().includes(search.toLowerCase()) ||
      b.responsible.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Budget>[] = [
    {
      key: 'name',
      header: 'Budget Name',
      render: (b) => <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{b.name}</span>,
    },
    {
      key: 'period',
      header: 'Budget Period',
      render: (b) => (
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {b.startDate} to {b.endDate}
        </span>
      ),
    },
    {
      key: 'analyticName',
      header: 'Analytic Cost Center',
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
        return (
          <span
            style={{ fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={(e) => {
              e.stopPropagation();
              setInspectingBudget(b);
            }}
          >₹{achieved.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'state',
      header: 'State',
      align: 'center',
      render: (b) => (
        <StatusBadge
          status={b.state === 'Confirmed' ? 'completed' : b.state === 'Revised' ? 'pending' : 'neutral'}
          label={b.state}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/budgets" onNavigate={onNavigate} />

      <div className="content-header">
        <div>
          <h1 className="page-title">Analytical Budgets & Position</h1>
          <p className="page-subtitle">
            Set committed expenditure/revenue targets and track live achieved postings from confirmed invoices & bills
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
          <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} strokeWidth={2.2} />}>
            New Budget
          </Button>
        </div>
      </div>

      {/* Main Budget Panel */}
      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <input
            type="text"
            className="form-input search-bar-input"
            style={{ maxWidth: '360px' }}
            placeholder="Search by budget name or analytic center..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredBudgets.length}</strong> budget plans
          </span>
        </div>

        {viewMode === 'list' ? (
          <DataTable
            columns={columns}
            data={filteredBudgets}
            keyExtractor={(b) => b.id}
            onRowClick={(b) => setSelectedBudget(b)}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredBudgets.map((b) => {
              const achieved = getBudgetAchievedAmount(b);
              return (
                <div
                  key={b.id}
                  className="card-panel"
                  style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onClick={() => setSelectedBudget(b)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{b.name}</h3>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {b.analyticName} • {b.type}
                      </span>
                    </div>
                    <StatusBadge
                      status={b.state === 'Confirmed' ? 'completed' : b.state === 'Revised' ? 'pending' : 'neutral'}
                      label={b.state}
                    />
                  </div>

                  <div style={{ margin: '14px 0 8px 0' }}>
                    <BudgetProgressWidget
                      committed={b.committedAmount}
                      achieved={achieved}
                      type={b.type}
                      onClickAchieved={() => setInspectingBudget(b)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '10px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    <span>{b.startDate} to {b.endDate}</span>
                    <span>Responsible: <strong>{b.responsible}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Detail & Lifecycle State Management Modal */}
      {selectedBudget && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBudget(null)}
          title={`Budget Target: ${selectedBudget.name}`}
          maxWidth="680px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              {/* Lifecycle State Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedBudget.state === 'Draft' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      updateBudgetState(selectedBudget.id, 'Confirmed');
                      setSelectedBudget({ ...selectedBudget, state: 'Confirmed' });
                    }}
                    leftIcon={<CheckCircle2 size={14} />}
                  >
                    Confirm Budget
                  </Button>
                )}
                {selectedBudget.state === 'Confirmed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateBudgetState(selectedBudget.id, 'Revised');
                      setSelectedBudget({ ...selectedBudget, state: 'Revised' });
                    }}
                    leftIcon={<RotateCcw size={14} />}
                  >
                    Revise Budget
                  </Button>
                )}
                {selectedBudget.state === 'Revised' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      updateBudgetState(selectedBudget.id, 'Confirmed');
                      setSelectedBudget({ ...selectedBudget, state: 'Confirmed' });
                    }}
                    leftIcon={<CheckCircle2 size={14} />}
                  >
                    Re-Confirm
                  </Button>
                )}
                {selectedBudget.state !== 'Cancelled' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      updateBudgetState(selectedBudget.id, 'Cancelled');
                      setSelectedBudget({ ...selectedBudget, state: 'Cancelled' });
                    }}
                    leftIcon={<XCircle size={14} />}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={() => setSelectedBudget(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Analytic Account:</span>
                <p style={{ fontWeight: 600 }}>{selectedBudget.analyticName}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Tracking Type:</span>
                <p style={{ fontWeight: 600 }}>{selectedBudget.type}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Period:</span>
                <p style={{ fontWeight: 600 }}>{selectedBudget.startDate} to {selectedBudget.endDate}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Responsible Lead:</span>
                <p style={{ fontWeight: 600 }}>{selectedBudget.responsible}</p>
              </div>
            </div>

            <div className="card-panel" style={{ padding: '16px', border: '1px solid var(--color-primary-border)', backgroundColor: 'var(--color-primary-subtle)' }}>
              <BudgetProgressWidget
                committed={selectedBudget.committedAmount}
                achieved={getBudgetAchievedAmount(selectedBudget)}
                type={selectedBudget.type}
                onClickAchieved={() => setInspectingBudget(selectedBudget)}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectingBudget(selectedBudget)}
                leftIcon={<FileText size={14} />}
              >
                Inspect Matching Invoices & Bills ({getBudgetMatchedTransactions(selectedBudget).length})
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Drill-down Matched Transactions Modal */}
      {inspectingBudget && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingBudget(null)}
          title={`Matched Postings for Analytic: ${inspectingBudget.analyticName}`}
          maxWidth="640px"
          footer={
            <Button variant="outline" onClick={() => setInspectingBudget(null)}>
              Done
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Displaying all confirmed {inspectingBudget.type === 'Income' ? 'Customer Invoices' : 'Vendor Bills'} posted within period ({inspectingBudget.startDate} to {inspectingBudget.endDate}) tagged with this analytic account:
            </p>

            {getBudgetMatchedTransactions(inspectingBudget).length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)', borderRadius: '6px' }}>
                No invoices or bills have been posted against this analytic center in this date window yet.
              </div>
            ) : (
              <table className="custom-table" style={{ backgroundColor: '#ffffff', borderRadius: '6px' }}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Document #</th>
                    <th>Partner</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Matched Amount ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {getBudgetMatchedTransactions(inspectingBudget).map((t) => (
                    <tr key={t.id}>
                      <td>
                        <span className={`badge-pill ${t.type === 'Invoice' ? 'badge-completed' : 'badge-pending'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{t.number}</td>
                      <td>{t.partner}</td>
                      <td>{t.date}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Budget Target"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} leftIcon={<ArrowLeft size={15} />}>
              Back
            </Button>
            <Button variant="primary" onClick={handleSaveBudget} leftIcon={<Check size={15} strokeWidth={2.2} />}>
              Save Budget Draft
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveBudget} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <FormField
            label="Budget Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q3 Enterprise Sales Target"
            required
            autoFocus
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FormField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <FormField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="budget-analytic">
                Analytic Center
              </label>
              <select
                id="budget-analytic"
                className="form-input select-filter"
                value={analyticId}
                onChange={(e) => setAnalyticId(e.target.value)}
              >
                {analytics.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type})
                  </option>
                ))}
              </select>
            </div>

            <FormField
              label="Responsible Person"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="Pritam Admin"
              required
            />
          </div>

          <FormField
            label="Committed Target Amount ($)"
            type="number"
            step="100"
            value={committedAmount}
            onChange={(e) => setCommittedAmount(Number(e.target.value))}
            placeholder="100000"
            required
          />
        </form>
      </Modal>
    </div>
  );
};

export default BudgetsPage;
