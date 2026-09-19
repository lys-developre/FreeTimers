import { describe, expect, it } from "vitest";
import type { Vehicle } from "../domain/vehicles";
import {
  nextVehicleId,
  removeVehicle,
  upsertVehicle,
} from "./vehicle-library";

const bicycle: Vehicle = {
  id: "local-vehicle-1",
  name: "Bicicleta sintética",
  mode: "bicycle",
};

describe("vehicle library", () => {
  it("allocates the first unused local identifier", () => {
    expect(nextVehicleId([])).toBe("local-vehicle-1");
    expect(
      nextVehicleId([
        bicycle,
        { ...bicycle, id: "local-vehicle-3" },
      ]),
    ).toBe("local-vehicle-2");
  });

  it("adds a new vehicle and updates an existing vehicle in place", () => {
    expect(upsertVehicle([], bicycle)).toEqual([bicycle]);
    expect(
      upsertVehicle([bicycle], { ...bicycle, name: "Bicicleta editada" }),
    ).toEqual([{ ...bicycle, name: "Bicicleta editada" }]);
  });

  it("removes only the requested vehicle", () => {
    const second = { ...bicycle, id: "local-vehicle-2" };
    expect(removeVehicle([bicycle, second], bicycle.id)).toEqual([second]);
  });
});
