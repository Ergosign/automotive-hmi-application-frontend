// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { create } from "zustand";

import { PartialPanelExtensionContext } from "@foxglove/studio-base/components/PanelExtensionAdapter/PanelExtensionAdapter";

export interface ContextStore {
  partialExtensionContext?: PartialPanelExtensionContext;
  setPartialExtensionContext: (partialContext: PartialPanelExtensionContext) => void;
}

/**
 * SystemInfoStore contains system information such as the available storage space.
 */
export const useContextStore = create<ContextStore>((set) => ({
  partialExtensionContext: undefined,
  setPartialExtensionContext: (context) => {
    set(() => ({ partialExtensionContext: context }));
  },
}));
