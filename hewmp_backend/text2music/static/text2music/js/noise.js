class WhiteNoiseProcessor extends AudioWorkletProcessor {
  process (inputs, outputs, parameters) {
    const output = outputs[0];
    output.forEach(channel => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = Math.random() * 2 - 1;
      }
    });
    return true;
  }
}

/*
Filter to make pink noise from white  (updated March 2000)
------------------------------------

This is an approximation to a -10dB/decade filter using a weighted sum
of first order filters. It is accurate to within +/-0.05dB above 9.2Hz 
(44100Hz sampling rate). Unity gain is at Nyquist, but can be adjusted
by scaling the numbers at the end of each line.

If 'white' consists of uniform random numbers, such as those generated
by the rand() function, 'pink' will have an almost gaussian level 
distribution.

An 'economy' version with accuracy of +/-0.5dB is also available.

  b0 = 0.99765 * b0 + white * 0.0990460;
  b1 = 0.96300 * b1 + white * 0.2965164;
  b2 = 0.57000 * b2 + white * 1.0526913;
  pink = b0 + b1 + b2 + white * 0.1848;

---
paul.kellett@maxim.abel.co.uk
http://www.abel.co.uk/~maxim/

--- See also --
https://www.musicdsp.org/en/latest/Filters/76-pink-noise-filter.html
*/

class PinkNoiseProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this.b0 = 0;
    this.b1 = 0;
    this.b2 = 0;
    this.b3 = 0;
    this.b4 = 0;
    this.b5 = 0;
    this.b6 = 0;
  }
  process (inputs, outputs, parameters) {
    const output = outputs[0];
    output.forEach(channel => {
      for (let i = 0; i < channel.length; i++) {
        const white = Math.random() * 2 - 1;
        this.b0 = 0.99886 * this.b0 + white * 0.0555179;
        this.b1 = 0.99332 * this.b1 + white * 0.0750759;
        this.b2 = 0.96900 * this.b2 + white * 0.1538520;
        this.b3 = 0.86650 * this.b3 + white * 0.3104856;
        this.b4 = 0.55000 * this.b4 + white * 0.5329522;
        this.b5 = -0.7616 * this.b5 - white * 0.0168980;
        channel[i] = this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + this.b6 + white * 0.5362;
        this.b6 = white * 0.115926;
      }
    });
    return true;
  }
}


registerProcessor('white-noise-processor', WhiteNoiseProcessor);
registerProcessor('pink-noise-processor', PinkNoiseProcessor);
