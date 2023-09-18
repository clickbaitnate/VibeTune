const context = new (window.AudioContext || window.webkitAudioContext)();

let leftOscillator, rightOscillator, filterNode;
let delayNode, delayTimeControl, delayIsActive = false;
let gainNode = context.createGain();


delayNode = context.createDelay(5.0); // max delay of 5 seconds
delayTimeControl = delayNode.delayTime;

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function frequencyToNoteName(frequency) {
    let hz = parseFloat(frequency);
    let note = 12 * (Math.log(hz / 440.0) / Math.log(2));
    let roundedNote = Math.round(note) + 69;
    let octave = Math.floor(roundedNote / 12) - 1;
    let noteName = notes[roundedNote % 12];
    return noteName + octave;
}

if ('wakeLock' in navigator) {
    // Wake Lock is supported
    // You can go ahead with requesting a wake lock
    let wakeLock = null;
  
    const requestWakeLock = async () => {
      wakeLock = await navigator.wakeLock.request('screen');
    };
  
    requestWakeLock();
  } else {
    // Wake Lock not supported
    // Handle fallback or alert the user
    console.log("Wake Lock API not supported");
  }
  

const brainwaveData = [
    {
        name: 'Delta',
        frequency: 2.5,
        color: 'red',
        description: 'Delta waves (around 2.5 Hz) are the slowest of the brainwaves and are predominant during deep, dreamless sleep. They play a crucial role in body healing and rejuvenation.'
    },
    {
        name: 'Theta',
        frequency: 6,
        color: 'orange',
        description: 'Theta waves (around 6 Hz) manifest during deep relaxation and REM sleep, where dreams occur. They are associated with insight, creativity, and a deep spiritual connection.'
    },
    {
        name: 'Alpha',
        frequency: 10,
        color: 'blue',
        description: 'Alpha waves (around 10 Hz) bridge the conscious and subconscious mind. Dominant in states of peaceful relaxation, they aid learning and mind-body integration.'
    },
    {
        name: 'Beta',
        frequency: 20,
        color: 'green',
        description: 'Beta waves (around 20 Hz) are predominant during waking states, reflecting active analytical thought and focus. They can be linked to states of alertness, but excessive Beta may cause anxiety.'
    },
    {
        name: 'Gamma',
        frequency: 40,
        color: 'purple',
        description: 'Gamma waves (around 40 Hz) involve high-level cognitive functions, uniting sensory perception, memory recall, and problem-solving.'
    }
];


document.getElementById("startStop").addEventListener("click", function() {
    if (this.innerText === 'Start') {
        startSound();
        this.innerText = 'Stop';
    } else {
        stopSound();
        this.innerText = 'Start';
    }
});

const numberOfImages = 7; // Replace with the actual number of your backgrounds
const preloadedImages = [];

for (let i = 1; i <= numberOfImages; i++) {
  const img = new Image();
  img.src = `backgrounds/background${i}.png`;
  preloadedImages.push(img);
}

document.addEventListener('DOMContentLoaded', (event) => {
  
    // Code for background slider
    const bgSlider = document.getElementById("bgSlider");
    const bgSliderValue = document.getElementById("bgSliderValue");
  
    bgSlider.addEventListener("input", function() {
      const bgNum = Math.round(this.value); // round off to whole number
      bgSliderValue.innerText = bgNum;
      
      // Dynamically update the background
      document.body.style.backgroundImage = `url('backgrounds/background${bgNum}.png')`;
    });
  
    // Code for button color slider
    const buttonColorSlider = document.getElementById("buttonColorSlider");
  
    buttonColorSlider.addEventListener("input", function() {
      const hueValue = this.value;
  
      // Using the value to set the R and G in RGB, keeping B as 0.
      const actualColor = `hsl(${hueValue}, 75%, 20%)`;
  
      // Update the button background colors
      const elementsToUpdate = document.querySelectorAll('button, input[type="range"], select');
      elementsToUpdate.forEach(function(element) {
        element.style.backgroundColor = actualColor;
      });
    });
  });
  
  


document.getElementById("brainwave").addEventListener("input", function() {
    const selectedBrainwave = brainwaveData[this.value];

    document.getElementById("brainwaveValue").innerText = selectedBrainwave.name;

    document.getElementById("brainwaveTitle").innerText = selectedBrainwave.name;
    document.getElementById("brainwaveTitle").style.color = selectedBrainwave.color;
    document.getElementById("brainwaveDescription").innerText = selectedBrainwave.description;

    if (leftOscillator) {
        const baseFreq = parseFloat(document.getElementById("pitch").value);
        leftOscillator.frequency.setValueAtTime(baseFreq, context.currentTime);
        rightOscillator.frequency.setValueAtTime(baseFreq + selectedBrainwave.frequency, context.currentTime);
    }
});

document.getElementById("volume").addEventListener("input", function() {
    document.getElementById("volumeValue").innerText = `${this.value}%`;
    if (gainNode) {
        gainNode.gain.setValueAtTime(this.value / 100, context.currentTime);
    }
});

document.getElementById("delayToggle").addEventListener("click", function() {
    delayIsActive = !delayIsActive;
    this.innerText = delayIsActive ? 'On' : 'Off';
    if (delayIsActive) {
        gainNode.connect(delayNode);
        delayNode.connect(context.destination);
    } else {
        gainNode.disconnect(delayNode);
        delayNode.disconnect(context.destination);
        gainNode.connect(context.destination);
    }
});

document.getElementById("delayTime").addEventListener("input", function() {
    const delayValue = parseFloat(this.value);
    document.getElementById("delayTimeValue").innerText = delayValue;
    if (delayTimeControl) {
        delayTimeControl.setValueAtTime(delayValue, context.currentTime);
    }
});


