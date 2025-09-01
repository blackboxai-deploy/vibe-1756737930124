import { db } from '@/lib/db';
import InvoiceForm from '@/components/InvoiceForm';

export default async function NewInvoicePage() {
  const clients = await db.client.findMany({
    select: { id: true, name: true },
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create New Invoice</h1>
      <InvoiceForm clients={clients} />
    </div>
  );
}