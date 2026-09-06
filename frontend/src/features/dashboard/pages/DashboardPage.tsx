import React, { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee,
  TrendingUp,
  Clock,
  Plus,
  ShoppingCart,
  Truck,
  BookOpen,
  Scale,
  Users,
  Package,
  Target,
  FileSpreadsheet,
  Receipt,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { useAccountingStore } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { AccountantNav } from '../../../components/ui/AccountantNav';
import {
  fetchFinancialTrend,
  fetchCashFlow,
  fetchReceivablesAging,
  fetchBudgetUtilization,
  fetchTopDebtors,
  fetchRecentActivity,
  DateFilterPeriod,
  FinancialTrendPoint,
  CashFlowPoint,
  AgingBucket,
  BudgetUtilizationItem,
  DebtorItem,
  ActivityItem,
} from '../api/dashboardApi';
import { FinancialTrendChart } from '../components/FinancialTrendChart';
import { BudgetUtilizationWidget } from '../components/BudgetUtilizationWidget';
import { ReceivablesAgingChart } from '../components/ReceivablesAgingChart';
import { CashFlowBarChart } from '../components/CashFlowBarChart';
import { TopDebtorsRanking } from '../components/TopDebtorsRanking';
import { RecentActivityFeed } from '../components/RecentActivityFeed';

export const DashboardPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { invoices, bills, accounts, budgets, journalEntries, payments: storePayments, getBudgetAchievedAmount } = useAccountingStore();
  const [salesTab, setSalesTab] = useState<'All' | 'Confirmed' | 'Draft'>('All');
  const [purchaseTab, setPurchaseTab] = useState<'All' | 'Confirmed' | 'Draft'>('All');
  const [selectedPeriod, setSelectedPeriod] = useState<DateFilterPeriod>('6m');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Financial Trend State
  const [trendData, setTrendData] = useState<FinancialTrendPoint[]>([]);
  const [trendHasData, setTrendHasData] = useState<boolean>(false);
  const [totalTrendRevenue, setTotalTrendRevenue] = useState<number>(0);
  const [totalTrendExpenses, setTotalTrendExpenses] = useState<number>(0);
  const [totalTrendProfit, setTotalTrendProfit] = useState<number>(0);

  // Cash Flow State
  const [cashFlowData, setCashFlowData] = useState<CashFlowPoint[]>([]);
  const [cashFlowHasData, setCashFlowHasData] = useState<boolean>(false);
  const [totalReceived, setTotalReceived] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);

  // Receivables Aging State
  const [agingBuckets, setAgingBuckets] = useState<AgingBucket[]>([]);
  const [totalAgingOutstanding, setTotalAgingOutstanding] = useState<number>(0);
  const [agingInvoiceCount, setAgingInvoiceCount] = useState<number>(0);
  const [agingHasData, setAgingHasData] = useState<boolean>(false);

  // Budget Utilization State
  const [budgetItems, setBudgetItems] = useState<BudgetUtilizationItem[]>([]);
  const [budgetAchievedCount, setBudgetAchievedCount] = useState<number>(0);
  const [budgetTotalCount, setBudgetTotalCount] = useState<number>(0);
  const [budgetCommittedCount, setBudgetCommittedCount] = useState<number>(0);
  const [budgetHasData, setBudgetHasData] = useState<boolean>(false);

  // Top Debtors State
  const [debtors, setDebtors] = useState<DebtorItem[]>([]);
  const [debtorsTotalOutstanding, setDebtorsTotalOutstanding] = useState<number>(0);
  const [debtorsHasData, setDebtorsHasData] = useState<boolean>(false);

  // Recent Activity State
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [activityHasData, setActivityHasData] = useState<boolean>(false);

  // Fallback calculations from reactive in-memory store when backend is unreachable
  const computeFallbackData = useCallback(() => {
    // 1. Receivables Aging Fallback
    const openInvoices = invoices.filter((i) => i.status === 'Confirmed' && i.amountDue > 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const bList: AgingBucket[] = [
      { range: 'Not overdue', amount: 0, count: 0 },
      { range: '1–30 days', amount: 0, count: 0 },
      { range: '31–60 days', amount: 0, count: 0 },
      { range: '61–90 days', amount: 0, count: 0 },
      { range: '90+ days', amount: 0, count: 0 },
    ];

    let totalAging = 0;
    for (const inv of openInvoices) {
      const due = new Date(inv.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      totalAging += inv.amountDue;

      if (diffDays <= 0) {
        bList[0].amount += inv.amountDue;
        bList[0].count += 1;
      } else if (diffDays <= 30) {
        bList[1].amount += inv.amountDue;
        bList[1].count += 1;
      } else if (diffDays <= 60) {
        bList[2].amount += inv.amountDue;
        bList[2].count += 1;
      } else if (diffDays <= 90) {
        bList[3].amount += inv.amountDue;
        bList[3].count += 1;
      } else {
        bList[4].amount += inv.amountDue;
        bList[4].count += 1;
      }
    }
    setAgingBuckets(bList);
    setTotalAgingOutstanding(totalAging);
    setAgingInvoiceCount(openInvoices.length);
    setAgingHasData(openInvoices.length > 0 && totalAging > 0);

    // 2. Budget Utilization Fallback (Strictly synchronized with live store!)
    const bItems: BudgetUtilizationItem[] = budgets.map((b) => {
      const achieved = getBudgetAchievedAmount(b);
      const percent = b.committedAmount > 0 ? Math.round((achieved / b.committedAmount) * 100) : 0;
      let color: 'teal' | 'amber' | 'red' = 'teal';
      if (percent > 90) color = 'red';
      else if (percent >= 70) color = 'amber';

      return {
        id: b.id,
        name: b.name,
        type: b.type === 'Income' ? 'INCOME' : 'EXPENSE',
        status: b.state,
        analyticName: b.name,
        responsibleName: 'Finance Manager',
        committedAmount: b.committedAmount,
        achievedAmount: achieved,
        utilizationPercent: percent,
        color,
      };
    });
    setBudgetItems(bItems);
    setBudgetAchievedCount(budgets.filter((b) => getBudgetAchievedAmount(b) > 0).length);
    setBudgetTotalCount(budgets.length);
    setBudgetCommittedCount(budgets.filter((b) => b.committedAmount > 0).length);
    setBudgetHasData(budgets.length > 0);

    // 3. Top Debtors Fallback
    const debtorsMap = new Map<string, DebtorItem>();
    for (const inv of openInvoices) {
      const existing = debtorsMap.get(inv.partnerId) || {
        customerId: inv.partnerId,
        customerName: inv.partnerName,
        customerEmail: `${inv.partnerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        outstandingAmount: 0,
        invoiceCount: 0,
        overdueCount: 0,
      };
      existing.outstandingAmount += inv.amountDue;
      existing.invoiceCount += 1;
      if (new Date(inv.dueDate) < now) {
        existing.overdueCount += 1;
      }
      debtorsMap.set(inv.partnerId, existing);
    }
    const debtorList = Array.from(debtorsMap.values())
      .sort((a, b) => b.outstandingAmount - a.outstandingAmount)
      .slice(0, 5);
    setDebtors(debtorList);
    setDebtorsTotalOutstanding(debtorList.reduce((s, d) => s + d.outstandingAmount, 0));
    setDebtorsHasData(debtorList.length > 0);

    // 4. Financial Trend Fallback from Posted Journal Entries
    const postedEntries = journalEntries.filter((je) => je.status === 'Posted');
    if (postedEntries.length > 0) {
      const monthMap = new Map<string, FinancialTrendPoint>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        monthMap.set(key, { month: label, revenue: 0, expenses: 0, profit: 0 });
      }

      let hasDataCount = 0;
      for (const je of postedEntries) {
        const d = new Date(je.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const pt = monthMap.get(key);
        if (pt) {
          for (const line of je.lines) {
            const acc = accounts.find((a) => a.id === line.accountId);
            if (acc?.type === 'Income') {
              pt.revenue += line.credit - line.debit;
              hasDataCount++;
            } else if (acc?.type === 'Expense') {
              pt.expenses += line.debit - line.credit;
              hasDataCount++;
            }
          }
          pt.profit = pt.revenue - pt.expenses;
        }
      }

      const trendPoints = Array.from(monthMap.values());
      setTrendData(trendPoints);
      setTrendHasData(hasDataCount > 0);
      const rev = trendPoints.reduce((s, t) => s + t.revenue, 0);
      const exp = trendPoints.reduce((s, t) => s + t.expenses, 0);
      setTotalTrendRevenue(rev);
      setTotalTrendExpenses(exp);
      setTotalTrendProfit(rev - exp);
    } else {
      setTrendData([]);
      setTrendHasData(false);
      setTotalTrendRevenue(0);
      setTotalTrendExpenses(0);
      setTotalTrendProfit(0);
    }

    // 5. Cash Flow Fallback
    const paymentsList = storePayments || [];
    if (paymentsList.length > 0) {
      const cfMap = new Map<string, CashFlowPoint>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        cfMap.set(key, { month: label, received: 0, paid: 0, netCash: 0 });
      }

      let hasPay = 0;
      for (const p of paymentsList) {
        const d = new Date(p.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const cf = cfMap.get(key);
        if (cf) {
          if (p.type === 'Receive' || (p as any).paymentType === 'RECEIVE') {
            cf.received += p.amount;
            hasPay++;
          } else {
            cf.paid += p.amount;
            hasPay++;
          }
          cf.netCash = cf.received - cf.paid;
        }
      }

      const cfPoints = Array.from(cfMap.values());
      setCashFlowData(cfPoints);
      setCashFlowHasData(hasPay > 0);
      setTotalReceived(cfPoints.reduce((s, c) => s + c.received, 0));
      setTotalPaid(cfPoints.reduce((s, c) => s + c.paid, 0));
    } else {
      setCashFlowData([]);
      setCashFlowHasData(false);
      setTotalReceived(0);
      setTotalPaid(0);
    }

    // 6. Recent Activity Fallback
    const acts: ActivityItem[] = [
      ...invoices.slice(0, 5).map((inv) => ({
        id: `inv-${inv.id}`,
        type: 'INVOICE' as const,
        reference: inv.invoiceNumber,
        partnerName: inv.partnerName,
        amount: inv.total,
        date: inv.date,
        createdAt: inv.date,
        status: inv.status,
        description: `Customer Invoice ${inv.invoiceNumber} • ${inv.partnerName}`,
      })),
      ...bills.slice(0, 5).map((bill) => ({
        id: `bill-${bill.id}`,
        type: 'BILL' as const,
        reference: bill.billNumber,
        partnerName: bill.partnerName,
        amount: bill.total,
        date: bill.date,
        createdAt: bill.date,
        status: bill.status,
        description: `Vendor Bill ${bill.billNumber} • ${bill.partnerName}`,
      })),
    ];
    setRecentActivities(acts);
    setActivityHasData(acts.length > 0);
  }, [invoices, bills, accounts, budgets, journalEntries, storePayments, getBudgetAchievedAmount]);

  // Load all dashboard API data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { period: selectedPeriod };
      if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      }

      const [trendRes, cfRes, agingRes, budgetRes, debtorsRes, activityRes] = await Promise.all([
        fetchFinancialTrend(params),
        fetchCashFlow(params),
        fetchReceivablesAging(),
        fetchBudgetUtilization(),
        fetchTopDebtors(5),
        fetchRecentActivity(8),
      ]);

      if (trendRes.success && trendRes.data) {
        setTrendData(trendRes.data.trend || []);
        setTrendHasData(trendRes.data.hasData);
        setTotalTrendRevenue(trendRes.data.totalRevenue || 0);
        setTotalTrendExpenses(trendRes.data.totalExpenses || 0);
        setTotalTrendProfit(trendRes.data.totalProfit || 0);
      } else {
        computeFallbackData();
      }

      if (cfRes.success && cfRes.data) {
        setCashFlowData(cfRes.data.cashFlow || []);
        setCashFlowHasData(cfRes.data.hasData);
        setTotalReceived(cfRes.data.totalReceived || 0);
        setTotalPaid(cfRes.data.totalPaid || 0);
      }

      if (agingRes.success && agingRes.data) {
        setAgingBuckets(agingRes.data.buckets || []);
        setTotalAgingOutstanding(agingRes.data.totalOutstanding || 0);
        setAgingInvoiceCount(agingRes.data.invoiceCount || 0);
        setAgingHasData(agingRes.data.hasData);
      }

      if (budgetRes.success && budgetRes.data) {
        setBudgetItems(budgetRes.data.budgets || []);
        setBudgetAchievedCount(budgetRes.data.achievedCount || 0);
        setBudgetTotalCount(budgetRes.data.budgetCount || 0);
        setBudgetCommittedCount(budgetRes.data.committedCount || 0);
        setBudgetHasData(budgetRes.data.hasData);
      }

      if (debtorsRes.success && debtorsRes.data) {
        setDebtors(debtorsRes.data.debtors || []);
        setDebtorsTotalOutstanding(debtorsRes.data.totalOutstanding || 0);
        setDebtorsHasData(debtorsRes.data.hasData);
      }

      if (activityRes.success && activityRes.data) {
        setRecentActivities(activityRes.data.activities || []);
        setActivityHasData(activityRes.data.hasData);
      }
    } catch (e) {
      computeFallbackData();
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, customStartDate, customEndDate, computeFallbackData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Compute Metrics for top stat tiles
  const totalReceivables = invoices
    .filter((inv) => inv.status !== 'Draft' && inv.status !== 'Cancelled')
    .reduce((s, inv) => s + inv.amountDue, 0);

  const totalPayables = bills
    .filter((b) => b.status !== 'Draft' && b.status !== 'Cancelled')
    .reduce((s, b) => s + b.amountDue, 0);

  const bankBalance = accounts.find((a) => a.type === 'Bank' || a.name.toLowerCase().includes('bank'))?.balance ?? 0;
  const cashBalance = accounts.find((a) => a.type === 'Cash' || a.name.toLowerCase().includes('cash'))?.balance ?? 0;
  const totalLiquidCash = bankBalance + cashBalance;

  // Filter Sales Panel Invoices
  const filteredSalesInvoices = invoices.filter(
    (inv) => salesTab === 'All' || inv.status === salesTab
  );

  // Filter Purchase Panel Bills
  const filteredPurchaseBills = bills.filter(
    (b) => purchaseTab === 'All' || b.status === purchaseTab
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Dashboard Top Nav: Sales | Purchase | Account | Report */}
      <AccountantNav currentRoute="/dashboard" onNavigate={onNavigate} />

      {/* Header with Date Filter Controls */}
      <div className="content-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Executive Accounting Command Center</h1>
          <p className="page-subtitle">
            Unified financial control: Real-time ledger, sales receivables, purchase payables, and analytical budgets
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            onClick={() => onNavigate('/reports/balance-sheet')}
            leftIcon={<Scale size={15} strokeWidth={1.75} />}
          >
            Balance Sheet
          </Button>
          <Button
            variant="primary"
            onClick={() => onNavigate('/sales/invoices')}
            leftIcon={<Plus size={16} strokeWidth={2.2} />}
          >
            New Invoice
          </Button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div
        className="card-panel"
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Financial Visualization Period:
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {(
            [
              { id: '30d', label: 'Last 30 Days' },
              { id: '6m', label: 'Last 6 Months' },
              { id: 'fy', label: 'This Financial Year' },
              { id: 'custom', label: 'Custom Range' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`auth-tab-btn ${selectedPeriod === filter.id ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(filter.id)}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              {filter.label}
            </button>
          ))}

          {selectedPeriod === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
              <input
                type="date"
                className="form-input"
                style={{ padding: '4px 8px', fontSize: '12px', height: '32px' }}
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>to</span>
              <input
                type="date"
                className="form-input"
                style={{ padding: '4px 8px', fontSize: '12px', height: '32px' }}
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          )}

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={loadDashboardData}
            title="Refresh dashboard metrics"
            style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Top Stat Tiles */}
      <div className="stat-grid">
        <div className="stat-card" onClick={() => onNavigate('/sales/invoices')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-badge teal">
            <IndianRupee size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">₹{totalReceivables.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="stat-label">Outstanding Receivables (Debtors)</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('/purchase/bills')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-badge amber">
            <Clock size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">₹{totalPayables.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="stat-label">Outstanding Payables (Creditors)</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('/accounts')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-badge teal">
            <TrendingUp size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">₹{totalLiquidCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="stat-label">Total Liquid Cash & Bank Position</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('/budgets')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-badge purple">
            <Target size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="stat-number">{budgetTotalCount} Active</div>
            <div className="stat-label">Analytical Cost Budgets</div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DYNAMIC VISUALIZATIONS SECTION (Strict 8-4 / 6-6 / 6-6 Grid Layout)
          ========================================================================= */}

      {/* ROW 1: Revenue vs Expenses (8 Columns) | Budget Utilization (4 Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '20px',
        }}
      >
        <div style={{ gridColumn: 'span 8' }}>
          <FinancialTrendChart
            data={trendData}
            hasData={trendHasData}
            totalRevenue={totalTrendRevenue}
            totalExpenses={totalTrendExpenses}
            totalProfit={totalTrendProfit}
            loading={loading}
          />
        </div>

        <div style={{ gridColumn: 'span 4' }}>
          <BudgetUtilizationWidget
            budgets={budgetItems}
            achievedCount={budgetAchievedCount}
            budgetCount={budgetTotalCount}
            committedCount={budgetCommittedCount}
            hasData={budgetHasData}
            loading={loading}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      {/* ROW 2: Receivables Aging (6 Columns) | Cash In vs Cash Out (6 Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '20px',
        }}
      >
        <div style={{ gridColumn: 'span 6' }}>
          <ReceivablesAgingChart
            buckets={agingBuckets}
            totalOutstanding={totalAgingOutstanding}
            invoiceCount={agingInvoiceCount}
            hasData={agingHasData}
            loading={loading}
            onNavigate={onNavigate}
          />
        </div>

        <div style={{ gridColumn: 'span 6' }}>
          <CashFlowBarChart
            data={cashFlowData}
            hasData={cashFlowHasData}
            totalReceived={totalReceived}
            totalPaid={totalPaid}
            loading={loading}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      {/* ROW 3: Top Outstanding Customers (6 Columns) | Recent Financial Activity (6 Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '20px',
        }}
      >
        <div style={{ gridColumn: 'span 6' }}>
          <TopDebtorsRanking
            debtors={debtors}
            totalOutstanding={debtorsTotalOutstanding}
            hasData={debtorsHasData}
            loading={loading}
            onNavigate={onNavigate}
          />
        </div>

        <div style={{ gridColumn: 'span 6' }}>
          <RecentActivityFeed
            activities={recentActivities}
            hasData={activityHasData}
            loading={loading}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      {/* =========================================================================
          OPERATIONAL PANELS: Sales, Purchase, Ledger & Report Hubs
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Card 1: Sales Panel */}
        <div className="card-panel">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={18} style={{ color: 'var(--color-primary)' }} />
              <h2 className="card-title">Sales</h2>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('/sales/invoices')}
              leftIcon={<Plus size={14} />}
            >
              New
            </Button>
          </div>

          <div className="auth-tabs" style={{ width: '100%' }}>
            {(['All', 'Confirmed', 'Draft'] as const).map((tab) => {
              const count = invoices.filter((inv) => tab === 'All' || inv.status === tab).length;
              return (
                <button
                  key={tab}
                  type="button"
                  className={`auth-tab-btn ${salesTab === tab ? 'active' : ''}`}
                  onClick={() => setSalesTab(tab)}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {filteredSalesInvoices.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No customer invoices found in {salesTab} tab.
              </div>
            ) : (
              filteredSalesInvoices.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => onNavigate('/sales/invoices')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary)' }}>{inv.invoiceNumber}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{inv.partnerName} • {inv.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>₹{inv.total.toLocaleString()}</div>
                    <StatusBadge status={inv.status === 'Paid' ? 'paid' : inv.status === 'Confirmed' ? 'pending' : 'neutral'} label={inv.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 2: Purchase Panel */}
        <div className="card-panel">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} style={{ color: 'var(--color-warning-text)' }} />
              <h2 className="card-title">Purchase</h2>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('/purchase/bills')}
              leftIcon={<Plus size={14} />}
            >
              New
            </Button>
          </div>

          <div className="auth-tabs" style={{ width: '100%' }}>
            {(['All', 'Confirmed', 'Draft'] as const).map((tab) => {
              const count = bills.filter((b) => tab === 'All' || b.status === tab).length;
              return (
                <button
                  key={tab}
                  type="button"
                  className={`auth-tab-btn ${purchaseTab === tab ? 'active' : ''}`}
                  onClick={() => setPurchaseTab(tab)}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {filteredPurchaseBills.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No vendor bills found in {purchaseTab} tab.
              </div>
            ) : (
              filteredPurchaseBills.map((bill) => (
                <div
                  key={bill.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => onNavigate('/purchase/bills')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary)' }}>{bill.billNumber}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{bill.partnerName} • {bill.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>₹{bill.total.toLocaleString()}</div>
                    <StatusBadge status={bill.status === 'Paid' ? 'paid' : bill.status === 'Confirmed' ? 'due' : 'neutral'} label={bill.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 3: Account & Ledger Hub */}
        <div className="card-panel">
          <div className="card-header">
            <h2 className="card-title">Account & Ledger Modules</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button type="button" className="sidebar-item" onClick={() => onNavigate('/contacts')}>
              <Users size={16} /> <span>Contacts / CRM</span>
            </button>
            <button type="button" className="sidebar-item" onClick={() => onNavigate('/products')}>
              <Package size={16} /> <span>Products Catalog</span>
            </button>
            <button type="button" className="sidebar-item" onClick={() => onNavigate('/accounts')}>
              <Receipt size={16} /> <span>Chart of Accounts</span>
            </button>
            <button type="button" className="sidebar-item" onClick={() => onNavigate('/journals')}>
              <BookOpen size={16} /> <span>Journals</span>
            </button>
            <button type="button" className="sidebar-item" onClick={() => onNavigate('/journal-entries')}>
              <FileSpreadsheet size={16} /> <span>Journal Entries</span>
            </button>
            <button type="button" className="sidebar-item" onClick={() => onNavigate('/budgets')}>
              <Target size={16} /> <span>Analytical Budgets</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
