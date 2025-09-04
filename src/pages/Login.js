// src/pages/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
// import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ModalRecuperarContraseña from "../components/ModalRecuperarContraseña";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const navigate = useNavigate();

  // const recuperarContraseña = async (email) => {
  //   try {
  //     await sendPasswordResetEmail(auth, email);
  //     alert("Revisa tu correo para restablecer tu contraseña.");
  //   } catch (error) {
  //     alert("Error al enviar el correo: " + error.message);
  //   }
  // };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1. Autenticación con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Obtener datos del usuario desde Firestore
      const userDocRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        alert("Este usuario no tiene permisos configurados.");
        return;
      }

      const { rol, asesorId } = userSnap.data();

      // 3. Guardar rol y asesorId en localStorage
      localStorage.setItem("rol", rol);
      if (asesorId) {
        localStorage.setItem("asesorId", asesorId);
        console.log("🔐 Guardando asesorId en localStorage:", asesorId);
      } else {
        alert("Este usuario no tiene un asesorId asignado.");
        return;
      }

      // 4. Redirigir según el rol
      if (rol === "admin") {
        navigate("/dashboard");
      } else if (rol === "asesor") {
        navigate("/cajero");
      } else {
        alert("Rol no válido.");
      }
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      alert("Credenciales incorrectas o usuario no registrado.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center fondo_login bg-cover bg-center">
      <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-2xl shadow-xl p-10 w-full max-w-md mx-4 hover:shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-pink-700 drop-shadow-md">
            Inicio de Sesión
          </h2>

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/70 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/70 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            required
          />

          <button
            type="submit"
            className="w-full bg-sky-800 hover:bg-sky-700 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md"
          >
            Ingresar
          </button>
        </form>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMostrarModal(true);
          }}
          className="mt-4 text-sm text-blue-800 hover:underline hover:text-blue-500"
        >
          Recuperar contraseña
        </a>

        <ModalRecuperarContraseña
          isOpen={mostrarModal}
          onClose={() => setMostrarModal(false)}
        />
      </div>
    </div>
  );
}

export default Login;
