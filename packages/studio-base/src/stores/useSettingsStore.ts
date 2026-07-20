// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { create } from "zustand";

type Resolver = (() => void) | undefined;
export type SettingsStore = {
  isUnsaved: boolean;
  // eslint-disable-next-line @foxglove/no-boolean-parameters
  setIsUnsaved: (isUnsaved: boolean) => void;

  isUnsavedDialogOpen: boolean;
  // eslint-disable-next-line @foxglove/no-boolean-parameters
  setIsUnsavedDialogOpen: (isUnsavedDialogOpen: boolean) => void;

  unsavedResolver: Resolver;
  setUnsavedResolver: (unsavedResolver: Resolver) => void;

  toastMessage?: string;
  setToastMessage: (toastMessage?: string) => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  isUnsaved: false,
  setIsUnsaved: (isUnsaved) => {
    set(() => ({ isUnsaved }));
  },
  isUnsavedDialogOpen: false,
  setIsUnsavedDialogOpen: (isUnsavedDialogOpen) => {
    set(() => ({ isUnsavedDialogOpen }));
  },

  unsavedResolver: undefined,
  setUnsavedResolver: (unsavedResolver) => {
    set({ unsavedResolver });
  },

  toastMessage: undefined,
  setToastMessage: (toastMessage) => {
    set({ toastMessage });
  },
}));
