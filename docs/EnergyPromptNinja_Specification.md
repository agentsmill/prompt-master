# Energy Prompt Ninja: Functional Specification

## 1. Game Overview

### 1.1 Concept

Energy Prompt Ninja is an educational game that teaches prompt engineering skills through the lens of energy transformation challenges. Players take on the role of "Energy Prompt Engineers" who must craft effective prompts to solve real-world energy problems, optimize systems, and drive innovation in sustainable energy technologies.

The game combines the technical aspects of prompt engineering with the thematic focus of energy transformation, creating an engaging learning experience that builds both AI literacy and energy awareness.

### 1.2 Core Theme: Energy Transformation

Energy transformation serves as the central narrative and educational framework for the game. This theme manifests in:

- **Narrative Context**: Players work for the "Global Energy Transformation Initiative" (GETI), a fictional organization tasked with accelerating the world's transition to sustainable energy systems through AI-powered solutions.

- **Problem Domains**: Challenges focus on renewable energy integration, grid modernization, energy efficiency, policy development, and consumer behavior change.

- **Visual Style**: Pixel art aesthetics that visualize energy flows, transformations, and systems (solar panels, wind turbines, power grids, energy storage, etc.) with dynamic visual feedback showing energy states.

- **Learning Progression**: Players advance through increasingly complex energy transformation scenarios, from individual renewable technologies to integrated smart grids and policy frameworks.

### 1.3 Educational Goals

1. Teach effective prompt engineering techniques based on principles in `prompt_guide.md`
2. Build understanding of energy transformation concepts, challenges, and solutions
3. Develop critical thinking skills at the intersection of AI and energy systems
4. Foster creativity in applying AI tools to solve complex real-world problems

## 2. Core Gameplay Mechanics

### 2.1 Learning Progression System

Players advance through five skill levels, each introducing new prompt engineering techniques and energy transformation concepts:

1. **Novice**: Basic zero-shot prompting for simple energy conversion tasks
2. **Apprentice**: Few-shot prompting for renewable energy optimization
3. **Practitioner**: Chain of thought and step-back prompting for grid integration challenges
4. **Expert**: Self-consistency and tree of thoughts for complex energy policy scenarios
5. **Master**: ReAct and multimodal prompting for comprehensive energy system transformation

