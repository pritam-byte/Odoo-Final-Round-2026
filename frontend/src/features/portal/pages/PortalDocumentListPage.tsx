import React, { useState } from 'react';
import { Search, CreditCard, Receipt, FileText } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { CustomDatePicker } from '../../../components/ui/CustomDatePicker';
import { getMyScopedDocuments } from '../api';
import { DocumentType, UserDocumentStatus } from '../schemas';
import { getStoredUser } from '../../../lib/auth';

export interface PortalDocumentListPageProps {
  documentType?: DocumentType;
  onNavigate: (view: string, docId?: string) => void;
}

export const PortalDocumentListPage: React.FC<PortalDocumentListPageProps> = ({
  documentType,
  onNavigate,
}) => {
  const currentUser = getStoredUser();
  const pType = currentUser?.partnerType || 'Both';

  const [statusFilter, setStatusFilter] = useState<'ALL' | UserDocumentStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const allDocs = getMyScopedDocuments(documentType);

  const filteredDocs = allDocs.filter((doc) => {
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    const matchesSearch =
      doc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.date.includes(searchQuery) ||
      (doc.partnerName && doc.partnerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDate = !dateFilter || doc.date === dateFilter;
    return matchesStatus && matchesSearch && matchesDate;
  });

  const isBill = documentType === 'bill' || (pType === 'Vendor' && !documentType);
  const pageHeading = isBill
    ? 'My Supply Bills'
    : documentType === 'invoice'
    ? 'My Invoices'
    : 'My Invoices & Bills';

  const pageSub = isBill
    ? 'Track raw material supplies, procurement bills, and settlement status.'
    : 'Browse and settle your customer furniture invoices.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="content-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isBill ? (
              <Receipt size={22} style={{ color: 'var(--color-primary)' }} />
            ) : (
              <FileText size={22} style={{ color: 'var(--color-primary)' }} />
            )}
            <h1 className="page-title">{pageHeading}</h1>
          </div>
          <p className="page-subtitle">{pageSub}</p>
        </div>
      </div>

      {/* Filter and Tab Bar Card */}
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
          {/* Status Tabs and Custom Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <CustomSelect<'ALL' | UserDocumentStatus>
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'Unpaid', label: 'Unpaid / Pending' },
                { value: 'Paid', label: 'Paid in Full' },
              ]}
              size="sm"
              width="160px"
            />

            {/* Custom Date Picker Filter */}
            <CustomDatePicker
              value={dateFilter}
              onChange={(d) => setDateFilter(d)}
              placeholder="Filter by date..."
              allowClear={true}
              size="sm"
              width="170px"
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
              placeholder={isBill ? 'Search by bill # or supplier...' : 'Search by invoice #...'}
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
                <th>Date</th>
                <th>{isBill ? 'Bill Number' : 'Invoice Number'}</th>
                <th>{isBill ? 'Supplier (Self)' : 'Customer / Recipient'}</th>
                <th>Total Amount</th>
                <th>{isBill ? 'Balance Due' : 'Amount Due'}</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No documents found matching the active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onNavigate('detail', doc.id)}
                  >
                    <td>{doc.date}</td>
                    <td>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{doc.number}</strong>
                    </td>
                    <td>{doc.partnerName}</td>
                    <td style={{ fontWeight: 600 }}>₹{doc.total.toFixed(2)}</td>
                    <td
                      style={{
                        fontWeight: 700,
                        color: doc.amountDue > 0 ? 'var(--color-warning-text)' : 'var(--color-text-muted)',
                      }}
                    >
                      ₹{doc.amountDue.toFixed(2)}
                    </td>
                    <td>
                      <StatusBadge status={doc.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {doc.type === 'invoice' ? (
                        <button
                          type="button"
                          className={`btn btn-sm ${doc.status === 'Unpaid' ? 'btn-primary' : 'btn-outline'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('detail', doc.id);
                          }}
                        >
                          {doc.status === 'Unpaid' ? (
                            <>
                              <CreditCard size={13} />
                              <span>Pay Dues</span>
                            </>
                          ) : (
                            <span>View Invoice</span>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('detail', doc.id);
                          }}
                        >
                          {doc.status === 'Paid' ? (
                            <>
                              <Receipt size={13} />
                              <span>View Voucher</span>
                            </>
                          ) : (
                            <span>View Bill</span>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortalDocumentListPage;
