// USD→MXN rate used to turn the admin's USD price into the MXN amount
// Checkout charges. Two free, keyless sources (ECB via Frankfurter, then
// ExchangeRate-API); Next caches each response for an hour.
const sources: { url: string; read: (data: unknown) => unknown }[] = [
  {
    url: "https://api.frankfurter.dev/v1/latest?from=USD&to=MXN",
    read: (d) => (d as { rates?: { MXN?: unknown } }).rates?.MXN,
  },
  {
    url: "https://open.er-api.com/v6/latest/USD",
    read: (d) => (d as { rates?: { MXN?: unknown } }).rates?.MXN,
  },
];

export async function getUsdToMxnRate(): Promise<number> {
  for (const { url, read } of sources) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const rate = Number(read(await res.json()));
      // Sanity bounds so a malformed response can't produce an absurd charge.
      if (rate > 5 && rate < 100) return rate;
    } catch {
      // Try the next source.
    }
  }
  throw new Error("Could not fetch the USD→MXN exchange rate");
}
