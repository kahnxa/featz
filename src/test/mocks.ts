import { vi } from "vitest";

export type SupabaseMockState = {
  existingSlugs: Set<string>;
  profileUpdates: Array<Record<string, unknown>>;
  eventInserts: Array<Record<string, unknown>>;
  eventUpdates: Array<{ id: string; payload: Record<string, unknown> }>;
  deletedEventIds: string[];
  uploads: Array<{ path: string }>;
  updateError: { message: string } | null;
  insertError: { message: string } | null;
  uploadError: { message: string } | null;
};

export function createSupabaseMock() {
  const state: SupabaseMockState = {
    existingSlugs: new Set(),
    profileUpdates: [],
    eventInserts: [],
    eventUpdates: [],
    deletedEventIds: [],
    uploads: [],
    updateError: null,
    insertError: null,
    uploadError: null,
  };

  const client = {
    from(table: string) {
      return {
        select: () => ({
          eq: (_col: string, value: string) => ({
            maybeSingle: async () => ({
              data: state.existingSlugs.has(value) ? { id: `owner-of-${value}` } : null,
            }),
          }),
        }),
        update: (payload: Record<string, unknown>) => ({
          eq: async (_col: string, id: string) => {
            if (!state.updateError) {
              if (table === "events") {
                state.eventUpdates.push({ id, payload });
              } else {
                state.profileUpdates.push(payload);
              }
            }
            return { error: state.updateError };
          },
        }),
        insert: async (payload: Record<string, unknown>) => {
          if (table === "events" && !state.insertError) {
            state.eventInserts.push(payload);
          }
          return { error: state.insertError };
        },
        delete: () => ({
          eq: async (_col: string, id: string) => {
            state.deletedEventIds.push(id);
            return { error: null };
          },
        }),
      };
    },
    storage: {
      from: () => ({
        upload: async (path: string) => {
          if (!state.uploadError) state.uploads.push({ path });
          return { error: state.uploadError };
        },
      }),
    },
    auth: {
      /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
      signUp: vi.fn(async (...args: any[]) => ({
        data: {
          user: { identities: [{}] } as any,
          session: { access_token: "t" } as any,
        },
        error: null as any,
      })),
      signInWithPassword: vi.fn(async (...args: any[]) => ({
        error: null as any,
      })),
      /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
    },
  };

  return { client, state };
}

export const routerMock = {
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(),
};
