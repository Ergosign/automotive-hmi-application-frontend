// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { MenuItem as MuiMenuItem, MenuItemProps as MuiMenuItemProps } from "@mui/material";
import { makeStyles } from "tss-react/mui";

import { serif_14px_500 } from "@foxglove/studio-base/util/sharedStyleConstants";

const useStyles = makeStyles()((theme) => ({
  menuItem: {
    ...serif_14px_500,
    color: theme.palette.greys.white,
    padding: `${theme.spacing(1.5)} ${theme.spacing(3)}`,
    gap: theme.spacing(1),

    "&.MuiMenuItem-root": {
      background: "none !important",

      "&:hover": {
        background: `${theme.palette.key.cyan.main}1A !important`,
      },
    },

    ".MuiListItemIcon-root": {
      aspectRatio: "1 / 1",
      minWidth: theme.spacing(2),

      svg: {
        width: theme.spacing(2),
        height: "auto",
      },
    },
  },

  highlight: {
    "&.Mui-selected": {
      background: `${theme.palette.greys["878787"]} !important`,
    },
  },
}));

export type MenuItemProps = MuiMenuItemProps & {
  highlightSelected?: boolean;
};

export const MenuItem: React.FC<MenuItemProps> = ({ highlightSelected, className, ...props }) => {
  const { classes, cx } = useStyles();

  return (
    <MuiMenuItem
      className={cx(classes.menuItem, { [classes.highlight]: highlightSelected }, className)}
      {...props}
    />
  );
};
