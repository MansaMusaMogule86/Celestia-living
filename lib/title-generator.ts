
export interface PropertyDetails {
    type: string;
    bedrooms: number;
    area: string;
    community?: string;
    usp?: string; // Unique Selling Proposition
    view?: string;
    furnishing?: string;
}

export function generateSmartTitles(details: PropertyDetails): string[] {
    const { type, bedrooms, area, community, usp, view, furnishing } = details;
    const titles: string[] = [];

    const loc = community ? `${community}, ${area}` : area;
    const bedStr = bedrooms === 0 ? "Studio" : `${bedrooms}BR`;
    const viewStr = view ? `with ${view}` : "";
    const furnishStr = furnishing === "furnished" ? "Furnished" : "";

    // Template 1: Luxury & Location Focused
    titles.push(`Luxury ${bedStr} ${type} in ${loc} ${viewStr}`);

    // Template 2: Investment Focused
    titles.push(`Prime Investment Option: ${bedStr} ${type} in ${area}`);

    // Template 3: Lifestyle & USP
    if (usp) {
        titles.push(`${usp} | ${bedStr} ${type} in ${area}`);
    }

    // Template 4: Short & Punchy
    titles.push(`${bedStr} ${type} | ${loc} | High ROI`);

    // Template 5: Detailed
    titles.push(`${furnishStr} ${bedStr} ${type} in ${loc} - Vacant`);

    return titles.filter(t => t.trim().length > 0);
}
