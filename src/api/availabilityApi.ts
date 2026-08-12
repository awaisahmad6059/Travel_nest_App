import { USE_MOCKS_AVAILABILITY } from "@/config";
import { request, mockDelay } from "./client";
import {
  Hold,
  HoldRequest,
  HoldResponse,
  Slot,
  SlotDTO,
  slotDtoToSlot,
} from "./contracts";

/**
 * Availability & inventory hold service (API_HANDOFF.md §4.2).
 *
 * Only real backend slots are returned — no demo/placeholder dates. The hold
 * step must NOT be skipped during checkout — inventory locking depends on it
 * (same as the website). Holds expire after ~900s (15 min).
 */
export const availabilityApi = {
  async getSlots(listingId: string): Promise<Slot[]> {
    if (USE_MOCKS_AVAILABILITY) {
      return mockDelay([], 250);
    }
    const dtos = await request<SlotDTO[]>(
      `/availability/slots/${encodeURIComponent(listingId)}`,
    );
    return dtos.map(slotDtoToSlot);
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
    const dto = await request<HoldResponse>("/availability/hold", {
      method: "POST",
      body: JSON.stringify(req),
    });
    return { holdId: dto.hold_id, expiresAt: dto.expires_at };
  },
};
