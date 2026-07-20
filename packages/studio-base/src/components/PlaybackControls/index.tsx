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

import { ArrowRepeatAll20Regular, ArrowRepeatAllOff20Regular } from "@fluentui/react-icons";
import Forward10OutlinedIcon from "@mui/icons-material/Forward10Outlined";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import Replay10OutlinedIcon from "@mui/icons-material/Replay10Outlined";
import { Button, CircularProgress, IconButton, SelectChangeEvent, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLatest } from "react-use";
import { makeStyles } from "tss-react/mui";

import { Time, add, compare, fromSec, isLessThan, toSec } from "@foxglove/rostime";
import {
  AUTO_HIDE_DURATION,
  FOOTER_HEIGHT,
} from "@foxglove/studio-base/components/AppBar/constants";
import { CreateEventDialog } from "@foxglove/studio-base/components/CreateEventDialog";
import { Flag } from "@foxglove/studio-base/components/Flag/Flag";
import HoverableIconButton from "@foxglove/studio-base/components/HoverableIconButton";
import KeyListener from "@foxglove/studio-base/components/KeyListener";
import {
  MessagePipelineContext,
  useMessagePipeline,
} from "@foxglove/studio-base/components/MessagePipeline";
import PlaybackSpeedControls from "@foxglove/studio-base/components/PlaybackSpeedControls";
import {
  AddFlagRequest,
  AddFlagResponse,
} from "@foxglove/studio-base/components/RecordingFooter/RecordingFooter";
import Stack from "@foxglove/studio-base/components/Stack";
import { getTagById, TagPicker } from "@foxglove/studio-base/components/TagPicker";
import { EventsStore, useEvents } from "@foxglove/studio-base/context/EventsContext";
import { usePlayerSelection } from "@foxglove/studio-base/context/PlayerSelectionContext";
import {
  WorkspaceContextStore,
  useWorkspaceStore,
} from "@foxglove/studio-base/context/Workspace/WorkspaceContext";
import { useWorkspaceActions } from "@foxglove/studio-base/context/Workspace/useWorkspaceActions";
import { useLazyApi } from "@foxglove/studio-base/hooks/useLazyApi";
import { Recording } from "@foxglove/studio-base/panels/Recordings/Recordings";
import { subtractTimes } from "@foxglove/studio-base/players/UserNodePlayer/nodeTransformerWorker/typescript/userUtils/time";
import { Player, PlayerPresence } from "@foxglove/studio-base/players/types";
import { useFlagStore } from "@foxglove/studio-base/stores/useFlagStore";
import { useNavigationStore } from "@foxglove/studio-base/stores/useNavigationStore";
import { useRecordingInfoStore } from "@foxglove/studio-base/stores/useRecordingInfoStore";
import { useVideoPlayerStore } from "@foxglove/studio-base/stores/useVideoPlayerStore";
import { formatTimeFromSeconds } from "@foxglove/studio-base/util/formatTime";
import { FileSizeUnit, convertRecordingSize } from "@foxglove/studio-base/util/getRecordingSize";
import { serif_14px_400 } from "@foxglove/studio-base/util/sharedStyleConstants";
import { isGreaterThanOrEqual } from "@foxglove/studio-base/util/time";

import { RepeatAdapter } from "./RepeatAdapter";
import Scrubber from "./Scrubber";
import { DIRECTION, jumpSeek } from "./sharedHelpers";

