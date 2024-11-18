"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import LoadingDots from "@/components/icons/loading-dots";
import { toast } from "sonner";
import { Editor } from "novel";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  sender: z.string().min(1, "Sender is required"),
  subject: z.string().min(1, "Subject is required"),
  preview: z.string().min(1, "Preview is required"),
  message: z.any().refine((val) => val !== null, "Message is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface SendEmailSheetProps {
  people: any[];
  account: any;
  cta: React.ReactNode;
  onClose?: () => void;
}

export default function SendEmailSheet({ 
  people, 
  account, 
  cta,
  onClose 
}: SendEmailSheetProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sender: account?.senders?.[0]?.email ? `${account.senders[0].name} <${account.senders[0].email}>` : "",
      subject: "",
      preview: "",
      message: null,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const emailData = {
        account,
        people,
        sender: values.sender,
        subject: values.subject,
        message: values.message.getHTML(),
        preview: values.preview,
      };

      const response = await fetch("/api/send-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      router.refresh();
      toast.success("Successfully sent email!");
    } catch (error: any) {
      setError(error.message || "An unknown error occurred");
      toast.error(`Failed to send email: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose?.();
    }
  };

  return (
    <Sheet onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          {cta}
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md bg-white flex flex-col p-2"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="flex h-full flex-col">
              <SheetHeader className="p-6">
                <SheetTitle>Send Email</SheetTitle>
                <SheetDescription>
                  Sending to {people.length} recipient{people.length !== 1 && 's'}
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1">
                <div className="space-y-6 p-3">
                  {error && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
                      {error}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="sender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Send From</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sender email" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {account?.senders?.map((sender: any) => (
                              <SelectItem 
                                key={sender.email} 
                                value={`${sender.name} <${sender.email}>`}
                              >
                                {sender.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the email address to send from
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter email subject" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The subject line of your email
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preview"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preview</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter email preview"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief preview that appears in email clients
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Editor
                            defaultValue="Start Typing..."
                            onUpdate={(value) => field.onChange(value)}
                            disableLocalStorage={true}
                            className="min-h-[300px] rounded-md border border-gray-200"
                          />
                        </FormControl>
                        <FormDescription>
                          The main content of your email
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>

              <div className="sticky bottom-0 bg-white p-6 border-t mt-auto">
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <LoadingDots color="#fff" />
                  ) : (
                    "Send Email"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}