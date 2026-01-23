const { SITE_TITLE } = require("../js/constants");

/*
import { setupMenuCommands } from "./menu/menu";
import { renderIndex } from "./pages/index";
import { renderAlerts } from "./components/alerts";


import data from '../data/pages/homepage.json';  
console.log(data);
setupMenuCommands(document,"page-home");
renderIndex(data);  
renderAlerts();  
*/
 const contentarea = document.getElementById("contentarea");

   const titleTextBar = document.createElement("div");      
      titleTextBar.className="sectionheader";
      contentarea.appendChild(titleTextBar);