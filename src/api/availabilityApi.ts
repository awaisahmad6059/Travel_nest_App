import { USE_MOCKS_AVAILABILITY } from "@/config";
import { isPastDate } from "@/utils/dateUtils";
import { request, mockDelay } from "./client";
import {
  Hold,
  HoldRequest,
  HoldResponse,
  Slot,
  SlotDTO,
  slotDtoToSlot,
} from "./contracts";

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// TEMP: remove once the backend seed data has future-dated slots. The deployed
// seed only contains past dates (e.g. 2026-08-05/06), so this generates demo
// slots across the rolling 7-day window to keep the demo fully bookable.
function demoSlotsFor(listingId: string): Slot[] {
  const seed = hashCode(listingId);
  const patterns = [
    [
      [9, 0],
      [13, 0],
      [17, 0],
    ],
    [[9, 0]],
    [
      [10, 0],
      [16, 0],
    ],
  ];
  const times = patterns[seed % 3];
  const slots: Slot[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + i);
    times.forEach(([h, m], ti) => {
      const start = new Date(day);
      start.setHours(h, m, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + 2);
      const key = seed + i * 3 + ti;
      const remaining = (key * 13 + seed) % 20;
      slots.push({
        id: `demo-${listingId}-${i}-${ti}`,
        listingId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        totalCapacity: 20,
        bookedCapacity: Math.max(0, 20 - remaining),
        heldCapacity: 0,
        remaining,
      });
    });
  }
  return slots;
}

/**
 * Availability & inventory hold service (API_HANDOFF.md §4.2).
 *
 * The hold step must NOT be skipped during checkout — inventory locking
 * depends on it (same as the website). Holds expire after ~900s (15 min).
 */
export const availabilityApi = {
  async getSlots(listingId: string): Promise<Slot[]> {
    if (USE_MOCKS_AVAILABILITY) {
      return mockDelay([], 250);
    }
    const dtos = await request<SlotDTO[]>(
      `/availability/slots/${encodeURIComponent(listingId)}`,
    );
    const real = dtos.map(slotDtoToSlot);
    const hasBookable = real.some((s) => !isPastDate(s.startTime));
    if (hasBookable) return real;
    // TEMP: see demoSlotsFor — backend seed has no future-dated slots yet.
    return mockDelay(demoSlotsFor(listingId), 250);
  },

  async hold(req: HoldRequest): Promise<Hold> {
    if (USE_MOCKS_AVAILABILITY) {
      return mockDelay(
        {
          holdId: `hold_mock_${Date.now()}`,
          expiresAt: Date.now() + 900_000,
        },
        400,
      );
    }
    // TEMP: "demo-" slots are generated client-side (see demoSlotsFor) and
    // don't exist on the backend, so their holds are faked too.
    if (req.slot_id.startsWith("demo-")) {
      return mockDelay(
        {
          holdId: `hold_demo_${Date.now()}`,
          expiresAt: Date.now() + 900_000,
        },
        400,
      );
    }
    const dto = await request<HoldResponse>("/availability/hold", {
      method: "POST",
      body: JSON.stringify(req),
    });
    return { holdId: dto.hold_id, expiresAt: dto.expires_at };
  },
};
