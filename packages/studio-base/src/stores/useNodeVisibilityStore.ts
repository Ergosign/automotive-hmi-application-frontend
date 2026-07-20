// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

// import { create } from "zustand";

// interface IVisibilityStore {
//   visibleNodes: string[];
//   addNode: (panelTitle: string) => void;
//   removeNode: (panelTitle: string) => void;
//   reset: () => void;
// }

/**
 * Storing visible or not visible topics. This store is useful to save the threeDee Topics when switching between
 * panels but keeping the correct checked topics for better UX.
 */
// export const useNodeVisibilityStore = create<IVisibilityStore>((set) => ({
//   visibleNodes: [],
//   addNode: (panelTitle: string) => {
//     set((state) => {
//       if (state.visibleNodes.includes(panelTitle)) {
//         return {};
//       }

//       return {
//         visibleNodes: [...state.visibleNodes, panelTitle],
//       };
//     });
//   },
//   removeNode: (panelTitle: string) => {
//     set((state) => {
//       const filteredNodes = state.visibleNodes.filter((node) => node !== panelTitle);
//       return {
//         visibleNodes: [...filteredNodes],
//       };
//     });
//   },
//   reset: () => {
//     set(() => ({ visibleNodes: [] }));
//   },
// }));
