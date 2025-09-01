import { notFound } from 'next/navigation';

import { prisma } from '@/lib/db';
import ClientForm from '@/components/ClientForm';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ClientPage({ params }: { params: { id: string } }) {
  const clientId = parseInt(params.id, 10);
  if (isNaN(clientId)) {
    notFound();
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit Client</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm client={client} />
        </CardContent>
      </Card>
    </div>
  );
}