// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useCallback, useMemo } from "react";

import { useMessageReducer } from "@foxglove/studio-base/PanelAPI";

export interface SensorStatusEntry {
  state: string;
  reason: string;
}

export type SensorStatusReport = Record<string, SensorStatusEntry>;

// Move restore OUTSIDE the component so it's truly stable
const restore = (): SensorStatusReport => ({});

export function useSensorStatus(): SensorStatusReport {
  // Stabilize addMessage function
  const addMessage = useCallback((msgs: SensorStatusReport, msg: unknown) => {
    try {
      const messageContent = (msg as { message?: unknown }).message as { data?: unknown };
      const rawData = typeof messageContent.data === "string" ? messageContent.data : "";

      if (!rawData) {
        return msgs;
      }

      const parsed = JSON.parse(rawData) as SensorStatusReport;
      return parsed;
    } catch (e) {
      console.error("Failed to parse sensor status:", e);
      return msgs;
    }
  }, []);

  const statusMessages = useMessageReducer<SensorStatusReport>({
    topics: ["/sensor_status"],
    restore,
    addMessage,
  });

  return useMemo(() => statusMessages, [statusMessages]);
}
