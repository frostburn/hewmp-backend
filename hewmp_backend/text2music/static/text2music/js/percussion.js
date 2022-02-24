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
function acousticBassDrum(t, n, channel) {
    return Math.sin(Math.sin(Math.tanh(t*100)*Math.exp(-t*t - t*90)*40)) * 1.1 * Math.exp(-t*10);
}


function acousticSnareNoise() {
    return new BiquadNoise(3, 0, 0, 1, 1, 1);
}
function acousticSnare(t, n, channel) {
    n *= Math.exp(-t*25);
    return Math.tanh(
        Math.sin(6117*t) * Math.exp(-t*25) * 0.1 +
        Math.sin(5342*t) * Math.exp(-t*20) * 0.2 +
        Math.sin(3453*t + n) * Math.exp(-t*30) * 0.3 +
        Math.sin(2234*t - n) * Math.exp(-t*15) * 0.5 +
        Math.sin(1000*t) * Math.exp(-t*14)
    );
}

function closedHihatNoise() {
    return new BiquadNoise(1, 0, 0, 1, -1, 0);
}
function closedHihat(t, n, channel) {
    n *= Math.exp(-t*60);
    return Math.sin(10*n + Math.sin(n)) * 0.5;
}

const INDEX_FUN_DUR = [
    [35, acousticBassDrum, acousticBassDrumNoise, 0.5],
    [38, acousticSnare, acousticSnareNoise, 0.5],
    [42, closedHihat, closedHihatNoise, 0.5],
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
            const n = noise.process();
            for (let channel = 0; channel < buffer.numberOfChannels; ++channel) {
                buffer.getChannelData(channel)[x] = fun(t, n, channel);
            }
        }
        PERCUSSION_BUFFERS[index] = buffer;
    });
}
