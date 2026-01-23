
export function loadScript(url, callback) {
  // Create a new script element
  const script = document.createElement('script');
  script.src = url;
  script.type = 'text/javascript';
  script.async = true; // optional, loads asynchronously

  // Optional: call a function when script is loaded
  if (callback) {
    script.onload = callback;
    script.onerror = () => console.error('Failed to load script:', url);
  }

  // Inject into <head>
  document.head.appendChild(script);
}