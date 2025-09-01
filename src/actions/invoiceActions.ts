import 'server-only';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const InvoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(1),
  price: z.number().min(0),
});

const CreateInvoiceSchema = z.object({
  clientId: z.string().min(1),
  items: z.array(InvoiceItemSchema),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
  status: z.enum(['pending', 'paid', 'overdue']).optional().default('pending'),
});

const UpdateInvoiceSchema = CreateInvoiceSchema.partial().extend({
  id: z.string().min(1),
});

export async function createInvoice(data: z.infer<typeof CreateInvoiceSchema>) {
  const validated = CreateInvoiceSchema.parse(data);

  const total = validated.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const invoice = await prisma.invoice.create({
    data: {
      clientId: validated.clientId,
      items: validated.items,
      total,
      status: validated.status,
      dueDate: new Date(validated.dueDate),
    },
  });

  revalidatePath('/invoices');
  revalidatePath('/');

  return invoice;
}

export async function getInvoices() {
  return prisma.invoice.findMany({
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: { client: true },
  });
}

export async function updateInvoice(data: z.infer<typeof UpdateInvoiceSchema>) {
  const validated = UpdateInvoiceSchema.parse(data);

  const total = validated.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) ?? undefined;

  const invoice = await prisma.invoice.update({
    where: { id: validated.id },
    data: {
      clientId: validated.clientId,
      items: validated.items,
      total,
      status: validated.status,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
    },
  });

  revalidatePath('/invoices');
  revalidatePath(`/invoices/${validated.id}`);
  revalidatePath('/');

  return invoice;
}

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({ where: { id } });

  revalidatePath('/invoices');
  revalidatePath('/');
}

export async function updateInvoiceStatus(id: string, status: 'pending' | 'paid' | 'overdue') {
  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status },
  });

  revalidatePath('/invoices');
  revalidatePath(`/invoices/${id}`);
  revalidatePath('/');

  return invoice;
}