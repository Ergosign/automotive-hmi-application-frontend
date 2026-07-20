// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, TextField } from "@mui/material";
import memoizeWeak from "memoize-weak";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "tss-react/mui";

import {
  Immutable,
  SettingsIcon,
  SettingsTree,
  SettingsTreeAction,
  SettingsTreeChildren,
  SettingsTreeField,
  SettingsTreeNode,
} from "@foxglove/studio";
import { useConfigById } from "@foxglove/studio-base/PanelAPI";
import { FieldEditor } from "@foxglove/studio-base/components/SettingsTreeEditor/FieldEditor";
import Stack from "@foxglove/studio-base/components/Stack";
import { UserInfo } from "@foxglove/studio-base/components/UserInfo";
import { useSelectedPanels } from "@foxglove/studio-base/context/CurrentLayoutContext";
import { usePanelCatalog } from "@foxglove/studio-base/context/PanelCatalogContext";
import { usePanelStateStore } from "@foxglove/studio-base/context/PanelStateContext";
import { PANEL_TITLE_CONFIG_KEY, getPanelTypeFromId } from "@foxglove/studio-base/util/layout";

import { CustomNodeEditor, NodeEditor } from "./NodeEditor";
import { SensorStatusEntry, useSensorStatus } from "./useSensorStatus";
import { filterTreeNodes, prepareSettingsNodes } from "./utils";

const useStyles = makeStyles()((theme) => ({
  appBar: {
    top: 0,
    marginRight: 1,
    zIndex: theme.zIndex.appBar,
    padding: theme.spacing(0.5),
    position: "sticky",
    backgroundColor: theme.palette.background.paper,
  },
  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto, 20ch) auto",
    paddingLeft: theme.spacing(0.5),
    paddingTop: theme.spacing(1),
    columnGap: theme.spacing(1),
  },
  textField: {
    ".MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
  },
  startAdornment: {
    display: "flex",
  },

  sidebarWrapper: {
    display: "grid",
    padding: `${theme.spacing(2)} ${theme.spacing(1.5)}`,
    gap: theme.spacing(3),
    flexGrow: "1",
  },
}));

const makeStablePath = memoizeWeak((key: string) => [key]);

// 1) GROUP_NAMES als Partial damit values wirklich `string|undefined` sein können
const GROUP_NAMES: Partial<Record<SettingsIcon, string>> = {
  Points: "Lidar",
  ImageProjection: "Image",
  Shapes: "Shapes",
  // später nach Bedarf ergänzen …
};

