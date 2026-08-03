import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const horas = Number(session.metadata?.horas ?? 0);

    if (userId && horas > 0) {
      const montoUsd = (session.amount_total ?? 0) / 100;
      const hourPackage = await prisma.hourPackage.create({
        data: {
          userId,
          horasCompradas: horas,
          fechaVencimiento: DateTime.utc().plus({ months: 1 }).toJSDate(),
          monto: montoUsd,
          moneda: session.currency?.toUpperCase() ?? "USD",
          montoUsd,
        },
      });

      await prisma.payment.create({
        data: {
          userId,
          hourPackageId: hourPackage.id,
          monto: montoUsd,
          moneda: session.currency?.toUpperCase() ?? "USD",
          montoUsd,
          estado: "COMPLETADO",
          referenciaStripe: session.id,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
