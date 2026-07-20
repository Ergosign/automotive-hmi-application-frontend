// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { LayoutData } from "@foxglove/studio-base/context/CurrentLayoutContext";
import { CameraState } from "@foxglove/studio-base/panels/ThreeDeeRender/camera";
import { PanelConfig } from "@foxglove/studio-base/types/panels";

export enum View {
  LIVE = "Tab!live",
  RECORDINGS = "Tab!recordings",
  SETTINGS = "Tab!settings",
}

export enum TabIdx {
  SINGLE_PANEL = 0,
  MULTI_PANEL = 1,
  DUAL_PANEL_HORIZONTAL = 2,
  DUAL_PANEL_VERTICAL = 3,
}

export const defaultThreeDeeCameraState: CameraState = {
  distance: 20,
  perspective: true,
  phi: 60,
  target: [0, 0, 0],
  targetOffset: [0, 0, 0],
  targetOrientation: [0, 0, 0, 1],
  thetaOffset: 45,
  fovy: 45,
  near: 0.5,
  far: 5000,
};

export const defaultPanelConfigThreeDee: PanelConfig = {
  cameraState: defaultThreeDeeCameraState,
  followMode: "follow-pose",
  scene: {},
  transforms: {},
  topics: {},
  layers: {},
  publish: {
    type: "point",
    poseTopic: "/move_base_simple/goal",
    pointTopic: "/clicked_point",
    poseEstimateTopic: "/initialpose",
    poseEstimateXDeviation: 0.5,
    poseEstimateYDeviation: 0.5,
    poseEstimateThetaDeviation: 0.26179939,
  },
  imageMode: {},
};

export const defaultPanelConfigImage: PanelConfig = {
  cameraState: {
    distance: 20,
    perspective: true,
    phi: 60,
    target: [0, 0, 0],
    targetOffset: [0, 0, 0],
    targetOrientation: [0, 0, 0, 1],
    thetaOffset: 45,
    fovy: 45,
    near: 0.5,
    far: 5000,
  },
  followMode: "follow-pose",
  scene: {
    visible: true,
  },
  transforms: {},
  topics: {},
  layers: {},
  publish: {
    type: "point",
    poseTopic: "/move_base_simple/goal",
    pointTopic: "/clicked_point",
    poseEstimateTopic: "/initialpose",
    poseEstimateXDeviation: 0.5,
    poseEstimateYDeviation: 0.5,
    poseEstimateThetaDeviation: 0.26179939,
  },
  imageMode: {
    imageTopic: undefined,
    calibrationTopic: undefined,
    visible: true,
  },
};

export function createDefaultPanelConfigImage(
  imageTopic?: string,
  // eslint-disable-next-line no-restricted-syntax
  calibrationTopic?: string | null,
): PanelConfig {
  return {
    cameraState: {
      distance: 20,
      perspective: true,
      phi: 60,
      target: [0, 0, 0],
      targetOffset: [0, 0, 0],
      targetOrientation: [0, 0, 0, 1],
      thetaOffset: 45,
      fovy: 45,
      near: 0.5,
      far: 5000,
    },
    followMode: "follow-pose",
    scene: {
      visible: true,
    },
    transforms: {},
    topics: {},
    layers: {},
    publish: {
      type: "point",
      poseTopic: "/move_base_simple/goal",
      pointTopic: "/clicked_point",
      poseEstimateTopic: "/initialpose",
      poseEstimateXDeviation: 0.5,
      poseEstimateYDeviation: 0.5,
      poseEstimateThetaDeviation: 0.26179939,
    },
    imageMode: {
      imageTopic,
      calibrationTopic,
      visible: true,
    },
  };
}

export const initLayoutData: LayoutData = {
  configById: {
    "3D!main": structuredClone(defaultPanelConfigThreeDee),
    "3D!topLeft": structuredClone(defaultPanelConfigThreeDee),
    "3D!topCenter": structuredClone(defaultPanelConfigThreeDee),
    "3D!topRight": structuredClone(defaultPanelConfigThreeDee),
    "Image!main": structuredClone(defaultPanelConfigImage),
    "Image!topLeft": structuredClone(defaultPanelConfigImage),
    "Image!topCenter": structuredClone(defaultPanelConfigImage),
    "Image!topRight": structuredClone(defaultPanelConfigImage),
    "Tab!live": {
      activeTabIdx: TabIdx.SINGLE_PANEL,
      tabs: [
        {
          title: "Single-Panel",
          layout: "3D!main",
        },
        {
          title: "Multi-Panel",
          layout: {
            first: {
              first: "Image!topLeft",
              second: {
                first: "Image!topCenter",
                second: "Image!topRight",
                direction: "row",
                splitPercentage: 50,
              },
              direction: "row",
              splitPercentage: 33.333,
            },
            second: "3D!main",
            direction: "column",
            splitPercentage: 30,
          },
        },
        {
          title: "Dual-Panel (Horizontal)",
          layout: {
            first: "3D!main",
            second: "Image!topCenter",
            direction: "row",
            splitPercentage: 50,
          },
        },
        {
          title: "Dual-Panel (Vertical)",
          layout: {
            first: "Image!topCenter",
            second: "3D!main",
            direction: "column",
            splitPercentage: 50,
          },
        },
      ],
    },
    "Tab!recordings": {
      activeTabIdx: 0,
      tabs: [
        {
          title: "Recordings",
          layout: "Recordings",
        },
      ],
    },
    "Tab!settings": {
      activeTabIdx: 0,
      tabs: [
        {
          title: "Settings",
          layout: "Settings",
        },
      ],
    },
  },
  globalVariables: {},
  userNodes: {},
  playbackConfig: {
    speed: 1,
  },
  layout: View.LIVE,
};
