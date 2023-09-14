'use client'
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { useForm, Controller } from "react-hook-form";
import { useFormData } from "@/providers/form-provider";

import BackBtn from "@/components/dynamic-form/buttons/back-btn";
import NextBtn from "@/components/dynamic-form/buttons/next-btn";
import IncrementInput from "@/components/increment-input";


export const Products = ({ initialValues={}, formIndex, formStep, setFormStep, isFirstStep, isLastStep }) => {
  const supabase = createClientComponentClient();
  const { setFormValues } = useFormData();

  const [tickets, setTickets] = useState([]);
  const [sponsorships, setSponsorships] = useState([]);

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
    setValue,
  } = useForm({
    defaultValues: initialValues,
    mode: "all",
  });

  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase.from("product").select("*");

      if (error) {
        console.log(error);
      } else {
        setTickets(data.filter((product) => product.type === "ticket"));
        setSponsorships(data.filter((product) => product.type === "sponsorship"));

        // Set default values
        data.filter((product) => product.type === "ticket").forEach((ticket, i) => {
          setValue(`tickets[${i}].count`, initialValues.tickets?.[i]?.count || 0);
        });
        data.filter((product) => product.type === "sponsorship").forEach((sponsorship, i) => {
          setValue(`sponsorships[${i}].count`, initialValues.sponsorships?.[i]?.count || 0);
        });
      }
    };

    localStorage.removeItem("order");
    localStorage.removeItem("person_id");

    fetchTickets();
  }, [initialValues.sponsorships, initialValues.tickets, setValue, supabase]);

  const onSubmit = async (values) => {
    setFormValues(values, formIndex);
    setFormStep(formStep + 1);
  };

  return (
    <div className="w-full h-full overflow-x-hidden">
      <div
        className=""
      >
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <p className="text-xl md:text-2xl leading-6 text-gray-700">Tickets</p>
            <p className="text-sm md:text-base leading-6 text-gray-500 mb-5 font-light">Buy up to 4 event tickets to participate in our 4-man scramble golf event.</p>
            {tickets.map((ticket, index) => (
              <div key={ticket.id} className="w-full rounded border border-gray-200 p-5 mt-3">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <div>
                    <h5 className="text-sm md:text-md font-bold">{ticket.name}</h5>
                    <p className="text-sm md:text-md">{(ticket.price / 100).toLocaleString("en-US", {style:"currency", currency:"USD"})}</p>
                  </div>
                  <div>
                    <Controller
                      control={control}
                      name={`tickets[${index}].count`}
                      render={({ field }) => (
                        <IncrementInput count={field.value} setCount={field.onChange} />
                      )}
                    />
                    <input type="hidden" {...register(`tickets[${index}].name`)} value={ticket.name} />
                    <input type="hidden" {...register(`tickets[${index}].price`)} value={ticket.price} />
                    <input type="hidden" {...register(`tickets[${index}].id`)} value={ticket.id} />
                  </div>
                </div>
                <p className="mt-5 text-xs md:text-sm">{ticket.description}</p>
              </div>
            ))}

            <h3 className="text-xl md:text-2xl leading-6 text-gray-700 mt-5">Sponsorships</h3>
            <p className="text-sm md:text-base leading-6 text-gray-500 mb-5 font-light">We need sponsors to help pay for the event so all of the proceeds can go towards running Provo High Basketball.</p>
            {sponsorships.map((sponsorship, index) => (
              <div key={sponsorship.id} className="w-full rounded border border-gray-200 p-5 mt-3">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <div>
                    <h5 className="text-sm md:text-md font-bold">{sponsorship.name}</h5>
                    <p className="text-sm md:text-md">{(sponsorship.price / 100).toLocaleString("en-US", {style:"currency", currency:"USD"})}</p>
                  </div>
                  <div>
                    <Controller
                      control={control}
                      name={`sponsorships[${index}].count`}
                      render={({ field }) => (
                        <IncrementInput count={field.value} setCount={field.onChange} />
                      )}
                    />
                    <input type="hidden" {...register(`sponsorships[${index}].name`)} value={sponsorship.name} />
                    <input type="hidden" {...register(`sponsorships[${index}].price`)} value={sponsorship.price} />
                    <input type="hidden" {...register(`sponsorships[${index}].id`)} value={sponsorship.id} />
                  </div>
                </div>
                <p className="mt-5 text-xs md:text-sm">{sponsorship.description}</p>
              </div>
            ))}

            <div className="fixed md:relative bottom-0 inset-x-0 flex items-center justify-end  bg-white p-5 border-t border-gray-200 shadow-sm">
              {!isFirstStep && <BackBtn step={formStep} setFormStep={setFormStep} cta="Back"/>}
              {!isLastStep && <NextBtn cta="Next" />}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
