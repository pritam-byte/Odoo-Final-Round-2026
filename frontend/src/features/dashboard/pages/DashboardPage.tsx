import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  Download,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { SearchFilterBar } from '../../../components/ui/SearchFilterBar';
import { DataTable, Column } from '../../../components/ui/DataTable';

interface Transaction {
  id: string;
  reference: string;
  partner: string;
  date: string;
  dueDate: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial' | 'draft';
}

export const DashboardPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const transactions: Transaction[] = [
    {
      id: '1',
      reference: 'INV/2026/00142',
      partner: 'Apex Logistics LLC',
      date: '2026-09-04',
      dueDate: '2026-09-18',
      amount: '$14,250.00',
      status: 'paid',
    },
    {
      id: '2',
      reference: 'INV/2026/00141',
      partner: 'Nexus Retail Partners',
      date: '2026-09-03',
      dueDate: '2026-09-17',
      amount: '$8,940.50',
      status: 'pending',
    },
    {
      id: '3',
      reference: 'INV/2026/00139',
      partner: 'Zenith Tech Systems',
      date: '2026-08-20',
      dueDate: '2026-09-01',
      amount: '$23,100.00',
      status: 'overdue',
    },
    {
      id: '4',
      reference: 'BILL/2026/0089',
      partner: 'Cloud Infrastructure Inc.',
      date: '2026-09-02',
      dueDate: '2026-09-16',
      amount: '$4,120.00',
      status: 'partial',
    },
    {
      id: '5',
      reference: 'INV/2026/00138',
      partner: 'Global Horizon Freight',
      date: '2026-09-01',
      dueDate: '2026-09-15',
      amount: '$11,600.00',
      status: 'paid',
    },
    {
      id: '6',
      reference: 'INV/2026/00137',
      partner: 'Starlight Media House',
      date: '2026-09-01',
      dueDate: '2026-09-30',
      amount: '$6,450.00',
      status: 'draft',
    },
  ];

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.partner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const columns: Column<Transaction>[] = [
    {
      key: 'reference',
      header: 'Reference',
      render: (t) => (
        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
          {t.reference}
        </span>
      ),
    },
    {
      key: 'partner',
      header: 'Customer / Vendor',
      render: (t) => <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{t.partner}</span>,
    },
    {
      key: 'date',
      header: 'Invoice Date',
    },
    {
      key: 'dueDate',
      header: 'Due Date',
    },
    {
      key: 'amount',
      header: 'Total Amount',
      align: 'right',
      render: (t) => <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{t.amount}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (t) => <StatusBadge status={t.status} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Title Header (Consistent left-alignment) */}
      <div className="content-header">
        <div>
          <h1 className="page-title">Executive Accounting & Overview</h1>
          <p className="page-subtitle">
            Real-time financial positions, ledger metrics, and transaction journal entries
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button variant="outline" leftIcon={<Download size={15} strokeWidth={1.75} />}>
            Export CSV
          </Button>
          <Button variant="primary" leftIcon={<Plus size={16} strokeWidth={2.2} />}>
            New Journal Entry
          </Button>
        </div>
      </div>

      {/* Stat Tiles Grid (Cards/stat tiles with icon in soft circular colored badge top-left, bold large number, small label below) */}
      <div className="stat-grid">
        {/* Card 1: Total Receivables (Teal) */}
        <div className="stat-card">
          <div className="stat-icon-badge teal">
            <DollarSign size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">$184,520.00</div>
            <div className="stat-label">Total Outstanding Receivables</div>
          </div>
        </div>

        {/* Card 2: Net Cash Flow (Teal / Positive) */}
        <div className="stat-card">
          <div className="stat-icon-badge teal">
            <TrendingUp size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">+$42,830.50</div>
            <div className="stat-label">Net Monthly Cash Flow</div>
          </div>
        </div>

        {/* Card 3: Pending Invoices (Amber) */}
        <div className="stat-card">
          <div className="stat-icon-badge amber">
            <Clock size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">$28,490.00</div>
            <div className="stat-label">Awaiting Payment (Pending)</div>
          </div>
        </div>

        {/* Card 4: Overdue Balances (Red) */}
        <div className="stat-card">
          <div className="stat-icon-badge red">
            <AlertTriangle size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">$23,100.00</div>
            <div className="stat-label">Overdue & Past Due Bills</div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Transactions Card Panel */}
      <div className="card-panel">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Journal Entries & Invoices</h2>
            <p className="card-subtitle">
              Displaying recent automated and manual postings across all bank, cash, and general journals
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <SearchFilterBar
          searchPlaceholder="Search reference, partner or account..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterOptions={[
            { label: 'All Statuses', value: 'all' },
            { label: 'Paid / Completed', value: 'paid' },
            { label: 'Pending', value: 'pending' },
            { label: 'Overdue', value: 'overdue' },
            { label: 'Partial', value: 'partial' },
            { label: 'Draft', value: 'draft' },
          ]}
          selectedFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          emptyMessage="No transactions match your filter criteria."
        />
      </div>
    </div>
  );
};

export default DashboardPage;
