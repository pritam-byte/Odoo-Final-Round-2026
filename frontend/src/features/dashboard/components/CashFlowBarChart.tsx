import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ArrowDownUp, AlertCircle } from 'lucide-react';
import { CashFlowPoint } from '../api/dashboardApi';

interface CashFlowBarChartProps {
  data: CashFlowPoint[];
  hasData: boolean;
  totalReceived: number;
  totalPaid: number;
  loading?: boolean;
  onNavigate: (route: string) => void;
}

export const CashFlowBarChart: React.FC<CashFlowBarChartProps> = ({
  data,
  hasData,
  totalReceived,
  totalPaid,
  loading = false,
  onNavigate,
}) => {
  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (Math.abs(val) >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '12px 16px',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            fontSize: '12px',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
            {label}
          </div>
          {payload.map((entry: any, index: number) => (
            <div
              key={`item-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                margin: '3px 0',
                color: entry.color,
                fontWeight: 600,
              }}
            >
              <span>{entry.name}:</span>
              <span>₹{Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          ))}
          {payload.length >= 2 && (
            <div
              style={{
                marginTop: '6px',
                paddingTop: '6px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 700,
                color: payload[0].value - payload[1].value >= 0 ? '#0d9488' : '#ef4444',
              }}
            >
              <span>Net Cash Flow:</span>
              <span>
                ₹{(payload[0].value - payload[1].value).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
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
            <ArrowDownUp size={18} style={{ color: '#0d9488' }} />
            <h2 className="card-title">Cash In vs Cash Out (Movement)</h2>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
            Teal: Collections (Receipts) &bull; Orange: Disbursements (Paid)
          </p>
        </div>

        {hasData && (
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ color: '#0d9488' }}>In: ₹{totalReceived.toLocaleString()}</span>
            <span style={{ color: '#f97316' }}>Out: ₹{totalPaid.toLocaleString()}</span>
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
            Loading cash flow data...
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
              No posted transactions available for this period.
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', maxWidth: '320px', margin: 0 }}>
              Record customer invoice payments or vendor bill disbursements to track cash movement.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
              <XAxis
                dataKey="month"
                stroke="var(--color-text-muted)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="var(--color-text-muted)"
                fontSize={11}
                tickFormatter={formatCurrency}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 600 }}
              />
              <Bar
                dataKey="received"
                name="Collections (In)"
                fill="#0d9488"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
                style={{ cursor: 'pointer' }}
                onClick={() => onNavigate('/sales/invoices')}
              />
              <Bar
                dataKey="paid"
                name="Disbursements (Out)"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
                style={{ cursor: 'pointer' }}
                onClick={() => onNavigate('/purchase/bills')}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
