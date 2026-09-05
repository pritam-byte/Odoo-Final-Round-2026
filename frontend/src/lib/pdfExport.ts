/**
 * Professional PDF & Print Document Generator for Urban Furniture Enterprise
 */

import { Budget } from '../features/accounting/store';

export function exportBudgetReportPdf(
  budgets: Budget[],
  getBudgetAchievedAmount: (b: Budget) => number
) {
  const totalCommitted = budgets.reduce((acc, b) => acc + (b.committedAmount || 0), 0);
  const totalAchieved = budgets.reduce((acc, b) => acc + getBudgetAchievedAmount(b), 0);
  const overallPercentage = totalCommitted > 0 ? Math.round((totalAchieved / totalCommitted) * 100) : 0;
  const generationDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const tableRows = budgets
    .map((b, index) => {
      const achieved = getBudgetAchievedAmount(b);
      const percent = b.committedAmount > 0 ? Math.round((achieved / b.committedAmount) * 100) : 0;
      const variance = b.committedAmount - achieved;

      return `
        <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${b.name}</td>
          <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #475569;">${b.analyticName || 'General'}</td>
          <td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">${b.startDate} to ${b.endDate}</td>
          <td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: 600;">₹${(b.committedAmount || 0).toLocaleString('en-IN')}</td>
          <td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #0f766e;">₹${achieved.toLocaleString('en-IN')}</td>
          <td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: right; color: ${variance < 0 ? '#b91c1c' : '#15803d'};">
            ₹${Math.abs(variance).toLocaleString('en-IN')} ${variance < 0 ? '(Exceeded)' : '(Remaining)'}
          </td>
          <td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center;">
            <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background-color: ${percent >= 100 ? '#dcfce7' : '#fef3c7'}; color: ${percent >= 100 ? '#15803d' : '#b45309'};">
              ${percent}% (${b.type})
            </span>
          </td>
          <td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">
            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; background-color: ${b.state === 'Confirmed' ? '#e0f2fe' : '#f1f5f9'}; color: ${b.state === 'Confirmed' ? '#0369a1' : '#475569'};">
              ${b.state}
            </span>
          </td>
        </tr>
      `;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Urban Furniture - Budget Variance Report</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 12mm 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 20px;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #0f766e;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .company-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f766e;
          letter-spacing: -0.5px;
          margin: 0;
        }
        .report-title {
          font-size: 16px;
          font-weight: 600;
          color: #334155;
          margin-top: 4px;
        }
        .meta-info {
          text-align: right;
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
        }
        .kpi-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .kpi-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 18px;
        }
        .kpi-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 4px;
        }
        .kpi-value {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          margin-bottom: 30px;
        }
        th {
          background-color: #0f766e;
          color: #ffffff;
          padding: 10px 12px;
          text-align: left;
          font-weight: 700;
          border: 1px solid #0f766e;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #64748b;
        }
        .sign-box {
          text-align: center;
          width: 180px;
          border-top: 1px dashed #94a3b8;
          padding-top: 8px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="company-title">URBAN FURNITURE ENTERPRISE</h1>
          <div class="report-title">Executive Budget Variance & Performance Statement</div>
        </div>
        <div class="meta-info">
          <div><strong>Generated:</strong> ${generationDate}</div>
          <div><strong>Accounting Year:</strong> 2026</div>
          <div><strong>Basis:</strong> Accrual Ledger / Cost Centers</div>
        </div>
      </div>

      <div class="kpi-container">
        <div class="kpi-card">
          <div class="kpi-label">Total Allocated Budget</div>
          <div class="kpi-value">₹${totalCommitted.toLocaleString('en-IN')}</div>
        </div>
        <div class="kpi-card" style="border-left: 4px solid #0f766e;">
          <div class="kpi-label">Total Actual Realized</div>
          <div class="kpi-value" style="color: #0f766e;">₹${totalAchieved.toLocaleString('en-IN')}</div>
        </div>
        <div class="kpi-card" style="border-left: 4px solid ${overallPercentage >= 100 ? '#15803d' : '#b45309'};">
          <div class="kpi-label">Overall Achievement Ratio</div>
          <div class="kpi-value" style="color: ${overallPercentage >= 100 ? '#15803d' : '#b45309'};">${overallPercentage}%</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Budget Title</th>
            <th>Analytic Cost Center</th>
            <th style="text-align: center;">Validity Period</th>
            <th style="text-align: right;">Committed</th>
            <th style="text-align: right;">Achieved (Actual)</th>
            <th style="text-align: right;">Variance (Diff)</th>
            <th style="text-align: center;">Achievement %</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="footer">
        <div>
          <span>Confidential — Internal Accounting & Audit Document.</span><br/>
          <span>Urban Furniture Financial Reporting System</span>
        </div>
        <div style="display: flex; gap: 40px;">
          <div class="sign-box">
            <strong>Head of Accounts</strong>
          </div>
          <div class="sign-box">
            <strong>Managing Director</strong>
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

export function exportBudgetReportCsv(
  budgets: Budget[],
  getBudgetAchievedAmount: (b: Budget) => number
) {
  const headers = ['Budget Title', 'Analytic Cost Center', 'Period Start', 'Period End', 'Committed Amount (INR)', 'Achieved Amount (INR)', 'Variance (INR)', 'Achievement %', 'Type', 'Status'];
  const rows = budgets.map((b) => {
    const achieved = getBudgetAchievedAmount(b);
    const variance = b.committedAmount - achieved;
    const percent = b.committedAmount > 0 ? Math.round((achieved / b.committedAmount) * 100) : 0;
    return [
      `"${b.name}"`,
      `"${b.analyticName || 'General'}"`,
      `"${b.startDate}"`,
      `"${b.endDate}"`,
      b.committedAmount || 0,
      achieved,
      variance,
      `${percent}%`,
      `"${b.type}"`,
      `"${b.state}"`,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Urban_Furniture_Budget_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportProfitLossPdf(data: {
  year: string;
  totalIncome: number;
  salesIncome: number;
  totalExpenses: number;
  purchaseExpenses: number;
  otherExpenses: number;
  netIncome: number;
}) {
  const generationDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Urban Furniture - Profit and Loss Statement (${data.year})</title>
      <style>
        @page { size: A4 portrait; margin: 15mm 20mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 24px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 3px solid #0f766e;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .company-title { font-size: 24px; font-weight: 800; color: #0f766e; margin: 0; }
        .report-title { font-size: 16px; font-weight: 600; color: #334155; margin-top: 4px; }
        .meta-info { text-align: right; font-size: 12px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
        th { background: #0f766e; color: #fff; padding: 10px 14px; text-align: left; }
        td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; }
        .section-hdr { font-weight: 800; font-size: 14px; }
        .sub-row td:first-child { padding-left: 28px; }
        .net-row { font-size: 15px; font-weight: 900; background: ${data.netIncome >= 0 ? '#ecfdf5' : '#fef2f2'}; border-top: 2px solid #0f766e; border-bottom: 3px double #0f766e; }
        .footer { margin-top: 60px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        .sign-box { text-align: center; width: 180px; border-top: 1px dashed #94a3b8; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="company-title">URBAN FURNITURE ENTERPRISE</h1>
          <div class="report-title">Profit & Loss Performance Statement (${data.year})</div>
        </div>
        <div class="meta-info">
          <div><strong>Generated:</strong> ${generationDate}</div>
          <div><strong>Accounting Period:</strong> 01-Jan-${data.year} to 31-Dec-${data.year}</div>
          <div><strong>Basis:</strong> Accrual Basis</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Account / Category Description</th>
            <th style="text-align: right; width: 200px;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="section-hdr" style="background: #f0fdfa; color: #0f766e;">
            <td>Income</td>
            <td style="text-align: right;">₹${data.totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr class="sub-row">
            <td>Income from Sales (Customer Invoices)</td>
            <td style="text-align: right; font-weight: 600;">₹${data.salesIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>

          <tr><td colspan="2" style="padding: 8px; border: none;"></td></tr>

          <tr class="section-hdr" style="background: #fffbeb; color: #b45309;">
            <td>Expenses</td>
            <td style="text-align: right;">₹${data.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr class="sub-row">
            <td>Purchase Expense (Cost of Goods Sold)</td>
            <td style="text-align: right; font-weight: 600;">₹${data.purchaseExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr class="sub-row">
            <td>Other Operating Expenses</td>
            <td style="text-align: right; font-weight: 600;">₹${data.otherExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>

          <tr><td colspan="2" style="padding: 10px; border: none;"></td></tr>

          <tr class="net-row">
            <td style="color: ${data.netIncome >= 0 ? '#0f766e' : '#b91c1c'};">Net Profit / (Loss) for the Year</td>
            <td style="text-align: right; color: ${data.netIncome >= 0 ? '#0f766e' : '#b91c1c'};">
              ₹${data.netIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <div>
          <span>Urban Furniture Financial Reporting System</span><br/>
          <span>Accrual Standard Double-Entry General Ledger</span>
        </div>
        <div style="display: flex; gap: 40px;">
          <div class="sign-box"><strong>Chief Accountant</strong></div>
          <div class="sign-box"><strong>Managing Director</strong></div>
        </div>
      </div>

      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

export function exportBalanceSheetPdf(data: {
  year: string;
  bankBalance: number;
  cashBalance: number;
  debtorsBalance: number;
  totalAsset: number;
  capitalBalance: number;
  creditorsBalance: number;
  totalLiability: number;
}) {
  const generationDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Urban Furniture - Balance Sheet (${data.year})</title>
      <style>
        @page { size: A4 portrait; margin: 15mm 20mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 24px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 3px solid #0f766e;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .company-title { font-size: 24px; font-weight: 800; color: #0f766e; margin: 0; }
        .report-title { font-size: 16px; font-weight: 600; color: #334155; margin-top: 4px; }
        .meta-info { text-align: right; font-size: 12px; color: #64748b; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
        .col-box { border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
        .col-hdr { background: #0f766e; color: #fff; padding: 10px 14px; font-weight: 700; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
        .total-box { background: #f0fdfa; padding: 12px 14px; font-weight: 800; font-size: 14px; color: #0f766e; border-top: 2px solid #0f766e; display: flex; justify-content: space-between; }
        .footer { margin-top: 60px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        .sign-box { text-align: center; width: 180px; border-top: 1px dashed #94a3b8; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="company-title">URBAN FURNITURE ENTERPRISE</h1>
          <div class="report-title">Statement of Financial Position / Balance Sheet</div>
        </div>
        <div class="meta-info">
          <div><strong>Generated:</strong> ${generationDate}</div>
          <div><strong>As of:</strong> 31-Dec-${data.year}</div>
          <div><strong>Status:</strong> Balanced Double-Entry General Ledger</div>
        </div>
      </div>

      <div class="grid">
        <!-- Assets Column -->
        <div class="col-box">
          <div class="col-hdr">Assets</div>
          <table>
            <tbody>
              <tr>
                <td>Bank Accounts</td>
                <td style="text-align: right; font-weight: 600;">₹${data.bankBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Petty Cash</td>
                <td style="text-align: right; font-weight: 600;">₹${data.cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Debtors (Accounts Receivable)</td>
                <td style="text-align: right; font-weight: 600;">₹${data.debtorsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
          <div class="total-box">
            <span>Total Assets</span>
            <span>₹${data.totalAsset.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <!-- Liabilities & Capital Column -->
        <div class="col-box">
          <div class="col-hdr" style="background: #334155;">Liabilities & Equity</div>
          <table>
            <tbody>
              <tr>
                <td>Shareholder Capital / Reserves</td>
                <td style="text-align: right; font-weight: 600;">₹${data.capitalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Creditors (Accounts Payable)</td>
                <td style="text-align: right; font-weight: 600;">₹${data.creditorsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
          <div class="total-box" style="color: #334155; background: #f8fafc; border-top-color: #334155;">
            <span>Total Liabilities & Capital</span>
            <span>₹${data.totalLiability.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div class="footer">
        <div>
          <span>Urban Furniture Financial Reporting System</span><br/>
          <span>Balanced Accounting Formula: Assets = Liabilities + Capital</span>
        </div>
        <div style="display: flex; gap: 40px;">
          <div class="sign-box"><strong>Chief Accountant</strong></div>
          <div class="sign-box"><strong>Managing Director</strong></div>
        </div>
      </div>

      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
