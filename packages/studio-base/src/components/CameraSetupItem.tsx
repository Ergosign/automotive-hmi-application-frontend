// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
import { SelectChangeEvent } from "@mui/material";
import { useTranslation } from "react-i18next";

import { AccordionItem } from "@foxglove/studio-base/components/AccordionItem";
import { ListItemIcon } from "@foxglove/studio-base/components/ListItemIcon";
import { MenuItem } from "@foxglove/studio-base/components/MenuItem";
import { Select } from "@foxglove/studio-base/components/Select";
import { TextField } from "@foxglove/studio-base/components/Textfield";
import {
  CalibrationTopic,
  CameraSetupBase,
  ImageTopic,
} from "@foxglove/studio-base/stores/useCameraStore";

export type CameraSetupItemProps = CameraSetupBase & {
  imageTopicItems: ImageTopic[];
  calibrationTopicItems: CalibrationTopic[];
  calibrationTopic: string;
  onDelete: () => void;
  onUpdate: (updatedSetup: CameraSetupBase) => void;
};

export const CameraSetupItem: React.FC<CameraSetupItemProps> = ({
  displayName,
  imageTopicItems,
  imageTopic,
  calibrationTopicItems,
  calibrationTopic,
  onDelete,
  onUpdate,
}) => {
  const { t } = useTranslation("settings");

  const emptyStringToNull = (string: string) => {
    // eslint-disable-next-line no-restricted-syntax
    return string === "" ? null : string;
  };

  const handleDisplayNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayName = event.target.value;

    onUpdate({
      displayName: newDisplayName,
      imageTopic,
      calibrationTopic: emptyStringToNull(calibrationTopic),
    });
  };

  const handleImageTopicChange = (event: SelectChangeEvent<unknown>) => {
    const newImageTopic = event.target.value as string;

    onUpdate({
      displayName,
      imageTopic: newImageTopic,
      calibrationTopic: emptyStringToNull(calibrationTopic),
    });
  };

  const handleCalibrationTopicChange = (event: SelectChangeEvent<unknown>) => {
    const newCalibrationTopic = event.target.value as string;

    onUpdate({
      displayName,
      imageTopic,
      calibrationTopic: emptyStringToNull(newCalibrationTopic),
    });
  };

  return (
    <AccordionItem
      accordionSummary={displayName ? displayName : t("defaultDisplayName")}
      onDelete={onDelete}
    >
      <TextField
        label={t("displayNameLabel")}
        value={displayName}
        onChange={handleDisplayNameChange}
        placeholder={t("defaultDisplayName")}
        fullWidth
      />

      <Select
        label={t("imageTopicLabel")}
        value={imageTopic}
        renderValue={(selectedValue) => selectedValue}
        onChange={handleImageTopicChange}
        fullWidth
      >
        {imageTopicItems.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            <ListItemIcon selected={imageTopic === item.value} />
            {item.value}
          </MenuItem>
        ))}
      </Select>

      <Select
        label={t("calibrationTopicLabel")}
        value={calibrationTopic}
        renderValue={(selectedValue) =>
          typeof selectedValue === "string" && selectedValue.length > 0
            ? selectedValue
            : t("noCalibrationTopic")
        }
        onChange={handleCalibrationTopicChange}
        displayEmpty
        fullWidth
      >
        <MenuItem value="">
          <ListItemIcon selected={calibrationTopic === ""} />
          {t("noCalibrationTopic")}
        </MenuItem>
        {calibrationTopicItems.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            <ListItemIcon selected={calibrationTopic === item.value} />
            {item.value}
          </MenuItem>
        ))}
      </Select>
    </AccordionItem>
  );
};
