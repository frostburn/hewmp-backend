const MOS_PATTERNS = {
    "1L 4s": "Lssss",
    "2L 3s": "LsLss",
    "3L 2s": "LLsLs",
    "4L 1s": "LLLLs",

    "1L 5s": "Lsssss",
    "2L 4s": "LssLss",
    "3L 3s": "LsLsLs",
    "4L 2s": "LLsLLs",
    "5L 1s": "LLLLLs",

    "1L 6s": "Lssssss",
    "2L 5s": "LssLsss",
    "3L 4s": "LsLsLss",
    "4L 3s": "LLsLsLs",
    "5L 2s": "LLLsLLs",
    "6L 1s": "LLLsLLL",

    "1L 7s": "Lsssssss",
    "2L 6s": "LsssLsss",
    "3L 5s": "ssLssLsL",
    "4L 4s": "sLsLsLsL",
    "5L 3s": "LLsLLsLs",
    "6L 2s": "LLLsLLLs",
    "7L 1s": "LLLLLLLs",

    "1L 8s": "Lssssssss",
    "2L 7s": "LsssLssss",
    "3L 6s": "LssLssLss",
    "4L 5s": "LsLsLsLss",
    "5L 4s": "LsLsLsLsL",
    "6L 3s": "LLsLLsLLs",
    "7L 2s": "LLLLsLLLs",
    "8L 1s": "LLLLLLs",

    "1L 9s": "Lsssssssss",
    "2L 8s": "ssLssssLss",
    "3L 7s": "LssLssLsss",
    "4L 6s": "sLsLssLsLs",
    "5L 5s": "LsLsLsLsLs",
    "6L 4s": "LsLsLLsLsL",
    "7L 3s": "LLLsLLsLLs",
    "8L 2s": "LLLLsLLLLs",
    "9L 1s": "LLLLLLLLLs",

    "1L 10s": "Lssssssssss",
    "2L 9s": "LssssLsssss",
    "3L 8s": "LsssLsssLss",
    "4L 7s": "LssLssLssLs",
    "5L 6s": "LssLsLsLsLs",
    "6L 5s": "LLsLsLsLsLs",
    "7L 4s": "LLsLLsLLsLs",
    "8L 3s": "LLLsLLLsLLs",
    "9L 2s": "LLLLLsLLLLs",
    "10L 1s": "LLLLLLLLLLs",
};

const STEP_RATIOS = [
    ["equalized", 1, 1],
    ["supersoft", 4, 3],
    ["soft", 3, 2],
    ["semisoft", 5, 3],
    ["basic", 2, 1],
    ["semihard", 5, 2],
    ["hard", 3, 1],
    ["superhard", 4, 1],
    ["paucitonic", 1, 0],
];


const NAME_RANGES = [
    ["ultrasoft", 6, 8],
    ["parasoft", 8, 9],
    ["quasisoft", 9, 10],
    ["minisoft", 10, 12],
    ["minihard", 12, 15],
    ["quasihard", 15, 18],
    ["parahard", 18, 24],
    ["ultrahard", 24, Infinity],
];

const MONZO_BY_COORDS = new Map();

const KEY_EL_BY_COORDS = new Map();

const VOICE_BY_COORDS = new Map();

let BACKQUOTE_EL;
let LEFT_SHIFT_EL;
let RIGHT_SHIFT_EL;

const DEFAULT_WAVEFORMS = ["sine", "square", "sawtooth", "triangle"];
let WAVEFORMS;

const VOICES = [];

let DIVISIONS;

let MAPPING;

const PLAY_INSTRUCTIONS = "Play something using the keys QWERTY etc. The Shift key toggles sustain.";

function clearContent() {
    const contentDiv = document.getElementById("content");
    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }
}

