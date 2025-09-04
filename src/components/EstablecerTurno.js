import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export default function EstablecerTurno({
  letraInicial,
  setLetraInicial,
  numeroInicial,
  setNumeroInicial,
}) {
  const vocales = ["A", "E", "I", "O", "U"];

  // 🔐 Función reutilizable para actualizar turno de un asesor
  const actualizarTurnoAsesor = async (asesorId, datosParciales) => {
    await setDoc(
      doc(db, "turnosAsesores", asesorId),
      {
        ...datosParciales,
        asesorId: Number(asesorId), // Siempre mantener este campo
      },
      { merge: true }
    );
  };

  const establecerTurno = async () => {
    const letraIndex = vocales.indexOf(letraInicial.toUpperCase());
    const numero = parseInt(numeroInicial);

    if (letraIndex === -1 || isNaN(numero) || numero < 0 || numero > 99) {
      alert("Letra o número inválido");
      return;
    }

    const valor = vocales[letraIndex] + String(numero).padStart(2, "0");

    await setDoc(doc(db, "turnos", "actual"), {
      valor,
      letraIndex,
      numeroIndex: numero,
    });

    alert(`Turno inicial establecido a ${valor}`);
  };

  const reiniciarTurnos = async () => {
    if (!window.confirm("¿Estás seguro de reiniciar los turnos?")) return;

    // 🔁 Reiniciar turno general
    await setDoc(doc(db, "turnos", "actual"), {
      valor: "A00",
      letraIndex: 0,
      numeroIndex: 0,
    });

    // 👥 Obtener todos los asesores
    const q = query(collection(db, "usuarios"), where("rol", "==", "asesor"));
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const asesorId = docSnap.data().asesorId;
      if (asesorId) {
        await actualizarTurnoAsesor(asesorId, {
          valor: "--",
          indice: 0,
          llamarNuevamente: false,
        });
      }
    }

    // 🧹 Limpiar la colección 'cola'
    const colaSnap = await getDocs(collection(db, "cola"));
    for (const docu of colaSnap.docs) {
      await deleteDoc(doc(db, "cola", docu.id));
    }

    alert("Turnos reiniciados correctamente");
  };

  return (
    <section className="flex flex-col md:flex-row justify-between gap-6 bg-white p-4 rounded shadow border border-amber-300">
      <button
        onClick={reiniciarTurnos}
        className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded"
      >
        🔁 Reiniciar Turnos
      </button>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm text-sky-950">
          Establecer turno inicial
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={letraInicial}
            onChange={(e) => setLetraInicial(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            {vocales.map((letra) => (
              <option key={letra} value={letra}>
                {letra}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={numeroInicial}
            onChange={(e) => setNumeroInicial(Number(e.target.value))}
            min={0}
            max={99}
            className="w-20 border border-gray-300 rounded px-2 py-1"
          />
          <button
            onClick={establecerTurno}
            className="bg-amber-400 text-white px-4 py-1 rounded hover:bg-amber-300"
          >
            Establecer
          </button>
        </div>
      </div>
    </section>
  );
}
