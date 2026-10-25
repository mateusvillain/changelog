/**
 * Earlier releases, loaded on demand by the "Load earlier releases" button.
 * Placeholder content: replace with a real source (API/CMS) when available.
 *
 * Release shape:
 *   version     string   "3.0.0"
 *   date        string   ISO "YYYY-MM-DD"
 *   type        string   "new" | "improvement" | "fix"
 *   area        string   label for the secondary tag
 *   title       string
 *   description string
 *   author      { name, avatar }
 *   highlights  string[]
 *   cover       { src, width, height } | undefined (decorative image)
 *   url         string
 */
window.CHANGELOG_ARCHIVE = [
  {
    version: "3.0.0",
    date: "2026-08-14",
    type: "new",
    area: "Platform",
    title: "Lumen 3.0: a new interface",
    description: "A redesigned interface built from scratch, with clearer navigation, rearrangeable panels and a command bar to find anything quickly.",
    author: { name: "Ana Souza", avatar: "assets/avatars/ana-souza.jpg" },
    highlights: [
      "Command bar available with ⌘K / Ctrl+K",
      "Rearrangeable side panels",
      "Full keyboard navigation",
    ],
    url: "releases/v3.0.0",
  },
  {
    version: "2.9.3",
    date: "2026-07-30",
    type: "fix",
    area: "Export",
    title: "Export fixes",
    description: "We fixed export issues reported after the last update and improved error messages.",
    author: { name: "Diego Alves", avatar: "assets/avatars/diego-alves.jpg" },
    highlights: [
      "Exported SVGs keep layer IDs",
      "More descriptive error messages",
    ],
    url: "releases/v2.9.3",
  },
  {
    version: "2.9.0",
    date: "2026-07-08",
    type: "improvement",
    area: "Search",
    title: "Smarter search",
    description: "Search now understands synonyms and typos, and shows results from projects, files and comments in one place.",
    author: { name: "Júlia Martins", avatar: "assets/avatars/julia-martins.jpg" },
    highlights: [
      "Typo tolerance",
      "Filters by content type",
    ],
    url: "releases/v2.9.0",
  },
  {
    version: "2.8.1",
    date: "2026-06-19",
    type: "fix",
    area: "Editor",
    title: "Editor stability",
    description: "Stability improvements in the editor for projects with many pages.",
    author: { name: "Rafael Lima", avatar: "assets/avatars/rafael-lima.jpg" },
    highlights: [
      "Fixed autosave on unstable connections",
      "Undo works after switching pages",
    ],
    url: "releases/v2.8.1",
  },
  {
    version: "2.8.0",
    date: "2026-06-02",
    type: "new",
    area: "Integrations",
    title: "Slack integration",
    description: "Get notified about comments and mentions right in your team's channels.",
    author: { name: "Ana Souza", avatar: "assets/avatars/ana-souza.jpg" },
    highlights: [
      "Notifications by channel or direct message",
      "Reply to comments straight from Slack",
    ],
    url: "releases/v2.8.0",
  },
];
