import { Property, Client } from "@/lib/types";

// ─── Property-Client Smart Matching Engine ─────────────────────────
// Scores how well a property matches a client's preferences.
// Returns a 0–100 match score with breakdown.

export interface MatchResult {
  clientId: string;
  clientName: string;
  propertyId: string;
  propertyTitle: string;
  score: number;           // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: {
    budget: number;        // 0-30
    location: number;      // 0-25
    propertyType: number;  // 0-20
    bedrooms: number;      // 0-15
    amenities: number;     // 0-10
  };
  reasons: string[];
}

function scoreBudget(property: Property, client: Client): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  // Client budget not on the lib types, but we use what we have
  // If client doesn't have budget preferences, partial score
  if (!client.properties && !client.deals) {
    return { score: 15, reasons: ["No budget data available — neutral score"] };
  }

  return { score: 15, reasons: ["Budget match — neutral (no structured budget on client type)"] };
}

function scoreBudgetFromPrisma(
  price: number,
  budgetMin: number | null,
  budgetMax: number | null
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  if (!budgetMin && !budgetMax) {
    return { score: 15, reasons: ["No budget preferences set"] };
  }

  const min = budgetMin ?? 0;
  const max = budgetMax ?? Infinity;

  if (price >= min && price <= max) {
    reasons.push("Price within budget range");
    return { score: 30, reasons };
  }

  // Within 10% tolerance
  const tolerance = max * 0.1;
  if (price <= max + tolerance && price >= min - tolerance) {
    reasons.push("Price slightly outside budget (within 10%)");
    return { score: 22, reasons };
  }

  // Within 20% tolerance
  const wideTolerance = max * 0.2;
  if (price <= max + wideTolerance && price >= min - wideTolerance) {
    reasons.push("Price moderately outside budget (within 20%)");
    return { score: 14, reasons };
  }

  reasons.push("Price significantly outside budget");
  return { score: 5, reasons };
}

function scoreLocation(
  propertyArea: string | undefined,
  preferredLocations: string[]
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  if (!preferredLocations.length) {
    return { score: 12, reasons: ["No location preferences set"] };
  }

  if (!propertyArea) {
    return { score: 8, reasons: ["Property has no area defined"] };
  }

  const normalizedArea = propertyArea.toLowerCase().trim();

  // Exact match
  const exactMatch = preferredLocations.some(
    (loc) => loc.toLowerCase().trim() === normalizedArea
  );
  if (exactMatch) {
    reasons.push(`Exact location match: ${propertyArea}`);
    return { score: 25, reasons };
  }

  // Partial match (area contained in preference or vice versa)
  const partialMatch = preferredLocations.some(
    (loc) =>
      normalizedArea.includes(loc.toLowerCase().trim()) ||
      loc.toLowerCase().trim().includes(normalizedArea)
  );
  if (partialMatch) {
    reasons.push(`Partial location match: ${propertyArea}`);
    return { score: 18, reasons };
  }

  reasons.push(`Location mismatch: ${propertyArea} not in preferred areas`);
  return { score: 3, reasons };
}

function scorePropertyType(
  propertyType: string,
  preferredType: string | null | undefined
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  if (!preferredType) {
    return { score: 10, reasons: ["No property type preference set"] };
  }

  if (propertyType.toLowerCase() === preferredType.toLowerCase()) {
    reasons.push(`Exact type match: ${propertyType}`);
    return { score: 20, reasons };
  }

  // Related types get partial credit
  const relatedTypes: Record<string, string[]> = {
    apartment: ["studio", "penthouse"],
    villa: ["townhouse"],
    townhouse: ["villa"],
    penthouse: ["apartment"],
    studio: ["apartment"],
    office: ["commercial"],
    commercial: ["office", "retail"],
  };

  const related = relatedTypes[propertyType.toLowerCase()] ?? [];
  if (related.includes(preferredType.toLowerCase())) {
    reasons.push(`Related type: ${propertyType} (preferred: ${preferredType})`);
    return { score: 12, reasons };
  }

  reasons.push(`Type mismatch: ${propertyType} vs. preferred ${preferredType}`);
  return { score: 2, reasons };
}

function scoreBedrooms(
  propertyBedrooms: number | undefined,
  bedroomsMin: number | null | undefined
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  if (!bedroomsMin) {
    return { score: 8, reasons: ["No bedroom preference set"] };
  }

  if (!propertyBedrooms) {
    return { score: 5, reasons: ["Property bedrooms not specified"] };
  }

  if (propertyBedrooms >= bedroomsMin) {
    reasons.push(`Meets minimum bedrooms (${propertyBedrooms} >= ${bedroomsMin})`);
    return { score: 15, reasons };
  }

  if (propertyBedrooms === bedroomsMin - 1) {
    reasons.push(`One bedroom short (${propertyBedrooms} vs. ${bedroomsMin} min)`);
    return { score: 8, reasons };
  }

  reasons.push(`Below minimum bedrooms (${propertyBedrooms} vs. ${bedroomsMin} min)`);
  return { score: 2, reasons };
}

