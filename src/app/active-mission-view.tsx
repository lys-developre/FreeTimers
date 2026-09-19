"use client";

import { useState } from "react";
import {
  addChecklistItem,
  beginReturn,
  completeMission,
  confirmVisitArrival,
  confirmVisitDeparture,
  isMissionReady,
  removeChecklistItem,
  setChecklistItemCompleted,
  skipVisit,
  startMission,
  type ActiveMission,
  type ChecklistImportance,
} from "@/domain/active-mission";
import styles from "./active-mission-view.module.css";

type ActiveMissionViewProps = {
  mission: ActiveMission;
  onChange: (mission: ActiveMission) => void;
  onBackToPlanning: () => void;
};

const statusLabels: Record<ActiveMission["status"], string> = {
  preparing: "Preparando",
  active: "En marcha",
  returning: "Volviendo",
  completed: "Completada",
};

export function ActiveMissionView({
  mission,
  onChange,
  onBackToPlanning,
}: ActiveMissionViewProps) {
  const [checklistText, setChecklistText] = useState("");
  const [importance, setImportance] =
    useState<ChecklistImportance>("optional");
  const nextVisit = mission.visits.find(
    (visit) =>
      visit.status === "pending" ||
      visit.status === "arrived" ||
      visit.status === "in_progress",
  );

  function addItem() {
    const text = checklistText.trim();
    if (!text) {
      return;
    }
    onChange(
      addChecklistItem(mission, {
        id: crypto.randomUUID(),
        text,
        importance,
      }),
    );
    setChecklistText("");
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <strong>FreeTimers</strong>
        <button type="button" onClick={onBackToPlanning}>
          Ajustar planificación
        </button>
      </nav>

      <section className={styles.statusPanel}>
        <p className={styles.eyebrow}>MISIÓN ACTIVA · REVISIÓN {mission.revision}</p>
        <div className={styles.statusHeading}>
          <div>
            <h1>{mission.visits[0]?.title ?? "Plan activo"}</h1>
            <p>{statusLabels[mission.status]}</p>
          </div>
          <div className={styles.deadline}>
            <span>Volver antes de</span>
            <strong>
              {new Intl.DateTimeFormat("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: mission.plan.timeZone,
              }).format(new Date(mission.plan.returnDeadline))}
            </strong>
            <small>{mission.plan.returnMarginMinutes} min de margen</small>
          </div>
        </div>
        <p className={styles.unknown}>
          Sin rutas actuales: todavía no podemos calcular el regreso. El hub y
          la hora límite permanecen fijos.
        </p>
        {mission.status === "active" ? (
          <button
            className={styles.returnAction}
            type="button"
            onClick={() => onChange(beginReturn(mission, new Date().toISOString()))}
          >
            Volver ahora
          </button>
        ) : null}
      </section>

      <div className={styles.layout}>
        <section className={styles.routePanel}>
          <p className={styles.eyebrow}>MAPA Y RUTA</p>
          <div className={styles.mapPlaceholder}>
            <strong>Mapa pendiente de proveedor</strong>
            <span>
              Esta superficie no inventa una ruta ni una hora de llegada.
            </span>
          </div>
          {nextVisit ? (
            <article className={styles.nextVisit}>
              <span>Próxima visita</span>
              <h2>{nextVisit.title}</h2>
              <p>{nextVisit.recommendedDurationMinutes} min recomendados</p>
              {mission.status === "preparing" ? (
                <p className={styles.preparationHint}>
                  Completa la checklist e inicia la misión para registrar el
                  progreso.
                </p>
              ) : null}
              {mission.status === "active" ? (
                <div className={styles.actions}>
                  {nextVisit.status === "pending" ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          onChange(
                            confirmVisitArrival(
                              mission,
                              nextVisit.id,
                              new Date().toISOString(),
                            ),
                          )
                        }
                      >
                        Confirmar llegada
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange(skipVisit(mission, nextVisit.id))}
                      >
                        Omitir visita
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onChange(
                          confirmVisitDeparture(
                            mission,
                            nextVisit.id,
                            new Date().toISOString(),
                          ),
                        )
                      }
                    >
                      Confirmar salida
                    </button>
                  )}
                </div>
              ) : null}
            </article>
          ) : (
            <p className={styles.empty}>No quedan visitas pendientes.</p>
          )}
        </section>

        <aside className={styles.checklistPanel}>
          <p className={styles.eyebrow}>ANTES DE SALIR</p>
          <h2>Checklist de esta misión</h2>
          <ul>
            {mission.checklist.map((item) => (
              <li key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={(event) =>
                      onChange(
                        setChecklistItemCompleted(
                          mission,
                          item.id,
                          event.target.checked,
                        ),
                      )
                    }
                  />
                  <span>{item.text}</span>
                  {item.importance === "required" ? (
                    <small>Obligatorio</small>
                  ) : null}
                </label>
                <button
                  type="button"
                  aria-label={`Eliminar ${item.text}`}
                  onClick={() => onChange(removeChecklistItem(mission, item.id))}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.addItem}>
            <label htmlFor="checklist-item">Añadir recordatorio</label>
            <input
              id="checklist-item"
              value={checklistText}
              onChange={(event) => setChecklistText(event.target.value)}
            />
            <select
              aria-label="Importancia"
              value={importance}
              onChange={(event) =>
                setImportance(event.target.value as ChecklistImportance)
              }
            >
              <option value="optional">Opcional</option>
              <option value="required">Obligatorio</option>
            </select>
            <button type="button" onClick={addItem}>
              Añadir
            </button>
          </div>
          {mission.status === "preparing" ? (
            <button
              className={styles.primaryAction}
              type="button"
              disabled={!isMissionReady(mission)}
              onClick={() =>
                onChange(startMission(mission, new Date().toISOString()))
              }
            >
              {isMissionReady(mission)
                ? "Comenzar misión"
                : "Completa lo obligatorio"}
            </button>
          ) : null}
          {mission.status === "returning" ? (
            <button
              className={styles.primaryAction}
              type="button"
              onClick={() =>
                onChange(completeMission(mission, new Date().toISOString()))
              }
            >
              Confirmar regreso
            </button>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
