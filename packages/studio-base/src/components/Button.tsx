// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { Button as MuiButton, ButtonProps as MuiButtonProps } from "@mui/material";
import { makeStyles } from "tss-react/mui";

import { serif_14px_500 } from "@foxglove/studio-base/util/sharedStyleConstants";

const useStyles = makeStyles()((theme) => ({
  baseButton: {
    ...serif_14px_500,
    minWidth: theme.spacing(18.75),
    height: theme.spacing(6),
    background: theme.palette.greys[454545],
    color: theme.palette.greys.white,

    "&:hover": {
      background: theme.palette.greys[454545],
    },
  },

  blueButton: {
    color: theme.palette.greys.black,
    background: theme.palette.primary.main,

    "&:hover": {
      background: theme.palette.primary.main,
    },

    "&:disabled": {
      color: theme.palette.greys.black,
      opacity: 0.5,
    },
  },

  redButton: {
    color: theme.palette.greys.black,
    background: theme.palette.error.main,

    "&:hover": {
      background: theme.palette.error.main,
    },
  },
}));

export const Button: React.FC<MuiButtonProps> = ({ color, className, ...props }) => {
  const { classes, cx } = useStyles();

  return (
    <MuiButton
      className={cx(
        classes.baseButton,
        { [classes.blueButton]: color === "primary", [classes.redButton]: color === "error" },
        className,
      )}
      {...props}
    />
  );
};
