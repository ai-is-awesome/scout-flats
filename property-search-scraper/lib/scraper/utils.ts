import { randomInt } from "../utils";

export function randomizeTime(
  param: "minute" | "small" | "medium" | number
): number {
  if (typeof param === "number") return param;
  switch (param) {
    case "small":
      return randomInt(100, 300);
    case "medium":
      return randomInt(500, 1500);
    case "minute":
      return randomInt(45_000, 90_000); // ~1 minute window
  }
}

export function waitForRandomTime(
  param: "small" | "medium" | "minute" | number
) {}
