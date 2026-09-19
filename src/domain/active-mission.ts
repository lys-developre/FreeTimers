import { createPlan, parsePlan, type Plan, type PlanLocation } from "./plan";

export type ActiveMissionStatus =
  | "preparing"
  | "active"
  | "returning"
  | "completed";
export type VisitStatus =
  | "pending"
  | "arrived"
  | "in_progress"
  | "completed"
  | "skipped";
export type ChecklistImportance = "required" | "optional";

export type MissionVisitInput = {
  id: string;
  title: string;
  location: Pick<PlanLocation, "latitude" | "longitude">;
  recommendedDurationMinutes: number;
};

export type MissionVisit = MissionVisitInput & {
  status: VisitStatus;
  arrivedAt?: string;
  departedAt?: string;
};

export type ChecklistItem = {
  id: string;
  text: string;
  importance: ChecklistImportance;
  completed: boolean;
};

export type ActiveMission = {
  id: string;
  revision: number;
  status: ActiveMissionStatus;
  plan: Plan;
  createdAt: string;
  startedAt?: string;
  returnStartedAt?: string;
  completedAt?: string;
  visits: MissionVisit[];
  checklist: ChecklistItem[];
};

export type ItineraryProposal = {
  id: string;
  baseRevision: number;
  visits: MissionVisit[];
  reasons: string[];
  createdAt: string;
};

type ActiveMissionInput = {
  id: string;
  plan: Plan;
  createdAt: string;
  visits: MissionVisitInput[];
  checklist?: ChecklistItem[];
};

function requiredText(value: string, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new RangeError(`${field} is required`);
  }
  return value;
}

function timestamp(value: string, field: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new RangeError(`${field} must be a valid timestamp`);
  }
  return new Date(parsed).toISOString();
}

function optionalTimestamp(value: unknown, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new TypeError(`${field} must be a string`);
  }
  return timestamp(value, field);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown, field: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new TypeError(`${field} must be an object`);
  }
  return value;
}

function stringValue(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new TypeError(`${field} must be a string`);
  }
  return requiredText(value, field);
}

function visitStatus(value: unknown): VisitStatus {
  if (
    value !== "pending" &&
    value !== "arrived" &&
    value !== "in_progress" &&
    value !== "completed" &&
    value !== "skipped"
  ) {
    throw new RangeError("visit.status is unsupported");
  }
  return value;
}

function missionStatus(value: unknown): ActiveMissionStatus {
  if (
    value !== "preparing" &&
    value !== "active" &&
    value !== "returning" &&
    value !== "completed"
  ) {
    throw new RangeError("mission.status is unsupported");
  }
  return value;
}

function checklistImportance(value: unknown): ChecklistImportance {
  if (value !== "required" && value !== "optional") {
    throw new RangeError("checklist.importance is unsupported");
  }
  return value;
}

function booleanValue(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") {
    throw new TypeError(`${field} must be boolean`);
  }
  return value;
}

function uniqueIds(items: { id: string }[], field: string): void {
  const ids = new Set(items.map((item) => item.id));
  if (ids.size !== items.length) {
    throw new RangeError(`${field} ids must be unique`);
  }
}

function validateChecklistItem(item: ChecklistItem): ChecklistItem {
  requiredText(item.id, "checklist.id");
  requiredText(item.text, "checklist.text");
  if (item.importance !== "required" && item.importance !== "optional") {
    throw new RangeError("checklist.importance is unsupported");
  }
  if (typeof item.completed !== "boolean") {
    throw new TypeError("checklist.completed must be boolean");
  }
  return { ...item };
}

function validateVisitInput(visit: MissionVisitInput): MissionVisitInput {
  requiredText(visit.id, "visit.id");
  requiredText(visit.title, "visit.title");
  if (
    !Number.isFinite(visit.location.latitude) ||
    visit.location.latitude < -90 ||
    visit.location.latitude > 90
  ) {
    throw new RangeError("visit.location.latitude is invalid");
  }
  if (
    !Number.isFinite(visit.location.longitude) ||
    visit.location.longitude < -180 ||
    visit.location.longitude > 180
  ) {
    throw new RangeError("visit.location.longitude is invalid");
  }
  if (
    !Number.isFinite(visit.recommendedDurationMinutes) ||
    visit.recommendedDurationMinutes <= 0
  ) {
    throw new RangeError(
      "visit.recommendedDurationMinutes must be finite and positive",
    );
  }
  return {
    ...visit,
    location: { ...visit.location },
  };
}

function updateVisit(
  mission: ActiveMission,
  visitId: string,
  update: (visit: MissionVisit) => MissionVisit,
): ActiveMission {
  let found = false;
  const visits = mission.visits.map((visit) => {
    if (visit.id !== visitId) {
      return visit;
    }
    found = true;
    return update(visit);
  });
  if (!found) {
    throw new RangeError("visit does not exist");
  }
  return { ...mission, visits, revision: mission.revision + 1 };
}

