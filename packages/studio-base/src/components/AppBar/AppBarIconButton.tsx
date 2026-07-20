// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { IconButton, IconButtonProps, Tooltip } from "@mui/material";
import { forwardRef } from "react";
import tinycolor from "tinycolor2";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  tooltip: {
    marginTop: `${theme.spacing(0.5)} !important`,
  },
  iconButton: {
    borderRadius: "50%",
    fontSize: 24,
    padding: theme.spacing(1.25),

    "svg:not(.MuiSvgIcon-root)": {
      fontSize: "1em",
    },
    "&:hover": {
      backgroundColor: tinycolor(theme.palette.common.white).setAlpha(0.08).toRgbString(),
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.appBar.primary,
    },
    "&.Mui-disabled": {
      color: "currentColor",
      opacity: theme.palette.action.disabledOpacity,
    },
  },
  selected: {
    backgroundColor: tinycolor(theme.palette.common.white).setAlpha(0.08).toRgbString(),
  },
}));

type AppBarIconButtonProps = Omit<IconButtonProps, "title"> & {
  title?: React.ReactNode;
  selected?: boolean;
};

export const AppBarIconButton = forwardRef<HTMLButtonElement, AppBarIconButtonProps>(
  (props, ref) => {
    const { title, selected, className, children, color = "inherit", ...rest } = props;
    const { classes, cx } = useStyles();

    return (
      <Tooltip
        disableInteractive
        classes={{ tooltip: classes.tooltip }}
        title={title}
        arrow={false}
        enterDelay={200}
      >
        <IconButton
          color={color}
          ref={ref}
          className={cx(classes.iconButton, { [classes.selected]: selected }, className)}
          {...rest}
        >
          {children}
        </IconButton>
      </Tooltip>
    );
  },
);

AppBarIconButton.displayName = "AppBarIconButton";
