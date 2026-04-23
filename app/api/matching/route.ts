import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/server/db/prisma";
import { findMatchingClients, findMatchingProperties } from "@/server/services/propertyMatching";

// GET /api/matching?propertyId=xxx  → find matching clients for a property
// GET /api/matching?clientId=xxx    → find matching properties for a client
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const clientId = searchParams.get("clientId");
    const minScore = parseInt(searchParams.get("minScore") || "30", 10);

    if (propertyId) {
      // Find matching clients for a property
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: {
          id: true,
          title: true,
          price: true,
          area: true,
          type: true,
          bedrooms: true,
        },
      });

      if (!property) {
        return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
      }

      const clients = await prisma.client.findMany({
        where: { teamId: session.teamId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          budgetMin: true,
          budgetMax: true,
          preferredLocations: true,
          preferredType: true,
          bedroomsMin: true,
          mustHaveFeatures: true,
          niceToHaveFeatures: true,
        },
      });

      const matches = findMatchingClients(
        {
          id: property.id,
          title: property.title,
          price: Number(property.price),
          area: property.area,
          type: property.type,
          bedrooms: property.bedrooms,
          amenities: [],
        },
        clients.map((c) => ({
          ...c,
          budgetMin: c.budgetMin ? Number(c.budgetMin) : null,
          budgetMax: c.budgetMax ? Number(c.budgetMax) : null,
        })),
        minScore
      );

      return NextResponse.json({ success: true, data: matches });
    }

    if (clientId) {
      // Find matching properties for a client
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          budgetMin: true,
          budgetMax: true,
          preferredLocations: true,
          preferredType: true,
          bedroomsMin: true,
          mustHaveFeatures: true,
          niceToHaveFeatures: true,
        },
      });

      if (!client) {
        return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
      }

      const properties = await prisma.property.findMany({
        where: { teamId: session.teamId, isDeleted: false },
        select: {
          id: true,
          title: true,
          price: true,
          area: true,
          type: true,
          bedrooms: true,
        },
      });

      const matches = findMatchingProperties(
        {
          ...client,
          budgetMin: client.budgetMin ? Number(client.budgetMin) : null,
          budgetMax: client.budgetMax ? Number(client.budgetMax) : null,
        },
        properties.map((p) => ({
          id: p.id,
          title: p.title,
          price: Number(p.price),
          area: p.area,
          type: p.type,
          bedrooms: p.bedrooms,
          amenities: [],
        })),
        minScore
      );

      return NextResponse.json({ success: true, data: matches });
    }

    return NextResponse.json(
      { success: false, error: "Provide either propertyId or clientId query parameter" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Matching failed" },
      { status: 500 }
    );
  }
}