function populateMosSelection() {
    // --- MOS ---

    clearContent();
    const contentDiv = document.getElementById("content");
    const title = document.createElement("h3");
    title.appendChild(document.createTextNode("Select MOS"));
    contentDiv.appendChild(title);

    const pyramidDiv = document.createElement("div");
    pyramidDiv.classList.add("pyramid");
    contentDiv.appendChild(pyramidDiv);
    for (let size = 5; size < 12; ++size) {
        const rowSpan = document.createElement("span");
        for (let countL = 1; countL < size; ++countL) {
            const countS = size - countL;
            const button = document.createElement("button");
            const text = document.createTextNode(`${countL}L ${countS}s`);
            button.onclick = e => {selectMos(countL, countS)};
            button.appendChild(text);
            rowSpan.appendChild(button);
        }
        rowSpan.classList.add("pyramid-row");
        pyramidDiv.appendChild(rowSpan);
    }

    const br = document.createElement("br");
    contentDiv.appendChild(br);
    const freePatternLabel = document.createElement("label");
    freePatternLabel.for = "free-pattern";
    freePatternLabel.appendChild(document.createTextNode("Free pattern: "));
    contentDiv.appendChild(freePatternLabel);
    const freePatternInput = document.createElement("input");
    freePatternInput.id = "free-pattern";
    freePatternInput.placeholder = "ssLsL";
    freePatternInput.pattern = "[Ls]+";
    contentDiv.appendChild(freePatternInput);
    const goButton = document.createElement("button");
    goButton.appendChild(document.createTextNode("Go"));
    goButton.onclick = e => {
        if (freePatternInput.validity.valid) {
            selectPattern(freePatternInput.value);
        }
    };
    contentDiv.appendChild(goButton);

    // --- Isomorphic ---

    contentDiv.appendChild(document.createElement("br"));
    const isoTitle = document.createElement("h3");
    isoTitle.appendChild(document.createTextNode("Select isomorphic keyboard"));
    contentDiv.appendChild(isoTitle);

    const edoLabel = document.createElement("label");
    edoLabel.appendChild(document.createTextNode("edo: "));
    edoLabel.for = "edo";
    contentDiv.appendChild(edoLabel);
    const edoInput = document.createElement("input");
    edoInput.id = "edo";
    edoInput.classList.add("number");
    edoInput.type = "number";
    edoInput.value = 12;
    edoInput.min = 1;
    contentDiv.appendChild(edoInput);

    const xLabel = document.createElement("label");
    xLabel.appendChild(document.createTextNode("x: "));
    xLabel.for = "x";
    contentDiv.appendChild(xLabel);
    const xInput = document.createElement("input");
    xInput.id = " x";
    xInput.classList.add("number");
    xInput.type = "number";
    xInput.value = 1;
    xInput.min = 1;
    contentDiv.appendChild(xInput);

    const yLabel = document.createElement("label");
    yLabel.appendChild(document.createTextNode(" y: "));
    yLabel.for = "y";
    contentDiv.appendChild(yLabel);
    const yInput = document.createElement("input");
    yInput.id = "y";
    yInput.classList.add("number");
    yInput.type = "number";
    yInput.value = 5;
    yInput.min = 1;
    contentDiv.appendChild(yInput);

    const isoLabel = document.createElement("label");
    isoLabel.appendChild(document.createTextNode(" "));
    contentDiv.appendChild(isoLabel);
    const isoButton = document.createElement("button");
    isoButton.appendChild(document.createTextNode("Create"));
    isoButton.onclick = e => {
        selectIsomorphic(parseInt(edoInput.value), parseInt(xInput.value), parseInt(yInput.value));
    };
    contentDiv.appendChild(isoButton);
}

