import type React from "react";

type IconProps = {
  size?: number;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  strokeWidth?: number;
  "aria-hidden"?: boolean | "true" | "false";
};

const makeIcon =
  (symbol: string) =>
  ({ size = 16, className, onClick, "aria-hidden": ariaHidden }: IconProps) => (
    <span
      className={className}
      aria-hidden={ariaHidden}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.max(12, size - 2),
        lineHeight: 1,
      }}
    >
      {symbol}
    </span>
  );

export const IconMoon = makeIcon("\u263e");
export const IconSun = makeIcon("\u2600");
export const IconFocus2 = makeIcon("\u25ce");
export const IconSearch = makeIcon("\u2315");
export const IconFoldDown = makeIcon("\u25be");
export const IconFoldUp = makeIcon("\u25b4");
export const IconDownload = makeIcon("\u21e9");
export const IconBrain = makeIcon("B");
export const IconStarFilled = makeIcon("\u2605");
export const IconChevronRight = makeIcon("\u203a");
export const IconPencil = makeIcon("\u270e");
export const IconHistory = makeIcon("\u21bb");
export const IconChart = makeIcon("\u25f3");
