import { setupMenuCommands } from "@components/menu";
import { renderHero } from "@components/hero";
import { renderSection } from "@components/section";
import { createDiv, fetchContextArea, renderFinish } from "@framework/dom";
import { fetchJson } from "@framework/utils";

import data from "@data/pages/club/member.json";
import { logger } from "@framework/logger";

setupMenuCommands("page-clubmember");
renderClubMemberOptions(data);
renderFinish();

function renderClubMemberOptions(data: { content: any }) {
  logger.log(data);
  if (data.content.hero) renderHero(data.content.hero);

  const contentarea = fetchContextArea(data);
  if (!contentarea) return;
  const sectionsdiv = createDiv(contentarea, "sections");

  data.content.sections?.forEach((section: any) => {
    logger.log(section);
    renderSection(sectionsdiv, section);
    if (section.memberoptions && section.memberoptions.url) {
      renderMembershipOptions(sectionsdiv, section.memberoptions.url);
    }
  });
}

function renderMembershipOptions(parent: HTMLDivElement, urlOptions: string) {
  const lbMTdiv = createDiv(parent, "section_members");
  const lbJFdiv = createDiv(parent, "section_members");
  const optionsArea = createDiv(lbMTdiv, "member_options");
  console.log(urlOptions);
  fetchJson(urlOptions).then((data) => {
    //display membe types
    data.member_types?.forEach((option: string) => {
      renderMembershipOption(optionsArea, option);
    });

    //display joining fee
    let el = document.createElement("div");
    el.className = "section_members";

    //const lbJFdiv = createDiv(parent, "section_members");
    const jfArea = createDiv(lbJFdiv, "member_joining_fee");
    jfArea.innerHTML = "<span class='jf'>*</span>";
    jfArea.innerHTML += data.joiningFee;

  });
}

function renderMembershipOption(parent: HTMLDivElement, option: any) {
  const memberArea = createDiv(parent, "memberoption");
  //icon
  if (option.icon) {
    let iconDisplay = createDiv(memberArea, "member_icon");
    iconDisplay.innerHTML = `${option.icon}`;
  }

  let member_name = createDiv(memberArea, "member_name");
  const joiningFee = option.joiningFee ?? false;
  member_name.innerHTML = option.name;
  if (joiningFee) member_name.innerHTML += "<span class='jf'>*</span>";

  let member_period = createDiv(memberArea, "member_period");
  member_period.innerHTML = option.period;

  let member_cost = createDiv(memberArea, "member_cost");
  member_cost.innerHTML = `£${Number(option.cost).toFixed(2)}`;
}
