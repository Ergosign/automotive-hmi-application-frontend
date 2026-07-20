// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
// import { Backdrop, MenuItem, Select } from "@mui/material";
// import { MouseEvent, useCallback, useContext, useState } from "react";
import { useContext, useEffect } from "react";
// import { useTranslation } from "react-i18next";
// import { MosaicContext, MosaicNode, MosaicWindowContext } from "react-mosaic-component";
import { makeStyles } from "tss-react/mui";

// import { PanelCatalog, PanelSelection } from "@foxglove/studio-base/components/PanelCatalog";
import { filterMap } from "@foxglove/den/collection";
import {
  MessagePipelineContext,
  useMessagePipeline,
} from "@foxglove/studio-base/components/MessagePipeline";
import PanelContext from "@foxglove/studio-base/components/PanelContext";
// import ChangePanelMenu from "@foxglove/studio-base/components/PanelToolbar/ChangePanelMenu";
// import { useCurrentLayoutActions } from "@foxglove/studio-base/context/CurrentLayoutContext";
// import { getBuiltin } from "@foxglove/studio-base/panels";
import { useCurrentLayoutActions } from "@foxglove/studio-base/context/CurrentLayoutContext";
import { CameraSelection } from "@foxglove/studio-base/panels/Tab/CameraSelection";
import { PanelMenu } from "@foxglove/studio-base/panels/Tab/PanelMenu";
import { PerspectiveSwitcher } from "@foxglove/studio-base/panels/Tab/PerspectiveSwitcher";
import {
  ALL_SUPPORTED_CALIBRATION_SCHEMAS,
  ALL_SUPPORTED_IMAGE_SCHEMAS,
} from "@foxglove/studio-base/panels/ThreeDeeRender/renderables/ImageMode/ImageMode";
import { useCameraStore } from "@foxglove/studio-base/stores/useCameraStore";
import { useNavigationStore } from "@foxglove/studio-base/stores/useNavigationStore";

const useStyles = makeStyles()((theme) => ({
  toolbar: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingInline: "16px 8px",
    alignItems: "center",
    background: theme.palette.grey[500],
    zIndex: 100,
    width: "100%",
    height: "64px",
  },
}));

const selectSortedTopics = (ctx: MessagePipelineContext) => ctx.sortedTopics;

export function Toolbar(): JSX.Element | ReactNull {
  const { changePanelLayout } = useCurrentLayoutActions();
  const {
    changePanelLayout: storeChangePanelLayout,
    setChangePanelLayout,
    isLiveView,
  } = useNavigationStore();

  const topics = useMessagePipeline(selectSortedTopics);
  const { setImageTopics, setCalibrationTopics } = useCameraStore();

  useEffect(() => {
    const imageTopics = filterMap(topics, (topic) => {
      if (!topic.schemaName || !ALL_SUPPORTED_IMAGE_SCHEMAS.has(topic.schemaName)) {
        return;
      }
      return { label: topic.name, value: topic.name };
    });

    setImageTopics(imageTopics);
  }, [topics, setImageTopics]);

  useEffect(() => {
    const calibrationTopics = filterMap(topics, (topic) => {
      if (!topic.schemaName || !ALL_SUPPORTED_CALIBRATION_SCHEMAS.has(topic.schemaName)) {
        return;
      }
      return { label: topic.name, value: topic.name };
    });

    setCalibrationTopics(calibrationTopics);
  }, [topics, setCalibrationTopics]);

  useEffect(() => {
    if (!storeChangePanelLayout) {
      setChangePanelLayout(changePanelLayout);
    }
  }, [changePanelLayout, setChangePanelLayout, storeChangePanelLayout]);

  const panelContext = useContext(PanelContext);
  // const panelActionsStore = usePanelActionsStore();
  const { classes } = useStyles();
  // const { t } = useTranslation("panels");
  // const [menuAnchorEl, setMenuAnchorEl] = useState<undefined | HTMLElement>(undefined);
  // const handleMenuClose = useCallback(() => {
  //   setMenuAnchorEl(undefined);
  // }, []);

  // const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
  //   if (menuAnchorEl !== event.currentTarget) {
  //     setMenuAnchorEl(event.currentTarget);
  //   }
  // };

  // Getting Panel Info to display it correctly in the select component.
  // const panels = getBuiltin(t);

  if (!isLiveView) {
    return ReactNull;
  }

  return (
    <div className={classes.toolbar}>
      {/* <Select
        // eslint-disable-next-line react/forbid-component-props
        sx={{
          ".MuiOutlinedInput-notchedOutline": {
            borderWidth: "0px",
          },
        }}
        open={false}
        readOnly
        onClick={handleMenuClick}
        value={panelContext?.title}
      >
        {panels.map((panelInfo) => {
          return (
            <MenuItem key={panelInfo.title} value={panelInfo.title}>
              {panelInfo.title}
            </MenuItem>
          );
        })}
      </Select> */}
      {panelContext && <PanelMenu panelContext={panelContext} />}
      {panelContext?.type === "3D" && <PerspectiveSwitcher panelContext={panelContext} />}
      {panelContext?.type === "Image" && <CameraSelection panelContext={panelContext} />}
      {/* {panelContext?.title === "3D" &&
        panelActionsStore.currentPanelActionComponent &&
        panelActionsStore.currentPanelActionComponent} */}
      {/* <ChangePanelMenu
        anchorEl={menuAnchorEl}
        onClose={handleMenuClose}
        tabId={panelContext?.tabId}
      />
      <Backdrop open={!!menuAnchorEl} onClick={handleMenuClose} style={{ opacity: 0 }}></Backdrop> */}
    </div>
  );
}
