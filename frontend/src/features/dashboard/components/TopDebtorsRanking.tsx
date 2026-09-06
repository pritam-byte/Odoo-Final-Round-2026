import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Users, ExternalLink, AlertCircle } from 'lucide-react';
import { DebtorItem } from '../api/dashboardApi';

interface TopDebtorsRankingProps {
  debtors: DebtorItem[];
  totalOutstanding: number;
  hasData: boolean;
  loading?: boolean;
  onNavigate: (route: string) => void;
}

export const TopDebtorsRanking: React.FC<TopDebtorsRankingProps> = ({
  debtors,
  totalOutstanding,
  hasData,
  loading = false,
  onNavigate,
}) => {
  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (Math.abs(val) >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DebtorItem;
      return (
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '10px 14px',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
            fontSize: '12px',
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{data.customerName}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>{data.customerEmail}</div>
          <div style={{ color: 'var(--color-primary)', fontWeight: 700, marginTop: '4px' }}>
            Unpaid: ₹{Number(data.outstandingAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '11px', color: '#ea580c', marginTop: '2px' }}>
            {data.invoiceCount} unpaid invoice(s) &bull; {data.overdueCount} overdue
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
            Click to view customer invoices &rarr;
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 className="card-title">Top Outstanding Customers</h2>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
            Largest unpaid customer accounts &bull; Click to inspect invoices
          </p>
        </div>

        {hasData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>
              Total: ₹{totalOutstanding.toLocaleString()}
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onNavigate('/sales/invoices')}
              style={{ fontSize: '11px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              All Invoices <ExternalLink size={12} />
            </button>
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: '260px', position: 'relative' }}>
        {loading ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '13px',
            }}
          >
            Loading top debtors...
          </div>
        ) : !hasData || debtors.length === 0 ? (
          <div
            style={{
              height: '100%',
              minHeight: '240px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '24px',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border)',
              textAlign: 'center',
            }}
          >
            <AlertCircle size={28} style={{ color: 'var(--color-text-muted)' }} />
            <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              No outstanding customer balances.
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', maxWidth: '300px', margin: 0 }}>
              All customers have settled their accounts. Great financial health!
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={debtors}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" opacity={0.6} />
              <XAxis
                type="number"
                stroke="var(--color-text-muted)"
                fontSize={11}
                tickFormatter={formatCurrency}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="customerName"
                stroke="var(--color-text-primary)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="outstandingAmount" radius={[0, 4, 4, 0]} maxBarSize={22}>
                {debtors.map((_, index) => (
                  <Cell
                    key={`debtor-cell-${index}`}
                    fill="#0d9488"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onNavigate('/sales/invoices')}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
