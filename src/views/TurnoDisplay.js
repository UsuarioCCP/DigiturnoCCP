// src/views/TurnoDisplay.jsx
import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { Reloj } from "../components/Reloj";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { TurnoCard } from "../components/TurnoCard";

function TurnoDisplay() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [flashAsesor, setFlashAsesor] = useState(null);
  const [flashTurnoValor, setFlashTurnoValor] = useState(null);
  const [turnosAsesores, setTurnosAsesores] = useState({});
  const [usuariosMap, setUsuariosMap] = useState({});
  const [ultimosTurnos, setUltimosTurnos] = useState([]);
  const [puedeSonar, setPuedeSonar] = useState(false);
  const audioRef = useRef(null);
  const playerRef = useRef(null);

  // const videoUrl =
  //   "https://www.youtube-nocookie.com/embed/videoseries?si=9fT1HFUDeVSwD3os&list=PLaZmxwblqOt6M6hgw8u3-h05kt31s5bYM&autoplay=1&mute=0&enablejsapi=1&loop=1";

  const reproducirTurnoConVoz = (turno, asesor) => {
    const mensaje = new SpeechSynthesisUtterance(
      `Turno ${turno}, asesor ${asesor}`
    );
    mensaje.lang = "es-ES"; // Español de España
    mensaje.rate = 0.9; // Un poco más lento
    mensaje.pitch = 1.0; // Tono normal
    window.speechSynthesis.speak(mensaje);
  };

  useEffect(() => {
    const fetchVideoUrl = async () => {
      const docRef = doc(db, "config", "video");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setVideoUrl(docSnap.data().url);
      } else {
        console.log("No se encontró la URL del video");
      }
    };

    fetchVideoUrl();
  }, []);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    } else {
      window.onYouTubeIframeAPIReady();
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("youtube-player", {
        events: {
          onReady: (event) => {
            setIsPlayerReady(true);
          },
        },
      });
    };
  }, []);

  useEffect(() => {
    audioRef.current = new Audio("/notificacion.mp3");
    audioRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    const habilitarSonido = () => {
      setPuedeSonar(true);
      document.removeEventListener("click", habilitarSonido);
    };
    document.addEventListener("click", habilitarSonido);
    return () => document.removeEventListener("click", habilitarSonido);
  }, []);

  const playNotificationWithResume = () => {
    if (!audioRef.current || !playerRef.current) return;

    const wasPlaying =
      typeof playerRef.current.getPlayerState === "function" &&
      playerRef.current.getPlayerState() === 1;

    // 🔴 Pausar el video antes de sonar
    if (wasPlaying) {
      playerRef.current.pauseVideo();
    }

    audioRef.current.volume = 1.0; // ✔️ Asegura volumen máximo
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => {
        // 🟢 Reanudar video después del sonido
        if (wasPlaying) {
          setTimeout(() => {
            playerRef.current.playVideo();
          }, 2000); // Ajusta según duración del sonido
        }
      })
      .catch((e) => {
        console.warn("No se pudo reproducir sonido:", e);
      });
  };

  // Cargar usuarios y mapear por asesorId
  useEffect(() => {
    const cargarUsuarios = async () => {
      const snapshot = await getDocs(collection(db, "usuarios"));
      const mapa = {};
      snapshot.forEach((docu) => {
        const data = docu.data();
        mapa[data.asesorId] = {
          ...data,
        };
      });
      setUsuariosMap(mapa);
    };

    cargarUsuarios();
  }, []);

  // Escuchar cambios en turnosAsesores
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "turnosAsesores"),
      async (snapshot) => {
        const data = {};

        for (const docSnap of snapshot.docs) {
          const info = docSnap.data();
          const id = docSnap.id;
          data[id] = info;

          if (info.llamarNuevamente && info.valor) {
            const nuevoTurno = {
              asesor: id,
              valor: info.valor,
              llamados: info.llamados || 1,
            };

            setUltimosTurnos((prev) => {
              const yaExiste = prev.find(
                (t) => t.asesor === id && t.valor === info.valor
              );

              // Si ya existe pero con los mismos llamados, no hacer nada
              if (yaExiste && yaExiste.llamados === nuevoTurno.llamados) {
                return prev;
              }

              // Si es nuevo o aumentaron los llamados, actualizar
              const sinRepetidos = prev.filter(
                (t) => !(t.asesor === id && t.valor === info.valor)
              );

              return [nuevoTurno, ...sinRepetidos].slice(0, 3);
            });

            // Activar flash solo si es una llamada nueva o llamada repetida
            setFlashAsesor(id);
            setFlashTurnoValor(info.valor);

            if (puedeSonar) {
              playNotificationWithResume();
              const asesorNum = usuariosMap[parseInt(id)]?.asesorId || id;
              reproducirTurnoConVoz(info.valor, asesorNum);
            }

            setTimeout(() => {
              setFlashAsesor(null);
              setFlashTurnoValor(null);
            }, 1200);

            await setDoc(
              doc(db, "turnosAsesores", id),
              { llamarNuevamente: false },
              { merge: true }
            );
          }
        }

        setTurnosAsesores(data);
      }
    );

    return () => unsub();
  }, [puedeSonar]);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gradient-rose">
        {/* Header */}
        <Header />

        {/* Fondo decorativo fijo */}
        <div
          style={{
            width: "100vw",
            height: "15vh",
            backgroundImage: "url('/fondoWeb.png')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Contenido principal centrado verticalmente */}
        <div className="flex-1 self-auto grid grid-cols-3">
          {/* Columna del video */}
          <div className="col-span-2 flex justify-center h-full ">
            <iframe
              id="youtube-player"
              className="w-full h-full flex self-start border-8 border-pink-800 shadow-md"
              src={videoUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>

          {/* Columna de turnos */}
          <div className="flex flex-col justify-between min-h-full bg-white border-8 border-pink-800 shadow-md">
            <div className="bg-pink-700 pt-1">
              <h2 className="text-3xl font-bold text-center text-amber-300">
                Turnos Actuales
              </h2>
              <div className="flex border border-pink-700 shadow-md">
                <h3 className="w-full text-center py-1 text-3xl font-semibold bg-rose-100 text-slate-700">
                  Asesor
                </h3>
                <h3 className="w-full text-center py-1 text-3xl font-semibold bg-white text-pink-700">
                  Turno
                </h3>
              </div>
            </div>

            <div className="flex flex-col p-2 mt-2 gap-3 ">
              {[0, 1, 2].map((index) => {
                const turno = ultimosTurnos[index];
                if (!turno) {
                  return <div key={index} className="h-[80px] opacity-0" />;
                }

                const scaleClass = ["scale-100", "scale-95", "scale-90"][index];
                const opacityClass = [
                  "opacity-100",
                  "opacity-90",
                  "opacity-80",
                ][index];
                const asesorId = parseInt(
                  turnosAsesores[turno.asesor]?.asesorId,
                  10
                );
                const asesorData = usuariosMap[asesorId];

                return (
                  <div
                    key={`${turno.asesor}-${turno.valor}-${index}`}
                    className={`transition-transform duration-500 transform ${scaleClass} ${opacityClass}`}
                  >
                    <TurnoCard
                      nombre={asesorData?.asesorId || turno.asesor}
                      number={index + 1}
                      valor={turno.valor}
                      colorIndex={index}
                      flash={
                        turno.valor === flashTurnoValor &&
                        turno.asesor === flashAsesor
                      }
                      actual={index === 0}
                    >
                      {index === 0 && turno.llamados > 1 && (
                        <p className="text-xs text-gray-600 text-center mt-1">
                          {`${turno.llamados}º llamado`}
                        </p>
                      )}
                    </TurnoCard>
                  </div>
                );
              })}
            </div>

            <div className="pb-2">
              <Reloj />
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

export default TurnoDisplay;

{
  /* <>
      <Header />
      <div
        style={{
          width: "100vw",
          height: "16vh",
          backgroundImage: "url('fondoWeb.png')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative min-h-full bg-gradient-rose grid grid-cols-3 items-center">
        <div className="col-span-2 px-4 flex justify-center">
          <iframe
            id="youtube-player"
            className="w-full mx-2 h-[38rem] border-4 border-neutral-50 shadow-md"
            src={videoUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>

        <div className="flex flex-col justify-between bg-white min-h-full mx-1 border-8 rounded-lg border-pink-800 shadow-md">
          <div className="bg-pink-700 pt-1">
            <h2 className="text-3xl font-bold text-center text-amber-300">
              Turnos Actuales
            </h2>
            <div className="flex border border-pink-700 shadow-md">
              <h3 className="w-full text-center py-1 text-3xl font-semibold bg-rose-100 text-slate-700">
                Asesor
              </h3>
              <h3 className="w-full text-center py-1 text-3xl font-semibold bg-white text-pink-700">
                Turno
              </h3>
            </div>
          </div>

          <div className="flex flex-col p-2 mt-2 gap-3">
            {[0, 1, 2].map((index) => {
              const turno = ultimosTurnos[index];
              if (!turno) {
                return <div key={index} className="h-[80px] opacity-0" />;
              }

              const scaleClass = ["scale-105", "scale-95", "scale-90"][index];
              const opacityClass = ["opacity-100", "opacity-90", "opacity-80"][
                index
              ];
              const asesorId = parseInt(
                turnosAsesores[turno.asesor]?.asesorId,
                10
              );
              const asesorData = usuariosMap[asesorId];

              return (
                <div
                  key={`${turno.asesor}-${turno.valor}-${index}`}
                  className={`transition-transform duration-500 transform ${scaleClass} ${opacityClass}`}
                >
                  <TurnoCard
                    nombre={asesorData?.asesorId || turno.asesor}
                    number={index + 1}
                    valor={turno.valor}
                    colorIndex={index}
                    flash={
                      turno.valor === flashTurnoValor &&
                      turno.asesor === flashAsesor
                    }
                    actual={index === 0}
                  >
                    {index === 0 && turno.llamados > 1 && (
                      <p className="text-xs text-gray-600 text-center mt-1">
                        {`${turno.llamados}º llamado`}
                      </p>
                    )}
                  </TurnoCard>
                </div>
              );
            })}
          </div>

          <div className="justify-around pb-2">
            <Reloj />
          </div>
        </div>
      </div>

      <Footer />
    </> */
}
