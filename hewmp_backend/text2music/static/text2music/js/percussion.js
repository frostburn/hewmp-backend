class Silence {
    process() {
        return 0;
    }
}

class BiquadNoise {
    constructor(a0, a1, a2, b0, b1, b2) {
        this.a1 = a1 / a0;
        this.a2 = a2 / a0;
        this.b0 = b0 / a0;
        this.b1 = b1 / a0;
        this.b2 = b2 / a0;

        this.x1 = Math.random() * 2 - 1;
        this.x2 = Math.random() * 2 - 1;
        this.y1 = 0;
        this.y2 = 0;
    }

    process() {
        const x0 = Math.random() * 2 - 1;
        const y0 = x0 * this.b0 + this.x1 * this.b1 + this.x2 * this.b2 - this.y1 * this.a1 - this.y2 * this.a2;
        this.x2 = this.x1;
        this.x1 = x0;
        this.y2 = this.y1;
        this.y1 = y0;
        return y0;
    }
}

function acousticBassDrumNoise() {
    return new Silence();
}
function acousticBassDrum(t, n) {
    return Math.sin(Math.sin(Math.tanh(t*100)*Math.exp(-t*t - t*90)*40)) * 1.1 * Math.exp(-t*10);
}

const electricBassDrumNoise = acousticBassDrumNoise
function electricBassDrum(t, n) {
    return Math.sin(Math.sin(Math.sin(Math.tanh(t*100)*Math.exp(-t*t - t*100)*40))) * 1.5 * Math.exp(-t*10);
}

function sideStickNoise() {
    return new BiquadNoise(1, -0.6, 0, 1, 0.2, 0.2);
}
function sideStick(t, n) {
    return Math.sin(t*2238 + 2*Math.sin(t*2891 + 2*Math.sin(t*5509 + t*Math.exp(-t)*200) + n*0.4) * Math.exp(-10*t)) * Math.exp(-t*20);
}

function acousticSnareNoise() {
    return new BiquadNoise(3, 0, 0, 1, 1, 1);
}
function acousticSnare(t, n) {
    n *= Math.exp(-t*25);
    return Math.tanh(
        Math.sin(6117*t) * Math.exp(-t*25) * 0.1 +
        Math.sin(5342*t) * Math.exp(-t*20) * 0.2 +
        Math.sin(3453*t + n) * Math.exp(-t*30) * 0.3 +
        Math.sin(2234*t - n) * Math.exp(-t*15) * 0.5 +
        Math.sin(1000*t) * Math.exp(-t*14)
    );
}

const electricSnareNoise = acousticSnareNoise;
function electricSnare(t, n) {
    n *= Math.exp(-t*25);
    return Math.tanh(
        Math.sin(6227*t) * Math.exp(-t*25) * 0.2 +
        Math.sin(5542*t + 0.5*n) * Math.exp(-t*20) * 0.4 +
        Math.sin(3443*t + n) * Math.exp(-t*30) * 0.6 +
        Math.sin(2214*t - n) * Math.exp(-t*15) * 0.9 +
        Math.sin(1005*t - Math.exp(-t*50)*2) * Math.exp(-t*14) * 1.5
    )*0.9;
}

function handClapNoise() {
    return [new BiquadNoise(1, -1, 0, 1, 0, 0), new BiquadNoise(1, -1, 0, 1, 0, 0)];
}
function handClap(t, n) {
    const env = t*Math.exp(-t*50)*60;
    const f = 2000*Math.log(10*t+5);
    return [
        Math.sin(f + 0.5*n[0] + 4*Math.sin(500*t*t + 10*t*n[0]) - Math.exp(-t*100)*n[0]) * env,
        Math.sin(f + 0.5*n[1] + 4*Math.sin(500*t*t + 10*t*n[1]) - Math.exp(-t*100)*n[1]) * env
    ];
}

