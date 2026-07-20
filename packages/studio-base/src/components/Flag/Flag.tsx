// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import FlagIcon from "@mui/icons-material/Flag";
import { Button, Tooltip } from "@mui/material";
import { MouseEvent } from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  flagButton: {
    padding: "2px",
    minWidth: 0,
    pointerEvents: "all",
    borderRadius: "50%",
    background: theme.palette.common.white,

    svg: {
      color: theme.palette.flag.blue.main,
    },

    "&:hover": {
      background: theme.palette.common.white,
    },

    "&.selected": {
      background: theme.palette.flag.blue.main,

      svg: {
        color: theme.palette.common.white,
      },
    },
  },
}));

export type FlagProps = {
  title?: string;
  selected?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
  onClick: (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void;
};

export const Flag: React.FC<FlagProps> = ({ title, selected = false, onClick }) => {
  const { classes, cx } = useStyles();

  return (
    <Tooltip title={title}>
      <Button
        className={cx(classes.flagButton, { selected })}
        onClick={(e) => {
          onClick(e);
        }}
      >
        <FlagIcon />
      </Button>
    </Tooltip>
  );
};
