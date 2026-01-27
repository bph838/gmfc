import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  createDiv,
  fetchContextArea,
  createH2,
  createSpan,
} from "@framework/dom";
import { fetchJson, formatDate } from "@framework/utils";
import { setData, getFastestEverLap } from "@framework/leaderboard";
import data from "@data/pages/club/leaderboard.json";

setupMenuCommands("page-leaderboard");
renderClubLeaderBoard(data);

function renderClubLeaderBoard(data) {
  console.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;

  const sectionsdiv = createDiv(contentarea, "sections");

  if (data.content.sections) {
    data.content.sections.forEach((section) => {
      console.log(section);
      renderSection(sectionsdiv, section);
      if (section.leaderboard) {
        renderLeaderboard(sectionsdiv, section.leaderboard);
      }
    });
  }
}

function renderLeaderboard(parent, leaderboard) {
  console.log("render leaderboard");
  if (!leaderboard || !leaderboard.url)
    console.log("unable to render leaderboard");

  const url = leaderboard.url;
  console.log(`Looking for leaderboard data ${url}`);
  const lbdiv = createDiv(parent, "section_leaderboard");

  fetchJson(url).then((jsondata) => {
    console.log(jsondata);
    //need to load this json into a array
    setData(jsondata);

    //add the fasted time
    let fasted = getFastestEverLap();
    if (fasted) {
      console.log(fasted);
      const fastest_div = createDiv(lbdiv, "lb_holdertimes");
      createH2(fastest_div, "Fastest Ever Lap");
      const divtimes = createDiv(fastest_div, "lb_times");
      createSpan(divtimes, "lb_participant", fasted.Participant);
      createSpan(divtimes, "lb_date", formatDate(fasted.date));
      createSpan(divtimes, "lb_time", formatLaptime(fasted.Laptime));
    }
  });
}

function formatLaptime(secs) {
  let seconds = secs.toFixed(2);
  let time = `${seconds} seconds`;
  return time;
}
