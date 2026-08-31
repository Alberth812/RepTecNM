"use client";

import { useEffect, useState } from "react";

export function AvatarSesion() {
  const [foto, setFoto] = useState("");
  const [nombre, setNombre] = useState("Administración");

  useEffect(() => {
    setFoto(localStorage.getItem("rep-avatar") ?? "");
    setNombre(localStorage.getItem("rep-usuario") ?? "Administración");
  }, []);

  const iniciales = nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return foto ? (
    <img src={foto} alt="Foto de perfil" className="h-9 w-9 rounded-full border object-cover" />
  ) : (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004B87] text-xs font-bold text-white">
      {iniciales}
    </div>
  );
}
