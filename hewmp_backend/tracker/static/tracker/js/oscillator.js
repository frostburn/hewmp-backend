class FMOsc {
    // Controls:
    // frequency, base frequency
    // detune, cent offset from base frequency
    // modulationIndex, strenght of FM
    // carrierFactor, carrier frequency multiplier
    // modulatorFactor, modulator frequency multiplier

    // Please note that if carrierFactor and modulatorFactor are not coprime
    // there will be no fundamental harmonic at base frequency.

    constructor(context) {
        // Main components
        this.carrier = context.createOscillator();
        this.modulator = context.createOscillator();

        // Override frequency controls
        this.carrier.frequency.setValueAtTime(0, context.currentTime);
        this.modulator.frequency.setValueAtTime(0, context.currentTime);

        // Boilerplate for connecting the modulator to carrier frequency with sane controls.
        this._carrierFactor = context.createGain();
        this.carrierFactor = this._carrierFactor.gain;
        this._modulatorFactor = context.createGain();
        this.modulatorFactor = this._modulatorFactor.gain;
        this.modScaler = context.createGain();
        this._modulationIndex = context.createGain();
        this.modulationIndex = this._modulationIndex.gain;;

        this._frequency = context.createConstantSource();
        this.frequency = this._frequency.offset;
        this.frequency.setValueAtTime(220, context.currentTime);
        this._frequency.connect(this._carrierFactor).connect(this.carrier.frequency);
        this._frequency.connect(this._modulatorFactor).connect(this.modulator.frequency);
        this._frequency.connect(this.modScaler.gain);
        this.modulator.connect(this.modScaler).connect(this._modulationIndex).connect(this.carrier.frequency);

        this._detune = context.createConstantSource();
        this.detune = this._detune.offset;
        this.detune.setValueAtTime(0, context.currentTime);
        this._detune.connect(this.carrier.detune);
        this._detune.connect(this.modulator.detune);
    }

    connect(destination) {
        return this.carrier.connect(destination);
    }

    start(when) {
        this.carrier.start(when);
        this.modulator.start(when);
        this._frequency.start(when);
        this._detune.start(when);
    }

    stop(when) {
        this.carrier.stop(when);
        this.modulator.stop(when);
        this._frequency.stop(when);
        this._detune.stop(when);
    }
}

class FMInstrument {
    constructor(context) {
        this.oscillator = new FMOsc(context);
        this._gain = context.createGain();
        this.gain = this._gain.gain;
        this.gain.setValueAtTime(0, context.currentTime);
        this.oscillator.connect(this._gain);
        this.frequency = this.oscillator.frequency;
        this.vibratoOsc = context.createOscillator();
        this.vibratoFrequency = this.vibratoOsc.frequency;
        this.vibratoGain = context.createGain();
        this.vibratoAmount = this.vibratoGain.gain;
        this.vibratoOsc.connect(this.vibratoGain).connect(this.oscillator.detune);

        this.amplitudeEnvelope = new Envelope([0, 1, .9, .8, .7, .6, .5, .4, .2, .0], 0.5, 5, 6, 9, 10);
        this.indexEnvelope = new Envelope([6, 5, 4, 3, 2, 1, 0.7, 0.4, 0.3, 0.2], 0.15, 9, 10, 9, 10);
        this.carrierEnvelope = new Envelope([2], 0.5, 0, 1, 0, 1);
        this.modulatorEnvelope = new Envelope([7], 0.5, 0, 1, 0, 1);
        this.detuneEnvelope = new Envelope([0], 0.5, 0, 1, 0, 1);
        this.vibratoFrequencyEnvelope = new Envelope([6], 0.5, 0, 1, 0, 1);
        this.vibratoAmountEnvelope = new Envelope([0, 5], 0.5, 1, 2, 1, 2);

        this.noteOnTime = null;
    }

    connect(destination) {
        return this._gain.connect(destination);
    }

    start(when) {
        this.oscillator.start(when);
        this.vibratoOsc.start(when);
    }

    stop(when) {
        this.oscillator.stop(when);
        this.vibratoOsc.stop(when);
    }

    // TODO: Velocity sensitivity
    // TODO: User-controlled envelopes
    noteOn(when) {
        this.noteOnTime = when;
        this.amplitudeEnvelope.noteOn(this.gain, when);
        this.indexEnvelope.noteOn(this.oscillator.modulationIndex, when);
        this.carrierEnvelope.noteOn(this.oscillator.carrierFactor, when);
        this.modulatorEnvelope.noteOn(this.oscillator.modulatorFactor, when);
        this.detuneEnvelope.noteOn(this.oscillator.detune, when);
        this.vibratoFrequencyEnvelope.noteOn(this.vibratoFrequency, when);
        this.vibratoAmountEnvelope.noteOn(this.vibratoAmount, when);
    }

