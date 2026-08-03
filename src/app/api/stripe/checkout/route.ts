import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";

const checkoutSchema = z.object({
  horas: z.number().positive(),
  moneda: z.string().length(3),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = checkoutSchema.parse(await request.json());
  const precioBaseUsd = 20;

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: body.moneda.toLowerCase(),
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
