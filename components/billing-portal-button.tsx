"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleBillingPortal = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to fetch:', '/api/customer-portal');
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.toLowerCase() })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Failed to access billing portal');
      }
      
      const data = await response.json();
      console.log('Success response:', data);
      window.location.href = data.url;
    } catch (error) {
      console.error('Error details:', error);
      toast.error('Failed to access billing portal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="max-w-xs"
      />
      <Button
        variant="outline"
        className="whitespace-nowrap bg-blue-50 hover:bg-blue-100"
        onClick={handleBillingPortal}
        disabled={loading}
      >
        {loading ? (
          "Loading..."
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Billing Portal
          </>
        )}
      </Button>
    </div>
  );
}
