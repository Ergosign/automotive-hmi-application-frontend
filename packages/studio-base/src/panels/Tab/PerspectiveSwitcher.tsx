// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import { IconButton } from "@mui/material";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "tss-react/mui";

import { PanelContextType } from "@foxglove/studio-base/components/PanelContext";
import { useCurrentLayoutActions } from "@foxglove/studio-base/context/CurrentLayoutContext";
import {
  PanelStateStore,
  usePanelStateStore,
} from "@foxglove/studio-base/context/PanelStateContext";
import { isEqual } from "@foxglove/studio-base/panels/Tab/utils";
import { CameraState } from "@foxglove/studio-base/panels/ThreeDeeRender/camera";
import { defaultThreeDeeCameraState } from "@foxglove/studio-base/providers/CurrentLayoutProvider/defaultLayout";
import { PanelConfig } from "@foxglove/studio-base/types/panels";
import { serif_14px_500 } from "@foxglove/studio-base/util/sharedStyleConstants";

import RavenIcon from "../../assets/raven-icon.svg";

const useStyles = makeStyles()((theme) => ({
  threeDeePanelViews: {
    ...serif_14px_500,
    color: theme.palette.greys.white,

    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  iconButtonContainer: {
    display: "flex",
    gap: "8px",
  },
  iconButton: {
    position: "relative",
    fontSize: "1rem !important",
    pointerEvents: "auto",
    width: "48px",
    height: "48px",
    padding: "12px",
    borderRadius: 0,
    color: theme.palette.common.white,
    "& svg:not(.MuiSvgIcon-root)": {
      fontSize: "1rem !important",
      width: "100%",
      height: "100%",
    },
  },
  iconButtonActive: {
    background: theme.palette.key.cyan.main,
    color: theme.palette.greys.black,

    "&:hover": {
      background: theme.palette.key.cyan.main,
    },
  },
}));

export type PerspectiveSwitcherProps = {
  panelContext: PanelContextType<PanelConfig>;
};

export const PerspectiveSwitcher: React.FC<PerspectiveSwitcherProps> = ({ panelContext }) => {
  const { classes, cx } = useStyles();
  const { t } = useTranslation("panels");
  const { savePanelConfigs } = useCurrentLayoutActions();
  const selectIncrementSequenceNumber = (store: PanelStateStore) => store.incrementSequenceNumber;
  const incrementSequenceNumber = usePanelStateStore(selectIncrementSequenceNumber);

  const panelId = panelContext.id;
  const panelConfig = panelContext.config;
  const cameraState = panelConfig.cameraState as CameraState | undefined;
  const [perspective, setPerspective] = useState(cameraState?.perspective ?? true);

  const actionHandler = usePanelStateStore((state) => {
    return state.settingsTrees[panelId]?.actionHandler;
  });

  const togglePerspective = useCallback(() => {
    if (!actionHandler) {
      return;
    }

    actionHandler({
      action: "update",
      payload: {
        input: "boolean",
        path: ["cameraState", "perspective"],
        value: !perspective,
      },
    });

    setPerspective(!perspective);
  }, [actionHandler, perspective]);

  const resetCameraPosition = () => {
    const defaultCameraState = {
      ...defaultThreeDeeCameraState,
      perspective,
    };

    if (!isEqual(cameraState, defaultCameraState)) {
      savePanelConfigs({
        configs: [
          {
            id: panelId,
            config: {
              ...panelConfig,
              cameraState: defaultCameraState,
            },
            override: true,
          },
        ],
      });
      incrementSequenceNumber(panelId);
    }
  };

  return (
    <div className={classes.threeDeePanelViews}>
      <span>{t("3DPanel")}</span>
      <div className={classes.iconButtonContainer}>
        <IconButton
          className={cx(classes.iconButton, { [classes.iconButtonActive]: perspective })}
          title={perspective ? "Switch to 2D camera" : "Switch to 3D camera"}
          onClick={!perspective ? togglePerspective : resetCameraPosition}
        >
          <ThreeDRotationIcon />
        </IconButton>
        <IconButton
          className={cx(classes.iconButton, { [classes.iconButtonActive]: !perspective })}
          title={perspective ? "Switch to 2D camera" : "Switch to 3D camera"}
          onClick={perspective ? togglePerspective : resetCameraPosition}
        >
          <RavenIcon />
        </IconButton>
      </div>
    </div>
  );
};