function initKeyboard() {
    const keyboardDiv = document.createElement("div");
    const digitRow = document.createElement("div");
    keyboardDiv.appendChild(digitRow);
    const qwertyRow = document.createElement("div");
    keyboardDiv.appendChild(qwertyRow);
    const asdfRow = document.createElement("div");
    keyboardDiv.appendChild(asdfRow);
    const zxcRow = document.createElement("div");
    keyboardDiv.appendChild(zxcRow);

    let offset = document.createElement("span");
    offset.classList.add("qwerty-offset");
    qwertyRow.appendChild(offset);

    offset = document.createElement("span");
    offset.classList.add("asdf-offset");
    asdfRow.appendChild(offset);

    BACKQUOTE_EL = document.createElement("span");
    BACKQUOTE_EL.appendChild(document.createTextNode("▭"));
    BACKQUOTE_EL.classList.add("key");
    BACKQUOTE_EL.classList.add("off");
    digitRow.appendChild(BACKQUOTE_EL);

    LEFT_SHIFT_EL = document.createElement("span");
    LEFT_SHIFT_EL.classList.add("key");
    LEFT_SHIFT_EL.classList.add("left-shift");
    zxcRow.appendChild(LEFT_SHIFT_EL);

    RIGHT_SHIFT_EL = document.createElement("span");
    RIGHT_SHIFT_EL.classList.add("key");
    RIGHT_SHIFT_EL.classList.add("right-shift");

    MONZO_BY_COORDS.clear();
    KEY_EL_BY_COORDS.clear();

    return keyboardDiv;
}

function selectIsomorphic(divisions, xDelta, yDelta) {
    clearContent();
    const contentDiv = document.getElementById("content");

    const info = document.createElement("p");
    info.appendChild(document.createTextNode(`You selected ${divisions}edo with x=${xDelta} and y=${yDelta}`));
    contentDiv.appendChild(info);
    const instructions = document.createElement("p");
    instructions.appendChild(document.createTextNode(PLAY_INSTRUCTIONS));
    contentDiv.appendChild(instructions);

    const keyboardDiv = initKeyboard();
    contentDiv.appendChild(keyboardDiv);

    const z = 1;
    for (let y = 0; y < 4; ++y) {
        let xMin = 0;
        let xMax = 12;
        if (y == 3) {
            xMin = -1;
            xMax = 10;
        }
        for (let x = xMin; x < xMax; ++x) {
            keyEl = document.createElement("span");
            keyEl.classList.add("key");
            text = document.createTextNode(`${x*xDelta + (3-y)*yDelta}`);
            keyEl.appendChild(text);
            keyboardDiv.children[y].appendChild(keyEl);
            KEY_EL_BY_COORDS.set([x, y, z].toString(), keyEl);
            MONZO_BY_COORDS.set([x, y, z].toString(), [x, 3-y]);
        }
    }

    MAPPING = [Math.log(2) / divisions * xDelta, Math.log(2) / divisions * yDelta];

    keyboardDiv.children[3].appendChild(RIGHT_SHIFT_EL);
    addInstrumentControls();
    DIVISIONS = divisions;
}

function selectMos(countL, countS) {
    clearContent();
    const contentDiv = document.getElementById("content");
    const title = document.createElement("h3");
    title.appendChild(document.createTextNode("Select mode"));
    contentDiv.appendChild(title);

    const key = `${countL}L ${countS}s`;
    let pattern = MOS_PATTERNS[key];
    const m = gcd(countL, countS);
    for (let i = 0; i < countL + countS; i += m) {
        const button = document.createElement("button");
        const text = document.createTextNode(`${pattern}`);
        const currentPattern = pattern;
        button.onclick = e => {selectPattern(currentPattern)};
        button.appendChild(text);
        contentDiv.appendChild(button);
        const br = document.createElement("br");
        contentDiv.appendChild(br);
        pattern = pattern.slice(-1) + pattern.slice(0, -1);
    }
}

function extractCounts(pattern) {
    let countL = 0;
    let countS = 0;
    for (let i = 0; i < pattern.length; ++i) {
        if (pattern[i] == "L") {
            countL++;
        } else {
            countS++;
        }
    }
    return [countL, countS];
}

