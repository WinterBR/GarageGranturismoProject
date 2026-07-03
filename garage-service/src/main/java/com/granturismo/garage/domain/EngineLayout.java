package com.granturismo.garage.domain;

/**
 * Engine cylinder layout (shape), independent of the engine's
 * given name (e.g. "Coyote V8", "W16 Quad-Turbo").
 */
public enum EngineLayout {
    I3("Inline-3"),
    I4("Inline-4"),
    I5("Inline-5"),
    I6("Inline-6"),
    FLAT4("Flat-4 / Boxer-4"),
    FLAT6("Flat-6 / Boxer-6"),
    V4("V4"),
    V6("V6"),
    V8("V8"),
    V10("V10"),
    V12("V12"),
    V16("V16"),
    W8("W8"),
    W12("W12"),
    W16("W16"),
    ROTARY("Rotary (Wankel)"),
    ELECTRIC("Electric motor(s), no internal combustion engine"),
    HYBRID("Hybrid powertrain (combustion + electric)");

    private final String description;

    EngineLayout(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
