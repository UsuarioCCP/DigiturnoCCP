import React, { useEffect, useState } from "react";
import gsap from "gsap";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Asegúrate de que esta ruta sea correcta
// import AvisoTomarTurno from "./AvisoTomarTurno";

function Footer() {
  const [messages, setMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");

  // const messages = [
  //   "Agendate con la Cámara de Comercio y consulta los beneficios de estar formalizado en www.camarapamplona.org.co",
  //   "Recuerda nuestro horario de atención     Lunes a Viernes    de 8:00am - 12:00pm    y    de 2:00pm - 6:00pm",
  //   "Nuestros asesores estan aquí para brindarte la información que necesitas",
  //   "La generación de oportunidades de emprendimiento, fortalecimiento y aceleración empresarial de la región, son nuestro compromiso",
  //   "Siguenos en nuestras redes sociales Facebook, Instagram y Twitter como # Camara de Comercio de Pamplona",
  //   "Prestador de Servicios Turisticios-Alojamientos, no olvides alimentar día a día tu Tarjeta de Registro de Alojamiento",
  //   "Recuerda nuestros canales de contacto: ccpamplona@camarapamplona.org.co, teléfonos (60)75680993 - 75684696 - 75682047 y WhatsApp: 333 033 3569",
  //   "Recuerda que el término de ley para atender tus tramites es de QUINCE (15) DÍAS HÁBILES",
  //   "No olvides calificar el servicio prestado por nuestro personal, pregunta con nuestras Asesoras como hacerlo",
  //   "Además de tu registro en Cámara de Comercio, adquieres responsabilidades tributarias en la DIAN y en la Alcaldía Municipal  (Impuesto de Industria y Comercio).",
  //   "Si tienes actividades de alto impacto, debes gestionar los permisos necesarios ante las autoridades locales (Planeación municipal, sayco y acinpro, bomberos, entre otros).",
  //   "Recuerda que puedes realizar tu matrícula mercantil mediante la Ventanilla Unica Empresarial VUE, aplica solo para Pamplona.",
  // ];

  // 🔄 Cargar mensajes desde Firestore al montar el componente
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const docRef = doc(db, "mensajesFooter", "mensajes");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.mensajes)) {
            setMessages(data.mensajes);
          } else {
            console.warn("El campo 'mensajes' no es un array");
          }
        } else {
          console.warn("El documento de mensajes no existe.");
        }
      } catch (error) {
        console.error("Error al obtener mensajes del footer:", error);
      }
    };

    fetchMessages();
  }, []);

  // 🌀 Animación y cambio de mensajes con GSAP
  useEffect(() => {
    if (!messages.length) return;

    const mensajeElement = document.querySelector(".message-text");
    const footerContainer = document.querySelector(".mensajes");

    if (!mensajeElement || !footerContainer) return;

    const showMessage = () => {
      const message = messages[currentMessageIndex];
      setCurrentMessage(message);

      // Espera un pequeño tiempo para que React actualice el DOM y podamos medir el texto
      requestAnimationFrame(() => {
        const mensajeWidth = mensajeElement.offsetWidth;
        const containerWidth = footerContainer.offsetWidth;

        const startX = containerWidth;
        const endX = -mensajeWidth;
        const speed = 100; // píxeles por segundo
        const totalDistance = startX - endX;
        const duration = totalDistance / speed;

        gsap.set(mensajeElement, { x: startX });
        gsap.to(mensajeElement, {
          x: endX,
          duration,
          ease: "linear",
          onComplete: () => {
            // Espera 5 segundos antes de mostrar el siguiente mensaje
            gsap.delayedCall(5, () => {
              setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
            });
          },
        });
      });
    };

    showMessage();
  }, [currentMessageIndex, messages]);

  return (
    <footer className="container-fluid">
      <div className="banner-container">
        <div className="col-md-1 banner">
          <img
            src="/Camarin.png"
            id="camarin"
            alt="camarin"
          />
        </div>
        <div className="col-md-11 mensajes">
          <p className="message-text">{currentMessage}</p>
        </div>
      </div>
      {/* <AvisoTomarTurno /> */}
    </footer>
  );
}

export { Footer };
