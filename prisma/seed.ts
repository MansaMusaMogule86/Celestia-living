import bcrypt from "bcryptjs";
import { prisma, UserRole } from "../server/db/prisma";

function getSeedConfig() {
    const isDev = process.env.NODE_ENV !== "production";
    const strictSeed = process.env.SEED_STRICT === "true" || !isDev;

    const adminEmail = (process.env.SEED_ADMIN_EMAIL || (isDev ? "admin@ilancrm.local" : "")).toLowerCase();
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || (isDev ? "Admin123!" : "");
    const teamSlug = process.env.SEED_TEAM_SLUG || "default-team";
    const teamName = process.env.SEED_TEAM_NAME || "Default Team";

    if (!adminEmail || !adminPassword) {
        throw new Error("Missing seed credentials. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD.");
    }

    if (strictSeed && adminPassword === "Admin123!") {
        throw new Error("Refusing to use default admin password in strict mode. Set SEED_ADMIN_PASSWORD.");
    }

    if (adminPassword.length < 8) {
        throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
    }

    return {
        adminEmail,
        adminPassword,
        teamSlug,
        teamName,
    };
}

async function main() {
    const { adminEmail, adminPassword, teamSlug, teamName } = getSeedConfig();

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
