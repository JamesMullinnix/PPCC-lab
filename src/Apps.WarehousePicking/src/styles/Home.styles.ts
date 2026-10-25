import { makeStyles, tokens } from "@fluentui/react-components";

export const useStyles = makeStyles({
  page: {
    padding: tokens.spacingHorizontalXXL,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
  },
  overview: {
    display: "grid",
    gridTemplateColumns: "minmax(120px, 0.7fr) minmax(150px, 1fr) minmax(250px, 2fr)",
    alignItems: "center",
    gap: tokens.spacingHorizontalXL,
    paddingBlock: tokens.spacingVerticalM,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    "@media (max-width: 640px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
  metric: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
  shortcuts: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
    "@media (max-width: 640px)": {
      gridColumn: "1 / -1",
      justifyContent: "flex-start",
    },
  },
  inventory: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  inventoryHeading: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    flexWrap: "wrap",
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
});