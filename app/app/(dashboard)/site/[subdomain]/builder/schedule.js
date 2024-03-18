import { CalendarIcon } from "@radix-ui/react-icons";
import React from "react";

const groupByDate = (sessions) => {
  return sessions?.reduce((acc, session) => {
    if (!acc[session.date]) {
      acc[session.date] = [];
    }
    acc[session?.date].push(session);
    return acc;
  }, {});
};

const convertTo12Hr = (time) => {
  let [hours, minutes] = time.split(":");
  let period = +hours >= 12 ? "PM" : "AM";
  hours = +hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
};

const Schedule = ({ schedule }) => {
  const groupedSessions = groupByDate(schedule?.sessions);

  return (
    <div tabIndex={1} className="w-full max-w-md bg-white p-5 shadow">
      <h2 className="mb-2 flex items-center text-xl font-bold">
        <CalendarIcon className="mr-1 h-4 w-4" /> Schedule
      </h2>
      {Object?.entries(groupedSessions).map(([date, sessionsForDate]) => (
        <div
          key={date}
          className="mt-1 space-y-2 rounded border border-gray-300 p-1"
        >
          <h3 className="text-sm font-bold">{date}</h3>
          {sessionsForDate?.map((session, index) => (
            <div key={index}>
              <p className="text-sm font-bold uppercase">{session?.group}</p>
              <p>
                {convertTo12Hr(session?.start_time)} -{" "}
                {convertTo12Hr(session?.end_time)}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

Schedule.defaultProps = {
  schedule: {
    sessions: [],
  },
};

export default Schedule;
