import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { OrderLine, useAccountingStore } from '../../features/accounting/store';
import { Button } from './Button';
import { CustomSelect } from './CustomSelect';

export interface LineItemsTableProps {
  lines: OrderLine[];
  onChange: (lines: OrderLine[]) => void;
  readOnly?: boolean;
  defaultAccountType?: 'Income' | 'Expense';
  hideAccountColumn?: boolean;
  /** Called whenever the qty-exceeds-max validation state changes. Parent can use to block save. */
  onValidationChange?: (hasErrors: boolean) => void;
}

export const LineItemsTable: React.FC<LineItemsTableProps> = ({
  lines,
  onChange,
  readOnly = false,
  defaultAccountType = 'Income',
  hideAccountColumn = false,
  onValidationChange,
}) => {
  const { products, accounts, analytics } = useAccountingStore();

  // Compute per-line quantity errors (index → error message | null)
  const getQtyError = (line: OrderLine): string | null => {
    const prod = products.find((p) => p.id === line.productId);
    const qty = Number(line.quantity) || 0;
    if (prod?.maxQuantity && prod.maxQuantity > 0 && qty > prod.maxQuantity) {
      return `Quantity (${qty}) exceeds the maximum allowed limit of ${prod.maxQuantity} for "${prod.name}". Please reduce the quantity.`;
    }
    return null;
  };

  // Notify parent whenever validation state changes
  React.useEffect(() => {
    if (onValidationChange) {
      const hasErrors = lines.some((l) => getQtyError(l) !== null);
      onValidationChange(hasErrors);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, products]);

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
        // Do NOT clamp qty — let the user see the error and fix it themselves
        current.total = (Number(current.quantity) || 0) * current.unitPrice;
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
      // Allow any value while typing — error shown inline, parent blocks save
      current.quantity = value === '' ? ('' as any) : Number(value);
      current.total = (Number(value) || 0) * current.unitPrice;
    } else if (field === 'unitPrice') {
      current.unitPrice = value === '' ? ('' as any) : Math.max(0, Number(value));
      current.total = (Number(current.quantity) || 0) * (Number(value) || 0);
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
              lines.map((line, idx) => {
                const qtyError = getQtyError(line);
                const prod = products.find((p) => p.id === line.productId);
                const maxQty = prod?.maxQuantity && prod.maxQuantity > 0 ? prod.maxQuantity : undefined;

                return (
                  <React.Fragment key={line.id}>
                    <tr>
                      {/* Sr. No. */}
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        {idx + 1}
                      </td>
                      {/* Product */}
                      <td>
                        {readOnly ? (
                          <span style={{ fontWeight: 500 }}>{line.productName}</span>
                        ) : (() => {
                          const baseOptions = products.map((p) => ({
                            value: p.id,
                            label: `${p.name} (${p.type})`,
                          }));
                          const alreadyInList = products.some((p) => p.id === line.productId);
                          const finalOptions = !alreadyInList && line.productId && line.productName
                            ? [{ value: line.productId, label: `${line.productName}` }, ...baseOptions]
                            : baseOptions;
                          return (
                            <CustomSelect<string>
                              size="sm"
                              value={line.productId}
                              onChange={(val) => handleLineChange(idx, 'productId', val)}
                              options={finalOptions}
                              width="100%"
                            />
                          );
                        })()}
                      </td>

                      {/* Account */}
                      {!hideAccountColumn && (
                        <td>
                          {readOnly ? (
                            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{line.accountName}</span>
                          ) : (
                            <CustomSelect<string>
                              size="sm"
                              value={line.accountId}
                              onChange={(val) => handleLineChange(idx, 'accountId', val)}
                              options={accounts.map((a) => ({
                                value: a.id,
                                label: `${a.code} - ${a.name}`,
                              }))}
                              width="100%"
                            />
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
                          <CustomSelect<string>
                            size="sm"
                            value={line.analyticId || ''}
                            onChange={(val) => handleLineChange(idx, 'analyticId', val)}
                            options={[
                              { value: '', label: 'None' },
                              ...analytics.map((an) => ({
                                value: an.id,
                                label: an.name,
                              })),
                            ]}
                            width="100%"
                          />
                        )}
                      </td>

                      {/* Qty */}
                      <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: '8px' }}>
                        {readOnly ? (
                          <span>{line.quantity}</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                            <input
                              type="number"
                              min="1"
                              className="form-input"
                              style={{
                                padding: '6px 8px',
                                fontSize: '13px',
                                textAlign: 'right',
                                width: '70px',
                                borderColor: qtyError ? '#ef4444' : undefined,
                                outline: qtyError ? '2px solid #fecaca' : undefined,
                                outlineOffset: '1px',
                              }}
                              value={line.quantity}
                              onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                              onBlur={() => {
                                if (!line.quantity || Number(line.quantity) < 1) {
                                  handleLineChange(idx, 'quantity', 1);
                                }
                              }}
                            />
                            {qtyError ? (
                              <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                Max limit: {maxQty}
                              </span>
                            ) : maxQty !== undefined ? (
                              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                                max: {maxQty}
                              </span>
                            ) : null}
                          </div>
                        )}
                      </td>

                      {/* Unit Price */}
                      <td style={{ textAlign: 'right' }}>
                        {readOnly ? (
                          <span>₹{(Number(line.unitPrice) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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

                      {/* Total — red when qty error exists */}
                      <td style={{
                        textAlign: 'right',
                        fontWeight: 600,
                        color: qtyError ? '#ef4444' : 'var(--color-text-primary)',
                      }}>
                        ₹{(Number(line.total) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

                    {/* Quantity error row — spans full width for maximum visibility */}
                    {!readOnly && qtyError && (
                      <tr key={`${line.id}_err`}>
                        <td
                          colSpan={hideAccountColumn ? 7 : 8}
                          style={{ padding: '0 8px 8px 8px', border: 'none', backgroundColor: 'transparent' }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#b91c1c',
                            fontWeight: 500,
                          }}>
                            <span style={{ fontSize: '14px' }}>⛔</span>
                            {qtyError}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
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
