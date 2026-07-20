// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

// src/store/counterStore.ts
import { create } from "zustand";

import { DataSourceArgs } from "@foxglove/studio-base/context/PlayerSelectionContext";

interface MemoryStore {
  selectSource: undefined | ((source: string, args?: DataSourceArgs | undefined) => void);
  setSelectSource: (callback: (source: string, args?: DataSourceArgs | undefined) => void) => void;
  threeDeeCanvas: HTMLCanvasElement | undefined;
  setThreeDeeCanvas: (canvas: HTMLCanvasElement | undefined) => void;
  blob: Blob | undefined;
  setBlob: (blob: Blob) => void;
}

/**
 * Storing functions in memory to be able to use it in all parts of the application.
 */
export const useMemoryStore = create<MemoryStore>((set) => ({
  selectSource: undefined,
  setSelectSource: (callback: (source: string, args?: DataSourceArgs | undefined) => void) => {
    set(() => ({ selectSource: callback }));
  },
  threeDeeCanvas: undefined,
  setThreeDeeCanvas: (threeDeeCanvas: HTMLCanvasElement | undefined) => {
    set(() => ({ threeDeeCanvas }));
  },
  blob: undefined,
  setBlob: (blob: Blob) => {
    set(() => ({ blob }));
  },
}));
