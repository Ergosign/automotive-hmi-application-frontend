// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/
import { Chip } from "@mui/material";
import { makeStyles } from "tss-react/mui";

import { Tag as TagType } from "@foxglove/studio-base/stores/useFlagStore";
import { serif_12px_400 } from "@foxglove/studio-base/util/sharedStyleConstants";

const useStyles = makeStyles()((theme) => ({
  tag: {
    gap: theme.spacing(0.5),
    padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
    borderRadius: theme.spacing(1),
    cursor: "auto",
    background: theme.palette.greys.dadada,
    color: theme.palette.greys.black,

    ".MuiSvgIcon-root": {
      margin: 0,
    },

    ".MuiChip-label": {
      ...serif_12px_400,
      padding: 0,
    },
  },
}));

export type TagProps = {
  label: string;
  icon?: React.ReactElement;
} & Partial<Omit<TagType, "id" | "label">>;

export const Tag: React.FC<TagProps> = ({ label, backgroundColor, foregroundColor, icon }) => {
  const { classes } = useStyles();

  return (
    <Chip
      className={classes.tag}
      style={{ background: backgroundColor, color: foregroundColor }}
      label={label}
      size="small"
      icon={icon}
    />
  );
};
