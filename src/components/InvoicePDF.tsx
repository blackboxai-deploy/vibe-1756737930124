'use client'

import { Button } from '@/components/ui/button'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { Invoice, Client } from '@/lib/types' // Assuming types are defined in lib/types.ts

interface InvoicePDFProps {
  invoice: Invoice
  client: Client
}

export function InvoicePDF({ invoice, client }: InvoicePDFProps) {
  const generatePDF = () => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(18)
    doc.text('Invoice', 14, 22)
    doc.setFontSize(11)
    doc.text(`Invoice #${invoice.id}`, 14, 30)
    doc.text(`Date: ${format(new Date(invoice.createdAt), 'PPP')}`, 14, 38)
    doc.text(`Due: ${format(new Date(invoice.dueDate), 'PPP')}`, 14, 46)

    // Client Info
    doc.setFontSize(12)
    doc.text('Bill To:', 14, 60)
    doc.setFontSize(11)
    doc.text(client.name, 14, 68)
    doc.text(client.email, 14, 76)
    doc.text(client.address, 14, 84)
    if (client.phone) doc.text(client.phone, 14, 92)

    // Items Table
    autoTable(doc, {
      startY: 100,
      head: [['Description', 'Quantity', 'Price', 'Total']],
      body: invoice.items.map(item => [
        item.description,
        item.quantity.toString(),
        `$${item.price.toFixed(2)}`,
        `$${(item.quantity * item.price).toFixed(2)}`
      ]),
      foot: [['', '', 'Total', `$${invoice.total.toFixed(2)}`]],
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0] },
    })

    // Status
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 14, finalY)

    // Save PDF
    doc.save(`invoice_${invoice.id}.pdf`)
  }

  return (
    <Button onClick={generatePDF}>
      Download PDF
    </Button>
  )
}