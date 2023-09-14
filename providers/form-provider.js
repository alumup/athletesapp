'use client';

import { useState, createContext, useContext, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const FormContext = createContext();

export default function FormProvider({ children }) {
  const [event, setEvent] = useState({});
  const [formData, setFormData] = useState([{}]);
  const [orderData, setOrderData] = useState({ items: {}, ticketTotal: 0, totalAmount: 0, payment: "pending" });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [group, setGroup] = useState(null); // New group state


  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchEvent = async () => {
      const host = window.location.host;  // Get the host (domain or subdomain)
      const parts = host.split('.');  // Split the host into parts
      const subdomain = parts[0];
    
      const { data, error } = await supabase
        .from('event')
        .select('*')
        .eq('subdomain', subdomain)  // Replace 'domain' with your actual column name
        .single();  // Assumes each domain uniquely identifies an event
  
      if (error) {
        console.log("NO DOMAIN!!!",error);
      } else {
        console.log("Event: ", data);
        setEvent(data);  // Save the event data in state
      }
    };
  
    fetchEvent();
  }, [supabase]);  // Run once on component mount
  


  const setFormValues = (values, formIndex) => {
    setFormData((prevFormData) => {
      const updatedFormData = [...prevFormData];
      updatedFormData[formIndex] = {
        ...updatedFormData[formIndex],
        ...values,
      };
      return updatedFormData;
    });
  };

  useEffect(() => {
    const formIndex = 0;  // replace with actual index if it varies
    const form = formData[formIndex] || {};
    const tickets = form?.tickets || [];

    const ticketTotal = tickets.reduce((total, ticket) => total + ticket.count, 0);

    const totalAmount = [...tickets].reduce((total, item) => total + item.count * Number(item.price), 0);

    // list all items in the order if the item has a count > 0
    const items = [...tickets].filter(item => item.count > 0);


    setOrderData({ items: items, ticketTotal, totalAmount });



}, [formData]);

useEffect(() => {
  // check if there is an order stored in local storage
  const order = localStorage.getItem("order");

  // if there is an order stored in local storage get the order id and update the order in supabase
  if (order) {
  
    const updateOrder = async () => {
      const { error } = await supabase
        .from("order")
        .update({data: orderData})
        .eq('id', order);

      if (error) {
        console.log(error);
      } else {
        console.log("Order updated successfully");
      }
    }

    if (orderData.items?.length > 0) {
      updateOrder();
    }
  

  } else {
  
    // create an order in supabse
    const createOrder = async () => {
      const { data, error } = await supabase
      .from("order")
      .insert({
        event_id: event?.id, 
        data: orderData,
      })
      .select("*")
      .single();

      if (error) {
        console.log(error);
      } 

      if (data) {
        localStorage.setItem("order", data.id);
      }
    }

    if (orderData.items?.length > 0) {
      createOrder();
    }
  }


}, [event?.id, orderData, supabase]);

  return (
    <FormContext.Provider
      value={{
        event,
        formData,
        setFormValues,
        paymentSuccess,
        setPaymentSuccess,
        orderData,  // make the orderData available via context
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

const useFormData = () => useContext(FormContext);
export { FormProvider, useFormData};