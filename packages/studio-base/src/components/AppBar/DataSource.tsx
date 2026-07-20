// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { ErrorCircle20Filled } from "@fluentui/react-icons";
import WifiIcon from "@mui/icons-material/Wifi";
import {
  CircularProgress,
  FormControl,
  IconButton,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MosaicParent } from "react-mosaic-component";
import { makeStyles } from "tss-react/mui";

import useConfigById from "@foxglove/studio-base/PanelAPI/useConfigById";
import { ListItemIcon } from "@foxglove/studio-base/components/ListItemIcon";
import { MenuItem } from "@foxglove/studio-base/components/MenuItem";
import {
  MessagePipelineContext,
  useMessagePipeline,
} from "@foxglove/studio-base/components/MessagePipeline";
import Stack from "@foxglove/studio-base/components/Stack";
import WssErrorModal from "@foxglove/studio-base/components/WssErrorModal";
import {
  useCurrentLayoutActions,
  useSelectedPanels,
} from "@foxglove/studio-base/context/CurrentLayoutContext";
import { usePlayerSelection } from "@foxglove/studio-base/context/PlayerSelectionContext";
import { useWorkspaceActions } from "@foxglove/studio-base/context/Workspace/useWorkspaceActions";
import { PlayerPresence } from "@foxglove/studio-base/players/types";
import { TabIdx, View } from "@foxglove/studio-base/providers/CurrentLayoutProvider/defaultLayout";
import { useNavigationStore } from "@foxglove/studio-base/stores/useNavigationStore";
import { useRecordingInfoStore } from "@foxglove/studio-base/stores/useRecordingInfoStore";
import { TabPanelConfig } from "@foxglove/studio-base/types/layouts";
import { serif_14px_500 } from "@foxglove/studio-base/util/sharedStyleConstants";

const ICON_SIZE = 18;

const useStyles = makeStyles<void, "adornmentError">()((theme, _params, _classes) => ({
  sourceName: {
    font: "inherit",
    fontSize: theme.typography.body2.fontSize,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    padding: theme.spacing(1.5),
    paddingInlineEnd: theme.spacing(0.75),
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  adornment: {
    display: "flex",
    flex: "none",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    color: theme.palette.appBar.primary,
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  adornmentError: {
    color: theme.palette.error.main,
  },
  spinner: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    margin: "auto",
  },
  iconButton: {
    padding: 0,
    position: "relative",
    zIndex: 1,
    fontSize: ICON_SIZE - 2,

    "svg:not(.MuiSvgIcon-root)": {
      fontSize: "1rem",
    },
  },
  path: {
    ...serif_14px_500,
    color: theme.palette.greys.white,
  },
  panelDropdown: {
    ".MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    "&:has(.MuiSelect-iconOpen)": {
      background: `${theme.palette.key.cyan.main}1A`,
    },
  },
}));

const selectPlayerPresence = (ctx: MessagePipelineContext) => ctx.playerState.presence;
const selectPlayerProblems = (ctx: MessagePipelineContext) => ctx.playerState.problems;
const selectSeek = (ctx: MessagePipelineContext) => ctx.seekPlayback;

