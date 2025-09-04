import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { query, orderBy } from "firebase/firestore";
import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
} from "firebase/firestore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

// Componentes separados
import EstablecerTurno from "../components/EstablecerTurno";
import FiltroReporte from "../components/FiltroReporte";
import TablaHistorial from "../components/TablaHistorial";
import ConfigMensajesFooter from "../components/ConfigMensajesFooter";
import UrlVideoConfig from "../components/VideoConfig";


export default function Dashboard() {
  const [historial, setHistorial] = useState([]);
  const [filtrado, setFiltrado] = useState([]);
  const [asesorFiltro, setAsesorFiltro] = useState("todos");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [letraInicial, setLetraInicial] = useState("A");
  const [numeroInicial, setNumeroInicial] = useState(0);
  const [vista, setVista] = useState("filtros");

  const navigate = useNavigate();

  // Cargar historial
  useEffect(() => {
    const obtenerHistorial = async () => {
      const q = query(collection(db, "historial"), orderBy("fecha", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => doc.data());
      setHistorial(data);
      setFiltrado(data);
    };
    obtenerHistorial();
  }, []);

  const aplicarFiltros = () => {
    let resultados = historial;

    if (asesorFiltro !== "todos") {
      resultados = resultados.filter((h) => h.asesor === asesorFiltro);
    }

    if (fechaFiltro) {
      resultados = resultados.filter((h) =>
        new Date(h.fecha).toISOString().startsWith(fechaFiltro)
      );
    }

    setFiltrado(resultados);
  };

  const exportarExcel = () => {
    const datos = filtrado.map((item) => ({
      Turno: item.valor,
      Asesor: item.asesor,
      Fecha: new Date(item.fecha).toLocaleString("es-CO"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Turnos");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, "reporte_turnos.xlsx");
  };

  const asesoresUnicos = [...new Set(historial.map((h) => h.asesor))];

  // Define las vistas disponibles
  const vistas = [
    { id: "filtros", label: "Filtros y Reporte" },
    { id: "mensajes", label: "Configurar Mensajes" },
    { id: "turnos", label: "Configurar Turnos" },
    { id: "videoUrl", label: "Configurar Video Url"}
    // Puedes añadir más aquí fácilmente:
    // { id: "usuarios", label: "Gestión de usuarios" },
  ];

  return (
    <div className="min-h-screen bg-slate-200 text-sky-950">
      {/* Encabezado */}
      <header className="flex justify-between items-center px-6 py-4 bg-sky-950 shadow">
        <div className="flex items-center gap-3">
          <img
            src="/DigiTurn_CCP.png"
            alt="Logo empresa"
            className="h-10 w-auto"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            DigiTurno • Módulo Administrativo
          </h1>
        </div>
        <button
          onClick={async () => {
            await auth.signOut();
            navigate("/login");
          }}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded"
        >
          Cerrar sesión
        </button>
      </header>

      {/* Navegación */}
      <nav className="flex gap-4 px-6 py-3 bg-yellow-400 border-b border-amber-300">
        {vistas.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setVista(id)}
            className={`px-4 py-2 rounded transition ${
              vista === id
                ? "bg-rose-600 text-white"
                : "bg-white text-rose-700 border border-rose-700"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Contenido */}
      <main className="p-6 space-y-6 ">
        {vista === "filtros" && (
          <>
            <FiltroReporte
              asesorFiltro={asesorFiltro}
              setAsesorFiltro={setAsesorFiltro}
              fechaFiltro={fechaFiltro}
              setFechaFiltro={setFechaFiltro}
              asesoresUnicos={asesoresUnicos}
              aplicarFiltros={aplicarFiltros}
              exportarExcel={exportarExcel}
            />

            <TablaHistorial filtrado={filtrado} />
          </>
        )}

        {vista === "mensajes" && <ConfigMensajesFooter />}

        {vista === "videoUrl" && <UrlVideoConfig/>}

        {vista === "turnos" && (
          <>
            <EstablecerTurno
              letraInicial={letraInicial}
              setLetraInicial={setLetraInicial}
              numeroInicial={numeroInicial}
              setNumeroInicial={setNumeroInicial}
            />
          </>
        )}
      </main>
    </div>
  );
}
