---
name: spolt-event-logic
description: Logic and best practices for managing events in Spolt, including proximity sorting, coordinate handling, and participant levels.
---

# Spolt Event Logic Skill

This skill provides guidance on the core business logic of the Spolt platform.

## Event Data Structure

Events are the heart of Spolt. They typically include:
- `title`, `description`, `sport_type`
- `latitude`, `longitude` (for mapping and proximity)
- `date`, `time`
- `max_participants`, `current_participants`
- `level` (Beginner, Intermediate, Advanced)

## Proximity Sorting

When handling event lists, prioritize sorting by distance if coordinates are available.
Formula for distance (Haversine) is usually handled by the backend, but ensures the frontend displays it clearly.

## Best Practices

1.  **Coordinate Precision**: Always store and transmit coordinates as floats.
2.  **Role Validation**: Ensure only 'admin', 'ceo', or the event creator can modify event details.
3.  **Real-time Updates**: When a user joins/leaves, update the `current_participants` count immediately in the UI.

## Common Tasks

- **Filtering**: Use the backend `/events` endpoint with `latitude`, `longitude`, and `radius` params.
- **Sorting**: Support sorting by `distance` and `createdAt`.
