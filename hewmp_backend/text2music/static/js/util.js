// The following function are copying from 
// https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function gcd(a, b) {
    if (b) {
        return gcd(b, a % b);
    } else {
        return Math.abs(a);
    }
}

function naiveFourier(real, imag) {
    if (imag === undefined) {
        imag = new Float32Array(real.length);
    }
    const resultReal = new Float32Array(real.length);
    const resultImag = new Float32Array(real.length);
    for (let i = 0; i < real.length; ++i) {
        const t = i / real.length;
        for (let j = 0; j < real.length; ++j) {
            const theta = 2*Math.PI*j*t;
            resultReal[j] += Math.cos(theta) * real[i] - Math.sin(theta) * imag[i];
            resultImag[j] += Math.cos(theta) * imag[i] + Math.sin(theta) * real[i];
        }
    }
    return [resultReal, resultImag];
}

function fourier(real, imag) {
    // TODO: Use symmetry to cut the amount of
    // required computation by half when data is real.
    if (imag === undefined) {
        imag = new Float32Array(real.length);
    }
    const resultReal = new Float32Array(real.length);
    const resultImag = new Float32Array(real.length);

    let x = 1;  // z real part
    let y = 0;  // z imag part
    const dx = Math.cos(2*Math.PI/real.length);
    const dy = Math.sin(2*Math.PI/real.length);

    for (let i = 0; i < real.length; ++i) {
        let nx = 1;
        let ny = 0;
        for (let j = 0; j < real.length; ++j) {
            resultReal[j] += nx * real[i] - ny * imag[i];
            resultImag[j] += nx * imag[i] + ny * real[i];
            [nx, ny] = [nx*x - ny*y, nx*y + ny*x];
        }
        [x, y] = [x*dx - y*dy, x*dy + y*dx];
    }
    return [resultReal, resultImag];
}
