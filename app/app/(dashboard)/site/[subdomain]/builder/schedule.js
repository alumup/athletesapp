import { CalendarIcon } from '@radix-ui/react-icons';
import React from 'react';

const groupByDate = (sessions) => {
  return sessions?.reduce((acc, session) => {
      if (!acc[session.date]) {
          acc[session.date] = [];
      }
      acc[session?.date].push(session);
      return acc;
  }, {});
}



const convertTo12Hr = (time) => {
  let [hours, minutes] = time.split(":");
  let period = +hours >= 12 ? 'PM' : 'AM';
  hours = +hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}


const Schedule = ({ schedule }) => {
  const groupedSessions = groupByDate(schedule?.sessions);

  return (
      <div tabIndex={1} className="p-5 shadow bg-white max-w-md w-full">
          <h2 className="font-bold text-xl flex items-center mb-2"><CalendarIcon className="w-4 h-4 mr-1" /> Schedule</h2>
          {Object?.entries(groupedSessions).map(([date, sessionsForDate]) => (
              <div key={date} className="border border-gray-300 p-1 rounded mt-1 space-y-2">
                  <h3 className="font-bold text-sm">{date}</h3>
                  {sessionsForDate?.map((session, index) => (
                      <div key={index}>
                          <p className="font-bold uppercase text-sm">{session?.group}</p>
                          <p>{convertTo12Hr(session?.start_time)} - {convertTo12Hr(session?.end_time)}</p>
                      </div>
                  ))}
              </div>
          ))}
      </div>
  );
}

Schedule.defaultProps = {
  schedule: {
      sessions: []
  }
};

export default Schedule;
