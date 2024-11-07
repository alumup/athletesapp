"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useModal } from "./provider";
import { toast } from "sonner";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Define the form schema
const formSchema = z.object({
  person: z.string({
    required_error: "Please select a person",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  name?: string;
}

export function AddToStaffSheet({
  team,
}: {
  team: { id: string };
}) {
  const { refresh } = useRouter();
  const modal = useModal();
  const supabase = createClient();
  const [people, setPeople] = useState<Person[]>([]);
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchPeople = async () => {
      const { data, error } = await supabase
        .from('people')
        .select('id, first_name, last_name, name')
      if (data) setPeople(data)
    }
    fetchPeople()
  }, [supabase])

  const onSubmit = async (data: FormValues) => {
    const { error } = await supabase.from("staff").insert([
      {
        team_id: team.id,
        person_id: data.person,
      },
    ])

    if (error) {
      toast.error("Failed to add staff member")
      return
    }

    modal?.hide()
    toast.success("Staff member added to team")
    refresh()
  }

 

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          color="primary"
        >
          Add Staff
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[540px] bg-white flex flex-col px-5 py-8">
        <SheetHeader>
          <SheetTitle>Add Staff Member</SheetTitle>
          <SheetDescription>
            Add a new staff member to the system.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
            <div className="flex-1 flex flex-col space-y-4 p-5 md:p-10">
              <FormField
                control={form.control}
                name="person"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Search Person</FormLabel>
                      <div className="flex flex-col space-y-2">
                              
                                <Popover open={open} onOpenChange={setOpen}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={open}
                                      className="w-full justify-between text-sm"
                                    >
                                      {searchValue
                                        ? people.find((person) => person.name === searchValue)?.name
                                        : "Search by name..."}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent 
                                    className="mt-2 p-0 w-[--radix-popover-trigger-width] z-[100]" 
                                    side="bottom" 
                                    align="start"
                                    sideOffset={4}
                                  >
                                    <Command>
                                      <CommandInput placeholder="Search name..." />
                                      <CommandList>
                                        <CommandEmpty>No person found.</CommandEmpty>
                                        <CommandGroup>
                                          {people.map((person, index) => (
                                            <CommandItem
                                              key={person.id}
                                              value={person.name || `${person.first_name} ${person.last_name}`}
                                              className="mt-1 cursor-pointer pointer-events-auto opacity-100 data-[disabled]:!cursor-pointer data-[disabled]:!pointer-events-auto data-[disabled]:!opacity-100"
                                              onSelect={(currentValue) => {
                                                form.setValue("person", person.id, {
                                                  shouldValidate: true,
                                                  shouldDirty: true,
                                                  shouldTouch: true
                                                })
                                                setSearchValue(currentValue === searchValue ? "" : currentValue)
                                                setOpen(false)
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  searchValue === (person.name || `${person.first_name} ${person.last_name}`) ? "opacity-100" : "opacity-0"
                                                )}
                                              />
                                              {person.name || `${person.first_name} ${person.last_name}`}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end border-t border-stone-200 bg-white p-3 md:px-10">
              <Button
                type="submit"
                className="w-full"
                variant="default"
                disabled={!form.formState.isValid}
              >
                Add to Staff
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
