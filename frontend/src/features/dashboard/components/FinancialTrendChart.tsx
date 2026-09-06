import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { FinancialTrendPoint } from '../api/dashboardApi';

interface FinancialTrendChartProps {
  data: FinancialTrendPoint[];
  hasData: boolean;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  loading?: boolean;
}

export const FinancialTrendChart: React.FC<FinancialTrendChartProps> = ({
  data,
  hasData,
  totalRevenue,
  totalExpenses,
  totalProfit,
  loading = false,
}) => {
  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    if (Math.abs(val) >= 1000) {
      return `₹${(val / 1000).toFixed(0)}k`;
    }
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
            <TrendingUp size={18} style={{ color: '#10b981' }} />
            <h2 className="card-title">Revenue vs Expenses (Posted Ledger)</h2>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
            Monthly income, expenses & net profit strictly derived from posted journal entries
          </p>
        </div>

        {hasData && (
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ color: '#10b981' }}>Rev: ₹{totalRevenue.toLocaleString()}</span>
            <span style={{ color: '#f59e0b' }}>Exp: ₹{totalExpenses.toLocaleString()}</span>
            <span style={{ color: totalProfit >= 0 ? 'var(--color-primary)' : '#ef4444' }}>
              Profit: ₹{totalProfit.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: '280px', position: 'relative' }}>
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
            Loading financial trend data...
          </div>
        ) : !hasData ? (
          <div
            style={{
              height: '100%',
              minHeight: '260px',
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
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', maxWidth: '340px', margin: 0 }}>
              Confirm sales invoices, vendor bills, or journal entries to observe real-time ledger revenue and expense trajectories.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="profit"
                name="Net Profit (Shaded)"
                stroke="#0ea5e9"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f59e0b' }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