export function createActiveMission(input: ActiveMissionInput): ActiveMission {
  requiredText(input.id, "mission.id");
  const visits = input.visits.map((visit) => ({
    ...validateVisitInput(visit),
    status: "pending" as const,
  }));
  const checklist = (input.checklist ?? []).map(validateChecklistItem);
  uniqueIds(visits, "visit");
  uniqueIds(checklist, "checklist");

  return {
    id: input.id,
    revision: 1,
    status: "preparing",
    plan: createPlan(input.plan),
    createdAt: timestamp(input.createdAt, "createdAt"),
    visits,
    checklist,
  };
}

export function parseActiveMission(value: unknown): ActiveMission {
  const input = record(value, "activeMission");
  const plan = parsePlan(input.plan);
  if (!Array.isArray(input.visits)) {
    throw new TypeError("activeMission.visits must be an array");
  }
  const visits = input.visits.map((rawVisit, index): MissionVisit => {
    const visit = record(rawVisit, `activeMission.visits[${index}]`);
    const location = record(
      visit.location,
      `activeMission.visits[${index}].location`,
    );
    const validatedInput = validateVisitInput({
      id: stringValue(visit.id, `activeMission.visits[${index}].id`),
      title: stringValue(visit.title, `activeMission.visits[${index}].title`),
      location: {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      },
      recommendedDurationMinutes: Number(visit.recommendedDurationMinutes),
    });
    return {
      ...validatedInput,
      status: visitStatus(visit.status),
      arrivedAt: optionalTimestamp(
        visit.arrivedAt,
        `activeMission.visits[${index}].arrivedAt`,
      ),
      departedAt: optionalTimestamp(
        visit.departedAt,
        `activeMission.visits[${index}].departedAt`,
      ),
    };
  });
  if (!Array.isArray(input.checklist)) {
    throw new TypeError("activeMission.checklist must be an array");
  }
  const checklist = input.checklist.map((rawItem, index) => {
    const item = record(rawItem, `activeMission.checklist[${index}]`);
    return validateChecklistItem({
      id: stringValue(item.id, `activeMission.checklist[${index}].id`),
      text: stringValue(item.text, `activeMission.checklist[${index}].text`),
      importance: checklistImportance(item.importance),
      completed: booleanValue(
        item.completed,
        `activeMission.checklist[${index}].completed`,
      ),
    });
  });
  uniqueIds(visits, "visit");
  uniqueIds(checklist, "checklist");
  const revision = Number(input.revision);
  if (!Number.isSafeInteger(revision) || revision < 1) {
    throw new RangeError("activeMission.revision must be a positive integer");
  }

  return {
    id: stringValue(input.id, "activeMission.id"),
    revision,
    status: missionStatus(input.status),
    plan,
    createdAt: timestamp(
      stringValue(input.createdAt, "activeMission.createdAt"),
      "activeMission.createdAt",
    ),
    startedAt: optionalTimestamp(input.startedAt, "activeMission.startedAt"),
    returnStartedAt: optionalTimestamp(
      input.returnStartedAt,
      "activeMission.returnStartedAt",
    ),
    completedAt: optionalTimestamp(
      input.completedAt,
      "activeMission.completedAt",
    ),
    visits,
    checklist,
  };
}

export function isMissionReady(mission: ActiveMission): boolean {
  return mission.checklist.every(
    (item) => item.importance !== "required" || item.completed,
  );
}

export function addChecklistItem(
  mission: ActiveMission,
  item: Omit<ChecklistItem, "completed">,
): ActiveMission {
  if (mission.checklist.some((existing) => existing.id === item.id)) {
    throw new RangeError("checklist id already exists");
  }
  const checklistItem = validateChecklistItem({
    ...item,
    completed: false,
  });
  return {
    ...mission,
    checklist: [...mission.checklist, checklistItem],
    revision: mission.revision + 1,
  };
}

export function setChecklistItemCompleted(
  mission: ActiveMission,
  itemId: string,
  completed: boolean,
): ActiveMission {
  let found = false;
  const checklist = mission.checklist.map((item) => {
    if (item.id !== itemId) {
      return item;
    }
    found = true;
    return { ...item, completed };
  });
  if (!found) {
    throw new RangeError("checklist item does not exist");
  }
  return { ...mission, checklist, revision: mission.revision + 1 };
}

export function renameChecklistItem(
  mission: ActiveMission,
  itemId: string,
  text: string,
): ActiveMission {
  const validatedText = requiredText(text, "checklist.text");
  let found = false;
  const checklist = mission.checklist.map((item) => {
    if (item.id !== itemId) {
      return item;
    }
    found = true;
    return { ...item, text: validatedText };
  });
  if (!found) {
    throw new RangeError("checklist item does not exist");
  }
  return { ...mission, checklist, revision: mission.revision + 1 };
}

