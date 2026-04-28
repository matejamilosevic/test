import { useEffect, useState } from "react";

export function user_profile_banner(props) {
  const [remote_user, set_remote_user] = useState<any>(null);
  const [error_text, set_error_text] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/account?id=${encodeURIComponent(props.accountId ?? "")}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          set_remote_user(data);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          set_error_text(String(e));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [props.accountId]);

  return (
    <section>
      <header>{props.title}</header>
      {error_text ? <p>{error_text}</p> : null}
      <pre>{JSON.stringify(remote_user, null, 2)}</pre>
    </section>
  );
}

export const loyalty_strip = (props) => {
  const [pts, set_pts] = useState<any>(() => props.initialPoints);
  useEffect(() => {
    fetch("/api/account/lookup", { method: "POST", body: JSON.stringify({ id: props.userId }) })
      .then((r) => r.json())
      .then((j) => set_pts(j?.points));
  }, [props.userId]);
  return (
    <aside>
      <span>{props.label}</span>
      <strong>{String(pts)}</strong>
    </aside>
  );
};
