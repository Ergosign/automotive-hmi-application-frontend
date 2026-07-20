// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
import { PanelLeft24Filled, PanelLeft24Regular } from "@fluentui/react-icons";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LayersIcon from "@mui/icons-material/Layers";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import SidebarIcon from "@mui/icons-material/ViewSidebarOutlined";
import { Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "tss-react/mui";

import { AppSetting } from "@foxglove/studio-base/AppSetting";
import { AppBarIconButton } from "@foxglove/studio-base/components/AppBar/AppBarIconButton";
import { AppMenu } from "@foxglove/studio-base/components/AppBar/AppMenu";
import {
  CustomWindowControls,
  CustomWindowControlsProps,
} from "@foxglove/studio-base/components/AppBar/CustomWindowControls";
import { AUTO_HIDE_DURATION } from "@foxglove/studio-base/components/AppBar/constants";
import { BetaAppMenu } from "@foxglove/studio-base/components/BetaAppMenu";
import { MemoryUseIndicator } from "@foxglove/studio-base/components/MemoryUseIndicator";
import Stack from "@foxglove/studio-base/components/Stack";
// import { useAnalytics } from "@foxglove/studio-base/context/AnalyticsContext";
import { useAppContext } from "@foxglove/studio-base/context/AppContext";
// import { LayoutState } from "@foxglove/studio-base/context/CurrentLayoutContext";
// import { useCurrentUser } from "@foxglove/studio-base/context/CurrentUserContext";
import { usePlayerSelection } from "@foxglove/studio-base/context/PlayerSelectionContext";
import {
  WorkspaceContextStore,
  useWorkspaceStoreWithShallowSelector,
} from "@foxglove/studio-base/context/Workspace/WorkspaceContext";
import { useAppConfigurationValue } from "@foxglove/studio-base/hooks";
//import { AppEvent } from "@foxglove/studio-base/services/IAnalytics";
import { useRecording } from "@foxglove/studio-base/hooks/useRecording";
import { useMemoryStore } from "@foxglove/studio-base/stores/useMemoryStore";
import { useNavigationStore } from "@foxglove/studio-base/stores/useNavigationStore";
import { useSettingsStore } from "@foxglove/studio-base/stores/useSettingsStore";
import { useSidebarRightStore } from "@foxglove/studio-base/stores/useSidebarRightStore";

import { AddPanelMenu } from "./AddPanelMenu";
import { AppBarContainer } from "./AppBarContainer";
import { DataSource } from "./DataSource";
import { UserMenu } from "./UserMenu";
import FlagList from "../../assets/flag-list.svg";

const useStyles = makeStyles<{ debugDragRegion?: boolean }>()((
  theme,
  { debugDragRegion = false },
) => {
  const NOT_DRAGGABLE_STYLE: Record<string, string> = { WebkitAppRegion: "no-drag" };
  if (debugDragRegion) {
    NOT_DRAGGABLE_STYLE.backgroundColor = "red";
  }
  return {
    toolbar: {
      display: "grid",
      width: "100%",
      gridTemplateAreas: `"start middle end"`,
      height: "100%",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",
      background: theme.palette.common.black,
      padding: "8px",
    },
    // logo: {
    //   padding: theme.spacing(0.75, 0.5),
    //   fontSize: "2rem",
    //   color: theme.palette.appBar.primary,
    //   borderRadius: 0,

    //   "svg:not(.MuiSvgIcon-root)": {
    //     fontSize: "1em",
    //   },
    //   "&:hover": {
    //     backgroundColor: tc(theme.palette.common.white).setAlpha(0.08).toRgbString(),
    //   },
    //   "&.Mui-selected": {
    //     backgroundColor: theme.palette.appBar.primary,
    //     color: theme.palette.common.white,
    //   },
    //   "&.Mui-disabled": {
    //     color: "currentColor",
    //     opacity: theme.palette.action.disabledOpacity,
    //   },
    // },
    // dropDownIcon: {
    //   fontSize: "12px !important",
    // },
    start: {
      gridArea: "start",
      display: "flex",
      flex: 1,
      alignItems: "center",
    },
    startInner: {
      display: "flex",
      alignItems: "center",
      ...NOT_DRAGGABLE_STYLE, // make buttons clickable for desktop app
    },
    middle: {
      gridArea: "middle",
      justifySelf: "center",
      overflow: "hidden",
      maxWidth: "100%",
      ...NOT_DRAGGABLE_STYLE, // make buttons clickable for desktop app
    },
    end: {
      gridArea: "end",
      flex: 1,
      display: "flex",
      justifyContent: "flex-end",
    },
    endInner: {
      display: "flex",
      alignItems: "center",
      ...NOT_DRAGGABLE_STYLE, // make buttons clickable for desktop app
    },
    appBarIconButtonContainer: {
      display: "flex",
      gap: "8px",
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

    // tooltip: {
    //   marginTop: `${theme.spacing(0.5)} !important`,
    // },
    // avatar: {
    //   color: theme.palette.common.white,
    //   backgroundColor: tc(theme.palette.appBar.main).lighten().toString(),
    //   height: theme.spacing(3.5),
    //   width: theme.spacing(3.5),
    // },
    // iconButton: {
    //   padding: theme.spacing(1),
    //   borderRadius: 0,

    //   "&:hover": {
    //     backgroundColor: tc(theme.palette.common.white).setAlpha(0.08).toString(),

    //     [`.${classes.avatar}`]: {
    //       backgroundColor: tc(theme.palette.appBar.main).lighten(20).toString(),
    //     },
    //   },
    //   "&.Mui-selected": {
    //     backgroundColor: theme.palette.appBar.primary,

    //     [`.${classes.avatar}`]: {
    //       backgroundColor: tc(theme.palette.appBar.main).setAlpha(0.3).toString(),
    //     },
    //   },
    // },
    // button: {
    //   marginInline: theme.spacing(1),
    //   backgroundColor: theme.palette.appBar.primary,

    //   "&:hover": {
    //     backgroundColor: theme.palette.augmentColor({
    //       color: { main: theme.palette.appBar.primary as string },
    //     }).dark,
    //   },
    // },
  };
});

type AppBarProps = CustomWindowControlsProps & {
  leftInset?: number;
  onDoubleClick?: () => void;
  debugDragRegion?: boolean;
  // disableSignIn?: boolean;
};

// const selectHasCurrentLayout = (state: LayoutState) => state.selectedLayout != undefined;
const selectWorkspace = (store: WorkspaceContextStore) => store;

export function AppBar(props: AppBarProps): JSX.Element {
  const {
    debugDragRegion,
    // disableSignIn = false,
    isMaximized,
    leftInset,
    onCloseWindow,
    onDoubleClick,
    onMaximizeWindow,
    onMinimizeWindow,
    onUnmaximizeWindow,
    showCustomWindowControls = false,
  } = props;
  const { classes } = useStyles({ debugDragRegion });
  //const { currentUser, signIn } = useCurrentUser();
  const { t } = useTranslation("appBar");
  const { enqueueSnackbar } = useSnackbar();

  const memoryStore = useMemoryStore();
  const { open, isOpen, backButtonClicked, isLiveView } = useNavigationStore();
  const { toastMessage, setToastMessage } = useSettingsStore();

  const { appBarLayoutButton } = useAppContext();
  const playerSelection = usePlayerSelection();

  // const analytics = useAnalytics();
  const [enableMemoryUseIndicator = false] = useAppConfigurationValue<boolean>(
    AppSetting.ENABLE_MEMORY_USE_INDICATOR,
  );
  const [enableNewAppMenu = false] = useAppConfigurationValue<boolean>(
    AppSetting.ENABLE_NEW_APP_MENU,
  );

  // const hasCurrentLayout = useCurrentLayoutSelector(selectHasCurrentLayout);

  const { isRecording, isRecordingToolbarOpen, toggleRecordingToolbar } = useRecording();

  const {
    sidebars: {
      left: { open: leftSidebarOpen },
    },
  } = useWorkspaceStoreWithShallowSelector(selectWorkspace);

  const [appMenuEl, setAppMenuEl] = useState<undefined | HTMLElement>(undefined);
  const [userAnchorEl, setUserAnchorEl] = useState<undefined | HTMLElement>(undefined);
  const [panelAnchorEl, setPanelAnchorEl] = useState<undefined | HTMLElement>(undefined);

  const {
    isSensorsListOpen,
    closeSensorsList,
    toggleSensorsList,
    isFlagsListOpen,
    toggleFlagsList,
    closeSidebarRight,
  } = useSidebarRightStore();

  const appMenuOpen = Boolean(appMenuEl);
  const userMenuOpen = Boolean(userAnchorEl);
  const panelMenuOpen = Boolean(panelAnchorEl);

  useEffect(() => {
    if (playerSelection.selectedSource?.id) {
      closeSidebarRight();
    }
  }, [closeSidebarRight, playerSelection.selectedSource?.id]);

  useEffect(() => {
    if (toastMessage) {
      enqueueSnackbar(
        <Typography variant="body1" paddingLeft="0.3rem">
          {toastMessage}
        </Typography>,
        {
          variant: "default",
          hideIconVariant: true,
          autoHideDuration: AUTO_HIDE_DURATION,
          anchorOrigin: { horizontal: "center", vertical: "bottom" },
          onClose: () => {
            setToastMessage(undefined);
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toastMessage]);

  return (
    <>
      <AppBarContainer onDoubleClick={onDoubleClick} leftInset={leftInset}>
        <div className={classes.toolbar}>
          <div className={classes.start}>
            <div className={classes.startInner}>
              {playerSelection.selectedSource?.id !== "remote-file" && (
                <AppBarIconButton
                  className={classes.appBarIconButton}
                  title={leftSidebarOpen ? t("hideLeftSidebar") : t("showLeftSidebar")}
                  aria-label={`${leftSidebarOpen ? t("hideLeftSidebar") : t("showLeftSidebar")}`}
                  onClick={() => {
                    open();
                    // sidebarActions.left.setOpen(!leftSidebarOpen);
                  }}
                  data-tourid="left-sidebar-button"
                >
                  <SidebarIcon className={classes.mirrorVertical} />
                </AppBarIconButton>
              )}

              {playerSelection.selectedSource?.id === "remote-file" && (
                <AppBarIconButton
                  className={classes.appBarIconButton}
                  title={t("backToRecordings")}
                  aria-label={t("backToRecordings")}
                  onClick={() => {
                    if (!memoryStore.selectSource) {
                      return;
                    }
                    memoryStore.selectSource("foxglove-websocket", {
                      type: "connection",
                      params: { url: window.configuration.ROS_NODE_URL },
                    });
                    // sidebarActions.left.setOpen(!leftSidebarOpen);
                    backButtonClicked();
                  }}
                  data-tourid="back-to-recordings-button"
                >
                  <ArrowBackIcon data-tourid="left-sidebar-button">
                    {isOpen ? <PanelLeft24Filled /> : <PanelLeft24Regular />}
                  </ArrowBackIcon>
                </AppBarIconButton>
              )}

              {/* <IconButton
                className={cx(classes.logo, { "Mui-selected": appMenuOpen })}
                color="inherit"
                id="app-menu-button"
                title="Menu"
                aria-controls={appMenuOpen ? "app-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={appMenuOpen ? "true" : undefined}
                data-tourid="app-menu-button"
                onClick={(event) => {
                  setAppMenuEl(event.currentTarget);
                }}
              >
                <FoxgloveLogo fontSize="inherit" color="inherit" />
                <ChevronDown12Regular
                  className={classes.dropDownIcon}
                  primaryFill={theme.palette.common.white}
                />
              </IconButton> */}
              {enableNewAppMenu ? (
                <BetaAppMenu
                  open={appMenuOpen}
                  anchorEl={appMenuEl}
                  handleClose={() => {
                    setAppMenuEl(undefined);
                  }}
                />
              ) : (
                <AppMenu
                  open={appMenuOpen}
                  anchorEl={appMenuEl}
                  handleClose={() => {
                    setAppMenuEl(undefined);
                  }}
                />
              )}
            </div>
          </div>

          <div className={classes.middle}>
            <DataSource />
          </div>

          <div className={classes.end}>
            <div className={classes.endInner}>
              {enableMemoryUseIndicator && <MemoryUseIndicator />}
              {appBarLayoutButton}
              <Stack direction="row" alignItems="center" data-tourid="sidebar-button-group">
                {isLiveView && (
                  <div className={classes.appBarIconButtonContainer}>
                    {playerSelection.selectedSource?.id === "foxglove-websocket" && (
                      <AppBarIconButton
                        className={classes.appBarIconButton}
                        selected={isRecordingToolbarOpen}
                        title={!isRecordingToolbarOpen ? "Open Recording" : "Close Recording"}
                        onClick={() => {
                          toggleRecordingToolbar();

                          if (!isRecordingToolbarOpen) {
                            closeSensorsList();
                          }
                        }}
                      >
                        <RadioButtonCheckedIcon
                          color={
                            isRecording ? "error" : isRecordingToolbarOpen ? "primary" : undefined
                          }
                        />
                      </AppBarIconButton>
                    )}

                    {playerSelection.selectedSource?.id === "remote-file" && (
                      <AppBarIconButton
                        className={classes.appBarIconButton}
                        selected={isFlagsListOpen}
                        title={isFlagsListOpen ? "Close Flags List" : "Open Flags List"}
                        onClick={() => {
                          toggleFlagsList();
                        }}
                      >
                        <FlagList color={isFlagsListOpen ? "#51B5FF" : undefined} />
                      </AppBarIconButton>
                    )}

                    <AppBarIconButton
                      className={classes.appBarIconButton}
                      selected={isSensorsListOpen}
                      title={isSensorsListOpen ? "Close Sensors List" : "Open Sensors List"}
                      onClick={() => {
                        toggleSensorsList();
                      }}
                    >
                      {isSensorsListOpen ? <LayersIcon color="primary" /> : <LayersOutlinedIcon />}
                    </AppBarIconButton>
                  </div>
                )}
              </Stack>
              {showCustomWindowControls && (
                <CustomWindowControls
                  onMinimizeWindow={onMinimizeWindow}
                  isMaximized={isMaximized}
                  onUnmaximizeWindow={onUnmaximizeWindow}
                  onMaximizeWindow={onMaximizeWindow}
                  onCloseWindow={onCloseWindow}
                />
              )}
            </div>
          </div>
        </div>
      </AppBarContainer>
      <AddPanelMenu
        anchorEl={panelAnchorEl}
        open={panelMenuOpen}
        handleClose={() => {
          setPanelAnchorEl(undefined);
        }}
      />
      <UserMenu
        anchorEl={userAnchorEl}
        open={userMenuOpen}
        handleClose={() => {
          setUserAnchorEl(undefined);
        }}
      />
    </>
  );
}
