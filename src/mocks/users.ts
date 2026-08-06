import type { User } from "@/types";

/**
 * Demo accounts for mock authentication.
 * - customer@demo.com  -> Customer Panel
 * - supplier@demo.com  -> Supplier Panel
 * Any password works in the demo.
 */

export const DEMO_ACCOUNTS: User[] = [
  {
    id: "u_customer_1",
    name: "Demo Customer",
    email: "customer@demo.com",
    phone: "+1 555 010 2233",
    role: "customer",
    avatarEmoji: "🧳",
  },
  {
    id: "u_supplier_1",
    name: "Summit Adventures Co.",
    email: "supplier@demo.com",
    phone: "+1 555 010 8899",
    role: "supplier",
    avatarEmoji: "🏔️",
  },
  {
    id: "u_customer_2",
    name: "Ayesha Rahman",
    email: "ayesha@example.com",
    role: "customer",
    avatarEmoji: "🌟",
  },
];