```pseudocode
// Learning Progression System
class LearningProgressionSystem {
    // Player's current skill level (1-5)
    private int currentSkillLevel;

    // Tracks completion status of modules at each level
    private Map<int, List<Module>> completedModulesByLevel;

    // Energy concepts unlocked at each level
    private Map<int, List<EnergyConcept>> energyConceptsByLevel;

    // Prompt techniques unlocked at each level
    private Map<int, List<PromptTechnique>> promptTechniquesByLevel;

    // Initialize progression system with level-appropriate content
    public LearningProgressionSystem() {
        this.currentSkillLevel = 1;
        this.completedModulesByLevel = initializeModules();
        this.energyConceptsByLevel = initializeEnergyConcepts();
        this.promptTechniquesByLevel = initializePromptTechniques();
    }

    // Check if player can advance to next level
    public boolean canAdvanceToNextLevel() {
        List<Module> currentLevelModules = completedModulesByLevel.get(currentSkillLevel);
        return currentLevelModules.stream().allMatch(module -> module.isCompleted());
    }

    // Advance player to next level if eligible
    public boolean tryAdvanceToNextLevel() {
        if (canAdvanceToNextLevel() && currentSkillLevel < 5) {
            currentSkillLevel++;
            unlockNewContent();
            return true;
        }
        return false;
    }

    // Unlock new energy concepts and prompt techniques for current level
    private void unlockNewContent() {
        List<EnergyConcept> newConcepts = energyConceptsByLevel.get(currentSkillLevel);
        List<PromptTechnique> newTechniques = promptTechniquesByLevel.get(currentSkillLevel);

        // Make new content available to player
        newConcepts.forEach(concept -> concept.setUnlocked(true));
        newTechniques.forEach(technique -> technique.setUnlocked(true));
    }

    // Initialize energy concepts for each level
    private Map<int, List<EnergyConcept>> initializeEnergyConcepts() {
        Map<int, List<EnergyConcept>> concepts = new HashMap<>();

        // Level 1: Basic energy conversion
        concepts.put(1, Arrays.asList(
            new EnergyConcept("Solar Energy Basics", "Photovoltaic conversion of sunlight to electricity"),
            new EnergyConcept("Wind Energy Fundamentals", "Kinetic energy of wind converted to mechanical then electrical energy"),
            new EnergyConcept("Energy Units", "Understanding watts, kilowatt-hours, and energy measurement")
        ));

        // Level 2: Energy storage and efficiency
        concepts.put(2, Arrays.asList(
            new EnergyConcept("Battery Storage", "Chemical storage of electrical energy"),
            new EnergyConcept("Energy Efficiency", "Reducing energy waste in conversion processes"),
            new EnergyConcept("Demand Management", "Shifting energy use to optimize grid resources")
        ));

        // Level 3: Grid integration
        concepts.put(3, Arrays.asList(
            new EnergyConcept("Smart Grids", "Intelligent electricity distribution networks"),
            new EnergyConcept("Grid Stability", "Maintaining frequency and voltage in variable renewable systems"),
            new EnergyConcept("Distributed Energy Resources", "Decentralized generation and storage")
        ));

        // Level 4: Energy policy and economics
        concepts.put(4, Arrays.asList(
            new EnergyConcept("Carbon Pricing", "Economic instruments to reduce emissions"),
            new EnergyConcept("Renewable Incentives", "Policy mechanisms to accelerate clean energy adoption"),
            new EnergyConcept("Energy Justice", "Equitable distribution of energy benefits and burdens")
        ));

        // Level 5: System transformation
        concepts.put(5, Arrays.asList(
            new EnergyConcept("Sector Coupling", "Integrating electricity, heating, and transportation"),
            new EnergyConcept("Circular Energy Economy", "Minimizing waste in energy value chains"),
            new EnergyConcept("Net Zero Systems", "Designing energy systems with zero net emissions")
        ));

        return concepts;
    }

    // Initialize prompt techniques for each level
    private Map<int, List<PromptTechnique>> initializePromptTechniques() {
        Map<int, List<PromptTechnique>> techniques = new HashMap<>();

        // Level 1: Basic prompting
        techniques.put(1, Arrays.asList(
            new PromptTechnique("Zero-shot Prompting", "Direct instructions without examples"),
            new PromptTechnique("Clear Instructions", "Being specific about desired output"),
            new PromptTechnique("Output Formatting", "Controlling response structure")
        ));

        // Level 2: Examples and roles
        techniques.put(2, Arrays.asList(
            new PromptTechnique("Few-shot Prompting", "Providing examples to guide responses"),
            new PromptTechnique("Role Prompting", "Assigning specific roles to the AI"),
            new PromptTechnique("Contextual Prompting", "Providing relevant background information")
        ));

        // Level 3: Reasoning techniques
        techniques.put(3, Arrays.asList(
            new PromptTechnique("Chain of Thought", "Breaking down reasoning into steps"),
            new PromptTechnique("Step-back Prompting", "Considering broader principles first"),
            new PromptTechnique("Temperature Control", "Adjusting creativity vs. determinism")
        ));

        // Level 4: Advanced reasoning
        techniques.put(4, Arrays.asList(
            new PromptTechnique("Self-consistency", "Generating multiple reasoning paths"),
            new PromptTechnique("Tree of Thoughts", "Exploring multiple reasoning branches"),
            new PromptTechnique("Top-K and Top-P Sampling", "Controlling token selection")
        ));

        // Level 5: Interactive and multimodal
        techniques.put(5, Arrays.asList(
            new PromptTechnique("ReAct Prompting", "Reasoning and acting with external tools"),
            new PromptTechnique("Multimodal Prompting", "Combining text with images or data"),
            new PromptTechnique("Automatic Prompt Engineering", "Using AI to optimize prompts")
        ));

        return techniques;
    }
}
```

### 2.2 Challenge Modules

Each skill level contains challenge modules focused on different energy transformation domains. Modules present players with energy-related scenarios that must be solved through effective prompt engineering.

#### Module Types:

1. **Energy Conversion Challenges**: Optimize the conversion of renewable energy sources (solar, wind, hydro) to electricity
2. **Storage Solutions**: Design energy storage systems to balance supply and demand
3. **Grid Integration**: Solve challenges related to integrating variable renewables into the grid
4. **Energy Efficiency**: Develop prompts to analyze and improve energy efficiency in buildings, industry, and transportation
5. **Policy Development**: Craft prompts to generate and evaluate energy policy options

