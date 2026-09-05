import React, { useState } from 'react';
import { PieChart, Printer } from 'lucide-react';
import { Budget } from '../../accounting/store';
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
  const [hoveredSlice, setHoveredSlice] = useState<'achieved' | 'remaining' | null>(null);

  if (!isOpen || !budget) return null;

  const committed = Math.max(1, budget.committedAmount);
  const achieved = Math.max(0, achievedAmount);
  const remaining = Math.max(0, committed - achieved);
  const percentAchieved = Math.round((achieved / committed) * 100);
  const percentRemaining = Math.max(0, 100 - percentAchieved);

  // SVG Pie geometry (Radius = 110, Center = 150, 150)
  const cx = 150;
  const cy = 150;
  const radius = 110;

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
          <span>Budget Performance Pie Chart: {budget.name}</span>
        </div>
      }
      maxWidth="720px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Button variant="outline" onClick={() => window.print()} leftIcon={<Printer size={15} />}>
            Print Chart
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header Meta Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '14px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Cost Center:</span>
            <span style={{ fontWeight: 600 }}>{budget.analyticName}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Period:</span>
            <span style={{ fontWeight: 600 }}>{budget.startDate} to {budget.endDate}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Tracking Type:</span>
            <span style={{ fontWeight: 600 }}>{budget.type}</span>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Status:</span>
            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{budget.state}</span>
          </div>
        </div>

        {/* Visual Layout: Pie Chart (Left) + Interactive Legend & Metrics (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'center', padding: '12px 0' }}>
          {/* SVG Pie Chart Canvas */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg
              width="300"
              height="300"
              viewBox="0 0 300 300"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))', overflow: 'visible' }}
            >
              {/* Achieved Slice (Light Sky Blue / Cyan hatching like diagram) */}
              {achieved > 0 && (
                <path
                  d={achievedPathData}
                  fill="#38bdf8"
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

              {/* Remaining Slice (Coral / Red texture like diagram) */}
              {remaining > 0 && (
                <path
                  d={remainingPathData}
                  fill="#f87171"
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

              {/* Center Doughnut Cutout (optional, soft center) */}
              <circle cx={cx} cy={cy} r="35" fill="#ffffff" stroke="var(--color-border)" strokeWidth="1.5" />
              <text
                x={cx}
                y={cy + 5}
                textAnchor="middle"
                style={{ fontSize: '15px', fontWeight: 800, fill: 'var(--color-text-primary)' }}
              >
                {percentAchieved}%
              </text>
            </svg>
          </div>

          {/* Interactive Legend and Metric Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Achieved Box */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: hoveredSlice === 'achieved' ? 'rgba(56, 189, 248, 0.15)' : '#f0f9ff',
                border: '1px solid #bae6fd',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={() => setHoveredSlice('achieved')}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#38bdf8' }}></div>
                  <strong style={{ fontSize: '13px', color: '#0369a1' }}>Achieved Amount</strong>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7' }}>{percentAchieved}%</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0369a1' }}>
                ₹ {achieved.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '11px', color: '#0284c7' }}>Actual posted ledger records</span>
            </div>

            {/* Remaining Box */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: hoveredSlice === 'remaining' ? 'rgba(248, 113, 113, 0.15)' : '#fef2f2',
                border: '1px solid #fecaca',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={() => setHoveredSlice('remaining')}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f87171' }}></div>
                  <strong style={{ fontSize: '13px', color: '#b91c1c' }}>Amount to Achieve</strong>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626' }}>{percentRemaining}%</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#b91c1c' }}>
                ₹ {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '11px', color: '#dc2626' }}>Remaining allocated headroom</span>
            </div>

            {/* Total Committed Box */}
            <div style={{ padding: '10px 14px', background: 'var(--color-bg)', borderRadius: '6px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Total Committed Target:</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)' }}>
                ₹ {committed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BudgetPieChartModal;
