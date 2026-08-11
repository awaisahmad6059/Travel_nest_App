import type { Booking, ListingImage, Thumbnail } from "@/types";
import { MOCK_LISTINGS } from "./listings";

const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const listingThumb = (id: string): Thumbnail | undefined =>
  MOCK_LISTINGS.find((l) => l.id === id)?.thumbnail;

const listingImage = (id: string): ListingImage | undefined =>
  MOCK_LISTINGS.find((l) => l.id === id)?.images[0];

/**
 * Bookings for the demo customer (customer@demo.com).
 * When the real API is available this will come from GET /bookings?userId=...
 */
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk_001",
    bookingRef: "TN-8F2K1A",
    items: [
      {
        listingId: "lst_001",
        listingSlug: "interlaken-paragliding",
        title: "Interlaken Tandem Paragliding Flight",
        thumbnailKey: "paragliding",
        thumbnail: listingThumb("lst_001"),
        imageUrl: listingImage("lst_001")?.url,
        optionName: "Classic Flight",
        date: daysFromNow(7),
        quantity: 2,
        unitPrice: { amount: 189, currency: "USD", display: "$189.00" },
        total: { amount: 378, currency: "USD", display: "$378.00" },
      },
    ],
    status: "confirmed",
    createdAt: daysAgo(2),
    activityDate: daysFromNow(7),
    travelers: [{ id: "tr_1", name: "Demo Customer", email: "customer@demo.com" }],
    total: { amount: 378, currency: "USD", display: "$378.00" },
    voucherCode: "TNV-4471-8892-001",
    qrToken: "TN-8F2K1A:CLASSIC:2",
    supplierId: "sup_1",
    supplierName: "Summit Adventures Co.",
  },
  {
    id: "bk_002",
    bookingRef: "TN-9QW4ZX",
    items: [
      {
        listingId: "lst_003",
        listingSlug: "tokyo-izakaya-food-tour",
        title: "Shinjuku Izakaya Hopping Food Tour",
        thumbnailKey: "tokyo-food",
        thumbnail: listingThumb("lst_003"),
        imageUrl: listingImage("lst_003")?.url,
        optionName: "Classic Tour",
        date: daysFromNow(3),
        quantity: 1,
        unitPrice: { amount: 99, currency: "USD", display: "$99.00" },
        total: { amount: 99, currency: "USD", display: "$99.00" },
      },
    ],
    status: "confirmed",
    createdAt: daysAgo(1),
    activityDate: daysFromNow(3),
    travelers: [{ id: "tr_2", name: "Ayesha Rahman", email: "ayesha@example.com" }],
    total: { amount: 99, currency: "USD", display: "$99.00" },
    voucherCode: "TNV-2210-5566-102",
    qrToken: "TN-9QW4ZX:CLASSIC:1",
    supplierId: "sup_3",
    supplierName: "Urban Food Trails",
  },
  {
    id: "bk_003",
    bookingRef: "TN-3MM2PT",
    items: [
      {
        listingId: "lst_002",
        listingSlug: "bali-nusa-penida-day-trip",
        title: "Nusa Penida Island Day Trip by Speedboat",
        thumbnailKey: "nusa-penida",
        thumbnail: listingThumb("lst_002"),
        imageUrl: listingImage("lst_002")?.url,
        optionName: "West Side Highlights",
        date: daysFromNow(14),
        quantity: 2,
        unitPrice: { amount: 85, currency: "USD", display: "$85.00" },
        total: { amount: 170, currency: "USD", display: "$170.00" },
      },
    ],
    status: "pending",
    createdAt: daysAgo(0),
    activityDate: daysFromNow(14),
    travelers: [{ id: "tr_3", name: "Demo Customer", email: "customer@demo.com" }],
    total: { amount: 170, currency: "USD", display: "$170.00" },
    voucherCode: "",
    qrToken: "",
    supplierId: "sup_2",
    supplierName: "Island Hopper Tours",
  },
  {
    id: "bk_004",
    bookingRef: "TN-77LL2K",
    items: [
      {
        listingId: "lst_005",
        listingSlug: "reykjavik-blue-lagoon-express",
        title: "Blue Lagoon Express Entry + Transfer",
        thumbnailKey: "blue-lagoon",
        thumbnail: listingThumb("lst_005"),
        imageUrl: listingImage("lst_005")?.url,
        optionName: "Comfort package",
        date: daysAgo(21),
        quantity: 2,
        unitPrice: { amount: 135, currency: "USD", display: "$135.00" },
        total: { amount: 270, currency: "USD", display: "$270.00" },
      },
    ],
    status: "completed",
    createdAt: daysAgo(28),
    activityDate: daysAgo(21),
    travelers: [{ id: "tr_4", name: "Demo Customer", email: "customer@demo.com" }],
    total: { amount: 270, currency: "USD", display: "$270.00" },
    voucherCode: "TNV-9011-3322-104",
    qrToken: "TN-77LL2K:COMFORT:2",
    supplierId: "sup_5",
    supplierName: "Blue Lagoon Escapes",
  },
  {
    id: "bk_005",
    bookingRef: "TN-11BQ9X",
    items: [
      {
        listingId: "lst_009",
        listingSlug: "dubai-desert-safari",
        title: "Dubai Red Dune Desert Safari with BBQ",
        thumbnailKey: "dubai-desert",
        thumbnail: listingThumb("lst_009"),
        imageUrl: listingImage("lst_009")?.url,
        optionName: "Evening safari",
        date: daysAgo(5),
        quantity: 3,
        unitPrice: { amount: 55, currency: "USD", display: "$55.00" },
        total: { amount: 165, currency: "USD", display: "$165.00" },
      },
    ],
    status: "cancelled",
    createdAt: daysAgo(30),
    activityDate: daysAgo(5),
    travelers: [{ id: "tr_5", name: "Ayesha Rahman", email: "ayesha@example.com" }],
    total: { amount: 165, currency: "USD", display: "$165.00" },
    voucherCode: "",
    qrToken: "",
    supplierId: "sup_1",
    supplierName: "Summit Adventures Co.",
  },
];

