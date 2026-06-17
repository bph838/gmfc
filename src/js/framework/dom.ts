export function fetchContextArea(data: any) {
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
export function createDiv(
  parent: { appendChild: (arg0: HTMLDivElement) => void },
  className: string | null = null,
  id: string | null = null,
  role: string | null = null,
  deleteIfThere = false,
) {
  if (deleteIfThere && id) {
    const elFound = document.getElementById(id);
    if (elFound) elFound.remove();
  }

  let el = document.createElement("div");
  if (className) el.className = className;
  if (id) el.id = id;
  if (role) el.role = role;
  parent.appendChild(el);
  return el;
}

export function createSection(
  parent: { appendChild: (arg0: HTMLElement) => void },
  className: string | null = null,
  id: string | null = null,
) {
  let el = document.createElement("section");
  if (className) el.className = className;
  if (id) el.id = id;
  parent.appendChild(el);
  return el;
}

export function createH1(
  parent: any,
  innerHTML: any,
  className: string | null = null,
  id: string | null = null,
) {
  return createHeader(parent, innerHTML, className, id, 1);
}
export function createH2(
  parent: any,
  innerHTML: any,
  className: string | null = null,
  id: string | null = null,
) {
  return createHeader(parent, innerHTML, className, id, 2);
}
export function createH3(
  parent: any,
  innerHTML: any,
  className: string | null = null,
  id: string | null = null,
) {
  return createHeader(parent, innerHTML, className, id, 2);
}

export function createInput(
  parent: { appendChild: (arg0: HTMLInputElement) => void },
  type: string,
  className: string | null = null,
  name: string | null = null,
  id: string | null = null,
  value: string | null = null,
  checked = false,
) {
  let el = document.createElement("input");
  el.type = type;
  if (className) el.className = className;
  if (name) el.name = name;
  if (id) el.id = id;
  if (value) el.value = value;
  if (checked) {
    el.checked = checked;
  }

  parent.appendChild(el);
  return el;
}

export function createLabel(
  parent: { appendChild: (arg0: HTMLLabelElement) => void },
  className: string | null = null,
  forName: string | null = null,
  innerHTML: string | null = null,
) {
  let el = document.createElement("label");
  if (className) el.className = className;
  if (forName) el.htmlFor = forName;
  if (innerHTML) el.innerHTML = innerHTML;

  parent.appendChild(el);
  return el;
}

function createHeader(
  parent: { appendChild: (arg0: HTMLHeadingElement) => void },
  innerHTML: string,
  className: string | null = null,
  id: string | null = null,
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

export function createSpan(
  parent: { appendChild: (arg0: HTMLSpanElement) => void },
  className: string | null = null,
  innerHTML: string | null = null,
) {
  let el: HTMLElement = document.createElement("span");
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  parent.appendChild(el);
  return el;
}

export function createLink(
  parent: { appendChild: (arg0: HTMLAnchorElement) => void },
  href: string | null = null,
  className: string | null = null,
  innerHTML: string | null = null,
  target = "_blank",
) {
  let el = document.createElement("a");
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  if (href) el.href = href;
  el.target = target;

  if (target === "_blank") {
    el.rel = "noopener noreferrer";
  }

  parent.appendChild(el);
  return el;
}

export function emptyDiv(el: {
  firstChild: any;
  removeChild: (arg0: any) => void;
}) {
  if (!el) return;
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export function createCanvas(
  parent: { appendChild: (arg0: HTMLCanvasElement) => void },
  className: string | null = null,
  id: string | null = null,
) {
  let el = document.createElement("canvas");
  if (className) el.className = className;
  if (id) el.id = id;
  parent.appendChild(el);
  return el;
}

export function createImage(
  parent: { appendChild: (arg0: HTMLImageElement) => void },
  src: string | null = null,
  className: string | null = null,
  alt: string | null = null,
  lazyload = false,
) {
  let el = document.createElement("img");
  if (className) el.className = className;
  if (src) el.src = src;
  if (alt) el.alt = alt;
  if (lazyload === true) {
    el.loading = "lazy";
  }

  parent.appendChild(el);
  return el;
}

export function createParagraph(
  parent: HTMLElement,
  innerHTML: string | null = null,
  className: string | null = null,
): HTMLParagraphElement {
  let el = document.createElement("p");
  if (className) el.className = className;
  if (typeof innerHTML === "string" && innerHTML) el.innerHTML = innerHTML;

  parent.appendChild(el);
  return el;
}

export function createOrderedList(
  parent: HTMLElement,
  className: string | null = null,
  id: string | null = null,
) {
  let el = document.createElement("ol");
  if (className) el.className = className;
  if (id) el.id = id;

  parent.appendChild(el);
  return el;
}

export function createUnOrderedList(
  parent: { appendChild: (arg0: HTMLUListElement) => void },
  className: string | null = null,
  id: string | null = null,
) {
  let el = document.createElement("ul");
  if (className) el.className = className;
  if (id) el.id = id;

  parent.appendChild(el);
  return el;
}

export function createListItem(
  parent: { appendChild: (arg0: HTMLLIElement) => void },
  className: string | null = null,
  innerHTML: string | null = null,
) {
  let el = document.createElement("li");
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;

  parent.appendChild(el);
  return el;
}

export function injectScript(url: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // already loaded?
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${url}"]`,
    );
    if (existing) {
      // if already finished loading, resolve immediately
      if (existing.dataset.loaded === "true") {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", reject);
      }
      return;
    }

    // create script
    const script = document.createElement("script");
    script.src = url;
    script.async = true;

    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });

    script.addEventListener("error", reject);

    document.head.appendChild(script);
  });
}

export function renderFinish() {
  document.dispatchEvent(new Event("render-event"));
}

export function createTable(
  parent: { appendChild: (arg0: HTMLTableElement) => void },
  className: string | null = null,
) {
  let el = document.createElement("table");
  if (className) el.className = className;

  parent.appendChild(el);
  return el;
}

export function createTableHead(
  parent: { appendChild: (arg0: HTMLTableSectionElement) => void },
  className: string | null = null,
) {
  let el = document.createElement("thead");
  if (className) el.className = className;

  parent.appendChild(el);
  return el;
}

export function createTableRow(
  parent: { appendChild: (arg0: HTMLTableRowElement) => void },
  className: string | null = null,
) {
  let el = document.createElement("tr");
  if (className) el.className = className;

  parent.appendChild(el);
  return el;
}

export function createHeadItem(
  parent: { appendChild: (arg0: HTMLTableCellElement) => void },
  innerHTML: string | null = null,
) {
  let el: HTMLTableCellElement = document.createElement("th");
  if (innerHTML) el.innerHTML = innerHTML;

  parent.appendChild(el);
  return el;
}

export function createTableBody(
  parent: { appendChild: (arg0: HTMLTableSectionElement) => void },
  className: string | null = null,
) {
  let el = document.createElement("tbody");
  if (className) el.className = className;

  parent.appendChild(el);
  return el;
}

export function createTableItem(
  parent: { appendChild: (arg0: HTMLTableCellElement) => void },
  innerHTML = "",
  className: string | null = null,
) {
  let el = document.createElement("td");
  if (className) el.className = className;
  el.innerHTML = innerHTML;

  parent.appendChild(el);
  return el;
}
