// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
//
// This file incorporates work covered by the following copyright and
// permission notice:
//
//   Copyright 2018-2021 Cruise LLC
//
//   This source code is licensed under the Apache License, Version 2.0,
//   found at http://www.apache.org/licenses/LICENSE-2.0
//   You may not use this file except in compliance with the License.

import { useDataSourceInfo } from "@foxglove/studio-base/PanelAPI";
import usePublisher from "@foxglove/studio-base/hooks/usePublisher";

import { RecordingStore, useRecordingStore } from "../stores/useRecordingStore";

export const useRecording = (): RecordingStore => {
  const {
    startRecording: startRecordingStore,
    stopRecording: stopRecordingStore,
    ...restStore
  } = useRecordingStore();
  const { datatypes } = useDataSourceInfo();

  const publish = usePublisher({
    name: "Publish",
    topic: "/command_topic",
    schemaName: "std_msgs/msg/String",
    datatypes,
  });

  const startRecording = () => {
    startRecordingStore();
    publish({ data: "RECORD" });
  };

  const stopRecording = () => {
    stopRecordingStore();
    publish({ data: "STOP" });
  };

  return { ...restStore, startRecording, stopRecording };
};
