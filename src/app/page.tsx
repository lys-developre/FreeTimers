"use client";

import { useMemo, useState } from "react";
import {
  createTimeWindow,
  rankMissions,
  type Mission,
} from "@/domain/missions";
import styles from "./page.module.css";

const missions: Mission[] = [
  {
    id: "rally-granada",
    title: "Rally + carretera panorámica",
    summary: "Motor, curvas y un pueblo que todavía no conoces.",
    durationMinutes: 480,
    distanceKm: 90,
    estimatedCost: 55,
    tags: ["motor", "carretera"],
  },
  {
    id: "cielo-sierra-nevada",
    title: "Cielo oscuro en Sierra Nevada",
    summary: "Una noche de estrellas lejos de la ciudad.",
    durationMinutes: 360,
    distanceKm: 72,
    estimatedCost: 25,
    tags: ["naturaleza", "fotografía"],
  },
  {
    id: "vendimia-alpujarra",
    title: "Vendimia y pueblos de la Alpujarra",
    summary: "Producto local, paisaje y ritmo lento.",
    durationMinutes: 600,
    distanceKm: 110,
    estimatedCost: 80,
    tags: ["comida", "pueblos"],
  },
];

export default function Home() {
  const [budget, setBudget] = useState(100);
  const [saved, setSaved] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const window = useMemo(
    () =>
      createTimeWindow(
        "2026-09-19T17:00:00+02:00",
        "2026-09-20T05:00:00+02:00",
      ),
    [],
  );
  const recommendations = useMemo(
    () => rankMissions(missions, window, { budget, tags: ["motor", "carretera"] }),
    [budget, window],
  );

  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <strong>FreeTimers</strong>
        <span>Solo para ti · Local-first</span>
      </nav>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>SÁBADO · 12 HORAS DISPONIBLES</p>
        <h1>¿Qué merece la pena vivir con el tiempo que tienes?</h1>
        <p className={styles.lead}>
          No necesitas más opciones. Necesitas una misión que encaje contigo,
          ahora.
        </p>
        <p className={styles.privateNote}>
          Una herramienta personal: tus misiones y recuerdos son tuyos.
        </p>
        <div className={styles.windowCard}>
          <div>
            <span className={styles.label}>Tu ventana</span>
            <strong>Viernes 17:00 → Sábado 05:00</strong>
          </div>
          <label>
            Presupuesto
            <input
              type="number"
              min="0"
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value))}
            />
            €
          </label>
        </div>
      </section>
      <section className={styles.results}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>MISIÓN RADAR</p>
            <h2>Tres formas de usar tu ventana</h2>
          </div>
          <span>{recommendations.length} compatibles</span>
        </div>
        <div className={styles.grid}>
          {recommendations.map((mission, index) => (
            <article className={styles.mission} key={mission.id}>
              <div className={styles.missionTopline}>
                <span className={styles.badge}>
                  {index === 0 ? "Zona segura" : index === 1 ? "Expansión" : "Descubrimiento"}
                </span>
                <span className={styles.score}>{mission.score}%</span>
              </div>
              <h3>{mission.title}</h3>
              <p>{mission.summary}</p>
              <div className={styles.meta}>
                <span>{Math.round(mission.durationMinutes / 60)} h</span>
                <span>{mission.distanceKm} km</span>
                <span>{mission.estimatedCost} €</span>
              </div>
              <ul>
                {mission.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              <div className={styles.actions}>
                <button
                  className={styles.primary}
                  onClick={() => setActive(mission.id)}
                >
                  {active === mission.id ? "Misión activa" : "Activar misión"}
                </button>
                <button
                  className={styles.secondary}
                  onClick={() =>
                    setSaved((current) =>
                      current.includes(mission.id)
                        ? current.filter((id) => id !== mission.id)
                        : [...current, mission.id],
                    )
                  }
                >
                  {saved.includes(mission.id) ? "Guardada" : "Secondary mission"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
