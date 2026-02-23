import { format } from 'date-fns';

export function generateInvoiceHTML(invoiceData, globalData) {
    const recipient = globalData.recipients.find(r => r.id === invoiceData.recipientId);
    const account = globalData.issuer.accounts.find(a => a.id === invoiceData.accountId);
    const items = invoiceData.items;

    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const iva = items.reduce((acc, item) => {
        const itemTax = item.tax || item.taxValue || 0;
        return acc + (item.quantity * item.price * (itemTax / 100));
    }, 0);
    const irpfRate = globalData.issuer.irpf || 0;
    const irpf = subtotal * (irpfRate / 100);
    const total = subtotal + iva - irpf;

    const itemsRows = items.map(item => `
    <tr>
      <td></td>
      <td style="text-align:left;">${item.concept}</td>
      <td class="text-right">${item.quantity}</td>
      <td class="text-right">${item.price.toFixed(2)}€</td>
      <td class="text-right">${(item.quantity * item.price).toFixed(2)}€</td>
      <td class="text-right"></td>
      <td class="text-right">${(item.quantity * item.price).toFixed(2)}€</td>
    </tr>
  `).join('');

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Factura ${invoiceData.number}</title>
    <style>
        @media print { @page { size: A4; margin: 0; } body { -webkit-print-color-adjust: exact; margin: 0; } }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #000; padding: 20px; }
        .invoice-box { max-width: 800px; background: #fff; margin: 0 auto; padding: 40px; border: 1px solid #eee; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        :root { --bg-grey: #f2f2f2; --header-blue: #6a6aff; --navy-blue: #000066; --light-blue: #e6e6ff; }
        .sender-box { width: 48%; background: var(--bg-grey); padding: 15px; margin-bottom: 20px; }
        .sender-name { font-weight: bold; font-size: 13px; }
        .client-box { margin-bottom: 20px; }
        .client-name { font-weight: bold; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
        th { color: white; background: var(--header-blue); padding: 5px; }
        .doc-table th { background: var(--header-blue); }
        .doc-table td { border-bottom: 2px solid var(--navy-blue); text-align: center; padding: 8px; font-weight: bold; }
        .items-table th { background: var(--navy-blue); }
        .items-table td { background: var(--light-blue); padding: 8px; }
        .tax-table th { background: var(--navy-blue); font-size: 9px; }
        .tax-table td { background: #f9f9f9; text-align: right; height: 25px; border: 1px solid var(--navy-blue); }
        .total-container { background: #e0e0e0; display: flex; justify-content: flex-end; padding: 10px; border: 1px solid var(--navy-blue); }
        .total-label { font-weight: bold; font-size: 14px; }
        .total-amount { font-weight: bold; font-size: 14px; margin-left: 20px; }
        .footer-table th { background: var(--navy-blue); }
        .footer-table td { border: 1px solid #ccc; padding: 10px; }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="sender-box">
            <span class="sender-name">${globalData.issuer.nombre}</span><br>
            ${globalData.issuer.nif}<br>
            ${globalData.issuer.direccion}<br>
            ${globalData.issuer.cp} ${globalData.issuer.ciudad}
        </div>
        <div class="client-box">
            <span class="client-name uppercase">${recipient?.name}</span><br>
            ${recipient?.cif}<br>
            ${recipient?.address}
        </div>
        <table>
            <thead><tr><th>DOCUMENTO</th><th>NÚMERO</th><th>FECHA</th></tr></thead>
            <tbody><tr><td>Factura</td><td>${invoiceData.number}</td><td>${invoiceData.date}</td></tr></tbody>
        </table>
        <table class="items-table">
            <thead><tr><th>#</th><th>DESCRIPCIÓN</th><th>CANT</th><th>PRECIO</th><th>SUBTOTAL</th><th>DTO.</th><th>TOTAL</th></tr></thead>
            <tbody>${itemsRows}</tbody>
        </table>
        <table class="tax-table">
            <thead><tr><th>BASE</th><th>I.V.A.</th><th>I.R.P.F.</th><th>TOTAL</th></tr></thead>
            <tbody><tr><td>${subtotal.toFixed(2)}€</td><td>${iva.toFixed(2)}€</td><td>-${irpf.toFixed(2)}€</td><td>${total.toFixed(2)}€</td></tr></tbody>
        </table>
        <div class="total-container">
            <span class="total-label">TOTAL:</span>
            <span class="total-amount">${total.toFixed(2)}€</span>
        </div>
        <table class="footer-table" style="margin-top:20px;">
            <thead><tr><th>Vencimiento</th><th>Cuenta Bancaria</th></tr></thead>
            <tbody><tr><td>${invoiceData.date}</td><td>${account?.iban}</td></tr></tbody>
        </table>
    </div>
</body>
</html>
  `;
}
