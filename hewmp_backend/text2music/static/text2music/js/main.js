const MAX_VOICES = 256;
const PICKUP = 0.1;
const SILENCE = 1e-4;
const DEFAULT_ADSR = {
    type: "envelope",
    subtype: "ADSR",
    attack: 0.01,
    decay: 0.1,
    sustain: 0.7,
    release: 0.1,
};
const PERCUSSION_GAINS = [];
const DEFAULT_WAVEFORMS = ["sine", "square", "sawtooth", "triangle"];
let WAVEFORMS;

function appendVoice(voices, context, globalGain) {
    if (voices.length == MAX_VOICES) {
        return;
    }
    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0, context.currentTime);
    oscillator.connect(gain).connect(globalGain);
    oscillator.start();
    voices.push({oscillator, gain});
}

function cancelVoices(voices, context) {
    voices.forEach(voice => {
        voice.oscillator.frequency.cancelScheduledValues(context.currentTime);
        voice.gain.gain.cancelScheduledValues(context.currentTime);
        voice.gain.gain.setValueAtTime(0.0, context.currentTime);
    });
    while (PERCUSSION_GAINS.length) {
        const gain = PERCUSSION_GAINS.pop();
        gain.gain.cancelScheduledValues(context.currentTime);
        gain.gain.setValueAtTime(0.0, context.currentTime);
        gain.disconnect();
    }
}

function allocateIndices(track) {
    endTimes = Array(track.maxPolyphony).fill(-10000);
    let index = 0;
    let envelope = DEFAULT_ADSR;
    track.events.forEach(event => {
        if (event.type == "envelope") {
            envelope = event;
        }
        if (event.type == "n") {
            event.envelope = envelope;
        }
    });
    track.events.sort((a, b) => a.t - b.t);
    track.events.forEach(event => {
        if (event.type == "n") {
            for (let i = 0; i < track.maxPolyphony; ++i) {
                index = (index + 1) % track.maxPolyphony;
                if (endTimes[index] < event.t) {
                    break;
                }
            }
            event.voiceIndex = index;
            endTimes[index] = event.t + event.d;
        }
    });
}

function playNotes(data, voices, context, globalGain) {
    cancelVoices(voices, context);
    context.suspend();
    const now = context.currentTime + PICKUP;
    let voiceOffset = 0;
    data.tracks.forEach(track => {
        while (voices.length < voiceOffset + track.maxPolyphony) {
            appendVoice(voices, context, globalGain);
        }
        let customWaveform;
        if (!(track.waveform === null || track.waveform in DEFAULT_WAVEFORMS || track.waveform in WAVEFORMS)) {
            const parts = track.waveform.split(";");
            while (parts.length < 2) {
                parts.push("");
            }
            const sineComponents = parts[0].split(" ").map(e => Number(e));
            const cosineComponents = parts[1].split(" ").map(e => Number(e));
            while (sineComponents.length < cosineComponents.length) {
                sineComponents.push(0);
            }
            while (cosineComponents.length < sineComponents.length) {
                cosineComponents.push(0);
            }
            customWaveform = context.createPeriodicWave(new Float32Array(sineComponents), new Float32Array(cosineComponents));
        }
        for (let i = 0; i < track.maxPolyphony; ++i) {
            if (track.waveform === null) {
                voices[i + voiceOffset].oscillator.type = "triangle";
            } else {
                if (DEFAULT_WAVEFORMS.includes(track.waveform)) {
                    voices[i + voiceOffset].oscillator.type = track.waveform;
                } else if (track.waveform in WAVEFORMS) {
                    voices[i + voiceOffset].oscillator.setPeriodicWave(WAVEFORMS[track.waveform]);
                } else {
                    voices[i + voiceOffset].oscillator.setPeriodicWave(customWaveform);
                }
            }
        }
        allocateIndices(track);
        track.events.forEach(event => {
            if (event.type == 'n') {
                const voice = voices[event.voiceIndex + voiceOffset];
                const time = now + event.t;
                const velocity = event.v * track.volume;
                voice.oscillator.frequency.setValueAtTime(event.f, time);
                voice.gain.gain.setValueAtTime(SILENCE, time);
                voice.gain.gain.linearRampToValueAtTime(velocity, time + event.envelope.attack);
                voice.gain.gain.linearRampToValueAtTime(event.envelope.sustain * velocity, time + Math.min(event.d, event.envelope.decay));
                voice.gain.gain.linearRampToValueAtTime(SILENCE, time + event.d + event.envelope.release);
            } else if (event.type == 'p') {
                if (event.i in PERCUSSION_BUFFERS) {
                    const source = context.createBufferSource();
                    const gain = context.createGain();
                    PERCUSSION_GAINS.push(gain);
                    source.buffer = PERCUSSION_BUFFERS[event.i];
                    gain.gain.setValueAtTime(event.v * track.volume, now);
                    source.connect(gain).connect(globalGain);
                    source.start(now + event.t);
                }
            }
        });
        voiceOffset += track.maxPolyphony;
    });

    context.resume();
}

function main() {
    const csrftoken = getCookie("csrftoken");

    const context = new AudioContext();
    context.suspend();

    calculatePercussion(context);
    WAVEFORMS = createWaveforms(context);

    const globalGain = context.createGain();
    globalGain.connect(context.destination);
    globalGain.gain.setValueAtTime(0.249, context.currentTime);

    const voices = [];

    const scoreArea = document.getElementById("score");
    const playButton = document.getElementById("play");
    const stopButton = document.getElementById("stop");
    playButton.onclick = e => {
        fetch("", {
            method: "POST",
            body: JSON.stringify({"score": scoreArea.value, "type": "json"}),
            headers: { "X-CSRFToken": csrftoken },
        })
        .then(response => response.json())
        .then(data => playNotes(data, voices, context, globalGain));
    }
    stopButton.onclick = e => {
        context.suspend();
        cancelVoices(voices, context);
    }

    // WebAudio lacks a noise source. This is one way to get one if needed.
    // context.audioWorklet.addModule(window.noiseModuleURL).then(() => {
    //     const noise = new AudioWorkletNode(context, 'pink-noise-processor');
    //     noise.connect(globalGain);
    // });
}