function selectPattern(pattern) {
    clearContent();
    const contentDiv = document.getElementById("content");
    const title = document.createElement("h3");
    title.appendChild(document.createTextNode("Select hardness"));
    contentDiv.appendChild(title);
    [countL, countS] = extractCounts(pattern);
    STEP_RATIOS.forEach(e => {
        const name = e[0];
        const l = e[1];
        const s = e[2];
        const divisions = countL*l + countS*s;
        const button = document.createElement("button");
        const text = document.createTextNode(`${name}: ${divisions}edo`);
        button.onclick = e => {
            const accidentalSign = parseInt(Array.from(document.getElementsByName("accidental-sign")).find(r => r.checked).value);
            selectStepRatio(pattern, l, s, accidentalSign);
        };
        button.appendChild(text);
        contentDiv.appendChild(button);
        const br = document.createElement("br");
        contentDiv.appendChild(br);
    });
    const accidentalLabel = document.createElement("label");
    accidentalLabel.appendChild(document.createTextNode("Accidentals: "));
    contentDiv.appendChild(accidentalLabel);
    const plusRadio = document.createElement("input");
    plusRadio.type = "radio";
    plusRadio.id = "accidental-plus";
    plusRadio.name = "accidental-sign";
    plusRadio.value = "1";
    plusRadio.checked = true;
    contentDiv.appendChild(plusRadio);
    const plusLabel = document.createElement("label");
    plusLabel.for = "accidental-plus";
    plusLabel.appendChild(document.createTextNode("L+s"));
    contentDiv.appendChild(plusLabel);
    const minusRadio = document.createElement("input");
    minusRadio.type = "radio";
    minusRadio.id = "accidental-minus";
    minusRadio.name = "accidental-sign";
    minusRadio.value = "-1";
    contentDiv.appendChild(minusRadio);
    const minusLabel = document.createElement("label");
    minusLabel.for = "accidental-minus";
    minusLabel.appendChild(document.createTextNode("L-s"));
    contentDiv.appendChild(minusLabel);
    contentDiv.appendChild(document.createElement("br"));

    const largeLabel = document.createElement("label");
    largeLabel.appendChild(document.createTextNode("L: "));
    largeLabel.for = "large";
    contentDiv.appendChild(largeLabel);
    const largeInput = document.createElement("input");
    largeInput.id = "large";
    largeInput.classList.add("number");
    largeInput.type = "number";
    largeInput.value = 5;
    largeInput.min = 1;
    contentDiv.appendChild(largeInput);

    const smallLabel = document.createElement("label");
    smallLabel.appendChild(document.createTextNode("s: "));
    smallLabel.for = "small";
    contentDiv.appendChild(smallLabel);
    const smallInput = document.createElement("input");
    smallInput.id = "small";
    smallInput.classList.add("number");
    smallInput.type = "number";
    smallInput.value = 4;
    smallInput.min = 0;
    smallInput.max = 6;
    contentDiv.appendChild(smallInput);

    const edoLabel = document.createElement("label");
    edoLabel.appendChild(document.createTextNode(" = "));
    contentDiv.appendChild(edoLabel);
    const edoButton = document.createElement("button");
    const edoText = document.createTextNode("");
    edoButton.onclick = e => {
        if (largeInput.validity.valid && smallInput.validity.valid) {
            const accidentalSign = parseInt(Array.from(document.getElementsByName("accidental-sign")).find(r => r.checked).value);
            selectStepRatio(pattern, parseInt(largeInput.value), parseInt(smallInput.value), accidentalSign);
        }
    };
    edoButton.appendChild(edoText);
    contentDiv.appendChild(edoButton);
    function updateText() {
        const l = largeInput.value;
        const s = smallInput.value;
        const divisions = countL*l + countS*s;
        let name;

        STEP_RATIOS.forEach(e => {
            [name_, large, small] = e;
            if (l*small == large*s) {
                name = name_;
            }
        });
        if (name === undefined) {
            NAME_RANGES.forEach(e => {
                [name_, low, high] = e;
                if (low*s < 6*l && 6*l < high*s) {
                    name = name_;
                }
            });
        }

        edoText.data = `${name}: ${divisions}edo`;
    }

    updateText();

    largeInput.oninput = e => {
        smallInput.max = largeInput.value;
        updateText();
    }
    smallInput.oninput = updateText;
}

