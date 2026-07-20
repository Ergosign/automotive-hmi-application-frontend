// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

// import assert from "assert";
import { useEffect } from "react";
import { useDebounce } from "use-debounce";

// import Log from "@foxglove/log";
import {
  LayoutState,
  useCurrentLayoutActions,
  useCurrentLayoutSelector,
} from "@foxglove/studio-base/context/CurrentLayoutContext";
// import { LayoutData } from "@foxglove/studio-base/context/CurrentLayoutContext/actions";
// import { usePlayerSelection } from "@foxglove/studio-base/context/PlayerSelectionContext";
// import { defaultLayout } from "@foxglove/studio-base/providers/CurrentLayoutProvider/defaultLayout";
// import { migratePanelsState } from "@foxglove/studio-base/services/migrateLayout";
import { useLazyApi } from "@foxglove/studio-base/hooks/useLazyApi";
import { CameraSetups, useCameraStore } from "@foxglove/studio-base/stores/useCameraStore";
import { Tag, useFlagStore } from "@foxglove/studio-base/stores/useFlagStore";
import { useLayoutDataStore } from "@foxglove/studio-base/stores/useLayoutDataStore";

function selectLayoutData(state: LayoutState) {
  return state.selectedLayout?.data;
}

export function CurrentLayoutLocalStorageSyncAdapter(): JSX.Element {
  // const { selectedSource } = usePlayerSelection();
  const { layoutData, setLayoutData } = useLayoutDataStore();
  const { setCameraSetups } = useCameraStore();
  const { setTags } = useFlagStore();
  const { setCurrentLayout } = useCurrentLayoutActions();

  const [GetCameraSetups, { data: storedCameraSetups }] = useLazyApi<undefined, CameraSetups>({
    method: "GET",
    path: "/get_camera_setups",
  });

  const [GetTags, { data: storedTags }] = useLazyApi<undefined, Tag[]>({
    method: "GET",
    path: "/get_tags",
  });

  useEffect(() => {
    void GetCameraSetups(undefined);
  }, [GetCameraSetups]);

  useEffect(() => {
    void GetTags(undefined);
  }, [GetTags]);

  useEffect(() => {
    if (storedCameraSetups != undefined) {
      setCameraSetups(storedCameraSetups);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedCameraSetups]);

  useEffect(() => {
    if (storedTags != undefined) {
      setTags(storedTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedTags]);

  useEffect(() => {
    setCurrentLayout({ data: layoutData });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentLayoutData = useCurrentLayoutSelector(selectLayoutData);

  const [debouncedLayoutData] = useDebounce(currentLayoutData, 250, { maxWait: 500 });

  useEffect(() => {
    if (!debouncedLayoutData) {
      return;
    }

    setLayoutData(debouncedLayoutData);
  }, [setLayoutData, debouncedLayoutData]);

  return <></>;
}
