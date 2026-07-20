// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

// src/store/counterStore.ts
import { create } from "zustand";

import { InterfaceMode } from "@foxglove/studio-base/panels/ThreeDeeRender/types";

interface IPanelActionsStore {
  currentPanelInterface: InterfaceMode;
  currentPanelActionComponent: JSX.Element | undefined;
  panelCanResetView: Record<string, boolean>;

  setCurrentPanelInterface: (panelInterfaceName: InterfaceMode) => void;
  setCurrentPanelActionComponent: (panelActionComponent: JSX.Element | undefined) => void;
  // eslint-disable-next-line @foxglove/no-boolean-parameters
  setCanResetView: (panelId: string, canReset: boolean) => void;
  getCanResetView: (panelId: string) => boolean;
}

/**
 * Zustand store that saves the current panel interface and
 * action components.
 */
export const usePanelActionsStore = create<IPanelActionsStore>((set, get) => ({
  currentPanelInterface: "3d", // Default Value
  currentPanelActionComponent: undefined,
  panelCanResetView: {},

  setCurrentPanelInterface: (panelInterfaceName: InterfaceMode) => {
    set(() => ({ currentPanelInterface: panelInterfaceName }));
  },
  setCurrentPanelActionComponent: (panelActionComponent: JSX.Element | undefined) => {
    set(() => ({ currentPanelActionComponent: panelActionComponent }));
  },
  setCanResetView: (panelId, canReset) => {
    set((state) => ({
      panelCanResetView: {
        ...state.panelCanResetView,
        [panelId]: canReset,
      },
    }));
  },
  getCanResetView: (panelId) => {
    return get().panelCanResetView[panelId] ?? false;
  },
}));
