import { afterEach, describe, expect, it, vi } from "vitest";
import { PhotoError, preparePhoto } from "./image";

function makeFile(name: string, type: string, bytes: number) {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: bytes });
  return file;
}

function stubCanvas(toBlobResult: Blob | null) {
  const drawImage = vi.fn();
  const created: { width?: number; height?: number } = {};
  vi.spyOn(document, "createElement").mockImplementation(() => {
    const canvas = {
      set width(v: number) {
        created.width = v;
      },
      get width() {
        return created.width ?? 0;
      },
      set height(v: number) {
        created.height = v;
      },
      get height() {
        return created.height ?? 0;
      },
      getContext: () => ({ drawImage }),
      toBlob: (cb: (b: Blob | null) => void) => cb(toBlobResult),
    };
    return canvas as unknown as HTMLElement;
  });
  return { drawImage, created };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("preparePhoto", () => {
  it("rejects non-image files", async () => {
    await expect(
      preparePhoto(makeFile("resume.pdf", "application/pdf", 1000)),
    ).rejects.toThrow(PhotoError);
  });

  it("rejects files over 25 MB", async () => {
    await expect(
      preparePhoto(makeFile("huge.jpg", "image/jpeg", 26 * 1024 * 1024)),
    ).rejects.toThrow(/too large/i);
  });

  it("explains undecodable formats like HEIC", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => {
        throw new Error("decode failed");
      }),
    );
    await expect(
      preparePhoto(makeFile("photo.heic", "image/heic", 1000)),
    ).rejects.toThrow(/couldn't read that photo format/i);
  });

  it("downscales large photos to max 2000px JPEG", async () => {
    const close = vi.fn();
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({ width: 4000, height: 3000, close })),
    );
    const { created } = stubCanvas(new Blob(["jpeg"], { type: "image/jpeg" }));

    const out = await preparePhoto(makeFile("big.png", "image/png", 1000));

    expect(created).toEqual({ width: 2000, height: 1500 });
    expect(out.type).toBe("image/jpeg");
    expect(out.name).toBe("photo.jpg");
    expect(close).toHaveBeenCalled();
  });

  it("keeps small photos at their original size", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({ width: 800, height: 1000, close: vi.fn() })),
    );
    const { created } = stubCanvas(new Blob(["jpeg"], { type: "image/jpeg" }));

    await preparePhoto(makeFile("small.jpg", "image/jpeg", 1000));

    expect(created).toEqual({ width: 800, height: 1000 });
  });
});
