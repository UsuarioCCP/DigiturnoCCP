import React, { useEffect, useState } from "react";

const AvisoTomarTurno = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setVisible(true);
      const timeout = setTimeout(() => setVisible(false), 15000); // Visible 10s
      return () => clearTimeout(timeout);
    }, 100000); // Cada 5minutos

    return () => clearInterval(intervalo);
  }, []);

  return visible ? (
    <div className="fixed bottom-2 right-2 z-50 flex items-end space-y-2 backdrop-blur-md bg-black/30 border border-black/20 rounded-lg p-2 shadow-lg w-72">
      <span className="text-rose-600 self-center text-center text-xl font-extrabold mx-2">
        ¡Recuerda tomar tu turno aquí!
      </span>
      <img
        src="arrow.png"
        alt="Tomar turno"
        className="w-28 h-w-28 rotate-[45deg] animate-diagonal-move"
      />
    </div>
  ) : null;
};

export default AvisoTomarTurno;