const useStyles = makeStyles()((theme) => ({
  root: {
    display: "grid",
    minHeight: FOOTER_HEIGHT,
    columnGap: theme.spacing(2),
    gridTemplateColumns: "auto 1fr auto",
    paddingInline: "24px",
    position: "relative",
    background: theme.palette.common.black,
    zIndex: 100000,
  },
  scrubberContainer: {
    display: "grid",
    columnGap: theme.spacing(1),
    gridTemplateColumns: "auto 1fr auto auto",
    alignItems: "center",
  },
  sizeContainer: {
    display: "flex",
    gap: "32px",
    alignItems: "center",
  },
  recordingSize: {
    paddingLeft: "16px",
    color: theme.palette.greys.b2b2b2,
  },
  iconButton: {
    width: "48px !important",
    height: "48px !important",
    padding: "12px",

    "&.playPauseButton": {
      padding: "0px",
    },

    svg: {
      width: "100%",
      height: "100%",
    },
  },
  textStyles: {
    ...serif_14px_400,
    color: theme.palette.greys.white,
  },
  onPlaying: {
    color: theme.palette.key.cyan.main,
  },
}));

const selectPresence = (ctx: MessagePipelineContext) => ctx.playerState.presence;
const selectEventsSupported = (store: EventsStore) => store.eventsSupported;
const selectPlaybackRepeat = (store: WorkspaceContextStore) => store.playbackControls.repeat;
const selectStartTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.startTime;
const selectCurrentTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.currentTime;
const selectEndTime = (ctx: MessagePipelineContext) => ctx.playerState.activeData?.endTime;

