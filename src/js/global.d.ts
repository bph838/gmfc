declare module "*.scss";
declare module "3dgallery/src/index.js";

declare const process: { env: { NODE_ENV: string } };

interface Window {
  MY_NEWS_ITEM?: {
    json: string;
    year: string;
    month: string;
  };
}
