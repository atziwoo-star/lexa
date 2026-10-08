import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

// Runs once a day via Vercel Cron (see vercel.json). Warns a student once,
// a few days before an hour package with remaining hours expires.
const WARNING_WINDOW_DAYS = 3;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const now = new Date();
  const cutoff = DateTime.now().plus({ days: WARNING_WINDOW_DAYS }).toJSDate();

  const packages = await prisma.hourPackage.findMany({
    where: {
      avisoVencimientoEnviado: false,
      fechaVencimiento: { gte: now, lte: cutoff },
    },
    include: { user: true },
  });

  let notified = 0;

  for (const pkg of packages) {
    const hoursLeft = Number(pkg.horasCompradas) - Number(pkg.horasConsumidas);
    if (hoursLeft <= 0) {
      await prisma.hourPackage.update({
        where: { id: pkg.id },
        data: { avisoVencimientoEnviado: true },
      });
      continue;
    }

    const daysLeft = Math.max(
      1,
      Math.ceil(DateTime.fromJSDate(pkg.fechaVencimiento).diff(DateTime.now(), "days").days),
    );

    await sendPushToUser(pkg.userId, {
      title: "Your hours are about to expire",
      body: `You have ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"} left, expiring in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`,
      url: "/student",
    });

    await prisma.hourPackage.update({
      where: { id: pkg.id },
      data: { avisoVencimientoEnviado: true },
    });
    notified++;
  }

  return NextResponse.json({ notified });
}
