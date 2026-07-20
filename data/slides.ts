// Slide data definition
// - type: "image" | "video"
// - category: drink name, used to group slides in the sidebar TOC (null = cover)
// - sub: which of the 4 standard views this slide represents
// - src: path under /public/media
// - poster: thumbnail frame for video slides (extracted from the original pptx)

export type SubType = "catalog" | "catalogKr" | "pairing" | "video";

export type Slide = {
  id: number;
  title: string;
  sub: SubType | null; // null for the cover slide
  category: string | null;
  type: "image" | "video";
  src: string;
  poster?: string;
};

export const subLabels: Record<SubType, string> = {
  catalog: "Catalog",
  catalogKr: "Catalog (KR)",
  pairing: "Food Pairing",
  video: "Intro Video",
};

// Accent color per drink, used for category theming throughout the UI
export const categoryColors: Record<string, string> = {
  "Matcha Latte": "#5b7a4f",
  "Roasted Sweet Potato Latte": "#a8703f",
  "Roasted Corn Latte": "#c08a2e",
  "Purple Sweet Potato Latte": "#7a5aa0",
  "Injeolmi Ssuk Latte": "#6d8f4e",
};

export const slides: Slide[] = [
  { id: 1, title: "Cover", sub: null, category: null, type: "image", src: "/media/image1.png" },

  { id: 2, title: "Matcha Latte — Catalog", sub: "catalog", category: "Matcha Latte", type: "image", src: "/media/image2.png" },
  { id: 3, title: "Matcha Latte — Catalog (KR)", sub: "catalogKr", category: "Matcha Latte", type: "image", src: "/media/image3.png" },
  { id: 4, title: "Matcha Latte — Food Pairing", sub: "pairing", category: "Matcha Latte", type: "image", src: "/media/image4.png" },
  { id: 5, title: "Matcha Latte — Intro Video", sub: "video", category: "Matcha Latte", type: "video", src: "/media/media1.mp4", poster: "/media/image5.png" },

  { id: 6, title: "Roasted Sweet Potato Latte — Catalog", sub: "catalog", category: "Roasted Sweet Potato Latte", type: "image", src: "/media/image6.png" },
  { id: 7, title: "Roasted Sweet Potato Latte — Catalog (KR)", sub: "catalogKr", category: "Roasted Sweet Potato Latte", type: "image", src: "/media/image7.png" },
  { id: 8, title: "Roasted Sweet Potato Latte — Food Pairing", sub: "pairing", category: "Roasted Sweet Potato Latte", type: "image", src: "/media/image8.png" },
  { id: 9, title: "Roasted Sweet Potato Latte — Intro Video", sub: "video", category: "Roasted Sweet Potato Latte", type: "video", src: "/media/media2.mp4", poster: "/media/image9.png" },

  { id: 10, title: "Roasted Corn Latte — Catalog", sub: "catalog", category: "Roasted Corn Latte", type: "image", src: "/media/image10.png" },
  { id: 11, title: "Roasted Corn Latte — Catalog (KR)", sub: "catalogKr", category: "Roasted Corn Latte", type: "image", src: "/media/image11.png" },
  { id: 12, title: "Roasted Corn Latte — Food Pairing", sub: "pairing", category: "Roasted Corn Latte", type: "image", src: "/media/image12.png" },
  { id: 13, title: "Roasted Corn Latte — Intro Video", sub: "video", category: "Roasted Corn Latte", type: "video", src: "/media/media3.mp4", poster: "/media/image13.png" },

  { id: 14, title: "Purple Sweet Potato Latte — Catalog", sub: "catalog", category: "Purple Sweet Potato Latte", type: "image", src: "/media/image14.png" },
  { id: 15, title: "Purple Sweet Potato Latte — Catalog (KR)", sub: "catalogKr", category: "Purple Sweet Potato Latte", type: "image", src: "/media/image15.png" },
  { id: 16, title: "Purple Sweet Potato Latte — Food Pairing", sub: "pairing", category: "Purple Sweet Potato Latte", type: "image", src: "/media/image16.png" },
  { id: 17, title: "Purple Sweet Potato Latte — Intro Video", sub: "video", category: "Purple Sweet Potato Latte", type: "video", src: "/media/media4.mp4", poster: "/media/image17.png" },

  { id: 18, title: "Injeolmi Ssuk Latte — Catalog", sub: "catalog", category: "Injeolmi Ssuk Latte", type: "image", src: "/media/image18.png" },
  { id: 19, title: "Injeolmi Ssuk Latte — Catalog (KR)", sub: "catalogKr", category: "Injeolmi Ssuk Latte", type: "image", src: "/media/image19.png" },
  { id: 20, title: "Injeolmi Ssuk Latte — Food Pairing", sub: "pairing", category: "Injeolmi Ssuk Latte", type: "image", src: "/media/image20.png" },
  { id: 21, title: "Injeolmi Ssuk Latte — Intro Video", sub: "video", category: "Injeolmi Ssuk Latte", type: "video", src: "/media/media5.mp4", poster: "/media/image21.png" },
];

export const categories = Array.from(
  new Set(slides.map((s) => s.category).filter((c): c is string => !!c))
);
