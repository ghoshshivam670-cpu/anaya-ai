export const brand = {
  name: "Anaya.ai",
  shortName: "Anaya",
  domain: "anaya.ai",
  tagline: "AI for WooCommerce that runs the store, not just the chatbot.",
  description:
    "Three AIs find and fix the revenue leaks in high-traffic WooCommerce stores — slow pages, checkout bugs, launch-day crashes — on top of sub-second managed hosting with isolated Dev, QA, and Production environments.",
  email: "founders@anaya.ai",
  docsUrl: "/docs",
  demoUrl: "/demo",
  contactUrl: "/contact",
  heroMetrics: [
    { label: "Median Cart", value: "236ms", detail: "Edge cache bypassed" },
    { label: "Median Checkout", value: "321ms", detail: "HPOS + Redis tuned" },
    { label: "Traffic Surge", value: "16x", detail: "Auto-scales in <30s" },
    { label: "Checkout SLA", value: "99.99%", detail: "Multi-zone failover" },
  ],
  aiAgents: [
    {
      id: "revenue",
      name: "Revenue AI",
      badge: "Guards",
      color: "emerald",
      headline: "Guards your cart, checkout, pricing, and payments 24/7",
      summary:
        "Monitors checkout, cart, pricing, and payments around the clock, prices every regression in dollars, and ships the fix as a pull request.",
    },
    {
      id: "builder",
      name: "Builder AI",
      badge: "Ships",
      color: "cyan",
      headline: "Ships plain-English features tested through your pipeline",
      summary:
        "Converts plain-English requests into features and third-party integrations — tested, pushed through your review pipeline, and kept one click from rollback.",
    },
    {
      id: "analytics",
      name: "Analytics AI",
      badge: "Decides",
      color: "amber",
      headline: "Answers complex questions across WooCommerce, GA4 & Stripe",
      summary:
        "Answers complex business questions regarding live store data, Google Analytics, and Stripe metrics with shareable charts.",
    },
  ],
} as const;