function selectStepRatio(pattern, l, s, accidentalSign) {
    [countL, countS] = extractCounts(pattern);
    const divisions = countL*l + countS*s;
    MAPPING = [Math.log(2)/divisions * l, Math.log(2)/divisions * s];

    clearContent();
    const contentDiv = document.getElementById("content");
    const info = document.createElement("p");
    info.appendChild(document.createTextNode(`You selected ${pattern} for ${divisions}edo`));
    contentDiv.appendChild(info);
    const instructions = document.createElement("p");
    instructions.appendChild(document.createTextNode(PLAY_INSTRUCTIONS));
    contentDiv.appendChild(instructions);

    const keyboardDiv = initKeyboard();
    contentDiv.appendChild(keyboardDiv);

    const digitRow = keyboardDiv.children[0];
    const qwertyRow = keyboardDiv.children[1];
    const asdfRow = keyboardDiv.children[2];
    const zxcRow = keyboardDiv.children[3];

    let keyEl, text, accidental;

    let coords;
    let coordL = 0;
    let coordS = 0;
    let lastJump = pattern[pattern.length - 1];

    for (let i = 0; i < 12; ++i) {
        const jump = pattern[i % pattern.length];

        coords = [i, 1, 1].toString();
        MONZO_BY_COORDS.set(coords, [coordL + countL, coordS + countS]);

        keyEl = document.createElement("span");
        keyEl.classList.add("key");
        text = document.createTextNode(`${coordL*l + coordS*s + divisions}`);
        keyEl.appendChild(text);
        qwertyRow.appendChild(keyEl);
        KEY_EL_BY_COORDS.set(coords, keyEl);

        coords = [i, 0, 1].toString();
        keyEl = document.createElement("span");
        keyEl.classList.add("key");
        if (lastJump == "L") {
            if (accidentalSign > 0) {
                MONZO_BY_COORDS.set(coords, [coordL-1 + countL, coordS+1 + countS]);
                text = document.createTextNode(`${(coordL-1)*l + (coordS+1)*s + divisions}`);
            } else {
                MONZO_BY_COORDS.set(coords, [coordL + countL, coordS-1 + countS]);
                text = document.createTextNode(`${coordL*l + (coordS-1)*s + divisions}`);
            }
            keyEl.appendChild(text);
        }
        digitRow.appendChild(keyEl);
        KEY_EL_BY_COORDS.set(coords, keyEl);

        if (i < 11) {
            coords = [i-1, 3, 1].toString();
            MONZO_BY_COORDS.set(coords, [coordL, coordS]);

            keyEl = document.createElement("span");
            keyEl.classList.add("key");
            text = document.createTextNode(`${coordL*l + coordS*s}`);
            keyEl.appendChild(text);
            zxcRow.appendChild(keyEl);
            KEY_EL_BY_COORDS.set(coords, keyEl);
        }

        coords = [i, 2, 1].toString();
        keyEl = document.createElement("span");
        keyEl.classList.add("key");
        if (jump == "L") {
            if (accidentalSign > 0) {
                MONZO_BY_COORDS.set(coords, [coordL, coordS+1]);
                text = document.createTextNode(`${coordL*l + (coordS+1)*s}`);
            } else {
                MONZO_BY_COORDS.set(coords, [coordL+1, coordS-1]);
                text = document.createTextNode(`${(coordL+1)*l + (coordS-1)*s}`);
            }
            keyEl.appendChild(text);
        }
        asdfRow.appendChild(keyEl);
        KEY_EL_BY_COORDS.set(coords, keyEl);

        if (jump == "L") {
            coordL++;
        } else {
            coordS++;
        }
        lastJump = jump;
    }
    zxcRow.appendChild(RIGHT_SHIFT_EL);
    addInstrumentControls();
    DIVISIONS = divisions;
}

