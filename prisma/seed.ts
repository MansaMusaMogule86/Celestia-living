import bcrypt from "bcryptjs";
import { prisma, UserRole } from "../server/db/prisma";

async function main() {
    const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@ilancrm.local").toLowerCase();
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
    const teamSlug = process.env.SEED_TEAM_SLUG || "default-team";
    const teamName = process.env.SEED_TEAM_NAME || "Default Team";

    const team = await prisma.team.upsert({
        where: { slug: teamSlug },
        update: { name: teamName },
        create: {
            slug: teamSlug,
            name: teamName,
        },
    });

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            passwordHash,
            teamId: team.id,
            role: UserRole.ADMIN,
            firstName: "Admin",
            lastName: "User",
        },
        create: {
            email: adminEmail,
            passwordHash,
            firstName: "Admin",
            lastName: "User",
            role: UserRole.ADMIN,
            teamId: team.id,
        },
    });

    console.log("Seed complete");
    console.log(`Team: ${team.name} (${team.slug})`);
    console.log(`Admin: ${user.email}`);
}

main()
    .catch((error) => {
        console.error("Seed failed", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
