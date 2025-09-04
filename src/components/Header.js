import React, { useState } from "react";

function Header() {
  return (
    <header className="absolute w-full my-2">
      <div className="flex items-center">
        <div className="flex justify-center w-1/6">
          <img
            src="/CCP_Blanco.png"
            id="logo-empresa"
            alt="logo-empresa"
            className="drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] pb-1"
          />
        </div>
        <div className="p-3">
          <h2 className="text-white text-center text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wide text-shadow-lg/30 leading-tight">
            Cámara de Comercio de Pamplona
          </h2>
        </div>
        {/* <div className="fondo w-1/2">
        </div> */}
      </div>
    </header>
  );
}

export { Header };
