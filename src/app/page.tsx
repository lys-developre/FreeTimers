"use client";

import { useMemo, useState } from "react";
import {
  createTimeWindow,
  rankMissions,
  type Mission,
} from "@/domain/missions";
import { createPlan } from "@/domain/plan";
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
  const [travelers, setTravelers] = useState(1);
  const [transport, setTransport] = useState<"car" | "motorcycle" | "bicycle" | "walking">("car");
  const [startsAt, setStartsAt] = useState("2026-09-19T17:00");
  const [returnDeadline, setReturnDeadline] = useState("2026-09-20T05:00");
  const [latitude, setLatitude] = useState("40.4168");
  const [longitude, setLongitude] = useState("-3.7038");
  const [saved, setSaved] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const planState = useMemo(() => {
    try {
      const plan = createPlan({
        startsAt: new Date(startsAt).toISOString(),
        returnDeadline: new Date(returnDeadline).toISOString(),
        timeZone: "Europe/Madrid",
        returnMarginMinutes: 30,
        origin: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          source: "manual",
        },
        hub: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          source: "manual",
        },
        transport:
          transport === "walking" || transport === "bicycle"
            ? { mode: transport }
            : { mode: transport, vehicleId: `demo-${transport}` },
        travelers,
        budget: { minorUnits: Math.round(budget * 100), currency: "EUR" },
      });
      return { plan, error: null };
    } catch (error) {
      return {
        plan: null,
        error: error instanceof Error ? error.message : "Configuración inválida",
      };
    }
  }, [
    budget,
    latitude,
    longitude,
    returnDeadline,
    startsAt,
    transport,
    travelers,
  ]);
  const timeWindow = useMemo(
    () => planState.plan
      ? createTimeWindow(planState.plan.startsAt, planState.plan.returnDeadline)
      : null,
    [planState.plan],
  );
  const recommendations = useMemo(
    () => timeWindow
      ? rankMissions(missions, timeWindow, { budget, tags: ["motor", "carretera"] })
      : [],
    [budget, timeWindow],
  );

  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <strong>FreeTimers</strong>
        <span>Solo para ti · Local-first</span>
      </nav>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>PLAN AHORA · CONFIGURACIÓN LOCAL</p>
        <h1>¿Qué merece la pena vivir con el tiempo que tienes?</h1>
        <p className={styles.lead}>
          No necesitas más opciones. Necesitas una misión que encaje contigo,
          ahora.
        </p>
        <p className={styles.privateNote}>
          Una herramienta personal: tus misiones y recuerdos son tuyos.
        </p>
        <div className={styles.planner}>
          <div className={styles.plannerField}>
            <label htmlFor="starts-at">Desde</label>
            <input id="starts-at" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
          </div>
          <div className={styles.plannerField}>
            <label htmlFor="return-deadline">Volver antes de</label>
            <input id="return-deadline" type="datetime-local" value={returnDeadline} onChange={(event) => setReturnDeadline(event.target.value)} />
          </div>
          <div className={styles.plannerField}>
            <label htmlFor="budget">Presupuesto total (€)</label>
            <input id="budget" type="number" min="0" step="1" value={budget} onChange={(event) => setBudget(Number(event.target.value))} />
          </div>
          <div className={styles.plannerField}>
            <label htmlFor="travelers">Personas</label>
            <input id="travelers" type="number" min="1" step="1" value={travelers} onChange={(event) => setTravelers(Number(event.target.value))} />
          </div>
          <div className={styles.plannerField}>
            <label htmlFor="transport">Cómo te mueves</label>
            <select id="transport" value={transport} onChange={(event) => setTransport(event.target.value as typeof transport)}>
              <option value="car">Coche</option>
              <option value="motorcycle">Moto</option>
              <option value="bicycle">Bicicleta</option>
              <option value="walking">A pie</option>
            </select>
          </div>
          <fieldset className={styles.locationFields}>
            <legend>Hub manual</legend>
            <label htmlFor="latitude">Latitud</label>
            <input id="latitude" inputMode="decimal" value={latitude} onChange={(event) => setLatitude(event.target.value)} />
            <label htmlFor="longitude">Longitud</label>
            <input id="longitude" inputMode="decimal" value={longitude} onChange={(event) => setLongitude(event.target.value)} />
          </fieldset>
          {planState.error ? (
            <p className={styles.formError} role="alert">{planState.error}</p>
          ) : (
            <p className={styles.formHint}>La viabilidad de regreso aún no está calculada: faltan rutas reales.</p>
          )}
        </div>
      </section>
      <section className={styles.results}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>MISIÓN RADAR</p>
            <h2>Tres formas de usar tu ventana</h2>
          </div>
          <span>{recommendations.length} propuestas demo</span>
        </div>
        <div className={styles.grid}>
          {recommendations.map((mission, index) => (
            <article className={styles.mission} key={mission.id}>
              <div className={styles.missionTopline}>
                <span className={styles.badge}>
                  {index === 0 ? "Afinidad directa" : index === 1 ? "Expansión" : "Descubrimiento"}
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
