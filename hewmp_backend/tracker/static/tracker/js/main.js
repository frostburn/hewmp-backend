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

const GLIDE_TIME = 0.02;
let MASTER_INSTRUMENT;
let PITCH_BEND_DEPTH = 200;

const DEFAULT_WAVEFORMS = ["sine", "square", "sawtooth", "triangle"];
let WAVEFORMS;

let DIVISIONS;

let MAPPING;

const PLAY_INSTRUCTIONS = "Play something using the keys QWERTY etc. The Shift key toggles sustain.";

let MIDI_INPUT;
let MIDI_MONZOS;
const VOICE_BY_MIDI_INDEX = new Map();
let MIDI_KEY_MODE = "white";
let MIDI_INFLECTION;
const MIDI_WHITES_PLUS = [
    [0, false],
    [0, true],
    [1, false],
    [2, false],
    [2, true],
    [3, false],
    [3, true],
    [4, false],
    [5, false],
    [5, true],
    [6, false],
    [6, true],
];
const MIDI_WHITES_MINUS = [
    [0, false],
    [1, true],
    [1, false],
    [2, false],
    [3, true],
    [3, false],
    [4, true],
    [4, false],
    [5, false],
    [6, true],
    [6, false],
    [7, true],
];
// https://www.midi.org/specifications/item/table-1-summary-of-midi-message
const MIDI_COMMANDS = {
    noteOn: 0b1001,
    noteOff: 0b1000,
    aftertouch: 0b1010,
    pitchbend: 0b1110,
    cc: 0b1011
};

// https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2
const MIDI_CC = {
    modwheel: 0x01,
}

function clearContent() {
    const contentDiv = document.getElementById("content");
    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }
}

function populateMosSelection(audioCtx) {
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

    // --- Waveform design ---

    contentDiv.appendChild(document.createElement("br"));
    const waveformTitle = document.createElement("h3");
    waveformTitle.appendChild(document.createTextNode("Design waveform"));
    contentDiv.appendChild(waveformTitle);
    harmonicsLabel = document.createElement("label");
    harmonicsLabel.appendChild(document.createTextNode("Number of harmonics: "));
    harmonicsLabel.for = "harmonics";
    contentDiv.appendChild(harmonicsLabel);
    const harmonicsInput = document.createElement("input");
    harmonicsInput.id = "harmonics";
    harmonicsInput.classList.add("number");
    harmonicsInput.type = "number";
    harmonicsInput.min = 1;
    harmonicsInput.value = 8;
    harmonicsInput.max = 27;
    contentDiv.appendChild(harmonicsInput);
    contentDiv.appendChild(document.createTextNode(" "));
    const harmonicsButton = document.createElement("button");
    harmonicsButton.appendChild(document.createTextNode("Design"));
    harmonicsButton.onclick = e => {
        if (harmonicsInput.validity.valid) {
            selectWaveformDesign(audioCtx, parseInt(harmonicsInput.value));
        }
    }
    contentDiv.appendChild(harmonicsButton);

    // --- MIDI ---
    contentDiv.appendChild(document.createElement("br"));
    const midiContainer = document.createElement("div");
    midiContainer.id = "midi-container";
    contentDiv.appendChild(midiContainer);
    if (MIDI_INPUT !== undefined) {
        populateMidiInfo();
    } else {
        midiContainer.appendChild(document.createElement("br"));
        const midiButton = document.createElement("button");
        midiButton.appendChild(document.createTextNode("Activate MIDI"));
        midiButton.onclick = activateMidi;
        midiContainer.appendChild(midiButton);
    }
}

async function activateMidi() {
    const midiAccess = await navigator.requestMIDIAccess();
    const midiContainer = document.getElementById("midi-container");
    while (midiContainer.firstChild) {
        midiContainer.removeChild(midiContainer.firstChild);
    }
    midiContainer.appendChild(document.createElement("br"));
    const midiInputSelect = document.createElement("select");
    const emptyOption = document.createElement("option");
    emptyOption.disabled = true;
    emptyOption.value = "";
    emptyOption.appendChild(document.createTextNode("-- Select device --"));
    midiInputSelect.appendChild(emptyOption);
    for (const key of midiAccess.inputs.keys()) {
        const input = midiAccess.inputs.get(key);
        const option = document.createElement("option");
        option.value = key;
        option.appendChild(document.createTextNode(input.name));
        midiInputSelect.appendChild(option);
    }
    midiInputSelect.value = emptyOption.value;
    midiContainer.appendChild(midiInputSelect);
    midiInputSelect.onchange = e => {
        MIDI_INPUT = midiAccess.inputs.get(midiInputSelect.value);
        MIDI_INPUT.onmidimessage = onMIDIMessage;
        populateMidiInfo();
    }
}

