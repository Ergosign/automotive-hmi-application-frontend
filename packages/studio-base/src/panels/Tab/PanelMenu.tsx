// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import Check from "@mui/icons-material/Check";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
// import { MosaicContext, MosaicNode, MosaicWindowContext } from "react-mosaic-component";
import { makeStyles } from "tss-react/mui";

// import { PanelSelection } from "@foxglove/studio-base/components/PanelCatalog";
import { SettingsTree } from "@foxglove/studio";
import useConfigById from "@foxglove/studio-base/PanelAPI/useConfigById";
import { PanelContextType } from "@foxglove/studio-base/components/PanelContext";
import {
  useCurrentLayoutActions,
  useSelectedPanels,
} from "@foxglove/studio-base/context/CurrentLayoutContext";
import {
  PanelStateStore,
  usePanelStateStore,
} from "@foxglove/studio-base/context/PanelStateContext";
import { getBuiltin } from "@foxglove/studio-base/panels";
import { isEqual } from "@foxglove/studio-base/panels/Tab/utils";
import {
  createDefaultPanelConfigImage,
  defaultPanelConfigThreeDee,
} from "@foxglove/studio-base/providers/CurrentLayoutProvider/defaultLayout";
import { useCameraStore } from "@foxglove/studio-base/stores/useCameraStore";
import { usePanelActionsStore } from "@foxglove/studio-base/stores/usePanelActionsStore";
import { useSidebarRightStore } from "@foxglove/studio-base/stores/useSidebarRightStore";
import { PanelConfig } from "@foxglove/studio-base/types/panels";
import { getPanelIdForNewType } from "@foxglove/studio-base/util/layout";
import { serif_14px_400 } from "@foxglove/studio-base/util/sharedStyleConstants";

const useStyles = makeStyles()((theme) => ({
  panelMenuButton: {
    "&:hover": {
      background: `${theme.palette.key.cyan.main}1A`,
    },
  },
  panelMenuItem: {
    ...serif_14px_400,
    color: theme.palette.greys.white,

    height: "48px",
    padding: "12px 24px",
    gap: "8px",

    "&:hover": {
      background: `${theme.palette.key.cyan.main}1A`,
    },

    ".MuiListItemIcon-root": {
      aspectRatio: "1 / 1",
      minWidth: "16px",

      svg: {
        width: "16px",
        height: "auto",
      },
    },
  },
  open: {
    background: `${theme.palette.key.cyan.main}1A`,
  },
  arrowRightIcon: {
    height: "24px",
    width: "auto",
  },
}));

export type PanelMenuProps = {
  panelContext: PanelContextType<PanelConfig>;
};

