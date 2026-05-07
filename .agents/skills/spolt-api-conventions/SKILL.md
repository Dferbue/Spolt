---
name: spolt-api-conventions
description: Backend API conventions for the Spolt platform. Use when creating or modifying API endpoints, query parameters, service methods, or data models. Covers geospatial filtering, sorting options, participant management, and friendship service patterns.
---

# Spolt API Conventions Skill

This skill documents the established patterns and conventions for the Spolt backend API.

## Events Endpoint

Base: `/events`

### Supported Query Parameters

| Parameter   | Type    | Description |
|-------------|---------|-------------|
| `latitude`  | float   | User's current latitude for proximity sorting |
| `longitude` | float   | User's current longitude for proximity sorting |
| `radius`    | number  | Filter radius in kilometers |
| `sortBy`    | string  | `distance` or `createdAt` |
| `sport`     | string  | Filter by sport type |
| `level`     | string  | Filter by participant level (`beginner`, `intermediate`, `advanced`) |

### Coordinate Handling

- Always store and transmit coordinates as **floats** (never strings or integers).
- Distance calculation (Haversine formula) is performed on the **backend**.
- The frontend should always display the returned `distance` field clearly in the UI.

```js
// Example service call
const events = await EventService.findAll({
  latitude: parseFloat(userLat),
  longitude: parseFloat(userLon),
  radius: 10,
  sortBy: 'distance',
});
```

## Friendships Endpoint

Base: `/friendships`

- `GET /friendships/:userId` — Get a user's friend list
  - **Authorized roles**: `user` (own list only), `admin`, `ceo`
  - Guards must allow both `admin` and `ceo` to access any user's friend list

## Participant Levels

The platform uses three participant levels:

| Level          | Display Color |
|----------------|---------------|
| `beginner`     | Green (`#2ecc71`) |
| `intermediate` | Yellow (`#f1c40f`) |
| `advanced`     | Red (`#e74c3c`) |

Always apply sport-themed coloring consistently across both public and admin views.

## Sorting Best Practices

When adding a new sort option to an endpoint:
1. Add the option to the backend service query builder first.
2. Update the frontend dropdown/selector to expose the new option.
3. Ensure the sort option persists across page refreshes (use query params in the URL or local state).

## Common Pitfalls

- **Missing coordinate parsing**: Always `parseFloat()` coordinates from request query params, as they arrive as strings.
- **Role guard gaps**: Never guard admin endpoints with only one role — always check `['admin', 'ceo']`.
- **Real-time participant count**: When a user joins or leaves an event, update `current_participants` in the UI immediately without a full page reload.

## Checklist

- [ ] Are coordinates parsed as floats before use?
- [ ] Does the endpoint support `sortBy=distance` and `sortBy=createdAt`?
- [ ] Do permission guards cover both `admin` and `ceo` roles?
- [ ] Is the `distance` field returned and displayed in the frontend?
- [ ] Is `current_participants` updated in real-time on join/leave?
