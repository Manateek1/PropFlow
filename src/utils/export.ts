import { Payment } from '../types';

export function exportPaymentsCsv(payments: Payment[]) {
  const header = [
    'Tenant',
    'Unit',
    'Month',
    'Due Date',
    'Payment Date',
    'Amount Due',
    'Amount Paid',
    'Status',
    'Method',
  ];

  const rows = payments.map((payment) => [
    payment.tenantName,
    payment.unitNumber,
    payment.month,
    payment.dueDate,
    payment.paymentDate ?? '',
    payment.amountDue.toString(),
    payment.amountPaid.toString(),
    payment.status,
    payment.method,
  ]);

  const content = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = 'propflow-payments.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}
