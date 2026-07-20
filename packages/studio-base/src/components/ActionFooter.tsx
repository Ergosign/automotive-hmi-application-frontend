// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { makeStyles } from "tss-react/mui";

export type ActionFooterProps = {
  classNames?: string;
  children?: React.ReactNode;
};

const useStyles = makeStyles()((theme) => ({
  actionFooter: {
    position: "fixed",
    bottom: 0,
    left: 0,
    padding: `${theme.spacing(3)} ${theme.spacing(2)}`,
    width: "100%",
    height: theme.spacing(12),
    display: "flex",
    gap: "16px",
    alignItems: "center",
    justifyContent: "space-between",
    background: theme.palette.background.default,
  },
}));

export const ActionFooter: React.FC<ActionFooterProps> = ({ classNames, children }) => {
  const { cx, classes } = useStyles();

  return <div className={cx(classes.actionFooter, classNames)}>{children}</div>;
};
