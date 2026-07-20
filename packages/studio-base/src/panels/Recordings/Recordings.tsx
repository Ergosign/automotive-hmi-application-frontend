// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
import { CircularProgress } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { makeStyles } from "tss-react/mui";

import { PanelExtensionContext } from "@foxglove/studio";
import { ActionFooter } from "@foxglove/studio-base/components/ActionFooter";
import { Button } from "@foxglove/studio-base/components/Button";
import { Dialog } from "@foxglove/studio-base/components/Dialog";
import { Recording } from "@foxglove/studio-base/components/Recording/Recording";
import { UserInfo } from "@foxglove/studio-base/components/UserInfo";
import { useLazyApi } from "@foxglove/studio-base/hooks/useLazyApi";
import { View } from "@foxglove/studio-base/providers/CurrentLayoutProvider/defaultLayout";
import { Flag } from "@foxglove/studio-base/stores/useFlagStore";
import { useMemoryStore } from "@foxglove/studio-base/stores/useMemoryStore";
import { useNavigationStore } from "@foxglove/studio-base/stores/useNavigationStore";
import {
  DEFAULT_RECORDING_INFO,
  useRecordingInfoStore,
} from "@foxglove/studio-base/stores/useRecordingInfoStore";
import { FileSizeUnit, convertRecordingSize } from "@foxglove/studio-base/util/getRecordingSize";
import { serif_32px_500, serif_14px_500 } from "@foxglove/studio-base/util/sharedStyleConstants";
import { removeMilliseconds } from "@foxglove/studio-base/util/time";

type Props = {
  context: PanelExtensionContext;
};

const useStyles = makeStyles()((theme) => ({
  root: {
    display: "grid",
    alignItems: "start",
    gridTemplateRows: `${theme.spacing(10)} 1fr`,
    paddingInline: theme.spacing(2),
    paddingBottom: theme.spacing(12),
    height: "100%",
    overflow: "auto",
  },
  recordingsHeader: {
    position: "sticky",
    top: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    background: theme.palette.background.default,
    zIndex: 1,
    paddingBlock: theme.spacing(2),
  },
  headline: {
    ...serif_32px_500,
    color: theme.palette.greys.white,
    margin: 0,
  },
  recordingsGrid: {
    display: "grid",
    rowGap: theme.spacing(2),
    columnGap: theme.spacing(2),
    gridTemplateColumns: "repeat(auto-fill, minmax(209px, 1fr))",
  },
  loadingSpinnerContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingsSelected: {
    ...serif_14px_500,
  },
  selectionActions: {
    display: "flex",
    gap: "8px",
  },
}));

export type Recording = {
  id: string;
  available: boolean;
  createdAt: string;
  flags: Flag[];
  duration: string;
  name: string;
  path: string;
  size: string;
  thumbnail_path: string;
};

export type DeleteRequest = {
  ids: string[];
};

