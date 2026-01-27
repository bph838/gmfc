import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import {
  createDiv,
  fetchContextArea,
  createH2,
  createH3,
  createSpan,
} from "@framework/dom";
import { fetchJson, formatDate,sanitizeString } from "@framework/utils";
import {
  setData,
  getFastestEverLap,
  getAllParticipants,
  getLapsByParticipantForCourse,
} from "@framework/leaderboard";
import data from "@data/pages/club/leaderboard.json";
import { createParagraph } from "../../js/framework/dom";

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
    renderFastestEverLap(lbdiv);

    //get all the participants
    const participants = getAllParticipants();
    if (participants) {
      participants.forEach((participant) => {
        renderFastestLapsForParticipant(lbdiv, participant);
      });
    }
  });
}

function formatLaptime(secs) {
  let seconds = secs.toFixed(2);
  let time = `${seconds} seconds`;
  return time;
}

function renderFastestEverLap(parent) {
  let fasted = getFastestEverLap();
  if (fasted) {
    console.log(fasted);
    const fastest_div = createDiv(parent, "lb_holdertimes");
    createH2(fastest_div, "🎉 Fastest Ever Lap 🎉");
    const divtimes = createDiv(fastest_div, "lb_times");
    createSpan(divtimes, "lb_participant", fasted.Participant);
    createSpan(divtimes, "lb_date", formatDate(fasted.date));
    createSpan(divtimes, "lb_time", formatLaptime(fasted.Laptime));
  }
}

function renderFastestLapsForParticipant(parent, participant) {
  console.log(`renderFastestLapsForParticipant ${participant}`);
  if (!participant) return;
  const laps = getLapsByParticipantForCourse(participant);
  if (laps && laps.length > 0) {
    console.log(laps);
    const fastest_time = formatLaptime(laps[0].Laptime);
    const nospace_participant = sanitizeString(participant);
    const participant_id = `accordion_id_${nospace_participant}`
    const participant_collapse_id = `accordion_collapse_id_${nospace_participant}`;
    const participant_div = createDiv(
      parent,
      "lb_participant_holdertimes accordion",
      participant_id
    );
    const participant_item = createDiv(participant_div, "accordion-item");
    const participant_title_innerhtml = `<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#${participant_collapse_id}" aria-expanded="true" aria-controls="${participant_collapse_id}">
       ${participant}<span class='participant_fastesttime'>${fastest_time}</span>
      </button>`;
    const participant_header = createH3(
      participant_item,
      participant_title_innerhtml,
      "accordion-header",
    );

    let participant_data_div_class = `accordion-collapse collapse show" data-bs-parent="#${participant_id}`;
    const participant_data_div = createDiv(participant_item,participant_data_div_class,participant_collapse_id)
    const participant_body_div = createDiv(participant_data_div,"accordion-body");

    //need to render all the times for the paricipant

  }
}