export default function PlaybackControls(props: {
  play: NonNullable<Player["startPlayback"]>;
  pause: NonNullable<Player["pausePlayback"]>;
  seek: NonNullable<Player["seekPlayback"]>;
  // playUntil?: Player["playUntil"];
  isPlaying: boolean;
  getTimeInfo: () => { startTime?: Time; endTime?: Time; currentTime?: Time };
}): JSX.Element {
  const { play, pause, seek, isPlaying, getTimeInfo } = props;
  const videoPlayer = useVideoPlayerStore();
  const { recordingInfo, setRecordingInfo } = useRecordingInfoStore();
  const { sortedFlags, setSortedFlags, selectedFlagId, setSelectedFlagId, tags } = useFlagStore();
  const { localFileSize } = useNavigationStore();

  const player = usePlayerSelection();
  const isLocalFile = player.selectedSource?.displayName === "MCAP";

  const [selectedTagId, setSelectedTagId] = useState(tags[0]?.id ?? "");
  const selectedTag = getTagById(selectedTagId, tags);
  const containerRef = useRef<HTMLDivElement>(ReactNull);

  const handleChange = useCallback((event: SelectChangeEvent<unknown>) => {
    const selectedColor = event.target.value as string;
    setSelectedTagId(selectedColor);
  }, []);

  const presence = useMessagePipeline(selectPresence);

  const [AddFlag, { loading: loadingAddFlag }] = useLazyApi<AddFlagRequest, AddFlagResponse>({
    method: "PUT",
    path: "/add_flag",
  });

  const [DeleteFlag] = useLazyApi({
    method: "DELETE",
    path: "/delete_flag",
  });

  const [GetRecordingByName, { data, loading: loadingGetRecording }] = useLazyApi<
    { name: string },
    Recording
  >({
    method: "POST",
    path: "/get_recording_by_name",
  });

  const fileName = useMemo(() => {
    const url = new URLSearchParams(location.search);
    const path = url.get("ds.url");
    if (!path) {
      return;
    }
    const arr = path.split("/");
    const fName = arr[3];
    if (typeof fName !== "string") {
      return undefined;
    }
    return fName;
  }, []);

  useEffect(() => {
    if (fileName == undefined) {
      return;
    }
    void GetRecordingByName({ name: fileName });

    setRecordingInfo({
      ...recordingInfo,
      file_name: fileName,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileName]);

  useEffect(() => {
    if (data) {
      const flags = data.flags;
      setSortedFlags(flags.sort((a, b) => a.timestamp - b.timestamp));

      if (data.size) {
        setRecordingInfo({
          ...recordingInfo,
          id: data.id,
          file_name: data.name,
          size: BigInt(data.size),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, setSortedFlags]);

  const { classes, cx, theme } = useStyles();
  const repeat = useWorkspaceStore(selectPlaybackRepeat);
  const [createEventDialogOpen, setCreateEventDialogOpen] = useState(false);
  // const { currentUser } = useCurrentUser();
  const eventsSupported = useEvents(selectEventsSupported);
  const startTimeObj = useMessagePipeline(selectStartTime);
  const currentTimeObj = useMessagePipeline(selectCurrentTime);
  const endTimeObj = useMessagePipeline(selectEndTime);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const recordingSize = isLocalFile
    ? localFileSize != undefined
      ? convertRecordingSize(localFileSize, FileSizeUnit.GB)
      : undefined
    : convertRecordingSize(recordingInfo.size, FileSizeUnit.GB);

  useEffect(() => {
    const flags = data?.flags ?? [];
    setSortedFlags(flags.sort((a, b) => a.timestamp - b.timestamp));
  }, [data?.flags, setSortedFlags]);

  useEffect(() => {
    if (!startTimeObj || !currentTimeObj || !endTimeObj) {
      return;
    }

    const indexOfLastFlag = sortedFlags.length - 1;

    const selectedIndex = sortedFlags.findIndex((flag, i) => {
      const flagTimeObj = fromSec(flag.timestamp);
      const nextFlag = sortedFlags[i + 1];
      const nextFlagTimeObj = nextFlag ? fromSec(nextFlag.timestamp) : undefined;

      return (
        isGreaterThanOrEqual(currentTimeObj, flagTimeObj) &&
        (i === indexOfLastFlag || (nextFlagTimeObj && isLessThan(currentTimeObj, nextFlagTimeObj)))
      );
    });

    if (selectedIndex >= 0) {
      setSelectedFlagId(sortedFlags[selectedIndex]?.id ?? "");
    } else {
      setSelectedFlagId("");
    }
  }, [currentTimeObj, endTimeObj, setSelectedFlagId, sortedFlags, startTimeObj]);

  const {
    playbackControlActions: { setRepeat },
  } = useWorkspaceActions();

  const toggleRepeat = useCallback(() => {
    setRepeat((old) => !old);
  }, [setRepeat]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
      videoPlayer.pause();
    } else {
      const { startTime: start, endTime: end, currentTime: current } = getTimeInfo();
      // if we are at the end, we need to go back to start
      if (current && end && start && compare(current, end) >= 0) {
        seek(start);
      }
      play();
      videoPlayer.play();
    }
  }, [isPlaying, pause, getTimeInfo, play, seek, videoPlayer]);

  const seekForwardAction = useCallback(
    (ev?: KeyboardEvent) => {
      const { currentTime } = getTimeInfo();
      if (!currentTime) {
        return;
      }

      // If playUntil is available, we prefer to use that rather than seek, which performs a jump
      // seek.
      //
      // Playing forward up to the desired seek time will play all messages to the panels which
      // mirrors the behavior panels would expect when playing without stepping. This behavior is
      // important for some message types which convey state information.
      //
      // i.e. Skipping coordinate frame messages may result in incorrectly rendered markers or
      // missing markers altogther.
      const targetTime = jumpSeek(DIRECTION.FORWARD, currentTime, ev);

      // if (playUntil) {
      //   playUntil(targetTime);
      // } else {
      seek(targetTime);
      // }
    },
    [getTimeInfo, seek],
  );

  const seekBackwardAction = useCallback(
    (ev?: KeyboardEvent) => {
      const { currentTime } = getTimeInfo();
      if (!currentTime) {
        return;
      }
      seek(jumpSeek(DIRECTION.BACKWARD, currentTime, ev));
    },
    [getTimeInfo, seek],
  );

  const keyDownHandlers = useMemo(
    () => ({
      " ": togglePlayPause,
      ArrowLeft: (ev: KeyboardEvent) => {
        seekBackwardAction(ev);
      },
      ArrowRight: (ev: KeyboardEvent) => {
        seekForwardAction(ev);
      },
    }),
    [seekBackwardAction, seekForwardAction, togglePlayPause],
  );

  const toggleCreateEventDialog = useCallback(() => {
    pause();
    videoPlayer.pause();
    setCreateEventDialogOpen((open) => !open);
  }, [pause, videoPlayer]);

  const disableControls = presence === PlayerPresence.ERROR;

  // Stopping play when switching routes
  useEffect(() => {
    return () => {
      if (isPlaying) {
        pause();
        videoPlayer.pause();
      }
    };
  }, [isPlaying, pause, videoPlayer]);
  const startTimeC = useMessagePipeline(selectStartTime);
  const endTimeC = useMessagePipeline(selectEndTime);

  const latestStartTime = useLatest(startTimeC);
  const latestEndTime = useLatest(endTimeC);

  const changeSlider = useCallback(
    (fraction: number) => {
      if (!latestStartTime.current || !latestEndTime.current) {
        return;
      }
      seek(
        add(
          latestStartTime.current,
          fromSec(fraction * toSec(subtractTimes(latestEndTime.current, latestStartTime.current))),
        ),
      );
    },
    [seek, latestEndTime, latestStartTime],
  );

  // const [DeleteFlag] = useLazyApi<{ id: string }, unknown>({
  //   method: "DELETE",
  //   path: "http://localhost:5000/delete_flag",
  // });
  const renderFlags = () => {
    // The time when the recording starts
    const startTime = startTimeObj?.nsec;
    // The time when the recording ends.
    const endTime = endTimeObj?.nsec;

    if (startTime == undefined || endTime == undefined || sortedFlags.length === 0) {
      return undefined;
    }

    // Calculate the position of each flag based on its timestamp
    const flagElements = sortedFlags.map((flag) => {
      if (!startTimeObj || !endTimeObj) {
        return;
      }
      const flagTimestamp = flag.timestamp;
      const timeObj = fromSec(flagTimestamp);

      const fraction =
        toSec(subtractTimes(timeObj, startTimeObj)) /
        // flagTimestamp - toSec(startTimeObj) /
        toSec(subtractTimes(endTimeObj, startTimeObj));

      const percentagePosition = fraction * 100;

      return (
        <div
          id={flag.id}
          key={flag.id}
          style={{
            position: "absolute",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            left: `calc(${percentagePosition}% - 10px)`,
            top: 0,
            width: "auto",
            height: "100%",
          }}
        >
          <Flag
            title={flag.title}
            selected={flag.id === selectedFlagId}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              // Setting the slider position
              changeSlider(fraction);
              const id = enqueueSnackbar(
                <>
                  <Typography variant="body1" paddingLeft="0.3rem">
                    Do you want to delete this flag?
                  </Typography>
                  <Button
                    onClick={async () => {
                      if (!fileName) {
                        return;
                      }
                      await DeleteFlag({ id: flag.id });
                      await GetRecordingByName({ name: fileName });
                      closeSnackbar(id);
                    }}
                  >
                    <Typography variant="body1" color={theme.palette.primary.main}>
                      Yes, Delete
                    </Typography>
                  </Button>
                </>,
                {
                  key: flag.id,
                  variant: "default",
                  anchorOrigin: { vertical: "bottom", horizontal: "center" },
                  autoHideDuration: AUTO_HIDE_DURATION,
                  hideIconVariant: true,
                  preventDuplicate: true,
                  SnackbarProps: {
                    style: {
                      transform: `translate(0, -${FOOTER_HEIGHT}px)`,
                    },
                  },
                },
              );
            }}
          />
        </div>
      );
    });

    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>{flagElements}</div>
    );
  };

  const pauseOrPlayIcon = isPlaying ? <PauseOutlinedIcon /> : <PlayArrowOutlinedIcon />;

  return (
    <>
      <RepeatAdapter play={play} seek={seek} repeatEnabled={repeat} />
      <KeyListener global keyDownHandlers={keyDownHandlers} />
      <div className={classes.root}>
        <Stack direction="row" alignItems="center" flex={1} gap={1} overflowX="auto">
          <Stack direction="row" alignItems="center" gap={1}>
            <HoverableIconButton
              className={classes.iconButton}
              disabled={disableControls}
              title="Seek backward"
              icon={<Replay10OutlinedIcon />}
              activeIcon={<Replay10OutlinedIcon />}
              onClick={() => {
                seekBackwardAction();
              }}
            />
            <HoverableIconButton
              className={cx(classes.iconButton, "playPauseButton")}
              disabled={disableControls}
              title={isPlaying ? "Pause" : "Play"}
              onClick={togglePlayPause}
              icon={pauseOrPlayIcon}
              activeIcon={pauseOrPlayIcon}
            />
            <HoverableIconButton
              className={classes.iconButton}
              disabled={disableControls}
              title="Seek forward"
              icon={<Forward10OutlinedIcon />}
              activeIcon={<Forward10OutlinedIcon />}
              onClick={() => {
                seekForwardAction();
              }}
            />
          </Stack>
        </Stack>
        <div className={classes.scrubberContainer}>
          {currentTimeObj && endTimeObj && startTimeObj && (
            <span className={cx(classes.textStyles, { [classes.onPlaying]: isPlaying })}>
              {formatTimeFromSeconds(currentTimeObj.sec - startTimeObj.sec)}
            </span>
          )}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                zIndex: 100,
                pointerEvents: "none",
              }}
            >
              {renderFlags()}
            </div>

            <Scrubber onSeek={seek} isPlaying={isPlaying} />
          </div>

          {currentTimeObj && endTimeObj && startTimeObj && (
            <span className={classes.textStyles}>
              {formatTimeFromSeconds(endTimeObj.sec - startTimeObj.sec)}
            </span>
          )}

          <div>
            <HoverableIconButton
              className={classes.iconButton}
              size="small"
              title="Loop playback"
              color={repeat ? "primary" : "inherit"}
              onClick={toggleRepeat}
              icon={repeat ? <ArrowRepeatAll20Regular /> : <ArrowRepeatAllOff20Regular />}
            />

            <PlaybackSpeedControls />
          </div>
        </div>

        <div className={classes.sizeContainer}>
          {recordingSize && (
            <span className={cx(classes.textStyles, classes.recordingSize)}>{recordingSize}</span>
          )}

          <div ref={containerRef}>
            {loadingAddFlag || loadingGetRecording ? (
              <CircularProgress className={classes.iconButton} />
            ) : (
              <IconButton
                className={classes.iconButton}
                onClick={async () => {
                  if (!data?.id || !currentTimeObj || !startTimeObj || !fileName) {
                    return;
                  }

                  const flagTimeStr = formatTimeFromSeconds(currentTimeObj.sec - startTimeObj.sec);

                  const response = await AddFlag({
                    id: data.id,
                    title: `Flag ${flagTimeStr}`,
                    timestamp: toSec(currentTimeObj),
                    tags: [selectedTagId],
                  });

                  if (response.ok && response.data) {
                    await GetRecordingByName({ name: fileName });
                    const flagData = response.data;

                    enqueueSnackbar(
                      <>
                        <Typography variant="body1" paddingLeft="0.3rem">
                          Added Flag
                        </Typography>

                        <Button
                          onClick={async () => {
                            await DeleteFlag({ id: flagData.id });
                            await GetRecordingByName({ name: fileName });
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
                }}
              >
                <OutlinedFlagIcon htmlColor={selectedTag?.backgroundColor} />
              </IconButton>
            )}
            <TagPicker
              tags={tags}
              selectedValue={selectedTagId}
              onChange={handleChange}
              anchorEl={containerRef}
              iconOnly
            />
          </div>
        </div>
        {createEventDialogOpen && eventsSupported && (
          <CreateEventDialog onClose={toggleCreateEventDialog} />
        )}
      </div>
    </>
  );
}
