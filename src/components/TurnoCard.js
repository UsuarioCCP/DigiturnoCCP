import React, { useEffect, useState } from "react";
import clsx from "clsx";

const colores = [
  //   { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-500" },
  { bg: "bg-white", border: "border-pink-500", text: "text-amber-300", shadow: "drop-shadow-lg" },
  //   { bg: "bg-yellow-100", border: "border-yellow-500", text: "text-yellow-700" },
];

export function TurnoCard({
  nombre,
  valor,
  colorIndex,
  flash,
  children,
  actual = false,
}) {
  const [highlight, setHighlight] = useState(false);
  const [prevValor, setPrevValor] = useState(valor);

  useEffect(() => {
    if (valor !== prevValor || flash) {
      setHighlight(true);
      setTimeout(() => setHighlight(false), 1500);
      setPrevValor(valor);
    }
  }, [valor, flash]);

  const color = colores[colorIndex % colores.length];

  const borderClass = actual ? "border-amber-400" : color.border;

  return (
    <div
      className={clsx(
        "flex justify-around rounded-xl shadow-lg border-4 text-center transition-all duration-500",
        color.bg,
        borderClass,
        highlight && `animate-pulse scale-105 outline outline-offset-1 outline-amber-100 `
      )}
    >
      <div className=" grid grid-cols-2 w-full shadow-md">
        <div className="col-span-1 bg-rose-100 p-6 rounded-l-xl">
          <span className="font-extrabold text-6xl brightness-125 text-pink-800 ">
            {nombre}
          </span>
        </div>
        <div
          className={clsx(
            "col-span-1 self-center p-3 text-6xl font-extrabold rounded-l-xl tracking-wide",
            color.text
          )}
        >
          {valor}
          {children}
        </div>
      </div>
    </div>
  );
}
