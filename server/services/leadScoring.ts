import { Lead, LeadPriority } from "@/lib/types";

// ─── Lead Scoring Algorithm ────────────────────────────────────────
// Multi-dimensional scoring based on engagement, fit, and behavior signals.
// Score range: 0–100. Higher = hotter lead.

interface LeadScoreBreakdown {
  total: number;
  priority: LeadPriority;
  dimensions: {
    profileCompleteness: number;  // 0-20
    budgetFit: number;            // 0-25
    engagementLevel: number;      // 0-25
    sourceQuality: number;        // 0-15
    recency: number;              // 0-15
  };
  signals: string[];
}

const SOURCE_SCORES: Record<string, number> = {
  referral: 15,
  walk_in: 13,
  website: 10,
  property_finder: 9,
  bayut: 9,
  dubizzle: 8,
  social_media: 6,
  other: 4,
};

const STATUS_MULTIPLIER: Record<string, number> = {
  new: 1.0,
  contacted: 1.1,
  qualified: 1.3,
  negotiating: 1.5,
  converted: 1.0,
  lost: 0.3,
};

function scoreProfileCompleteness(lead: Lead): { score: number; signals: string[] } {
  let score = 0;
  const signals: string[] = [];

  if (lead.name && lead.name.trim().length > 2) { score += 4; }
  else { signals.push("Missing or short name"); }

  if (lead.email && lead.email.includes("@")) { score += 4; }
  else { signals.push("Missing email"); }

  if (lead.phone && lead.phone.length >= 7) { score += 4; }
  else { signals.push("Missing phone"); }

  if (lead.budget.max > 0) { score += 4; }
  else { signals.push("No budget defined"); }

  if (lead.requirements.areas.length > 0 || lead.requirements.type.length > 0) { score += 4; }
  else { signals.push("No property preferences set"); }

  return { score: Math.min(score, 20), signals };
}

function scoreBudgetFit(lead: Lead): { score: number; signals: string[] } {
  const signals: string[] = [];

  if (lead.budget.max <= 0 && lead.budget.min <= 0) {
    signals.push("No budget range provided");
    return { score: 5, signals };
  }

  let score = 10; // Base for having a budget

  // Higher budget = higher value lead (Dubai RE context, AED)
  const avgBudget = (lead.budget.min + lead.budget.max) / 2;
  if (avgBudget >= 10_000_000) {
    score += 15;
    signals.push("Ultra-premium budget (10M+ AED)");
  } else if (avgBudget >= 5_000_000) {
    score += 12;
    signals.push("Premium budget (5M+ AED)");
  } else if (avgBudget >= 2_000_000) {
    score += 9;
    signals.push("High budget (2M+ AED)");
  } else if (avgBudget >= 1_000_000) {
    score += 6;
    signals.push("Mid-range budget (1M+ AED)");
  } else {
    score += 3;
    signals.push("Entry-level budget");
  }

  // Narrow budget range = more serious buyer
  if (lead.budget.max > 0 && lead.budget.min > 0) {
    const ratio = lead.budget.min / lead.budget.max;
    if (ratio > 0.5) {
      signals.push("Well-defined budget range");
    }
  }

  return { score: Math.min(score, 25), signals };
}

function scoreEngagement(lead: Lead): { score: number; signals: string[] } {
  const signals: string[] = [];
  let score = 0;

  // Status progression indicates engagement
  const statusScores: Record<string, number> = {
    new: 5,
    contacted: 10,
    qualified: 18,
    negotiating: 25,
    converted: 25,
    lost: 0,
  };
  score = statusScores[lead.status] ?? 5;

  if (lead.status === "qualified" || lead.status === "negotiating") {
    signals.push("Actively engaged in process");
  }
  if (lead.status === "lost") {
    signals.push("Lead lost — may re-engage");
  }

  // Detailed requirements = higher engagement
  if (lead.requirements.type.length > 0) {
    score += Math.min(lead.requirements.type.length * 1, 3);
    signals.push(`Specific property type preferences (${lead.requirements.type.join(", ")})`);
  }
  if (lead.requirements.bedrooms.length > 0) {
    score += 2;
  }
  if (lead.requirements.areas.length > 1) {
    signals.push(`Exploring ${lead.requirements.areas.length} areas`);
  }

  // Notes present = more context
  if (lead.notes && lead.notes.length > 20) {
    score += 2;
    signals.push("Has detailed notes");
  }

  // Assigned = being worked on
  if (lead.assignedTo) {
    score += 2;
    signals.push(`Assigned to ${lead.assignedTo.name}`);
  }

  return { score: Math.min(score, 25), signals };
}

