// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import { Button, CircularProgress, IconButton, Typography } from "@mui/material";
import html2canvas from "html2canvas";
import { useSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";

import { Time, toSec } from "@foxglove/rostime";
import { PanelExtensionContext } from "@foxglove/studio";
import {
  AUTO_HIDE_DURATION,
  FOOTER_HEIGHT,
} from "@foxglove/studio-base/components/AppBar/constants";
import {
  MessagePipelineContext,
  useMessagePipeline,
} from "@foxglove/studio-base/components/MessagePipeline";
import { MAIN_PANEL_ID } from "@foxglove/studio-base/components/PanelExtensionAdapter/PanelExtensionAdapter";
import { useLazyApi } from "@foxglove/studio-base/hooks/useLazyApi";
import { useListener } from "@foxglove/studio-base/hooks/useListener";
import { useRecording } from "@foxglove/studio-base/hooks/useRecording";
import { Flag, Tag, useFlagStore } from "@foxglove/studio-base/stores/useFlagStore";
import { useRecordingInfoStore } from "@foxglove/studio-base/stores/useRecordingInfoStore";
import { useSystemInfoStore } from "@foxglove/studio-base/stores/useSystemInfoStore";
import { formatTimeFromSeconds } from "@foxglove/studio-base/util/formatTime";
import { FileSizeUnit, convertRecordingSize } from "@foxglove/studio-base/util/getRecordingSize";
import {
  serif_14px_400,
  mono_14px_500,
  mono_18px_500,
} from "@foxglove/studio-base/util/sharedStyleConstants";
import { removeMilliseconds } from "@foxglove/studio-base/util/time";

import RecordingStopIcon from "../../assets/Recording-STOP-large.svg";
import RecordingIcon from "../../assets/Recording-large.svg";

const useStyles = makeStyles()((theme) => ({
  recordingFooter: {
    display: "none",
    gridTemplateColumns: "repeat(3,1fr)",
    justifyItems: "center",
    alignItems: "center",
    paddingInline: "24px",
    background: theme.palette.greys.black,
    minHeight: FOOTER_HEIGHT,

    "&:before": {
      content: "''",
      position: "absolute",
      transition: "border-color 0.125s ease-out",
      borderBottom: "8px solid transparent",
      bottom: 0,
      left: 0,
      width: "100%",
    },
  },

  open: {
    display: "grid",
  },

  recordingIndicator: {
    "&:before": {
      borderColor: theme.palette.secondaries.red.main,
    },
  },

  outerContent: {
    ...serif_14px_400,

    display: "flex",
    alignItems: "center",
    gap: theme.spacing(4),
    color: theme.palette.greys.b2b2b2,

    "&:first-of-type": {
      justifySelf: "start",
    },

    "&:last-of-type": {
      justifySelf: "end",
    },
  },

  visible: {
    visibility: "visible",
  },

  centerContent: {
    ...serif_14px_400,

    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: theme.spacing(0.5),
    visibility: "hidden",
  },

  recordingInfo: {
    ...mono_18px_500,

    color: theme.palette.secondaries.red.main,
    display: "flex",
    gap: theme.spacing(2),
  },

  availableStorage: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
    alignItems: "flex-end",
  },

  storageSpace: {
    ...mono_14px_500,
  },

  divider: {
    color: theme.palette.greys.b2b2b2,
  },

  iconButtonContainer: {
    display: "flex",
    alignItems: "center",
  },

  separator: {
    width: "2px",
    height: "44px",
    backgroundColor: theme.palette.greys[454545],
  },

  iconButton: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
    width: "80px !important",
    height: "auto !important",
    padding: theme.spacing(1.5),

    svg: {
      width: "24px",
      height: "24px",
    },
  },

  iconButtonLabel: {
    ...serif_14px_400,
  },

  disabled: {
    opacity: 0.3,
  },
}));

export type SetThumbnailRequest = {
  id: string;
  image: string;
};

export type SetThumbnailResponse = {
  id: string;
  image: Blob;
};

export type AddFlagRequest = Omit<Flag, "tags"> & {
  tags: Tag["id"][];
};

export type AddFlagResponse = Omit<Flag, "tags">;

export type RecordingFooterProps = {
  context: PanelExtensionContext;
};

const selectStartTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.startTime;
const selectCurrentTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.currentTime;