function addInstrumentControls() {
    const contentDiv = document.getElementById("content");
    contentDiv.appendChild(document.createElement("br"));

    const waveformLabel = document.createElement("label");
    waveformLabel.for = "waveform";
    waveformLabel.appendChild(document.createTextNode("Waveform: "));
    contentDiv.appendChild(waveformLabel);
    const select = document.createElement("select");
    select.id = "waveform";
    contentDiv.appendChild(select);
    DEFAULT_WAVEFORMS.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.appendChild(document.createTextNode(name));
        select.appendChild(option);
    });
    const waveforms = Object.keys(WAVEFORMS);
    waveforms.sort();
    waveforms.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.appendChild(document.createTextNode(name));
        select.appendChild(option);
    });
    select.value = "triangle";
    select.onchange = e => {
        VOICES.forEach(voice => {
            const name = select.value;
            if (DEFAULT_WAVEFORMS.includes(name)) {
                voice.instrument.oscillator.type = name;
            } else {
                voice.instrument.oscillator.setPeriodicWave(WAVEFORMS[name]);
            }
        });
    };

    contentDiv.appendChild(document.createElement("br"));
    const attackLabel = document.createElement("label");
    attackLabel.for = "attack";
    attackLabel.appendChild(document.createTextNode("Attack: "));
    contentDiv.appendChild(attackLabel);
    const attackInput = document.createElement("input");
    attackInput.id = "attack";
    contentDiv.appendChild(attackInput);
    attackInput.classList.add("number-ms");
    attackInput.type = "number";
    attackInput.value = 10;
    attackInput.min = 0;
    attackInput.step = 1;
    attackInput.oninput = e => {
        VOICES.forEach(voice => {
            voice.instrument.attack = attackInput.value / 1000;
        });
    }
    contentDiv.appendChild(document.createTextNode("ms"));

    contentDiv.appendChild(document.createElement("br"));
    const decayLabel = document.createElement("label");
    decayLabel.for = "decay";
    decayLabel.appendChild(document.createTextNode("Decay: "));
    contentDiv.appendChild(decayLabel);
    const decayInput = document.createElement("input");
    decayInput.id = "decay";
    contentDiv.appendChild(decayInput);
    decayInput.classList.add("number-ms");
    decayInput.type = "number";
    decayInput.value = 100;
    decayInput.min = 0;
    decayInput.step = 5;
    decayInput.oninput = e => {
        VOICES.forEach(voice => {
            voice.instrument.decay = decayInput.value / 1000;
        });
    }
    contentDiv.appendChild(document.createTextNode("ms"));

    contentDiv.appendChild(document.createElement("br"));
    const sustainLabel = document.createElement("label");
    sustainLabel.for = "sustain";
    sustainLabel.appendChild(document.createTextNode("Sustain: "));
    contentDiv.appendChild(sustainLabel);
    const sustainInput = document.createElement("input");
    sustainInput.id = "sustain";
    contentDiv.appendChild(sustainInput);
    sustainInput.classList.add("number-percent");
    sustainInput.type = "number";
    sustainInput.value = 70;
    sustainInput.min = 0;
    sustainInput.max = 100;
    sustainInput.step = 1;
    sustainInput.oninput = e => {
        VOICES.forEach(voice => {
            voice.instrument.sustain = sustainInput.value / 100;
        });
    }
    contentDiv.appendChild(document.createTextNode("%"));

    contentDiv.appendChild(document.createElement("br"));
    const releaseLabel = document.createElement("label");
    releaseLabel.for = "release";
    releaseLabel.appendChild(document.createTextNode("Release: "));
    contentDiv.appendChild(releaseLabel);
    const releaseInput = document.createElement("input");
    releaseInput.id = "release";
    contentDiv.appendChild(releaseInput);
    releaseInput.classList.add("number-ms");
    releaseInput.type = "number";
    releaseInput.value = 150;
    releaseInput.min = 0;
    releaseInput.step = 5;
    releaseInput.oninput = e => {
        VOICES.forEach(voice => {
            voice.instrument.release = releaseInput.value / 1000;
        });
    }
    contentDiv.appendChild(document.createTextNode("ms"));

    contentDiv.appendChild(document.createElement("br"));
    const vibratoAttackLabel = document.createElement("label");
    vibratoAttackLabel.for = "vibrato-attack";
    vibratoAttackLabel.appendChild(document.createTextNode("Vibrato attack: "));
    contentDiv.appendChild(vibratoAttackLabel);
    const vibratoAttackInput = document.createElement("input");
    vibratoAttackInput.id = "vibrato-attack";
    contentDiv.appendChild(vibratoAttackInput);
    vibratoAttackInput.classList.add("number-ms");
    vibratoAttackInput.type = "number";
    vibratoAttackInput.value = 200;
    vibratoAttackInput.min = 0;
    vibratoAttackInput.step = 5;
    vibratoAttackInput.oninput = e => {
        VOICES.forEach(voice => {
            voice.instrument.vibratoAttack = vibratoAttackInput.value / 1000;
        });
    }
    contentDiv.appendChild(document.createTextNode("ms"));

    contentDiv.appendChild(document.createElement("br"));
    const vibratoDepthLabel = document.createElement("label");
    vibratoDepthLabel.for = "vibrato-depth";
    vibratoDepthLabel.appendChild(document.createTextNode("Vibrato depth: "));
    contentDiv.appendChild(vibratoDepthLabel);
    const vibratoDepthInput = document.createElement("input");
    vibratoDepthInput.id = "vibrato-depth";
    contentDiv.appendChild(vibratoDepthInput);
    vibratoDepthInput.classList.add("number-ms");
    vibratoDepthInput.type = "number";
    vibratoDepthInput.value = 5;
    vibratoDepthInput.min = 0;
    vibratoDepthInput.step = 1;
    vibratoDepthInput.oninput = e => {
        VOICES.forEach(voice => {
            voice.instrument.vibratoDepth = Number(vibratoDepthInput.value);
        });
    }
    contentDiv.appendChild(document.createTextNode("cents"));

    contentDiv.appendChild(document.createElement("br"));
    const vibratoFrequencyLabel = document.createElement("label");
    vibratoFrequencyLabel.for = "vibrato-frequency";
    vibratoFrequencyLabel.appendChild(document.createTextNode("Vibrato frequency: "));
    contentDiv.appendChild(vibratoFrequencyLabel);
    const vibratoFrequencyInput = document.createElement("input");
    vibratoFrequencyInput.id = "vibrato-frequency";
    contentDiv.appendChild(vibratoFrequencyInput);
    vibratoFrequencyInput.classList.add("number-percent");
    vibratoFrequencyInput.type = "number";
    vibratoFrequencyInput.value = 5;
    vibratoFrequencyInput.min = 0;
    vibratoFrequencyInput.step = 0.2;
    vibratoFrequencyInput.oninput = e => {
        VOICES.forEach(voice => {
            // XXX: Hax
            voice.instrument.vibratoFrequency.setValueAtTime(Number(vibratoFrequencyInput.value), 0);
        });
    }
    contentDiv.appendChild(document.createTextNode("Hz"));
}