function populateMidiInfo() {
    const midiContainer = document.getElementById("midi-container");
    while (midiContainer.firstChild) {
        midiContainer.removeChild(midiContainer.firstChild);
    }
    midiContainer.appendChild(document.createElement("br"));
    const midiTitle = document.createElement("b");
    midiTitle.appendChild(document.createTextNode("MIDI device active"));
    midiContainer.appendChild(midiTitle);
    midiContainer.appendChild(document.createElement("br"));
    const nameSpan = document.createElement("span");
    nameSpan.appendChild(document.createTextNode(MIDI_INPUT.name));
    midiContainer.appendChild(nameSpan);

    midiContainer.appendChild(document.createElement("br"));
    const chromaticRadio = document.createElement("input");
    chromaticRadio.id = "chromatic";
    chromaticRadio.type = "radio";
    chromaticRadio.name = "midi-key-mode";
    chromaticRadio.value = "chromatic";
    chromaticRadio.checked = (MIDI_KEY_MODE == "chromatic");
    midiContainer.appendChild(chromaticRadio);
    const chromaticLabel = document.createElement("label");
    chromaticLabel.for = "chromatic";
    chromaticLabel.appendChild(document.createTextNode("All"));
    midiContainer.appendChild(chromaticLabel);

    const whiteRadio = document.createElement("input");
    whiteRadio.id = "white";
    whiteRadio.type = "radio";
    whiteRadio.name = "midi-key-mode";
    whiteRadio.value = "white";
    whiteRadio.checked = (MIDI_KEY_MODE == "white");
    midiContainer.appendChild(whiteRadio);
    const whiteLabel = document.createElement("label");
    whiteLabel.for = "white";
    whiteLabel.appendChild(document.createTextNode("White"));
    midiContainer.appendChild(whiteLabel);

    chromaticRadio.onchange = whiteRadio.onchange = e => {
        MIDI_KEY_MODE = Array.from(document.getElementsByName("midi-key-mode")).find(r => r.checked).value;
    }
}

function selectWaveformDesign(audioCtx, numHarmonics) {
    // TODO: Better controls with room for more harmonics
    // TODO: Use a Fourier transform to allow drawing waveforms by hand
    clearContent();
    contentDiv = document.getElementById("content");

    const nameInput = document.createElement("input");
    nameInput.placeholder = "custom";
    nameInput.id = "name";
    contentDiv.appendChild(nameInput);
    const nameLabel = document.createElement("label");
    nameLabel.appendChild(document.createTextNode(" Name"));
    nameLabel.for = nameInput.id;
    contentDiv.appendChild(nameLabel);

    contentDiv.appendChild(document.createElement("br"));
    const dcRange = document.createElement("input");
    dcRange.type = "range";
    dcRange.min = 0;
    dcRange.max = 1;
    dcRange.value = 0;
    dcRange.step = "any";
    dcRange.id = "dc";
    contentDiv.appendChild(dcRange);
    const dcLabel = document.createElement("label");
    dcLabel.for = "dc";
    dcLabel.appendChild(document.createTextNode(" DC"));
    contentDiv.appendChild(dcLabel);

    for (let n = 0; n < numHarmonics; ++n) {
        contentDiv.appendChild(document.createElement("br"));
        const range = document.createElement("input");
        range.type = "range";
        range.min = 0;
        range.max = 1;
        range.value = 0 + (n==0);
        range.step = "any";
        range.id = `harmonic${n+1}`;
        contentDiv.appendChild(range);
        const label = document.createElement("label");
        label.for = range.id;
        label.appendChild(document.createTextNode(` ${n+1}`));
        contentDiv.appendChild(label);
    }

    contentDiv.appendChild(document.createElement("br"));
    const addButton = document.createElement("button");
    addButton.appendChild(document.createTextNode("Add to Collection"));
    addButton.onclick = e => {
        const sineComponents = new Float32Array(numHarmonics + 1);
        const cosineComponents = new Float32Array(numHarmonics + 1);
        cosineComponents[0] = Number(dcRange.value);
        for (let n = 0; n < numHarmonics; ++n) {
            const range = document.getElementById(`harmonic${n+1}`);
            sineComponents[n+1] = Number(range.value);
        }
        let name = nameInput.value;
        if (!name.length) {
            name = "custom";
        }
        WAVEFORMS[name] = audioCtx.createPeriodicWave(sineComponents, cosineComponents);
        populateMosSelection(audioCtx);
    }
    contentDiv.appendChild(addButton);
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
    PITCH_BEND_DEPTH = 1200 * xDelta / divisions;
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
    PITCH_BEND_DEPTH = 1200*l/divisions;

    if (MIDI_INPUT !== undefined) {
        MIDI_MONZOS = [];
        const MONZO = [0, 0];
        for (let i = 0; i < pattern.length; ++i) {
            if (pattern[i] == "L") {
                MONZO[0] += 1;
            } else {
                MONZO[1] += 1;
            }
            MIDI_MONZOS.push([...MONZO]);
        }
        MIDI_INFLECTION = [0, accidentalSign];
    }
}

