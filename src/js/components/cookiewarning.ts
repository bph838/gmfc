import {
  createDiv,
  createH3,
  createSpan,
  createInput,
  createLabel,
  createParagraph,
  emptyDiv,
  createCanvas,
  injectScript,
} from "@framework/dom";
const CACHE_KEY_COOKIES = "cookie_ok";

export function cookieWarningFunctionality() {
  //it may be on the screen so delete from prerender
  //const hangingEl = document.getElementById("cookie_warning");
  //if (hangingEl) hangingEl.remove();

  //don't show the cookie warning while prerendering, real visitors get it on hydration
  if ((window as any).__PRERENDER_INJECTED) return;

  //need to find out if the user has clicked allow
  const cached = localStorage.getItem(CACHE_KEY_COOKIES);
  if (!cached) {
    renderCookieWarning();
  }
}

function renderCookieWarning() {
  const cookieWarningText: string =
    'This website uses cookies, including Google Analytics, to analyse traffic and improve your experience. By clicking "Accept", you consent to our use of cookies.';

  const cookie_div = createDiv(
    document.body,
    "cookie_warning",
    "cookie_warning",
    "",
    true,
  );

  createParagraph(cookie_div, cookieWarningText);
  const button_holder = createDiv(cookie_div, "cookie-buttons");

  const input_accept = createInput(
    button_holder,
    "button",
    "btn-accept",
    "",
    "",
    "Accept",
  );
  const input_decline = createInput(
    button_holder,
    "button",
    "btn-decline",
    "",
    "",
    "Decline",
  );

  input_accept.addEventListener("pointerup", (event) => {
    //ok write to cookies
    emptyDiv(cookie_div);
    cookie_div.style.display = "none";
    localStorage.setItem(
      CACHE_KEY_COOKIES,
      JSON.stringify({
        timestamp: Date.now(),
        data: "set",
      }),
    );
  });

  input_decline.addEventListener("pointerup", (event) => {
    window.location.href = "http://www.google.com";
  });
}
