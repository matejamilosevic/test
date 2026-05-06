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

export async function handle_account_lookup(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", "http://local.invalid");
  const id = url.searchParams.get("id");
  if (!id) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ msg: "id required" }));
    return;
  }
  const payload: any = { id, tier: "standard", points: 0 };
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export async function handle_account_patch(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await read_json_body(req);
  const next: any = { ...(body ?? {}) };
  delete next.password_plaintext;
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ saved: true, profile: next }));
}
