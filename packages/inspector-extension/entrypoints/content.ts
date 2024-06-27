export default defineContentScript({
  matches: ["*://*.google.com/*"],
  main() {
    console.log("Datastar Hello content.");
  },
});