function scoreAmenities(
  propertyAmenities: string[],
  mustHave: string[],
  niceToHave: string[]
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  if (!mustHave.length && !niceToHave.length) {
    return { score: 5, reasons: ["No amenity preferences set"] };
  }

  let score = 0;

  if (mustHave.length > 0) {
    const matched = mustHave.filter((feat) =>
      propertyAmenities.some((a) => a.toLowerCase().includes(feat.toLowerCase()))
    );
    const mustHaveRatio = matched.length / mustHave.length;
    score += Math.round(mustHaveRatio * 7);

    if (mustHaveRatio === 1) {
      reasons.push("All must-have features present");
    } else if (mustHaveRatio > 0) {
      reasons.push(`${matched.length}/${mustHave.length} must-have features`);
    } else {
      reasons.push("No must-have features found");
    }
  }

  if (niceToHave.length > 0) {
    const matched = niceToHave.filter((feat) =>
      propertyAmenities.some((a) => a.toLowerCase().includes(feat.toLowerCase()))
    );
    const niceRatio = matched.length / niceToHave.length;
    score += Math.round(niceRatio * 3);

    if (matched.length > 0) {
      reasons.push(`${matched.length}/${niceToHave.length} nice-to-have features`);
    }
  }

  return { score: Math.min(score, 10), reasons };
}

function deriveGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  if (score >= 30) return "D";
  return "F";
}

// Match a single property against a client using Prisma-level data
export function matchPropertyToClientPrisma(
  property: {
    id: string;
    title: string;
    price: number;
    area?: string | null;
    type: string;
    bedrooms?: number | null;
    amenities?: string[];
  },
  client: {
    id: string;
    firstName: string;
    lastName: string;
    budgetMin?: number | null;
    budgetMax?: number | null;
    preferredLocations: string[];
    preferredType?: string | null;
    bedroomsMin?: number | null;
    mustHaveFeatures: string[];
    niceToHaveFeatures: string[];
  }
): MatchResult {
  const budget = scoreBudgetFromPrisma(property.price, client.budgetMin ?? null, client.budgetMax ?? null);
  const location = scoreLocation(property.area ?? undefined, client.preferredLocations);
  const propertyType = scorePropertyType(property.type, client.preferredType);
  const bedrooms = scoreBedrooms(property.bedrooms ?? undefined, client.bedroomsMin);
  const amenities = scoreAmenities(
    property.amenities ?? [],
    client.mustHaveFeatures,
    client.niceToHaveFeatures
  );

  const total = budget.score + location.score + propertyType.score + bedrooms.score + amenities.score;
  const allReasons = [...budget.reasons, ...location.reasons, ...propertyType.reasons, ...bedrooms.reasons, ...amenities.reasons];

  return {
    clientId: client.id,
    clientName: `${client.firstName} ${client.lastName}`.trim(),
    propertyId: property.id,
    propertyTitle: property.title,
    score: Math.min(total, 100),
    grade: deriveGrade(total),
    breakdown: {
      budget: budget.score,
      location: location.score,
      propertyType: propertyType.score,
      bedrooms: bedrooms.score,
      amenities: amenities.score,
    },
    reasons: allReasons,
  };
}

// Find top matching clients for a property
export function findMatchingClients(
  property: {
    id: string;
    title: string;
    price: number;
    area?: string | null;
    type: string;
    bedrooms?: number | null;
    amenities?: string[];
  },
  clients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    budgetMin?: number | null;
    budgetMax?: number | null;
    preferredLocations: string[];
    preferredType?: string | null;
    bedroomsMin?: number | null;
    mustHaveFeatures: string[];
    niceToHaveFeatures: string[];
  }>,
  minScore = 30,
  limit = 20
): MatchResult[] {
  return clients
    .map((client) => matchPropertyToClientPrisma(property, client))
    .filter((result) => result.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Find top matching properties for a client
export function findMatchingProperties(
  client: {
    id: string;
    firstName: string;
    lastName: string;
    budgetMin?: number | null;
    budgetMax?: number | null;
    preferredLocations: string[];
    preferredType?: string | null;
    bedroomsMin?: number | null;
    mustHaveFeatures: string[];
    niceToHaveFeatures: string[];
  },
  properties: Array<{
    id: string;
    title: string;
    price: number;
    area?: string | null;
    type: string;
    bedrooms?: number | null;
    amenities?: string[];
  }>,
  minScore = 30,
  limit = 20
): MatchResult[] {
  return properties
    .map((property) => matchPropertyToClientPrisma(property, client))
    .filter((result) => result.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
