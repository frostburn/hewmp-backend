const EPSILON = 1e-5;
const TWO_PI = 2*Math.PI;

function sine(phase) {
    return Math.sin(TWO_PI*phase);
}

function cosine(phase) {
    return Math.cos(TWO_PI*phase);
}

function clip(value, minValue, maxValue) {
    return Math.min(Math.max(value, minValue), maxValue);
}

function softsaw(phase, sharpness) {
    phase *= TWO_PI;
    sharpness = clip(sharpness, EPSILON, 1.0 - EPSILON);
    return Math.atan(
        sharpness * Math.sin(phase) / (1.0 + sharpness * Math.cos(phase))
    ) / Math.asin(sharpness);
}

function softtri(phase, sharpness) {
    sharpness = clip(sharpness, EPSILON, 1.0);
    return Math.asin(Math.sin(TWO_PI * phase) * sharpness) / Math.asin(sharpness);
}

function softarc(phase, sharpness) {
    if (sharpness < EPSILON) {
        return Math.cos(TWO_PI * phase);
    } else if (sharpness < 1) {
        return (
            Math.hypot(
                (1 + sharpness) * Math.cos(Math.PI * phase),
                (1 - sharpness) * Math.sin(Math.PI * phase)
            ) - 1
        ) / sharpness;
    } else {
        return Math.abs(Math.cos(Math.PI * phase)) * 2 - 1;
    }
}

function rtanh(x) {
    return 0.5 + 0.5*Math.tanh(x);
}

function natan(x) {
    return 2*Math.atan(x)/Math.PI;
}

function ratan(x) {
    return Math.atan(x)/Math.PI + 0.5;
}

