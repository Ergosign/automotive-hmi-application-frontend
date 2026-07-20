// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useMemo, useRef } from "react";

import { CustomSettingsTreeEditor } from "@foxglove/studio-base/components/SettingsTreeEditor";
import Stack from "@foxglove/studio-base/components/Stack";
import { useSelectedPanels } from "@foxglove/studio-base/context/CurrentLayoutContext";
import { usePanelStateStore } from "@foxglove/studio-base/context/PanelStateContext";

export default function SensorsList(): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(ReactNull);
  const { selectedPanelIds } = useSelectedPanels();
  const selectedPanelId = useMemo(
    () => (selectedPanelIds.length === 1 ? selectedPanelIds[0] : undefined),
    [selectedPanelIds],
  );
  const settingsTree = usePanelStateStore((state) =>
    selectedPanelId ? state.settingsTrees[selectedPanelId] : undefined,
  );

  const editor = useMemo(() => {
    if (!settingsTree) {
      return undefined;
    }
    return <CustomSettingsTreeEditor settings={settingsTree} isVisualizationTab={false} />;
  }, [settingsTree]);

  return <Stack ref={rootRef}>{editor}</Stack>;
}