export function Recordings({ context }: Props): JSX.Element {
  const { classes } = useStyles();
  const { t } = useTranslation("appBar");
  const { setRecordingInfo } = useRecordingInfoStore();
  const { changePanelLayout } = useNavigationStore();
  const selectSource = useMemoryStore((state) => state.selectSource);

  const [GetRecordings, { data, loading }] = useLazyApi<undefined, Recording[]>({
    method: "GET",
    path: "/get_recordings",
  });

  const [DeleteRecordings] = useLazyApi<DeleteRequest, undefined[]>({
    method: "DELETE",
    path: "/delete_recordings",
  });

  const [isInSelectionMode, setIsInSelectionMode] = useState(false);
  const [selectedRecordings, setSelectedRecordings] = useState<string[]>([]);

  useEffect(() => {
    if (!isInSelectionMode) {
      // Clear the IDs if the select mode is exited.
      setSelectedRecordings([]);
    }
  }, [isInSelectionMode]);

  useEffect(() => {
    void GetRecordings(undefined);
  }, [GetRecordings]);

  const nothingSelected = selectedRecordings.length === 0;

  const longPressHandler = useCallback((recordingId: string) => {
    setIsInSelectionMode(true);
    setSelectedRecordings((prevSelected) =>
      prevSelected.includes(recordingId) ? prevSelected : [...prevSelected, recordingId],
    );
  }, []);

  const canOpenRecording = Boolean(
    context.publish && context.advertise && selectSource && changePanelLayout,
  );

  const handleRecordingClick = useCallback(
    (recording: Recording) => {
      if (isInSelectionMode) {
        setSelectedRecordings((prevSelected) =>
          prevSelected.includes(recording.id)
            ? prevSelected.filter((id) => id !== recording.id)
            : [...prevSelected, recording.id],
        );
      } else {
        if (!canOpenRecording) {
          return;
        }

        context.advertise?.("/command_topic", "std_msgs/msg/String");
        context.publish?.("/command_topic", { data: "LOAD_RECORDINGS" });

        const connectUrl = window.configuration.NGINX_URL;
        selectSource?.("remote-file", {
          type: "connection",
          params: { url: `${connectUrl}/${recording.name}/${recording.name}_0.mcap` },
        });
        setRecordingInfo({
          ...DEFAULT_RECORDING_INFO,
          file_name: recording.name,
          size: BigInt(recording.size),
        });
        changePanelLayout?.({ layout: View.LIVE });
      }
    },
    [
      changePanelLayout,
      context,
      isInSelectionMode,
      selectSource,
      setRecordingInfo,
      canOpenRecording,
    ],
  );

  const renderRecordings = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.map((recording) => {
      const isSelected = selectedRecordings.includes(recording.id);

      return (
        <Recording
          key={recording.id}
          size={convertRecordingSize(recording.size, FileSizeUnit.GB)}
          duration={removeMilliseconds(recording.duration)}
          date={recording.name}
          onClick={() => {
            handleRecordingClick(recording);
          }}
          onLongPress={() => {
            longPressHandler(recording.id);
          }}
          imgSrc={recording.thumbnail_path}
          selectionMode={isInSelectionMode}
          selected={isInSelectionMode && isSelected}
          disabled={!canOpenRecording && !isInSelectionMode}
        />
      );
    });
  }, [
    data,
    handleRecordingClick,
    isInSelectionMode,
    longPressHandler,
    selectedRecordings,
    canOpenRecording,
  ]);

  const toggleSelectMode = useCallback(() => {
    setIsInSelectionMode(!isInSelectionMode);
  }, [isInSelectionMode]);

  const toggleSelection = useCallback(() => {
    if (!data) {
      return;
    }

    const allRecordingIds = data.map((recording) => recording.id);

    setSelectedRecordings((prevSelected) =>
      prevSelected.length === allRecordingIds.length ? [] : allRecordingIds,
    );
  }, [data]);

  const handleDeleteRecordings = useCallback(async () => {
    await DeleteRecordings({ ids: selectedRecordings });

    setOpen(false);
    setIsInSelectionMode(false);
    setSelectedRecordings([]);

    void GetRecordings(undefined);
  }, [DeleteRecordings, GetRecordings, selectedRecordings]);

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const dialogText = (
    <Trans
      ns="appBar"
      i18nKey="alertDialogDescription"
      components={{
        newline: <br />,
      }}
    />
  );

  return (
    <div className={classes.root}>
      <div className={classes.recordingsHeader}>
        <h1 className={classes.headline}>{t("recordings")}</h1>
        {!loading && data && data.length > 0 && (
          <Button onClick={toggleSelectMode}>
            {isInSelectionMode ? t("cancel") : t("selectRecordings")}
          </Button>
        )}
      </div>
      {loading ? (
        <div className={classes.loadingSpinnerContainer}>
          <CircularProgress color="secondary" />
        </div>
      ) : data && data.length > 0 ? (
        <div className={classes.recordingsGrid}>{renderRecordings}</div>
      ) : (
        <UserInfo>{t("noRecordings")}</UserInfo>
      )}
      {isInSelectionMode && (
        <ActionFooter>
          <Button onClick={toggleSelection}>
            {selectedRecordings.length === data?.length ? t("deselectAll") : t("selectAll")}
          </Button>

          <span className={classes.recordingsSelected}>
            <Trans
              ns="appBar"
              i18nKey="recordingsSelected"
              values={{
                count: selectedRecordings.length,
              }}
            />
          </span>

          <div className={classes.selectionActions}>
            {/* <Button

              onClick={handleExportFlags}
              disabled={nothingSelected}
            >
              {t("exportFlags")}
            </Button> */}

            <Button onClick={handleClickOpen} disabled={nothingSelected}>
              {t("deleteRecordings")}
            </Button>

            <Dialog
              dialogTitle={t("alertDialogTitle")}
              open={open}
              onClose={handleClose}
              dialogText={dialogText}
              primaryButtonText={t("deleteRecordings")}
              primaryButtonAction={handleDeleteRecordings}
              secondaryButtonText={t("cancel")}
              secondaryButtonAction={handleClose}
              isDangerousAction
            />
          </div>
        </ActionFooter>
      )}
    </div>
  );
}
