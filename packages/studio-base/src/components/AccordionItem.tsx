// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  accordionSummaryClasses,
  IconButton,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";

import { serif_14px_500 } from "@foxglove/studio-base/util/sharedStyleConstants";

const useStyles = makeStyles()((theme) => ({
  accordion: {
    background: "transparent !important",
    boxShadow: "none",

    "&::before": {
      display: "none",
    },

    "&.Mui-expanded": {
      margin: 0,
    },
  },

  accordionSummary: {
    flexDirection: "row-reverse",
    gap: theme.spacing(1),
    minHeight: 0,
    padding: 0,

    "&.Mui-expanded": {
      minHeight: 0,
    },

    [`& .${accordionSummaryClasses.expandIconWrapper}`]: {
      alignItems: "center",
      justifyContent: "center",
      width: theme.spacing(3),
      height: theme.spacing(3),

      svg: {
        width: "100%",
        height: "100%",
      },

      [`&.${accordionSummaryClasses.expanded}`]: {
        transform: "rotate(90deg)",
      },
    },

    [`& .${accordionSummaryClasses.content}`]: {
      alignItems: "center",
      gap: theme.spacing(1),
      marginBlock: 0,

      "&.Mui-expanded": {
        marginBlock: 0,
      },
    },
  },

  accordionSummaryText: {
    ...serif_14px_500,
    flexGrow: 1,
  },

  iconButton: {
    svg: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
  },

  dragIndicator: {
    margin: theme.spacing(1),
    width: theme.spacing(3),
    height: theme.spacing(3),
  },

  accordionDetails: {
    display: "grid",
    gap: theme.spacing(1),
    padding: 0,
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(5),
  },
}));

export type AccordionItemProps = {
  accordionSummary: string;
  onDelete?: () => void;
  children?: React.ReactNode;
};

export const AccordionItem: React.FC<AccordionItemProps> = ({
  accordionSummary,
  onDelete,
  children,
}) => {
  const { classes } = useStyles();

  return (
    <Accordion className={classes.accordion}>
      <AccordionSummary className={classes.accordionSummary} expandIcon={<ArrowForwardIosIcon />}>
        <div className={classes.accordionSummaryText}>{accordionSummary}</div>
        {onDelete && (
          <IconButton
            className={classes.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        )}
        <DragIndicatorIcon className={classes.dragIndicator} />
      </AccordionSummary>
      <AccordionDetails className={classes.accordionDetails}>{children}</AccordionDetails>
    </Accordion>
  );
};
