"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Cooldown puramente de UX (deshabilita el botón "Reenviar" y muestra una
 * cuenta regresiva). La verdad sobre si se puede reenviar la sigue
 * decidiendo el backend (RF-AUTH-004/018/019); si el servidor igual
 * responde 429, `startCooldown` se puede volver a llamar con el
 * `retryAfterSeconds` real para corregir el conteo local.
 */
export function useResendCooldown() {
 const [availableAt, setAvailableAt] = useState<number | null>(null);
 const [secondsLeft, setSecondsLeft] = useState(0);

 useEffect(() => {
 if (!availableAt) {
 setSecondsLeft(0);
 return;
 }

 const tick = () => {
 const remaining = Math.max(0, Math.ceil((availableAt - Date.now()) / 1000));
 setSecondsLeft(remaining);
 if (remaining <= 0) setAvailableAt(null);
 };

 tick();
 const id = setInterval(tick, 1000);
 return () => clearInterval(id);
 }, [availableAt]);

 const startCooldown = useCallback((seconds: number) => {
 setAvailableAt(Date.now() + seconds * 1000);
 }, []);

 return { secondsLeft, canResend: secondsLeft <= 0, startCooldown };
}