    noteOff(when) {
        this.amplitudeEnvelope.noteOff(this.gain, when, this.noteOnTime);
        this.indexEnvelope.noteOff(this.oscillator.modulationIndex, when, this.noteOnTime);
        this.carrierEnvelope.noteOff(this.oscillator.carrierFactor, when, this.noteOnTime);
        this.modulatorEnvelope.noteOff(this.oscillator.modulatorFactor, when, this.noteOnTime);
        this.detuneEnvelope.noteOff(this.oscillator.detune, when, this.noteOnTime);
        this.vibratoFrequencyEnvelope.noteOff(this.vibratoFrequency, when, this.noteOnTime);
        this.vibratoAmountEnvelope.noteOff(this.vibratoAmount, when, this.noteOnTime);
    }
}

const DEFAULT_UNROLL_DURATION = 20;

class Envelope {
    constructor(values, duration, sustainStart, sustainEnd, loopStart, loopEnd, linear=true) {
        this.values = values;
        this.duration = duration;
        this.sustainStart = sustainStart;
        this.sustainEnd = sustainEnd;
        this.loopStart = loopStart;
        this.loopEnd = loopEnd;
        this.linear = linear;
    }

    unrollSustain(minDuration=DEFAULT_UNROLL_DURATION) {
        const dFactor = this.duration / this.values.length;
        let result = this.values.slice(0, this.sustainEnd);
        let duration = dFactor * this.sustainEnd;
        while (duration < minDuration) {
            result = result.concat(this.values.slice(this.sustainStart, this.sustainEnd));
            duration += dFactor * (this.sustainEnd - this.sustainStart);
        }
        return [result, duration];
    }

    unrollRelease(noteOnDuration, minDuration=DEFAULT_UNROLL_DURATION) {
        const dFactor = this.duration / this.values.length;
        let releaseIndex = Math.ceil(noteOnDuration / dFactor);
        const offset = dFactor * releaseIndex - noteOnDuration;
        while (releaseIndex > this.sustainEnd) {
            releaseIndex -= this.sustainEnd - this.sustainStart;
        }
        let result = this.values.slice(releaseIndex, this.loopEnd);
        let duration = dFactor * (this.loopEnd - releaseIndex);
        while (duration < minDuration) {
            result = result.concat(this.values.slice(this.loopStart, this.loopEnd));
            duration += dFactor * (this.loopEnd - this.loopStart);
        }
        return [result, duration, offset];
    }

    noteOn(audioParam, when) {
        const [values, duration] = this.unrollSustain();
        this.applyValues(audioParam, when, values, duration, 0);
    }

    noteOff(audioParam, when, noteOnTime) {
        const [values, duration, offset] = this.unrollRelease(when - noteOnTime);
        this.applyValues(audioParam, when, values, duration, offset);
    }

    applyValues(audioParam, when, values, duration, offset) {
        audioParam.cancelScheduledValues(when);
        audioParam.setValueAtTime(values[0], when);
        const dt = duration / values.length;
        let time = offset;
        values.forEach(value => {
            if (this.linear) {
                audioParam.linearRampToValueAtTime(value, when + time);
            } else {
                audioParam.setValueAtTime(value, when + time);
            }
            time += dt;
        });
    }
}


class OscillatorInstrument {
    constructor(context) {
        this.oscillator = context.createOscillator();
        this._gain = context.createGain();
        this.gain = this._gain.gain;
        this.gain.setValueAtTime(0, context.currentTime);
        this.oscillator.connect(this._gain);
        this.frequency = this.oscillator.frequency;
        this.vibratoOsc = context.createOscillator();
        this.vibratoFrequency = this.vibratoOsc.frequency;
        this.vibratoGain = context.createGain();
        this.vibratoAmount = this.vibratoGain.gain;
        this.vibratoOsc.connect(this.vibratoGain).connect(this.oscillator.detune);

        this.oscillator.type = "triangle";
        this.vibratoFrequency.setValueAtTime(5, context.currentTime);

        this.attack = 0.01;
        this.decay = 0.1;
        this.sustain = 0.7;
        this.release = 0.15;

        this.vibratoAttack = 0.2;
        this.vibratoDepth = 5;
    }

    connect(destination) {
        return this._gain.connect(destination);
    }

    start(when) {
        this.oscillator.start(when);
        this.vibratoOsc.start(when);
    }

    stop(when) {
        this.oscillator.stop(when);
        this.vibratoOsc.stop(when);
    }

    noteOn(when) {
        this.gain.setValueAtTime(0, when);
        this.gain.linearRampToValueAtTime(1, when + this.attack);
        this.gain.linearRampToValueAtTime(this.sustain, when + this.attack + this.decay);

        this.vibratoAmount.setValueAtTime(0, when);
        this.vibratoAmount.linearRampToValueAtTime(this.vibratoDepth, when + this.vibratoAttack);
    }

    noteOff(when) {
        this.gain.cancelScheduledValues(when);
        this.gain.setValueAtTime(this.gain.value, when);
        this.gain.linearRampToValueAtTime(0, when + this.release);
    }
}
