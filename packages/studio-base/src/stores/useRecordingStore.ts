// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

// src/store/counterStore.ts
import { create } from "zustand";

export interface RecordingStore {
  isRecording: boolean;
  isRecordingToolbarOpen: boolean;
  startedLastRecording: string;
  stoppedLastRecording: string;
  openRecordingToolbar: () => void;
  closeRecordingToolbar: () => void;
  toggleRecordingToolbar: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  setRecordingState: ({ state }: { state: boolean }) => void;
}

/**
 * Recording Store allows UI changes to display or hide recording controls. Please do not use this store by Itself.
 * useRecording uses useRecordingStore to properly start and stop recordings.
 */
export const useRecordingStore = create<RecordingStore>((set) => ({
  isRecording: false,
  isRecordingToolbarOpen: false,
  startedLastRecording: "",
  stoppedLastRecording: "",
  openRecordingToolbar: () => {
    set(() => ({ isRecordingToolbarOpen: true }));
  },
  closeRecordingToolbar: () => {
    set(() => ({ isRecordingToolbarOpen: false }));
  },
  toggleRecordingToolbar: () => {
    set((state) => ({ isRecordingToolbarOpen: !state.isRecordingToolbarOpen }));
  },
  startRecording: () => {
    set(() => ({ isRecording: true, startedLastRecording: new Date().toISOString() }));
  },
  stopRecording: () => {
    set(() => ({
      isRecording: false,
      stoppedLastRecording: new Date().toISOString(),
      startedLastRecording: "",
    }));
  },
  setRecordingState: ({ state }: { state: boolean }) => {
    set(() => ({ isRecording: state }));
  },
}));
