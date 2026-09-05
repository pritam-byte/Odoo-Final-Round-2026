import React from 'react';

export interface BudgetProgressWidgetProps {
  committed: number;
  achieved: number;
  type?: 'Income' | 'Expense';
  onClickAchieved?: () => void;
}

export const BudgetProgressWidget: React.FC<BudgetProgressWidgetProps> = ({
  committed,
  achieved,
  type = 'Income',
  onClickAchieved,
}) => {
  const percent = committed > 0 ? Math.min(200, Math.round((achieved / committed) * 100)) : 0;
  const remaining = Math.max(0, committed - achieved);

  let barColor = 'var(--color-primary)';
  if (type === 'Expense') {
    if (percent > 100) barColor = 'var(--color-danger)';
    else if (percent > 80) barColor = 'var(--color-warning)';
  } else {
    if (percent >= 100) barColor = 'var(--color-primary)';
    else if (percent >= 50) barColor = 'var(--color-primary)';
    else barColor = 'var(--color-warning)';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
        <span style={{ color: 'var(--color-text-muted)' }}>
          Committed: <strong style={{ color: 'var(--color-text-primary)' }}>${committed.toLocaleString()}</strong>
        </span>
        <span
          style={{
            cursor: onClickAchieved ? 'pointer' : 'default',
            color: onClickAchieved ? 'var(--color-primary)' : 'inherit',
            textDecoration: onClickAchieved ? 'underline' : 'none',
          }}
          onClick={onClickAchieved}
          title={onClickAchieved ? 'Click to inspect matched transactions' : undefined}
        >
          Achieved: <strong style={{ color: barColor }}>${achieved.toLocaleString()}</strong> ({percent}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, percent)}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-light)' }}>
        <span>To Achieve: ${remaining.toLocaleString()}</span>
        <span>Target: 100%</span>
      </div>
    </div>
  );
};

export default BudgetProgressWidget;
