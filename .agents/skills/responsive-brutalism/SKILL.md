---
name: responsive-brutalism
description: Ensures Neo-Brutalist components remain usable and visually impactful across all screen sizes (Mobile, Tablet, Desktop).
---

# Responsive Brutalism Skill

Brutalist design can be tricky on small screens due to thick borders and large typography. This skill helps manage that.

## Mobile First Strategy

1.  **Compact Cards**: Reduce padding on mobile to maximize content space while keeping borders.
2.  **Fluid Typography**: Use `clamp()` or media queries to scale down large headers.
3.  **Sticky Actions**: Keep "Join" or "Create" buttons accessible, often sticky at the bottom or top of the viewport.
4.  **Overflow Management**: Avoid horizontal scroll on cards. Ensure maps and images scale correctly.

## Breakpoints

- **Mobile**: `< 768px` (Single column, full width cards)
- **Tablet**: `768px - 1024px` (Two columns or refined spacing)
- **Desktop**: `> 1024px` (Full layout)

## Interaction Patterns

- **Modals**: On mobile, modals should take up most of the screen (`width: 95%`) and have a clear "X" button at the top right.
- **Lists**: Convert horizontal lists to vertical stacks or horizontally scrollable containers if appropriate.

## CSS Utilities

Always check `index.css` for existing responsive variables or utility classes before adding new ones.
