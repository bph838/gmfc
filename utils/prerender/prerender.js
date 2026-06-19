// Add .Prerenderer to the end of the require
const Prerenderer =
  require("@prerenderer/prerenderer").Prerenderer ||
  require("@prerenderer/prerenderer");
const PuppeteerRenderer = require("@prerenderer/renderer-puppeteer");
const path = require("path");
const fs = require("fs");

async function run() {
  const distPath = path.join(__dirname, "../../dist");

  const pagesOutput = "./.build/site/pages.json";
  const pagesData = JSON.parse(fs.readFileSync(pagesOutput, "utf8"));

  const newsOutput = "./.build/site/newsitems.json";
  const newsData = JSON.parse(fs.readFileSync(newsOutput, "utf8"));
  const menuOutput = "./src/database/generated/menu.json";
  const menuData = JSON.parse(fs.readFileSync(menuOutput, "utf8"));
  const galleryOutput = "./src/database/generated/years.json";
  const galleryData = JSON.parse(fs.readFileSync(galleryOutput, "utf8"));

  // Change 'render' to 'renderRoutes'
  const routes = [
    //"/index.html",
  ];

  pagesData.pages.forEach((page) => {
    if (page.page) {
      routes.push(page.page);
    }
  });

  
  newsData.forEach((element) => {
    if (element.url) {
      let newsUrl = element.url + ".html";
      routes.push(newsUrl);
    }
  });

  menuData.forEach((year) => {
    let newsUrl = `/news/${year.year}/index.html`;
    routes.push(newsUrl);

    year.months.forEach((month) => {
      let formattedMonth = month.month.toString().padStart(2, "0");
      let newsUrl = `/news/${year.year}/${formattedMonth}/index.html`;
      routes.push(newsUrl);
    });
  });

  galleryData.forEach((year) => {
    let galleryUrl = `/gallery/${year}/index.html`;
    routes.push(galleryUrl);
  });


  console.log(`Number of pages:${routes.length}`);
  routes.forEach((element) => {
    console.log(element);
  });

 
  const prerenderer = new Prerenderer({
    staticDir: distPath,
    renderer: new PuppeteerRenderer({
      renderAfterDocumentEvent: "render-event",
      headless: false,
      timeout: 120000,
      maxConcurrentRoutes: 4,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      inject: true,
    }),
  });

  console.log("🚀 Starting Prerenderer...");

  await prerenderer.initialize();

  const renderedRoutes = await prerenderer.renderRoutes(routes); // <--- Fix is here

  for (const route of renderedRoutes) {
    // Note: in the core library, the property is route.html or route.content
    // and the path is route.route
    const outputPath = path.join(distPath, route.route);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, route.html);
    console.log(`✅ Prerendered: ${route.route}`);
  }

  await prerenderer.destroy();
  console.log("🏁 All done!");
  
}

run().catch(console.error);