```pseudocode
// Challenge Module System
class ChallengeModuleSystem {
    // Available modules organized by skill level and energy domain
    private Map<int, Map<String, List<Challenge>>> challengeModules;

    // Player's progress through modules
    private PlayerProgress playerProgress;

    // Initialize challenge module system
    public ChallengeModuleSystem(PlayerProgress playerProgress) {
        this.playerProgress = playerProgress;
        this.challengeModules = initializeChallengeModules();
    }

    // Get available challenges for player's current level and unlocked domains
    public List<Challenge> getAvailableChallenges() {
        int currentLevel = playerProgress.getCurrentLevel();
        List<String> unlockedDomains = playerProgress.getUnlockedDomains();

        List<Challenge> availableChallenges = new ArrayList<>();
        Map<String, List<Challenge>> domainChallenges = challengeModules.get(currentLevel);

        for (String domain : unlockedDomains) {
            if (domainChallenges.containsKey(domain)) {
                availableChallenges.addAll(domainChallenges.get(domain));
            }
        }

        return availableChallenges.stream()
            .filter(challenge -> !playerProgress.hasCompletedChallenge(challenge.getId()))
            .collect(Collectors.toList());
    }

    // Initialize challenge modules for all levels and domains
    private Map<int, Map<String, List<Challenge>>> initializeChallengeModules() {
        Map<int, Map<String, List<Challenge>>> modules = new HashMap<>();

        // Level 1: Basic energy conversion challenges
        Map<String, List<Challenge>> level1Modules = new HashMap<>();
        level1Modules.put("SolarEnergy", createSolarChallenges());
        level1Modules.put("WindEnergy", createWindChallenges());
        level1Modules.put("HydroEnergy", createHydroChallenges());
        modules.put(1, level1Modules);

        // Level 2: Energy storage and efficiency challenges
        Map<String, List<Challenge>> level2Modules = new HashMap<>();
        level2Modules.put("BatteryStorage", createBatteryChallenges());
        level2Modules.put("ThermalStorage", createThermalStorageChallenges());
        level2Modules.put("EnergyEfficiency", createEfficiencyChallenges());
        modules.put(2, level2Modules);

        // Level 3: Grid integration challenges
        Map<String, List<Challenge>> level3Modules = new HashMap<>();
        level3Modules.put("SmartGrid", createSmartGridChallenges());
        level3Modules.put("DemandResponse", createDemandResponseChallenges());
        level3Modules.put("MicroGrids", createMicroGridChallenges());
        modules.put(3, level3Modules);

        // Level 4: Energy policy challenges
        Map<String, List<Challenge>> level4Modules = new HashMap<>();
        level4Modules.put("CarbonPolicy", createCarbonPolicyChallenges());
        level4Modules.put("RenewableIncentives", createIncentiveChallenges());
        level4Modules.put("EnergyAccess", createEnergyAccessChallenges());
        modules.put(4, level4Modules);

        // Level 5: System transformation challenges
        Map<String, List<Challenge>> level5Modules = new HashMap<>();
        level5Modules.put("SectorCoupling", createSectorCouplingChallenges());
        level5Modules.put("CircularEconomy", createCircularEconomyChallenges());
        level5Modules.put("NetZeroTransition", createNetZeroChallenges());
        modules.put(5, level5Modules);

        return modules;
    }

    // Example method to create solar energy challenges
    private List<Challenge> createSolarChallenges() {
        List<Challenge> challenges = new ArrayList<>();

        challenges.add(new Challenge(
            "solar_optimization",
            "Solar Panel Optimization",
            "Craft a prompt to help optimize solar panel placement based on location data",
            "zero-shot",
            new EnergyScenario(
                "A community solar installation needs to maximize energy production. " +
                "You have access to data on sun angles, weather patterns, and terrain.",
                Map.of(
                    "location", "44.9778° N, 93.2650° W",
                    "annual_sunshine_hours", "2711",
                    "average_cloud_cover", "45%",
                    "terrain", "flat, open field with no shading"
                )
            )
        ));

        challenges.add(new Challenge(
            "solar_maintenance",
            "Solar Maintenance Assistant",
            "Create a prompt for an AI assistant that helps diagnose solar panel issues",
            "few-shot",
            new EnergyScenario(
                "Solar farm operators need an AI assistant to help diagnose maintenance issues " +
                "based on performance data and visual inspections.",
                Map.of(
                    "system_size", "5 MW",
                    "panel_type", "monocrystalline silicon",
                    "installation_date", "2020-05-15",
                    "recent_output_drop", "32%"
                )
            )
        ));

        // Add more solar challenges...

        return challenges;
    }

    // Similar methods for other energy domains...
}
```

### 2.3 Energy Prompt Laboratory

The Energy Prompt Laboratory is a sandbox environment where players can experiment with different prompt techniques and energy scenarios. It serves as both a practice area and a creative space for players to develop their skills.

Features include:

- **Technique Library**: Access to all unlocked prompt engineering techniques with examples specific to energy transformation
- **Energy Scenario Generator**: Creates randomized energy challenges for practice
- **Prompt Templates**: Pre-built templates for different energy domains that players can modify
- **Performance Metrics**: Real-time feedback on prompt effectiveness based on clarity, specificity, and alignment with energy goals

