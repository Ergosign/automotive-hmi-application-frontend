// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { InputLabel, Select as MuiSelect, SelectProps as MuiSelectProps } from "@mui/material";
import { MutableRefObject } from "react";
import { makeStyles } from "tss-react/mui";

import { inputLabelStyles } from "@foxglove/studio-base/components/Textfield";
import { serif_14px_500 } from "@foxglove/studio-base/util/sharedStyleConstants";

const useStyles = makeStyles()((theme) => ({
  inputLabel: {
    ...inputLabelStyles(theme),
  },

  dropDown: {
    height: theme.spacing(6),
    background: theme.palette.greys[454545],

    "&:has(.MuiSelect-iconOpen)": {
      background: `${theme.palette.key.cyan.main}1A !important`,
    },

    ".MuiSelect-select": {
      ...serif_14px_500,
      background: "transparent",
    },

    "&:has(.MuiInputBase-inputSizeSmall)": {
      height: theme.spacing(4.5),
    },

    ".MuiInputBase-inputSizeSmall": {
      paddingLeft: theme.spacing(1),
      paddingBlock: `${theme.spacing(0.75)} !important`,
    },
  },

  transparent: {
    background: "transparent",

    ".MuiFilledInput-input:focus": {
      background: "transparent",
    },

    "&.Mui-focused": {
      background: "transparent",
    },

    "&:hover": {
      background: "transparent",
    },
  },

  iconOnly: {
    width: theme.spacing(3),
    height: theme.spacing(3),

    "&:has(.MuiSelect-iconOpen)": {
      background: `${theme.palette.greys["454545"]} !important`,
    },

    ".MuiSelect-select": {
      height: "100%",
      padding: "0px !important",
    },

    ".MuiSvgIcon-root": {
      inset: "2px",
      width: theme.spacing(2.5),
      height: theme.spacing(2.5),
    },
  },

  menuList: {
    background: theme.palette.greys["454545"],
  },
}));

export type SelectProps = Omit<MuiSelectProps, "variant"> & {
  // eslint-disable-next-line no-restricted-syntax
  anchorEl?: MutableRefObject<HTMLDivElement | null>;
  transparent?: boolean;
  iconOnly?: boolean;
};

export const Select: React.FC<SelectProps> = ({
  label,
  anchorEl,
  transparent,
  iconOnly,
  className,
  ...props
}) => {
  const { classes, cx } = useStyles();

  const extraProps = iconOnly === true ? { renderValue: () => {} } : {};
  const extraMenuProps = anchorEl ? { anchorEl: anchorEl.current } : {};

  const muiSelectComponent = (
    <MuiSelect
      variant="filled"
      className={cx(
        classes.dropDown,
        { [classes.transparent]: transparent, [classes.iconOnly]: iconOnly },
        className,
      )}
      MenuProps={{
        anchorOrigin: {
          vertical: iconOnly === true ? "top" : "bottom",
          horizontal: iconOnly === true ? "right" : "left",
        },
        transformOrigin: {
          vertical: iconOnly === true ? "bottom" : "top",
          horizontal: iconOnly === true ? "right" : "left",
        },
        MenuListProps: { className: iconOnly === true ? classes.menuList : undefined },
        ...extraMenuProps,
      }}
      {...extraProps}
      {...props}
    />
  );

  if (label == undefined) {
    return muiSelectComponent;
  }

  return (
    <div>
      <InputLabel className={classes.inputLabel}>{label}</InputLabel>
      {muiSelectComponent}
    </div>
  );
};
