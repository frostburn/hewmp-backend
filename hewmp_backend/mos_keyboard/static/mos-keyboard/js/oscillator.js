const EXPIRED = 10000;  // Max number of concurrent note-ons before things get weird.

// Unfortunately common Web Audio API implementations have a bug
// where disconnected and stopped oscillators fail to garbage collect.
// This means we have a finite budget on oscillators we can create
// and need to reuse them.
// I haven't checked if this applies to other AudioNodes as well so
// this bank system might need to be extended in the future.
class OscillatorBank {
    constructor(context) {
        this.context = context;
        this.oscillators = [];
    }

    borrowOscillator() {
        if (this.oscillators.length) {
            return this.oscillators.pop();
        }
        return this.context.createOscillator();
    }

    returnOscillator(oscillator) {
        oscillator.disconnect();
        oscillator.stop();
        this.oscillators.push(oscillator);
    }
}

class FMOsc {
    // Controls:
    // frequency, base frequency
    // detune, cent offset from base frequency
    // modulationIndex, strenght of FM
    // carrierFactor, carrier frequency multiplier
    // modulatorFactor, modulator frequency multiplier

    // Please note that if carrierFactor and modulatorFactor are not coprime
    // there will be no fundamental harmonic at base frequency.

    constructor(bank) {
        this.bank = bank;
        const context = bank.context;
        // Main components
        this.carrier = bank.borrowOscillator();
        this.modulator = bank.borrowOscillator();

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

    dispose() {
        this.bank.returnOscillator(this.carrier);
        this.bank.returnOscillator(this.modulator);
    }
}


class OscillatorVoice {
    constructor(bank) {
        this.bank = bank;
        const context = bank.context;
        this.oscillator = bank.borrowOscillator();
        this._gain = context.createGain();
        this.gain = this._gain.gain;
        this.gain.setValueAtTime(0, context.currentTime);
        this.oscillator.connect(this._gain);
        this.frequency = this.oscillator.frequency;
        this.detune = this.oscillator.detune;
        this.vibrato = context.createGain();
        this.vibratoAmount = this.vibrato.gain;
        this.vibrato.connect(this.oscillator.detune);
        this.reset();
    }

    reset() {
        this.oscillator.type = "triangle";

        this.attack = 0.01;
        this.decay = 0.1;
        this.sustain = 0.7;
        this.release = 0.15;

        this.vibratoAttack = 0.2;
    }

    connect(destination) {
        return this._gain.connect(destination);
    }

    start(when) {
        this.oscillator.start(when);
    }

    stop(when) {
        this.oscillator.stop(when);
    }

    noteOn(when) {
        this.gain.cancelScheduledValues(when);
        this.gain.setValueAtTime(0, when);
        this.gain.linearRampToValueAtTime(1, when + this.attack);
        this.gain.linearRampToValueAtTime(this.sustain, when + this.attack + this.decay);

        this.vibratoAmount.cancelScheduledValues(when);
        this.vibratoAmount.setValueAtTime(0, when);
        this.vibratoAmount.linearRampToValueAtTime(1, when + this.vibratoAttack);
    }

    noteOff(when) {
        this.gain.cancelScheduledValues(when);
        this.gain.setValueAtTime(this.gain.value, when);
        this.gain.linearRampToValueAtTime(0, when + this.release);
    }

    dispose() {
        this.bank.returnOscillator(this.oscillator);
    }
}

class OscillatorInstrument {
    constructor(bank) {
        this.bank = bank;
        const context = bank.context;

        this.gain_ = context.createGain();
        this.gain = this.gain_.gain;

        this.filter = context.createBiquadFilter();
        this.filter.type = "lowpass";
        this.filter.connect(this.gain_);

        // TODO
        // this tremoloOsc = bank.borrowOscillator();
        // this.tremoloFrequency = this.tremoloOsc.frequency;
        // this.tremoloAmount_ = context.createGain();
        // this.tremoloAmount = this.tremoloAmount_.gain;
        // this.tremoloFrequency.connect(this.tremoloAmount_);

        this.vibratoOsc = bank.borrowOscillator();
        this.vibratoOsc.start(context.currentTime);
        this.vibratoFrequency = this.vibratoOsc.frequency;
        this.vibratoDepth_ = context.createGain();
        this.vibratoDepth = this.vibratoDepth_.gain;
        this.vibratoOsc.connect(this.vibratoDepth_);

        this.pitchBend_ = context.createConstantSource();
        this.pitchBend_.start(context.currentTime);
        this.pitchBend = this.pitchBend_.offset;

        this.voices = [];

        this.reset();
    }

    reset() {
        const time = this.bank.context.currentTime;

        this.gain.setValueAtTime(1.0, time);

        this.filter.frequency.setValueAtTime(10000, time);
        this.filter.Q.setValueAtTime(0.7, time);

        // this.tremoloOsc.setValueAtTime(5, this.bank.context.currentTime);
        // this.tremoloAmount.setValueAtTime(0.1, this.bank.context.currentTime);

        this.vibratoFrequency.setValueAtTime(5, time);
        this.vibratoDepth.setValueAtTime(5, time);

        this.pitchBend.setValueAtTime(0, time);

        this.voices.forEach(voice => voice.reset());
    }

    connect(destination) {
        return this.gain_.connect(destination);
    }

    appendVoice() {
        const voice = new OscillatorVoice(this.bank);
        this.vibratoDepth_.connect(voice.vibrato);
        this.pitchBend_.connect(voice.detune);
        voice.connect(this.filter);
        // this.tremoloAmount_.connect(voice.tremolo);
        voice.start();
        voice.age = EXPIRED;
        this.voices.push(voice);
    }

    dispose() {
        this.voices.forEach(voice => voice.dispose());
        this.bank.returnOscillator(this.vibratoOsc);
        // this.bank.returnOscillator(this.tremoloOsc);
    }

    getOldestVoice() {
        let result = this.voices[0];
        this.voices.forEach(voice => {
            if (voice.age > result.age) {
                result = voice
            }
        });
        return result;
    }

    voiceOn(frequency) {
        const time = this.bank.context.currentTime;

        const voice = this.getOldestVoice();
        voice.frequency.cancelScheduledValues(time);
        voice.frequency.setValueAtTime(frequency, time);

        voice.noteOn(time);

        this.voices.forEach(v => v.age++);

        voice.age = 0;

        return voice;
    }

    voiceOff(voice) {
        const time = this.bank.context.currentTime;

        voice.noteOff(time);

        voice.age = EXPIRED;
    }
}
