// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import DeleteIcon from "@mui/icons-material/DeleteOutline";
import NoteIcon from "@mui/icons-material/Description";
import { IconButton, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "tss-react/mui";

import { Button } from "@foxglove/studio-base/components/Button";
import { Tag } from "@foxglove/studio-base/components/Tag/Tag";
import { TagPicker } from "@foxglove/studio-base/components/TagPicker";
import { TextField } from "@foxglove/studio-base/components/Textfield";
import { useLazyApi } from "@foxglove/studio-base/hooks/useLazyApi";
import { Tag as TagType } from "@foxglove/studio-base/stores/useFlagStore";
import { Flag, useFlagStore } from "@foxglove/studio-base/stores/useFlagStore";
import { serif_12px_400, serif_14px_400 } from "@foxglove/studio-base/util/sharedStyleConstants";

const useStyles = makeStyles()((theme) => ({
  flagsListItem: {
    display: "grid",
    gap: theme.spacing(1),
    borderBottom: "1px solid #000",

    padding: theme.spacing(2),
    cursor: "pointer",
    borderLeft: "4px solid transparent",

    ".flagsListItemHeader": {
      ...serif_14px_400,
      display: "flex",
      gap: theme.spacing(2),
      justifyContent: "space-between",
    },

    ".flagsListItemTitle": {
      color: theme.palette.greys.white,
      fontWeight: 500,
    },

    ".flagsListItemTime": {
      color: theme.palette.greys["dadada"],
    },

    "&.selected": {
      borderLeftColor: theme.palette.key.cyan.main,

      ".flagsListItemTitle, .flagsListItemTime": {
        color: theme.palette.key.cyan.main,
      },

      ".flagsListItemTitle": {
        fontWeight: 700,
      },
    },
  },

  flagsListItemNote: {
    ...serif_12px_400,
    margin: 0,
  },

  flagsListFooter: {
    display: "flex",
    justifyContent: "space-between",
    gap: theme.spacing(2),
  },

  flagsListItemTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.5),
  },

  noteIndicator: {
    color: theme.palette.greys["878787"],
    width: theme.spacing(3),
    height: theme.spacing(3),
  },

  invisible: {
    visibility: "hidden",
  },

  actionBar: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },

  iconButton: {
    padding: theme.spacing(1.5),

    svg: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
  },
  actionButton: {
    minWidth: 0,
    height: theme.spacing(4.5),
    flexGrow: 1,
    flexBasis: 0,
  },
}));

export type EditFlagRequest = {
  id: string;
  tags?: string[];
} & Partial<Omit<Flag, "id" | "tags">>;

export type FlagsListItemProps = {
  id: string;
  title: string;
  time: string;
  note: string;
  selectedTags: TagType[];
  selected?: boolean;
  editMode?: boolean;
  onClick?: () => void;
  onLongPress: () => void;
  onCancelEditMode: () => void;
};