```pseudocode
// Energy Prompt Laboratory
class EnergyPromptLaboratory {
    // Available prompt techniques
    private List<PromptTechnique> unlockedTechniques;

    // Available energy scenarios
    private List<EnergyScenario> unlockedScenarios;

    // Prompt templates for different energy domains
    private Map<String, String> promptTemplates;

    // Evaluation metrics
    private PromptEvaluator evaluator;

    // Initialize the laboratory with player's unlocked content
    public EnergyPromptLaboratory(PlayerProgress progress) {
        this.unlockedTechniques = getUnlockedTechniques(progress);
        this.unlockedScenarios = getUnlockedScenarios(progress);
        this.promptTemplates = initializePromptTemplates();
        this.evaluator = new PromptEvaluator();
    }

    // Generate a random energy scenario for practice
    public EnergyScenario generateRandomScenario() {
        if (unlockedScenarios.isEmpty()) {
            return createDefaultScenario();
        }

        Random random = new Random();
        int index = random.nextInt(unlockedScenarios.size());
        return unlockedScenarios.get(index);
    }

    // Get template for a specific energy domain
    public String getPromptTemplate(String domain) {
        return promptTemplates.getOrDefault(domain, getDefaultTemplate());
    }

    // Evaluate a player's prompt
    public PromptEvaluation evaluatePrompt(String prompt, EnergyScenario scenario) {
        return evaluator.evaluate(prompt, scenario);
    }

    // Initialize prompt templates for different energy domains
    private Map<String, String> initializePromptTemplates() {
        Map<String, String> templates = new HashMap<>();

        // Solar energy template
        templates.put("SolarEnergy",
            "Act as an energy optimization expert. I need help with a solar energy system that has the following parameters:\n" +
            "[PARAMETERS]\n\n" +
            "I need to [OBJECTIVE]. Consider factors like [FACTORS].\n\n" +
            "Provide your response in the following format:\n" +
            "1. Analysis of current setup\n" +
            "2. Recommended optimizations\n" +
            "3. Expected improvement in energy output"
        );

        // Energy storage template
        templates.put("EnergyStorage",
            "You are an energy storage specialist. I'm designing a storage system with these requirements:\n" +
            "[REQUIREMENTS]\n\n" +
            "The system needs to [FUNCTION]. Important constraints include [CONSTRAINTS].\n\n" +
            "Please provide:\n" +
            "- Recommended storage technology\n" +
            "- Sizing calculations\n" +
            "- Charge/discharge strategy\n" +
            "- Cost-benefit analysis"
        );

        // Add more templates for other domains...

        return templates;
    }

    // Get default template when domain-specific one isn't available
    private String getDefaultTemplate() {
        return "I need help with an energy transformation challenge related to [DOMAIN].\n\n" +
               "Context: [CONTEXT]\n\n" +
               "Objective: [OBJECTIVE]\n\n" +
               "Please provide a detailed analysis and recommendation.";
    }
}
```

### 2.4 AI Simulation System

The AI Simulation System emulates how a large language model would respond to the player's prompts in energy transformation scenarios. It provides realistic feedback while teaching players about AI capabilities and limitations.

Key features:

- **Response Generation**: Simulates AI responses to player prompts based on the scenario
- **Error Patterns**: Replicates common LLM errors (hallucinations, misunderstandings) to teach prompt refinement
- **Capability Levels**: Different AI models with varying capabilities for different challenge levels
- **Energy Domain Knowledge**: Simulated AI responses incorporate accurate energy transformation concepts

```pseudocode
// AI Simulation System
class AISimulationSystem {
    // Different AI models with varying capabilities
    private Map<String, AIModel> availableModels;

    // Energy domain knowledge base
    private EnergyKnowledgeBase knowledgeBase;

    // Currently selected AI model
    private AIModel currentModel;

    // Initialize the AI simulation system
    public AISimulationSystem() {
        this.availableModels = initializeAIModels();
        this.knowledgeBase = new EnergyKnowledgeBase();
        this.currentModel = availableModels.get("basic");
    }

    // Process a player's prompt and generate a simulated response
    public AIResponse processPrompt(String prompt, EnergyScenario scenario) {
        // Extract key information from the prompt
        PromptAnalysis analysis = analyzePrompt(prompt);

        // Get relevant energy knowledge for the scenario
        List<EnergyFact> relevantKnowledge = knowledgeBase.getRelevantFacts(
            scenario.getDomain(),
            analysis.getKeywords()
        );

        // Generate response based on model capabilities, prompt quality, and knowledge
        return currentModel.generateResponse(prompt, analysis, relevantKnowledge, scenario);
    }

    // Analyze a prompt to extract key information
    private PromptAnalysis analyzePrompt(String prompt) {
        // Extract keywords, instructions, constraints, etc.
        List<String> keywords = extractKeywords(prompt);
        List<String> instructions = extractInstructions(prompt);
        List<String> constraints = extractConstraints(prompt);

        // Determine prompt techniques used
        List<String> techniquesUsed = identifyPromptTechniques(prompt);

        // Assess overall prompt quality
        double clarity = assessClarity(prompt);
        double specificity = assessSpecificity(prompt);
        double structure = assessStructure(prompt);

        return new PromptAnalysis(
            keywords,
            instructions,
            constraints,
            techniquesUsed,
            clarity,
            specificity,
            structure
        );
    }

    // Switch to a different AI model
    public void switchModel(String modelName) {
        if (availableModels.containsKey(modelName)) {
            currentModel = availableModels.get(modelName);
        }
    }

    // Initialize different AI models with varying capabilities
    private Map<String, AIModel> initializeAIModels() {
        Map<String, AIModel> models = new HashMap<>();

        // Basic model - limited capabilities, frequent errors
        models.put("basic", new AIModel(
            "EnergyGPT Basic",
            0.3,  // accuracy
            0.4,  // knowledge depth
            0.5,  // instruction following
            0.6   // hallucination tendency
        ));

        // Intermediate model - better capabilities, occasional errors
        models.put("intermediate", new AIModel(
            "EnergyGPT Plus",
            0.6,  // accuracy
            0.7,  // knowledge depth
            0.7,  // instruction following
            0.3   // hallucination tendency
        ));

        // Advanced model - strong capabilities, rare errors
        models.put("advanced", new AIModel(
            "EnergyGPT Pro",
            0.9,  // accuracy
            0.9,  // knowledge depth
            0.9,  // instruction following
            0.1   // hallucination tendency
        ));

        return models;
    }
}
```

