type Order = {
  delivery_price?: number | string;
  products?: Array<{
    price_brutto?: number | string;
    quantity?: number | string;
  }>;
};

const toNum = (v: number | string | undefined) =>
  v == null ? 0 : typeof v === "string" ? parseFloat(v.replace(",", ".")) : v;

export function calcOrderTotalSafe(order: Order): number {
  const itemsCents = (order.products ?? []).reduce((sum, p) => {
    const price = toNum(p.price_brutto);
    const qty = toNum(p.quantity);
    const lineCents = Math.round(price * qty * 100);
    return sum + (isFinite(lineCents) ? lineCents : 0);
  }, 0);

  const deliveryCents = Math.round(toNum(order.delivery_price) * 100);
  const totalCents = itemsCents + (isFinite(deliveryCents) ? deliveryCents : 0);

  return totalCents / 100;
}