export function DataSource(): JSX.Element {
  const { t } = useTranslation("appBar");
  const { classes, cx } = useStyles();
  const player = usePlayerSelection();
  const { currentPanelTitle, isLiveView, localFileName } = useNavigationStore();
  const { recordingInfo } = useRecordingInfoStore();
  const { setSelectedPanelIds } = useSelectedPanels();
  const { getCurrentLayoutState } = useCurrentLayoutActions();
  const currentLayoutState = getCurrentLayoutState();
  const [_config, saveConfig] = useConfigById(View.LIVE);

  const activeTabIdx = useMemo(() => {
    return currentLayoutState.selectedLayout?.data?.configById[View.LIVE]?.activeTabIdx as TabIdx;
  }, [currentLayoutState.selectedLayout?.data?.configById]);

  const playerPresence = useMessagePipeline(selectPlayerPresence);
  const playerProblems = useMessagePipeline(selectPlayerProblems) ?? [];
  const seek = useMessagePipeline(selectSeek);

  const { sidebarActions } = useWorkspaceActions();

  // A crude but correct proxy (for our current architecture) for whether a connection is live
  const isLiveConnection = seek == undefined;
  const isLocalFile = player.selectedSource?.displayName === "MCAP";

  const getLayoutText = (selectedTab: TabIdx | undefined) => {
    switch (selectedTab) {
      case TabIdx.SINGLE_PANEL:
        return t("singlePanel");
      case TabIdx.MULTI_PANEL:
        return t("multiPanel");
      case TabIdx.DUAL_PANEL_HORIZONTAL:
        return t("dualPanelHorizontal");
      case TabIdx.DUAL_PANEL_VERTICAL:
        return t("dualPanelVertical");
      default:
        return t("unknownLayout");
    }
  };

  const getPath = (selectedTab?: TabIdx): string => {
    const layoutText = getLayoutText(selectedTab);

    switch (currentPanelTitle) {
      case t("recordings"):
        return t("recordings");
      case t("settings"):
        return t("settings");
      default:
        if (!isLiveConnection) {
          if (isLocalFile) {
            const fileName = localFileName ? localFileName : "Unknown File";
            return `${t("localFile")} / ${fileName} / ${layoutText}`;
          } else {
            return `${t("recordings")} / ${recordingInfo.file_name} / ${layoutText}`;
          }
        }

        return `${t("liveView")} / ${layoutText}`;
    }
  };

  const handleChange = (event: SelectChangeEvent) => {
    saveConfig({ activeTabIdx: event.target.value });
  };

  useEffect(() => {
    const tabPanelConfig = currentLayoutState.selectedLayout?.data?.configById["Tab!live"] as
      | TabPanelConfig
      | undefined;
    const currentTab = tabPanelConfig?.tabs[activeTabIdx];
    const panelIdToBeSelected =
      activeTabIdx === TabIdx.MULTI_PANEL
        ? (currentTab?.layout as MosaicParent<string>).second
        : currentTab?.layout;

    if (panelIdToBeSelected != undefined) {
      setSelectedPanelIds([panelIdToBeSelected as string]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabIdx]);

  const reconnecting = playerPresence === PlayerPresence.RECONNECTING;
  const initializing = playerPresence === PlayerPresence.INITIALIZING;
  const error =
    playerPresence === PlayerPresence.ERROR ||
    playerProblems.some((problem) => problem.severity === "error");
  const loading = reconnecting || initializing;

  if (playerPresence === PlayerPresence.NOT_PRESENT) {
    return <div className={classes.sourceName}>{t("noDataSource")}</div>;
  }

  return (
    <>
      <WssErrorModal playerProblems={playerProblems} />
      <Stack direction="row" alignItems="center" gap={1}>
        <WifiIcon color="success" />

        {!isLiveView ? (
          <span className={classes.path}>{getPath()}</span>
        ) : (
          <FormControl className={classes.panelDropdown}>
            <Select
              value={activeTabIdx.toString()}
              renderValue={(selectedTab) => {
                return <span className={classes.path}>{getPath(Number(selectedTab))}</span>;
              }}
              onChange={handleChange}
            >
              <MenuItem value={TabIdx.SINGLE_PANEL}>
                <ListItemIcon selected={activeTabIdx === TabIdx.SINGLE_PANEL} />
                {t("singlePanel")}
              </MenuItem>
              <MenuItem value={TabIdx.MULTI_PANEL}>
                <ListItemIcon selected={activeTabIdx === TabIdx.MULTI_PANEL} />
                {t("multiPanel")}
              </MenuItem>
              <MenuItem value={TabIdx.DUAL_PANEL_HORIZONTAL}>
                <ListItemIcon selected={activeTabIdx === TabIdx.DUAL_PANEL_HORIZONTAL} />
                {t("dualPanelHorizontal")}
              </MenuItem>
              <MenuItem value={TabIdx.DUAL_PANEL_VERTICAL}>
                <ListItemIcon selected={activeTabIdx === TabIdx.DUAL_PANEL_VERTICAL} />
                {t("dualPanelVertical")}
              </MenuItem>
            </Select>
          </FormControl>
        )}

        <div className={cx(classes.adornment, { [classes.adornmentError]: error })}>
          {loading && (
            <CircularProgress
              size={ICON_SIZE}
              color="inherit"
              className={classes.spinner}
              variant="indeterminate"
            />
          )}
          {error && (
            <IconButton
              color="inherit"
              className={classes.iconButton}
              onClick={() => {
                sidebarActions.left.setOpen(true);
                sidebarActions.left.selectItem("problems");
              }}
            >
              <ErrorCircle20Filled />
            </IconButton>
          )}
        </div>
      </Stack>
    </>
  );
}
