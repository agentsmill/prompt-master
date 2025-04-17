// Import the class and ERROR_TYPES correctly
const {
  EnergyConversionModule,
  ERROR_TYPES, // Import the exported error types
} = require("../js/modules/EnergyConversionModule");

// Mock engine dependency needed by the constructor
const mockEngine = {
  ctx: {}, // Provide a mock context if needed by constructor/methods
  // Add other engine properties/methods if the constructor uses them
};

describe("EnergyConversionModule", () => {
  let moduleInstance;

  // Create a fresh instance before each test in this suite
  beforeEach(() => {
    moduleInstance = new EnergyConversionModule(mockEngine);
  });

  // --- Tests for parseChallenge ---
  describe("parseChallenge", () => {
    it("should correctly parse zero-shot energy conversion challenges", () => {
      // Arrange
      const challengeInput = {
        id: "test-1",
        title: "Test Conversion",
        description: "Convert 10 kWh to MJ. Also mention 500 J.",
        type: "conversion",
        domain: "physics",
      };

      // Act
      const result = moduleInstance.parseChallenge(challengeInput);

      // Assert
      expect(moduleInstance.parseChallenge).to.exist;
      expect(typeof moduleInstance.parseChallenge).to.equal("function");
      expect(result).to.exist;
      expect(result.energyValues).to.be.an("array").with.lengthOf(2);
      expect(result.energyValues).to.deep.include.members([
        { value: 10, unit: "kWh", raw: "10 kWh" },
        { value: 500, unit: "J", raw: "500 J" },
      ]);
      expect(result.title).to.equal("Test Conversion");
    });
    // Add more tests for parseChallenge edge cases if needed
  });

  // --- Tests for convertToJoules (from TDD Spec) ---
  describe("convertToJoules", () => {
    it("should correctly convert kilowatt-hours to joules", () => {
      const result = moduleInstance.convertToJoules(10, "kWh");
      expect(result.error).to.be.null;
      expect(result.value).to.equal(36000000);
    });

    it("should correctly convert megajoules to joules", () => {
      const result = moduleInstance.convertToJoules(5, "MJ");
      expect(result.error).to.be.null;
      expect(result.value).to.equal(5000000);
    });

    it("should correctly convert BTUs to joules", () => {
      const result = moduleInstance.convertToJoules(100, "BTU");
      expect(result.error).to.be.null;
      // Use closeTo for potential floating point inaccuracies
      expect(result.value).to.be.closeTo(105505.585, 0.001);
    });

    it("should handle case-insensitive units and whitespace", () => {
      const units = [" j ", "JOULE", "joules", " J "];
      units.forEach((unit) => {
        const result = moduleInstance.convertToJoules(1, unit);
        expect(result.error, `Unit: ${unit}`).to.be.null;
        expect(result.value, `Unit: ${unit}`).to.equal(1);
      });
    });

    it("should handle decimal values correctly", () => {
      const result = moduleInstance.convertToJoules(0.5, "kJ");
      expect(result.error).to.be.null;
      expect(result.value).to.equal(500);
    });

    it("should handle negative values correctly", () => {
      const result = moduleInstance.convertToJoules(-2, "kWh");
      expect(result.error).to.be.null;
      expect(result.value).to.equal(-7200000);
    });

    it("should return error for unsupported units", () => {
      const result = moduleInstance.convertToJoules(10, "unsupported");
      expect(result.value).to.be.null;
      expect(result.error).to.equal(ERROR_TYPES.UNKNOWN_UNIT);
    });

    it("should return error for invalid values", () => {
      const invalidValues = [
        null,
        undefined,
        NaN,
        "string",
        Infinity,
        -Infinity,
      ];
      invalidValues.forEach((value) => {
        const result = moduleInstance.convertToJoules(value, "J");
        expect(result.value, `Value: ${value}`).to.be.null;
        expect(result.error, `Value: ${value}`).to.equal(
          ERROR_TYPES.INVALID_VALUE
        );
      });
    });
  });

  // --- Tests for convert (from TDD Spec) ---
  describe("convert", () => {
    it("should correctly convert from kilowatt-hours to megajoules", () => {
      const result = moduleInstance.convert(10, "kWh", "MJ");
      expect(result.error).to.be.null;
      expect(result.value).to.equal(36);
    });

    it("should correctly convert from joules to kilowatt-hours", () => {
      const result = moduleInstance.convert(3600000, "J", "kWh");
      expect(result.error).to.be.null;
      expect(result.value).to.equal(1);
    });

    it("should correctly convert from BTU to megajoules", () => {
      const result = moduleInstance.convert(1000, "BTU", "MJ");
      expect(result.error).to.be.null;
      expect(result.value).to.be.closeTo(1.055056, 0.000001);
    });

    it("should handle conversion between the same units", () => {
      const result = moduleInstance.convert(42, "kWh", "kWh");
      expect(result.error).to.be.null;
      expect(result.value).to.equal(42);
    });

    it("should handle case-insensitive units and whitespace", () => {
      const result = moduleInstance.convert(5, " kWh ", " mj ");
      expect(result.error).to.be.null;
      expect(result.value).to.equal(18);
    });

    it("should handle decimal values correctly", () => {
      const result = moduleInstance.convert(0.25, "kWh", "MJ");
      expect(result.error).to.be.null;
      expect(result.value).to.equal(0.9);
    });

    it("should handle negative values correctly", () => {
      const result = moduleInstance.convert(-3, "MJ", "kWh");
      expect(result.error).to.be.null;
      expect(result.value).to.be.closeTo(-3 / 3.6, 0.000001); // -3 MJ / (3.6 MJ/kWh)
    });

    it("should return error for unsupported source units", () => {
      const result = moduleInstance.convert(10, "unsupported", "kWh");
      expect(result.value).to.be.null;
      expect(result.error).to.equal(ERROR_TYPES.UNKNOWN_UNIT);
    });

    it("should return error for unsupported target units", () => {
      const result = moduleInstance.convert(10, "kWh", "unsupported");
      expect(result.value).to.be.null;
      expect(result.error).to.equal(ERROR_TYPES.UNKNOWN_UNIT);
    });

    it("should return error for invalid values", () => {
      const invalidValues = [null, undefined, NaN, "string", Infinity];
      invalidValues.forEach((value) => {
        const result = moduleInstance.convert(value, "kWh", "MJ");
        expect(result.value, `Value: ${value}`).to.be.null;
        expect(result.error, `Value: ${value}`).to.equal(
          ERROR_TYPES.INVALID_VALUE
        );
      });
    });
  });
});
