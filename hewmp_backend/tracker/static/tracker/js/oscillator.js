class FMOsc {
    // Controls:
    // frequency, base frequency
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
        this.gain.setValueAtTime(0, when);
        this.gain.linearRampToValueAtTime(1, when + 0.02);
        this.gain.linearRampToValueAtTime(0.5, when + 0.35);

        this.oscillator.carrierFactor.setValueAtTime(2, when);
        this.oscillator.modulatorFactor.setValueAtTime(7, when);

        this.oscillator.modulationIndex.setValueAtTime(6, when);
        this.oscillator.modulationIndex.exponentialRampToValueAtTime(0.2, when + 0.15);

        this.vibratoFrequency.setValueAtTime(6, when);
        this.vibratoAmount.setValueAtTime(0, when);
        this.vibratoAmount.linearRampToValueAtTime(5, when + 0.4);
    }

    noteOff(when) {
        this.gain.cancelScheduledValues(when);
        this.gain.setValueAtTime(this.gain.value, when);
        this.gain.linearRampToValueAtTime(0, when + 0.1);
    }
}
