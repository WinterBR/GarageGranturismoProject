package com.granturismo.garage.domain;

/**
 * Drivetrain layout, using the classic Gran Turismo notation:
 * first letter = engine position, second letter = driven wheels.
 * <p>
 * Note: the constant {@code FOUR_WD} represents "4WD" (permanent
 * four-wheel drive). Java enum constants cannot start with a digit,
 * so "4WD" itself can't be a constant name — use {@code FOUR_WD} as
 * the value in requests/responses; {@link #getCode()} returns the
 * human-friendly "4WD" string for display purposes.
 */
public enum Drivetrain {
    FF("Front engine, Front-wheel drive"),
    FR("Front engine, Rear-wheel drive"),
    FA("Front engine, All-wheel drive"),
    MR("Mid engine, Rear-wheel drive"),
    MF("Mid engine, Front-wheel drive"),
    MA("Mid engine, All-wheel drive"),
    RR("Rear engine, Rear-wheel drive"),
    RF("Rear engine, Front-wheel drive"),
    FOUR_WD("4WD", "Permanent four-wheel drive"),
    AWD("All-wheel drive (on-demand)");

    private final String code;
    private final String description;

    Drivetrain(String description) {
        this.code = this.name();
        this.description = description;
    }

    Drivetrain(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
