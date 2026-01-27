export function loadScript(url, callback) {
  // Create a new script element
  const script = document.createElement("script");
  script.src = url;
  script.type = "text/javascript";
  script.async = true; // optional, loads asynchronously

  // Optional: call a function when script is loaded
  if (callback) {
    script.onload = callback;
    script.onerror = () => console.error("Failed to load script:", url);
  }

  // Inject into <head>
  document.head.appendChild(script);
}

export async function fetchJson(url) {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url); // fetch the URL

    // Check for HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // parse JSON
    return data;
  } catch (error) {
    console.error("Failed to fetch JSON:", error);
    return null; // or throw error if you prefer
  }
}

/**
 * Sets or creates an Open Graph meta tag.
 * @param {string} property - The OG property, e.g., "og:title"
 * @param {string} content - The content value to set
 */
export function setMeta(property, content) {
  let meta = document.querySelector(`meta[property='${property}']`);

  if (!meta) {
    // Create meta if it doesn't exist
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);

  if (property == "og:title") {
  }
}

export function setPageTitle(titleText) {
  // Update <title>
  if (document.title !== titleText) {
    document.title = titleText;
  }

  // Update or create <meta property="og:title" />
  let meta = document.querySelector(`meta[property='og:title']`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", "og:title");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", titleText);
}

export function initMapFrame(data) {
  let latitude = data.latitude || 0;
  let longitude = data.longitude || 0;
  const mapDiv = document.getElementById("map");
  if (!mapDiv) {
    console.error("No map div to render to");
    return;
  }
  mapDiv.innerHTML = `<iframe
    width="100%"
    height="100%"
    style="border:0"
    loading="lazy"
    allowfullscreen
    referrerpolicy="no-referrer-when-downgrade"
    src="https://www.google.com/maps?q=${latitude},${longitude}&hl=es;z=14&output=embed">
  </iframe>`;
}

export function formatDate(date) {
  console.log("formatDate");
  if (!(date instanceof Date)) return;

  const day = date.getDate().toString().padStart(2, "0"); // 1 → "01"
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2); // last 2 digits

  return `${day} ${month} ${year}`;
}


