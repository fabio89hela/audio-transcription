// File JavaScript aggiornato per includere la gestione della registrazione e riascolto interattivo

// Variabili globali
let selectedCategory = ""; // Categoria selezionata
let recorder, audioChunks; // Oggetti per la registrazione audio
let audioBlob, audioURL; // Oggetti per la gestione dell'audio registrato
let recording = false; // Stato della registrazione
let startTime, elapsedTime, pausedTime = 0; // Temporizzazione
let animationFrameId; // ID dell'animazione per la visualizzazione dell'onda audio
let audioContext, analyser, dataArray, bufferLength; // API Web Audio
let audioPlayer, playButton, progressBar; // Elementi per il riascolto

// Funzione per selezionare la categoria
function selectCategory(category) {
    selectedCategory = category;
    document.getElementById("step-1").classList.add("hidden");
    document.getElementById("step-2").classList.remove("hidden");
}

// Funzione per gestire la scelta dell'opzione (upload o record)
function chooseOption(option) {
    document.getElementById("step-2").classList.add("hidden");
    if (option === "record") {
        document.getElementById("recording-section").classList.remove("hidden");
    } else {
        document.getElementById("audio-file").click();
    }
}

// Funzione per avviare o mettere in pausa la registrazione
function toggleRecording() {
    if (!recording) {
        startRecording();
    } else {
        pauseRecording();
    }
}

// Funzione per avviare la registrazione audio
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recorder = new MediaRecorder(stream);
        audioChunks = [];

        // Inizializza l'analizzatore audio
        initializeAudioVisualization(stream);

        recorder.ondataavailable = event => audioChunks.push(event.data);
        recorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            audioURL = URL.createObjectURL(audioBlob);
            cancelAnimationFrame(animationFrameId); // Ferma l'animazione
            setupAudioPlayer(audioURL); // Inizializza il player per il riascolto
        };

        recorder.onstart = () => {
            recording = true; // Imposta recording a true quando la registrazione inizia
            startTime = Date.now() - pausedTime; // Considera il tempo trascorso prima della pausa
            updateTimer(); // Avvia l'aggiornamento del timer
        };

        recorder.start(); // Avvia il recorder
        document.getElementById("record-button").textContent = "Pausa Registrazione";
        document.getElementById("stop-button").classList.remove("hidden");
    } catch (error) {
        alert(error);
    }
}

// Funzione per inizializzare la visualizzazione dell'onda audio
function initializeAudioVisualization(stream) {
    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    const canvas = document.getElementById("waveform");
    const canvasCtx = canvas.getContext("2d");

    function draw() {
        animationFrameId = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = "#eaeaea";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "#007BFF";
        canvasCtx.beginPath();

        let sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            let v = dataArray[i] / 128.0;
            let y = (v * canvas.height) / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }

    draw();
}

// Funzione per mettere in pausa la registrazione
function pauseRecording() {
    recorder.pause();
    pausedTime = Date.now() - startTime; // Memorizza il tempo trascorso
    document.getElementById("record-button").textContent = "Riprendi Registrazione";
    recording = false;
}

// Funzione per interrompere la registrazione
function stopRecording() {
    recorder.stop();
    recording = false;
    pausedTime = 0; // Resetta il tempo della pausa
    cancelAnimationFrame(animationFrameId); // Ferma l'animazione dell'onda audio

    document.getElementById("record-button").classList.add("hidden");
    document.getElementById("stop-button").classList.add("hidden");
    //document.getElementById("play-button").classList.remove("hidden");
    document.getElementById("upload-button").classList.remove("hidden");
}

// Funzione per configurare il player audio interattivo
function setupAudioPlayer(url) {
    const playerContainer = document.getElementById("audio-player-container");
    playerContainer.innerHTML = ""; // Pulisci il contenitore

    // Crea l'elemento audio
    audioPlayer = document.createElement("audio");
    audioPlayer.src = url;
    audioPlayer.controls = false;

    // Crea i controlli interattivi
    playButton = document.createElement("button");
    playButton.textContent = "Play";
    playButton.addEventListener("click", () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playButton.textContent = "Pause";
        } else {
            audioPlayer.pause();
            playButton.textContent = "Play";
        }
    });

    progressBar = document.createElement("input");
    progressBar.type = "range";
    progressBar.min = 0;
    progressBar.max = 100;
    progressBar.value = 0;
    progressBar.addEventListener("input", () => {
        const seekTime = (progressBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    });

    audioPlayer.addEventListener("timeupdate", () => {
        progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    });

    // Aggiungi gli elementi al contenitore
    playerContainer.appendChild(playButton);
    playerContainer.appendChild(progressBar);
    playerContainer.appendChild(audioPlayer);

    // Rendi visibile il contenitore
    playerContainer.classList.remove("hidden");
}

// Funzione per riascoltare l'audio registrato
function playAudio() {
    document.getElementById("audio-player-container").classList.remove("hidden");
}

// Funzione per caricare l'audio nella categoria selezionata
async function uploadAudio() {
    if (!selectedCategory) {
        alert("Seleziona una categoria prima di caricare l'audio.");
        return;
    }

    if (!audioBlob) {
        alert("Nessun file audio disponibile per il caricamento.");
        return;
    }

    try {
        await uploadToGoogleDrive(audioBlob, selectedCategory);
    } catch (error) {
        console.error("Errore durante il caricamento:", error);
    }
}

// Funzione per gestire il caricamento di un file audio
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        alert(`File ${file.name} caricato con successo nella categoria ${selectedCategory}`);
    }
}

// Funzione per aggiornare il timer della registrazione
function updateTimer() {
    if (!recording) return; // Esci se la registrazione non è attiva
    elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("time-display").textContent = `Tempo registrato: ${elapsedTime}s`;
    requestAnimationFrame(updateTimer); // Continua l'aggiornamento del timer
}
