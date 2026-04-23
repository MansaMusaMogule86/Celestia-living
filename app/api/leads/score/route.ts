import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { leadsService } from "@/server/services/leadsService";
import { scoreLeads, scoreLead, getTopLeads } from "@/server/services/leadScoring";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("id");
    const top = searchParams.get("top");

    // Score a single lead
    if (leadId) {
      const lead = await leadsService.getById(leadId, session.teamId);
      if (!lead) {
        return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
      }
      const breakdown = scoreLead(lead);
      return NextResponse.json({ success: true, data: { ...lead, scoreBreakdown: breakdown } });
    }

    // Get all leads scored
    const leads = await leadsService.getAll(session.teamId);

    if (top) {
      const count = parseInt(top, 10) || 10;
      const topLeads = getTopLeads(leads, count);
      return NextResponse.json({ success: true, data: topLeads });
    }

    const scored = scoreLeads(leads);
    return NextResponse.json({ success: true, data: scored });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to score leads" },
      { status: 500 }
    );
  }
}
