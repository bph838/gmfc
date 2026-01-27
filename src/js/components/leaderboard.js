import { createDiv, createH1, createSpan } from "@framework/dom";

export function renderLeaderboard(parent,data) {
    console.log("render leaderboard");
  if (!data) 
    console.log("unable to render leaderboard");
  const lbdiv = createDiv(parent, "section_leaderboard");
}
