import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const useAutoLogout = (timeout = 15 * 60 * 1000) => {
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const resetTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // 🔐 Cerrar sesión
      localStorage.clear(); // puedes ser más específico
      navigate("/login");
    }, timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keypress", "touchmove"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer(); // inicializa el temporizador

    return () => {
      clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);
};

export default useAutoLogout;

