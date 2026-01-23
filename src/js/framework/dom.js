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

/**
 * 
 * @param {parent} parent 
 * @param {*} className 
 * @param {*} id 
 * @param {*} innerHtml 
 * @returns 
 */
export function createH1(parent, className = null, id = null, innerHTML = "") {
  let el = document.createElement("h1");
  if (className) el.className = className;
  if (id) el.id = id;
  if (innerHTML) el.innerHTML = innerHTML;
  parent.appendChild(el);
  return el;
}