export const FlagsListItem: React.FC<FlagsListItemProps> = ({
  id,
  title,
  time,
  note,
  selectedTags,
  selected = false,
  editMode,
  onClick,
  onLongPress,
  onCancelEditMode,
}) => {
  const { classes, cx } = useStyles();
  const { t } = useTranslation("flags");

  const { sortedFlags, setSortedFlags, tags, setIsUnsaved, editFlagPayload, setEditFlagPayload } =
    useFlagStore();

  const initialTagId =
    selectedTags.length > 0 && selectedTags[0] != undefined ? selectedTags[0].id : "";

  const [editedTitle, setEditedTitle] = useState(title);
  const [editedNote, setEditedNote] = useState(note);
  const [editedSelectedTagId, setEditedSelectedTagId] = useState<string>(initialTagId);

  const selectedTagsAvailable = editedSelectedTagId !== "";
  const hideNoteIndicator = !note || selected;
  const displayNote = !!note && selected;
  const displayFooter = selectedTagsAvailable || !hideNoteIndicator;

  const isUnsaved = useMemo(() => {
    const titleChanged = editedTitle !== title;
    const noteChanged = editedNote !== note;
    const tagsChanged = editedSelectedTagId !== initialTagId;

    return titleChanged || noteChanged || tagsChanged;
  }, [editedNote, editedSelectedTagId, editedTitle, note, initialTagId, title]);

  useEffect(() => {
    setIsUnsaved(isUnsaved);
  }, [isUnsaved, setIsUnsaved]);

  useEffect(() => {
    if (editMode === true) {
      setEditedTitle(title);
      setEditedNote(note);
      setEditedSelectedTagId(initialTagId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode]);

  useEffect(() => {
    if (editMode === true) {
      setEditFlagPayload({
        id,
        title: editedTitle,
        note: editedNote,
        tags: editedSelectedTagId !== "" ? [editedSelectedTagId] : [],
      });
    }
  }, [editMode, editedNote, editedSelectedTagId, editedTitle, id, setEditFlagPayload]);

  const [DeleteFlag] = useLazyApi({
    method: "DELETE",
    path: "/delete_flag",
  });

  const [EditFlag] = useLazyApi<EditFlagRequest, Flag>({
    method: "POST",
    path: "/edit_flag",
  });

  const handleDeleteFlag = useCallback(async () => {
    await DeleteFlag({ id });
    setSortedFlags(sortedFlags.filter((flag) => flag.id !== id));
  }, [DeleteFlag, id, setSortedFlags, sortedFlags]);

  const handleEditFlag = useCallback(async () => {
    if (editFlagPayload == undefined) {
      return;
    }

    const response = await EditFlag(editFlagPayload);

    if (response.data && response.ok) {
      const updatedFlag = response.data;
      setSortedFlags(sortedFlags.map((flag) => (flag.id === id ? updatedFlag : flag)));
      setEditFlagPayload(undefined);
      onCancelEditMode();
    }
  }, [
    editFlagPayload,
    EditFlag,
    setSortedFlags,
    sortedFlags,
    setEditFlagPayload,
    onCancelEditMode,
    id,
  ]);

  const longPressTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleTouchStart = useCallback(() => {
    longPressTimeout.current = setTimeout(() => {
      onLongPress();
    }, 500);
  }, [onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimeout.current != undefined) {
      clearTimeout(longPressTimeout.current);
    }
  }, []);

  return (
    <div
      className={cx(classes.flagsListItem, { selected })}
      onClick={onClick}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flagsListItemHeader">
        <Typography className="flagsListItemTitle">
          {editMode === true ? editedTitle : title}
        </Typography>
        <Typography className="flagsListItemTime">{time}</Typography>
      </div>

      {editMode === true ? (
        <>
          <TextField
            label={t("titleLabel")}
            value={editedTitle}
            placeholder={t("titlePlaceholder")}
            size="small"
            fullWidth
            onChange={(e) => {
              setEditedTitle(e.target.value);
            }}
          />

          <TagPicker
            label={t("flagType")}
            tags={tags}
            variant="single"
            iconOnly={false}
            selectedValue={editedSelectedTagId}
            onChange={(e) => {
              setEditedSelectedTagId(e.target.value as string);
            }}
          />

          <TextField
            label={t("noteLabel")}
            value={editedNote}
            placeholder={t("notePlaceholder")}
            multiline
            minRows={3}
            maxRows={10}
            fullWidth
            onChange={(e) => {
              setEditedNote(e.target.value);
            }}
          />

          <div className={classes.actionBar}>
            <IconButton
              className={classes.iconButton}
              onClick={(e) => {
                e.stopPropagation();
                void handleDeleteFlag();
              }}
            >
              <DeleteIcon />
            </IconButton>
            <Button
              className={classes.actionButton}
              onClick={(e) => {
                e.stopPropagation();
                onCancelEditMode();
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              className={classes.actionButton}
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                void handleEditFlag();
              }}
              disabled={!isUnsaved}
            >
              {t("save")}
            </Button>
          </div>
        </>
      ) : (
        <>
          {displayNote && <p className={classes.flagsListItemNote}>{note}</p>}

          {displayFooter && (
            <div className={classes.flagsListFooter}>
              <div className={classes.flagsListItemTags}>
                {selectedTags.map((tag) => (
                  <Tag key={tag.id} {...tag} />
                ))}
              </div>

              <NoteIcon
                className={cx(classes.noteIndicator, { [classes.invisible]: hideNoteIndicator })}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
