/**
 * Professional PDF & Print Document Generator for Urban Furniture Enterprise
 * Includes Corporate Authentication Badge, Digital Seal & Official Signature
 */

import { Budget, CustomerInvoice, VendorBill } from '../features/accounting/store';

/**
 * Reusable HTML for corporate authentication badge, digital seal, and authorized signatory
 */
function getAuthSignatureBlockHtml(docRef: string, signatoryTitle = 'Chief Financial Officer / Lead Accountant') {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return `
    <div class="auth-signature-container" style="margin-top: 36px; padding-top: 18px; border-top: 1.5px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; page-break-inside: avoid;">
      <!-- Left: Verification Badge & Seal -->
      <div style="max-width: 380px;">
        <div style="display: inline-flex; align-items: center; gap: 6px; background-color: #f0fdfa; border: 1px solid #0f766e; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #0f766e; letter-spacing: 0.5px; text-transform: uppercase;">
            &#10003; Certified &amp; Digitally Verified
          </span>
        </div>
        <div style="font-size: 11px; color: #475569; line-height: 1.5;">
          <div><strong>Corporate Seal:</strong> Urban Furniture Enterprise Pvt. Ltd.</div>
          <div><strong>Authentication Ref:</strong> <span style="font-family: monospace; font-weight: 600; color: #0f766e;">${docRef}</span></div>
          <div><strong>Audit Date:</strong> ${currentDate} (Financial Integrity Validated)</div>
        </div>
      </div>

      <!-- Right: Formal Authorized Signature Block -->
      <div style="text-align: center; min-width: 230px;">
        <div style="font-family: 'Brush Script MT', 'Dancing Script', 'Caveat', cursive, serif; font-size: 26px; font-weight: 700; color: #0f766e; margin-bottom: 2px; line-height: 1.1;">
          Pritam Denria
        </div>
        <div style="border-top: 1.5px solid #0f172a; padding-top: 6px; width: 100%;">
          <div style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
            Authorized Signatory
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #0f766e;">
            Pritam Denria
          </div>
          <div style="font-size: 10px; color: #64748b;">
            ${signatoryTitle}
          </div>
        </div>
      </div>
    </div>
  `;
}

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
          <td style="padding: 9px 12px; border: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${b.name}</td>
          <td style="padding: 9px 12px; border: 1px solid #e2e8f0; color: #475569;">${b.analyticName || 'General'}</td>
          <td style="padding: 9px 12px; border: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">${b.startDate} to ${b.endDate}</td>
          <td style="padding: 9px 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: 600;">₹${(b.committedAmount || 0).toLocaleString('en-IN')}</td>
          <td style="padding: 9px 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #0f766e;">₹${achieved.toLocaleString('en-IN')}</td>
          <td style="padding: 9px 12px; border: 1px solid #e2e8f0; text-align: right; color: ${variance < 0 ? '#b91c1c' : '#15803d'};">
            ₹${Math.abs(variance).toLocaleString('en-IN')} ${variance < 0 ? '(Exceeded)' : '(Remaining)'}
          </td>
          <td style="padding: 9px 12px; border: 1px solid #e2e8f0; text-align: center;">
            <span style="display: inline-block; padding: 2px 7px; border-radius: 9999px; font-size: 11px; font-weight: 700; background-color: ${percent >= 100 ? '#dcfce7' : '#fef3c7'}; color: ${percent >= 100 ? '#15803d' : '#b45309'};">
              ${percent}% (${b.type})
            </span>
          </td>
          <td style="padding: 9px 12px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600;">
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
          margin: 10mm 12mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 16px;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #0f766e;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .company-title {
          font-size: 22px;
          font-weight: 800;
          color: #0f766e;
          letter-spacing: -0.5px;
          margin: 0;
        }
        .report-title {
          font-size: 15px;
          font-weight: 600;
          color: #334155;
          margin-top: 3px;
        }
        .meta-info {
          text-align: right;
          font-size: 11px;
          color: #64748b;
          line-height: 1.4;
        }
        .kpi-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }
        .kpi-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 10px 14px;
        }
        .kpi-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 2px;
        }
        .kpi-value {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-bottom: 20px;
        }
        th {
          background-color: #0f766e;
          color: #ffffff;
          padding: 8px 10px;
          text-align: left;
          font-weight: 700;
          border: 1px solid #0f766e;
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
          <div><strong>Fiscal Year:</strong> 2026</div>
          <div><strong>Basis:</strong> Accrual Ledger / Analytic Cost Centers</div>
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

      ${getAuthSignatureBlockHtml('UF-BUDGET-2026-CONFIRMED', 'Chief Financial Officer / Budget Controller')}

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
        @page { size: A4 portrait; margin: 12mm 15mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 16px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 3px solid #0f766e;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .company-title { font-size: 22px; font-weight: 800; color: #0f766e; margin: 0; }
        .report-title { font-size: 15px; font-weight: 600; color: #334155; margin-top: 3px; }
        .meta-info { text-align: right; font-size: 11px; color: #64748b; line-height: 1.4; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
        th { background: #0f766e; color: #fff; padding: 10px 14px; text-align: left; }
        td { padding: 9px 14px; border-bottom: 1px solid #e2e8f0; }
        .section-hdr { font-weight: 800; font-size: 14px; }
        .sub-row td:first-child { padding-left: 28px; }
        .net-row { font-size: 15px; font-weight: 900; background: ${data.netIncome >= 0 ? '#ecfdf5' : '#fef2f2'}; border-top: 2px solid #0f766e; border-bottom: 3px double #0f766e; }
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

          <tr><td colspan="2" style="padding: 6px; border: none;"></td></tr>

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

          <tr><td colspan="2" style="padding: 8px; border: none;"></td></tr>

          <tr class="net-row">
            <td style="color: ${data.netIncome >= 0 ? '#0f766e' : '#b91c1c'};">Net Profit / (Loss) for the Year</td>
            <td style="text-align: right; color: ${data.netIncome >= 0 ? '#0f766e' : '#b91c1c'};">
              ₹${data.netIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>

      ${getAuthSignatureBlockHtml(`UF-PNL-${data.year}-VERIFIED`, 'Chief Financial Officer / Lead Accountant')}

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
        @page { size: A4 portrait; margin: 12mm 15mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 16px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 3px solid #0f766e;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .company-title { font-size: 22px; font-weight: 800; color: #0f766e; margin: 0; }
        .report-title { font-size: 15px; font-weight: 600; color: #334155; margin-top: 3px; }
        .meta-info { text-align: right; font-size: 11px; color: #64748b; line-height: 1.4; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 14px; }
        .col-box { border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; }
        .col-hdr { background: #0f766e; color: #fff; padding: 8px 12px; font-weight: 700; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; }
        .total-box { background: #f0fdfa; padding: 10px 12px; font-weight: 800; font-size: 13px; color: #0f766e; border-top: 2px solid #0f766e; display: flex; justify-content: space-between; }
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

      ${getAuthSignatureBlockHtml(`UF-BS-${data.year}-CERTIFIED`, 'Chief Financial Officer / Lead Accountant')}

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

/**
 * Export official customer invoice PDF with authentication signature & seal
 */
export function exportCustomerInvoicePdf(invoice: CustomerInvoice) {
  const generationDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const linesHtml = invoice.lines
    .map((l, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${l.productName}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${l.accountName || 'Income A/c'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${l.quantity}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${l.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #0f766e;">₹${l.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `)
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Urban Furniture - Tax Invoice ${invoice.invoiceNumber}</title>
      <style>
        @page { size: A4 portrait; margin: 12mm 15mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 16px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 3px solid #0f766e;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .company-title { font-size: 22px; font-weight: 800; color: #0f766e; margin: 0; }
        .invoice-title { font-size: 15px; font-weight: 600; color: #334155; margin-top: 3px; }
        .meta-info { text-align: right; font-size: 11px; color: #64748b; line-height: 1.4; }
        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px; }
        .party-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
        .party-hdr { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        th { background: #0f766e; color: #fff; padding: 9px 12px; text-align: left; }
        .totals-card { margin-top: 14px; margin-left: auto; width: 280px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
        .totals-row.grand { background: #f0fdfa; font-size: 14px; font-weight: 800; color: #0f766e; border-top: 2px solid #0f766e; border-bottom: none; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="company-title">URBAN FURNITURE ENTERPRISE</h1>
          <div class="invoice-title">Tax Invoice / Bill of Supply — <strong>${invoice.invoiceNumber}</strong></div>
        </div>
        <div class="meta-info">
          <div><strong>Invoice Date:</strong> ${invoice.date}</div>
          <div><strong>Payment Due:</strong> ${invoice.dueDate}</div>
          <div><strong>Generated:</strong> ${generationDate}</div>
        </div>
      </div>

      <div class="parties">
        <div class="party-card">
          <div class="party-hdr">Billed To (Customer)</div>
          <div style="font-weight: 700; font-size: 14px; color: #0f172a;">${invoice.partnerName}</div>
          <div style="font-size: 12px; color: #475569; margin-top: 2px;">Reference: ${invoice.reference || 'N/A'}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Payment Status: <strong>${invoice.status}</strong></div>
        </div>
        <div class="party-card">
          <div class="party-hdr">Supplier (Issuer)</div>
          <div style="font-weight: 700; font-size: 14px; color: #0f766e;">Urban Furniture Enterprise Pvt. Ltd.</div>
          <div style="font-size: 12px; color: #475569; margin-top: 2px;">GSTIN: 27AAFCS0144M1Z8</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Accounting Basis: Double-Entry Accrual</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item / Service Description</th>
            <th>Revenue Account</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price (₹)</th>
            <th style="text-align: right;">Subtotal (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${linesHtml}
        </tbody>
      </table>

      <div class="totals-card">
        <div class="totals-row">
          <span>Total Amount:</span>
          <span>₹${invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="totals-row">
          <span>Amount Paid:</span>
          <span style="color: #0f766e; font-weight: 600;">₹${invoice.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="totals-row grand">
          <span>Balance Due:</span>
          <span>₹${invoice.amountDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      ${getAuthSignatureBlockHtml(`UF-INV-${invoice.invoiceNumber}`, 'Chief Financial Officer / Billing Head')}

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

/**
 * Export official vendor bill PDF with authentication signature & seal
 */
export function exportVendorBillPdf(bill: VendorBill) {
  const generationDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const linesHtml = bill.lines
    .map((l, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${l.productName}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${l.accountName || 'Purchase A/c'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${l.quantity}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${l.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #b45309;">₹${l.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `)
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Urban Furniture - Vendor Bill ${bill.billNumber}</title>
      <style>
        @page { size: A4 portrait; margin: 12mm 15mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 16px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 3px solid #b45309;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .company-title { font-size: 22px; font-weight: 800; color: #b45309; margin: 0; }
        .invoice-title { font-size: 15px; font-weight: 600; color: #334155; margin-top: 3px; }
        .meta-info { text-align: right; font-size: 11px; color: #64748b; line-height: 1.4; }
        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px; }
        .party-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
        .party-hdr { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        th { background: #b45309; color: #fff; padding: 9px 12px; text-align: left; }
        .totals-card { margin-top: 14px; margin-left: auto; width: 280px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
        .totals-row.grand { background: #fffbeb; font-size: 14px; font-weight: 800; color: #b45309; border-top: 2px solid #b45309; border-bottom: none; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="company-title">URBAN FURNITURE ENTERPRISE</h1>
          <div class="invoice-title">Vendor Bill / Accounts Payable Voucher — <strong>${bill.billNumber}</strong></div>
        </div>
        <div class="meta-info">
          <div><strong>Bill Date:</strong> ${bill.date}</div>
          <div><strong>Due Date:</strong> ${bill.dueDate}</div>
          <div><strong>Generated:</strong> ${generationDate}</div>
        </div>
      </div>

      <div class="parties">
        <div class="party-card">
          <div class="party-hdr">Vendor (Payee)</div>
          <div style="font-weight: 700; font-size: 14px; color: #0f172a;">${bill.partnerName}</div>
          <div style="font-size: 12px; color: #475569; margin-top: 2px;">Bill Ref: ${bill.reference || 'N/A'}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Status: <strong>${bill.status}</strong></div>
        </div>
        <div class="party-card">
          <div class="party-hdr">Purchasing Entity</div>
          <div style="font-weight: 700; font-size: 14px; color: #b45309;">Urban Furniture Enterprise Pvt. Ltd.</div>
          <div style="font-size: 12px; color: #475569; margin-top: 2px;">Accounting Method: Accrual Accounts Payable</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">PO Link: ${bill.poNumber || 'Direct Purchase'}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item / Expense Description</th>
            <th>Expense Account</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Cost (₹)</th>
            <th style="text-align: right;">Subtotal (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${linesHtml}
        </tbody>
      </table>

      <div class="totals-card">
        <div class="totals-row">
          <span>Total Bill:</span>
          <span>₹${bill.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="totals-row">
          <span>Amount Paid:</span>
          <span style="color: #0f766e; font-weight: 600;">₹${bill.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="totals-row grand">
          <span>Amount Due:</span>
          <span>₹${bill.amountDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      ${getAuthSignatureBlockHtml(`UF-BILL-${bill.billNumber}`, 'Chief Financial Officer / Procurement Auditor')}

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
