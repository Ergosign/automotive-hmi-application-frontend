// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import SidebarIcon from "@mui/icons-material/ViewSidebarOutlined";
import WifiIcon from "@mui/icons-material/Wifi";
import { Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "tss-react/mui";

import { AppBarIconButton } from "@foxglove/studio-base/components/AppBar/AppBarIconButton";
import { APP_BAR_HEIGHT } from "@foxglove/studio-base/components/AppBar/constants";
import { NavItem } from "@foxglove/studio-base/components/Navigation/NavItem";
import { NavNotification } from "@foxglove/studio-base/components/Navigation/NavNotification";
import { useCurrentLayoutActions } from "@foxglove/studio-base/context/CurrentLayoutContext";
import { usePlayerSelection } from "@foxglove/studio-base/context/PlayerSelectionContext";
import { useWorkspaceActions } from "@foxglove/studio-base/context/Workspace/useWorkspaceActions";
import { useLazyApi } from "@foxglove/studio-base/hooks/useLazyApi";
import { useRecording } from "@foxglove/studio-base/hooks/useRecording";
import { Recording } from "@foxglove/studio-base/panels/Recordings/Recordings";
import { View } from "@foxglove/studio-base/providers/CurrentLayoutProvider/defaultLayout";
import { useNavigationStore } from "@foxglove/studio-base/stores/useNavigationStore";
import { useRecordingInfoStore } from "@foxglove/studio-base/stores/useRecordingInfoStore";
import { useSettingsStore } from "@foxglove/studio-base/stores/useSettingsStore";
import { useSidebarRightStore } from "@foxglove/studio-base/stores/useSidebarRightStore";

const useStyles = makeStyles()((theme) => ({
  container: {
    display: "grid",
    gridTemplateRows: "auto minmax(185px, 1fr) auto",
    width: "366px",
    height: "100%",
    backgroundColor: theme.palette.common.black,
  },

  navigationListContainer: {
    width: "100%",
    height: "100%",
    overflow: "auto",
  },
  navigationFooterContainer: {
    width: "100%",
    height: "100%",
    overflow: "auto",
  },
  connectionEndIconContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    columnGap: "12px",
  },
  navigationHeaderContainer: {
    display: "flex",
    alignItems: "center",
    height: APP_BAR_HEIGHT,
    color: theme.palette.greys.white,
    padding: "8px",
  },
  appBarIconButton: {
    width: "48px",
    height: "48px",
    padding: "12px",

    svg: {
      width: "100%",
      height: "100%",
    },
  },
  mirrorVertical: {
    transform: "scaleX(-1)",
  },
}));

export const Navigation = (): ReactElement => {
  const { classes, theme } = useStyles();
  const { t } = useTranslation("appBar");
  const recording = useRecording();
  const { recordingInfo } = useRecordingInfoStore();
  const navigationStore = useNavigationStore();
  const { closeSensorsList } = useSidebarRightStore();
  const { isUnsaved, setIsUnsavedDialogOpen, setUnsavedResolver } = useSettingsStore();
  const { sidebarActions } = useWorkspaceActions();
  const { dialogActions } = useWorkspaceActions();
  const player = usePlayerSelection();
  const { changePanelLayout } = useCurrentLayoutActions();

  const [GetRecordings, { data }] = useLazyApi<undefined, Recording[]>({
    method: "GET",
    path: "/get_recordings",
  });

  const [viewToBeChanged, setViewToBeChanged] = useState<View | undefined>();

  useEffect(() => {
    if (viewToBeChanged != undefined && !recordingInfo.recording) {
      changePanelLayout({ layout: viewToBeChanged });
    }
  }, [changePanelLayout, recordingInfo.recording, viewToBeChanged]);

  // Default behavior for layout change
  const changeView = async (view: View) => {
    if (isUnsaved) {
      setIsUnsavedDialogOpen(true);

      await new Promise<void>((resolve) => {
        setUnsavedResolver(resolve);
      });

      setIsUnsavedDialogOpen(false);
    }

    setViewToBeChanged(view);

    sidebarActions.right.setOpen(false);
    navigationStore.close();
    recording.closeRecordingToolbar();

    if (view !== View.LIVE) {
      closeSensorsList();
    }

    // Stop active recording, to prevent endless running recordings.
    if (recording.isRecording) {
      recording.stopRecording();
    }
  };

  useEffect(() => {
    void GetRecordings(undefined);
  }, [GetRecordings]);

  return (
    <div className={classes.container}>
      <div className={classes.navigationHeaderContainer}>
        <AppBarIconButton
          className={classes.appBarIconButton}
          title={t("hideLeftSidebar")}
          aria-label={t("hideLeftSidebar")}
          onClick={() => {
            navigationStore.close();
          }}
          data-tourid="left-sidebar-button"
        >
          <SidebarIcon className={classes.mirrorVertical} />
        </AppBarIconButton>
      </div>

      <div className={classes.navigationListContainer}>
        <NavItem
          label={t("liveView")}
          active={navigationStore.isLiveView}
          onClick={() => {
            void changeView(View.LIVE);
          }}
        />
        <NavItem
          label={t("recordings")}
          endIcon={
            <NavNotification label={data ? (data.length === 0 ? "" : `${data.length}`) : ""} />
          }
          active={navigationStore.isRecordingsView}
          onClick={() => {
            void changeView(View.RECORDINGS);
          }}
        />
      </div>

      <div className={classes.navigationFooterContainer}>
        <NavItem
          label={t("connection")}
          // Displaying Connection Name when there is a connection established.
          endIcon={
            player.selectedSource ? (
              <div className={classes.connectionEndIconContainer}>
                <WifiIcon color="success" />
                <Typography color={theme.palette.success.main}>
                  {player.selectedSource.displayName}
                </Typography>
              </div>
            ) : undefined
          }
          onClick={() => {
            dialogActions.dataSource.open("start");
          }}
        />
        <NavItem
          label={t("settings")}
          active={navigationStore.isSettingsView}
          onClick={() => {
            void changeView(View.SETTINGS);
          }}
        />
      </div>
    </div>
  );
};
