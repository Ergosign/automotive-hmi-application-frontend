// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import AddIcon from "@mui/icons-material/Add";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import { SelectChangeEvent } from "@mui/material";
import { MutableRefObject } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "tss-react/mui";

import { MenuItem } from "@foxglove/studio-base/components/MenuItem";
import { Select } from "@foxglove/studio-base/components/Select";
import { Tag } from "@foxglove/studio-base/components/Tag/Tag";
import { Tag as TagType } from "@foxglove/studio-base/stores/useFlagStore";

const useStyles = makeStyles()((theme) => ({
  selectedTagsWrapper: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.5),
  },

  singleValueWrapper: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },

  multiLine: {
    height: "auto !important",
    minHeight: theme.spacing(6),

    "&:has(.MuiInputBase-inputSizeSmall)": {
      minHeight: theme.spacing(4.5),
    },
  },
}));

type BaseTagPickerProps = {
  tags: TagType[];
  onChange: (event: SelectChangeEvent<unknown>) => void;
  anchorEl?: MutableRefObject<HTMLDivElement | ReactNull>;
};

type SingleTagPickerProps = BaseTagPickerProps & {
  variant?: "single";
  label?: string;
  selectedValue: string;
  iconOnly?: boolean;
};

type MultiTagPickerProps = BaseTagPickerProps & {
  variant: "multi";
  label: string;
  selectedValue: string[];
};

export type TagPickerProps = SingleTagPickerProps | MultiTagPickerProps;

export const TagPicker: React.FC<TagPickerProps> = (props) => {
  const { classes, cx } = useStyles();
  const { t } = useTranslation("flags");

  const { tags, selectedValue, onChange, anchorEl, variant = "single" } = props;

  const label = "label" in props ? props.label : undefined;
  const isSingle = variant === "single";
  const iconOnly = isSingle ? (props as SingleTagPickerProps).iconOnly ?? false : false;

  return (
    <Select
      label={label}
      value={selectedValue}
      renderValue={(selectedIds) => {
        if (variant === "multi") {
          if (selectedValue.length === 0) {
            return <Tag icon={<AddIcon />} label={t("tagsPlaceholder")} />;
          }

          return (
            <div className={classes.selectedTagsWrapper}>
              {(selectedIds as string[]).map((id) => {
                const tag = getTagById(id, tags);

                if (!tag) {
                  return;
                }

                return (
                  <Tag
                    key={tag.id}
                    label={tag.label}
                    backgroundColor={tag.backgroundColor}
                    foregroundColor={tag.foregroundColor}
                  />
                );
              })}
            </div>
          );
        }

        if (isSingle && !iconOnly && selectedValue !== "") {
          const tag = getTagById(selectedValue as string, tags);
          if (tag) {
            return (
              <div className={classes.singleValueWrapper}>
                <OutlinedFlagIcon htmlColor={tag.backgroundColor} fontSize="small" />
                {tag.label}
              </div>
            );
          }
        }

        return;
      }}
      onChange={onChange}
      anchorEl={anchorEl}
      transparent={isSingle && iconOnly}
      iconOnly={isSingle && iconOnly}
      multiple={variant === "multi"}
      size={variant === "multi" || (isSingle && !iconOnly) ? "small" : undefined}
      className={cx({ [classes.multiLine]: variant === "multi" })}
      fullWidth
      displayEmpty
    >
      {tags.map((tag) => (
        <MenuItem key={tag.id} value={tag.id} highlightSelected>
          <OutlinedFlagIcon htmlColor={tag.backgroundColor} />
          {tag.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export function getTagById(tagId: string, tags: TagType[]): TagType | undefined {
  return tags.find((tag) => tag.id === tagId);
}
