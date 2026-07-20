// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Typography } from "@mui/material";
import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { makeStyles } from "tss-react/mui";

import { fromSec, areEqual } from "@foxglove/rostime";
import { Dialog } from "@foxglove/studio-base/components/Dialog";
import {
  EditFlagRequest,
  FlagsListItem,
} from "@foxglove/studio-base/components/FlagsListItem/FlagsListItem";
import { FlagsSelector } from "@foxglove/studio-base/components/FlagsSelector/FlagsSelector";
import {
  MessagePipelineContext,
  useMessagePipeline,
} from "@foxglove/studio-base/components/MessagePipeline";
import { UserInfo } from "@foxglove/studio-base/components/UserInfo";
import { useLazyApi } from "@foxglove/studio-base/hooks/useLazyApi";
import { Flag, useFlagStore } from "@foxglove/studio-base/stores/useFlagStore";
import { formatTimeFromSeconds } from "@foxglove/studio-base/util/formatTime";
import { areSecondsEqual } from "@foxglove/studio-base/util/time";

const useStyles = makeStyles()(() => ({
  flagsListRoot: {
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    height: "100%",
  },
  flagsListHeader: {
    padding: "16px",
    textTransform: "uppercase",
    fontSize: "14px",
    lineHeight: "20px",
    borderBottom: "1px solid #000",
  },
  flagsListContent: {
    overflow: "auto",
  },
}));

const selectStartTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.startTime;
const selectCurrentTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.currentTime;
const selectEndTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.endTime;
const selectSeek = (ctx: MessagePipelineContext) => ctx.seekPlayback;

export default function FlagsList(): JSX.Element {
  const { classes } = useStyles();
  const { t } = useTranslation("flags");

  const {
    sortedFlags,
    setSortedFlags,
    selectedFlagId,
    isUnsaved,
    setIsUnsaved,
    editFlagPayload,
    setEditFlagPayload,
  } = useFlagStore();

  const [editModeFlagId, setEditModeFlagId] = useState<string | undefined>(undefined);
  const [isUnsavedDialogOpen, setIsUnsavedDialogOpen] = useState(false);
  const [nextEditModeFlagId, setNextEditModeFlagId] = useState<string | undefined>(undefined);

  const [EditFlag] = useLazyApi<EditFlagRequest, Flag>({
    method: "POST",
    path: "/edit_flag",
  });

  const indexOfLastFlag = sortedFlags.length - 1;
  const firstFlagTimestamp = sortedFlags[0]?.timestamp;

  const startTimeObj = useMessagePipeline(selectStartTime);
  const currentTimeObj = useMessagePipeline(selectCurrentTime);
  const endTimeObj = useMessagePipeline(selectEndTime);
  const seek = useMessagePipeline(selectSeek);

  if (!startTimeObj || !currentTimeObj || !endTimeObj || !seek) {
    return <></>;
  }

  const renderFlagsListItems = (): React.ReactElement | undefined => {
    const flagsListItems = sortedFlags.map((flag) => {
      const flagTimeObj = fromSec(flag.timestamp);
      const flagTimeStr = formatTimeFromSeconds(flagTimeObj.sec - startTimeObj.sec);
      const isSelected = flag.id === selectedFlagId;

      const handleOnLongPress = () => {
        if (isUnsaved) {
          setIsUnsavedDialogOpen(true);
          setNextEditModeFlagId(flag.id);
        } else {
          setEditModeFlagId(flag.id);
        }
      };

      return (
        <FlagsListItem
          key={flag.id}
          id={flag.id}
          title={flag.title}
          note={flag.note ?? ""}
          time={flagTimeStr}
          selected={isSelected}
          onClick={() => {
            seek(flagTimeObj);
          }}
          onLongPress={handleOnLongPress}
          editMode={editModeFlagId === flag.id}
          onCancelEditMode={() => {
            setEditModeFlagId(undefined);
          }}
          selectedTags={flag.tags}
        />
      );
    });

    return <>{flagsListItems}</>;
  };

  const handlePreviousClick = () => {
    const currentTimeSec = currentTimeObj.sec;

    for (let i = indexOfLastFlag; i >= 0; i--) {
      const flagI = sortedFlags[i];
      const flagBeforeI = sortedFlags[i - 1];

      if (flagI == undefined) {
        return;
      }

      const flagTimeObj = fromSec(flagI.timestamp);
      const flagTimeSec = flagTimeObj.sec;

      if (areSecondsEqual(currentTimeObj, flagTimeObj) && i > 0) {
        if (flagBeforeI == undefined) {
          return;
        }

        // If the current time is exactly on the time of a flag, jump to the previous flag, if available.
        seek(fromSec(flagBeforeI.timestamp));
        return;
      }

      if (currentTimeSec > flagTimeSec) {
        // If the current time is after the time of a flag, jump to the current flag.
        seek(flagTimeObj);
        return;
      }
    }
  };

  const handleNextClick = () => {
    const selectedIndex = sortedFlags.findIndex((flag) => flag.id === selectedFlagId);

    if (selectedIndex < 0) {
      if (firstFlagTimestamp == undefined) {
        return;
      }

      // If selectedIndex is undefined, jumps to the first flag.
      const flagTimeObj = fromSec(firstFlagTimestamp);
      seek(flagTimeObj);
      return;
    }

    if (selectedIndex < indexOfLastFlag) {
      const nextFlag = sortedFlags[selectedIndex + 1];

      if (!nextFlag) {
        return;
      }

      const flagTimeObj = fromSec(nextFlag.timestamp);
      seek(flagTimeObj);
    }
  };

  const handleDiscardChanges = () => {
    setEditModeFlagId(nextEditModeFlagId);
    setIsUnsaved(false);
    setIsUnsavedDialogOpen(false);
    setNextEditModeFlagId(undefined);
  };

  const handleSaveChanges = async () => {
    if (editFlagPayload == undefined) {
      return;
    }

    const response = await EditFlag(editFlagPayload);

    if (response.data && response.ok) {
      const updatedFlag = response.data;
      setSortedFlags(
        sortedFlags.map((flag) => (flag.id === editFlagPayload.id ? updatedFlag : flag)),
      );
      setEditFlagPayload(undefined);
    }

    handleDiscardChanges();
  };

  const dialogText = (
    <Trans
      ns="flags"
      i18nKey="unsavedDialogText"
      components={{
        newline: <br />,
      }}
    />
  );

  return (
    <>
      <div className={classes.flagsListRoot}>
        <Typography className={classes.flagsListHeader}>Flags</Typography>

        <div className={classes.flagsListContent}>
          {sortedFlags.length > 0 ? renderFlagsListItems() : <UserInfo>{t("noFlags")}</UserInfo>}
        </div>

        <FlagsSelector
          onPreviousClick={handlePreviousClick}
          onNextClick={handleNextClick}
          previousDisabled={
            firstFlagTimestamp == undefined
              ? true
              : sortedFlags.length === 0 ||
                selectedFlagId === "" ||
                (selectedFlagId === sortedFlags[0]?.id &&
                  areEqual(currentTimeObj, fromSec(firstFlagTimestamp)))
          }
          nextDisabled={
            sortedFlags.length === 0 || selectedFlagId === sortedFlags[indexOfLastFlag]?.id
          }
        />
      </div>

      <Dialog
        dialogTitle={t("unsavedDialogTitle")}
        open={isUnsavedDialogOpen}
        dialogText={dialogText}
        primaryButtonText={t("saveChanges")}
        primaryButtonAction={handleSaveChanges}
        secondaryButtonText={t("discardChanges")}
        secondaryButtonAction={handleDiscardChanges}
      />
    </>
  );
}
