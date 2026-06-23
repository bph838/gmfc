const isDev = process.env.NODE_ENV === "development";

export const logger = {
  debug(...args: any[]) {
    if (isDev) console.debug(...args);
  },
  log(...args: any[]) {
    if (isDev) console.log(...args);
  },
  warn(...args: any[]) {
    console.warn(...args);
  },
  error(...args: any[]) {
    console.error(...args);
  },
};
