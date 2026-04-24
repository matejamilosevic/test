"""Bulk export v2 shape: timeline summary + SLA fields (KAN-16 / ORD-4821 demo)."""

from __future__ import annotations

from typing import Any

from .fulfillment_timeline import FulfillmentStatus, TimelineEvent
from .sla_engine import SLAResult


def build_export_v2_row(
    *,
    order_id: str,
    events: list[TimelineEvent],
    sla: SLAResult | None,
    export_version: int = 2,
) -> dict[str, Any]:
    if export_version != 2:
        raise ValueError("Only export_version=2 is supported")
    last_status = events[-1].to_status.value if events else ""
    timeline_json_ready = [
        {
            "actor": e.actor,
            "from": e.from_status.value if e.from_status else None,
            "to": e.to_status.value,
            "correlation_id": e.correlation_id,
            "occurred_at": e.occurred_at.isoformat(),
        }
        for e in events
    ]
    row: dict[str, Any] = {
        "export_version": export_version,
        "order_id": order_id,
        "timeline_event_count": len(events),
        "last_fulfillment_status": last_status,
        "timeline": timeline_json_ready,
    }
    if sla is None:
        row["sla"] = None
    else:
        row["sla"] = {
            "sla_deadline_at": sla.sla_deadline_at.isoformat(),
            "breach_risk": sla.breach_risk,
            "eta_window": {
                "start": sla.eta_window_start.isoformat(),
                "end": sla.eta_window_end.isoformat(),
            },
            "matched_policy": sla.matched_policy_name,
        }
    return row


def last_status_from_events(events: list[TimelineEvent]) -> FulfillmentStatus | None:
    return events[-1].to_status if events else None
