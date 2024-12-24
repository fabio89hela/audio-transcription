// File: record.js

// Questo script gestisce la logica della registrazione audio nella pagina record.html

// Riferimenti agli elementi del DOM
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const stopButton = document.getElementById('stop-button');
const audioPlayback = document.getElementById('audio-playback');
const timerElement = document.getElementById('timer');
const uploadButton = document.getElementById('upload-button');
const waveformCanvas = document.getElementById('waveform');

let mediaRecorder;
let audioChunks = [];
let timer;
let elapsedTime = 0;
let isPaused = false;
let audioContext;
let analyser;
let dataArray;
let source;
let canvasContext;

// Inizializza il canvas per l'onda audio
function initializeWaveform() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    dataArray = new Uint8Array(analyser.fftSize);
    canvasContext = waveformCanvas.getContext('2d');
}

// Disegna l'onda audio sul canvas
function drawWaveform() {
    requestAnimationFrame(drawWaveform);

    analyser.getByteTimeDomainData(dataArray);

    canvasContext.fillStyle = '#f8f9fa'; // Colore di sfondo del canvas
    canvasContext.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);

    canvasContext.lineWidth = 2;
    canvasContext.strokeStyle = '#007bff'; // Colore dell'onda audio

    canvasContext.beginPath();

    const sliceWidth = waveformCanvas.width / analyser.fftSize;
    let x = 0;

    for (let i = 0; i < analyser.fftSize; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * waveformCanvas.height) / 2;

        if (i === 0) {
            canvasContext.moveTo(x, y);
        } else {
            canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasContext.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
    canvasContext.stroke();
}

// Funzione per aggiornare il timer visualizzato
function updateTimer() {
    elapsedTime += 1;
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Gestione della registrazione
startButton.addEventListener('click', async () => {
    // Ottieni il permesso per accedere al microfono
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Crea un MediaRecorder per registrare l'audio
    mediaRecorder = new MediaRecorder(stream);

    // Gestione dei dati audio disponibili
    mediaRecorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
    });

    // Quando inizia la registrazione
    mediaRecorder.addEventListener('start', () => {
        elapsedTime = 0;
        updateTimer();
        timer = setInterval(updateTimer, 1000); // Aggiorna il timer ogni secondo
        startButton.disabled = true;
        pauseButton.disabled = false;
        stopButton.disabled = false;

        // Collegamento al microfono per l'analisi del segnale
        const audioSource = audioContext.createMediaStreamSource(stream);
        audioSource.connect(analyser);
        drawWaveform();
    });

    // Avvia la registrazione
    mediaRecorder.start();

    // Inizializza il canvas per l'onda audio
    initializeWaveform();
});

// Gestione pausa e ripresa della registrazione
pauseButton.addEventListener('click', () => {
    if (mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
        clearInterval(timer); // Ferma il timer
        pauseButton.textContent = 'Riprendi';
    } else if (mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        timer = setInterval(updateTimer, 1000); // Riprendi il timer
        pauseButton.textContent = 'Pausa';
    }
});

// Gestione fine della registrazione
stopButton.addEventListener('click', () => {
    mediaRecorder.stop(); // Ferma la registrazione
    clearInterval(timer); // Ferma il timer

    // Quando la registrazione è completa
    mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayback.src = audioUrl; // Imposta l'audio per la riproduzione
        uploadButton.disabled = false; // Abilita il pulsante di caricamento

        // Gestione caricamento dell'audio registrato
        uploadButton.addEventListener('click', () => {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.wav');

            fetch('https://your-backend-url.onrender.com/transcribe', {
                method: 'POST',
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    alert(`Trascrizione completata: ${data.transcription}`);
                })
                .catch((error) => {
                    alert('Errore durante la trascrizione.');
                });
        });
    });

    // Disabilita i pulsanti dopo la registrazione
    startButton.disabled = false;
    pauseButton.disabled = true;
    stopButton.disabled = true;
});