// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
import CloseIcon from "@mui/icons-material/Close";
import {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Dialog as MuiDialog,
} from "@mui/material";
import { Trans } from "react-i18next";
import { makeStyles } from "tss-react/mui";

import { Button } from "@foxglove/studio-base/components/Button";
import { serif_14px_500 } from "@foxglove/studio-base/util/sharedStyleConstants";

const useStyles = makeStyles()((theme) => ({
  dialog: {
    ".MuiPaper-root": {
      minWidth: theme.spacing(75),
      gap: theme.spacing(2),
      padding: theme.spacing(2),
      background: `${theme.palette.greys[262626]} !important`,
    },
  },
  dialogHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.greys.black}`,
    boxSizing: "content-box",
    height: theme.spacing(3),

    ".MuiDialogTitle-root": {
      ...serif_14px_500,
      padding: 0,
      color: theme.palette.greys.white,
    },
  },
  dialogCloseButton: {
    padding: 0,
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  dialogContent: {
    padding: 0,
    ".MuiDialogContentText-root": {
      ...serif_14px_500,
      color: theme.palette.greys.white,
    },
  },
  dialogActions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: theme.spacing(1),
    padding: 0,

    "&>:not(:first-of-type)": {
      marginLeft: 0,
    },
  },
}));

export type DialogProps = {
  dialogTitle: string;
  open: boolean;
  onClose?: () => void;
  dialogText: string | React.ReactElement<typeof Trans>;
  primaryButtonText?: string;
  primaryButtonAction?: () => void;
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void;
  isDangerousAction?: boolean;
};

export const Dialog: React.FC<DialogProps> = ({
  dialogTitle,
  open,
  onClose,
  dialogText,
  primaryButtonText,
  primaryButtonAction,
  secondaryButtonText,
  secondaryButtonAction,
  isDangerousAction = false,
}) => {
  const { classes } = useStyles();

  return (
    <MuiDialog className={classes.dialog} open={open} onClose={onClose}>
      <div className={classes.dialogHeader}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        {onClose && (
          <IconButton aria-label="close" className={classes.dialogCloseButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </div>
      <DialogContent className={classes.dialogContent}>
        <DialogContentText>{dialogText}</DialogContentText>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        {primaryButtonText && primaryButtonAction && (
          <Button
            color={isDangerousAction ? "error" : "primary"}
            onClick={primaryButtonAction}
            autoFocus
          >
            {primaryButtonText}
          </Button>
        )}
        {secondaryButtonText && secondaryButtonAction && (
          <Button onClick={secondaryButtonAction}>{secondaryButtonText}</Button>
        )}
      </DialogActions>
    </MuiDialog>
  );
};
