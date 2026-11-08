/**
 * The ApexForm page's schema and its starting values — AF2-294.
 *
 * Lifted from the gallery's shell rather than written again: this schema IS
 * the demonstration. It carries the conditional pair the design record
 * describes — custom pricing off shows the four price fields, on shows only
 * the sales contact — and a server-only rule, so the page can print what the
 * browser cannot settle.
 */

export const FORM_SCHEMA = {
  title: 'Edit Plan',
  subtitle: 'Pricing, features and capacity for this subscription plan.',
  icon: 'layers',
  sections: [
    { id: 'details', title: 'Details', icon: 'info', columns: 2, fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Free' },
      { key: 'slug', label: 'Slug', type: 'slug', required: true,
        help: 'Lowercase identifier.', rules: 'required|maxLength:40' },
      { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { key: 'published', label: 'Published', type: 'switch' },
      { key: 'popular', label: 'Popular', type: 'switch' },
      { key: 'custom', label: 'Custom', type: 'switch',
        help: 'No self-serve price \u2014 shows a Contact-sales card.' },
      { key: 'sort', label: 'Sort order', type: 'number', min: 0 },
    ] },
    { id: 'pricing', title: 'Pricing', icon: 'receipt_long', columns: 2, fields: [
      { key: 'monthly', label: 'Monthly price', type: 'money', min: 0,
        hiddenIf: { custom: true }, rules: 'required|numeric|min:0' },
      { key: 'yearly', label: 'Yearly price', type: 'money', min: 0,
        hiddenIf: { custom: true }, help: 'Leave blank for monthly only.' },
      { key: 'currency', label: 'Currency', type: 'select', hiddenIf: { custom: true },
        options: [{ label: 'Euro (EUR)', value: 'EUR' }, { label: 'Pound (GBP)', value: 'GBP' },
          { label: 'Dollar (USD)', value: 'USD' }] },
      { key: 'billing', label: 'Billing cycle', type: 'segmented', hiddenIf: { custom: true },
        options: [{ label: 'Monthly', value: 'm' }, { label: 'Yearly', value: 'y' },
          { label: 'Both', value: 'b' }] },
      { key: 'trialDays', label: 'Trial length', type: 'stepper', min: 0, max: 90,
        help: 'Days before the first charge.' },
      /* The inverse condition, and the pair that proves the shorthand:
         this appears only when custom is ON, and is required only then. */
      { key: 'contactEmail', label: 'Sales contact', type: 'email', span: 2,
        visibleIf: { custom: true }, rules: 'required|email' },
    ] },
    { id: 'features', title: 'Features', icon: 'grid_view', columns: 1, fields: [
      { key: 'features', label: 'Included features', type: 'checkboxes',
        options: [{ label: 'Analytics dashboard', value: 'analytics' },
          { label: 'Scheduled playlists', value: 'playlists' },
          { label: 'Multi-screen sync', value: 'sync' },
          { label: 'Priority support', value: 'support' }] },
      { key: 'tier', label: 'Support tier', type: 'radio',
        options: [{ label: 'Community', value: 'community' },
          { label: 'Business hours', value: 'bh' }, { label: '24/7', value: '247' }] },
      { key: 'tags', label: 'Tags', type: 'tags', help: 'Press Enter to add.' },
    ] },
    { id: 'resources', title: 'Resources', icon: 'layers', columns: 2, fields: [
      { key: 'maxDisplays', label: 'Max displays', type: 'number', min: 1,
        rules: 'required|integer|min:1' },
      { key: 'maxUsers', label: 'Max users', type: 'number', min: 1 },
      { key: 'storageGb', label: 'Storage', type: 'slider', min: 0, max: 500, span: 2,
        help: 'Gigabytes included.' },
      /* A unique: rule cannot be settled in a browser -- retained, never
         evaluated locally, and named by serverOnlyFields. */
      { key: 'ownerEmail', label: 'Plan owner', type: 'email', span: 2,
        rules: 'required|email|unique:users,email',
        help: 'Checked against existing accounts on save.' },
    ] },
  ],
};

export const FORM_MODEL = {
  name: 'Free', slug: 'free', description: 'Get started \u2014 adverts only, up to 3 displays.',
  published: true, popular: false, custom: false, sort: 0,
  monthly: 0, currency: 'EUR', billing: 'm', trialDays: 0, tier: 'community',
  features: ['analytics'], maxDisplays: 3, storageGb: 5, ownerEmail: 'ops@example.com',
};
