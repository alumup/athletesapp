import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { DocumentIcon } from "@heroicons/react/24/outline";

interface CreateRosterInvoiceButtonProps {
  rosterId: string;
  athleteName: string;
  teamName: string;
  amount: number;
  guardianEmail: string;
  accountId: string;
  stripeAccountId: string;
  person_id: string;
}

export function CreateRosterInvoiceButton({
  rosterId,
  athleteName,
  teamName,
  amount,
  guardianEmail,
  accountId,
  stripeAccountId,
  person_id
}: CreateRosterInvoiceButtonProps) {
  const { refresh } = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreateInvoice = async () => {
    try {
      setLoading(true);
      
      // First, ensure we have a customer ID for the guardian
      console.log('Fetching customer ID...');
      const customerResponse = await fetch('/api/stripe-customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: guardianEmail,
          accountId
        })
      });
      
      const customerData = await customerResponse.json();
      console.log('Customer response:', customerData);

      if (!customerResponse.ok) {
        throw new Error(customerData.error || 'Failed to create/get customer');
      }
      
      const { customerId, error: customerError } = customerData;
      
      if (customerError || !customerId) {
        throw new Error(customerError || 'No customer ID returned');
      }

      // Create invoice using single endpoint
      const invoiceResponse = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId,
          rosterId,
          athleteName,
          teamName,
          amount,
          accountId,
          stripeAccountId,
          person_id
        })
      });

      const invoiceData = await invoiceResponse.json();
      
      if (!invoiceResponse.ok) {
        throw new Error(invoiceData.error || 'Failed to create invoice');
      }

      toast.success('Invoice created successfully');
      refresh();

    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateInvoice}
      disabled={loading}
      variant="outline"
      className="text-green-600 hover:text-green-700 w-full"
    >
      <DocumentIcon className="h-4 w-4 mr-2" />
      {loading ? 'Creating...' : 'Create Invoice'}
    </Button>
  );
}