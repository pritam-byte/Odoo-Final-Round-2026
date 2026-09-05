import React, { useState, useEffect } from 'react';
import { getMyPayments, PortalPayment } from '../api';
import { PaymentReceiptModal } from '../components/PaymentReceiptModal';
import { Receipt, Eye, Search } from 'lucide-react';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { CustomDatePicker } from '../../../components/ui/CustomDatePicker';
import { getStoredUser } from '../../../lib/auth';

export const PortalPaymentHistoryPage: React.FC = () => {
  const currentUser = getStoredUser();
  const pType = currentUser?.partnerType || 'Both';

  const [payments, setPayments] = useState<PortalPayment[]>(() => getMyPayments());
  const [selectedPayment, setSelectedPayment] = useState<PortalPayment | null>(null);

  const [methodFilter, setMethodFilter] = useState<'ALL' | 'Bank' | 'Cash'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'invoice' | 'bill'>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reload payments whenever user changes or updates or payment event fires
  useEffect(() => {
    const reload = () => setPayments(getMyPayments());
    reload();
    window.addEventListener('portal:payment', reload);
    return () => window.removeEventListener('portal:payment', reload);
  }, [currentUser?.partnerType]);

  // Auto-open modal if URL has ref query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      const matched = payments.find((p) => p.reference.toLowerCase() === refParam.toLowerCase());
      if (matched) {
        setSelectedPayment(matched);
      }
    }
  }, [payments]);

  const handleUpdatePayment = (updated: PortalPayment) => {
    setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedPayment(updated);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;
    const matchesType = typeFilter === 'ALL' || p.documentType === typeFilter;
    const matchesDate = !dateFilter || p.date === dateFilter;
    const matchesSearch =
      p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.partnerName && p.partnerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesMethod && matchesType && matchesDate && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="content-header">
        <div>
          <h1 className="page-title">Payment History</h1>
          <p className="page-subtitle">
            {pType === 'Vendor'
              ? 'Direct settlement payment vouchers for raw material supplies.'
              : pType === 'Customer'
              ? 'Official customer receipts for settled furniture invoices.'
              : 'Direct transaction receipts and payment vouchers for settled dues.'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card-panel" style={{ padding: '16px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          {/* Custom Selects and Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {pType === 'Both' && (
              <CustomSelect<'ALL' | 'invoice' | 'bill'>
                value={typeFilter}
                onChange={(val) => setTypeFilter(val)}
                options={[
                  { value: 'ALL', label: 'All Transactions' },
                  { value: 'invoice', label: 'Customer Receipts' },
                  { value: 'bill', label: 'Vendor Payouts' },
                ]}
                size="sm"
                width="160px"
              />
            )}

            <CustomSelect<'ALL' | 'Bank' | 'Cash'>
              value={methodFilter}
              onChange={(val) => setMethodFilter(val)}
              options={[
                { value: 'ALL', label: 'All Methods' },
                { value: 'Bank', label: 'Bank Transfer' },
                { value: 'Cash', label: 'Cash / Counter' },
              ]}
              size="sm"
              width="145px"
            />

            <CustomDatePicker
              value={dateFilter}
              onChange={(d) => setDateFilter(d)}
              placeholder="Filter by date..."
              allowClear={true}
              size="sm"
              width="165px"
            />
          </div>

          {/* Search bar */}
          <div className="search-bar-wrapper">
            <div className="search-bar-icon">
              <Search size={15} strokeWidth={1.75} />
            </div>
            <input
              type="text"
              className="search-bar-input"
              placeholder="Search reference # or document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '250px' }}
            />
          </div>
        </div>
      </div>

      {/* Table Data Card */}
      <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Receipt / Voucher #</th>
                <th>Document Ref</th>
                <th>Partner</th>
                <th>Payment Date</th>
                <th>Payment Method</th>
                <th style={{ textAlign: 'right' }}>Amount Settled</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No payment records found matching the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPayment(p)}
                    style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    title="Click to view & print payment receipt"
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Receipt size={16} color="#818cf8" />
                        <strong style={{ color: 'var(--color-text-primary)' }}>{p.reference}</strong>
                      </div>
                    </td>
                    <td>
                      {p.documentNumber}{' '}
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        ({p.documentType === 'bill' ? 'Supply Bill' : 'Customer Invoice'})
                      </span>
                    </td>
                    <td>{p.partnerName}</td>
                    <td>{p.date}</td>
                    <td>
                      <span
                        className={`badge-pill ${p.paymentMethod === 'Bank' ? 'badge-paid' : 'badge-pending'}`}
                      >
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)' }}>
                      ₹{p.amount.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '4px 8px', borderRadius: '6px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPayment(p);
                        }}
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Payment Receipt Modal */}
      {selectedPayment && (
        <PaymentReceiptModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onUpdate={handleUpdatePayment}
        />
      )}
    </div>
  );
};

export default PortalPaymentHistoryPage;
