export default function TablaHistorial({ filtrado }) {
  return (
    <section className="overflow-auto rounded-lg shadow border border-amber-300 max-h-[30rem]">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-sky-950 text-white">
          <tr className="sticky top-0 z-10 bg-sky-950">
            <th className="px-6 py-3 text-left font-semibold">Turno</th>
            <th className="px-6 py-3 text-left font-semibold">Asesor</th>
            <th className="px-6 py-3 text-left font-semibold">Fecha</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {filtrado.map((item, i) => (
            <tr key={i} className="hover:bg-[#fff6e5]">
              <td className="px-6 py-3">{item.valor}</td>
              <td className="px-6 py-3">{item.asesor}</td>
              <td className="px-6 py-3">
                {new Date(item.fecha).toLocaleString("es-CO")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
