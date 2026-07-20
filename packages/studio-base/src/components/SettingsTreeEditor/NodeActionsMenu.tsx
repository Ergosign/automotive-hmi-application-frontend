// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { FormControlLabel, Checkbox } from "@mui/material";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  checkboxLabel: {
    whiteSpace: "nowrap",
    marginRight: "-7px",

    ".MuiFormControlLabel-label": {
      fontSize: "12px",
    },
  },
}));

export function NodeActionsMenu({
  onSelectAction,
}: {
  onSelectAction: (actionId: string) => void;
}): JSX.Element {
  const { classes } = useStyles();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectAction("show-all");
    } else {
      onSelectAction("hide-all");
    }
  };

  return (
    <FormControlLabel
      className={classes.checkboxLabel}
      control={<Checkbox onChange={handleChange} />}
      label="Show all"
      labelPlacement="start"
    />
  );
}
