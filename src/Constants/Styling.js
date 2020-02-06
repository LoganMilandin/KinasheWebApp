import * as Constants from "./constants";

export const sectionPaper = {
  padding: "4%",
  marginBottom: "2%",
  marginTop: "2%",
  display: "flex",
  flexDirection: "column",
  alignItems: "left",
  backgroundColor: Constants.LIGHT_BLUE
};
export const sectionPaperTight = {
  //only difference is padding. idk how to combine them in JSS
  padding: "1%",
  marginBottom: "2%",
  marginTop: "2%",
  display: "flex",
  flexDirection: "column",
  alignItems: "left",
  backgroundColor: Constants.LIGHT_BLUE
};

export const subPaper = {
  padding: "4%",
  marginTop: "2%",
  marginBottom: "2%",
  display: "flex",
  flexDirection: "column",
  alignItems: "left",
  backgroundColor: Constants.LIGHT_GRAY
};
export const subPaperTight = {
  //only difference is padding. idk how to combine them in JSS
  padding: "1%",
  marginTop: "2%",
  marginBottom: "2%",
  display: "flex",
  flexDirection: "column",
  alignItems: "left",
  backgroundColor: Constants.LIGHT_GRAY
};

export const buttonPrimary = {
  backgroundColor: Constants.BLUE,
  color: "White",
  marginTop: "1%"
};

export const buttonPrimaryAlignRight = {
  backgroundColor: Constants.BLUE,
  marginLeft: "auto",
  color: "White",
  marginTop: "1%"
};

export const photoStyle = {
  maxWidth: "20%",
  marginLeft: "auto",
  marginRight: "auto"
};

export const rowCentered = {
  display: "flex",
  direction: "row",
  alignItems: "center"
};

export const logoLarge = {
  maxWidth: "50%",
  marginLeft: "auto",
  marginRight: "auto"
};

export const logoMedium = {
  maxWidth: "25%",
  marginLeft: "auto",
  marginRight: "auto"
};
