import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function UrlVideoConfig() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const loadCurrentUrl = async () => {
      const docRef = doc(db, "config", "video");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUrl(docSnap.data().url);
      }
    };
    loadCurrentUrl();
  }, []);

  const handleSave = async () => {
    const docRef = doc(db, "config", "video");
    await updateDoc(docRef, { url });
    alert("URL actualizada con éxito");
  };

  return (
    <div className="bg-white border border-amber-300 rounded-lg p-6 shadow space-y-6 overflow-auto max-h-[36rem]">
      <h2 className="text-xl font-bold text-rose-700 mb-2">
        📝 Editar Url del video
      </h2>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={handleSave}
        className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded"
      >
        Guardar
      </button>
    </div>
  );
}

export default UrlVideoConfig;
