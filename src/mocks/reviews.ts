import type { Review } from "@/types";

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const MOCK_REVIEWS: Review[] = [
  {
    id: "rev_001",
    listingId: "lst_001",
    authorName: "Lena M.",
    authorEmoji: "🏔️",
    rating: 5,
    title: "Once in a lifetime!",
    comment:
      "The views were absolutely unreal. My pilot was super professional and made me feel completely safe. Worth every penny.",
    pros: ["Amazing views", "Professional pilot"],
    cons: [],
    date: daysAgo(3),
    supplierReply: "Thank you Lena! It was a pleasure flying with you.",
  },
  {
    id: "rev_002",
    listingId: "lst_001",
    authorName: "David K.",
    authorEmoji: "🪂",
    rating: 4,
    title: "Great but weather dependent",
    comment:
      "We got lucky with a clear day. Booking was easy, pickup was on time. Photos were a bit pricey as an add-on.",
    pros: ["Well organized", "Great safety briefing"],
    cons: ["Photo package is pricey"],
    date: daysAgo(8),
  },
  {
    id: "rev_003",
    listingId: "lst_002",
    authorName: "Sarah T.",
    authorEmoji: "🏝️",
    rating: 5,
    title: "Best day in Bali",
    comment:
      "Kelingking viewpoint is even more stunning in person. Snorkeling with manta rays was the highlight of our whole trip.",
    pros: ["Stunning scenery", "Great snorkeling", "Good lunch"],
    cons: [],
    date: daysAgo(2),
  },
  {
    id: "rev_004",
    listingId: "lst_003",
    authorName: "Yuki N.",
    authorEmoji: "🍣",
    rating: 5,
    title: "Ate like royalty",
    comment:
      "Our guide took us to places we would never have found on our own. 12 dishes is no joke — come hungry!",
    pros: ["Hidden gems", "Great guide", "Generous portions"],
    cons: [],
    date: daysAgo(1),
  },
  {
    id: "rev_005",
    listingId: "lst_004",
    authorName: "Miguel R.",
    authorEmoji: "🌆",
    rating: 4,
    title: "Views worth it",
    comment:
      "The sunset slot is the one to book. Lines were short with the timed entry. A bit crowded on the deck though.",
    pros: ["Breathtaking views", "Fast entry"],
    cons: ["Busy at sunset"],
    date: daysAgo(6),
  },
  {
    id: "rev_006",
    listingId: "lst_005",
    authorName: "Anna W.",
    authorEmoji: "💙",
    rating: 5,
    title: "Pure relaxation",
    comment:
      "The transfer was smooth and the lagoon was magical. Book the earliest slot for the quietest experience.",
    pros: ["Beautiful setting", "Smooth transfer", "Comfort ticket worth it"],
    cons: [],
    date: daysAgo(4),
  },
  {
    id: "rev_007",
    listingId: "lst_010",
    authorName: "Tom H.",
    authorEmoji: "🎋",
    rating: 5,
    title: "Beat the crowds, see the magic",
    comment:
      "We had the bamboo grove almost to ourselves. Our guide's stories about Kyoto's history made it special.",
    pros: ["Empty grove", "Great storytelling", "Tea was lovely"],
    cons: [],
    date: daysAgo(5),
  },
];
