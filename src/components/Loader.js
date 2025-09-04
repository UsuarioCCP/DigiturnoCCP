import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-90 flex flex-col items-center justify-center">
      <div className="text-3xl font-bold my-4 text-shadow-md">Cargando...</div>
      <div className="flex gap-3">
        <div className="w-5 h-5 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-5 h-5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-5 h-5 bg-rose-600 rounded-full animate-bounce" />
      </div>
    </div>
  );
};

export default Loader;
