---
name: spolt-modal-patterns
description: Best practices for creating and managing modals in Spolt. Use when building, fixing, or restyling any modal component, including event detail modals, admin modals, and confirmation dialogs. Covers z-index layering, body scroll locking, sticky close buttons, and mobile responsiveness.
---

# Spolt Modal Patterns Skill

This skill documents the established patterns for all modal components in the Spolt platform to ensure consistency, correct layering, and mobile usability.

## Core Rules

1. **Body scroll locking**: Always toggle the `.modal-open` class on `document.body` when a modal opens or closes. This prevents background scrolling on mobile.
   ```js
   // Open
   document.body.classList.add('modal-open');
   // Close
   document.body.classList.remove('modal-open');
   ```

2. **Z-index layering**: Modals must always appear above the sidebar and footer. Use a minimum `z-index: 1000` on the overlay and `z-index: 1001` on the modal itself.
   ```css
   .modal-overlay {
     position: fixed;
     inset: 0;
     background: rgba(0, 0, 0, 0.5);
     z-index: 1000;
   }
   .modal-content {
     position: relative;
     z-index: 1001;
   }
   ```

3. **Close button**: Every modal MUST have a clearly visible close button. On mobile, it should be **sticky at the top-right** so it's always accessible even when content scrolls.
   ```css
   .modal-close-btn {
     position: sticky;
     top: 0;
     right: 0;
     float: right;
     z-index: 10;
   }
   ```

## Mobile Layout (< 768px)

- Modal width: `95vw`
- Modal max-height: `90vh` with `overflow-y: auto`
- The close "X" button must be sticky so it doesn't scroll away
- Maps inside modals must be given a fixed height (e.g., `250px`) to render correctly inside flex/scroll containers

```css
@media (max-width: 768px) {
  .modal-content {
    width: 95vw;
    max-height: 90vh;
    overflow-y: auto;
  }
}
```

## Neo-Brutalist Modal Style

All modals must follow the Neo-Brutalist aesthetic:
- `border: 3px solid #000`
- `box-shadow: 6px 6px 0px #000`
- Sharp corners (`border-radius: 0`)
- Bold header text

## Map Initialization Inside Modals

Maps (e.g., Leaflet) inside modals often fail to render correctly because the container has zero size when hidden. Always call `map.invalidateSize()` after the modal becomes visible:

```js
modal.addEventListener('shown', () => {
  if (mapInstance) {
    mapInstance.invalidateSize();
  }
});
```

## Checklist

- [ ] Does `document.body` get `.modal-open` on open and lose it on close?
- [ ] Is the modal overlay `z-index` above the sidebar (`z-index >= 1000`)?
- [ ] Is there a sticky close button on mobile?
- [ ] Does the modal use `95vw` width on mobile?
- [ ] If there's a map, is `invalidateSize()` called after the modal opens?
- [ ] Does the modal follow Neo-Brutalist borders and shadows?
