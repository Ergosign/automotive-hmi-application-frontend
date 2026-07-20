// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
import HelpCenterOutlinedIcon from "@mui/icons-material/HelpCenterOutlined";
import { makeStyles } from "tss-react/mui";

import { serif_14px_500 } from "@foxglove/studio-base/util/sharedStyleConstants";

const useStyles = makeStyles()((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    width: "100%",
    height: "100%",

    "> *": {
      color: theme.palette.greys["dadada"],
    },
  },

  icon: {
    width: theme.spacing(8),
    height: theme.spacing(8),
  },

  text: {
    justifySelf: "center",
    ...serif_14px_500,
  },
}));

export type UserInfoProps = {
  children: React.ReactNode;
  className?: string;
};

export const UserInfo: React.FC<UserInfoProps> = ({ children, className }) => {
  const { classes, cx } = useStyles();

  return (
    <div className={cx(classes.root, className)}>
      <HelpCenterOutlinedIcon className={classes.icon} />
      <span className={classes.text}>{children}</span>
    </div>
  );
};
