import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { getHourlyPriceUsd } from "@/lib/settings";

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

  // Prices stay defined in USD. Relabeling the same number in another currency
  // would be wrong, so local-currency display is delegated to Stripe's Adaptive
  // Pricing (real FX done by Stripe). Without it, cards that only accept MXN
  // (common for Mexican cards) are declined with "currency_not_supported".
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    adaptive_pricing: { enabled: true },
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(precioBaseUsd * 100),
          product_data: { name: "Class hour — Lexa" },
        },
        quantity: body.horas,
      },
    ],
    metadata: { userId: user.id, horas: String(body.horas) },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/student?purchase=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/student?purchase=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
