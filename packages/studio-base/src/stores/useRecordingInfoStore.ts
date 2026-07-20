// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

// src/store/counterStore.ts
import { create } from "zustand";

export type RecordingInfo = {
  id: string;
  file_name: string;
  duration: number;
  size: bigint;
  recording: boolean;
};

export type RecordingInfoStore = {
  recordingInfo: RecordingInfo;
  setRecordingInfo: (recordingInfo: RecordingInfo) => void;
  resetRecordingInfo: () => void;
};

export const DEFAULT_RECORDING_INFO: RecordingInfo = {
  id: "",
  file_name: "",
  duration: 0,
  size: 0n,
  recording: false,
};

/**
 * RecordingInfoStore contains information about the currently ongoing recording.
 * Be careful where to use this component because it rerenders often times while recording.
 */
export const useRecordingInfoStore = create<RecordingInfoStore>((set) => ({
  recordingInfo: DEFAULT_RECORDING_INFO,

  setRecordingInfo: (recordingInfo) => {
    set(() => ({ recordingInfo }));
  },

  resetRecordingInfo: () => {
    set(() => ({ recordingInfo: DEFAULT_RECORDING_INFO }));
  },
}));
