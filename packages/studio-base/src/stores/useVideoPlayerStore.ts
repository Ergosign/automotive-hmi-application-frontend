// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { create } from "zustand";

interface VideoPlayerStore {
  isPlaying: boolean;
  pause: () => void;
  play: () => void;
}

/**
 * Allows to control the video player with basic functions like play & pause the video player.
 */
export const useVideoPlayerStore = create<VideoPlayerStore>((set) => ({
  isPlaying: false,
  play: () => {
    set(() => ({ isPlaying: true }));
  },
  pause: () => {
    set(() => ({ isPlaying: false }));
  },
}));
