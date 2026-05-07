---
name: spolt-admin-panel
description: Conventions and best practices for the Spolt admin panel. Use when working on any admin-facing UI, backend permission guards, or role-based access control. Covers the admin/ceo role hierarchy, admin event management, and consistent UI patterns between public and admin views.
---

# Spolt Admin Panel Skill

This skill documents the conventions, permission model, and UI patterns for the Spolt admin panel.

## Role Hierarchy

Spolt uses a role-based access control system with the following hierarchy:

| Role    | Permissions |
|---------|-------------|
| `user`  | Can join/leave events, manage own profile and friendships |
| `admin` | Can view and manage all events, view user friend lists |
| `ceo`   | All admin permissions + additional platform management |

**Critical Rule**: Backend permission guards must authorize **both** `admin` AND `ceo` roles for administrative endpoints. Never guard with only one of them.

```js
// Correct pattern
if (!['admin', 'ceo'].includes(req.user.role)) {
  return res.status(403).json({ message: 'Forbidden' });
}
```

## Admin vs. Public UI Parity

The admin event detail modals should stay **in sync** with the public-facing event modals in terms of:
- Participant level display (Beginner / Intermediate / Advanced) with sport-themed coloring
- Responsive layout and breakpoints
- Modal layering and scroll-lock behavior (see `spolt-modal-patterns` skill)

When updating the public event modal, **always check if the admin modal needs the same changes**.

## Admin Event Management

Admin users can:
- Edit event title, description, date, time, location
- Remove participants
- Delete events

UI buttons for destructive actions (delete, remove participant) must:
- Use a red/danger color from the palette (e.g., `#ff3b3b`)
- Require a confirmation step before executing
- Be hidden from non-admin users via conditional rendering

```html
<!-- Example conditional admin button -->
<button v-if="userRole === 'admin' || userRole === 'ceo'" class="btn-danger">
  Eliminar Evento
</button>
```

## Admin Panel Layout

- The admin sidebar uses a fixed position and must have a `z-index` lower than modals.
- The admin footer must also be below modal overlays.
- Follow the same **responsive breakpoints** as the public site:
  - Mobile: `< 768px`
  - Tablet: `768px – 1024px`
  - Desktop: `> 1024px`

## Checklist

- [ ] Do permission guards check for both `admin` AND `ceo`?
- [ ] Are destructive actions behind a confirmation step?
- [ ] Are admin-only buttons conditionally rendered based on role?
- [ ] Does the admin modal match the public modal's responsive behavior?
- [ ] Is the admin sidebar `z-index` lower than modal overlays?