// Own Settings Tree Editor
export function CustomSettingsTreeEditor({
  settings,
  isVisualizationTab,
}: {
  settings: Immutable<SettingsTree>;
  isVisualizationTab: boolean;
}): JSX.Element {
  const { classes } = useStyles();
  const { actionHandler, focusedPath } = settings;
  const { t } = useTranslation("settingsEditor");
  const sensorStatus = useSensorStatus();

  /** 1) sortierte Liste [key, node] – nur, wenn settings.nodes sich ändern */
  const definedNodes = useMemo(() => prepareSettingsNodes(settings.nodes), [settings.nodes]);

  /** 2) Frame‑Elements nur für SensorsList (isVisualizationTab=false) */
  const frameElements = useMemo(() => {
    if (isVisualizationTab) {
      return [];
    }
    return definedNodes
      .filter(([, node]) => node.label === "Frame")
      .map(([frameKey, frameSettings]) => {
        const frameWithIcon: SettingsTreeNode = {
          ...frameSettings,
          icon: "Frame",
        } as SettingsTreeNode;
        return (
          <CustomNodeEditor
            key={frameKey}
            actionHandler={actionHandler}
            defaultOpen={frameSettings.defaultExpansionState !== "collapsed"}
            filter={undefined}
            focusedPath={focusedPath}
            path={makeStablePath(frameKey)}
            settings={frameWithIcon}
          />
        );
      });
  }, [definedNodes, isVisualizationTab, actionHandler, focusedPath]);

  /** 3) die rohen Children aus dem Topics‑Knoten nur neu holen, wenn definedNodes sich ändert */
  const topicsChildren = useMemo(() => {
    const topicsEntry = definedNodes.find(([, node]) => node.label === "Topics");
    if (!topicsEntry) {
      return {};
    }
    const filteredChildren = filterTreeNodes(topicsEntry[1].children ?? {}, "");
    return filteredChildren as SettingsTreeChildren;
  }, [definedNodes]);

  /** 4) nach Icon gruppieren – nur wenn topicsChildren sich ändert */
  const topicsByIcon = useMemo(() => {
    type GroupMap = Partial<Record<SettingsIcon, [string, SettingsTreeNode][]>>;
    return Object.entries(topicsChildren).reduce<GroupMap>((acc, [path, node]) => {
      if (!node) {
        return acc;
      }
      const icon = node.icon!;
      (acc[icon] ||= []).push([path, node]);
      return acc;
    }, {});
  }, [topicsChildren]);

  /** 5) JSX‑Elemente bauen – nur wenn topicsByIcon oder isVisualizationTab sich ändert */
  const topicGroupElements = useMemo(() => {
    const filteredEntries = (
      Object.entries(topicsByIcon) as [SettingsIcon, [string, SettingsTreeNode][]][]
    ).filter(
      ([iconKey, entries]) =>
        entries.length > 0 && (isVisualizationTab ? iconKey === "Shapes" : iconKey !== "Shapes"),
    );

    return filteredEntries
      .map(([iconKey, entries], index) => {
        const groupName = GROUP_NAMES[iconKey] ?? iconKey;
        const statusMap: Record<string, SensorStatusEntry> = {};

        for (const [childPath] of entries) {
          const status = sensorStatus[childPath];
          if (status) {
            statusMap[childPath] = status;
          }
        }

        const pseudoGroupNode: SettingsTreeNode = {
          ...entries[0],
          label: groupName,
          icon: iconKey,
          children: entries.reduce<SettingsTreeChildren>((cAcc, [childPath, childNode]) => {
            cAcc[childPath] = childNode;
            return cAcc;
          }, {}),
        };

        // Return null instead of ReactNull, and filter it out below
        if (
          !pseudoGroupNode.label ||
          !Object.values(GROUP_NAMES).filter(Boolean).includes(pseudoGroupNode.label)
        ) {
          return undefined;
        }

        return (
          <CustomNodeEditor
            key={iconKey}
            actionHandler={actionHandler}
            defaultOpen={true}
            filter={undefined}
            focusedPath={focusedPath}
            path={makeStablePath("topics")}
            settings={pseudoGroupNode}
            isLastChild={index === filteredEntries.length - 1}
            statusMap={statusMap}
          />
        );
      })
      .filter((element) => element != undefined); // Filter out null entries
  }, [topicsByIcon, isVisualizationTab, actionHandler, focusedPath, sensorStatus]);

  /** 6) Kombiniere frameElements und topicGroupElements zu einem Array */
  const sidebarElements = useMemo(() => {
    return [...frameElements, ...topicGroupElements];
  }, [frameElements, topicGroupElements]);

  /** 7) Return mit dem kombinierten Array und Fallback */
  return (
    <div className={classes.sidebarWrapper}>
      {sidebarElements.length === 0 ? (
        isVisualizationTab ? (
          <UserInfo>{t("noVisualizations")}</UserInfo>
        ) : (
          <UserInfo>{t("noSensors")}</UserInfo>
        )
      ) : (
        sidebarElements
      )}
    </div>
  );
}

