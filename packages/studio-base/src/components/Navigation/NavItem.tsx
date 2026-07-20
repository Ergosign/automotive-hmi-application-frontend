// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
import { Typography } from "@mui/material";
import { ReactElement } from "react-markdown/lib/react-markdown";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  navItem: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    padding: "24px 16px",
    color: theme.palette.common.white,
    "&:hover": {
      cursor: "pointer",
      background: theme.palette.action.hover,
    },
    "&:active": {
      color: theme.palette.grey[900],
      background: theme.palette.action.hoverOpacity,
    },
  },
  navItemActive: {
    color: theme.palette.common.white,
    background: `${theme.palette.grey.A100} !important`,
  },
  navItemDisabled: {
    color: theme.palette.grey[900],
    pointerEvents: "none",
  },
  navItemEndIconContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

export interface INavItemProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  endIcon?: ReactElement;
}

export const NavItem: React.FC<INavItemProps> = ({
  active = false,
  disabled = false,
  label,
  onClick,
  endIcon,
}): ReactElement => {
  const { classes, cx } = useStyles();

  return (
    <div
      onClick={onClick}
      className={cx(
        classes.navItem,
        active ? classes.navItemActive : undefined,
        disabled ? classes.navItemDisabled : undefined,
      )}
    >
      <Typography variant="h4">{label}</Typography>
      <div className={classes.navItemEndIconContainer}>{endIcon && endIcon}</div>
    </div>
  );
};
