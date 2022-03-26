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
        this._frequency.connect(this._carrierFactor).connect(this.carrier.frequency);
        this._frequency.connect(this._modulatorFactor).connect(this.modulator.frequency);
        this._frequency.connect(this.modScaler.gain);
        this.modulator.connect(this.modScaler).connect(this._modulationIndex).connect(this.carrier.frequency);
    }

    connect(destination) {
        return this.carrier.connect(destination);
    }

    start(when) {
        this.carrier.start(when);
        this.modulator.start(when);
        this._frequency.start(when);
    }

    stop(when) {
        this.carrier.stop(when);
        this.modulator.stop(when);
        this._frequency.stop(when);
    }
}
