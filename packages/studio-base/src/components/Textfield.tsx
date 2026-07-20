// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
  Theme,
} from "@mui/material";
import { CSSObject } from "tss-react";
import { makeStyles } from "tss-react/mui";

import { serif_12px_400, serif_14px_500 } from "@foxglove/studio-base/util/sharedStyleConstants";

export const inputLabelStyles = (theme: Theme): CSSObject => {
  return {
    ...serif_12px_400,
    color: `${theme.palette.greys["dadada"]} !important`,
    transform: "none",
  };
};

const useStyles = makeStyles()((theme) => ({
  textField: {
    ".MuiInputBase-root": {
      height: theme.spacing(6),
      background: theme.palette.greys[454545],
    },

    ".MuiInputBase-sizeSmall": {
      height: theme.spacing(3.5),
      input: {
        fontWeight: 400,
      },
    },

    ".MuiInputBase-multiline": {
      height: "auto",
      padding: 0,
    },

    ".MuiInputLabel-root": {
      ...inputLabelStyles(theme),
    },

    input: {
      ...serif_14px_500,
    },

    "input, textarea": {
      paddingInline: theme.spacing(1.25),
    },
  },
}));

export type TextFieldProps = Omit<MuiTextFieldProps, "variant">;

export const TextField: React.FC<TextFieldProps> = ({ className, ...props }) => {
  const { classes, cx } = useStyles();

  return (
    <MuiTextField
      className={cx(classes.textField, className)}
      variant="filled"
      InputLabelProps={{ shrink: true }}
      autoComplete="off"
      {...props}
    />
  );
};
