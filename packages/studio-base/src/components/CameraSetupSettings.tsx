// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import AddIcon from "@mui/icons-material/Add";
import React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "tss-react/mui";

import { Button } from "@foxglove/studio-base/components/Button";
import { CameraSetupItem } from "@foxglove/studio-base/components/CameraSetupItem";
import {
  BaseCameraSetups,
  CalibrationTopic,
  CameraSetupBase,
  ImageTopic,
} from "@foxglove/studio-base/stores/useCameraStore";
import { serif_14px_500, serif_16px_500 } from "@foxglove/studio-base/util/sharedStyleConstants";

const useStyles = makeStyles()((theme) => ({
  settingColumn: {
    display: "grid",
    gridTemplateRows: "auto auto auto 1fr",
    height: "100%",
    minHeight: 0,
    gap: theme.spacing(3),
    paddingInline: theme.spacing(3),
  },
  headline: {
    ...serif_16px_500,
    color: theme.palette.greys.white,
    margin: 0,
    textTransform: "uppercase",
  },
  description: {
    ...serif_14px_500,
    margin: 0,
  },
  addButton: {
    marginLeft: theme.spacing(4),
    width: theme.spacing(36.25),
  },
  cameraSetups: {
    display: "grid",
    gridAutoRows: "min-content",
    gap: theme.spacing(1),
    overflow: "auto",
  },
}));

export type CameraSetupSettingsProps = {
  cameraSetups: BaseCameraSetups;
  imageTopics: ImageTopic[];
  calibrationTopics: CalibrationTopic[];
  onAdd: () => void;
  onUpdate: (index: number, updatedSetup: CameraSetupBase) => void;
  onDelete: (index: number) => void;
};

export const CameraSetupSettings: React.FC<CameraSetupSettingsProps> = ({
  cameraSetups,
  imageTopics,
  calibrationTopics,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const { classes } = useStyles();
  const { t } = useTranslation("settings");

  return (
    <div className={classes.settingColumn}>
      <h2 className={classes.headline}>{t("cameraSetup")}</h2>
      <p className={classes.description}>{t("cameraSetupDescription")}</p>

      <Button className={classes.addButton} startIcon={<AddIcon />} onClick={onAdd}>
        {t("addCameraSetup")}
      </Button>

      <div className={classes.cameraSetups}>
        {cameraSetups.map((cameraSetup, index) => (
          <CameraSetupItem
            key={index}
            displayName={cameraSetup.displayName}
            imageTopicItems={imageTopics}
            imageTopic={cameraSetup.imageTopic}
            calibrationTopicItems={calibrationTopics}
            calibrationTopic={cameraSetup.calibrationTopic ?? ""}
            onUpdate={(updatedSetup) => {
              onUpdate(index, updatedSetup);
            }}
            onDelete={() => {
              onDelete(index);
            }}
          />
        ))}
      </div>
    </div>
  );
};