### 2.5 Visual Feedback System

The Visual Feedback System provides dynamic pixel art visualizations of energy systems that respond to the player's prompts. These visualizations help players understand the impact of their prompt engineering on energy transformation outcomes.

Features:

- **Energy Flow Visualization**: Animated pixel art showing energy flowing through systems
- **System State Indicators**: Visual cues showing efficiency, output, and stability of energy systems
- **Before/After Comparisons**: Visual comparison of energy systems before and after prompt implementation
- **Error Visualization**: Visual representation of problems in energy systems that need to be addressed

```pseudocode
// Visual Feedback System
class VisualFeedbackSystem {
    // Pixel art assets for different energy components
    private Map<String, PixelArtAsset> energyAssets;

    // Animation controller for energy flows
    private AnimationController animationController;

    // Current visualization state
    private EnergySystemState currentState;

    // Initialize the visual feedback system
    public VisualFeedbackSystem() {
        this.energyAssets = loadEnergyAssets();
        this.animationController = new AnimationController();
        this.currentState = new EnergySystemState();
    }

    // Update visualization based on AI response to player's prompt
    public void updateVisualization(AIResponse response, EnergyScenario scenario) {
        // Extract energy system changes from the AI response
        SystemChanges changes = extractSystemChanges(response, scenario);

        // Update the current energy system state
        currentState.applyChanges(changes);

        // Create visualization of the updated state
        renderEnergySystem(currentState);

        // Animate energy flows based on the current state
        animateEnergyFlows(currentState);
    }

    // Create a before/after comparison visualization
    public ComparisonVisualization createBeforeAfterComparison(
        EnergySystemState before,
        EnergySystemState after
    ) {
        // Render the before state
        PixelArtScene beforeScene = renderEnergySystem(before);

        // Render the after state
        PixelArtScene afterScene = renderEnergySystem(after);

        // Calculate key metrics for comparison
        Map<String, Double> metricChanges = calculateMetricChanges(before, after);

        // Create the comparison visualization
        return new ComparisonVisualization(beforeScene, afterScene, metricChanges);
    }

    // Render an energy system state as pixel art
    private PixelArtScene renderEnergySystem(EnergySystemState state) {
        PixelArtScene scene = new PixelArtScene();

        // Add background elements based on scenario type
        addBackgroundElements(scene, state.getScenarioType());

        // Add energy generation components
        for (EnergyComponent component : state.getGenerationComponents()) {
            PixelArtAsset asset = energyAssets.get(component.getType());
            scene.addAsset(asset, component.getPosition(), component.getScale());

            // Add visual indicators for component efficiency/output
            addComponentIndicators(scene, component);
        }

        // Add energy storage components
        for (StorageComponent storage : state.getStorageComponents()) {
            PixelArtAsset asset = energyAssets.get(storage.getType());
            scene.addAsset(asset, storage.getPosition(), storage.getScale());

            // Add charge level indicator
            addChargeIndicator(scene, storage);
        }

        // Add distribution network
        addDistributionNetwork(scene, state.getDistributionNetwork());

        // Add consumption elements
        addConsumptionElements(scene, state.getConsumptionPoints());

        return scene;
    }

    // Animate energy flows through the system
    private void animateEnergyFlows(EnergySystemState state) {
        // Clear existing animations
        animationController.clearAnimations();

        // Create energy flow paths based on system connections
        List<FlowPath> flowPaths = createFlowPaths(state);

        // Set animation parameters based on energy throughput
        for (FlowPath path : flowPaths) {
            float speed = calculateFlowSpeed(path.getThroughput());
            Color color = determineEnergyColor(path.getEnergyType());
            float intensity = calculateFlowIntensity(path.getEfficiency());

            // Add flow animation to controller
            animationController.addFlowAnimation(path, speed, color, intensity);
        }

        // Start animations
        animationController.startAnimations();
    }

    // Load pixel art assets for different energy components
    private Map<String, PixelArtAsset> loadEnergyAssets() {
        Map<String, PixelArtAsset> assets = new HashMap<>();

        // Generation assets
        assets.put("solar_panel", loadAsset("assets/solar_panel.png"));
        assets.put("wind_turbine", loadAsset("assets/wind_turbine.png"));
        assets.put("hydro_dam", loadAsset("assets/hydro_dam.png"));

        // Storage assets
        assets.put("battery", loadAsset("assets/battery.png"));
        assets.put("pumped_hydro", loadAsset("assets/pumped_hydro.png"));
        assets.put("thermal_storage", loadAsset("assets/thermal_storage.png"));

        // Grid assets
        assets.put("power_line", loadAsset("assets/power_line.png"));
        assets.put("transformer", loadAsset("assets/transformer.png"));
        assets.put("substation", loadAsset("assets/substation.png"));

        // Consumption assets
        assets.put("city", loadAsset("assets/city.png"));
        assets.put("factory", loadAsset("assets/factory.png"));
        assets.put("home", loadAsset("assets/home.png"));

        return assets;
    }
}
```

