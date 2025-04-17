// Import the class correctly
const { GameEngine } = require("../js/core/GameEngine");
// We also need the module class to check its instance type later
const {
  EnergyConversionModule,
} = require("../js/modules/EnergyConversionModule");

describe("GameEngine", () => {
  let mockCanvas;

  // Setup a mock canvas element before each test in this suite
  beforeEach(() => {
    mockCanvas = document.createElement("canvas");
    mockCanvas.id = "mock-game-canvas";
    // Mock getContext if needed by the engine's methods (render uses it)
    mockCanvas.getContext = () => ({
      clearRect: () => {},
      save: () => {},
      restore: () => {},
      fillText: () => {},
      measureText: () => ({ width: 0 }),
      // Add other mocked context methods if required
    });
    document.body.appendChild(mockCanvas);
  });

  // Clean up the mock canvas after each test
  afterEach(() => {
    document.body.removeChild(mockCanvas);
    mockCanvas = null;
  });

  it("should initialize modules correctly in the constructor", () => {
    // Arrange: The beforeEach block sets up the mock canvas

    // Act: Instantiate the GameEngine, which calls initModules internally
    const engineInstance = new GameEngine("mock-game-canvas");

    // Assert
    // Check if the instance itself was created
    expect(engineInstance).to.exist;
    expect(engineInstance).to.be.instanceOf(GameEngine);

    // Check if the modules object was initialized
    expect(engineInstance.modules).to.exist;
    expect(engineInstance.modules).to.be.an("object");

    // Check if the EnergyConversion module was loaded and is the correct type
    expect(engineInstance.modules["EnergyConversion"]).to.exist;
    expect(engineInstance.modules["EnergyConversion"]).to.be.instanceOf(
      EnergyConversionModule
    );

    // Check if the activeModule is set to the EnergyConversion module
    expect(engineInstance.activeModule).to.exist;
    expect(engineInstance.activeModule).to.equal(
      engineInstance.modules["EnergyConversion"]
    );

    // Check for core methods (optional, but good practice)
    expect(engineInstance.start).to.be.a("function");
    expect(engineInstance.loop).to.be.a("function");
    expect(engineInstance.update).to.be.a("function");
    expect(engineInstance.render).to.be.a("function");
  });
});
