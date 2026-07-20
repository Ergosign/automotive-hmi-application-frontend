// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

// src/store/counterStore.ts
import { create } from "zustand";

import { EditFlagRequest } from "@foxglove/studio-base/components/FlagsListItem/FlagsListItem";

export type Flag = {
  id: string;
  title: string;
  timestamp: number;
  tags: Tag[];
  note?: string;
};

export type Tag = {
  id: string;
  label: string;
  backgroundColor: string;
  foregroundColor: string;
};

export type FlagStore = {
  sortedFlags: Flag[];
  setSortedFlags: (flags: Flag[]) => void;

  selectedFlagId: Flag["id"];
  setSelectedFlagId: (selectedFlagId: Flag["id"]) => void;

  tags: Tag[];
  setTags: (tags: Tag[]) => void;

  isUnsaved: boolean;
  // eslint-disable-next-line @foxglove/no-boolean-parameters
  setIsUnsaved: (isUnsaved: boolean) => void;

  editFlagPayload: EditFlagRequest | undefined;
  setEditFlagPayload: (editFlagPayload: EditFlagRequest | undefined) => void;
};

export const useFlagStore = create<FlagStore>((set) => ({
  sortedFlags: [],
  setSortedFlags: (flags) => {
    set(() => ({ sortedFlags: flags }));
  },

  selectedFlagId: "",
  setSelectedFlagId: (selectedFlagId) => {
    set(() => ({ selectedFlagId }));
  },

  tags: [],
  setTags: (tags) => {
    set(() => ({ tags }));
  },

  isUnsaved: false,
  setIsUnsaved: (isUnsaved) => {
    set(() => ({ isUnsaved }));
  },

  editFlagPayload: undefined,
  setEditFlagPayload: (editFlagPayload) => {
    set(() => ({ editFlagPayload }));
  },
}));
