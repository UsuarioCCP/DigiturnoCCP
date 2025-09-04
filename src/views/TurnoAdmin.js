// src/views/TurnoAdmin.jsx
import React, { useState, useEffect } from "react";
import {
  doc,
  setDoc,
  addDoc,
  collection,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import useAutoLogout from "../components/CierreSesion";

const vocales = ["A", "E", "I", "O", "U"];

const actualizarTurnoAsesor = async (asesorId, datosParciales) => {
  const idNum = Number(asesorId);
  if (!idNum || isNaN(idNum)) {
    console.error("❌ asesorId inválido:", asesorId);
    return;
  }

  await setDoc(
    doc(db, "turnosAsesores", idNum.toString()),
    {
      ...datosParciales,
      asesorId: idNum,
    },
    { merge: true }
  );
};

function TurnoAdmin() {
  const [turnoActual, setTurnoActual] = useState(null);
  const [asesorId, setAsesorId] = useState(null);
  const navigate = useNavigate();

  useAutoLogout(270 * 60 * 1000); // 30 minutos de inactividad

  useEffect(() => {
    const idRaw = localStorage.getItem("asesorId");
    const id = Number(idRaw); // intenta convertir a número
    if (!id || isNaN(id)) {
      alert("No se pudo determinar el asesorId. Inicia sesión nuevamente.");
      navigate("/login");
    } else {
      setAsesorId(id);
    }
  }, [navigate]);

  // Obtener el turno actual al cargar la vista
  useEffect(() => {
    const obtenerTurnoActual = async () => {
      const actualRef = doc(db, "turnos", "actual");
      const actualSnap = await getDoc(actualRef);

      if (actualSnap.exists()) {
        const data = actualSnap.data();
        if (data.valor) {
          setTurnoActual(data.valor);
        }
      }
    };

    if (asesorId) {
      obtenerTurnoActual();
    }
  }, [asesorId]);

  const asignarTurno = async () => {
    if (!asesorId) return;

    const actualRef = doc(db, "turnos", "actual");
    const actualSnap = await getDoc(actualRef);

    let letraIndex = 0;
    let numeroIndex = 0;

    if (actualSnap.exists()) {
      const datos = actualSnap.data();
      letraIndex = parseInt(datos.letraIndex, 10) || 0;
      numeroIndex = parseInt(datos.numeroIndex, 10) || 0;

      numeroIndex++;

      if (numeroIndex > 99) {
        numeroIndex = 0;
        letraIndex = (letraIndex + 1) % vocales.length;
      }
    }

    const nuevoValor =
      vocales[letraIndex] + String(numeroIndex).padStart(2, "0");

    // 🔁 primero obtenemos el número de llamados actuales
    const ref = doc(db, "turnosAsesores", asesorId.toString());
    const snap = await getDoc(ref);
    const anteriores = snap.exists() ? snap.data().llamados || 0 : 0;

    // 🔄 Actualiza el turno global
    await setDoc(actualRef, {
      valor: nuevoValor,
      letraIndex,
      numeroIndex,
    });

    // 🔊 Actualiza el turno del asesor
    await actualizarTurnoAsesor(asesorId, {
      valor: nuevoValor,
      indice: numeroIndex,
      letra: vocales[letraIndex],
      llamarNuevamente: true,
      llamados: 0,
    });

    // 📝 Guarda en historial
    await addDoc(collection(db, "historial"), {
      valor: nuevoValor,
      letra: vocales[letraIndex],
      indice: numeroIndex,
      asesor: asesorId,
      fecha: new Date().toISOString(),
    });

    setTurnoActual(nuevoValor);
  };

  const llamarNuevamente = async () => {
    if (!asesorId) return;

    const ref = doc(db, "turnosAsesores", asesorId.toString());
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();
    const actualesLlamados = typeof data.llamados === "number" ? data.llamados : 0;

    // Incrementa llamados solo si el turno no ha cambiado
    await actualizarTurnoAsesor(asesorId, {
      llamarNuevamente: true,
      llamados: actualesLlamados + 1,
    });
    console.log("📣 Llamado actualizado:", actualesLlamados + 1);
  };

  const handleLogout = async () => {
    localStorage.clear();
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-200 text-sky-950 flex flex-col">
      {/* Encabezado con logo y cierre de sesión */}
      <div className="w-full flex justify-between items-center px-6 py-4 bg-sky-950 border-b shadow-sm">
        {/* Logo y nombre de empresa */}
        <div className="flex items-center gap-3 ">
          <img
            src="/DigiTurn_CCP.png"
            alt="Logo empresa"
            className="h-10 w-auto"
          />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            DigiTurno - Modulo Asesor
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded transition"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg border border-gray-200">
          {/* Título y mensaje */}
          <h2 className="text-3xl font-bold text-center text-rose-600 mb-2">
            🎟️ Bienvenido
          </h2>
          <span className=" flex justify-center font-bold">Asesor {asesorId}</span>
          <p className="text-center text-sm text-gray-600 m-10">
            ¡Gracias por brindar una atención con excelencia!
          </p>

          {/* Turno actual */}
          {turnoActual && (
            <div className="text-center mb-6">
              <p className="text-lg text-gray-700">Turno asignado</p>
              <span className="text-5xl font-extrabold text-rose-800 tracking-wide">
                {turnoActual}
              </span>
            </div>
          )}

          {/* Botón asignar turno */}
          <button
            onClick={asignarTurno}
            className="w-full bg-amber-300 hover:bg-yellow-400 text-black py-2.5 rounded-md text-base font-semibold transition mb-3"
          >
            Asignar siguiente turno
          </button>

          {/* Botón llamar nuevamente */}
          <button
            onClick={llamarNuevamente}
            className="w-full bg-rose-700 hover:bg-rose-800 text-white py-2.5 rounded-md text-base font-medium transition"
          >
            Llamar nuevamente
          </button>
        </div>
      </div>
    </div>
  );
}

export default TurnoAdmin;
