// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { IconButton } from "@mui/material";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  visibilityButton: {
    color: theme.palette.greys.b2b2b2,

    svg: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
  },
  visible: {
    color: theme.palette.key.cyan.main,
  },
}));

export type VisibilityButtonProps = {
  isVisible: boolean;
  onToggle: () => void;
};

export const VisibilityButton: React.FC<VisibilityButtonProps> = ({ isVisible, onToggle }) => {
  const { classes, cx } = useStyles();

  return (
    <IconButton
      className={cx(classes.visibilityButton, { [classes.visible]: isVisible })}
      title={isVisible ? "Visible" : "Hidden"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
    >
      {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
    </IconButton>
  );
};
