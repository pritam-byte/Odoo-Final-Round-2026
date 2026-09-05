import React, { useState } from 'react';
import { Plus, Check, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { useAccountingStore, SalesOrder, OrderLine } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { LineItemsTable } from '../../../components/ui/LineItemsTable';
import { Many2OneSelect } from '../../../components/ui/Many2OneSelect';
import { AccountantNav } from '../../../components/ui/AccountantNav';

export const SalesOrdersPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { salesOrders, contacts, products, accounts, analytics, addSalesOrder, confirmSalesOrder, addInvoice } =
    useAccountingStore();
  const [activeTab, setActiveTab] = useState<'All' | 'Confirmed' | 'Draft'>('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<SalesOrder | null>(null);

  // Form State
  const [partnerId, setPartnerId] = useState(contacts[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [error, setError] = useState('');

  const openCreateModal = () => {
    setViewingOrder(null);
    setPartnerId(contacts[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);

    const defaultProd = products[0];
    const defaultAcc = accounts.find((a) => a.type === 'Income') || accounts[0];
    setLines([
      {
        id: `l_${Date.now()}`,
        productId: defaultProd?.id || '',
        productName: defaultProd?.name || '',
        accountId: defaultAcc?.id || '',
        accountName: defaultAcc?.name || '',
        analyticId: analytics[0]?.id || '',
        analyticName: analytics[0]?.name || '',
        quantity: 1,
        unitPrice: defaultProd?.salesPrice || 100,
        total: defaultProd?.salesPrice || 100,
      },
    ]);
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveOrder = (status: 'Draft' | 'Confirmed') => {
    if (lines.length === 0) {
      setError('Please add at least one line item to this order.');
      return;
    }

    const partner = contacts.find((c) => c.id === partnerId) || contacts[0];
    const total = lines.reduce((s: number, l: OrderLine) => s + l.total, 0);

    addSalesOrder({
      partnerId: partner?.id || contacts[0]?.id || '',
      partnerName: partner?.name || 'Customer',
      date,
      lines,
      total,
      status,
    });

    setIsModalOpen(false);
  };

  const handleCreateInvoiceFromOrder = (order: SalesOrder) => {
    addInvoice({
      reference: order.orderNumber,
      partnerId: order.partnerId,
      partnerName: order.partnerName,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      lines: order.lines,
      total: order.total,
      status: 'Draft',
    });
    setViewingOrder(null);
    onNavigate('/sales/invoices');
  };

  const filteredOrders = salesOrders.filter((so) => {
    const matchesTab = activeTab === 'All' || so.status === activeTab;
    const matchesSearch =
      so.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      so.partnerName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const columns: Column<SalesOrder>[] = [
    {
      key: 'orderNumber',
      header: 'SO Number',
      width: '140px',
      render: (so) => <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{so.orderNumber}</span>,
    },
    {
      key: 'partnerName',
      header: 'Customer',
      render: (so) => <span style={{ fontWeight: 500 }}>{so.partnerName}</span>,
    },
    {
      key: 'date',
      header: 'Order Date',
      width: '130px',
    },
    {
      key: 'total',
      header: 'Total Value (₹)',
      align: 'right',
      render: (so) => (
        <span style={{ fontWeight: 700 }}>₹{so.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (so) => (
        <StatusBadge
          status={so.status === 'Confirmed' ? 'completed' : so.status === 'Draft' ? 'neutral' : 'danger'}
          label={so.status}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/sales/orders" onNavigate={onNavigate} />

      {/* Sales Panel Header & Count Tabs matching spec */}
      <div className="content-header">
        <div>
          <h1 className="page-title">Sales Quotations & Orders</h1>
          <p className="page-subtitle">Commercial agreements with clients, auto-convertible to customer invoices</p>
        </div>

        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} strokeWidth={2.2} />}>
          New Sales Order
        </Button>
      </div>

      {/* Sales panel with counts tabs (All / Confirmed / Draft) */}
      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Tabs */}
          <div className="auth-tabs" style={{ width: 'auto', minWidth: '280px' }}>
            {(['All', 'Confirmed', 'Draft'] as const).map((tab) => {
              const count = salesOrders.filter((s) => tab === 'All' || s.status === tab).length;
              return (
                <button
                  key={tab}
                  type="button"
                  className={`auth-tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          <input
            type="text"
            className="form-input search-bar-input"
            style={{ maxWidth: '320px' }}
            placeholder="Search order number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredOrders}
          keyExtractor={(so) => so.id}
          onRowClick={(so) => setViewingOrder(so)}
        />
      </div>

      {/* View SO Details Modal */}
      {viewingOrder && (
        <Modal
          isOpen={true}
          onClose={() => setViewingOrder(null)}
          title={`Sales Order: ${viewingOrder.orderNumber}`}
          maxWidth="700px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {viewingOrder.status === 'Draft' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      confirmSalesOrder(viewingOrder.id);
                      setViewingOrder({ ...viewingOrder, status: 'Confirmed' });
                    }}
                    leftIcon={<CheckCircle2 size={14} />}
                  >
                    Confirm Order
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCreateInvoiceFromOrder(viewingOrder)}
                  leftIcon={<FileText size={14} />}
                >
                  Create Customer Invoice
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setViewingOrder(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '6px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Customer:</span>
                <span style={{ fontWeight: 600 }}>{viewingOrder.partnerName}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Order Date:</span>
                <span style={{ fontWeight: 600 }}>{viewingOrder.date}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Status:</span>
                <StatusBadge status={viewingOrder.status === 'Confirmed' ? 'completed' : 'neutral'} label={viewingOrder.status} />
              </div>
            </div>

            <LineItemsTable lines={viewingOrder.lines} onChange={() => {}} readOnly />
          </div>
        </Modal>
      )}

      {/* Create Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Sales Order / Quotation"
        maxWidth="750px"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} leftIcon={<ArrowLeft size={15} />}>
              Back
            </Button>
            <Button variant="outline" onClick={() => handleSaveOrder('Draft')}>
              Save as Draft
            </Button>
            <Button variant="primary" onClick={() => handleSaveOrder('Confirmed')} leftIcon={<Check size={15} strokeWidth={2.2} />}>
              Confirm Order
            </Button>
          </>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Many2OneSelect
              label="Customer (Contact)"
              options={contacts.map((c) => ({ id: c.id, name: c.name, subtitle: c.email }))}
              value={partnerId}
              onChange={(id) => setPartnerId(id)}
              createEntityName="Customer"
              required
            />

            <FormField
              label="Order Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <LineItemsTable lines={lines} onChange={setLines} defaultAccountType="Income" />
        </form>
      </Modal>
    </div>
  );
};

export default SalesOrdersPage;
