// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Checkbox, Typography } from "@mui/material";
import { useRef } from "react";

import Stack from "@foxglove/studio-base/components/Stack";

// TODO: Implement right ObjectsList.
export default function ObjectsList(): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(ReactNull);

  return (
    <Stack padding={2} ref={rootRef}>
      <Typography variant="body2">
        Select which object classes should be visualized in the current panel(s).
      </Typography>

      <div style={{ paddingTop: "1rem" }}>
        <Typography>VRU</Typography>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
          <Checkbox />
          <Typography variant="body2" paddingTop="0.7rem" display="inline">
            Pedestrians
          </Typography>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
          <Checkbox />
          <Typography variant="body2" paddingTop="0.7rem" display="inline">
            Cyclist
          </Typography>
        </div>
      </div>

      <div style={{ paddingTop: "1rem" }}>
        <Typography>VEHICLES</Typography>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
          <Checkbox />
          <Typography variant="body2" paddingTop="0.7rem" display="inline">
            Cars
          </Typography>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
          <Checkbox />
          <Typography variant="body2" paddingTop="0.7rem" display="inline">
            Trucks
          </Typography>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
          <Checkbox />
          <Typography variant="body2" paddingTop="0.7rem" display="inline">
            Scooters
          </Typography>
        </div>
      </div>

      <div style={{ paddingTop: "1rem" }}>
        <Typography>INFRASTRUCTURE</Typography>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
          <Checkbox />
          <Typography variant="body2" paddingTop="0.7rem" display="inline">
            Traffic Signs
          </Typography>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
          <Checkbox />
          <Typography variant="body2" paddingTop="0.7rem" display="inline">
            Traffic Lights
          </Typography>
        </div>
      </div>
    </Stack>
  );
}