export default function SettingsTreeEditor({
  variant,
  settings,
}: {
  variant: "panel" | "log";
  settings: Immutable<SettingsTree>;
}): JSX.Element {
  const { classes } = useStyles();
  const { actionHandler, focusedPath } = settings;
  const [filterText, setFilterText] = useState<string>("");
  const { t } = useTranslation("settingsEditor");

  const filteredNodes = useMemo(() => {
    if (filterText.length > 0) {
      return filterTreeNodes(settings.nodes, filterText);
    } else {
      return settings.nodes;
    }
  }, [settings.nodes, filterText]);

  const definedNodesPanel = useMemo(() => prepareSettingsNodes(filteredNodes), [filteredNodes]);

  const { selectedPanelIds } = useSelectedPanels();
  const selectedPanelId = useMemo(
    () => (selectedPanelIds.length === 1 ? selectedPanelIds[0] : undefined),
    [selectedPanelIds],
  );
  const panelCatalog = usePanelCatalog();
  const panelType = useMemo(
    () => (selectedPanelId != undefined ? getPanelTypeFromId(selectedPanelId) : undefined),
    [selectedPanelId],
  );
  const panelInfo = useMemo(
    () => (panelType != undefined ? panelCatalog.getPanelByType(panelType) : undefined),
    [panelCatalog, panelType],
  );
  const [config, saveConfig] = useConfigById(selectedPanelId);
  const defaultPanelTitle = usePanelStateStore((state) =>
    selectedPanelId ? state.defaultTitles[selectedPanelId] : undefined,
  );
  const customPanelTitle =
    typeof config?.[PANEL_TITLE_CONFIG_KEY] === "string"
      ? config[PANEL_TITLE_CONFIG_KEY]
      : undefined;
  const panelTitleField = useMemo<SettingsTreeField>(
    () => ({
      input: "string",
      label: t("title"),
      placeholder: defaultPanelTitle ?? panelInfo?.title,
      value: customPanelTitle,
    }),
    [customPanelTitle, defaultPanelTitle, panelInfo?.title, t],
  );
  const handleTitleChange = useCallback(
    (action: SettingsTreeAction) => {
      if (action.action === "update" && action.payload.path[0] === PANEL_TITLE_CONFIG_KEY) {
        saveConfig({ [PANEL_TITLE_CONFIG_KEY]: action.payload.value });
      }
    },
    [saveConfig],
  );

  const showTitleField = filterText.length === 0 && panelInfo?.hasCustomToolbar !== true;

  return (
    <Stack fullHeight>
      {settings.enableFilter === true && (
        <header className={classes.appBar}>
          <TextField
            id={`${variant}-settings-filter`}
            variant="filled"
            onChange={(event) => {
              setFilterText(event.target.value);
            }}
            value={filterText}
            className={classes.textField}
            fullWidth
            placeholder={t("searchPanelSettings")}
            inputProps={{
              "data-testid": `${variant}-settings-filter-input`,
            }}
            InputProps={{
              size: "small",
              startAdornment: (
                <label className={classes.startAdornment} htmlFor="settings-filter">
                  <SearchIcon fontSize="small" />
                </label>
              ),
              endAdornment: filterText && (
                <IconButton
                  size="small"
                  title={t("clearSearch")}
                  onClick={() => {
                    setFilterText("");
                  }}
                  edge="end"
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
        </header>
      )}
      <div className={classes.fieldGrid}>
        {showTitleField && (
          <>
            <Stack paddingBottom={0.5} style={{ gridColumn: "span 2" }} />
            <FieldEditor
              field={panelTitleField}
              path={[PANEL_TITLE_CONFIG_KEY]}
              actionHandler={handleTitleChange}
            />
          </>
        )}
        {definedNodesPanel.map(([key, root]) => (
          <NodeEditor
            key={key}
            actionHandler={actionHandler}
            defaultOpen={root.defaultExpansionState === "collapsed" ? false : true}
            filter={filterText}
            focusedPath={focusedPath}
            path={makeStablePath(key)}
            settings={root}
          />
        ))}
      </div>
    </Stack>
  );
}