### 2.6 Prompt Evaluation System

The Prompt Evaluation System assesses player prompts based on principles from the `prompt_guide.md` document, adapted for energy transformation contexts. It provides detailed feedback to help players improve their prompt engineering skills.

Evaluation criteria include:

- **Clarity**: How clearly the prompt communicates the energy-related task
- **Specificity**: How well the prompt defines the parameters of the energy challenge
- **Structure**: Appropriate use of instructions, examples, and constraints for energy scenarios
- **Technique Application**: Effective use of appropriate prompt techniques for the energy domain
- **Energy Domain Knowledge**: Accurate incorporation of energy concepts and terminology

```pseudocode
// Prompt Evaluation System
class PromptEvaluationSystem {
    // Evaluation criteria based on prompt_guide.md principles
    private List<EvaluationCriterion> criteria;

    // Energy domain knowledge checker
    private EnergyDomainChecker domainChecker;

    // Initialize the evaluation system
    public PromptEvaluationSystem() {
        this.criteria = initializeEvaluationCriteria();
        this.domainChecker = new EnergyDomainChecker();
    }

    // Evaluate a player's prompt
    public PromptEvaluation evaluatePrompt(String prompt, EnergyScenario scenario) {
        Map<String, Double> scores = new HashMap<>();
        Map<String, String> feedback = new HashMap<>();

        // Evaluate each criterion
        for (EvaluationCriterion criterion : criteria) {
            EvaluationResult result = criterion.evaluate(prompt, scenario);
            scores.put(criterion.getName(), result.getScore());
            feedback.put(criterion.getName(), result.getFeedback());
        }

        // Check energy domain knowledge
        EnergyDomainResult domainResult = domainChecker.checkDomainKnowledge(prompt, scenario);
        scores.put("EnergyDomainKnowledge", domainResult.getScore());
        feedback.put("EnergyDomainKnowledge", domainResult.getFeedback());

        // Calculate overall score
        double overallScore = calculateOverallScore(scores);

        return new PromptEvaluation(scores, feedback, overallScore);
    }

    // Initialize evaluation criteria based on prompt_guide.md principles
    private List<EvaluationCriterion> initializeEvaluationCriteria() {
        List<EvaluationCriterion> criteriaList = new ArrayList<>();

        // Clarity criterion
        criteriaList.add(new EvaluationCriterion(
            "Clarity",
            "How clearly the prompt communicates the energy-related task",
            (prompt, scenario) -> {
                double score = 0.0;
                String feedback = "";

                // Check for clear objective statement
                boolean hasObjective = hasObjectiveStatement(prompt);

                // Check for clear instructions
                boolean hasInstructions = hasInstructions(prompt);

                // Check for appropriate language
                boolean hasAppropriateLanguage = checkLanguageClarity(prompt);

                // Calculate score based on checks
                if (hasObjective && hasInstructions && hasAppropriateLanguage) {
                    score = 1.0;
                    feedback = "Excellent clarity. Your prompt clearly states the objective and provides clear instructions using appropriate language.";
                } else if (hasObjective && hasInstructions) {
                    score = 0.8;
                    feedback = "Good clarity. Your prompt states the objective and provides instructions, but could use more precise language.";
                } else if (hasObjective) {
                    score = 0.5;
                    feedback = "Moderate clarity. Your prompt states the objective but lacks clear instructions.";
                } else {
                    score = 0.2;
                    feedback = "Low clarity. Your prompt lacks a clear objective and instructions.";
                }

                return new EvaluationResult(score, feedback);
            }
        ));

        // Add more criteria (Specificity, Structure, Technique Application)

        return criteriaList;
    }
}
```

## 3. Game Modules

### 3.1 Energy Conversion Module

The Energy Conversion Module focuses on teaching players how to craft prompts for optimizing renewable energy conversion processes. Players learn to apply zero-shot and few-shot prompting techniques to solar, wind, and hydro energy scenarios.

Key learning objectives:

- Understanding basic energy conversion principles
- Crafting clear instructions for energy optimization
- Specifying output formats for technical energy data
- Providing relevant context for energy conversion scenarios

