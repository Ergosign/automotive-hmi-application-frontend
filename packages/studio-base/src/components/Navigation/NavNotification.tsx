// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
import { Typography } from "@mui/material";
import { ReactElement } from "react-markdown/lib/react-markdown";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  container: {
    background: theme.palette.grey.A200,
    borderRadius: "6px",
    padding: "0px 4px",
  },
}));

export interface INavNotificationProps {
  label: string;
}

export const NavNotification: React.FC<INavNotificationProps> = ({ label }): ReactElement => {
  const { classes } = useStyles();

  return (
    <div className={classes.container}>
      <Typography fontWeight="500" color="white" variant="body1">
        {label}
      </Typography>
    </div>
  );
};
