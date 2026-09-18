// Words the site itself says, as opposed to what it says about its owner.
// Kept here so a second instance can rewrite them without touching a component.
export const site = {
  // Shown above the counter while the estate loads.
  loadingLine: 'Laying out the estate',
  // The first-run card: what this is, then how to use it.
  orientation: [
    'Each building on this estate is a project.',
    'Drag to look around, then click one to step inside.',
  ],
  orientationDismiss: 'Got it',
} as const
