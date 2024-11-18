"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface CreateInvoiceModalProps {
  person: any
  account: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateInvoiceModal({ person, account, open, onOpenChange }: CreateInvoiceModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate amount
      const numericAmount = parseFloat(amount)
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error("Please enter a valid amount")
      }

      // First get/create Stripe customer
      const customerResponse = await fetch("/api/stripe-customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: person.email || person.primary_contacts[0].email,
          accountId: account.id
        })
      })

      if (!customerResponse.ok) {
        throw new Error("Failed to create/get customer")
      }

      const { customerId } = await customerResponse.json()

      // Create invoice with custom amount and description
      const invoiceResponse = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          amount: numericAmount,
          description,
          accountId: account.id,
          stripeAccountId: account.stripe_id,
          person_id: person.id,
          isCustomInvoice: true
        })
      })

      if (!invoiceResponse.ok) {
        const error = await invoiceResponse.json()
        throw new Error(error.message || "Failed to create invoice")
      }

      toast.success("Invoice created and sent successfully")
      onOpenChange(false)
      setAmount("")
      setDescription("")
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to create invoice")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Team Jersey"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount ($)</label>
            <Input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
