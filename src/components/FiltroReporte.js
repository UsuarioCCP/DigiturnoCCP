import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const limpiarHistorial = async () => {
  const confirmacion = window.confirm(
    "¿Estás seguro de eliminar todo el historial?"
  );
  if (!confirmacion) return;

  try {
    const snapshot = await getDocs(collection(db, "historial"));

    const eliminaciones = snapshot.docs.map((documento) =>
      deleteDoc(doc(db, "historial", documento.id))
    );

    await Promise.all(eliminaciones);

    alert("✅ Historial eliminado correctamente.");
  } catch (error) {
    console.error("❌ Error al eliminar el historial:", error);
    alert("Ocurrió un error al intentar borrar el historial.");
  }
};

export default function FiltroReporte({
  asesorFiltro,
  setAsesorFiltro,
  fechaFiltro,
  setFechaFiltro,
  asesoresUnicos,
  aplicarFiltros,
  exportarExcel,
}) {
  return (
    <section className="bg-[#fffdf7] border border-amber-300 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-sky-950 mb-3">🎯 Filtros</h2>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Asesor</label>
          <select
            value={asesorFiltro}
            onChange={(e) => setAsesorFiltro(e.target.value)}
            className="border border-gray-300 rounded p-2 w-48"
          >
            <option value="todos">Todos los asesores</option>
            {asesoresUnicos.map((asesor, i) => (
              <option key={i} value={asesor}>
                {asesor}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha</label>
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="border border-gray-300 rounded p-2"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={aplicarFiltros}
            className="bg-sky-950 text-white px-4 py-2 rounded hover:bg-sky-800"
          >
            Aplicar
          </button>
          <button
            onClick={exportarExcel}
            className="bg-amber-400 text-white px-4 py-2 rounded hover:bg-amber-300"
          >
            Exportar Excel
          </button>
        </div>
        {/* Habilitar este boton solo cuando sea necesario, para entrar a producción */}
        {/* <button
          onClick={limpiarHistorial}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded shadow"
        >
          🧹 Limpiar historial completo
        </button> */}
      </div>
    </section>
  );
}
