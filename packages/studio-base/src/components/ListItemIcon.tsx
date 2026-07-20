// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import Check from "@mui/icons-material/Check";
import {
  ListItemIcon as MuiListItemIcon,
  ListItemIconProps as MuiListItemIconProps,
} from "@mui/material";

export type ListItemIconProps = MuiListItemIconProps & {
  selected?: boolean;
};

export const ListItemIcon: React.FC<ListItemIconProps> = ({ selected, ...props }) => {
  return <MuiListItemIcon {...props}>{selected === true && <Check />}</MuiListItemIcon>;
};
