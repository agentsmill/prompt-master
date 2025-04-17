const { JSDOM } = require("jsdom");

const { window } = new JSDOM("", { url: "http://localhost/" });

global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.HTMLElement = window.HTMLElement;
global.Node = window.Node;
global.getComputedStyle = window.getComputedStyle;

// Optionally, add more globals if your code needs them:
// global.localStorage = window.localStorage;
// global.sessionStorage = window.sessionStorage;
