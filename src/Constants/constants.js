export const BLUE = "#4D77B2";
export const LIGHT_BLUE = "#F0F8FF";
export const PURPLE = "#683FB5";
export const RED = "#B53F8C";
export const GREEN = "#99C79B";
export const BROWN = "#C7B299";
export const LIGHT_GRAY = "#F8F8FF";
export const GRAY = "#DCDCDC";
export const DISABLED_TEXT_COLOR = "#808080";
export const TAN = "#FFF8DC";

export const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export const plans = [
  "30 days (minimum 320 birr)",
  "60 days (minimum 640 birr)",
  "90 days (minimum 960 birr)"
];
export const minPayments = [320, 640, 960];
//TODO: any benefit for paying for 90 days over 30?

export const MAX_FILE_SIZE = 10; //mb
export const MAX_SHORT_INPUT = 80;
export const MAX_LONG_INPUT = 300;
export const MAX_LONG_INPUT_DESC = 2000;

export const DEFAULT_START_HOUR = "08:00";
export const DEFAULT_END_HOUR = "20:00";
///////////////////////////////////////////////////////////////////////
export const emailRegex = new RegExp(
  /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i
);
