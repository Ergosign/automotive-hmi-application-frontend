// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { LayoutData } from "@foxglove/studio-base/context/CurrentLayoutContext/actions";
import { initLayoutData } from "@foxglove/studio-base/providers/CurrentLayoutProvider/defaultLayout";

export type LayoutStore = {
  layoutData: LayoutData;
  setLayoutData: (layoutData: LayoutData) => void;
};

export const useLayoutDataStore = create<LayoutStore>()(
  persist(
    (set) => ({
      layoutData: initLayoutData,
      setLayoutData: (layoutData) => {
        set(() => ({ layoutData }));
      },
    }),
    {
      name: "layout-data-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
