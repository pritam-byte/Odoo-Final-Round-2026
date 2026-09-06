import React from 'react';
import {
  Receipt,
  ShoppingCart,
  Truck,
  ArrowDownUp,
  FileSpreadsheet,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { ActivityItem } from '../api/dashboardApi';
import { StatusBadge } from '../../../components/ui/StatusBadge';

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  hasData: boolean;
  loading?: boolean;
  onNavigate: (route: string) => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  hasData,
  loading = false,
  onNavigate,
}) => {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'INVOICE':
        return <ShoppingCart size={15} style={{ color: '#0d9488' }} />;
      case 'BILL':
        return <Truck size={15} style={{ color: '#f59e0b' }} />;
      case 'PAYMENT':
        return <ArrowDownUp size={15} style={{ color: '#0ea5e9' }} />;
      case 'JOURNAL_ENTRY':
      default:
        return <FileSpreadsheet size={15} style={{ color: '#8b5cf6' }} />;
    }
  };

  const getTargetRoute = (type: ActivityItem['type']) => {
    switch (type) {
      case 'INVOICE':
        return '/sales/invoices';
      case 'BILL':
        return '/purchase/bills';
      case 'PAYMENT':
        return '/sales/invoices';
      case 'JOURNAL_ENTRY':
      default:
        return '/journal-entries';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="card-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Receipt size={18} style={{ color: 'var(--color-primary)' }} />
          <div>
            <h2 className="card-title">Recent Financial Activity</h2>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
              Real-time audit stream of transactions & postings
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
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
            Loading recent activity...
          </div>
        ) : !hasData || activities.length === 0 ? (
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
            <AlertCircle size={24} style={{ color: 'var(--color-text-muted)', marginBottom: '6px' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>No recent activity records found.</p>
          </div>
        ) : (
          activities.map((act) => {
            const targetRoute = getTargetRoute(act.type);
            return (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => onNavigate(targetRoute)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {getIcon(act.type)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--color-text-primary)' }}>
                      {act.reference}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                      {act.partnerName} &bull; {formatDate(act.date)}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text-primary)' }}>
                      ₹{act.amount.toLocaleString()}
                    </div>
                    <StatusBadge
                      status={
                        act.status === 'POSTED' || act.status === 'Paid'
                          ? 'paid'
                          : act.status === 'CONFIRMED'
                          ? 'pending'
                          : 'neutral'
                      }
                      label={act.status}
                    />
                  </div>
                  <ArrowRight size={13} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
