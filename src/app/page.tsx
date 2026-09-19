"use client";

import { useEffect, useMemo, useState } from "react";
import { loadLocalState, saveLocalState } from "@/adapters/indexed-db";
import {
  exportLocalState,
  importLocalState,
  type LocalState,
} from "@/adapters/local-state";
import {
  createTimeWindow,
  rankMissions,
  type Mission,
} from "@/domain/missions";
import { createPlan } from "@/domain/plan";
import type { Vehicle } from "@/domain/vehicles";
import {
  createConfiguredVehicle,
  type VehicleDraft,
} from "@/application/vehicle-configuration";
import {
  nextVehicleId,
  removeVehicle,
  upsertVehicle,
} from "@/application/vehicle-library";
import styles from "./page.module.css";

function toDateTimeLocal(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function missionCategory(index: number): string {
  if (index === 0) {
    return "Afinidad directa";
  }
  if (index === 1) {
    return "Expansión";
  }
  return "Descubrimiento";
}

function storageStatusMessage(
  status: "loading" | "ready" | "error",
): string {
  if (status === "loading") {
    return "Cargando tu configuración local…";
  }
  if (status === "ready") {
    return "Configuración guardada solo en este dispositivo.";
  }
  return "No se pudo acceder al almacenamiento local.";
}

const defaultVehicleDraft: VehicleDraft = {
  id: "local-vehicle-1",
  name: "",
  energyKind: "fuel",
  consumptionPer100Km: "6.5",
  costPerUnit: "1.75",
  usableRangeKm: "650",
};

function newVehicleDraft(vehicles: Vehicle[]): VehicleDraft {
  return {
    ...defaultVehicleDraft,
    id: nextVehicleId(vehicles),
  };
}

function draftFromVehicle(vehicle: Vehicle): VehicleDraft {
  return {
    id: vehicle.id,
    name: vehicle.name,
    energyKind: vehicle.energy?.kind ?? "fuel",
    consumptionPer100Km:
      vehicle.energy === undefined
        ? defaultVehicleDraft.consumptionPer100Km
        : String(vehicle.energy.consumptionPer100Km),
    costPerUnit:
      vehicle.energy === undefined
        ? defaultVehicleDraft.costPerUnit
        : String(vehicle.energy.costPerUnitMinor / 100),
    usableRangeKm:
      vehicle.usableRangeKm === undefined
        ? defaultVehicleDraft.usableRangeKm
        : String(vehicle.usableRangeKm),
  };
}

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
  const [storageStatus, setStorageStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [vehicleMessage, setVehicleMessage] = useState<string | null>(null);
  const [vehicleDraft, setVehicleDraft] =
    useState<VehicleDraft>(defaultVehicleDraft);
  const compatibleVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.mode === transport),
    [transport, vehicles],
  );
  const selectedVehicle = compatibleVehicles.find(
    (vehicle) => vehicle.id === selectedVehicleId,
  );
  const planState = useMemo(() => {
    try {
      if (transport !== "walking" && !selectedVehicle) {
        throw new RangeError(
          "Selecciona o guarda una ficha de vehículo compatible.",
        );
      }
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
          transport === "walking"
            ? { mode: transport }
            : { mode: transport, vehicleId: selectedVehicle?.id },
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
    selectedVehicle,
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
  const storageMessage = storageStatusMessage(storageStatus);

  useEffect(() => {
    let cancelled = false;
    void loadLocalState()
      .then((state) => {
        if (cancelled) {
          return;
        }
        if (state?.plan) {
          setStartsAt(toDateTimeLocal(state.plan.startsAt));
          setReturnDeadline(toDateTimeLocal(state.plan.returnDeadline));
          setBudget(state.plan.budget.minorUnits / 100);
          setTravelers(state.plan.travelers);
          setTransport(state.plan.transport.mode);
          setLatitude(String(state.plan.hub.latitude));
          setLongitude(String(state.plan.hub.longitude));
        }
        const storedVehicles = state?.vehicles ?? [];
        setVehicles(storedVehicles);
        setSaved(state?.savedMissionIds ?? []);
        setActive(state?.activeMissionId ?? null);
        const selectedId =
          state?.plan?.transport.mode === "walking"
            ? undefined
            : state?.plan?.transport.vehicleId;
        const storedVehicle =
          storedVehicles.find((vehicle) => vehicle.id === selectedId) ??
          storedVehicles.find(
            (vehicle) => vehicle.mode === state?.plan?.transport.mode,
          );
        if (storedVehicle) {
          setSelectedVehicleId(storedVehicle.id);
          setVehicleDraft(draftFromVehicle(storedVehicle));
        } else {
          setSelectedVehicleId(null);
          setVehicleDraft(newVehicleDraft(storedVehicles));
        }
        setStorageStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStorageStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (storageStatus !== "ready" || !planState.plan) {
      return;
    }
    void saveLocalState({
      schemaVersion: 1,
      plan: planState.plan,
      vehicles,
      savedMissionIds: saved,
      activeMissionId: active,
    }).catch(() => {
      setStorageStatus("error");
    });
  }, [active, planState.plan, saved, storageStatus, vehicles]);

  function applyStoredPlan(state: LocalState) {
    if (state.plan) {
      setStartsAt(toDateTimeLocal(state.plan.startsAt));
      setReturnDeadline(toDateTimeLocal(state.plan.returnDeadline));
      setBudget(state.plan.budget.minorUnits / 100);
      setTravelers(state.plan.travelers);
      setTransport(state.plan.transport.mode);
      setLatitude(String(state.plan.hub.latitude));
      setLongitude(String(state.plan.hub.longitude));
    }
    setSaved(state.savedMissionIds);
    setActive(state.activeMissionId);
    setVehicles(state.vehicles);
    const selectedId =
      state.plan?.transport.mode === "walking"
        ? undefined
        : state.plan?.transport.vehicleId;
    const storedVehicle =
      state.vehicles.find((vehicle) => vehicle.id === selectedId) ??
      state.vehicles.find(
        (vehicle) => vehicle.mode === state.plan?.transport.mode,
      );
    if (storedVehicle) {
      setSelectedVehicleId(storedVehicle.id);
      setVehicleDraft(draftFromVehicle(storedVehicle));
    } else {
      setSelectedVehicleId(null);
      setVehicleDraft(newVehicleDraft(state.vehicles));
    }
  }

  function handleExport() {
    if (!planState.plan) {
      setStorageStatus("error");
      return;
    }
    const serialized = exportLocalState({
      schemaVersion: 1,
      plan: planState.plan,
      vehicles,
      savedMissionIds: saved,
      activeMissionId: active,
    });
    const url = URL.createObjectURL(
      new Blob([serialized], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "freetimers-plan.json";
    link.click();
    URL.revokeObjectURL(url);
    setStorageStatus("ready");
  }

  async function handleImport(file: File | undefined) {
    if (!file) {
      return;
    }
    try {
      const serialized = await file.text();
      const state = importLocalState(serialized);
      applyStoredPlan(state);
      setStorageStatus("ready");
    } catch {
      setStorageStatus("error");
    } finally {
      setFileInputKey((key) => key + 1);
    }
  }

  function handleTransportChange(mode: typeof transport) {
    setTransport(mode);
    setVehicleMessage(null);
    if (mode === "walking") {
      setSelectedVehicleId(null);
      return;
    }
    const firstCompatible = vehicles.find((vehicle) => vehicle.mode === mode);
    setSelectedVehicleId(firstCompatible?.id ?? null);
    setVehicleDraft(
      firstCompatible
        ? draftFromVehicle(firstCompatible)
        : newVehicleDraft(vehicles),
    );
  }

  function handleVehicleSelection(vehicleId: string) {
    const vehicle = vehicles.find((candidate) => candidate.id === vehicleId);
    if (!vehicle) {
      setSelectedVehicleId(null);
      setVehicleMessage("La ficha seleccionada ya no está disponible.");
      return;
    }
    setSelectedVehicleId(vehicle.id);
    setVehicleDraft(draftFromVehicle(vehicle));
    setVehicleMessage(null);
  }

  function handleNewVehicle() {
    setSelectedVehicleId(null);
    setVehicleDraft(newVehicleDraft(vehicles));
    setVehicleMessage("Completa los datos y guarda la nueva ficha.");
  }

  function handleSaveVehicle() {
    try {
      const vehicle = createConfiguredVehicle(transport, vehicleDraft);
      if (!vehicle) {
        throw new RangeError("walking does not use a vehicle profile");
      }
      setVehicles((current) => upsertVehicle(current, vehicle));
      setSelectedVehicleId(vehicle.id);
      setVehicleDraft(draftFromVehicle(vehicle));
      setVehicleMessage("Ficha guardada y seleccionada.");
    } catch {
      setVehicleMessage("Revisa los datos antes de guardar la ficha.");
    }
  }

  function handleDeleteVehicle() {
    if (!selectedVehicle) {
      return;
    }
    const confirmed = window.confirm(
      `¿Eliminar la ficha “${selectedVehicle.name}” de este dispositivo?`,
    );
    if (!confirmed) {
      return;
    }
    const remainingVehicles = removeVehicle(vehicles, selectedVehicle.id);
    const nextCompatible = remainingVehicles.find(
      (vehicle) => vehicle.mode === transport,
    );
    setVehicles(remainingVehicles);
    setSelectedVehicleId(nextCompatible?.id ?? null);
    setVehicleDraft(
      nextCompatible
        ? draftFromVehicle(nextCompatible)
        : newVehicleDraft(remainingVehicles),
    );
    if (!nextCompatible) {
      setTransport("walking");
    }
    setVehicleMessage("Ficha eliminada.");
  }

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
            <select
              id="transport"
              value={transport}
              onChange={(event) =>
                handleTransportChange(event.target.value as typeof transport)
              }
            >
              <option value="car">Coche</option>
              <option value="motorcycle">Moto</option>
              <option value="bicycle">Bicicleta</option>
              <option value="walking">A pie</option>
            </select>
          </div>
          {transport !== "walking" ? (
            <fieldset className={styles.vehicleFields}>
              <legend>Mis vehículos</legend>
              <div className={styles.plannerField}>
                <label htmlFor="selected-vehicle">Ficha para este plan</label>
                <select
                  id="selected-vehicle"
                  value={selectedVehicleId ?? ""}
                  onChange={(event) =>
                    handleVehicleSelection(event.target.value)
                  }
                >
                  <option value="">
                    {compatibleVehicles.length === 0
                      ? "No hay fichas guardadas"
                      : "Selecciona una ficha"}
                  </option>
                  {compatibleVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.vehicleToolbar}>
                <button
                  className={styles.secondary}
                  type="button"
                  onClick={handleNewVehicle}
                >
                  Nueva ficha
                </button>
                <span>
                  {vehicles.length} {vehicles.length === 1 ? "ficha" : "fichas"} en este dispositivo
                </span>
              </div>
              <div className={styles.plannerField}>
                <label htmlFor="vehicle-name">Nombre</label>
                <input
                  id="vehicle-name"
                  value={vehicleDraft.name}
                  onChange={(event) =>
                    setVehicleDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              {transport === "bicycle" ? (
                <p className={styles.formHint}>
                  La bicicleta se guarda sin inventar consumo ni coste energético.
                </p>
              ) : (
                <>
                  <div className={styles.plannerField}>
                    <label htmlFor="energy-kind">Energía</label>
                    <select
                      id="energy-kind"
                      value={vehicleDraft.energyKind}
                      onChange={(event) =>
                        setVehicleDraft((current) => ({
                          ...current,
                          energyKind: event.target
                            .value as VehicleDraft["energyKind"],
                        }))
                      }
                    >
                      <option value="fuel">Combustible</option>
                      <option value="electric">Electricidad</option>
                    </select>
                  </div>
                  <div className={styles.plannerField}>
                    <label htmlFor="vehicle-consumption">
                      Consumo por 100 km
                    </label>
                    <input
                      id="vehicle-consumption"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={vehicleDraft.consumptionPer100Km}
                      onChange={(event) =>
                        setVehicleDraft((current) => ({
                          ...current,
                          consumptionPer100Km: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className={styles.plannerField}>
                    <label htmlFor="energy-price">
                      Precio por {vehicleDraft.energyKind === "fuel" ? "litro" : "kWh"} (€)
                    </label>
                    <input
                      id="energy-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={vehicleDraft.costPerUnit}
                      onChange={(event) =>
                        setVehicleDraft((current) => ({
                          ...current,
                          costPerUnit: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className={styles.plannerField}>
                    <label htmlFor="usable-range">Autonomía utilizable (km)</label>
                    <input
                      id="usable-range"
                      type="number"
                      min="0.01"
                      step="0.1"
                      value={vehicleDraft.usableRangeKm}
                      onChange={(event) =>
                        setVehicleDraft((current) => ({
                          ...current,
                          usableRangeKm: event.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              )}
              <div className={styles.vehicleActions}>
                <button
                  className={styles.primary}
                  type="button"
                  onClick={handleSaveVehicle}
                >
                  {selectedVehicle ? "Guardar cambios" : "Guardar ficha"}
                </button>
                <button
                  className={styles.secondary}
                  type="button"
                  onClick={handleDeleteVehicle}
                  disabled={!selectedVehicle}
                >
                  Eliminar ficha
                </button>
              </div>
              {vehicleMessage ? (
                <output className={styles.vehicleMessage}>
                  {vehicleMessage}
                </output>
              ) : null}
            </fieldset>
          ) : null}
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
          <output className={styles.storageStatus}>{storageMessage}</output>
          <div className={styles.storageActions}>
            <button
              className={styles.secondary}
              type="button"
              onClick={handleExport}
              disabled={!planState.plan}
            >
              Exportar configuración
            </button>
            <label className={styles.secondary}>
              <span>Importar configuración</span>
              <input
                key={fileInputKey}
                className={styles.fileInput}
                type="file"
                accept="application/json,.json"
                onChange={(event) => void handleImport(event.target.files?.[0])}
              />
            </label>
          </div>
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
                  {missionCategory(index)}
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
