import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { Reloj } from "../components/Reloj";
import { doc, onSnapshot, collection, updateDoc } from "firebase/firestore";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { TurnoCard } from "../components/TurnoCard";

function TurnoDisplay() {
  const [flashAsesor, setFlashAsesor] = useState(null);
  const [turnosAsesores, setTurnosAsesores] = useState({});
  const [puedeSonar, setPuedeSonar] = useState(false);
  const audioRef = useRef(null);
  const playerRef = useRef(null);

  const videoUrl =
    "https://www.youtube-nocookie.com/embed/videoseries?si=9fT1HFUDeVSwD3os&list=PLaZmxwblqOt6M6hgw8u3-h05kt31s5bYM&autoplay=1&mute=0&enablejsapi=1&loop=1";

  // Cargar API de YouTube
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    } else {
      window.onYouTubeIframeAPIReady();
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("youtube-player");
    };
  }, []);

  // Precargar sonido
  useEffect(() => {
    audioRef.current = new Audio("/notificacion.mp3");
    audioRef.current.preload = "auto";
  }, []);

  // Activar sonido tras clic
  useEffect(() => {
    const habilitarSonido = () => {
      setPuedeSonar(true);
      document.removeEventListener("click", habilitarSonido);
    };
    document.addEventListener("click", habilitarSonido);
    return () => document.removeEventListener("click", habilitarSonido);
  }, []);

  // Reproducir sonido y restaurar video
  const playNotificationWithResume = () => {
    if (!audioRef.current) return;

    const wasPlaying =
      playerRef.current &&
      typeof playerRef.current.getPlayerState === "function" &&
      playerRef.current.getPlayerState() === 1; // 1 = playing

    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => {
      if (wasPlaying) {
        setTimeout(() => {
          playerRef.current.playVideo();
        }, 1500); // ajusta si tu mp3 dura más
      }
    }).catch((e) => {
      console.warn("No se pudo reproducir sonido:", e);
    });
  };

  // Suscripción a Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "turnosAsesores"), async (snapshot) => {
      const data = {};
      for (const docSnap of snapshot.docs) {
        const info = docSnap.data();
        const id = docSnap.id;
        data[id] = info;

        if (info.llamarNuevamente) {
          setFlashAsesor(id);

          if (puedeSonar) {
            playNotificationWithResume();
          }

          setTimeout(() => setFlashAsesor(null), 1200);

          await updateDoc(doc(db, "turnosAsesores", id), {
            llamarNuevamente: false,
          });
        }
      }
      setTurnosAsesores(data);
    });

    return () => unsub();
  }, [puedeSonar]);

  return (
    <>
      <div className="bg-gradient-rose rounded shadow min-h-screen grid grid-cols-3">
        <div className="absolute inset-0 bg-textura"></div>

        {/* Video lado izquierdo */}
        <div className="col-span-2 h-5/6 px-4">
          <Header />
          <iframe
            id="youtube-player"
            className="w-full m-2 h-[33rem] border-4 border-neutral-50 shadow-md"
            src={videoUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>

        {/* Turnos lado derecho */}
        <div className="bg-white h-[42rem] m-3 border-8 rounded-lg border-pink-800 shadow-md">
          <div className="bg-pink-700 pt-2">
            <h2 className="text-4xl font-bold my-6 text-center text-amber-300">
              Turnos Actuales
            </h2>
            <div className="flex border border-pink-700 shadow-md">
              <h3 className="w-full text-center col-span-1 py-1 text-3xl font-semibold bg-rose-100 text-slate-700 ">
                Asesor
              </h3>
              <h3 className="w-full text-center col-span-1 py-1 text-3xl font-semibold bg-white text-pink-700 ">
                Turno
              </h3>
            </div>
          </div>
          <div className="flex flex-col p-2 mt-4 gap-6">
            {["asesor1", "asesor2", "asesor3"].map((asesor, index) => (
              <TurnoCard
                key={asesor}
                nombre="Asesor"
                number={index + 1}
                valor={turnosAsesores[asesor]?.valor || "--"}
                colorIndex={index}
                flash={flashAsesor === asesor}
              />
            ))}
          </div>
          <div className="flex justify-around">
            <Reloj />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default TurnoDisplay;
