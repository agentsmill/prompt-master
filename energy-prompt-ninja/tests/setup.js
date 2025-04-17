const { JSDOM } = require("jsdom");
const chai = require("chai"); // Import Chai

const { window } = new JSDOM("", { url: "http://localhost/" });

// --- JSDOM Globals ---
global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.HTMLElement = window.HTMLElement;
global.Node = window.Node;
global.getComputedStyle = window.getComputedStyle;

// --- Chai Globals ---
global.expect = chai.expect; // Make expect available globally

// Optionally, add more globals if your code needs them:
// global.localStorage = window.localStorage;
// global.sessionStorage = window.sessionStorage;
