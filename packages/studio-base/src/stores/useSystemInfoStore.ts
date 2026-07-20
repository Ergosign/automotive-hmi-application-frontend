// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { create } from "zustand";

export interface ISystemInfo {
  storage_space: string;
}

interface ISystemInfoStore {
  storageSpace: string;
  setSystemInfo: (systemInfo: ISystemInfo) => void;
}

/**
 * SystemInfoStore contains system information such as the available storage space.
 */
export const useSystemInfoStore = create<ISystemInfoStore>((set) => ({
  storageSpace: "",
  setSystemInfo: (systemInfo) => {
    set(() => {
      return {
        storageSpace: systemInfo.storage_space,
      };
    });
  },
}));
