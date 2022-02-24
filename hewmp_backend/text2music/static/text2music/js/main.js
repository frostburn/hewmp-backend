const MAX_VOICES = 256;
const SILENCE = 1e-4;
const ATTACK_TIME = 0.01;
const SUSTAIN_LEVEL = 0.7;
const RELEASE_TIME = 0.1;

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
}

function allocateIndices(track) {
    endTimes = Array(track.maxPolyphony).fill(-10000);
    let index = 0;
    track.events.sort((a, b) => a.t - b.t);
    track.events.forEach(event => {
        for (let i = 0; i < track.maxPolyphony; ++i) {
            index = (index + 1) % track.maxPolyphony;
            if (endTimes[index] < event.t) {
                break;
            }
        }
        event.voiceIndex = index;
        endTimes[index] = event.t + event.d;
    });
}

function playNotes(data, voices, context, globalGain) {
    cancelVoices(voices, context);

    const now = context.currentTime;
    let voiceOffset = 0;
    data.tracks.forEach(track => {
        while (voices.length < voiceOffset + track.maxPolyphony) {
            appendVoice(voices, context, globalGain);
        }
        allocateIndices(track);
        track.events.forEach(event => {
            if (event.type == 'n') {
                const voice = voices[event.voiceIndex + voiceOffset];
                const time = now + event.t;
                const velocity = event.v * track.volume;
                voice.oscillator.frequency.setValueAtTime(event.f, time);
                voice.gain.gain.setValueAtTime(SILENCE, time);
                voice.gain.gain.linearRampToValueAtTime(velocity, time + ATTACK_TIME);
                voice.gain.gain.linearRampToValueAtTime(SUSTAIN_LEVEL * velocity, time + event.d);
                voice.gain.gain.linearRampToValueAtTime(SILENCE, time + event.d + RELEASE_TIME);
            } else if (event.type == 'p') {
                if (event.i in PERCUSSION_BUFFERS) {
                    const source = context.createBufferSource();
                    const gain = context.createGain();
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
