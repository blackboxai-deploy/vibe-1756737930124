import { redirect } from 'next/navigation';
import ClientForm from '@/components/ClientForm';
import { createClient } from '@/actions/clientActions';

export default function NewClientPage() {
  async function handleCreateClient(formData: FormData) {
    'use server';
    // Assuming createClient is a server action that takes formData or parsed data
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
    };
    await createClient(data);
    redirect('/clients');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Add New Client</h1>
        <ClientForm action={handleCreateClient} />
      </div>
    </div>
  );
}