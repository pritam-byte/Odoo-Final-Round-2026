import React, { useState } from 'react';
import { Plus, Check, ArrowLeft, Layers } from 'lucide-react';
import { useAccountingStore, AnalyticAccount, Budget } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { AccountantNav } from '../../../components/ui/AccountantNav';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { CustomSelect } from '../../../components/ui/CustomSelect';

export const AnalyticAccountsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { analytics, addAnalytic, budgets, getBudgetAchievedAmount } = useAccountingStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnalytic, setSelectedAnalytic] = useState<AnalyticAccount | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [error, setError] = useState('');

  const openCreateModal = () => {
    setCode(`AN-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setType('Expense');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Analytic Code and Name are required.');
      return;
    }

    addAnalytic({
      code,
      name,
      type,
    });

    setIsModalOpen(false);
  };

  const filteredAnalytics = analytics.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.code?.toLowerCase() || '').includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to find budgets linked to an analytic account
  const getLinkedBudgets = (analyticId: string): Budget[] => {
    return budgets.filter((b) => b.analyticId === analyticId);
  };

  // Helper to compute total committed & total achieved for an analytic account
  const getAnalyticMetrics = (analyticId: string) => {
    const linked = getLinkedBudgets(analyticId);
    const totalCommitted = linked.reduce((sum, b) => sum + b.committedAmount, 0);
    const totalAchieved = linked.reduce((sum, b) => sum + getBudgetAchievedAmount(b), 0);
    return { linkedCount: linked.length, totalCommitted, totalAchieved };
  };

  const columns: Column<AnalyticAccount>[] = [
    {
      key: 'code',
      header: 'Analytic Code',
      width: '140px',
      render: (a) => <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{a.code}</span>,
    },
    {
      key: 'name',
      header: 'Cost Center / Analytic Name',
      render: (a) => (
        <div>
          <span style={{ fontWeight: 600, display: 'block' }}>{a.name}</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {getLinkedBudgets(a.id).length} linked budget plan(s)
          </span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tracking Type',
      render: (a) => (
        <span className={`badge-pill ${a.type === 'Income' ? 'badge-completed' : 'badge-pending'}`}>
          {a.type}
        </span>
      ),
    },
    {
      key: 'committed',
      header: 'Total Committed Target ($)',
      align: 'right',
      render: (a) => {
        const { totalCommitted } = getAnalyticMetrics(a.id);
        return <span style={{ fontWeight: 600 }}>₹{totalCommitted.toLocaleString()}</span>;
      },
    },
    {
      key: 'achieved',
      header: 'Total Achieved Postings ($)',
      align: 'right',
      render: (a) => {
        const { totalAchieved } = getAnalyticMetrics(a.id);
        return (
          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
            ₹{totalAchieved.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Details',
      align: 'center',
      render: (a) => (
        <Button
          variant="outline"
          size="sm"
          style={{ padding: '3px 8px', fontSize: '11px' }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAnalytic(a);
          }}
        >
          View Budgets
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/analytics" onNavigate={onNavigate} />

      <div className="content-header">
        <div>
          <h1 className="page-title">Analytic Cost Centers & Accounts</h1>
          <p className="page-subtitle">Track project profitability, department budgets, and multi-dimensional cost centers</p>
        </div>

        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} strokeWidth={2.2} />}>
          New Analytic Account
        </Button>
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            className="form-input search-bar-input"
            style={{ maxWidth: '360px' }}
            placeholder="Search by code or cost center..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredAnalytics.length}</strong> analytic accounts
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filteredAnalytics}
          keyExtractor={(a) => a.id}
          onRowClick={(a) => setSelectedAnalytic(a)}
        />
      </div>

      {/* Analytic Account Detail Modal with Linked Budgets Table */}
      {selectedAnalytic && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAnalytic(null)}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: 'var(--color-primary)' }} />
              <span>Analytic Center: {selectedAnalytic.name} ({selectedAnalytic.code})</span>
            </div>
          }
          maxWidth="780px"
          footer={
            <Button variant="outline" onClick={() => setSelectedAnalytic(null)}>
              Close
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Meta Summary Cards */}
            {(() => {
              const { linkedCount, totalCommitted, totalAchieved } = getAnalyticMetrics(selectedAnalytic.id);
              const percent = totalCommitted > 0 ? Math.round((totalAchieved / totalCommitted) * 100) : 0;

              return (
                <div className="responsive-modal-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>TYPE</span>
                    <span className={`badge-pill ${selectedAnalytic.type === 'Income' ? 'badge-completed' : 'badge-pending'}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                      {selectedAnalytic.type} Center
                    </span>
                  </div>

                  <div style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>LINKED BUDGETS</span>
                    <strong style={{ fontSize: '16px', color: 'var(--color-text-primary)' }}>{linkedCount}</strong>
                  </div>

                  <div style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>TOTAL COMMITTED</span>
                    <strong style={{ fontSize: '16px', color: 'var(--color-primary)' }}>₹{totalCommitted.toLocaleString()}</strong>
                  </div>

                  <div style={{ padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>TOTAL ACHIEVED ({percent}%)</span>
                    <strong style={{ fontSize: '16px', color: '#10b981' }}>₹{totalAchieved.toLocaleString()}</strong>
                  </div>
                </div>
              );
            })()}

            {/* Linked Budgets Table */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Linked Budgets for this Cost Center
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                  onClick={() => {
                    setSelectedAnalytic(null);
                    onNavigate('/budgets');
                  }}
                >
                  Manage in Budgets Page
                </Button>
              </div>

              {getLinkedBudgets(selectedAnalytic.id).length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)', borderRadius: '6px' }}>
                  No budget targets currently assigned to this analytic center.
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table className="custom-table" style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                    <thead>
                      <tr>
                        <th>Budget Name</th>
                        <th>Period</th>
                        <th style={{ textAlign: 'right' }}>Committed Target ($)</th>
                        <th style={{ textAlign: 'right' }}>Achieved ($)</th>
                        <th style={{ textAlign: 'right' }}>Achieved %</th>
                        <th style={{ textAlign: 'center' }}>State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getLinkedBudgets(selectedAnalytic.id).map((b) => {
                        const achieved = getBudgetAchievedAmount(b);
                        const committed = Math.max(1, b.committedAmount);
                        const percent = Math.min(100, Math.round((achieved / committed) * 100));

                        return (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{b.name}</td>
                            <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                              {b.startDate} to {b.endDate}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{b.committedAmount.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                              ₹{achieved.toLocaleString()}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{percent}%</td>
                            <td style={{ textAlign: 'center' }}>
                              <StatusBadge
                                status={b.state === 'Confirmed' ? 'completed' : b.state === 'Revised' ? 'pending' : b.state === 'Cancelled' ? 'danger' : 'neutral'}
                                label={b.state}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Analytic Account"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} leftIcon={<ArrowLeft size={15} />}>
              Back
            </Button>
            <Button variant="primary" onClick={handleSave} leftIcon={<Check size={15} strokeWidth={2.2} />}>
              Confirm Analytic Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div className="responsive-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '14px' }}>
            <FormField
              label="Analytic Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. AN-MKT"
              required
            />
            <FormField
              label="Analytic Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing & Outreach"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="an-type">
              Type (Income / Expense)
            </label>
            <CustomSelect<'Expense' | 'Income'>
              value={type}
              onChange={(newVal) => setType(newVal)}
              options={[
                { value: 'Expense', label: 'Expense (Cost Center Tracking)' },
                { value: 'Income', label: 'Income (Revenue Center Tracking)' },
              ]}
              width="100%"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AnalyticAccountsPage;