document.getElementById("waveType").addEventListener("input", function() {
    const waveTypes = ['sine', 'square', 'triangle'];
    const selectedWave = waveTypes[Math.round(this.value)];
    if (leftOscillator) {
        leftOscillator.type = selectedWave;
        rightOscillator.type = selectedWave;
    }
    document.getElementById("waveTypeValue").innerText = selectedWave;

});

document.getElementById("pitch").addEventListener("input", function() {
    document.getElementById("pitchValue").innerText = `${this.value} (${frequencyToNoteName(this.value)})`;
    if (leftOscillator) {
        const baseFreq = parseFloat(this.value);
        const selectedBrainwave = brainwaveData[document.getElementById("brainwave").value];
        leftOscillator.frequency.setValueAtTime(baseFreq, context.currentTime);
        rightOscillator.frequency.setValueAtTime(baseFreq + selectedBrainwave.frequency, context.currentTime);
    }
});

document.getElementById("filterType").addEventListener("change", function() {
    if (filterNode) {
        filterNode.type = this.value;
    }
});

document.getElementById("filterFrequency").addEventListener("input", function() {
    document.getElementById("filterFrequencyValue").innerText = this.value;
    if (filterNode) {
        filterNode.frequency.setValueAtTime(this.value, context.currentTime);
    }
});

document.getElementById("noiseVolume").addEventListener("input", function() {
    setNoiseVolume(this.value);
});


function startSound() {
    if (leftOscillator) {
        stopSound();
    }

    leftOscillator = context.createOscillator();
    rightOscillator = context.createOscillator();

    
    const selectedBrainwave = brainwaveData[document.getElementById("brainwave").value];
    const waveValue = parseFloat(document.getElementById("waveType").value);
    const baseFreq = parseFloat(document.getElementById("pitch").value);
    const waveTypes = ['sine', 'square', 'triangle'];

    let selectedWave = waveTypes[Math.round(waveValue)];

    filterNode = context.createBiquadFilter();
    filterNode.type = document.getElementById("filterType").value;
    filterNode.frequency.setValueAtTime(document.getElementById("filterFrequency").value, context.currentTime);

    leftOscillator.frequency.setValueAtTime(baseFreq, context.currentTime);
    rightOscillator.frequency.setValueAtTime(baseFreq + selectedBrainwave.frequency, context.currentTime);

    leftOscillator.type = selectedWave;
    rightOscillator.type = selectedWave;

    leftOscillator.connect(filterNode);
    rightOscillator.connect(filterNode);

    leftOscillator.start();
    rightOscillator.start();

    gainNode.gain.setValueAtTime(document.getElementById("volume").value / 100, context.currentTime);

    // For oscillators
    filterNode.connect(gainNode);
    if (delayIsActive) {
        gainNode.connect(delayNode);
        delayNode.connect(context.destination);
    } else {
        gainNode.connect(context.destination);
    }

// For noise
noiseGainNode.connect(context.destination);

}

let isFilterConnected = false;  // Initialize this somewhere in your code

function stopSound() {
  if (leftOscillator) {
    leftOscillator.stop();
    rightOscillator.stop();

    // Check before disconnecting
    if (leftOscillator.context.state !== 'closed') {
      leftOscillator.disconnect(filterNode);
    }

    if (rightOscillator.context.state !== 'closed') {
      rightOscillator.disconnect(filterNode);
    }

    if (filterNode && filterNode.context.state !== 'closed' && isFilterConnected) {
      filterNode.disconnect(context.destination);
      isFilterConnected = false;  // Reset the flag
    }

    leftOscillator = null;
    rightOscillator = null;
    filterNode = null;

    // Checking for gainNode and delayNode as well
    if (gainNode && gainNode.context.state !== 'closed') {
      gainNode.disconnect();
    }
    
    if (delayNode && delayNode.context.state !== 'closed') {
      delayNode.disconnect();
    }
  }
}


let noiseGainNode = context.createGain();
let noiseSource = null;
let noiseType = '';

function generateWhiteNoise(context) {
    let bufferSize = 2 * context.sampleRate,
        noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate),
        output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
}

function generatePinkNoise(context) {
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    let bufferSize = 2 * context.sampleRate;
    let noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    let output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        let white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // (roughly) compensate for gain
        b6 = white * 0.115926;
    }
    return noiseBuffer;
}

function generateBrownNoise(context) {
    let bufferSize = 2 * context.sampleRate;
    let noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
    let output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
        let white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // (roughly) compensate for gain
    }
    return noiseBuffer;
}

function toggleNoise(type) {
    if (noiseSource) {
        noiseSource.disconnect(); // Disconnect from any nodes
        noiseSource.stop();
        noiseSource = null;
        noiseType = '';
    } else {
        noiseSource = context.createBufferSource();
        switch (type) {
            case 'white':
                noiseSource.buffer = generateWhiteNoise(context);
                break;
            case 'pink':
                noiseSource.buffer = generatePinkNoise(context);
                break;
            case 'brown':
                noiseSource.buffer = generateBrownNoise(context);
                break;
        }
        noiseSource.loop = true;
        
        noiseSource.connect(noiseGainNode);

        // Check if filterNode exists, if not, connect directly to context.destination
        if (filterNode) {
            noiseGainNode.connect(filterNode);
        } else {
            noiseGainNode.connect(context.destination);
        }
        
        noiseSource.start();
        noiseType = type;
    }
}

function setNoiseVolume(value) {
    if(noiseGainNode) {
        // Normalize if needed (assuming input is 0-100)
        var normalizedValue = value / 100;
        noiseGainNode.gain.value = normalizedValue;
    }
}

