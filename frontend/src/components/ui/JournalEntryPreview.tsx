import { CheckCircle2 } from 'lucide-react';
import { JournalEntry } from '../../features/accounting/store';

export interface JournalEntryPreviewProps {
  entry?: JournalEntry;
  onViewEntry?: (id: string) => void;
}

export const JournalEntryPreview: React.FC<JournalEntryPreviewProps> = ({ entry, onViewEntry }) => {
  if (!entry) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-primary-subtle)',
        border: '1px solid var(--color-primary-border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} strokeWidth={2} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-primary)' }}>
            Auto-Generated Double Entry Journal Entry: {entry.entryNumber}
          </span>
        </div>
        {onViewEntry && (
          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, padding: 0 }}
            onClick={() => onViewEntry(entry.id)}
          >
            View in Ledger →
          </button>
        )}
      </div>

      {/* Lines Table */}
      <table className="custom-table" style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)' }}>
        <thead>
          <tr>
            <th>Account</th>
            <th>Partner</th>
            <th style={{ textAlign: 'right' }}>Debit (₹)</th>
            <th style={{ textAlign: 'right' }}>Credit (₹)</th>
          </tr>
        </thead>
        <tbody>
          {entry.lines.map((l) => (
            <tr key={l.id}>
              <td style={{ fontWeight: 500 }}>{l.accountName}</td>
              <td style={{ color: 'var(--color-text-secondary)' }}>{l.partnerName || '—'}</td>
              <td style={{ textAlign: 'right', fontWeight: l.debit > 0 ? 600 : 400 }}>
                {l.debit > 0 ? `₹${l.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
              </td>
              <td style={{ textAlign: 'right', fontWeight: l.credit > 0 ? 600 : 400 }}>
                {l.credit > 0 ? `₹${l.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ fontWeight: 700, borderTop: '2px solid var(--color-border)' }}>
            <td colSpan={2} style={{ textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '12px' }}>
              BALANCED TOTALS:
            </td>
            <td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>₹{entry.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
            <td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>₹{entry.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default JournalEntryPreview;
