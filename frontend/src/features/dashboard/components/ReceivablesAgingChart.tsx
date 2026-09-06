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
import { Clock, AlertCircle } from 'lucide-react';
import { AgingBucket } from '../api/dashboardApi';

interface ReceivablesAgingChartProps {
  buckets: AgingBucket[];
  totalOutstanding: number;
  invoiceCount: number;
  hasData: boolean;
  loading?: boolean;
  onNavigate: (route: string) => void;
}

export const ReceivablesAgingChart: React.FC<ReceivablesAgingChartProps> = ({
  buckets,
  totalOutstanding,
  invoiceCount,
  hasData,
  loading = false,
  onNavigate,
}) => {
  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (Math.abs(val) >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val.toLocaleString()}`;
  };

  // Aging severity colors: Not overdue -> Teal, 1-30d -> Amber light, 31-60d -> Amber, 61-90d -> Orange, 90+d -> Red
  const BUCKET_COLORS: Record<string, string> = {
    'Not overdue': '#0d9488',
    '1–30 days': '#f59e0b',
    '31–60 days': '#ea580c',
    '61–90 days': '#dc2626',
    '90+ days': '#991b1b',
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
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
          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{data.range}</div>
          <div style={{ color: BUCKET_COLORS[data.range] || '#0d9488', fontWeight: 600, marginTop: '2px' }}>
            Outstanding: ₹{Number(data.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginTop: '2px' }}>
            Invoices: {data.count}
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
            <Clock size={18} style={{ color: '#0d9488' }} />
            <h2 className="card-title">Receivables Aging (Debtors)</h2>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
            Outstanding value = Invoice total − posted payment allocations
          </p>
        </div>

        {hasData && (
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-primary)',
              cursor: 'pointer',
            }}
            onClick={() => onNavigate('/sales/invoices')}
          >
            Total: ₹{totalOutstanding.toLocaleString()} ({invoiceCount} inv)
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
            Loading aging data...
          </div>
        ) : !hasData ? (
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
              No outstanding receivables.
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', maxWidth: '300px', margin: 0 }}>
              All customer invoices are fully settled or no confirmed invoices require attention.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={buckets}
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
                dataKey="range"
                stroke="var(--color-text-primary)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={85}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={22}>
                {buckets.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BUCKET_COLORS[entry.range] || 'var(--color-primary)'}
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
