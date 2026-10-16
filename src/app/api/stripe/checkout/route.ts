import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { getHourlyPriceUsd } from "@/lib/settings";
import { getUsdToMxnRate } from "@/lib/fx";

const checkoutSchema = z.object({
  horas: z.number().positive().max(100),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = checkoutSchema.parse(await request.json());
  const precioBaseUsd = await getHourlyPriceUsd();

  // Prices are set in USD, but Adaptive Pricing (which shows each customer
  // their local currency) only works when the session is in one of the
  // account's settlement currencies — MXN for this Mexican account. So the
  // USD price is converted to MXN here and Stripe localizes from there.
  // Charging MXN also lets Mexican cards pay: they're declined in USD.
  let usdToMxn: number;
  try {
    usdToMxn = await getUsdToMxnRate();
  } catch {
    return NextResponse.json(
      { error: "Payments are temporarily unavailable. Please try again in a few minutes." },
      { status: 503 },
    );
  }
  const montoUsd = precioBaseUsd * body.horas;
  const unitAmountMxnCents = Math.round(precioBaseUsd * usdToMxn * 100);

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    adaptive_pricing: { enabled: true },
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "mxn",
          unit_amount: unitAmountMxnCents,
          product_data: { name: "Class hour — Lexa" },
        },
        quantity: body.horas,
      },
    ],
    // The webhook records montoUsd for revenue stats, since the charge
    // itself is in MXN (or the customer's local currency).
    metadata: {
      userId: user.id,
      horas: String(body.horas),
      montoUsd: montoUsd.toFixed(2),
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/student?purchase=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/student?purchase=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
