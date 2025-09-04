import React, { useState, useEffect } from 'react';

function Reloj() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');

  const timeString = `${hours}:${minutes}:${seconds}`;

  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const dateString = currentTime.toLocaleDateString(undefined, options);
  const monthString = new Intl.DateTimeFormat(undefined, { month: 'long' }).format(currentTime);

  return (
    <div className='font-extrabold text-4xl text-pink-700 grid text-center mt-2'>
      <div className="time">{timeString}</div>
      <div className="text-xl text-slate-700 self-center">{dateString}</div>
      {/* <div className="month">{monthString}</div> */}
    </div>
  );
}

export {Reloj};