function scoreSourceQuality(lead: Lead): { score: number; signals: string[] } {
  const signals: string[] = [];
  const score = SOURCE_SCORES[lead.source] ?? 4;

  if (score >= 13) {
    signals.push(`High-quality source: ${lead.source}`);
  } else if (score >= 9) {
    signals.push(`Reliable portal source: ${lead.source}`);
  }

  return { score: Math.min(score, 15), signals };
}

function scoreRecency(lead: Lead): { score: number; signals: string[] } {
  const signals: string[] = [];
  const now = Date.now();
  const created = new Date(lead.createdAt).getTime();
  const daysSinceCreated = (now - created) / (1000 * 60 * 60 * 24);

  let score: number;
  if (daysSinceCreated <= 1) {
    score = 15;
    signals.push("Brand new lead (today)");
  } else if (daysSinceCreated <= 3) {
    score = 13;
    signals.push("Very recent lead (< 3 days)");
  } else if (daysSinceCreated <= 7) {
    score = 11;
    signals.push("Recent lead (< 1 week)");
  } else if (daysSinceCreated <= 14) {
    score = 8;
  } else if (daysSinceCreated <= 30) {
    score = 5;
    signals.push("Lead aging (> 2 weeks)");
  } else if (daysSinceCreated <= 60) {
    score = 3;
    signals.push("Stale lead (> 1 month)");
  } else {
    score = 1;
    signals.push("Cold lead (> 2 months)");
  }

  return { score, signals };
}

function derivePriority(totalScore: number): LeadPriority {
  if (totalScore >= 75) return "urgent";
  if (totalScore >= 55) return "high";
  if (totalScore >= 35) return "medium";
  return "low";
}

export function scoreLead(lead: Lead): LeadScoreBreakdown {
  const profile = scoreProfileCompleteness(lead);
  const budget = scoreBudgetFit(lead);
  const engagement = scoreEngagement(lead);
  const source = scoreSourceQuality(lead);
  const recency = scoreRecency(lead);

  const rawTotal = profile.score + budget.score + engagement.score + source.score + recency.score;

  // Apply status multiplier
  const multiplier = STATUS_MULTIPLIER[lead.status] ?? 1.0;
  const total = Math.round(Math.min(rawTotal * multiplier, 100));

  const allSignals = [
    ...profile.signals,
    ...budget.signals,
    ...engagement.signals,
    ...source.signals,
    ...recency.signals,
  ];

  return {
    total,
    priority: derivePriority(total),
    dimensions: {
      profileCompleteness: profile.score,
      budgetFit: budget.score,
      engagementLevel: engagement.score,
      sourceQuality: source.score,
      recency: recency.score,
    },
    signals: allSignals,
  };
}

export function scoreLeads(leads: Lead[]): Array<Lead & { scoreBreakdown: LeadScoreBreakdown }> {
  return leads
    .map((lead) => ({
      ...lead,
      scoreBreakdown: scoreLead(lead),
    }))
    .sort((a, b) => b.scoreBreakdown.total - a.scoreBreakdown.total);
}

export function getTopLeads(leads: Lead[], count = 10): Array<Lead & { scoreBreakdown: LeadScoreBreakdown }> {
  return scoreLeads(leads).slice(0, count);
}