const EXPIRED = 10000;

function appendVoice(context, globalGain) {
    const instrument = new OscillatorInstrument(context);
    instrument.connect(globalGain);
    instrument.start();
    const age = EXPIRED;
    VOICES.push({instrument, age});
}

function voiceOn(voice, frequency, context) {
    const time = context.currentTime;

    voice.instrument.frequency.cancelScheduledValues(time);
    voice.instrument.frequency.setValueAtTime(frequency, time);

    voice.instrument.noteOn(time);

    VOICES.forEach(v => v.age++);

    voice.age = 0;
}

function voiceOff(voice, context) {
    const time = context.currentTime;

    voice.instrument.noteOff(time);

    voice.age = EXPIRED;
}

function keyOff(context) {
    for (voice of VOICE_BY_COORDS.values()) {
        voiceOff(voice, context);
    }
    for (key of KEY_EL_BY_COORDS.values()) {
        key.classList.remove("active");
    };
    VOICE_BY_COORDS.clear();
}

function getOldestVoice() {
    let result = VOICES[0];
    VOICES.forEach(voice => {
        if (voice.age > result.age) {
            result = voice
        }
    });
    return result;
}

function monzoToFrequency(monzo) {
    const nats = monzo[0] * MAPPING[0] + monzo[1] * MAPPING[1];
    return 220 * Math.exp(nats);
}

