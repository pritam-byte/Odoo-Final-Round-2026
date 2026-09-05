import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { OrderLine, useAccountingStore } from '../../features/accounting/store';
import { Button } from './Button';

export interface LineItemsTableProps {
  lines: OrderLine[];
  onChange: (lines: OrderLine[]) => void;
  readOnly?: boolean;
  defaultAccountType?: 'Income' | 'Expense';
  hideAccountColumn?: boolean;
}

export const LineItemsTable: React.FC<LineItemsTableProps> = ({
  lines,
  onChange,
  readOnly = false,
  defaultAccountType = 'Income',
  hideAccountColumn = false,
}) => {
  const { products, accounts, analytics } = useAccountingStore();

  const handleAddLine = () => {
    const defaultProduct = products[0];
    const targetAcc =
      defaultAccountType === 'Expense'
        ? accounts.find((a) => a.code === '5000' || a.name.toLowerCase().includes('purchase')) ||
          accounts.find((a) => a.type === 'Expense') ||
          accounts[0]
        : accounts.find((a) => a.code === '4000' || a.name.toLowerCase().includes('sales')) ||
          accounts.find((a) => a.type === 'Income') ||
          accounts[0];

    const newLine: OrderLine = {
      id: `line_${Date.now()}_${Math.random()}`,
      productId: defaultProduct ? defaultProduct.id : '',
      productName: defaultProduct ? defaultProduct.name : '',
      accountId: targetAcc ? targetAcc.id : '',
      accountName: targetAcc ? targetAcc.name : '',
      analyticId: analytics[0]?.id || '',
      analyticName: analytics[0]?.name || '',
      quantity: 1,
      unitPrice: defaultProduct ? (defaultAccountType === 'Income' ? defaultProduct.salesPrice : defaultProduct.cost) : 100,
      total: defaultProduct ? (defaultAccountType === 'Income' ? defaultProduct.salesPrice : defaultProduct.cost) : 100,
    };
    onChange([...lines, newLine]);
  };

  const handleRemoveLine = (index: number) => {
    onChange(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof OrderLine, value: any) => {
    const updated = [...lines];
    const current = { ...updated[index] };

    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        current.productId = prod.id;
        current.productName = prod.name;
        current.unitPrice = defaultAccountType === 'Income' ? prod.salesPrice : prod.cost;
        current.total = current.quantity * current.unitPrice;
      }
    } else if (field === 'accountId') {
      const acc = accounts.find((a) => a.id === value);
      if (acc) {
        current.accountId = acc.id;
        current.accountName = acc.name;
      }
    } else if (field === 'analyticId') {
      const an = analytics.find((a) => a.id === value);
      current.analyticId = an?.id || '';
      current.analyticName = an?.name || '';
    } else if (field === 'quantity') {
      current.quantity = Math.max(1, Number(value) || 1);
      current.total = current.quantity * current.unitPrice;
    } else if (field === 'unitPrice') {
      current.unitPrice = Math.max(0, Number(value) || 0);
      current.total = current.quantity * current.unitPrice;
    }

    updated[index] = current;
    onChange(updated);
  };

  const grandTotal = lines.reduce((s, l) => s + (l.total || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="table-container" style={{ margin: 0 }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Sr. No.</th>
              <th style={{ minWidth: '180px' }}>Product</th>
              {!hideAccountColumn && <th style={{ minWidth: '160px' }}>Chart of Account</th>}
              <th style={{ minWidth: '140px' }}>Budget Analytics</th>
              <th style={{ width: '80px', textAlign: 'right' }}>Qty</th>
              <th style={{ width: '110px', textAlign: 'right' }}>Unit Price</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Total</th>
              {!readOnly && <th style={{ width: '50px' }}></th>}
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={hideAccountColumn ? 7 : 8} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                  No line items added yet. Click "+ Add an Item" below.
                </td>
              </tr>
            ) : (
              lines.map((line, idx) => (
                <tr key={line.id}>
                  {/* Sr. No. */}
                  <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    {idx + 1}
                  </td>
                  {/* Product */}
                  <td>
                    {readOnly ? (
                      <span style={{ fontWeight: 500 }}>{line.productName}</span>
                    ) : (
                      <select
                        className="form-input select-filter"
                        style={{ padding: '6px 10px', fontSize: '13px' }}
                        value={line.productId}
                        onChange={(e) => handleLineChange(idx, 'productId', e.target.value)}
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.type})
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Account */}
                  {!hideAccountColumn && (
                    <td>
                      {readOnly ? (
                        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{line.accountName}</span>
                      ) : (
                        <select
                          className="form-input select-filter"
                          style={{ padding: '6px 10px', fontSize: '13px' }}
                          value={line.accountId}
                          onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                        >
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.code} - {a.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  )}

                  {/* Analytics */}
                  <td>
                    {readOnly ? (
                      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        {line.analyticName || '—'}
                      </span>
                    ) : (
                      <select
                        className="form-input select-filter"
                        style={{ padding: '6px 10px', fontSize: '13px' }}
                        value={line.analyticId || ''}
                        onChange={(e) => handleLineChange(idx, 'analyticId', e.target.value)}
                      >
                        <option value="">None</option>
                        {analytics.map((an) => (
                          <option key={an.id} value={an.id}>
                            {an.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Qty */}
                  <td style={{ textAlign: 'right' }}>
                    {readOnly ? (
                      <span>{line.quantity}</span>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        style={{ padding: '6px 8px', fontSize: '13px', textAlign: 'right', width: '70px' }}
                        value={line.quantity}
                        onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                      />
                    )}
                  </td>

                  {/* Unit Price */}
                  <td style={{ textAlign: 'right' }}>
                    {readOnly ? (
                      <span>₹{line.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input"
                        style={{ padding: '6px 8px', fontSize: '13px', textAlign: 'right', width: '100px' }}
                        value={line.unitPrice}
                        onChange={(e) => handleLineChange(idx, 'unitPrice', e.target.value)}
                      />
                    )}
                  </td>

                  {/* Total */}
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)' }}>₹{line.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>

                  {/* Delete Action */}
                  {!readOnly && (
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '4px', color: 'var(--color-danger)' }}
                        onClick={() => handleRemoveLine(idx)}
                        title="Remove line"
                      >
                        <Trash2 size={14} strokeWidth={1.75} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Total Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddLine}
            leftIcon={<Plus size={14} strokeWidth={2.2} />}
          >
            Add an Item
          </Button>
        )}

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'baseline',
            gap: '16px',
            padding: '10px 16px',
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            UNTURNED GRAND TOTAL:
          </span>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LineItemsTable;
