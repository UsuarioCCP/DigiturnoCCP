import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function ConfigMensajesFooter() {
  const [mensajes, setMensajes] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [mensajeNuevoTexto, setMensajeNuevoTexto] = useState("");

  const docRef = doc(db, "mensajesFooter", "mensajes");

  useEffect(() => {
    const obtenerMensajes = async () => {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMensajes(docSnap.data().mensajes || []);
      }
    };

    obtenerMensajes();
  }, []);

  const guardarCambio = async () => {
    const nuevosMensajes = [...mensajes];
    nuevosMensajes[editIndex] = nuevoMensaje;

    await updateDoc(docRef, { mensajes: nuevosMensajes });

    setMensajes(nuevosMensajes);
    setEditIndex(null);
    setNuevoMensaje("");
  };

  const eliminarMensaje = async (index) => {
    const confirm = window.confirm("¿Estás seguro de eliminar este mensaje?");
    if (!confirm) return;

    const nuevosMensajes = mensajes.filter((_, i) => i !== index);
    await updateDoc(docRef, { mensajes: nuevosMensajes });
    setMensajes(nuevosMensajes);
  };

  const agregarNuevoMensaje = async () => {
    const texto = mensajeNuevoTexto.trim();
    if (texto === "") return;

    const nuevosMensajes = [...mensajes, texto];
    await updateDoc(docRef, { mensajes: nuevosMensajes });
    setMensajes(nuevosMensajes);
    setMensajeNuevoTexto("");
  };

  return (
    <div className="bg-white border border-amber-300 rounded-lg p-6 shadow space-y-6 overflow-auto max-h-[40rem]">
      <h2 className="text-xl font-bold text-rose-700 mb-2">
        📝 Editar mensajes del footer
      </h2>

      {/* Agregar nuevo mensaje */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <textarea
          className="flex-1 w-full border border-gray-300 rounded p-2"
          placeholder="Escribe un nuevo mensaje"
          rows={2}
          value={mensajeNuevoTexto}
          onChange={(e) => setMensajeNuevoTexto(e.target.value)}
        />
        <button
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded"
          onClick={agregarNuevoMensaje}
        >
          Agregar mensaje
        </button>
      </div>

      {/* Lista de mensajes existentes */}
      {mensajes.map((msg, i) => (
        <div
          key={i}
          className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 border-b pb-3"
        >
          <span className="text-sky-950 font-medium">{i + 1}.</span>
          {editIndex === i ? (
            <div className="flex-1 w-full flex flex-col gap-2">
              <textarea
                className="w-full border border-gray-300 rounded p-2"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  className="bg-amber-400 text-white px-4 py-1 rounded hover:bg-amber-300"
                  onClick={guardarCambio}
                >
                  Guardar
                </button>
                <button
                  className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
                  onClick={() => setEditIndex(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="flex-1 text-gray-800">{msg}</p>
              <div className="flex gap-2">
                <button
                  className="bg-sky-950 text-white px-4 py-1 rounded hover:bg-sky-800"
                  onClick={() => {
                    setEditIndex(i);
                    setNuevoMensaje(msg);
                  }}
                >
                  Editar
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                  onClick={() => eliminarMensaje(i)}
                >
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default ConfigMensajesFooter;

