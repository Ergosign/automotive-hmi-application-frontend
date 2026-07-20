// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { IconButton, Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  flagsSelector: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #000",
    paddingLeft: "16px",
  },
  flagsSelectorTitle: {
    paddingInline: "8px",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "20px",
  },
  flagsSelectorButton: {
    padding: "12px",
    color: theme.palette.key.cyan.main,

    svg: {
      width: "24px",
      height: "24px",
    },
  },
}));

export type FlagsSelectorProps = {
  previousDisabled: boolean;
  nextDisabled: boolean;
  onPreviousClick: () => void;
  onNextClick: () => void;
};

export const FlagsSelector: React.FC<FlagsSelectorProps> = ({
  previousDisabled,
  nextDisabled,
  onPreviousClick,
  onNextClick,
}) => {
  const { classes } = useStyles();

  return (
    <div className={classes.flagsSelector}>
      <Typography className={classes.flagsSelectorTitle}>Select Flag</Typography>

      <div>
        <IconButton
          className={classes.flagsSelectorButton}
          onClick={onPreviousClick}
          disabled={previousDisabled}
        >
          <ChevronLeftIcon />
        </IconButton>

        <IconButton
          className={classes.flagsSelectorButton}
          onClick={onNextClick}
          disabled={nextDisabled}
        >
          <ChevronRightIcon />
        </IconButton>
      </div>
    </div>
  );
};
