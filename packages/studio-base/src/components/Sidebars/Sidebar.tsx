// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import CloseIcon from "@mui/icons-material/Close";
import { Badge, BadgeProps, Divider, IconButton, Tab, Tabs } from "@mui/material";
import { makeStyles } from "tss-react/mui";

import Stack from "@foxglove/studio-base/components/Stack";
import { serif_14px_500 } from "@foxglove/studio-base/util/sharedStyleConstants";

const useStyles = makeStyles()((theme) => ({
  root: {
    boxSizing: "content-box",
    backgroundColor: theme.palette.background.paper,
  },
  badgeRoot: {
    display: "flex",
    alignItems: "baseline",
    fontSize: theme.typography.body1.fontSize,
    textTransform: "uppercase",
    gap: theme.spacing(1),
  },
  badge: {
    fontSize: theme.typography.caption.fontSize,
    padding: theme.spacing(0.125, 0.75),
    borderRadius: 8,
    transform: "none",
    position: "relative",
  },
  badgeInvisible: {
    display: "none",
  },
  anchorRight: {
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
  anchorLeft: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  tabs: {
    height: theme.spacing(8),
    width: "100%",

    ".MuiTab-root": {
      ...serif_14px_500,
      color: theme.palette.greys["dadada"],
      height: theme.spacing(8),
      opacity: 1,

      "&:hover": {
        color: theme.palette.greys["dadada"],
      },

      "&.Mui-selected": {
        color: theme.palette.key.cyan.main,
      },
    },
  },
  iconButton: {
    padding: theme.spacing(0.91125), // round out the overall height to 30px
    color: theme.palette.text.secondary,
    borderRadius: 0,

    ":hover": {
      color: theme.palette.text.primary,
    },
  },
  tabContentContainer: {
    flex: "auto",
    overflow: "auto",
  },
  tabContent: {
    height: "100%",
  },
}));

export type SidebarItem = {
  title: string;
  component: React.ComponentType;
  badge?: {
    color: BadgeProps["color"];
    count: number;
  };
};

export function Sidebar<K extends string>({
  items,
  anchor,
  onClose,
  activeTab,
  setActiveTab,
}: {
  items: Map<K, SidebarItem>;
  anchor: "right" | "left";
  onClose: () => void;
  activeTab: K | undefined;
  setActiveTab: (newValue: K) => void;
}): JSX.Element {
  const { classes, cx } = useStyles();

  return (
    <Stack
      className={cx(classes.root, {
        [classes.anchorLeft]: anchor === "left",
        [classes.anchorRight]: anchor === "right",
      })}
      flexShrink={0}
      overflow="hidden"
      data-tourid={`sidebar-${anchor}`}
    >
      <Stack fullWidth direction="row" justifyContent="space-between" alignItems="center">
        <Tabs
          className={classes.tabs}
          textColor="inherit"
          variant="fullWidth"
          centered
          value={activeTab ?? false}
          onChange={(_ev, newValue: K) => {
            if (newValue !== activeTab) {
              setActiveTab(newValue);
            }
          }}
        >
          {Array.from(items.entries(), ([key, item]) => (
            <Tab
              key={key}
              label={
                <Badge
                  invisible={item.badge == undefined}
                  badgeContent={item.badge?.count}
                  color={item.badge?.color}
                  classes={{
                    root: classes.badgeRoot,
                    badge: classes.badge,
                    invisible: classes.badgeInvisible,
                  }}
                >
                  {item.title}
                </Badge>
              }
              value={key}
              data-testid={`${key}-${anchor}`}
            />
          ))}
        </Tabs>

        {anchor !== "right" && (
          <IconButton
            className={classes.iconButton}
            onClick={onClose}
            size="small"
            data-testid={`sidebar-close-${anchor}`}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        )}
      </Stack>

      <Divider />

      <div className={classes.tabContentContainer}>
        {Array.from(items.entries(), ([key, item]) => {
          const Comp = item.component;
          return (
            <div
              key={key}
              className={classes.tabContent}
              style={{ display: key === activeTab ? "block" : "none" }}
            >
              <Comp />
            </div>
          );
        })}
      </div>
    </Stack>
  );
}
