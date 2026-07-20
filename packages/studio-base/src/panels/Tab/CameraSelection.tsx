// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { SelectChangeEvent } from "@mui/material";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { ListItemIcon } from "@foxglove/studio-base/components/ListItemIcon";
import { MenuItem } from "@foxglove/studio-base/components/MenuItem";
import { PanelContextType } from "@foxglove/studio-base/components/PanelContext";
import { Select } from "@foxglove/studio-base/components/Select";
import { usePanelStateStore } from "@foxglove/studio-base/context/PanelStateContext";
import { useCameraStore } from "@foxglove/studio-base/stores/useCameraStore";
import { PanelConfig } from "@foxglove/studio-base/types/panels";

export type CameraSelectionProps = {
  panelContext: PanelContextType<PanelConfig>;
};

export const CameraSelection: React.FC<CameraSelectionProps> = ({ panelContext }) => {
  const { t } = useTranslation("panels");
  const { cameraSetups, selectedCameraSetups, setSelectedCameraSetups } = useCameraStore();

  const panelId = panelContext.id;
  const selectedCameraSetup = selectedCameraSetups[panelId];

  const actionHandler = usePanelStateStore((state) => {
    return state.settingsTrees[panelId]?.actionHandler;
  });

  useEffect(() => {
    if (!actionHandler) {
      return;
    }

    setSelectedCameraSetups(panelId, selectedCameraSetup, actionHandler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionHandler]);

  const handleChange = useCallback(
    (event: SelectChangeEvent<unknown>) => {
      if (!actionHandler) {
        return;
      }

      const selectedId = event.target.value as string;
      const selectedSetup = cameraSetups.find((cameraSetup) => cameraSetup.id === selectedId);

      setSelectedCameraSetups(panelId, selectedSetup, actionHandler);
    },
    [actionHandler, cameraSetups, panelId, setSelectedCameraSetups],
  );

  return (
    <Select
      value={selectedCameraSetup?.id ?? ""}
      renderValue={() => {
        return selectedCameraSetup?.displayName ?? t("noSetup");
      }}
      onChange={handleChange}
      displayEmpty
      transparent
    >
      <MenuItem value="">
        <ListItemIcon selected={selectedCameraSetup == undefined} />
        {t("noSetup")}
      </MenuItem>
      {cameraSetups.map((cameraSetup) => (
        <MenuItem key={cameraSetup.id} value={cameraSetup.id}>
          <ListItemIcon selected={selectedCameraSetup?.id === cameraSetup.id} />
          {cameraSetup.displayName}
        </MenuItem>
      ))}
    </Select>
  );
};
