"use client";


import Schedule from "@/app/app/(dashboard)/site/[subdomain]/builder/components/schedule";



export default function ScheduleModal({event} : {event: any}) {


  return (
    <Schedule schedule={event?.schedule} />
  );
}
