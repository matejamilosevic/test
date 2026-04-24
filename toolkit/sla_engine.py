"""Declarative SLA policy matching and evaluation (KAN-16 / ORD-4821 demo)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Literal

BreachRisk = Literal["low", "medium", "high"]


@dataclass(frozen=True)
class OrderContext:
    region: str
    product_class: str
    carrier: str
    channel: str
    order_placed_at: datetime


@dataclass(frozen=True)
class SLAPolicyRule:
    """None in dimension fields means wildcard."""

    name: str
    region: str | None
    product_class: str | None
    carrier: str | None
    channel: str | None
    ship_within_hours: int
    deliver_within_hours: int


@dataclass(frozen=True)
class SLAResult:
    sla_deadline_at: datetime
    breach_risk: BreachRisk
    eta_window_start: datetime
    eta_window_end: datetime
    matched_policy_name: str


def _matches(rule: SLAPolicyRule, ctx: OrderContext) -> bool:
    if rule.region is not None and rule.region != ctx.region:
        return False
    if rule.product_class is not None and rule.product_class != ctx.product_class:
        return False
    if rule.carrier is not None and rule.carrier != ctx.carrier:
        return False
    if rule.channel is not None and rule.channel != ctx.channel:
        return False
    return True


def _specificity(rule: SLAPolicyRule) -> int:
    score = 0
    if rule.region is not None:
        score += 8
    if rule.product_class is not None:
        score += 4
    if rule.carrier is not None:
        score += 2
    if rule.channel is not None:
        score += 1
    return score


def select_policy(rules: list[SLAPolicyRule], ctx: OrderContext) -> SLAPolicyRule | None:
    candidates = [r for r in rules if _matches(r, ctx)]
    if not candidates:
        return None
    return max(candidates, key=lambda r: (_specificity(r), r.name))


def evaluate_sla(
    rules: list[SLAPolicyRule],
    ctx: OrderContext,
    now: datetime,
) -> SLAResult | None:
    rule = select_policy(rules, ctx)
    if rule is None:
        return None
    placed = ctx.order_placed_at
    deadline = placed + timedelta(hours=rule.deliver_within_hours)
    eta_start = placed + timedelta(hours=min(rule.ship_within_hours, rule.deliver_within_hours))
    eta_end = placed + timedelta(hours=rule.deliver_within_hours)
    window_s = max(1.0, (deadline - placed).total_seconds())
    elapsed = (now - placed).total_seconds()
    frac = elapsed / window_s
    if frac < 0.5:
        risk: BreachRisk = "low"
    elif frac < 0.85:
        risk = "medium"
    else:
        risk = "high"
    return SLAResult(
        sla_deadline_at=deadline,
        breach_risk=risk,
        eta_window_start=eta_start,
        eta_window_end=eta_end,
        matched_policy_name=rule.name,
    )


DEFAULT_POLICY_MATRIX: list[SLAPolicyRule] = [
    SLAPolicyRule("default", None, None, None, None, 48, 120),
    SLAPolicyRule("eu-express", "EU", "express", None, None, 24, 72),
    SLAPolicyRule("eu-standard", "EU", "standard", None, None, 48, 96),
    SLAPolicyRule("na-express-ups", "NA", "express", "ups", None, 12, 48),
    SLAPolicyRule("na-express", "NA", "express", None, None, 24, 72),
    SLAPolicyRule("na-standard-fedex", "NA", "standard", "fedex", None, 36, 96),
    SLAPolicyRule("na-standard", "NA", "standard", None, None, 48, 120),
    SLAPolicyRule("apac-b2b", "APAC", None, None, "b2b", 72, 168),
    SLAPolicyRule("apac-dhl", "APAC", None, "dhl", None, 48, 144),
    SLAPolicyRule("apac-default", "APAC", None, None, None, 60, 156),
]
