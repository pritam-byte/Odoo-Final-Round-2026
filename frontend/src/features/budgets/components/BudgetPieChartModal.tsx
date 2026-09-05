import React, { useState } from 'react';
import { PieChart, Printer, Database, FileText, UserCheck, Calendar, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Budget, useAccountingStore } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

export interface BudgetPieChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  achievedAmount: number;
}

export const BudgetPieChartModal: React.FC<BudgetPieChartModalProps> = ({
  isOpen,
  onClose,
  budget,
  achievedAmount,
}) => {
  const { getBudgetMatchedTransactions } = useAccountingStore();
  const [hoveredSlice, setHoveredSlice] = useState<'achieved' | 'remaining' | null>(null);

  if (!isOpen || !budget) return null;

  const committed = Math.max(1, budget.committedAmount || 0);
  const achieved = Math.max(0, achievedAmount || 0);
  const remaining = Math.max(0, committed - achieved);
  const percentAchieved = Math.round((achieved / committed) * 100);
  const percentRemaining = Math.max(0, 100 - percentAchieved);

  // Database Entity Names & Context
  const isIncome = budget.type === 'Income';
  const dbSourceModel = isIncome ? 'CustomerInvoiceLine' : 'VendorBillLine';
  const achievedEntityLabel = isIncome ? 'Realized Invoiced Revenue' : 'Realized Operating Spend';
  const remainingEntityLabel = isIncome ? 'Remaining Revenue Target' : 'Unspent Budget Headroom';

  // Matched database transaction entities
  const matchedTransactions = getBudgetMatchedTransactions(budget);

  // SVG Pie geometry (Radius = 110, Center = 150, 150)
  const cx = 150;
  const cy = 150;
  const radius = 105;

  // Calculate arc coordinates
  const achievedAngle = Math.min(359.99, (achieved / committed) * 360);

  // Slice 1: Achieved (Starts at top -90deg)
  const startAngleAchieved = -Math.PI / 2;
  const endAngleAchieved = startAngleAchieved + (achievedAngle * Math.PI) / 180;
  const x1 = cx + radius * Math.cos(startAngleAchieved);
  const y1 = cy + radius * Math.sin(startAngleAchieved);
  const x2 = cx + radius * Math.cos(endAngleAchieved);
  const y2 = cy + radius * Math.sin(endAngleAchieved);
  const largeArcFlagAchieved = achievedAngle > 180 ? 1 : 0;

  const achievedPathData =
    achievedAngle >= 359.99
      ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlagAchieved} 1 ${x2} ${y2} Z`;

  // Slice 2: Remaining
  const rx1 = x2;
  const ry1 = y2;
  const rx2 = x1;
  const ry2 = y1;
  const remainingAngle = 360 - achievedAngle;
  const largeArcFlagRemaining = remainingAngle > 180 ? 1 : 0;

  const remainingPathData =
    achievedAngle <= 0.01
      ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
      : `M ${cx} ${cy} L ${rx1} ${ry1} A ${radius} ${radius} 0 ${largeArcFlagRemaining} 1 ${rx2} ${ry2} Z`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart size={20} style={{ color: 'var(--color-primary)' }} />
          <span>Analytical Budget Breakdown: {budget.name}</span>
        </div>
      }
      maxWidth="800px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Button variant="outline" onClick={() => window.print()} leftIcon={<Printer size={15} />}>
            Print Chart
          </Button>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Database Entity Attribution Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '14px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
              <Database size={13} style={{ color: 'var(--color-primary)' }} />
              <strong>Cost Center Entity:</strong>
            </div>
            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-primary)' }}>{budget.analyticName}</span>
            <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)' }}>Table: Analytic</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
              <UserCheck size={13} style={{ color: '#0369a1' }} />
              <strong>Responsible Contact:</strong>
            </div>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>{budget.responsible || 'Admin'}</span>
            <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)' }}>Table: Contact</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
              <FileText size={13} style={{ color: '#d97706' }} />
              <strong>Source Ledger Model:</strong>
            </div>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>{dbSourceModel}</span>
            <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)' }}>Type: {budget.type}</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
              <Calendar size={13} style={{ color: '#16a34a' }} />
              <strong>Validity Window:</strong>
            </div>
            <span style={{ fontWeight: 600, fontSize: '12px' }}>{budget.startDate}</span>
            <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)' }}>to {budget.endDate}</span>
          </div>
        </div>

        {/* Visual Layout: Pie Chart (Left) + Interactive Legend & Metrics (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'center', padding: '8px 0' }}>
          {/* SVG Pie Chart Canvas with Real-Time Data Labels */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg
              width="300"
              height="300"
              viewBox="0 0 300 300"
              style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.08))', overflow: 'visible' }}
            >
              {/* Achieved Slice (Cyan/Sky Blue) */}
              {achieved > 0 && (
                <path
                  d={achievedPathData}
                  fill="#0284c7"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: hoveredSlice === 'achieved' ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                  onMouseEnter={() => setHoveredSlice('achieved')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              )}

              {/* Remaining Slice (Coral / Warm Red) */}
              {remaining > 0 && (
                <path
                  d={remainingPathData}
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: hoveredSlice === 'remaining' ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                  onMouseEnter={() => setHoveredSlice('remaining')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              )}

              {/* Center Doughnut Cutout with Dynamic Target % */}
              <circle cx={cx} cy={cy} r="38" fill="#ffffff" stroke="var(--color-border)" strokeWidth="1.5" />
              <text
                x={cx}
                y={cy - 2}
                textAnchor="middle"
                style={{ fontSize: '16px', fontWeight: 800, fill: '#0f172a' }}
              >
                {percentAchieved}%
              </text>
              <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                style={{ fontSize: '10px', fontWeight: 600, fill: '#64748b' }}
              >
                {isIncome ? 'REVENUE' : 'UTILIZED'}
              </text>
            </svg>
          </div>

          {/* Interactive Legend and Entity Metric Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Achieved Entity Box */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: hoveredSlice === 'achieved' ? 'rgba(2, 132, 199, 0.15)' : '#f0f9ff',
                border: '1.5px solid #0284c7',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={() => setHoveredSlice('achieved')}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#0284c7' }}></div>
                  <strong style={{ fontSize: '12px', color: '#0369a1' }}>{achievedEntityLabel}</strong>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0284c7' }}>{percentAchieved}%</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0369a1', marginTop: '2px' }}>
                ₹ {achieved.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '11px', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <CheckCircle2 size={12} /> Sourced from confirmed {dbSourceModel} rows
              </span>
            </div>

            {/* Remaining Entity Box */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: hoveredSlice === 'remaining' ? 'rgba(244, 63, 94, 0.15)' : '#fff1f2',
                border: '1.5px solid #f43f5e',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={() => setHoveredSlice('remaining')}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f43f5e' }}></div>
                  <strong style={{ fontSize: '12px', color: '#be123c' }}>{remainingEntityLabel}</strong>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#e11d48' }}>{percentRemaining}%</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#be123c', marginTop: '2px' }}>
                ₹ {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '11px', color: '#e11d48', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <ArrowUpRight size={12} /> Target variance to achieve by {budget.endDate}
              </span>
            </div>

            {/* Total Committed Target Box */}
            <div style={{ padding: '10px 14px', background: 'var(--color-bg)', borderRadius: '6px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Total Approved Budget:</span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-primary)' }}>
                ₹ {committed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Database Transactions Audit Table */}
        <div style={{ marginTop: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={15} style={{ color: 'var(--color-primary)' }} />
              <span>Contributing Database Transactions ({matchedTransactions.length})</span>
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Filtered by Analytic ID: <code>{budget.analyticId || 'Analytic Account'}</code>
            </span>
          </div>

          {matchedTransactions.length > 0 ? (
            <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Transaction #</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Partner Name</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Date</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {matchedTransactions.map((tx, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: idx % 2 === 0 ? '#ffffff' : 'var(--color-bg)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--color-primary)' }}>{tx.number}</td>
                      <td style={{ padding: '8px 12px' }}>{tx.type}</td>
                      <td style={{ padding: '8px 12px' }}>{tx.partner}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{tx.date}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>₹{tx.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '14px', textAlign: 'center', background: 'var(--color-bg)', borderRadius: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              No confirmed {isIncome ? 'Customer Invoices' : 'Vendor Bills'} recorded under this Analytic Cost Center yet in this date window.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default BudgetPieChartModal;
