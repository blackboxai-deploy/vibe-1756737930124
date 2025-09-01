import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const clientCount = await db.client.count();

  const invoices = await db.invoice.findMany({
    include: { client: true },
  });

  const now = new Date();
  const unpaidInvoices = invoices.filter(
    (inv) => inv.status === "pending" || (inv.status === "overdue" && new Date(inv.dueDate) < now)
  );
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");
  const overdueInvoices = invoices.filter(
    (inv) => inv.status === "pending" && new Date(inv.dueDate) < now
  );

  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{clientCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unpaid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalUnpaid.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalPaid.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overdue Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overdueInvoices.length}</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Invoices</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Client</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 5).map((invoice) => (
                <tr key={invoice.id} className="border-b">
                  <td className="p-2">{invoice.client.name}</td>
                  <td className="p-2">${invoice.total.toFixed(2)}</td>
                  <td className="p-2">{invoice.status}</td>
                  <td className="p-2">{format(new Date(invoice.dueDate), "PPP")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}