```pseudocode
// Energy Conversion Module
class EnergyConversionModule {
    // Available conversion challenges
    private List<Challenge> conversionChallenges;

    // Player's progress in this module
    private ModuleProgress progress;

    // Energy conversion knowledge base
    private ConversionKnowledgeBase knowledgeBase;

    // Initialize the module
    public EnergyConversionModule(PlayerProgress playerProgress) {
        this.progress = playerProgress.getModuleProgress("EnergyConversion");
        this.conversionChallenges = initializeConversionChallenges();
        this.knowledgeBase = new ConversionKnowledgeBase();
    }

    // Get next available challenge based on player progress
    public Challenge getNextChallenge() {
        int currentLevel = progress.getCurrentLevel();
        List<String> completedChallenges = progress.getCompletedChallengeIds();

        return conversionChallenges.stream()
            .filter(challenge -> challenge.getLevel() <= currentLevel)
            .filter(challenge -> !completedChallenges.contains(challenge.getId()))
            .findFirst()
            .orElse(null);
    }

    // Evaluate player's prompt for a conversion challenge
    public ChallengeResult evaluatePrompt(String prompt, Challenge challenge) {
        // Analyze prompt quality
        PromptAnalysis analysis = analyzePrompt(prompt, challenge);

        // Simulate AI response to the prompt
        AIResponse response = simulateAIResponse(prompt, challenge, analysis);

        // Calculate energy conversion efficiency based on prompt quality
        double conversionEfficiency = calculateConversionEfficiency(analysis, response);

        // Generate feedback for the player
        String feedback = generateFeedback(analysis, conversionEfficiency);

        // Check if challenge is completed
        boolean isCompleted = conversionEfficiency >= challenge.getThreshold();

        // Update player progress if completed
        if (isCompleted) {
            progress.completeChallenge(challenge.getId());
        }

        return new ChallengeResult(isCompleted, conversionEfficiency, feedback, response);
    }

    // Calculate energy conversion efficiency based on prompt quality
    private double calculateConversionEfficiency(PromptAnalysis analysis, AIResponse response) {
        // Base efficiency determined by prompt clarity and specificity
        double baseEfficiency = (analysis.getClarity() + analysis.getSpecificity()) / 2.0;

        // Adjust based on appropriate technique usage
        double techniqueMultiplier = analysis.getTechniqueScore();

        // Adjust based on energy domain knowledge
        double knowledgeMultiplier = analysis.getEnergyKnowledgeScore();

        // Calculate final efficiency
        return baseEfficiency * techniqueMultiplier * knowledgeMultiplier;
    }
}
```

### 3.2 Energy Storage Module

The Energy Storage Module teaches players to craft prompts for designing and optimizing energy storage systems. Players apply few-shot and role prompting techniques to battery, thermal, and mechanical storage scenarios.

Key learning objectives:

- Understanding energy storage principles and technologies
- Using role prompting to access specialized knowledge
- Providing examples to guide AI responses on technical storage parameters
- Crafting prompts that balance multiple constraints (cost, efficiency, lifespan)

### 3.3 Grid Integration Module

The Grid Integration Module focuses on teaching players to craft prompts for solving complex grid integration challenges. Players apply chain of thought and step-back prompting to smart grid, demand response, and microgrid scenarios.

Key learning objectives:

- Understanding grid stability and integration concepts
- Using chain of thought to break down complex grid problems
- Applying step-back prompting to consider broader energy system principles
- Crafting prompts that balance technical, economic, and social factors

### 3.4 Energy Policy Module

The Energy Policy Module teaches players to craft prompts for developing and evaluating energy policies. Players apply self-consistency and tree of thoughts techniques to carbon pricing, renewable incentives, and energy access scenarios.

Key learning objectives:

- Understanding energy policy frameworks and impacts
- Using self-consistency to generate multiple policy perspectives
- Applying tree of thoughts to explore policy decision branches
- Crafting prompts that balance environmental, economic, and social considerations

### 3.5 System Transformation Module

The System Transformation Module focuses on teaching players to craft prompts for comprehensive energy system transformation. Players apply ReAct and multimodal prompting to sector coupling, circular economy, and net-zero transition scenarios.

Key learning objectives:

- Understanding system-level energy transformation concepts
- Using ReAct to combine reasoning with external data sources
- Applying multimodal prompting with energy system visualizations
- Crafting prompts that address complex interdependencies across energy sectors

## 4. Implementation Guidelines

### 4.1 Modular Architecture

The game should be implemented using a modular architecture to facilitate maintenance, updates, and extensions:

