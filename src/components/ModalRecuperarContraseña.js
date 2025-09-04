import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
auth.languageCode = "es";

function ModalRecuperarContraseña({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const recuperarContraseña = async () => {
    setLoading(true);
    setMensaje("");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("📩 Enlace de recuperación enviado a tu correo.");
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          alert("❌ Este correo no está registrado.");
          break;
        case "auth/invalid-email":
          alert("❌ El formato del correo no es válido.");
          break;
        case "auth/too-many-requests":
          alert("⚠️ Demasiados intentos. Intenta más tarde.");
          break;
        default:
          alert("⚠️ Ha ocurrido un error inesperado.");
          console.error(error);
      }
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed rounded-2xl inset-0 bg-[#000000cc] z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md flex flex-col justify-evenly h-96">
        <h2 className="text-xl font-semibold text-[#19253b] mb-4 text-center">
          Recuperar contraseña
        </h2>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo"
          className="w-full border border-[#e8e8e8] rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-[#ffc548]"
        />

        {mensaje && (
          <p className="text-sm text-[#19253b] text-center bg-[#e8e8e8] px-3 py-2 rounded mb-3">
            {mensaje}
          </p>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#e8e8e8] hover:bg-[#cccccc] text-[#19253b] font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={recuperarContraseña}
            className="px-4 py-2 rounded bg-[#dc0155] hover:bg-[#bb0048] text-white font-medium"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalRecuperarContraseña;
