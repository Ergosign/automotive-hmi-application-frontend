// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
import CheckBoxOutlineBlankOutlinedIcon from "@mui/icons-material/CheckBoxOutlineBlankOutlined";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import { Typography } from "@mui/material";
import { useCallback, useRef } from "react";
import { makeStyles } from "tss-react/mui";

import { serif_14px_400, serif_14px_500 } from "@foxglove/studio-base/util/sharedStyleConstants";

const useStyles = makeStyles()((theme) => ({
  root: {
    cursor: "pointer",
    height: "100%",
    width: "100%",
    padding: theme.spacing(1),
    background: theme.palette.common.black,
    border: `2px solid transparent`,
    borderRadius: "4px",
    boxShadow:
      "0px 2px 1px -1px rgba(0, 0, 0, 0.20), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)",
  },
  selected: {
    background: theme.palette.greys[454545],
    borderColor: theme.palette.greys.white,
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
  imgContainer: {
    position: "relative",
    background: theme.palette.grey[600],
    width: "100%",
    height: "108px",
  },
  checkbox: {
    position: "absolute",
    top: "4px",
    left: "4px",
    width: theme.spacing(3),
    height: theme.spacing(3),

    path: {
      fill: theme.palette.greys.white,
    },
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    paddingTop: theme.spacing(1),
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  fileName: {
    ...serif_14px_500,
  },

  statsContainer: {
    ...serif_14px_400,
    display: "flex",
    columnGap: theme.spacing(1),
  },
}));

export type RecordingProps = {
  imgSrc: string;
  duration: string;
  onClick: () => void;
  onLongPress: () => void;
  size: string;
  date: string;
  selectionMode: boolean;
  selected: boolean;
  disabled?: boolean;
};

export const Recording: React.FC<RecordingProps> = ({
  imgSrc,
  date,
  duration,
  size,
  onClick,
  onLongPress,
  selectionMode: selectMode,
  selected,
  disabled = false,
}) => {
  const { classes, cx } = useStyles();
  const longPressTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleTouchStart = useCallback(() => {
    longPressTimeout.current = setTimeout(() => {
      onLongPress();
    }, 500);
  }, [onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
  }, []);

  return (
    <div
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cx(classes.root, { [classes.selected]: selected, [classes.disabled]: disabled })}
    >
      <div className={classes.imgContainer}>
        {selectMode &&
          (selected ? (
            <CheckBoxOutlinedIcon className={classes.checkbox} />
          ) : (
            <CheckBoxOutlineBlankOutlinedIcon className={classes.checkbox} />
          ))}
        <img className={classes.img} src={imgSrc} />
      </div>
      <div className={classes.textContainer}>
        <Typography className={classes.fileName}>{date}</Typography>
        <div className={classes.statsContainer}>
          <Typography>{`${duration} `} </Typography>
          <Typography>|</Typography>
          <Typography>{size}</Typography>
        </div>
      </div>
    </div>
  );
};
