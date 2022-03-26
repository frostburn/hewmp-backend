// Piano-style layout in two rows. There aren't sharps and flats for everything due to physical keyboard limitations.
const CODES_TOP_ROW = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight'];
const CODES_TOP_FLATS = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal'];

const CODES_BOTTOM_SHARPS = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote'];
const CODES_BOTTOM_ROW = ['IntlBackslash', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash'];

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

const FREQ_BY_CODE = {};

const KEY_BY_CODE = {};

const VOICE_BY_CODE = {};

const SILENCE = 1e-4;

let WAVEFORMS;

function clearContent() {
    const contentDiv = document.getElementById("content");
    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }
}

function populateMosSelection() {
    clearContent();
    const contentDiv = document.getElementById("content");
    const title = document.createElement("h3");
    title.appendChild(document.createTextNode("Select MOS"));
    contentDiv.appendChild(title);

    const pyramidDiv = document.createElement("div");
    pyramidDiv.style.width = "50%";
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
        rowSpan.style.display = "table";
        rowSpan.style.margin = "0 auto";
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
        button.onclick = e => {selectStepRatio(pattern, l, s)};
        button.appendChild(text);
        contentDiv.appendChild(button);
        const br = document.createElement("br");
        contentDiv.appendChild(br);
    });
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
            selectStepRatio(pattern, parseInt(largeInput.value), parseInt(smallInput.value));
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

function selectStepRatio(pattern, l, s) {
    [countL, countS] = extractCounts(pattern);
    const divisions = countL*l + countS*s;

    clearContent();
    const contentDiv = document.getElementById("content");
    const info = document.createElement("p");
    info.appendChild(document.createTextNode(`You selected ${pattern} for ${divisions}edo`));
    contentDiv.appendChild(info);
    const instructions = document.createElement("p");
    instructions.appendChild(document.createTextNode("Play something using the keys QWERTY etc."));
    contentDiv.appendChild(instructions);
    const keyboardDiv = document.createElement("div");
    contentDiv.appendChild(keyboardDiv);
    const digitRow = document.createElement("div");
    keyboardDiv.appendChild(digitRow);
    const qwertyRow = document.createElement("div");
    keyboardDiv.appendChild(qwertyRow);
    const asdfRow = document.createElement("div");
    keyboardDiv.appendChild(asdfRow);
    const zxcRow = document.createElement("div");
    keyboardDiv.appendChild(zxcRow);

    let offset = document.createElement("span");
    offset.classList.add("key-half-offset");
    qwertyRow.appendChild(offset);
    offset = document.createElement("span");
    offset.classList.add("key-half-offset");
    asdfRow.appendChild(offset);

    offset = document.createElement("span");
    offset.classList.add("key-quarter-offset");
    asdfRow.appendChild(offset);
    offset = document.createElement("span");
    offset.classList.add("key-quarter-offset");
    zxcRow.appendChild(offset);

    Object.getOwnPropertyNames(FREQ_BY_CODE).forEach(prop => delete FREQ_BY_CODE[prop]);
    Object.getOwnPropertyNames(KEY_BY_CODE).forEach(prop => delete KEY_BY_CODE[prop]);

    let keyEl, text;

    let step = 0;
    let lastJump = 0;
    if (pattern[pattern.length - 1] == "L") {
        lastJump = l;
    } else {
        lastJump = s;
    }

    for (let i = 0; i < CODES_TOP_ROW.length; ++i) {
        const stepType = pattern[i % pattern.length];
        let jump;
        if (stepType == "L") {
            jump = l;
        } else {
            jump = s;
        }

        const topCode = CODES_TOP_ROW[i];
        FREQ_BY_CODE[topCode] = 440 * Math.pow(2, step / divisions);

        keyEl = document.createElement("span");
        keyEl.classList.add("key");
        text = document.createTextNode(`${step + divisions}`);
        keyEl.appendChild(text);
        qwertyRow.appendChild(keyEl);
        KEY_BY_CODE[topCode] = keyEl;

        const topFlat = CODES_TOP_FLATS[i];
        keyEl = document.createElement("span");
        keyEl.classList.add("key");
        if (lastJump == l) {
            FREQ_BY_CODE[topFlat] = 440 * Math.pow(2, (step - l + s) / divisions);
            text = document.createTextNode(`${step - l + s + divisions}`);
            keyEl.appendChild(text);
        }
        digitRow.appendChild(keyEl);
        KEY_BY_CODE[topFlat] = keyEl;

        const bottomCode = CODES_BOTTOM_ROW[i];
        if (bottomCode !== undefined) {
            FREQ_BY_CODE[bottomCode] = 220 * Math.pow(2, step / divisions);

            keyEl = document.createElement("span");
            keyEl.classList.add("key");
            text = document.createTextNode(`${step}`);
            keyEl.appendChild(text);
            zxcRow.appendChild(keyEl);
            KEY_BY_CODE[bottomCode] = keyEl;

            const bottomSharp = CODES_BOTTOM_SHARPS[i];
            keyEl = document.createElement("span");
            keyEl.classList.add("key");
            if (jump == l) {
                FREQ_BY_CODE[bottomSharp] = 220 * Math.pow(2, (step + s) / divisions);
                text = document.createTextNode(`${step + s}`);
                keyEl.appendChild(text);
            }
            asdfRow.appendChild(keyEl);
            KEY_BY_CODE[bottomSharp] = keyEl;
        }

        step += jump;
        lastJump = jump;
    }
}

