// src/components/RequireAuth.jsx
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import Loader from "./Loader";

export function RequireAuth({
  children,
  soloAdmin = false,
  soloCajero = false,
}) {
  const [cargando, setCargando] = useState(true);
  const [usuarioValido, setUsuarioValido] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUsuarioValido(false);
        setCargando(false);
        return;
      }

      try {
        const userRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.warn("Usuario no tiene documento de configuración.");
          setUsuarioValido(false);
          setCargando(false);
          return;
        }

        const { rol } = userSnap.data();

        if (
          (soloAdmin && rol === "admin") ||
          (soloCajero && rol === "asesor") ||
          (!soloAdmin && !soloCajero) // acceso general
        ) {
          setUsuarioValido(true);
        } else {
          console.warn("Rol no autorizado:", rol);
          setUsuarioValido(false);
        }
      } catch (error) {
        console.error("Error al validar rol en RequireAuth:", error);
        setUsuarioValido(false);
      } finally {
        setCargando(false);
      }
    });

    return () => unsubscribe();
  }, [soloAdmin, soloCajero]);

  if (cargando)
    return (
      <div className="text-center p-10">
        <Loader />
      </div>
    );
  if (!usuarioValido) return <Navigate to="/login" />;

  return children;
}
