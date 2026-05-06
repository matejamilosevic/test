"""In-memory fulfillment timeline with idempotent appends (KAN-16 / ORD-4821 demo)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Mapping


class FulfillmentStatus(str, Enum):
    CREATED = "created"
    CONFIRMED = "confirmed"
    PICKING = "picking"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


@dataclass(frozen=True)
class TimelineEvent:
    order_id: str
    actor: str
    from_status: FulfillmentStatus | None
    to_status: FulfillmentStatus
    correlation_id: str
    idempotency_key: str
    occurred_at: datetime
    payload: Mapping[str, Any] = field(default_factory=dict)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class InMemoryTimelineStore:
    """Append-only store; duplicate idempotency_key is ignored."""

    def __init__(self) -> None:
        self._events: list[TimelineEvent] = []
        self._keys: set[str] = set()

    def append(self, event: TimelineEvent) -> bool:
        if event.idempotency_key in self._keys:
            return False
        self._keys.add(event.idempotency_key)
        self._events.append(event)
        return True

    def list_for_order(self, order_id: str) -> list[TimelineEvent]:
        return [e for e in self._events if e.order_id == order_id]
