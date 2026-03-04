"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { propertiesService } from "@/server/services/propertiesService";
import { Property, PropertyType, PropertyStatus, ListingType } from "@/lib/types";

// Define the shape of the form data
interface CreatePropertyState {
    errors?: {
        [key: string]: string[];
    };
    message?: string;
}

export async function createPropertyAction(prevState: CreatePropertyState, formData: FormData) {
    // Validate form data
    const title = formData.get("title") as string;
    const type = formData.get("type") as PropertyType;
    const status = formData.get("status") as PropertyStatus;
    const listingType = formData.get("listingType") as ListingType;
    const price = Number(formData.get("price"));
    const area = formData.get("area") as string;
    const community = formData.get("community") as string;
    const building = formData.get("building") as string;
    const developer = formData.get("developer") as string;
    const address = formData.get("address") as string;
    const bedrooms = Number(formData.get("bedrooms"));
    const bathrooms = Number(formData.get("bathrooms"));
    const size = Number(formData.get("size"));
    const parkingSpaces = Number(formData.get("parkingSpaces"));
    const furnished = formData.get("furnished") === "on";
    const description = formData.get("description") as string;
    const agentName = formData.get("agentName") as string;

    // Parse amenities from FormData (checkboxes with same name)
    const amenities: string[] = [];
    // formData.getAll("amenities") doesn't work well with some checkbox implementations, 
    // but assuming standard form submission:
    for (const [key, value] of Array.from(formData.entries())) {
        if (key === "amenities") {
            amenities.push(value as string);
        }
    }

    // Basic validation
    const errors: Record<string, string[]> = {};
    if (!title) errors.title = ["Title is required"];
    if (!price) errors.price = ["Price is required"];
    if (!area) errors.area = ["Area is required"];
    if (!size) errors.size = ["Size is required"];

    if (Object.keys(errors).length > 0) {
        return { errors, message: "Please fill in all required fields." };
    }

    // Create property object
    try {
        await propertiesService.create({
            title,
            type,
            status,
            listingType,
            price,
            location: {
                area,
                community,
                building,
                developer,
                address: address || `${building || community || area}, Dubai`,
            },
            details: {
                bedrooms,
                bathrooms,
                size,
                parkingSpaces,
                furnished,
            },
            amenities,
            description,
            images: [], // Placeholder for now
            agent: {
                id: "current-user-id", // In real app, get from auth session
                name: agentName || "Current User",
            },
        });

        revalidatePath("/dashboard/properties");
    } catch (e) {
        return { message: "Failed to create property. Please try again." };
    }

    redirect("/dashboard/properties");
}
