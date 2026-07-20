// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import * as _ from "lodash-es";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { makeStyles } from "tss-react/mui";

import { ActionFooter } from "@foxglove/studio-base/components/ActionFooter";
import { Button } from "@foxglove/studio-base/components/Button";
import { CameraSetupSettings } from "@foxglove/studio-base/components/CameraSetupSettings";
import { Dialog } from "@foxglove/studio-base/components/Dialog";
import { useLazyApi } from "@foxglove/studio-base/hooks/useLazyApi";
import {
  CameraSetupBase,
  CameraSetups,
  useCameraStore,
} from "@foxglove/studio-base/stores/useCameraStore";
import { useSettingsStore } from "@foxglove/studio-base/stores/useSettingsStore";

const useStyles = makeStyles()((theme) => ({
  root: {
    display: "grid",
    alignItems: "start",
    gridTemplateColumns: "1fr 1fr 1fr",
    paddingTop: theme.spacing(3.5),
    paddingInline: theme.spacing(1.5),
    paddingBottom: theme.spacing(12),
    height: "100%",
  },
}));

export type SaveCameraSetupsRequest = {
  cameraSetups: CameraSetupBase[];
};

export function Settings(): JSX.Element {
  const { classes } = useStyles();
  const { t } = useTranslation("settings");

  const {
    setIsUnsaved,
    isUnsavedDialogOpen,
    unsavedResolver,
    setUnsavedResolver,
    setToastMessage,
  } = useSettingsStore();

  const {
    cameraSetups: storedCameraSetups,
    setCameraSetups: setStoredCameraSetups,
    selectedCameraSetups,
    setSelectedCameraSetups,
    imageTopics,
    calibrationTopics,
  } = useCameraStore();

  const removeCameraSetupIds = (cameraSetupsWithId: CameraSetups): CameraSetupBase[] => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return cameraSetupsWithId.map(({ id, ...setup }) => setup);
  };

  const [localCameraSetups, setLocalCameraSetups] = useState<CameraSetupBase[]>(
    removeCameraSetupIds(storedCameraSetups),
  );

  useEffect(() => {
    setLocalCameraSetups(removeCameraSetupIds(storedCameraSetups));
  }, [storedCameraSetups]);

  const [SaveCameraSetups, { loading: savingCameraSetups }] = useLazyApi<
    SaveCameraSetupsRequest,
    CameraSetups
  >({
    method: "POST",
    path: "/add_camera_setups",
  });

  const DEFAULT_CAMERA_SETUP: CameraSetupBase = useMemo(
    () => ({
      displayName: t("defaultDisplayName"),
      imageTopic: imageTopics[0]?.value ?? "",
      // eslint-disable-next-line no-restricted-syntax
      calibrationTopic: null,
    }),
    [imageTopics, t],
  );

  const handleAddCameraSetup = useCallback(() => {
    setLocalCameraSetups((prev) => [...prev, DEFAULT_CAMERA_SETUP]);
  }, [DEFAULT_CAMERA_SETUP]);

  const handleUpdateCameraSetups = useCallback((index: number, updatedSetup: CameraSetupBase) => {
    setLocalCameraSetups((prev) => prev.map((setup, i) => (i === index ? updatedSetup : setup)));
  }, []);

  const handleDeleteCameraSetup = useCallback((index: number) => {
    setLocalCameraSetups((prev) => prev.filter((_value, i) => i !== index));
  }, []);

  const handleDiscardChanges = useCallback(() => {
    setLocalCameraSetups(storedCameraSetups);
    setToastMessage(t("discardMessage"));

    if (unsavedResolver) {
      unsavedResolver();
      setUnsavedResolver(undefined);
    }
  }, [setToastMessage, setUnsavedResolver, storedCameraSetups, t, unsavedResolver]);

  const handleSaveChanges = useCallback(() => {
    void SaveCameraSetups({
      cameraSetups: localCameraSetups.map((setup) => ({
        ...setup,
        displayName: setup.displayName.trim() || t("defaultDisplayName"),
      })),
    }).then((response) => {
      const respondedCameraSetups = response.data;

      if (response.ok && respondedCameraSetups) {
        setStoredCameraSetups(respondedCameraSetups);

        Object.entries(selectedCameraSetups).forEach(([panelId, selectedSetup]) => {
          const isAvailable = respondedCameraSetups.some(
            (respondedCameraSetup) => respondedCameraSetup.id === selectedSetup?.id,
          );
          if (!isAvailable) {
            setSelectedCameraSetups(panelId, undefined);
          }
        });

        setToastMessage(t("savingSuccessMessage"));
      } else {
        setToastMessage(t("savingErrorMessage"));
      }

      if (unsavedResolver) {
        unsavedResolver();
        setUnsavedResolver(undefined);
      }
    });
  }, [
    SaveCameraSetups,
    localCameraSetups,
    selectedCameraSetups,
    setStoredCameraSetups,
    setSelectedCameraSetups,
    setToastMessage,
    setUnsavedResolver,
    t,
    unsavedResolver,
  ]);

  const isUnsaved = useMemo(() => {
    return !_.isEqual(removeCameraSetupIds(storedCameraSetups), localCameraSetups);
  }, [storedCameraSetups, localCameraSetups]);

  useEffect(() => {
    setIsUnsaved(isUnsaved);
  }, [isUnsaved, setIsUnsaved]);

  const dialogText = (
    <Trans
      ns="settings"
      i18nKey="unsavedDialogText"
      components={{
        newline: <br />,
      }}
    />
  );

  return (
    <div className={classes.root}>
      <CameraSetupSettings
        cameraSetups={localCameraSetups}
        imageTopics={imageTopics}
        calibrationTopics={calibrationTopics}
        onAdd={handleAddCameraSetup}
        onUpdate={handleUpdateCameraSetups}
        onDelete={handleDeleteCameraSetup}
      />

      {isUnsaved && (
        <ActionFooter>
          <Button onClick={handleDiscardChanges}>{t("discard")}</Button>
          <Button color="primary" onClick={handleSaveChanges} disabled={savingCameraSetups}>
            {t("save")}
          </Button>
        </ActionFooter>
      )}

      <Dialog
        dialogTitle={t("unsavedDialogTitle")}
        open={isUnsavedDialogOpen}
        dialogText={dialogText}
        primaryButtonText={t("save")}
        primaryButtonAction={handleSaveChanges}
        secondaryButtonText={t("discard")}
        secondaryButtonAction={handleDiscardChanges}
      />
    </div>
  );
}
