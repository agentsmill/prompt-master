/**
 * EnergyConversionModule
 * Teaches zero-shot prompting for energy conversion challenges.
 * Loads scenarios from data/energyScenarios.json (data-driven, not hardcoded).
 */
export class EnergyConversionModule {
  constructor(engine) {
    this.engine = engine;
    this.ctx = engine.ctx;
    this.scenarios = [];
    this.currentScenarioIdx = 0;
    this.loaded = false;
    this.statusMessage = "";
    this.init();
  }

  async init() {
    try {
      const resp = await fetch("js/data/energyScenarios.json");
      this.scenarios = await resp.json();
      this.loaded = true;
      this.statusMessage = "Ready for your first zero-shot challenge!";
    } catch (e) {
      this.statusMessage = "Failed to load scenarios.";
      this.loaded = false;
    }
  }

  update(delta) {
    // Placeholder for future logic (e.g., input handling, challenge progression)
  }

  render(ctx) {
    ctx.save();
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillStyle = "#ffe066";
    ctx.textAlign = "left";

    if (!this.loaded) {
      ctx.fillText("Loading scenarios...", 24, 48);
      ctx.restore();
      return;
    }

    // Render current scenario
    const scenario = this.scenarios[this.currentScenarioIdx];
    ctx.fillText("Zero-Shot Challenge:", 24, 48);
    ctx.fillStyle = "#44e0ff";
    ctx.fillText(scenario.title, 24, 80);

    ctx.fillStyle = "#b0b8c1";
    this.wrapText(ctx, scenario.description, 24, 112, 432, 18);

    ctx.fillStyle = "#7fff6a";
    ctx.fillText("Prompt:", 24, 180);
    ctx.fillStyle = "#fff";
    ctx.fillText("[Type your prompt in the UI below]", 24, 210);

    ctx.fillStyle = "#ffec70";
    ctx.fillText(this.statusMessage, 24, 300);

    ctx.restore();
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    // Utility for multi-line scenario descriptions
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }
}
