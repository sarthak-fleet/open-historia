import { beforeEach, describe, expect, it } from "vitest";

import { localListSavedGames, restoreSavedGameState } from "../game-storage";
import type { GameConfig, Province } from "../types";

const STORAGE_KEY = "open_historia_saves";

function installLocalStorageMock() {
  const store = new Map<string, string>();
  const localStorageMock = {
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
  };

  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    configurable: true,
    writable: true,
  });

  return localStorageMock;
}

function makeGameConfig(): GameConfig {
  return {
    year: 1492,
    scenario: "Test scenario",
    playerNationId: "1",
    apiKey: "",
    provider: "local",
    model: "claude",
    difficulty: "Realistic",
  };
}

describe("game-storage migrations", () => {
  beforeEach(() => {
    const localStorageMock = installLocalStorageMock();
    localStorageMock.clear();
  });

  it("migrates legacy saves to the current version", () => {
    globalThis.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: "legacy-save",
          timestamp: 1,
          version: "2.0.0",
          gameState: {
            turn: 1492,
            players: {},
            selectedProvinceId: null,
            theme: "classic",
            provinceOwners: [],
          },
          gameConfig: makeGameConfig(),
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

describe("restoreSavedGameState", () => {
  it("restores province ownership without mutating the base province list", () => {
    const baseProvinces: Province[] = [
      {
        id: 1,
        name: "Alpha",
        ownerId: "ai_red",
        color: "#f00",
        feature: null,
        center: [0, 0],
        neighbors: [],
        resources: {
          population: 1,
          defense: 1,
          economy: 1,
          technology: 1,
        },
      },
      {
        id: 2,
        name: "Beta",
        ownerId: "ai_green",
        color: "#0f0",
        feature: null,
        center: [1, 1],
        neighbors: [],
        resources: {
          population: 1,
          defense: 1,
          economy: 1,
          technology: 1,
        },
      },
    ];

    const saved = {
      id: "save-1",
      timestamp: 1,
      version: "3.1.0",
      gameState: {
        turn: 1492,
        players: { player: { id: "player", name: "Player", color: "#fff" } },
        selectedProvinceId: null,
        theme: "classic",
        provinceOwners: [{ id: "1", ownerId: "player" }],
      },
      gameConfig: makeGameConfig(),
      logs: [],
      events: [],
    };

    const restored = restoreSavedGameState(saved as never, baseProvinces);

    expect(restored.provinces[0].ownerId).toBe("player");
    expect(restored.provinces[1].ownerId).toBe("ai_green");
    expect(baseProvinces[0].ownerId).toBe("ai_red");
  });
});
