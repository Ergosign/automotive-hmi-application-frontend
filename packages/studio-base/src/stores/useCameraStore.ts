// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { SettingsTreeAction } from "@foxglove/studio";

type TopicBase<T> = {
  label: string;
  value: T;
};

export type ImageTopic = TopicBase<string>;
export type CalibrationTopic = TopicBase<string | undefined>;

export type CameraSetupBase = {
  displayName: string;
  imageTopic: string;
  // eslint-disable-next-line no-restricted-syntax
  calibrationTopic: string | null;
}

export type CameraSetup = CameraSetupBase & {
  id: string;
};

export type BaseCameraSetups = CameraSetupBase[];

export type CameraSetups = CameraSetup[];

type OptionalCameraSetup = CameraSetup | undefined;

export type SelectedCameraSetups = {
  [panelId: string]: OptionalCameraSetup;
};

export type CameraStore = {
  imageTopics: ImageTopic[];
  setImageTopics: (imageTopics: ImageTopic[]) => void;

  calibrationTopics: CalibrationTopic[];
  setCalibrationTopics: (calibrationTopics: CalibrationTopic[]) => void;

  cameraSetups: CameraSetups;
  setCameraSetups: (cameraSetups: CameraSetups) => void;

  selectedCameraSetups: SelectedCameraSetups;
  setSelectedCameraSetups: (
    panelId: string,
    cameraSetup: OptionalCameraSetup,
    actionHandler?: (action: SettingsTreeAction) => void,
  ) => void;
};

export const useCameraStore = create<CameraStore>()(
  persist(
    (set) => ({
      imageTopics: [] as ImageTopic[],
      setImageTopics: (imageTopics) => {
        set(() => ({ imageTopics }));
      },

      calibrationTopics: [] as CalibrationTopic[],
      setCalibrationTopics: (calibrationTopics) => {
        set(() => ({ calibrationTopics }));
      },

      cameraSetups: [] as CameraSetups,
      setCameraSetups: (cameraSetups) => {
        set(() => ({ cameraSetups }));
      },

      selectedCameraSetups: {
        ["Image!main"]: undefined,
        ["Image!topLeft"]: undefined,
        ["Image!topCenter"]: undefined,
        ["Image!topRight"]: undefined,
      },
      setSelectedCameraSetups: (panelId, cameraSetup, actionHandler) => {
        set((state) => {
          if (actionHandler) {
            actionHandler({
              action: "update",
              payload: {
                path: ["imageMode", "imageTopic"],
                input: "select",
                value: cameraSetup?.imageTopic,
              },
            });

            actionHandler({
              action: "update",
              payload: {
                path: ["imageMode", "calibrationTopic"],
                input: "select",
                value: cameraSetup?.calibrationTopic ?? undefined,
              },
            });
          }

          return {
            selectedCameraSetups: {
              ...state.selectedCameraSetups,
              [panelId]: cameraSetup,
            },
          };
        });
      },
    }),
    {
      name: "camera-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