```pseudocode
// Main game architecture
class EnergyPromptNinja {
    // Core systems
    private LearningProgressionSystem progressionSystem;
    private ChallengeModuleSystem challengeSystem;
    private EnergyPromptLaboratory laboratory;
    private AISimulationSystem aiSystem;
    private VisualFeedbackSystem visualSystem;
    private PromptEvaluationSystem evaluationSystem;

    // Game modules
    private Map<String, GameModule> modules;

    // Player data
    private PlayerProgress playerProgress;

    // Initialize the game
    public EnergyPromptNinja() {
        this.playerProgress = new PlayerProgress();

        // Initialize core systems
        this.progressionSystem = new LearningProgressionSystem();
        this.challengeSystem = new ChallengeModuleSystem(playerProgress);
        this.laboratory = new EnergyPromptLaboratory(playerProgress);
        this.aiSystem = new AISimulationSystem();
        this.visualSystem = new VisualFeedbackSystem();
        this.evaluationSystem = new PromptEvaluationSystem();

        // Initialize game modules
        this.modules = initializeGameModules();
    }

    // Initialize game modules
    private Map<String, GameModule> initializeGameModules() {
        Map<String, GameModule> moduleMap = new HashMap<>();

        moduleMap.put("EnergyConversion", new EnergyConversionModule(playerProgress));
        moduleMap.put("EnergyStorage", new EnergyStorageModule(playerProgress));
        moduleMap.put("GridIntegration", new GridIntegrationModule(playerProgress));
        moduleMap.put("EnergyPolicy", new EnergyPolicyModule(playerProgress));
        moduleMap.put("SystemTransformation", new SystemTransformationModule(playerProgress));

        return moduleMap;
    }

    // Get a specific game module
    public GameModule getModule(String moduleName) {
        return modules.getOrDefault(moduleName, null);
    }

    // Process a player's prompt
    public GameResponse processPrompt(String prompt, String moduleId, String challengeId) {
        // Get the appropriate module
        GameModule module = modules.get(moduleId);

        if (module == null) {
            return new GameResponse(false, "Module not found", null, null);
        }

        // Get the challenge
        Challenge challenge = module.getChallenge(challengeId);

        if (challenge == null) {
            return new GameResponse(false, "Challenge not found", null, null);
        }

        // Evaluate the prompt
        PromptEvaluation evaluation = evaluationSystem.evaluatePrompt(prompt, challenge.getScenario());

        // Generate AI response
        AIResponse aiResponse = aiSystem.processPrompt(prompt, challenge.getScenario());

        // Update visual feedback
        VisualFeedback visualFeedback = visualSystem.updateVisualization(aiResponse, challenge.getScenario());

        // Process challenge result
        ChallengeResult result = module.processChallenge(challenge, prompt, evaluation, aiResponse);

        // Update player progress if challenge completed
        if (result.isCompleted()) {
            playerProgress.completeChallenge(moduleId, challengeId);

            // Check if player can advance to next level
            if (progressionSystem.canAdvanceToNextLevel()) {
                progressionSystem.tryAdvanceToNextLevel();
            }
        }

        return new GameResponse(
            result.isCompleted(),
            result.getFeedback(),
            aiResponse,
            visualFeedback
        );
    }
}
```

### 4.2 Data-Driven Content

Energy transformation content should be stored in external data files rather than hardcoded, allowing for easy updates and localization:

```pseudocode
// Energy knowledge loading system
class EnergyKnowledgeLoader {
    // Load energy concepts from data files
    public static List<EnergyConcept> loadEnergyConcepts(String domain) {
        String filePath = "data/energy_concepts/" + domain + ".json";
        String jsonContent = FileUtils.readFile(filePath);

        // Parse JSON into energy concepts
        return parseEnergyConcepts(jsonContent);
    }

    // Load energy scenarios from data files
    public static List<EnergyScenario> loadEnergyScenarios(String domain) {
        String filePath = "data/energy_scenarios/" + domain + ".json";
        String jsonContent = FileUtils.readFile(filePath);

        // Parse JSON into energy scenarios
        return parseEnergyScenarios(jsonContent);
    }

    // Load prompt templates from data files
    public static Map<String, String> loadPromptTemplates() {
        String filePath = "data/prompt_templates/templates.json";
        String jsonContent = FileUtils.readFile(filePath);

        // Parse JSON into prompt templates
        return parsePromptTemplates(jsonContent);
    }
}
```

### 4.3 Extensibility

The game should be designed for easy extension with new energy domains, prompt techniques, and challenge types:

```pseudocode
// Plugin system for extending the game
class PluginSystem {
    // Available plugins
    private List<GamePlugin> loadedPlugins;

    // Core game reference
    private EnergyPromptNinja game;

    // Initialize the plugin system
    public PluginSystem(EnergyPromptNinja game) {
        this.game = game;
        this.loadedPlugins = new ArrayList<>();
    }

    // Load plugins from the plugins directory
    public void loadPlugins() {
        String pluginsDir = "plugins/";
        List<String> pluginFiles = FileUtils.listFiles(pluginsDir);

        for (String pluginFile : pluginFiles) {
            GamePlugin plugin = loadPlugin(pluginsDir + pluginFile);
            if (plugin != null) {
                loadedPlugins.add(plugin);
                plugin.initialize(game);
            }
        }
    }

    // Load a specific plugin
    private GamePlugin loadPlugin(String pluginPath) {
        try {
            // Load plugin class
            String pluginContent = FileUtils.readFile(pluginPath);

            // Create plugin instance
            GamePlugin plugin = createPluginInstance(pluginContent);

            return plugin;
        } catch (Exception e) {
            System.err.println("Failed to load plugin: " + pluginPath);
            return null;
        }
    }
}
```

## 5. Conclusion

Energy Prompt Ninja transforms the original Prompt Ninja concept by integrating the theme of energy transformation throughout the game. By teaching prompt engineering skills in the context of solving energy challenges, the game provides both technical AI literacy and domain-specific knowledge about sustainable energy systems.

The modular design ensures that the game can be easily extended with new content, while the focus on visual feedback through pixel art helps players understand the impact of their prompts on energy systems. The progression system guides players from basic prompting techniques to advanced methods, all while exploring increasingly complex energy transformation scenarios.

Through this engaging educational experience, players will develop valuable skills for the future of both AI and energy systems, learning how these technologies can work together to address some of the world's most pressing challenges.
