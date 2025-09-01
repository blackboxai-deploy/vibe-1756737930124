import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const prisma = new PrismaClient();

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export async function createClient(data: z.infer<typeof clientSchema>) {
  'use server';
  try {
    const validatedData = clientSchema.parse(data);
    const client = await prisma.client.create({
      data: {
        ...validatedData,
        createdAt: new Date(),
      },
    });
    revalidatePath('/clients');
    return { success: true, client };
  } catch (error) {
    console.error('Error creating client:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getClients() {
  'use server';
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, clients };
  } catch (error) {
    console.error('Error fetching clients:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getClientById(id: number) {
  'use server';
  try {
    const client = await prisma.client.findUnique({
      where: { id },
    });
    if (!client) {
      return { success: false, error: 'Client not found' };
    }
    return { success: true, client };
  } catch (error) {
    console.error('Error fetching client:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateClient(id: number, data: Partial<z.infer<typeof clientSchema>>) {
  'use server';
  try {
    const validatedData = clientSchema.partial().parse(data);
    const client = await prisma.client.update({
      where: { id },
      data: validatedData,
    });
    revalidatePath('/clients');
    revalidatePath(`/clients/${id}`);
    return { success: true, client };
  } catch (error) {
    console.error('Error updating client:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteClient(id: number) {
  'use server';
  try {
    await prisma.client.delete({
      where: { id },
    });
    revalidatePath('/clients');
    return { success: true };
  } catch (error) {
    console.error('Error deleting client:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}