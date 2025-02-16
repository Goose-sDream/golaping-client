const PURPLE = "#8D64FD";
const GREEN = "#39D38B";
const YELLOW = "#FBE84E";
const LIGHTGRAY = "#EFEFEF";

const borderMap = new Map([
  [0, "#F497A9"],
  [1, "#E3AD83"],
  [2, "#A9B08E"],
  [3, "#A9B08E"],
  [4, "#80B4DC"],
  [5, "#B270A0"],
]);

const optionColorMap = new Map([
  [0, ["#FBD2E2", "#FCE2E3", "#FCD5CE", "#F9C7CA", "#FEC5BA"]],
  [1, ["#FFC699", "#F8DCC4", "#F8E8B4", "#FBF8CB", "#FBF4D8"]],
  [2, ["#DBE1BD", "#D0D4C5", "#CADBBB", "#CDD5AE", "#D6D7AB"]],
  [3, ["#E9F1E4", "#E2EDE9", "#93B3A8", "#AAC4BB", "#CFDED9"]],
  [4, ["#A6C6DF", "#CDDAFD", "#C5DEF2", "#D5E2EA", "#E4EBF1"]],
  [5, ["#F6EFFF", "#DBD1D9", "#E7CEE3", "#CCA3C1", "#E2C9DC"]],
]);

const optionColors = [...optionColorMap.values()].flat();

// console.log("optionColors =>", optionColors);

export { PURPLE, GREEN, YELLOW, LIGHTGRAY, borderMap, optionColors, optionColorMap };
