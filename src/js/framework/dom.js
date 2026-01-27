export function fetchContextArea(data) {
  let contentarea = document.getElementById("contentarea");
  if (!contentarea) {
    console.error("There is no contentarea id to render to");
    return null;
  }
  if (!data) {
    console.error("There is no data content to render from");
    return null;
  }
  return contentarea;
}

/**
 * Create a div component and return it
 * @param {*} parent
 * @param {*} className
 * @param {*} id
 * @returns
 */
export function createDiv(parent, className = null, id = null) {
  let el = document.createElement("div");
  if (className) el.className = className;
  if (id) el.id = id;
  parent.appendChild(el);
  return el;
}

export function createSection(parent, className = null, id = null) {
  let el = document.createElement("section");
  if (className) el.className = className;
  if (id) el.id = id;
  parent.appendChild(el);
  return el;
}

export function createH1(parent, innerHTML, className = null, id = null) {
  return createHeader(parent, innerHTML, className, id, 1);
}
export function createH2(parent, innerHTML, className = null, id = null) {
  return createHeader(parent, innerHTML, className, id, 2);
}

function createHeader(
  parent,
  innerHTML,
  className = null,
  id = null,
  type = 1,
) {
  let el = null;
  switch (type) {
    case 3:
      el = document.createElement("h3");
      break;
    case 2:
      el = document.createElement("h2");
      break;
    default:
      el = document.createElement("h1");
      break;
  }

  if (className) el.className = className;
  if (id) el.id = id;
  if (innerHTML) el.innerHTML = innerHTML;
  parent.appendChild(el);
  return el;
}

export function createSpan(parent, className = null, innerHTML = "") {
  let el = document.createElement("span");
  if (className) el.className = className;
  el.innerHTML = innerHTML;
  parent.appendChild(el);
  return el;
}

export function createLink(
  parent,
  href = null,
  className = null,
  innerHTML = "",
  target = "_blank",
) {
  let el = document.createElement("a");
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  if (href) el.href = href;
  el.target = target;

  parent.appendChild(el);
  return el;
}

export function createImage(parent, src = null, className = null, alt = null) {
  let el = document.createElement("img");
  if (className) el.className = className;
  if (src) el.src = src;
  if (alt) el.alt = alt;

  parent.appendChild(el);
  return el;
}

export function createParagraph(parent, innerHTML = null, className = null) {
  if (typeof innerHTML !== "string") return;

  let el = document.createElement("p");
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;

  parent.appendChild(el);
  return el;
}
