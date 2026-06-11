import { beforeEach, describe, expect, it } from "vitest";

import { localListSavedGames } from "../game-storage";

const STORAGE_KEY = "open_historia_saves";

function installLocalStorageMock() {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem(key: string) {
        return store.has(key) ? store.get(key)! : null;
      },
      setItem(key: string, value: string) {
        store.set(key, String(value));
      },
      removeItem(key: string) {
        store.delete(key);
      },
      clear() {
        store.clear();
      },
    },
    configurable: true,
    writable: true,
  });
}

describe("save migration chain", () => {
  beforeEach(() => {
    installLocalStorageMock();
    globalThis.localStorage.clear();
  });

  it("upgrades legacy saves to the current version", () => {
    globalThis.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: "legacy",
          timestamp: 1,
          version: "2.0.0",
          gameState: {
            turn: 100,
            players: {},
            selectedProvinceId: null,
            theme: "classic",
            provinceOwners: [],
          },
          gameConfig: {
            year: 100,
            scenario: "Legacy",
            playerNationId: "x",
            apiKey: "",
            provider: "local",
            model: "claude",
            difficulty: "Realistic",
          },
          logs: [],
          events: [],
        },
      ]),
    );

    const saves = localListSavedGames();
    expect(saves).toHaveLength(1);
    expect(saves[0].version).toBe("3.1.0");
  });
});
