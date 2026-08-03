import Stripe from "stripe";

let stripeInstance: Stripe | undefined;

// Lazy singleton: constructing Stripe eagerly at module load would run
// during Next.js's build-time page-data collection for every route that
// imports this file, crashing the whole build if the key isn't set yet.
export function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  }
  return stripeInstance;
}
