/** Local synthesized surf and soft chimes, independent from the calendar radio. */
export function createBeachSound() {
  let context: AudioContext | undefined;
  let master: GainNode | undefined;
  let source: AudioBufferSourceNode | undefined;
  let swell: OscillatorNode | undefined;
  function start() {
    if (!context) {
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = 0;
      master.connect(context.destination);
      const buffer = context.createBuffer(1, context.sampleRate * 6, context.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        last = (last + (Math.random() * 2 - 1) * 0.02) / 1.02;
        data[i] = last * 3.5;
      }
      source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 950;
      const ocean = context.createGain();
      ocean.gain.value = 0.28;
      source.connect(filter).connect(ocean).connect(master);
      swell = context.createOscillator();
      swell.frequency.value = 0.12;
      const depth = context.createGain();
      depth.gain.value = 0.13;
      swell.connect(depth).connect(ocean.gain);
      source.start();
      swell.start();
    }
    void context.resume();
    master?.gain.setTargetAtTime(0.5, context.currentTime, 0.5);
  }
  return {
    start,
    mute() { if (context && master) master.gain.setTargetAtTime(0, context.currentTime, 0.15); },
    chime() {
      if (!context || !master) return;
      const now = context.currentTime;
      [523.25, 783.99, 1046.5].forEach((frequency, index) => {
        if (!context || !master) return;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.025, now + index * 0.1 + 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
        oscillator.connect(gain).connect(master);
        oscillator.start(now + index * 0.1);
        oscillator.stop(now + 3);
      });
    },
    dispose() { source?.stop(); swell?.stop(); if (context) void context.close(); },
  };
}