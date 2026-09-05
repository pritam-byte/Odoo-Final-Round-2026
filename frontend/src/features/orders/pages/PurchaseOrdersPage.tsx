import React, { useState } from 'react';
import { Plus, Check, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { useAccountingStore, PurchaseOrder, OrderLine } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { LineItemsTable } from '../../../components/ui/LineItemsTable';
import { Many2OneSelect } from '../../../components/ui/Many2OneSelect';
import { AccountantNav } from '../../../components/ui/AccountantNav';

export const PurchaseOrdersPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { purchaseOrders, contacts, products, accounts, analytics, addPurchaseOrder, confirmPurchaseOrder, addBill } =
    useAccountingStore();
  const [activeTab, setActiveTab] = useState<'All' | 'Confirmed' | 'Draft'>('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null);

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
    const defaultAcc = accounts.find((a) => a.type === 'Expense') || accounts[0];
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
        unitPrice: defaultProd?.cost || 50,
        total: defaultProd?.cost || 50,
      },
    ]);
    setError('');
    setIsModalOpen(true);
  };

  const handleSaveOrder = (status: 'Draft' | 'Confirmed') => {
    if (lines.length === 0) {
      setError('Please add at least one line item to this purchase order.');
      return;
    }

    const partner = contacts.find((c) => c.id === partnerId) || contacts[0];
    const total = lines.reduce((s: number, l: OrderLine) => s + l.total, 0);

    addPurchaseOrder({
      partnerId: partner?.id || 'c1',
      partnerName: partner?.name || 'Supplier',
      date,
      lines,
      total,
      status,
    });

    setIsModalOpen(false);
  };

  const handleCreateBillFromOrder = (order: PurchaseOrder) => {
    addBill({
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
    onNavigate('/purchase/bills');
  };

  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesTab = activeTab === 'All' || po.status === activeTab;
    const matchesSearch =
      po.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      po.partnerName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'orderNumber',
      header: 'PO Number',
      width: '140px',
      render: (po) => <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{po.orderNumber}</span>,
    },
    {
      key: 'partnerName',
      header: 'Vendor / Supplier',
      render: (po) => <span style={{ fontWeight: 500 }}>{po.partnerName}</span>,
    },
    {
      key: 'date',
      header: 'PO Date',
      width: '130px',
    },
    {
      key: 'total',
      header: 'Total Value ($)',
      align: 'right',
      render: (po) => (
        <span style={{ fontWeight: 700 }}>${po.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (po) => (
        <StatusBadge
          status={po.status === 'Confirmed' ? 'completed' : po.status === 'Draft' ? 'neutral' : 'danger'}
          label={po.status}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AccountantNav currentRoute="/purchase/orders" onNavigate={onNavigate} />

      <div className="content-header">
        <div>
          <h1 className="page-title">Purchase Orders & Procurement</h1>
          <p className="page-subtitle">Supplier contracts and purchase agreements, auto-convertible to vendor bills</p>
        </div>

        <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} strokeWidth={2.2} />}>
          New Purchase Order
        </Button>
      </div>

      {/* Purchase panel with counts tabs */}
      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div className="auth-tabs" style={{ width: 'auto', minWidth: '280px' }}>
            {(['All', 'Confirmed', 'Draft'] as const).map((tab) => {
              const count = purchaseOrders.filter((p) => tab === 'All' || p.status === tab).length;
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
            placeholder="Search PO number or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredOrders}
          keyExtractor={(po) => po.id}
          onRowClick={(po) => setViewingOrder(po)}
        />
      </div>

      {/* View PO Details Modal */}
      {viewingOrder && (
        <Modal
          isOpen={true}
          onClose={() => setViewingOrder(null)}
          title={`Purchase Order: ${viewingOrder.orderNumber}`}
          maxWidth="700px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {viewingOrder.status === 'Draft' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      confirmPurchaseOrder(viewingOrder.id);
                      setViewingOrder({ ...viewingOrder, status: 'Confirmed' });
                    }}
                    leftIcon={<CheckCircle2 size={14} />}
                  >
                    Confirm PO
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCreateBillFromOrder(viewingOrder)}
                  leftIcon={<FileText size={14} />}
                >
                  Create Vendor Bill
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
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Vendor:</span>
                <span style={{ fontWeight: 600 }}>{viewingOrder.partnerName}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>PO Date:</span>
                <span style={{ fontWeight: 600 }}>{viewingOrder.date}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Status:</span>
                <StatusBadge status={viewingOrder.status === 'Confirmed' ? 'completed' : 'neutral'} label={viewingOrder.status} />
              </div>
            </div>

            <LineItemsTable lines={viewingOrder.lines} onChange={() => {}} readOnly defaultAccountType="Expense" />
          </div>
        </Modal>
      )}

      {/* Create PO Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Purchase Order"
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
              Confirm PO
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
              label="Vendor (Contact)"
              options={contacts.map((c) => ({ id: c.id, name: c.name, subtitle: c.email }))}
              value={partnerId}
              onChange={(id) => setPartnerId(id)}
              createEntityName="Vendor"
              required
            />

            <FormField
              label="PO Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <LineItemsTable lines={lines} onChange={setLines} defaultAccountType="Expense" />
        </form>
      </Modal>
    </div>
  );
};

export default PurchaseOrdersPage;
