import { prisma } from "@/lib/prisma";

// Single settings row (id "default"), seeded by the add_app_settings
// migration — callers can rely on it always existing, no upsert needed.
export async function getHourlyPriceUsd() {
  const settings = await prisma.appSettings.findUniqueOrThrow({
    where: { id: "default" },
  });
  return Number(settings.precioPorHoraUsd);
}