export function removeChecklistItem(
  mission: ActiveMission,
  itemId: string,
): ActiveMission {
  if (!mission.checklist.some((item) => item.id === itemId)) {
    throw new RangeError("checklist item does not exist");
  }
  return {
    ...mission,
    checklist: mission.checklist.filter((item) => item.id !== itemId),
    revision: mission.revision + 1,
  };
}

export function startMission(
  mission: ActiveMission,
  startedAt: string,
): ActiveMission {
  if (mission.status !== "preparing") {
    throw new RangeError("only a preparing mission can start");
  }
  if (!isMissionReady(mission)) {
    throw new RangeError("required checklist items must be complete");
  }
  return {
    ...mission,
    status: "active",
    startedAt: timestamp(startedAt, "startedAt"),
    revision: mission.revision + 1,
  };
}

export function confirmVisitArrival(
  mission: ActiveMission,
  visitId: string,
  arrivedAt: string,
): ActiveMission {
  if (mission.status !== "active") {
    throw new RangeError("mission must be active");
  }
  return updateVisit(mission, visitId, (visit) => {
    if (visit.status !== "pending") {
      throw new RangeError("only a pending visit can record arrival");
    }
    return {
      ...visit,
      status: "arrived",
      arrivedAt: timestamp(arrivedAt, "arrivedAt"),
    };
  });
}

export function confirmVisitDeparture(
  mission: ActiveMission,
  visitId: string,
  departedAt: string,
): ActiveMission {
  if (mission.status !== "active") {
    throw new RangeError("mission must be active");
  }
  return updateVisit(mission, visitId, (visit) => {
    if (visit.status !== "arrived" && visit.status !== "in_progress") {
      throw new RangeError("visit must have a confirmed arrival");
    }
    const departure = timestamp(departedAt, "departedAt");
    if (visit.arrivedAt && Date.parse(departure) < Date.parse(visit.arrivedAt)) {
      throw new RangeError("departedAt must not precede arrivedAt");
    }
    return { ...visit, status: "completed", departedAt: departure };
  });
}

export function skipVisit(
  mission: ActiveMission,
  visitId: string,
): ActiveMission {
  if (mission.status !== "active") {
    throw new RangeError("mission must be active");
  }
  return updateVisit(mission, visitId, (visit) => {
    if (visit.status !== "pending") {
      throw new RangeError("only a pending visit can be skipped");
    }
    return { ...visit, status: "skipped" };
  });
}

export function beginReturn(
  mission: ActiveMission,
  returnStartedAt: string,
): ActiveMission {
  if (mission.status !== "active") {
    throw new RangeError("mission must be active");
  }
  return {
    ...mission,
    status: "returning",
    returnStartedAt: timestamp(returnStartedAt, "returnStartedAt"),
    visits: mission.visits.map((visit) =>
      visit.status === "pending" ? { ...visit, status: "skipped" } : visit,
    ),
    revision: mission.revision + 1,
  };
}

export function completeMission(
  mission: ActiveMission,
  completedAt: string,
): ActiveMission {
  if (mission.status !== "returning") {
    throw new RangeError("mission must be returning");
  }
  return {
    ...mission,
    status: "completed",
    completedAt: timestamp(completedAt, "completedAt"),
    revision: mission.revision + 1,
  };
}

export function createItineraryProposal(
  proposal: ItineraryProposal,
): ItineraryProposal {
  requiredText(proposal.id, "proposal.id");
  if (!Number.isSafeInteger(proposal.baseRevision) || proposal.baseRevision < 1) {
    throw new RangeError("proposal.baseRevision must be a positive integer");
  }
  const visits = proposal.visits.map((visit) => ({
    ...validateVisitInput(visit),
    status: visitStatus(visit.status),
    arrivedAt: visit.arrivedAt,
    departedAt: visit.departedAt,
  }));
  uniqueIds(visits, "proposal visit");
  if (
    proposal.reasons.length === 0 ||
    proposal.reasons.some((reason) => reason.trim().length === 0)
  ) {
    throw new RangeError("proposal reasons are required");
  }
  return {
    ...proposal,
    visits,
    reasons: [...proposal.reasons],
    createdAt: timestamp(proposal.createdAt, "proposal.createdAt"),
  };
}

export function acceptItineraryProposal(
  mission: ActiveMission,
  proposal: ItineraryProposal,
): ActiveMission {
  const validatedProposal = createItineraryProposal(proposal);
  if (validatedProposal.baseRevision !== mission.revision) {
    throw new RangeError("itinerary proposal is obsolete");
  }
  return {
    ...mission,
    visits: validatedProposal.visits,
    revision: mission.revision + 1,
  };
}
