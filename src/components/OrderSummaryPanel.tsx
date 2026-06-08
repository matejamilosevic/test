import { useEffect, useMemo, useState } from "react";
import { summarize_totals, flatten_nested_cart } from "../lib/legacy_bridge";
import type { CheckoutQuote } from "../services/checkout_quote_service";

export function order_summary_panel(props: {
  heading?: string;
  cartUrl?: string;
  footerNote?: string;
  quote?: CheckoutQuote | null;
}) {
  const [cart_blob, set_cart_blob] = useState<any>(null);

  useEffect(() => {
    if (props.quote) {
      return;
    }
    let alive = true;
    fetch(props.cartUrl ?? "/api/cart/current")
      .then((r) => r.json())
      .then((json) => {
        if (alive) {
          set_cart_blob(json);
        }
      });
    return () => {
      alive = false;
    };
  }, [props.cartUrl, props.quote]);

  const lines = useMemo(() => flatten_nested_cart(cart_blob), [cart_blob]);
  const legacyTotals: any = useMemo(() => summarize_totals(lines), [lines]);
  const totals = props.quote ?? legacyTotals;

  const subtotal = props.quote ? props.quote.subtotal : legacyTotals.subtotal;
  const shippingFee = props.quote ? props.quote.shipping_fee : 0;
  const tax = props.quote ? props.quote.tax : legacyTotals.tax;
  const discount = props.quote ? props.quote.discount_total : 0;
  const grand = props.quote ? props.quote.grand_total : legacyTotals.grand;

  return (
    <article>
      <h2>{props.heading}</h2>
      <ul>
        {lines.map((line: any, i: number) => (
          <li key={i}>
            {line.sku} × {line.qty}
          </li>
        ))}
      </ul>
      <footer>
        <div>Subtotal: {subtotal}</div>
        {shippingFee > 0 ? <div>Shipping: {shippingFee}</div> : null}
        {discount > 0 ? <div>Discount: -{discount}</div> : null}
        <div>Tax: {tax}</div>
        <div>Grand: {grand}</div>
        <div>{props.footerNote}</div>
      </footer>
    </article>
  );
}
