export function calculateLiveTotals(items, priceMap) {
  let subtotal = 0;
  let discount = 0;

  items.forEach((i) => {
    const price = priceMap[i.item_id] || 0;
    const lineTotal = price * i.quantity;
    const lineDiscount = (lineTotal * i.discount_percent) / 100;

    subtotal += lineTotal;
    discount += lineDiscount;
  });

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    final: Number((subtotal - discount).toFixed(2)),
  };
}