function appendVoice(voices, context, globalGain) {
    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0, context.currentTime);
    oscillator.connect(gain).connect(globalGain);
    oscillator.start();
    const active = false;
    voices.push({oscillator, gain, active});
}

const ATTACK = 0.01;
const RELEASE = 0.1;

function startVoice(voice, frequency, context) {
    const time = context.currentTime;

    voice.oscillator.frequency.cancelScheduledValues(time);
    voice.gain.gain.cancelScheduledValues(time);

    voice.oscillator.frequency.setValueAtTime(frequency, time);
    voice.gain.gain.setValueAtTime(SILENCE, time);
    voice.gain.gain.linearRampToValueAtTime(1, time + ATTACK);

    voice.active = true;
}

function stopVoice(voice, context) {
    const time = context.currentTime;
    voice.gain.gain.setValueAtTime(1, time);
    voice.gain.gain.linearRampToValueAtTime(SILENCE, time + RELEASE);
    voice.active = false;
}

async function main() {
    populateMosSelection();

    const context = new AudioContext();
    context.suspend();

    const panicButton = document.getElementById("panic");
    panicButton.onclick = e => {context.suspend();};

    WAVEFORMS = createWaveforms(context);

    const globalGain = context.createGain();
    globalGain.connect(context.destination);
    globalGain.gain.setValueAtTime(0.249, context.currentTime);

    const voices = [];

    for (let i = 0; i < 12; ++i) {
        appendVoice(voices, context, globalGain);
    }

    let voiceIndex = 0;

    window.onkeydown = e => {
        context.resume();
        const freq = FREQ_BY_CODE[e.code];
        const voice = VOICE_BY_CODE[e.code];
        if (freq !== undefined && voice === undefined) {
            for (let i = 0; i < voices.length; ++i) {
                voiceIndex = (voiceIndex + 1) % voices.length;
                if (!voices[voiceIndex].active) {
                    break;
                }
            }
            startVoice(voices[voiceIndex], freq, context);
            KEY_BY_CODE[e.code].classList.add("active");
            VOICE_BY_CODE[e.code] = voices[voiceIndex];
        }
    }

    window.onkeyup = e => {
        const voice = VOICE_BY_CODE[e.code];
        if (voice !== undefined) {
            stopVoice(voice, context);
            KEY_BY_CODE[e.code].classList.remove("active");
        }
        delete VOICE_BY_CODE[e.code];
    }
}
