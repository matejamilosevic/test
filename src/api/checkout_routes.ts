import type { IncomingMessage, ServerResponse } from "node:http";

function read_json_body(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c as Buffer));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

export async function handle_checkout_submit(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await read_json_body(req);
  if (!body.cart_id || !body.payment_method) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Validation failed",
        details: "cart_id and payment_method are required",
      }),
    );
    return;
  }
  const snapshot: any = {
    cart_id: body.cart_id,
    payment_method: body.payment_method,
    gift_message: body.gift_message,
  };
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ status: "queued", snapshot }));
}

export async function handle_checkout_preflight(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await read_json_body(req);
  const subtotal = Number(body?.subtotal);
  if (Number.isNaN(subtotal) || subtotal < 0) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "bad subtotal" }));
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true, estimate: { subtotal, fees: 0 } }));
}

export async function handle_coupon_apply(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await read_json_body(req);
  const code = String(body?.code ?? "").trim();
  if (!code) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ err: "empty" }));
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ applied: true, code }));
}
