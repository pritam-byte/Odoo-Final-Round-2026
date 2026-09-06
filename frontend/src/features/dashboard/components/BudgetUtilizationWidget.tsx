import React from 'react';
import { Target, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { BudgetUtilizationItem } from '../api/dashboardApi';

interface BudgetUtilizationWidgetProps {
  budgets: BudgetUtilizationItem[];
  achievedCount: number;
  budgetCount: number;
  committedCount: number;
  hasData: boolean;
  loading?: boolean;
  onNavigate: (route: string) => void;
}

export const BudgetUtilizationWidget: React.FC<BudgetUtilizationWidgetProps> = ({
  budgets,
  achievedCount,
  budgetCount,
  committedCount,
  hasData,
  loading = false,
  onNavigate,
}) => {
  const getColorCode = (color: 'teal' | 'amber' | 'red') => {
    switch (color) {
      case 'red':
        return '#ef4444';
      case 'amber':
        return '#f59e0b';
      case 'teal':
      default:
        return '#0d9488';
    }
  };

  return (
    <div className="card-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} style={{ color: 'var(--color-accent)' }} />
          <div>
            <h2 className="card-title">Budget Utilization</h2>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
              Horizontal variance tracking
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('/reports/budget')}
          leftIcon={<FileSpreadsheet size={13} />}
        >
          Report
        </Button>
      </div>

      {/* Synchronized Dynamic KPI Badges */}
      <div className="auth-tabs" style={{ width: '100%', marginBottom: '12px' }}>
        <button
          type="button"
          className="auth-tab-btn active"
          onClick={() => onNavigate('/reports/budget')}
          style={{ flex: 1, fontSize: '11px', padding: '6px 8px' }}
        >
          Achieved ({achievedCount})
        </button>
        <button
          type="button"
          className="auth-tab-btn"
          onClick={() => onNavigate('/budgets')}
          style={{ flex: 1, fontSize: '11px', padding: '6px 8px' }}
        >
          Budget ({budgetCount})
        </button>
        <button
          type="button"
          className="auth-tab-btn"
          onClick={() => onNavigate('/budgets')}
          style={{ flex: 1, fontSize: '11px', padding: '6px 8px' }}
        >
          Committed ({committedCount})
        </button>
      </div>

      {/* Progress Bars List */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: '260px',
          overflowY: 'auto',
          paddingRight: '2px',
        }}
      >
        {loading ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '12px',
            }}
          >
            Loading budget utilization...
          </div>
        ) : !hasData || budgets.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '13px',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--color-border)',
            }}
          >
            <p style={{ margin: '0 0 10px 0', fontWeight: 500 }}>No active budgets configured.</p>
            <Button variant="outline" size="sm" onClick={() => onNavigate('/budgets')}>
              Create Budget
            </Button>
          </div>
        ) : (
          budgets.map((b) => {
            const barColor = getColorCode(b.color);
            return (
              <div
                key={b.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => onNavigate('/reports/budget')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '12px',
                      color: 'var(--color-text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '180px',
                    }}
                    title={b.name}
                  >
                    {b.name}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: barColor,
                    }}
                  >
                    {b.utilizationPercent}%
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Spent: ₹{b.achievedAmount.toLocaleString()}</span>
                  <span>Target: ₹{b.committedAmount.toLocaleString()}</span>
                </div>

                {/* Horizontal Progress Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, b.utilizationPercent)}%`,
                      height: '100%',
                      backgroundColor: barColor,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease-in-out',
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
