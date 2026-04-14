/** Mirrors backend DEFAULT_SITE_SETTINGS so first paint matches production (jeecollege.com). */

export const SITE_DEFAULTS = {
  hero: {
    badge: "200+ Colleges • 22 States • 300+ Cutoff Entries",
    heading_prefix: "Explore",
    heading_highlight: "JEE",
    heading_suffix: "Colleges",
    subheading:
      "Choose your best college. Compare IITs, NITs, BITS & 200+ engineering colleges across India.",
    description:
      "Check NIRF rankings, fees, placements, cutoff data — and register for personalized counseling.",
    cta_primary_text: "Explore Colleges",
    cta_primary_link: "/colleges",
    cta_secondary_text: "JEE Rank Predictor",
    cta_secondary_link: "/predictor",
    cta_tertiary_text: "Register for Counseling",
    cta_tertiary_link: "/login",
    stats: [
      { value: "217+", label: "Colleges Listed" },
      { value: "22", label: "Indian States" },
      { value: "309", label: "Cutoff Entries" },
      { value: "179", label: "Colleges with Cutoffs" },
    ],
  },
  branding: {
    logo_part1: "JEE",
    logo_part2: "college",
    logo_part3: ".com",
    primary_color: "#002FA7",
    site_name: "JEEcollege.com",
    logo_image: "",
    theme: "light",
  },
  seo: {
    default_title: "Explore JEE Colleges | Choose Your Best College",
    default_description:
      "Explore 200+ top JEE engineering colleges across 22 Indian states. Compare IITs, NITs, BITS. Check NIRF rankings, fees, placements. Register for personalized counseling.",
    default_keywords:
      "JEE colleges, JEE Main colleges, JEE Advanced colleges, IIT, NIT, BITS, engineering colleges India, NIRF rankings, college predictor, JEE counseling",
  },
  footer: {
    description:
      "India's comprehensive platform for JEE college discovery, comparison, and counseling. Making informed education decisions accessible for all.",
    copyright: "© 2026 JEEcollege.com. All rights reserved.",
    links: [
      { label: "Explore Colleges", url: "/colleges" },
      { label: "JEE Rank Predictor", url: "/predictor" },
      { label: "Compare Colleges", url: "/compare" },
      { label: "Student Community", url: "/community" },
    ],
  },
  quick_actions: [
    {
      title: "Compare Colleges",
      description: "Side-by-side comparison with cutoff rankings",
      link: "/compare",
      icon: "Scales",
    },
    {
      title: "JEE Rank Predictor",
      description: "309 cutoff entries across 179 colleges",
      link: "/predictor",
      icon: "GraduationCap",
    },
    {
      title: "Save & Shortlist",
      description: "Bookmark colleges for your personal shortlist",
      link: "/bookmarks",
      icon: "BookmarkSimple",
    },
  ],
  community_categories: [
    { name: "JEE / College Decision", icon: "GraduationCap" },
    { name: "Career & Future Skills", icon: "TrendUp" },
    { name: "Education System", icon: "Users" },
    { name: "Mindset & Life Decisions", icon: "Users" },
    { name: "Career Strategy & Money", icon: "TrendUp" },
  ],
};
