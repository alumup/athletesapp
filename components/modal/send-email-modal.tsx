"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from 'react-hook-form';
import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { useModal } from "./provider";
import { toast } from "sonner";
import { Editor } from "novel";
import { useRouter } from "next/navigation";


export default function SendEmailModal({ people, account, onClose }: { people: any, account: any, onClose: any }) {
  const { refresh } = useRouter()
  const [emailIsSending, setEmailIsSending] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const modal = useModal();
  const { register, handleSubmit, control, formState: { errors } } = useForm();

  // Functions to handle actions
  const handleSendEmail = ({ data }: { data: any }) => {
    console.log('handleSendEmail called', data);
    setEmailIsSending(true);
    fetch('/api/send-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account: account,
        people: people,
        subject: data.subject,
        message: data.message.getHTML(),
        preview: data.preview
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setEmailIsSending(false);
        modal?.hide();
        onClose();
        refresh();
        toast.success(`Successfully sent email!`);
        console.log('Success:', data);
      })
      .catch((error) => {
        setEmailIsSending(false);
        setEmailError(true)
        console.error('Error:', error);
      });

  };





  const onSubmit = async (data: any) => {
    console.log('onSubmit called', data);
    handleSendEmail({ data });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full rounded-md bg-white dark:bg-black md:max-w-md md:border md:border-stone-200 md:shadow dark:md:border-stone-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10 max-h-[700px] overflow-y-scroll">
        <div className="w-full flex items-center">
          <h2 className="font-cal text-2xl dark:text-white mr-2">Send Email</h2>
          <span className="font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full text-sm">
            {people.length}
          </span>
        </div>

        {emailError && <span className="text-sm text-red-500">There was an error sending the email</span>}

        <div className="flex flex-col space-y-2">
          <label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-stone-300">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"
            {...register("subject", { required: true })}
          />
          {errors.subject && <span className="text-sm text-red-500">This field is required</span>}
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="preview" className="text-sm font-medium text-gray-700 dark:text-stone-300">
            Preview
          </label>
          <textarea
            rows={2}
            id="preview"
            className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 focus:outline-none focus:border-stone-300 dark:focus:border-stone-300"
            {...register("preview", { required: true })}
          />
          {errors.preview && <span className="text-sm text-red-500">This field is required</span>}
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col space-y-2 ">
            <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-stone-300">
              Message
            </label>
            {modal?.isModalOpen && (
              <>
                <Controller
                  name="message"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Editor
                      defaultValue="Start Typing..."
                      onUpdate={(value: any) => field.onChange(value)}
                      disableLocalStorage={true}
                      className="h-[400px] overflow-y-scroll !padding-0 !margin-0 rounded-md border border-stone-200 bg-stone-50 text-sm text-stone-600 focus:outline-none focus:border-blue-300"
                    />
                  )}
                />
                {errors.message && <span className="text-sm text-red-500">This field is required</span>}
              </>

            )}

          </div>
        </div>

      </div>
      <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
        <button
          className={cn(
            "flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none",
            emailIsSending
              ? "cursor-not-allowed border-stone-200 bg-stone-300 text-stone-400"
              : "border-black bg-black text-white hover:bg-white hover:text-black",
          )}
          disabled={emailIsSending}
        >
          {emailIsSending ? <LoadingDots color="#212121" /> : <p>Send Email</p>}
        </button>
      </div>
    </form>
  );
}