function addInstrumentControls() {
    const contentDiv = document.getElementById("content");
    contentDiv.appendChild(document.createElement("br"));

    const pitchBendLabel = document.createElement("label");
    pitchBendLabel.for = "pitch-bend";
    pitchBendLabel.appendChild(document.createTextNode("Pitch bend: "));
    contentDiv.appendChild(pitchBendLabel);
    const pitchBendInput = document.createElement("input");
    pitchBendInput.type = "range";
    pitchBendInput.id = "pitch-bend";
    pitchBendInput.min = -1;
    pitchBendInput.max = 1;
    pitchBendInput.value = 0;
    pitchBendInput.step = "any";
    pitchBendInput.oninput = e => {
        const time = MASTER_INSTRUMENT.bank.context.currentTime;
        MASTER_INSTRUMENT.pitchBend.setTargetAtTime(Number(pitchBendInput.value) * PITCH_BEND_DEPTH, time, GLIDE_TIME);
    }
    pitchBendInput.onblur = e => {
        pitchBendInput.value = 0;
        pitchBendInput.oninput(e);
    }
    contentDiv.appendChild(pitchBendInput);

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
        MASTER_INSTRUMENT.voices.forEach(voice => {
            const name = select.value;
            if (DEFAULT_WAVEFORMS.includes(name)) {
                voice.oscillator.type = name;
            } else {
                voice.oscillator.setPeriodicWave(WAVEFORMS[name]);
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
        MASTER_INSTRUMENT.voices.forEach(voice => {
            voice.attack = attackInput.value / 1000;
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
        MASTER_INSTRUMENT.voices.forEach(voice => {
            voice.decay = decayInput.value / 1000;
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
        MASTER_INSTRUMENT.voices.forEach(voice => {
            voice.sustain = sustainInput.value / 100;
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
        MASTER_INSTRUMENT.voices.forEach(voice => {
            voice.release = releaseInput.value / 1000;
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
        MASTER_INSTRUMENT.voices.forEach(voice => {
            voice.vibratoAttack = vibratoAttackInput.value / 1000;
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
    vibratoDepthInput.type = "range";
    vibratoDepthInput.min = 0;
    vibratoDepthInput.max = 50;
    vibratoDepthInput.value = 5;
    vibratoDepthInput.step = "any";
    vibratoDepthInput.oninput = e => {
        const time = MASTER_INSTRUMENT.bank.context.currentTime;
        MASTER_INSTRUMENT.vibratoDepth.setTargetAtTime(Number(vibratoDepthInput.value), time, GLIDE_TIME);
    }

    contentDiv.appendChild(document.createElement("br"));
    const vibratoFrequencyLabel = document.createElement("label");
    vibratoFrequencyLabel.for = "vibrato-frequency";
    vibratoFrequencyLabel.appendChild(document.createTextNode("Vibrato frequency: "));
    contentDiv.appendChild(vibratoFrequencyLabel);
    const vibratoFrequencyInput = document.createElement("input");
    vibratoFrequencyInput.id = "vibrato-frequency";
    contentDiv.appendChild(vibratoFrequencyInput);
    vibratoFrequencyInput.type = "range";
    vibratoFrequencyInput.max = 15;
    vibratoFrequencyInput.value = 5;
    vibratoFrequencyInput.min = 0;
    vibratoFrequencyInput.step = "any";
    vibratoFrequencyInput.oninput = e => {
        const time = MASTER_INSTRUMENT.bank.context.currentTime;
        MASTER_INSTRUMENT.vibratoFrequency.setTargetAtTime(Number(vibratoFrequencyInput.value), time, GLIDE_TIME);
    }

    contentDiv.appendChild(document.createElement("br"));
    const filterCutoffLabel = document.createElement("label");
    filterCutoffLabel.for = "filter-cutoff";
    filterCutoffLabel.appendChild(document.createTextNode("Filter cutoff: "));
    contentDiv.appendChild(filterCutoffLabel);
    const filterCutoffInput = document.createElement("input");
    filterCutoffInput.id = "filter-cutoff";
    contentDiv.appendChild(filterCutoffInput);
    filterCutoffInput.type = "range";
    // We could use filter.detune to achieve a similar effect too.
    filterCutoffInput.max = Math.log(12000);
    filterCutoffInput.value = Math.log(10000);
    filterCutoffInput.min = Math.log(220);
    filterCutoffInput.step = "any";
    filterCutoffInput.oninput = e => {
        const time = MASTER_INSTRUMENT.bank.context.currentTime;
        MASTER_INSTRUMENT.filter.frequency.setTargetAtTime(Math.exp(Number(filterCutoffInput.value)), time, GLIDE_TIME);
    }

    contentDiv.appendChild(document.createElement("br"));
    const filterQLabel = document.createElement("label");
    filterQLabel.for = "filter-Q";
    filterQLabel.appendChild(document.createTextNode("Filter Q: "));
    contentDiv.appendChild(filterQLabel);
    const filterQInput = document.createElement("input");
    filterQInput.id = "filter-Q";
    contentDiv.appendChild(filterQInput);
    filterQInput.type = "range";
    // We could use filter.detune to achieve a similar effect too.
    filterQInput.max = 10;
    filterQInput.value = 0.5;
    filterQInput.min = 0;
    filterQInput.step = "any";
    filterQInput.oninput = e => {
        const time = MASTER_INSTRUMENT.bank.context.currentTime;
        const target = Number(filterQInput.value);
        MASTER_INSTRUMENT.filter.Q.setTargetAtTime(target, time, GLIDE_TIME);
        MASTER_INSTRUMENT.gain.setTargetAtTime(5.7 / (5 + target), time, GLIDE_TIME);
    }
}

function keyOff(context) {

    MASTER_INSTRUMENT.voices.forEach(voice => MASTER_INSTRUMENT.voiceOff(voice));

    for (key of KEY_EL_BY_COORDS.values()) {
        key.classList.remove("active");
    };
    VOICE_BY_COORDS.clear();
}

function monzoToFrequency(monzo) {
    const nats = monzo[0] * MAPPING[0] + monzo[1] * MAPPING[1];
    return 220 * Math.exp(nats);
}

const MIDI_A3 = 57;

function midiMonzo(index) {
    let scaleIndex;
    let inflected = false;

    if (MIDI_KEY_MODE == "chromatic") {
        scaleIndex = index - MIDI_A3;
    } else if (MIDI_KEY_MODE == "white") {
        const linIndex = index - MIDI_A3;
        let whites;
        if (MIDI_INFLECTION[1] > 0) {
            whites = MIDI_WHITES_PLUS;
        } else {
            whites = MIDI_WHITES_MINUS;
        }
        const linOctave = Math.floor(linIndex / 12);
        scaleIndex = whites[linIndex - linOctave * 12][0];
        inflected = whites[linIndex - linOctave * 12][1];
        scaleIndex += linOctave * 7;
    }

    scaleIndex -= 1;
    let octave = 0;
    while (scaleIndex < 0) {
        scaleIndex += MIDI_MONZOS.length;
        octave--;
    }
    while (scaleIndex >= MIDI_MONZOS.length) {
        scaleIndex -= MIDI_MONZOS.length;
        octave++;
    }
    const result = [...MIDI_MONZOS[scaleIndex]];
    for (let i = 0; i < result.length; ++i) {
        result[i] += octave * MIDI_MONZOS[MIDI_MONZOS.length - 1][i];
        if (inflected) {
            result[i] += MIDI_INFLECTION[i];
        }
    }
    return result;
}

function onMIDIMessage(event) {
    MASTER_INSTRUMENT.bank.context.resume();

    const [data, ...params] = event.data;
    const cmd = data >> 4;
    const channel = data & 0x0f;

    if (cmd == MIDI_COMMANDS.cc) {
        const controlFunction = params[0];
        const value = params[1];
        // TODO: Learn cc, assign cc
        if (controlFunction == MIDI_CC.modwheel) {
            const vibratoDepthInput = document.getElementById("vibrato-depth");
            if (vibratoDepthInput === undefined) {
                return;
            }
            const target = vibratoDepthInput.min + value / 127 * (vibratoDepthInput.max - vibratoDepthInput.min);
            vibratoDepthInput.value = target;
            vibratoDepthInput.oninput();
        }
    }

    if (cmd == MIDI_COMMANDS.pitchbend) {
        const value = (params[1] << 7) | params[0];
        let amount = (value - 0x2000);
        if (amount < 0) {
            amount /= 0x2000;
        }
        if (amount > 0) {
            amount /= 0x1FFF;
        }
        const pitchBendInput = document.getElementById("pitch-bend");
        if (pitchBendInput === undefined) {
            return;
        }
        pitchBendInput.value = amount;
        pitchBendInput.oninput();
    }

    if (MIDI_MONZOS === undefined) {
        return;
    }

    let isNoteOn = false;
    let isNoteOff = false;

    if (cmd == MIDI_COMMANDS.noteOn) {
        const velocity = params[1];
        if (velocity == 0) {
            isNoteOff = true;
        } else {
            isNoteOn = true;
        }
    }
    if (isNoteOn) {
        const index = params[0];
        const monzo = midiMonzo(index);
        const voice = MASTER_INSTRUMENT.voiceOn(monzoToFrequency(monzo));
        VOICE_BY_MIDI_INDEX.set(index, voice);
    }

    if (cmd == MIDI_COMMANDS.noteOff || isNoteOff) {
        const index = params[0];
        const voice = VOICE_BY_MIDI_INDEX.get(index);
        if (voice !== undefined) {
            MASTER_INSTRUMENT.voiceOff(voice);
            VOICE_BY_MIDI_INDEX.delete(index);
        }
    }
}

async function main() {
    const context = new AudioContext({latencyHint: "interactive"});
    context.suspend();

    WAVEFORMS = createWaveforms(context);

    populateMosSelection(context);

    const masterGain = context.createGain();
    masterGain.gain.setValueAtTime(0.249, context.currentTime);

    const bank = new OscillatorBank(context);

    const masterInstrument = new OscillatorInstrument(bank);
    masterInstrument.connect(masterGain).connect(context.destination);

    MASTER_INSTRUMENT = masterInstrument;

    for (let i = 0; i < 12; ++i) {
        masterInstrument.appendVoice();
    }

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
        MIDI_MONZOS = undefined;
        masterInstrument.reset();
        populateMosSelection(context);
    }

    function keydown(coords) {
        coords = coords.toString();
        const monzo = MONZO_BY_COORDS.get(coords);
        const voice = VOICE_BY_COORDS.get(coords);
        if (monzo !== undefined && voice === undefined) {
            const newVoice = masterInstrument.voiceOn(monzoToFrequency(monzo));
            VOICE_BY_COORDS.set(coords, newVoice);
            KEY_EL_BY_COORDS.get(coords).classList.add("active");
        }
    }

    function keyup(coords) {
        coords = coords.toString();
        const voice = VOICE_BY_COORDS.get(coords);
        if (voice !== undefined) {
            masterInstrument.voiceOff(voice);
            VOICE_BY_COORDS.delete(coords);
            KEY_EL_BY_COORDS.get(coords).classList.remove("active");
        }
    }

    const keyboard = new Keyboard(keydown, keyup);

    window.onkeydown = e => {
        if (e.target instanceof HTMLInputElement && e.target.type != "range") {
            return;
        }
        if (e.target instanceof HTMLSelectElement) {
            return;
        }

        context.resume();

        if (e.code == "Backquote") {
            if (BACKQUOTE_EL !== undefined) {
                BACKQUOTE_EL.classList.add("active");
            }
            keyOff(context);
            keyboard.deactivate();
            return;
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
            return;
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
                mouseVoice = masterInstrument.voiceOn(freq);
                mouseKey = e.target;
                // TODO: Track voice state not element
                mouseKey.classList.add("mouse-active");
            }
        }
    }

    window.onmouseup = e => {
        if (mouseVoice !== null) {
            masterInstrument.voiceOff(mouseVoice);
            mouseVoice = null;
            mouseKey.classList.remove("mouse-active");
        }
    }
}
