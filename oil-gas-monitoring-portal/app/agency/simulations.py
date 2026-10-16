"""Deterministic sandbox physics, policies and route plans. No device outputs."""

import numpy as np
import networkx as nx


def tank(inflow=2.0, outflow=1.8, steps=80):
    level, capacity, target = 50.0, 100.0, 50.0
    points, spills, residuals = [], 0, []
    for tick in range(steps):
        previous = level
        raw = previous + inflow - outflow
        spill, shortage = max(0.0, raw - capacity), max(0.0, -raw)
        level = min(capacity, max(0.0, raw))
        residuals.append(level - previous - (inflow - outflow - spill + shortage))
        spills += int(spill > 0 or shortage > 0)
        points.append({"x": tick, "y": level, "label": f"tick {tick}"})
    return {
        "mode": "simulation",
        "title": "Synthetic storage mass-balance model",
        "metrics": {
            "final_inventory": level,
            "capacity": capacity,
            "constraint_events": spills,
            "maximum_balance_residual": max(abs(r) for r in residuals),
        },
        "chart": {
            "kind": "line",
            "x_label": "Synthetic timestep",
            "y_label": "Synthetic volume units",
            "points": points,
        },
        "assumptions": {
            "initial_inventory": 50,
            "target": target,
            "inflow": inflow,
            "outflow": outflow,
            "capacity": capacity,
            "equation": "inventory_next = inventory + inflow - outflow - spill + shortage",
        },
        "limitations": [
            "Uncalibrated teaching model; no temperature, composition, pressure or LNG boil-off physics.",
            "No plant tag connection, actuator output or operational optimization claim.",
        ],
    }


def step(state, action, rng):
    raw = state + int(rng.integers(1, 4)) - action
    violation = int(raw < 0 or raw > 10)
    next_state = int(np.clip(raw, 0, 10))
    reward = -abs(next_state - 5) - 10 * violation - 0.05 * action
    return next_state, reward, violation


def reinforcement():
    rng = np.random.default_rng(42)
    q = np.zeros((11, 5))
    for episode in range(1200):
        state = int(rng.integers(0, 11))
        epsilon = max(0.05, 0.9 * (1 - episode / 1200))
        for _ in range(30):
            action = (
                int(rng.integers(0, 5))
                if rng.random() < epsilon
                else int(q[state].argmax())
            )
            following, reward, _ = step(state, action, rng)
            q[state, action] += 0.15 * (
                reward + 0.95 * q[following].max() - q[state, action]
            )
            state = following
    scores, violations = {}, {}
    for name in ["learned", "fixed"]:
        returns, counts = [], []
        for seed in range(100, 120):
            evaluation = np.random.default_rng(seed)
            state, total, count = 5, 0.0, 0
            for _ in range(60):
                action = int(q[state].argmax()) if name == "learned" else 2
                state, reward, violation = step(state, action, evaluation)
                total += reward
                count += violation
            returns.append(total)
            counts.append(count)
        scores[name] = float(np.mean(returns))
        violations[name] = int(sum(counts))
    evaluation = np.random.default_rng(123)
    state, points = 5, []
    for tick in range(60):
        action = int(q[state].argmax())
        state, _, _ = step(state, action, evaluation)
        points.append({"x": tick, "y": state, "label": f"action {action}"})
    return {
        "mode": "simulation",
        "title": "Q-learning storage-policy sandbox",
        "metrics": {
            "episodes": 1200,
            "evaluation_seeds": 20,
            "learned_mean_return": scores["learned"],
            "fixed_mean_return": scores["fixed"],
            "learned_constraint_events": violations["learned"],
            "fixed_constraint_events": violations["fixed"],
        },
        "chart": {
            "kind": "line",
            "x_label": "Timestep",
            "y_label": "Discrete synthetic inventory",
            "points": points,
        },
        "policy": [
            {"inventory": i, "outflow_action": int(q[i].argmax())} for i in range(11)
        ],
        "assumptions": {
            "states": 11,
            "actions": 5,
            "target": 5,
            "inflow": "uniform integer 1..3",
            "reward": "-abs(inventory-5) - 10*constraint_event - 0.05*outflow_action",
        },
        "limitations": [
            "Tabular Q-learning in an invented environment, not a learned field controller.",
            "Reward and constraint penalties are demo assumptions; no sim-to-real validation.",
        ],
    }


def route(blocked=False):
    graph = nx.grid_2d_graph(10, 10)
    obstacles = [(4, y) for y in range(10) if blocked or y != 5]
    graph.remove_nodes_from(obstacles)
    try:
        path = nx.shortest_path(graph, (0, 0), (9, 9))
    except nx.NetworkXNoPath:
        path = []
    return {
        "mode": "simulation",
        "title": "Inspection route with no-go cells",
        "metrics": {
            "route_found": bool(path),
            "steps": max(0, len(path) - 1),
            "obstacle_cells": len(obstacles),
        },
        "chart": {
            "kind": "route",
            "points": [
                {"x": x, "y": y, "label": str(i)} for i, (x, y) in enumerate(path)
            ],
            "obstacles": [{"x": x, "y": y} for x, y in obstacles],
            "x_label": "Synthetic grid X",
            "y_label": "Synthetic grid Y",
        },
        "assumptions": {
            "grid": [10, 10],
            "start": [0, 0],
            "goal": [9, 9],
            "movement": "four-neighbor unit-cost",
        },
        "limitations": [
            "Synthetic geometry; no actual facility layout, coordinates or flight authorization.",
            "A route is not a collision-safe autonomous robot/drone controller.",
        ],
    }
