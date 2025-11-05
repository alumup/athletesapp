"use client";

import { createClient } from "@/lib/supabase/client"
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useModal } from "./provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function CreateTeamModal({ account }: { account: any }) {
  const { refresh } = useRouter();
  const modal = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("teams").insert([
        {
          account_id: account.id,
          name: data.name,
          coach: data.coach,
        },
      ]);

      if (error) {
        toast.error("Failed to create team");
        console.error("FORM ERRORS: ", error);
      } else {
        toast.success("Team created successfully");
        modal?.hide();
        refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>New Team</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Team Name</Label>
          <Input
            id="name"
            placeholder="Enter team name"
            {...register("name", { required: true })}
          />
          {errors.name && (
            <p className="text-sm text-red-500">Team name is required</p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => modal?.hide()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Team
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