function closedHihatNoise() {
    return new BiquadNoise(1.5, 0, 0, 1, -1, 0);
}
function closedHihat(t, n) {
    n *= Math.exp(-t*60);
    return Math.sin(10*n + Math.sin(n)) * 0.5;
}

function pedalHihatNoise() {
    return new BiquadNoise(1.25, 0, 0, 1, -0.5, 0);
}
function pedalHihat(t, n) {
    n *= Math.exp(-t*65);
    return Math.sin(8*n + Math.sin(2*n)) * 0.5;
}

function openHihatNoise() {
    return new BiquadNoise(1.5, 0, 0, 1, -1, 0);
}
function openHihat(t, n) {
    n *= t*Math.exp(-t*20)*10;
    return Math.sin(10*n + Math.sin(3*n)) * 0.5;
}

function rideCymbal1Noise() {
    return new BiquadNoise(1, -0.8, 0, 1, 0, 0);
}
function rideCymbal1(t, n) {
    n *= Math.exp(-t*70);
    t *= 1.1;
    return Math.sin(3301*t - 4*Math.sin(8101*t - 3*Math.tanh(2*Math.sin(10501*t) + 0.4*n)) + n)*Math.exp(-t*6) * 0.5;
}

function chineseCymbalNoise() {
    return new BiquadNoise(1, -0.5, 0, 1, -2, 1);
}
function chineseCymbal(t, n) {
    n *= Math.exp(-t*5);
    return Math.tanh(20*n*n*n);
}

function crashCymbalNoise() {
    return new BiquadNoise(1, -0.4, 0, 1, 0, 0);
}
function crashCymbal(t, n) {
    n *= Math.exp(-t*5);
    return Math.tanh(2*n);
}

function crashCymbal2Noise() {
    return new BiquadNoise(1, -0.5, 0, 1, 0, 0);
}
function crashCymbal2(t, n) {
    n *= Math.exp(-t*5);
    return Math.tanh(2*n);
}

// function explosionNoise() {
//     return new BiquadNoise(1, -0.99, 0, 1, 0, 0);
// }
// function explosion(t, n) {
//     n *= Math.exp(-t*5);
//     return Math.tanh(1*n);
// }

function highTomNoise() {
    return new Silence();
}

function highTom(t, n) {
    return Math.tanh(
        Math.sin(7117*t) * Math.exp(-t*27) * 0.05 +
        Math.sin(6217*t) * Math.exp(-t*25) * 0.1 +
        Math.sin(5742*t) * Math.exp(-t*20) * 0.2 +
        Math.sin(3453*t) * Math.exp(-t*20) * 0.3 +
        Math.sin(2134*t) * Math.exp(-t*12) * 0.5 +
        Math.sin(1100*t) * Math.exp(-t*10)
    );
}

const hiMidTomNoise = highTomNoise;

function hiMidTom(t, n) {
    return Math.tanh(
        Math.sin(7017*t) * Math.exp(-t*27) * 0.05 +
        Math.sin(6117*t) * Math.exp(-t*25) * 0.1 +
        Math.sin(5642*t) * Math.exp(-t*20) * 0.2 +
        Math.sin(3353*t) * Math.exp(-t*20) * 0.3 +
        Math.sin(2034*t) * Math.exp(-t*12) * 0.5 +
        Math.sin(1010*t) * Math.exp(-t*10)
    );
}

const lowMidTomNoise = highTomNoise;

function lowMidTom(t, n) {
    return Math.tanh(
        Math.sin(6997*t) * Math.exp(-t*27) * 0.05 +
        Math.sin(6017*t) * Math.exp(-t*25) * 0.1 +
        Math.sin(5542*t) * Math.exp(-t*20) * 0.2 +
        Math.sin(3253*t) * Math.exp(-t*20) * 0.3 +
        Math.sin(1947*t) * Math.exp(-t*12) * 0.5 +
        Math.sin(950*t) * Math.exp(-t*10)
    );
}

const lowTomNoise = highTomNoise;