/**
 * Bookings that arrive at the demo supplier (supplier@demo.com).
 * Mirrors the "Booking Inbox" of the Supplier Panel.
 */
export const MOCK_SUPPLIER_BOOKINGS: Booking[] = [
  {
    id: "sbk_001",
    bookingRef: "TN-0P3LMN",
    items: [
      {
        listingId: "lst_001",
        listingSlug: "interlaken-paragliding",
        title: "Interlaken Tandem Paragliding Flight",
        thumbnailKey: "paragliding",
        thumbnail: listingThumb("lst_001"),
        imageUrl: listingImage("lst_001")?.url,
        optionName: "Classic Flight",
        date: daysFromNow(1),
        quantity: 1,
        unitPrice: { amount: 189, currency: "USD", display: "$189.00" },
        total: { amount: 189, currency: "USD", display: "$189.00" },
      },
    ],
    status: "pending",
    createdAt: daysAgo(0),
    activityDate: daysFromNow(1),
    travelers: [{ id: "tr_10", name: "Priya S." }, { id: "tr_11", name: "Raj S." }],
    total: { amount: 189, currency: "USD", display: "$189.00" },
    voucherCode: "",
    qrToken: "",
    supplierId: "sup_1",
  },
  {
    id: "sbk_002",
    bookingRef: "TN-5RT2UV",
    items: [
      {
        listingId: "lst_001",
        listingSlug: "interlaken-paragliding",
        title: "Interlaken Tandem Paragliding Flight",
        thumbnailKey: "paragliding",
        thumbnail: listingThumb("lst_001"),
        imageUrl: listingImage("lst_001")?.url,
        optionName: "Flight + Photo & Video",
        date: daysFromNow(1),
        quantity: 2,
        unitPrice: { amount: 239, currency: "USD", display: "$239.00" },
        total: { amount: 478, currency: "USD", display: "$478.00" },
      },
    ],
    status: "confirmed",
    createdAt: daysAgo(1),
    activityDate: daysFromNow(1),
    travelers: [{ id: "tr_12", name: "Marco V." }, { id: "tr_13", name: "Giulia V." }],
    total: { amount: 478, currency: "USD", display: "$478.00" },
    voucherCode: "TNV-8831-2209-105",
    qrToken: "TN-5RT2UV:FOTO:2",
    supplierId: "sup_1",
  },
  {
    id: "sbk_003",
    bookingRef: "TN-9KE1QW",
    items: [
      {
        listingId: "lst_001",
        listingSlug: "interlaken-paragliding",
        title: "Interlaken Tandem Paragliding Flight",
        thumbnailKey: "paragliding",
        thumbnail: listingThumb("lst_001"),
        imageUrl: listingImage("lst_001")?.url,
        optionName: "Classic Flight",
        date: daysFromNow(2),
        quantity: 1,
        unitPrice: { amount: 189, currency: "USD", display: "$189.00" },
        total: { amount: 189, currency: "USD", display: "$189.00" },
      },
    ],
    status: "confirmed",
    createdAt: daysAgo(2),
    activityDate: daysFromNow(2),
    travelers: [{ id: "tr_14", name: "Elena K." }],
    total: { amount: 189, currency: "USD", display: "$189.00" },
    voucherCode: "TNV-7701-1188-106",
    qrToken: "TN-9KE1QW:CLASSIC:1",
    supplierId: "sup_1",
  },
  {
    id: "sbk_004",
    bookingRef: "TN-2WB8MK",
    items: [
      {
        listingId: "lst_001",
        listingSlug: "interlaken-paragliding",
        title: "Interlaken Tandem Paragliding Flight",
        thumbnailKey: "paragliding",
        thumbnail: listingThumb("lst_001"),
        imageUrl: listingImage("lst_001")?.url,
        optionName: "Classic Flight",
        date: daysAgo(6),
        quantity: 4,
        unitPrice: { amount: 189, currency: "USD", display: "$189.00" },
        total: { amount: 756, currency: "USD", display: "$756.00" },
      },
    ],
    status: "completed",
    createdAt: daysAgo(8),
    activityDate: daysAgo(6),
    travelers: [{ id: "tr_15", name: "Lena M." }, { id: "tr_16", name: "Friend" }],
    total: { amount: 756, currency: "USD", display: "$756.00" },
    voucherCode: "TNV-6621-0033-107",
    qrToken: "TN-2WB8MK:CLASSIC:4",
    supplierId: "sup_1",
  },
];
