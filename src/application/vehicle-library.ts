import type { Vehicle } from "../domain/vehicles";

export function nextVehicleId(vehicles: Vehicle[]): string {
  let suffix = 1;
  const existingIds = new Set(vehicles.map((vehicle) => vehicle.id));
  while (existingIds.has(`local-vehicle-${suffix}`)) {
    suffix += 1;
  }
  return `local-vehicle-${suffix}`;
}

export function upsertVehicle(
  vehicles: Vehicle[],
  updatedVehicle: Vehicle,
): Vehicle[] {
  const existingIndex = vehicles.findIndex(
    (vehicle) => vehicle.id === updatedVehicle.id,
  );
  if (existingIndex === -1) {
    return [...vehicles, updatedVehicle];
  }
  return vehicles.map((vehicle, index) =>
    index === existingIndex ? updatedVehicle : vehicle,
  );
}

export function removeVehicle(
  vehicles: Vehicle[],
  vehicleId: string,
): Vehicle[] {
  return vehicles.filter((vehicle) => vehicle.id !== vehicleId);
}
