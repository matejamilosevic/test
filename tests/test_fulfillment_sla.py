"""Golden tests for timeline idempotency and SLA policy matrix (KAN-16)."""

from __future__ import annotations

import unittest
from datetime import datetime, timedelta, timezone

from toolkit.fulfillment_export import build_export_v2_row
from toolkit.fulfillment_timeline import (
    FulfillmentStatus,
    InMemoryTimelineStore,
    TimelineEvent,
)
from toolkit.sla_engine import (
    DEFAULT_POLICY_MATRIX,
    OrderContext,
    evaluate_sla,
    select_policy,
)


def _ts(hour: int = 10) -> datetime:
    return datetime(2026, 4, 24, hour, 0, 0, tzinfo=timezone.utc)


class TimelineTests(unittest.TestCase):
    def test_append_idempotent(self) -> None:
        store = InMemoryTimelineStore()
        ev = TimelineEvent(
            order_id="o1",
            actor="system",
            from_status=None,
            to_status=FulfillmentStatus.CREATED,
            correlation_id="c1",
            idempotency_key="k1",
            occurred_at=_ts(),
        )
        self.assertTrue(store.append(ev))
        self.assertFalse(store.append(ev))
        self.assertEqual(len(store.list_for_order("o1")), 1)

    def test_list_order_sorted_by_append(self) -> None:
        store = InMemoryTimelineStore()
        base = _ts(9)
        statuses = [
            FulfillmentStatus.CREATED,
            FulfillmentStatus.CONFIRMED,
            FulfillmentStatus.SHIPPED,
        ]
        for i, st in enumerate(statuses):
            prev = None if i == 0 else statuses[i - 1]
            store.append(
                TimelineEvent(
                    order_id="o2",
                    actor="svc",
                    from_status=prev,
                    to_status=st,
                    correlation_id=f"c{i}",
                    idempotency_key=f"k{i}",
                    occurred_at=base + timedelta(minutes=i),
                )
            )
        events = store.list_for_order("o2")
        self.assertEqual(len(events), 3)
        self.assertEqual(events[-1].to_status, FulfillmentStatus.SHIPPED)


class PolicyMatrixGoldenTests(unittest.TestCase):
    def test_ten_representative_matches(self) -> None:
        placed = _ts(8)
        cases: list[tuple[OrderContext, str]] = [
            (
                OrderContext("EU", "express", "ups", "b2c", placed),
                "eu-express",
            ),
            (
                OrderContext("EU", "standard", "fedex", "b2c", placed),
                "eu-standard",
            ),
            (
                OrderContext("NA", "express", "ups", "b2c", placed),
                "na-express-ups",
            ),
            (
                OrderContext("NA", "express", "fedex", "b2c", placed),
                "na-express",
            ),
            (
                OrderContext("NA", "standard", "fedex", "b2c", placed),
                "na-standard-fedex",
            ),
            (
                OrderContext("NA", "standard", "ups", "b2c", placed),
                "na-standard",
            ),
            (
                OrderContext("APAC", "standard", "fedex", "b2b", placed),
                "apac-b2b",
            ),
            (
                OrderContext("APAC", "standard", "dhl", "b2c", placed),
                "apac-dhl",
            ),
            (
                OrderContext("APAC", "standard", "japanpost", "b2c", placed),
                "apac-default",
            ),
            (
                OrderContext("OC", "standard", "auspost", "b2c", placed),
                "default",
            ),
        ]
        for ctx, expected_name in cases:
            with self.subTest(ctx=ctx):
                rule = select_policy(DEFAULT_POLICY_MATRIX, ctx)
                self.assertIsNotNone(rule)
                assert rule is not None
                self.assertEqual(rule.name, expected_name)

    def test_evaluate_sla_breach_risk_tiers(self) -> None:
        placed = _ts(8)
        ctx = OrderContext("NA", "express", "ups", "b2c", placed)
        rules = DEFAULT_POLICY_MATRIX
        low = evaluate_sla(rules, ctx, placed + timedelta(hours=10))
        mid = evaluate_sla(rules, ctx, placed + timedelta(hours=30))
        high = evaluate_sla(rules, ctx, placed + timedelta(hours=46))
        self.assertIsNotNone(low and mid and high)
        assert low and mid and high
        self.assertEqual(low.breach_risk, "low")
        self.assertEqual(mid.breach_risk, "medium")
        self.assertEqual(high.breach_risk, "high")


class ExportV2Tests(unittest.TestCase):
    def test_row_includes_timeline_and_sla(self) -> None:
        placed = _ts()
        ctx = OrderContext("EU", "express", "ups", "b2c", placed)
        sla = evaluate_sla(DEFAULT_POLICY_MATRIX, ctx, placed + timedelta(hours=1))
        events = [
            TimelineEvent(
                order_id="x",
                actor="a",
                from_status=None,
                to_status=FulfillmentStatus.CREATED,
                correlation_id="c0",
                idempotency_key="i0",
                occurred_at=placed,
            )
        ]
        row = build_export_v2_row(order_id="x", events=events, sla=sla)
        self.assertEqual(row["export_version"], 2)
        self.assertEqual(row["timeline_event_count"], 1)
        self.assertIn("breach_risk", row["sla"])


if __name__ == "__main__":
    unittest.main()
