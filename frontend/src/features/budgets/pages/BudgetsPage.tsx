import React, { useState } from 'react';
import {
  Plus,
  Check,
  ArrowLeft,
  RotateCcw,
  XCircle,
  CheckCircle2,
  PieChart as PieChartIcon,
  ChevronRight,
  Link as LinkIcon,
  Search,
  Layers
} from 'lucide-react';
import { useAccountingStore, Budget, BudgetState } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { BudgetProgressWidget } from '../../../components/ui/BudgetProgressWidget';
import { AccountantNav } from '../../../components/ui/AccountantNav';
import { BudgetPieChartModal } from '../components/BudgetPieChartModal';

export const BudgetsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const {
    budgets,
    analytics,
    addBudget,
    updateBudgetState,
    reviseBudget,
    getBudgetAchievedAmount,
    getBudgetMatchedTransactions,
  } = useAccountingStore();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | BudgetState>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [inspectingBudget, setInspectingBudget] = useState<Budget | null>(null);
  const [pieChartBudget, setPieChartBudget] = useState<Budget | null>(null);
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const [reviseAmount, setReviseAmount] = useState<number>(0);

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

    const newB = addBudget({
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
    setSelectedBudget(newB);
  };

  const handleOpenReviseModal = (b: Budget) => {
    setReviseAmount(b.committedAmount);
    setIsReviseModalOpen(true);
  };

  const handleConfirmRevise = () => {
    if (!selectedBudget) return;
    const revisedChild = reviseBudget(selectedBudget.id, Number(reviseAmount) || 0);
    setIsReviseModalOpen(false);
    if (revisedChild) {
      setSelectedBudget(revisedChild);
    }
  };

  // Keep selectedBudget synced with store updates
  const activeBudget = selectedBudget ? budgets.find((b) => b.id === selectedBudget.id) || selectedBudget : null;

  const filteredBudgets = budgets.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.analyticName.toLowerCase().includes(search.toLowerCase()) ||
      b.responsible.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.state === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Budget>[] = [
    {
      key: 'name',
      header: 'Budget Name',
      render: (b) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'block' }}>{b.name}</span>
          {b.originalBudgetName && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LinkIcon size={10} /> Rev of: {b.originalBudgetName}
            </span>
          )}
        </div>
      ),
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
      render: (b) => (
        <span>
          {b.analyticName}{' '}
          <span className={`badge-pill ${b.type === 'Income' ? 'badge-completed' : 'badge-pending'}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
            {b.type}
          </span>
        </span>
      ),
    },
    {
      key: 'committedAmount',
      header: 'Committed Target (₹)',
      align: 'right',
      render: (b) => <span style={{ fontWeight: 600 }}>₹{b.committedAmount.toLocaleString()}</span>,
    },
    {
      key: 'achieved',
      header: 'Achieved (₹)',
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
            title="Click to inspect matching ledger transactions"
          >
            ₹{achieved.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'percentage',
      header: 'Achieved %',
      align: 'right',
      render: (b) => {
        const achieved = getBudgetAchievedAmount(b);
        const committed = Math.max(1, b.committedAmount);
        const percent = Math.min(100, Math.round((achieved / committed) * 100));
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
            <div style={{ width: '50px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${percent}%`,
                  height: '100%',
                  backgroundColor: b.type === 'Income' ? '#10b981' : percent > 90 ? '#ef4444' : '#0284c7',
                }}
              />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>{percent}%</span>
          </div>
        );
      },
    },
    {
      key: 'remaining',
      header: 'Amount to Achieve ($)',
      align: 'right',
      render: (b) => {
        const achieved = getBudgetAchievedAmount(b);
        const rem = Math.max(0, b.committedAmount - achieved);
        return <span style={{ color: rem === 0 ? 'var(--color-success)' : 'var(--color-text-secondary)', fontWeight: 600 }}>₹{rem.toLocaleString()}</span>;
      },
    },
    {
      key: 'state',
      header: 'Status',
      align: 'center',
      render: (b) => (
        <StatusBadge
          status={b.state === 'Confirmed' ? 'completed' : b.state === 'Revised' ? 'pending' : b.state === 'Cancelled' ? 'danger' : 'neutral'}
          label={b.state}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Chart',
      align: 'center',
      render: (b) => (
        <Button
          variant="outline"
          size="sm"
          style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          onClick={(e) => {
            e.stopPropagation();
            setPieChartBudget(b);
          }}
          title="Open interactive SVG Pie Chart"
        >
          <PieChartIcon size={12} />
          Pie Chart
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/budgets" onNavigate={onNavigate} />

      <div className="content-header">
        <div>
          <h1 className="page-title">Analytical Budgets & Performance Position</h1>
          <p className="page-subtitle">
            Define committed revenue & expenditure targets, track live postings, and revise targets seamlessly
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
          <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} strokeWidth={2.2} />}>
            New Budget Target
          </Button>
        </div>
      </div>

      {/* Main Budget Panel */}
      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
              <input
                type="text"
                className="form-input search-bar-input"
                style={{ width: '100%', paddingLeft: '32px' }}
                placeholder="Search by name, cost center, or responsible..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-muted)' }} />
            </div>

            {/* Quick Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--color-bg)', padding: '3px', borderRadius: '6px' }}>
              {(['All', 'Draft', 'Confirmed', 'Revised', 'Cancelled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: statusFilter === st ? 600 : 500,
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: statusFilter === st ? 'var(--color-surface)' : 'transparent',
                    color: statusFilter === st ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    boxShadow: statusFilter === st ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredBudgets.length}</strong> of <strong>{budgets.length}</strong> budget plans
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
              const committed = Math.max(1, b.committedAmount);
              const remaining = Math.max(0, committed - achieved);
              const percent = Math.min(100, Math.round((achieved / committed) * 100));

              return (
                <div
                  key={b.id}
                  className="card-panel"
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: '1px solid var(--color-border)',
                  }}
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
                      status={b.state === 'Confirmed' ? 'completed' : b.state === 'Revised' ? 'pending' : b.state === 'Cancelled' ? 'danger' : 'neutral'}
                      label={b.state}
                    />
                  </div>

                  {b.originalBudgetName && (
                    <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <LinkIcon size={10} /> Revised from: <span style={{ fontWeight: 600 }}>{b.originalBudgetName}</span>
                    </div>
                  )}

                  <div style={{ margin: '14px 0 8px 0' }}>
                    <BudgetProgressWidget
                      committed={b.committedAmount}
                      achieved={achieved}
                      type={b.type}
                      onClickAchieved={() => setInspectingBudget(b)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '8px 10px', backgroundColor: 'var(--color-bg)', borderRadius: '6px', fontSize: '12px', margin: '10px 0' }}>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '10px' }}>ACHIEVED</span>
                      <strong style={{ color: 'var(--color-primary)' }}>₹{achieved.toLocaleString()}</strong> ({percent}%)
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '10px' }}>TO ACHIEVE</span>
                      <strong style={{ color: '#ef4444' }}>₹{remaining.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '10px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    <span>{b.startDate} to {b.endDate}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ padding: '2px 6px', fontSize: '11px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPieChartBudget(b);
                      }}
                      leftIcon={<PieChartIcon size={12} />}
                    >
                      Pie Chart
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Detail & Lifecycle Management Modal (Form View matching Architectural Spec) */}
      {activeBudget && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBudget(null)}
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Budget Plan: {activeBudget.name}</span>
              </div>
            </div>
          }
          maxWidth="820px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              {/* Lifecycle Stage Actions */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {activeBudget.state === 'Draft' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      updateBudgetState(activeBudget.id, 'Confirmed');
                    }}
                    leftIcon={<CheckCircle2 size={14} />}
                  >
                    Confirm Budget Target
                  </Button>
                )}

                {activeBudget.state === 'Confirmed' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReviseModal(activeBudget)}
                      leftIcon={<RotateCcw size={14} />}
                    >
                      Revise Budget
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        updateBudgetState(activeBudget.id, 'Cancelled');
                      }}
                      leftIcon={<XCircle size={14} />}
                    >
                      Cancel Target
                    </Button>
                  </>
                )}

                {activeBudget.state === 'Revised' && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {activeBudget.revisedBudgetName ? (
                      <span>
                        Active successor: <strong>{activeBudget.revisedBudgetName}</strong>
                      </span>
                    ) : (
                      <span>This budget target has been superseded by a revision.</span>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPieChartBudget(activeBudget)}
                  leftIcon={<PieChartIcon size={14} />}
                >
                  View Pie Chart
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedBudget(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top Stage Stepper (Draft -> Confirmed -> Revised / Cancelled) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--color-bg)', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status Pipeline:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {(['Draft', 'Confirmed', 'Revised', 'Cancelled'] as const).map((st, idx, arr) => {
                  const isActive = activeBudget.state === st;
                  const isPassed =
                    (st === 'Draft' && (activeBudget.state === 'Confirmed' || activeBudget.state === 'Revised')) ||
                    (st === 'Confirmed' && activeBudget.state === 'Revised');

                  return (
                    <React.Fragment key={st}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: isActive ? 700 : 500,
                          backgroundColor: isActive
                            ? st === 'Confirmed'
                              ? '#dcfce7'
                              : st === 'Revised'
                              ? '#fef3c7'
                              : st === 'Cancelled'
                              ? '#fee2e2'
                              : '#e0f2fe'
                            : isPassed
                            ? 'var(--color-surface)'
                            : 'transparent',
                          color: isActive
                            ? st === 'Confirmed'
                              ? '#15803d'
                              : st === 'Revised'
                              ? '#b45309'
                              : st === 'Cancelled'
                              ? '#b91c1c'
                              : '#0369a1'
                            : isPassed
                            ? 'var(--color-text-secondary)'
                            : 'var(--color-text-muted)',
                          border: isActive ? '1px solid currentColor' : '1px solid transparent',
                        }}
                      >
                        {st}
                      </span>
                      {idx < arr.length - 1 && <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Revision Relationship Link Banners */}
            {activeBudget.originalBudgetName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '12px', color: '#166534' }}>
                <LinkIcon size={14} />
                <span>
                  Revised from original budget: <strong>{activeBudget.originalBudgetName}</strong>
                </span>
                {activeBudget.originalBudgetId && (
                  <button
                    onClick={() => {
                      const orig = budgets.find((b) => b.id === activeBudget.originalBudgetId);
                      if (orig) setSelectedBudget(orig);
                    }}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#15803d', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
                  >
                    View Original
                  </button>
                )}
              </div>
            )}

            {activeBudget.revisedBudgetName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '6px', fontSize: '12px', color: '#854d0e' }}>
                <RotateCcw size={14} />
                <span>
                  Revised With: <strong>{activeBudget.revisedBudgetName}</strong>
                </span>
                {activeBudget.revisedBudgetId && (
                  <button
                    onClick={() => {
                      const revChild = budgets.find((b) => b.id === activeBudget.revisedBudgetId);
                      if (revChild) setSelectedBudget(revChild);
                    }}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#a16207', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
                  >
                    View Active Child Revision
                  </button>
                )}
              </div>
            )}

            {/* Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Cost Center</span>
                <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{activeBudget.analyticName}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Tracking Type</span>
                <span className={`badge-pill ${activeBudget.type === 'Income' ? 'badge-completed' : 'badge-pending'}`} style={{ fontSize: '11px' }}>
                  {activeBudget.type}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Budget Period</span>
                <strong style={{ fontSize: '12px' }}>{activeBudget.startDate} to {activeBudget.endDate}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Responsible Lead</span>
                <strong style={{ fontSize: '13px' }}>{activeBudget.responsible}</strong>
              </div>
            </div>

            {/* Architectural Position Breakdown Table */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                Budget Position & Ledger Alignment
              </h4>
              <table className="custom-table" style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                <thead>
                  <tr>
                    <th>Analytic Cost Center</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Committed Amount ($)</th>
                    <th style={{ textAlign: 'right' }}>Achieved Amount ($)</th>
                    <th style={{ textAlign: 'right' }}>Achieved %</th>
                    <th style={{ textAlign: 'right' }}>Amount to Achieve ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const achieved = getBudgetAchievedAmount(activeBudget);
                    const committed = Math.max(1, activeBudget.committedAmount);
                    const percent = Math.min(100, Math.round((achieved / committed) * 100));
                    const toAchieve = Math.max(0, activeBudget.committedAmount - achieved);

                    return (
                      <tr>
                        <td style={{ fontWeight: 600 }}>{activeBudget.analyticName}</td>
                        <td>
                          <span className={`badge-pill ${activeBudget.type === 'Income' ? 'badge-completed' : 'badge-pending'}`}>
                            {activeBudget.type}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          ₹{activeBudget.committedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span
                            style={{ fontWeight: 700, color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => setInspectingBudget(activeBudget)}
                            title="Click to view matching postings"
                          >
                            ₹{achieved.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: percent >= 100 ? 'var(--color-success)' : 'var(--color-primary)' }}>
                          {percent}%
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: toAchieve > 0 ? '#b91c1c' : '#15803d' }}>
                          ₹{toAchieve.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>

            {/* Quick Progress Summary Bar */}
            <div className="card-panel" style={{ padding: '16px', border: '1px solid var(--color-primary-border)', backgroundColor: 'var(--color-primary-subtle)' }}>
              <BudgetProgressWidget
                committed={activeBudget.committedAmount}
                achieved={getBudgetAchievedAmount(activeBudget)}
                type={activeBudget.type}
                onClickAchieved={() => setInspectingBudget(activeBudget)}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Revise Budget Modal */}
      {isReviseModalOpen && activeBudget && (
        <Modal
          isOpen={true}
          onClose={() => setIsReviseModalOpen(false)}
          title={`Revise Budget: ${activeBudget.name}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setIsReviseModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmRevise} leftIcon={<Check size={15} />}>
                Confirm & Create Revision
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Revising this budget will mark the current record as <strong>Revised</strong> and generate a linked successor budget target with the updated commitment amount.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Current Committed Target:</span>
                <p style={{ fontWeight: 700, fontSize: '15px' }}>₹{activeBudget.committedAmount.toLocaleString()}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Currently Achieved:</span>
                <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-primary)' }}>
                  ₹{getBudgetAchievedAmount(activeBudget).toLocaleString()}
                </p>
              </div>
            </div>

            <FormField
              label="New Committed Target Amount ($)"
              type="number"
              step="1000"
              value={reviseAmount}
              onChange={(e) => setReviseAmount(Number(e.target.value))}
              placeholder="e.g. 200000"
              required
              autoFocus
            />

            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Variance from original:{' '}
              <strong style={{ color: Number(reviseAmount) >= activeBudget.committedAmount ? '#15803d' : '#b91c1c' }}>
                {Number(reviseAmount) >= activeBudget.committedAmount ? '+' : ''}
                ₹{(Number(reviseAmount) - activeBudget.committedAmount).toLocaleString()}
              </strong>
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
          maxWidth="680px"
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
                    <th style={{ textAlign: 'right' }}>Matched Amount (₹)</th>
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
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        ₹{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Modal>
      )}

      {/* Interactive Pie Chart Modal */}
      {pieChartBudget && (
        <BudgetPieChartModal
          isOpen={true}
          onClose={() => setPieChartBudget(null)}
          budget={pieChartBudget}
          achievedAmount={getBudgetAchievedAmount(pieChartBudget)}
        />
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
                Analytic Cost Center
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
            label="Committed Target Amount (₹)"
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
