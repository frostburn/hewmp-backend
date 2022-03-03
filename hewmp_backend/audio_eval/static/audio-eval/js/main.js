function evalText(text, dataX, dataY, dt) {
    function x(n) {
        if (n < 0 || n >= dataX.length) {
            return 0.0;
        }
        return dataX[n];
    }
    function y(n) {
        if (n < 0 || n >= dataY.length) {
            return 0.0;
        }
        return dataY[n];
    }
    for (let n = 0; n < dataY.length; ++n) {
        const t = dt * n;
        dataY[n] = eval(text);
    }
}

function main() {
    const textA = document.getElementById("textA");
    const textB = document.getElementById("textB");
    const evalBtn = document.getElementById("evaluate");

    let audioCtx = null;

    evalBtn.onclick = e => {
        if (audioCtx === null) {
            audioCtx = new AudioContext();
        }
        const dt = 1.0 / audioCtx.sampleRate;
        const bufferLength = audioCtx.sampleRate;
        const bufferX = audioCtx.createBuffer(1, bufferLength, audioCtx.sampleRate);
        const bufferY = audioCtx.createBuffer(1, bufferLength, audioCtx.sampleRate);
        const dataX = bufferX.getChannelData(0);
        const dataY = bufferY.getChannelData(0);
        if (textA.value) {
            evalText(textA.value, dataY, dataX, dt);  // Feed silence as x for text A
        }
        if (textB.value) {
            evalText(textB.value, dataX, dataY, dt);  // Feed the result of A as x for text B
        } else {
            if (window.fun !== undefined) {
                for (let n = 0; n < dataY.length; ++n) {
                    const t = dt*n;
                    dataY[n] = window.fun(t);
                }
            }
        }

        for (let n = 0; n < dataY.length; ++n) {
            dataY[n] *= 0.5;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = bufferY;
        source.connect(audioCtx.destination);
        source.start();
    }
}
