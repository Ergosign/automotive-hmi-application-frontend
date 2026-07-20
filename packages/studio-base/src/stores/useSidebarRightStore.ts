// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { create } from "zustand";

import { WorkspaceActions } from "@foxglove/studio-base/context/Workspace/useWorkspaceActions";

export interface SidebarRightStore {
  isSensorsListOpen: boolean;
  closeSensorsList: () => void;
  openSensorsList: () => void;
  toggleSensorsList: () => void;

  isFlagsListOpen: boolean;
  closeFlagsList: () => void;
  toggleFlagsList: () => void;

  closeSidebarRight: () => void;

  // Workspace actions will be injected
  workspaceActions?: WorkspaceActions["sidebarActions"]["right"];
  setSidebarWorkspaceActions: (actions: WorkspaceActions["sidebarActions"]["right"]) => void;
}

/**
 * Store that manages right sidebar state and integrates with workspace actions.
 */
export const useSidebarRightStore = create<SidebarRightStore>((set, get) => ({
  isSensorsListOpen: false,
  closeSensorsList: () => {
    set(() => ({ isSensorsListOpen: false }));
    const workspaceActions = get().workspaceActions;
    // If both lists are closed, close the entire sidebar
    const state = get();
    if (!state.isFlagsListOpen && !state.isSensorsListOpen) {
      workspaceActions?.setOpen(false);
    }
  },
  openSensorsList: () => {
    set(() => ({ isSensorsListOpen: true, isFlagsListOpen: false }));
    const workspaceActions = get().workspaceActions;
    workspaceActions?.setOpen(true);
    workspaceActions?.selectItem("studio-sensors");
  },
  toggleSensorsList: () => {
    const state = get();
    if (state.isSensorsListOpen) {
      state.closeSensorsList();
    } else {
      state.openSensorsList();
    }
  },

  isFlagsListOpen: false,
  closeFlagsList: () => {
    set(() => ({ isFlagsListOpen: false }));
    const workspaceActions = get().workspaceActions;
    // If both lists are closed, close the entire sidebar
    const state = get();
    if (!state.isFlagsListOpen && !state.isSensorsListOpen) {
      workspaceActions?.setOpen(false);
    }
  },
  toggleFlagsList: () => {
    const state = get();
    if (state.isFlagsListOpen) {
      state.closeFlagsList();
    } else {
      // Open flags list and close sensors list
      set(() => ({ isFlagsListOpen: true, isSensorsListOpen: false }));
      const workspaceActions = get().workspaceActions;
      workspaceActions?.setOpen(true);
      workspaceActions?.selectItem("studio-flags");
    }
  },

  closeSidebarRight: () => {
    set(() => ({ isSensorsListOpen: false, isFlagsListOpen: false }));
    const workspaceActions = get().workspaceActions;
    workspaceActions?.setOpen(false);
  },

  workspaceActions: undefined,
  setSidebarWorkspaceActions: (actions: WorkspaceActions["sidebarActions"]["right"]) => {
    set(() => ({ workspaceActions: actions }));
  },
}));
