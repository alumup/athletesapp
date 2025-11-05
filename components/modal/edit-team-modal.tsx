"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useModal } from "./provider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EditTeamModal({ team }: { team?: any }) {
  const { refresh } = useRouter();
  const modal = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const isActive = watch("is_active");

  useEffect(() => {
    if (team) {
      setValue("name", team.name);
      setValue("coach", team.coach);
      setValue("is_active", team.is_active);
    } else {
      // Set default value for new teams
      setValue("is_active", true);
    }
  }, [team, setValue]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const teamData = {
        name: data.name,
        coach: data.coach,
        is_active: data.is_active,
      };

      let error;
      if (team) {
        // Update existing team
        const { error: updateError } = await supabase
          .from("teams")
          .update(teamData)
          .eq("id", team.id);
        error = updateError;
      } 

      if (error) {
        toast.error("Failed to update team");
        console.error("FORM ERRORS: ", error);
      } else {
        toast.success(team ? "Team updated successfully" : "Team created successfully");
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
        <DialogTitle>{team ? "Edit Team" : "New Team"}</DialogTitle>
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

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={isActive}
            onCheckedChange={(checked) => setValue("is_active", checked)}
          />
          <Label htmlFor="is_active">Active</Label>
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
            {team ? "Update Team" : "Create Team"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
