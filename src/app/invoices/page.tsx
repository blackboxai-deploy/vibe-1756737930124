import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getInvoices } from '@/actions/invoiceActions';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/signin');
  }

  const status = typeof searchParams.status === 'string' ? searchParams.status : 'all';
  const invoices = await getInvoices({ status });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button asChild>
          <Link href="/invoices/new">Create New Invoice</Link>
        </Button>
      </div>

      <div className="flex space-x-4 mb-6">
        <Button
          variant={status === 'all' ? 'default' : 'outline'}
          asChild
        >
          <Link href="/invoices?status=all">All</Link>
        </Button>
        <Button
          variant={status === 'pending' ? 'default' : 'outline'}
          asChild
        >
          <Link href="/invoices?status=pending">Pending</Link>
        </Button>
        <Button
          variant={status === 'paid' ? 'default' : 'outline'}
          asChild
        >
          <Link href="/invoices?status=paid">Paid</Link>
        </Button>
        <Button
          variant={status === 'overdue' ? 'default' : 'outline'}
          asChild
        >
          <Link href="/invoices?status=overdue">Overdue</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.id}</TableCell>
                  <TableCell>{invoice.client.name}</TableCell>
                  <TableCell>${invoice.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === 'paid'
                          ? 'default'
                          : invoice.status === 'overdue'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(invoice.dueDate), 'PPP')}</TableCell>
                  <TableCell>
                    <Button variant="link" asChild>
                      <Link href={`/invoices/${invoice.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}