export const RecordingFooter: React.FC<RecordingFooterProps> = ({
  context,
}): React.ReactElement => {
  const { classes, cx, theme } = useStyles();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(undefined);
  const [loadingTagId, setLoadingTagId] = useState<string | undefined>(undefined);
  const [recordingStartTime, setRecordingStartTime] = useState<Time | undefined>(undefined);
  const { isRecording, isRecordingToolbarOpen, stopRecording, startRecording } = useRecording();
  const { recordingInfo, resetRecordingInfo } = useRecordingInfoStore();
  const systemInfo = useSystemInfoStore();
  const { enqueueSnackbar } = useSnackbar();
  const { tags } = useFlagStore();

  // Ensure that the RecordingInfo is reset when the RecordingFooter is opened.
  useEffect(() => {
    resetRecordingInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscriptions = useMessagePipeline((cntx) => cntx.subscriptions);
  const startTimeObj = useMessagePipeline(selectStartTime);
  const currentTimeObj = useMessagePipeline(selectCurrentTime);

  const [SetThumbnail] = useLazyApi<SetThumbnailRequest, SetThumbnailResponse>({
    method: "POST",
    path: "/set_thumbnail",
  });

  const [AddFlag] = useLazyApi<AddFlagRequest, AddFlagResponse>({
    method: "PUT",
    path: "/add_flag",
  });

  const [DeleteFlag] = useLazyApi({
    method: "DELETE",
    path: "/delete_flag",
  });

  useListener({
    context,
    topic: "/system_info",
    activeSubscriptions: [...subscriptions.map((topic) => topic.topic)],
    // Doing nothing here because renderState only works in threeDeeRenderer.
    onListen: () => {},
  });

  const recordingSize = convertRecordingSize(recordingInfo.size, FileSizeUnit.GB);
  const recordingDuration =
    typeof recordingInfo.duration === "number"
      ? formatTimeFromSeconds(recordingInfo.duration)
      : removeMilliseconds(recordingInfo.duration);

  const storageSpace = convertRecordingSize(systemInfo.storageSpace, FileSizeUnit.GB);

  const onRecordingStart = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (currentTimeObj) {
      setRecordingStartTime(currentTimeObj);
    }

    startRecording();
  };

  const onRecordingStop = async () => {
    enqueueSnackbar(
      <Typography variant="body1" paddingLeft="0.3rem">
        Recording successfully saved!
      </Typography>,
      {
        variant: "default",
        anchorOrigin: { horizontal: "center", vertical: "bottom" },
        autoHideDuration: AUTO_HIDE_DURATION,
        hideIconVariant: true,
        SnackbarProps: {
          style: {
            transform: `translate(0, -${FOOTER_HEIGHT}px)`,
          },
        },
      },
    );

    const element = document.getElementById(MAIN_PANEL_ID);

    if (element) {
      const canvas = await html2canvas(element);

      // Ensure the canvas is fully rendered
      requestAnimationFrame(() => {
        canvas.toBlob((blob) => {
          if (blob) {
            // Convert blob to base64 as a string.
            const reader: FileReader = new FileReader();

            reader.readAsDataURL(blob);

            reader.onloadend = () => {
              void SetThumbnail({
                id: recordingInfo.id,
                image: reader.result as string,
              });
            };
          }
        }, "image/png");
      });
    }

    stopRecording();
    setRecordingStartTime(undefined);

    const timeout = setTimeout(() => {
      resetRecordingInfo();
    }, AUTO_HIDE_DURATION);

    setTimeoutId(timeout);
  };

  return (
    <div
      className={cx(classes.recordingFooter, {
        [classes.open]: isRecordingToolbarOpen,
        [classes.recordingIndicator]: isRecording,
      })}
    >
      <div className={classes.outerContent}>
        {isRecording ? (
          <Button onClick={onRecordingStop}>
            <RecordingStopIcon />
          </Button>
        ) : (
          <Button onClick={onRecordingStart}>
            <RecordingIcon />
          </Button>
        )}

        {isRecording && (
          <div className={classes.iconButtonContainer}>
            {tags.map((tag, index) => {
              const isThisLoading = loadingTagId === tag.id;
              const isAnyLoading = loadingTagId != undefined;
              const isDisabled = isAnyLoading;

              return (
                <Fragment key={tag.id}>
                  {isThisLoading ? (
                    <CircularProgress className={classes.iconButton} />
                  ) : (
                    <IconButton
                      disabled={isDisabled}
                      className={cx(classes.iconButton, { [classes.disabled]: isDisabled })}
                      onClick={async () => {
                        if (!recordingInfo.id || !currentTimeObj || !startTimeObj) {
                          return;
                        }

                        setLoadingTagId(tag.id);

                        try {
                          const baseTimeObj = recordingStartTime ?? startTimeObj;
                          const flagTimeStr = formatTimeFromSeconds(
                            currentTimeObj.sec - baseTimeObj.sec,
                          );

                          const response = await AddFlag({
                            id: recordingInfo.id,
                            title: `Flag ${flagTimeStr}`,
                            timestamp: toSec(currentTimeObj),
                            tags: [tag.id],
                          });

                          if (response.ok && response.data) {
                            const flagData = response.data;

                            enqueueSnackbar(
                              <>
                                <Typography variant="body1" paddingLeft="0.3rem">
                                  Added Flag
                                </Typography>

                                <Button
                                  onClick={async () => {
                                    await DeleteFlag({ id: flagData.id });
                                  }}
                                >
                                  <Typography variant="body1" color={theme.palette.primary.main}>
                                    UNDO
                                  </Typography>
                                </Button>
                              </>,
                              {
                                variant: "default",
                                anchorOrigin: { vertical: "bottom", horizontal: "center" },
                                autoHideDuration: AUTO_HIDE_DURATION,
                                hideIconVariant: true,
                                SnackbarProps: {
                                  style: {
                                    transform: `translate(0, -${FOOTER_HEIGHT}px)`,
                                  },
                                },
                              },
                            );
                          }
                        } finally {
                          setLoadingTagId(undefined);
                        }
                      }}
                    >
                      <OutlinedFlagIcon htmlColor={tag.backgroundColor} />
                      <span className={classes.iconButtonLabel}>{tag.label}</span>
                    </IconButton>
                  )}

                  {index < tags.length - 1 && <div className={classes.separator} />}
                </Fragment>
              );
            })}
          </div>
        )}
      </div>

      <div
        className={cx(classes.centerContent, {
          [classes.visible]: isRecording,
        })}
      >
        <div className={classes.recordingInfo}>
          <span>{recordingSize}</span>
          <span className={classes.divider}>|</span>
          <span>{recordingDuration}</span>
        </div>
        <div>{`Recording: ${recordingInfo.file_name}`}</div>
      </div>

      <div className={classes.outerContent}>
        <div className={classes.availableStorage}>
          <div className={classes.storageSpace}>{storageSpace}</div>
          <div>Available Storage</div>
        </div>
      </div>
    </div>
  );
};