export const PanelMenu: React.FC<PanelMenuProps> = ({ panelContext }) => {
  const { classes, cx } = useStyles();
  const { t } = useTranslation("panels");
  const { isSensorsListOpen, openSensorsList } = useSidebarRightStore();
  const { selectedCameraSetups } = useCameraStore();
  const { getCanResetView, setCanResetView } = usePanelActionsStore();
  const { savePanelConfigs } = useCurrentLayoutActions();
  const [defaultConfig, setDefaultConfig] = useState<PanelConfig>({});
  const [currentConfig] = useConfigById(panelContext.id);
  const selectedCameraSetup = selectedCameraSetups[panelContext.id];
  const { setSelectedPanelIds } = useSelectedPanels();

  useEffect(() => {
    if (selectedCameraSetup) {
      const defaultPanelConfigImage = createDefaultPanelConfigImage(
        selectedCameraSetup.imageTopic,
        selectedCameraSetup.calibrationTopic ?? undefined,
      );
      setDefaultConfig(defaultPanelConfigImage);
    } else {
      // If selectedCameraSetup is undefined, then no image panel is used.
      setDefaultConfig(defaultPanelConfigThreeDee);
    }
  }, [selectedCameraSetup]);

  const currentConfigFiltered = currentConfig
    ? {
        ...currentConfig,
        topics: Object.fromEntries(
          Object.entries(currentConfig.topics ?? {}).filter(
            ([_key, value]) => (value as { visible: boolean }).visible,
          ),
        ),
      }
    : undefined;

  const canResetView = getCanResetView(panelContext.id);
  const isPanelModified = !isEqual(currentConfigFiltered, defaultConfig) || canResetView;

  const resetCanResetView = useCallback(() => {
    if (canResetView) {
      setCanResetView(panelContext.id, false);
    }
  }, [canResetView, panelContext.id, setCanResetView]);

  const selectIncrementSequenceNumber = (store: PanelStateStore) => store.incrementSequenceNumber;
  const incrementSequenceNumber = usePanelStateStore(selectIncrementSequenceNumber);

  const settingsTree = usePanelStateStore((state) => state.settingsTrees[panelContext.id]);

  const EMPTY_SETTINGS_TREE: SettingsTree = Object.freeze({
    actionHandler: () => undefined,
    nodes: {},
  });

  const settings = settingsTree ?? EMPTY_SETTINGS_TREE;

  const { actionHandler } = settings;

  const resetPanel = useCallback(() => {
    closePanelMenu();

    // Reset all topics before the panel is reset
    actionHandler({
      action: "perform-node-action",
      payload: { id: "hide-all", path: ["topics"] },
    });

    // Reset the panel
    savePanelConfigs({
      configs: [{ id: panelContext.id, config: defaultConfig, override: true }],
    });
    incrementSequenceNumber(panelContext.id);

    resetCanResetView();
  }, [
    actionHandler,
    defaultConfig,
    incrementSequenceNumber,
    panelContext.id,
    resetCanResetView,
    savePanelConfigs,
  ]);

  // Panel Menu:
  const [panelMenuAnchorEl, setPanelMenuAnchorEl] = useState<undefined | HTMLElement>(undefined);
  const isPanelMenuOpen = Boolean(panelMenuAnchorEl);
  const openPanelMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPanelMenuAnchorEl(event.currentTarget);
  };
  const closePanelMenu = () => {
    setPanelMenuAnchorEl(undefined);
  };

  // Change Panel Menu:
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<undefined | HTMLElement>(undefined);
  const isSubmenuOpen = Boolean(submenuAnchorEl);
  const openChangePanelMenu = (event: React.MouseEvent<HTMLLIElement>) => {
    setSubmenuAnchorEl(event.currentTarget);
  };
  const closeChangePanelMenu = () => {
    setPanelMenuAnchorEl(undefined);
    setSubmenuAnchorEl(undefined);
  };

  const [anchorOrigin, setAnchorOrigin] = useState({
    vertical: "top" as const,
    horizontal: "right" as "left" | "right",
  });
  const [transformOrigin, setTransformOrigin] = useState({
    vertical: "top" as const,
    horizontal: "left" as "left" | "right",
  });

  useEffect(() => {
    if (submenuAnchorEl) {
      const buttonRect = submenuAnchorEl.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const shouldOpenLeft = buttonRect.right + 128 > viewportWidth;

      setAnchorOrigin({
        vertical: "top",
        horizontal: shouldOpenLeft ? "left" : "right",
      });
      setTransformOrigin({
        vertical: "top",
        horizontal: shouldOpenLeft ? "right" : "left",
      });
    }
  }, [submenuAnchorEl]);

  if (panelContext.title === "Recordings") {
    return ReactNull;
  }

  // Getting Panel Info to display it correctly in the select component.
  const panels = getBuiltin(t);

  const changePanel = (panelType: string) => {
    if (panelType !== panelContext.type) {
      panelContext.replacePanel(panelType, {});

      if (isSensorsListOpen) {
        const newPanelId = getPanelIdForNewType(panelContext.id, panelType);
        setSelectedPanelIds([newPanelId]);
      }

      resetCanResetView();
    }
  };

  const openSidebar = () => {
    closePanelMenu();
    setSelectedPanelIds([panelContext.id]);
    openSensorsList();
  };

  const handleFullscreen = () => {
    if (panelContext.isFullscreen) {
      panelContext.exitFullscreen();
    } else {
      panelContext.enterFullscreen();
    }

    closePanelMenu();
  };

  return (
    <>
      <IconButton
        className={cx(classes.panelMenuButton, { [classes.open]: isPanelMenuOpen })}
        size="large"
        onClick={openPanelMenu}
      >
        <MoreVertIcon fontSize="inherit" />
      </IconButton>
      <Menu
        anchorEl={panelMenuAnchorEl}
        open={isPanelMenuOpen}
        onClose={closePanelMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          className={cx(classes.panelMenuItem, { [classes.open]: isSubmenuOpen })}
          onClick={openChangePanelMenu}
        >
          {t("changePanel")} <ArrowRightIcon className={classes.arrowRightIcon} />
        </MenuItem>
        <Menu
          anchorEl={submenuAnchorEl}
          open={isSubmenuOpen}
          onClose={closeChangePanelMenu}
          anchorOrigin={anchorOrigin}
          transformOrigin={transformOrigin}
        >
          {panels.map((panelInfo) => {
            const { type } = panelInfo;

            if (
              type === "3D" ||
              type === "Image"
              // || type === "Map"
            ) {
              return (
                <MenuItem
                  key={type}
                  className={classes.panelMenuItem}
                  value={type}
                  onClick={(e) => {
                    e.stopPropagation();
                    changePanel(type);
                  }}
                >
                  <ListItemIcon>{type === panelContext.type && <Check />}</ListItemIcon>
                  {type === "3D" ? t("3DPanel") : type}
                </MenuItem>
              );
            } else {
              return;
            }
          })}
        </Menu>

        <MenuItem className={classes.panelMenuItem} onClick={openSidebar}>
          {t("configurePanel")}
        </MenuItem>

        <MenuItem
          className={classes.panelMenuItem}
          onClick={resetPanel}
          disabled={!isPanelModified}
        >
          {t("resetPanel")}
        </MenuItem>

        <MenuItem className={classes.panelMenuItem} onClick={handleFullscreen}>
          {panelContext.isFullscreen ? t("exitFullscreen") : t("enterFullscreen")}
        </MenuItem>
      </Menu>
    </>
  );
};
