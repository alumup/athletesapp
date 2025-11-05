"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getAccount } from "@/lib/fetchers/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Fee {
  id: string;
  name: string;
  amount: number;
}

interface EditRosterFeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rosterId: string;
  currentFeeId: string | null;
  personName: string;
}

export default function EditRosterFeeModal({
  open,
  onOpenChange,
  rosterId,
  currentFeeId,
  personName,
}: EditRosterFeeModalProps) {
  const { refresh } = useRouter();
  const supabase = createClient();
  const [fees, setFees] = useState<Fee[]>([]);
  const [selectedFeeId, setSelectedFeeId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFees = async () => {
      const account = await getAccount();
      
      const { data: fees, error } = await supabase
        .from("fees")
        .select("*")
        .eq("is_active", true)
        .eq("account_id", account?.id);

      if (error) {
        console.error("Error fetching fees:", error);
      } else {
        setFees(fees || []);
      }
    };

    if (open) {
      fetchFees();
      setSelectedFeeId(currentFeeId || undefined);
    }
  }, [open, currentFeeId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: any = {};
      
      // If "none" or undefined, set fee_id to null
      if (!selectedFeeId || selectedFeeId === "none") {
        updateData.fee_id = null;
      } else {
        updateData.fee_id = selectedFeeId;
      }

      const { error } = await supabase
        .from("rosters")
        .update(updateData)
        .eq("id", rosterId);

      if (error) throw error;

      toast.success(
        !selectedFeeId || selectedFeeId === "none"
          ? "Fee removed successfully" 
          : "Fee updated successfully"
      );
      onOpenChange(false);
      refresh();
    } catch (error: any) {
      console.error("Error updating fee:", error);
      toast.error(error.message || "Failed to update fee");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Fee for {personName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fee">Select Fee</Label>
            <Select
              value={selectedFeeId}
              onValueChange={(value) => setSelectedFeeId(value === "none" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="No fee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Fee</SelectItem>
                {fees.map((fee) => (
                  <SelectItem key={fee.id} value={fee.id}>
                    {fee.name} - ${fee.amount}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