function lowTom(t, n) {
    return Math.tanh(
        Math.sin(6897*t) * Math.exp(-t*27) * 0.05 +
        Math.sin(5917*t) * Math.exp(-t*25) * 0.1 +
        Math.sin(5442*t) * Math.exp(-t*20) * 0.2 +
        Math.sin(3153*t) * Math.exp(-t*20) * 0.3 +
        Math.sin(1907*t) * Math.exp(-t*12) * 0.5 +
        Math.sin(910*t) * Math.exp(-t*10)
    );
}

const highFloorTomNoise = highTomNoise;

function highFloorTom(t, n) {
    return Math.tanh(
        Math.sin(6797*t) * Math.exp(-t*27) * 0.05 +
        Math.sin(5817*t) * Math.exp(-t*25) * 0.1 +
        Math.sin(5342*t) * Math.exp(-t*20) * 0.2 +
        Math.sin(3053*t) * Math.exp(-t*20) * 0.3 +
        Math.sin(1877*t) * Math.exp(-t*12) * 0.5 +
        Math.sin(890*t) * Math.exp(-t*10)
    );
}

const lowFloorTomNoise = highTomNoise;

function lowFloorTom(t, n) {
    return Math.tanh(
        Math.sin(6697*t) * Math.exp(-t*27) * 0.05 +
        Math.sin(5717*t) * Math.exp(-t*25) * 0.1 +
        Math.sin(5242*t) * Math.exp(-t*20) * 0.2 +
        Math.sin(3000*t) * Math.exp(-t*20) * 0.3 +
        Math.sin(1817*t) * Math.exp(-t*12) * 0.5 +
        Math.sin(860*t) * Math.exp(-t*10)
    );
}

const INDEX_FUN_DUR = [
    [35, acousticBassDrum, acousticBassDrumNoise, 0.5],
    [36, electricBassDrum, electricBassDrumNoise, 0.5],
    [37, sideStick, sideStickNoise, 0.5],
    [38, acousticSnare, acousticSnareNoise, 0.5],
    [39, handClap, handClapNoise, 0.6],
    [40, electricSnare, electricSnareNoise, 0.5],
    [41, lowFloorTom, lowFloorTomNoise, 0.75],
    [42, closedHihat, closedHihatNoise, 0.5],
    [43, highFloorTom, highFloorTomNoise, 0.75],
    [44, pedalHihat, pedalHihatNoise, 0.5],
    [45, lowTom, lowTomNoise, 0.75],
    [46, openHihat, openHihatNoise, 1.0],
    [47, lowMidTom, lowMidTomNoise, 0.75],
    [48, hiMidTom, hiMidTomNoise, 0.75],
    [49, crashCymbal, crashCymbalNoise, 1.0],
    [50, highTom, highTomNoise, 0.75],
    [51, rideCymbal1, rideCymbal1Noise, 1.5],
    [52, chineseCymbal, chineseCymbalNoise, 1.0],
    [57, crashCymbal2, crashCymbal2Noise, 1.0],
];

const PERCUSSION_BUFFERS = {};

function calculatePercussion(context) {
    const dt = 1 / context.sampleRate;

    INDEX_FUN_DUR.forEach(e => {
        [index, fun, nfun, duration] = e;
        const bufferLength = Math.ceil(context.sampleRate * duration);
        const buffer = context.createBuffer(2, bufferLength, context.sampleRate);
        const noise = nfun();
        for (let x = 0; x < bufferLength; ++x) {
            const t = x * dt;
            let n;
            if (Array.isArray(noise)) {
                n = [noise[0].process(), noise[1].process()];
            } else {
                n = noise.process();
            }
            const result = fun(t, n);
            if (!Array.isArray(result)) {
                for (let channel = 0; channel < buffer.numberOfChannels; ++channel) {
                    buffer.getChannelData(channel)[x] = result;
                }
            } else {
                buffer.getChannelData(0)[x] = result[0];
                buffer.getChannelData(1)[x] = result[1];
            }
        }
        PERCUSSION_BUFFERS[index] = buffer;
    });
}
