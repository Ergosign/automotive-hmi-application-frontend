// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { create } from "zustand";

import { ChangePanelLayoutPayload } from "@foxglove/studio-base/context/CurrentLayoutContext/actions";

type ChangeViewType = ((payload: ChangePanelLayoutPayload) => void) | undefined;

interface NavigationStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;

  isLiveView: boolean;
  isRecordingsView: boolean;
  isSettingsView: boolean;

  isBackButtonClicked: boolean;
  backButtonClicked: () => void;
  resetBackButtonClicked: () => void;

  currentPanelTitle: string;
  setCurrentPanelTitle: (panelTitle: string) => void;

  changePanelLayout: ChangeViewType;
  setChangePanelLayout: (changeView: ChangeViewType) => void;

  localFileName: string | undefined;
  setLocalFileName: (name: string | undefined) => void;

  localFileSize: bigint | undefined;
  setLocalFileSize: (size: bigint | undefined) => void;
}

/**
 * Allows to control the Navigation with basic functions like open & close the navigation.
 */
export const useNavigationStore = create<NavigationStore>((set) => ({
  isOpen: false,
  open: () => {
    set(() => ({ isOpen: true }));
  },
  close: () => {
    set(() => ({ isOpen: false }));
  },

  isBackButtonClicked: false,
  backButtonClicked: () => {
    set(() => ({ isBackButtonClicked: true }));
  },
  resetBackButtonClicked: () => {
    set(() => ({ isBackButtonClicked: false }));
  },

  isLiveView: false,
  isRecordingsView: false,
  isSettingsView: false,

  currentPanelTitle: "",
  setCurrentPanelTitle: (panelTitle: string) => {
    set(() => ({
      currentPanelTitle: panelTitle,
      isLiveView: panelTitle !== "Recordings" && panelTitle !== "Settings",
      isRecordingsView: panelTitle === "Recordings",
      isSettingsView: panelTitle === "Settings",
    }));
  },

  changePanelLayout: undefined,
  setChangePanelLayout: (changePanelLayout: ChangeViewType) => {
    set(() => ({ changePanelLayout }));
  },

  localFileName: undefined,
  setLocalFileName: (localFileName: string | undefined) => {
    set(() => ({ localFileName }));
  },

  localFileSize: undefined,
  setLocalFileSize: (localFileSize: bigint | undefined) => {
    set(() => ({ localFileSize }));
  },
}));
