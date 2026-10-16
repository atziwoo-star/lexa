import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
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

    // Only card payments today, which are always "paid" on completion; the
    // guard keeps delayed methods (e.g. OXXO vouchers) from crediting hours
    // before the money actually arrives.
    if (userId && horas > 0 && session.payment_status === "paid") {
      // Stripe can deliver the same event more than once (retries, duplicate
      // delivery). Skip if we've already recorded this checkout session,
      // otherwise the student would get double hours credited for one payment.
      const existing = await prisma.payment.findUnique({
        where: { referenciaStripe: session.id },
      });

      if (!existing) {
        // amount_total/currency are the integration amount (MXN, what
        // settles to the bank), even when Adaptive Pricing let the customer
        // pay in their own currency. Revenue stats use the USD list price
        // checkout stored in metadata; sessions created before that existed
        // fall back to the session amount.
        const monto = (session.amount_total ?? 0) / 100;
        const moneda = session.currency?.toUpperCase() ?? "USD";
        const montoUsd = session.metadata?.montoUsd
          ? Number(session.metadata.montoUsd)
          : (session.currency_conversion?.amount_total ??
              session.amount_total ??
              0) / 100;

        await prisma.$transaction(async (tx) => {
          const hourPackage = await tx.hourPackage.create({
            data: {
              userId,
              horasCompradas: horas,
              fechaVencimiento: DateTime.utc().plus({ months: 1 }).toJSDate(),
              monto,
              moneda,
              montoUsd,
            },
          });

          await tx.payment.create({
            data: {
              userId,
              hourPackageId: hourPackage.id,
              monto,
              moneda,
              montoUsd,
              estado: "COMPLETADO",
              referenciaStripe: session.id,
            },
          });
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
