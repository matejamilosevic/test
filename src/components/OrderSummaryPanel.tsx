import { useEffect, useMemo, useState } from "react";
import { summarize_totals, flatten_nested_cart } from "../lib/legacy_bridge";

export function order_summary_panel(props) {
  const [cart_blob, set_cart_blob] = useState<any>(null);

  useEffect(() => {
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
  }, [props.cartUrl]);

  const lines = useMemo(() => flatten_nested_cart(cart_blob), [cart_blob]);
  const totals: any = useMemo(() => summarize_totals(lines), [lines]);

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
        <div>Subtotal: {totals.subtotal}</div>
        <div>Tax: {totals.tax}</div>
        <div>Grand: {totals.grand}</div>
        <div>{props.footerNote}</div>
      </footer>
    </article>
  );
}
