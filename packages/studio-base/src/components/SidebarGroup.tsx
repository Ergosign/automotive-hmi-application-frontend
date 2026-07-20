// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  accordionSummaryClasses,
} from "@mui/material";
import { useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";

import { CustomNodeEditorProps } from "@foxglove/studio-base/components/SettingsTreeEditor/NodeEditor";
import { SensorStatusEntry } from "@foxglove/studio-base/components/SettingsTreeEditor/useSensorStatus";
import { VisibilityButton } from "@foxglove/studio-base/components/visibilityButton";
import { getRgbFromRgba } from "@foxglove/studio-base/util/colorUtils";
import { serif_14px_500, serif_16px_500 } from "@foxglove/studio-base/util/sharedStyleConstants";

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
    minHeight: theme.spacing(5),
    padding: 0,

    "&.Mui-expanded": {
      minHeight: theme.spacing(5),
    },

    [`& .${accordionSummaryClasses.expandIconWrapper}`]: {
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      width: theme.spacing(3),
      height: theme.spacing(3),
      padding: "5px",

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

  accordionSummaryContent: {
    display: "inline-flex",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
    overflowWrap: "break-word",
    wordBreak: "break-all",
    hyphens: "auto",
    whiteSpace: "normal",
  },

  groupName: {
    ...serif_16px_500,
    textTransform: "uppercase",
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  colorPreview: {
    minWidth: "14px",
    minHeight: "14px",
    borderRadius: "100%",
  },
  withOpacity: {
    opacity: 0.5,
  },
  notVisible: {
    color: theme.palette.greys.b2b2b2,

    [`& .${accordionSummaryClasses.expandIconWrapper}`]: {
      color: theme.palette.greys.b2b2b2,
    },
  },
  smallSize: {
    ...serif_14px_500,
  },
  noPaddingRight: {
    paddingRight: theme.spacing(6),
  },

  accordionDetails: {
    display: "grid",
    gap: theme.spacing(1),
    padding: 0,
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(3),
  },
}));

export type SidebarGroupProps = {
  groupName: string | undefined;
  groupIcon: React.ElementType | undefined;
  isSubGroup: boolean;
  fieldEditors: JSX.Element[];
  childNodes: JSX.Element[];
  isVisible: boolean | undefined;
  displayColorPreview: boolean;
  toggleVisibility: () => void;
  sensorStatus?: SensorStatusEntry;
};

export const SidebarGroup: React.FC<SidebarGroupProps> = ({
  groupName,
  groupIcon: IconComponent,
  isSubGroup,
  fieldEditors,
  childNodes,
  isVisible,
  displayColorPreview,
  toggleVisibility,
  sensorStatus,
}) => {
  const { classes, cx, theme } = useStyles();
  const [color, setColor] = useState<string>();
  const isBottomLevel = fieldEditors.length > 0;

  useEffect(() => {
    if (displayColorPreview && isBottomLevel) {
      fieldEditors.map((input) => {
        if (input.key === "color") {
          setColor(input.props.field.value as string);
        }
      });
    }
  }, [displayColorPreview, fieldEditors, isBottomLevel]);

  const childrenArray = React.Children.toArray(childNodes) as Array<
    React.ReactElement<CustomNodeEditorProps>
  >;

  const childrenWithToggle = childrenArray.filter((c) => c.props.settings?.visible != undefined);
  const isAnyVisible = childrenWithToggle.some((c) => c.props.settings?.visible);
  const allChildrenWithVisibleProp =
    childrenArray.length === 0 ? false : childrenArray.length === childrenWithToggle.length;

  const toggleGroupVisibility = () => {
    const targetState = !isAnyVisible;
    for (const child of childrenWithToggle) {
      if (child.props.settings?.visible !== targetState) {
        child.props.actionHandler({
          action: "update",
          payload: { input: "boolean", path: [...child.props.path, "visible"], value: targetState },
        });
      }
    }
  };

  const displayButton =
    (isSubGroup && isVisible != undefined) || (!isSubGroup && allChildrenWithVisibleProp);

  const visibleState = isSubGroup ? isVisible! : isAnyVisible;
  const handleToggle = isSubGroup ? toggleVisibility : toggleGroupVisibility;

  return (
    <Accordion className={classes.accordion} TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary
        className={cx(classes.accordionSummary, {
          [classes.notVisible]: !visibleState && isSubGroup,
        })}
        expandIcon={<ArrowForwardIosIcon />}
      >
        <div
          className={cx(classes.accordionSummaryContent, {
            [classes.notVisible]: !visibleState && isSubGroup,
          })}
        >
          <div className={cx(classes.groupName, { [classes.smallSize]: isSubGroup })}>
            {displayColorPreview && color && (
              <span
                className={cx(classes.colorPreview, { [classes.withOpacity]: !visibleState })}
                style={{ background: getRgbFromRgba(color) }}
              />
            )}
            {groupName}
            {!isSubGroup && IconComponent != undefined && <IconComponent />}
            {sensorStatus && sensorStatus.state !== "ok" && (
              <WarningAmberOutlinedIcon style={{ color: theme.palette.secondaries.yellow.main }} />
            )}
          </div>
          {displayButton && <VisibilityButton isVisible={visibleState} onToggle={handleToggle} />}
        </div>
      </AccordionSummary>
      <AccordionDetails
        className={cx(classes.accordionDetails, { [classes.noPaddingRight]: isBottomLevel })}
      >
        {isBottomLevel ? fieldEditors : childNodes}
      </AccordionDetails>
    </Accordion>
  );
};