async function main() {
    populateMosSelection();

    const context = new AudioContext({latencyHint: "interactive"});
    context.suspend();

    const panicButton = document.getElementById("panic");
    panicButton.onclick = e => {
        context.suspend();
        keyOff(context);
    }

    const resetButton = document.getElementById("reset");
    resetButton.onclick = e => {
        keyOff(context);
        MONZO_BY_COORDS.clear();
        KEY_EL_BY_COORDS.clear();
        VOICES.forEach(voice => voice.instrument.reset(context));
        populateMosSelection();
    }

    WAVEFORMS = createWaveforms(context);

    const globalGain = context.createGain();
    globalGain.connect(context.destination);
    globalGain.gain.setValueAtTime(0.249, context.currentTime);

    for (let i = 0; i < 12; ++i) {
        appendVoice(context, globalGain);
    }

    function keydown(coords) {
        coords = coords.toString();
        const monzo = MONZO_BY_COORDS.get(coords);
        const voice = VOICE_BY_COORDS.get(coords);
        if (monzo !== undefined && voice === undefined) {
            const newVoice = getOldestVoice();
            voiceOn(newVoice, monzoToFrequency(monzo), context);
            VOICE_BY_COORDS.set(coords, newVoice);
            KEY_EL_BY_COORDS.get(coords).classList.add("active");
        }
    }

    function keyup(coords) {
        coords = coords.toString();
        const voice = VOICE_BY_COORDS.get(coords);
        if (voice !== undefined) {
            voiceOff(voice, context);
            VOICE_BY_COORDS.delete(coords);
            KEY_EL_BY_COORDS.get(coords).classList.remove("active");
        }
    }

    const keyboard = new Keyboard(keydown, keyup);

    window.onkeydown = e => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
            return;
        }
        context.resume();

        if (e.code == "Backquote") {
            if (BACKQUOTE_EL !== undefined) {
                BACKQUOTE_EL.classList.add("active");
            }
            keyOff(context);
            keyboard.deactivate();
        }

        if (e.code == "ShiftLeft" && LEFT_SHIFT_EL !== undefined) {
            LEFT_SHIFT_EL.classList.add("active");
        }
        if (e.code == "ShiftRight" && RIGHT_SHIFT_EL !== undefined) {
            RIGHT_SHIFT_EL.classList.add("active");
        }

        if (keyboard.keydown(e)) {
            return;
        }
    }

    window.onkeyup = e => {
        if (e.code == "Backquote" && BACKQUOTE_EL !== undefined) {
            BACKQUOTE_EL.classList.remove("active");
        }
        if (e.code == "ShiftRight" && RIGHT_SHIFT_EL !== undefined) {
            RIGHT_SHIFT_EL.classList.remove("active");
            return;
        }
        if (e.code == "ShiftLeft" && LEFT_SHIFT_EL !== undefined) {
            LEFT_SHIFT_EL.classList.remove("active");
            return;
        }
        if (keyboard.keyup(e)) {
            return;
        }
    }

    let mouseVoice = null;
    let mouseKey = null;

    window.onmousedown = e => {
        // TODO: mouse sustain
        const classList = e.target.classList;
        if (classList.contains("off")) {
            keyOff(context);
            keyboard.deactivate();
            return;
        }
        if (classList.contains("left-shift") || classList.contains("right-shift")) {
            return;
        }
        if (classList.contains("key")) {
            context.resume();
            textNode = e.target.firstChild;
            if (textNode !== null) {
                // TODO: Use the monzos
                const step = parseInt(textNode.textContent);
                const freq = 220 * Math.pow(2, step / DIVISIONS);
                mouseVoice = getOldestVoice();
                voiceOn(mouseVoice, freq, context);
                mouseKey = e.target;
                // TODO: Track voice state not element
                mouseKey.classList.add("mouse-active");
            }
        }
    }

    window.onmouseup = e => {
        if (mouseVoice !== null) {
            voiceOff(mouseVoice, context);
            mouseVoice = null;
            mouseKey.classList.remove("mouse-active");
        }
    }
}
