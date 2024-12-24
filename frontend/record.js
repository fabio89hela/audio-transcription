const startButton = document.getElementById("startRecording");
const pauseButton = document.getElementById("pauseRecording");
const stopButton = document.getElementById("stopRecording");
const uploadButton = document.getElementById("uploadAudio");
const audioPlayback = document.getElementById("audioPlayback");
const timerDisplay = document.getElementById("timer");

let mediaRecorder;
let audioChunks = [];
let timer;
let timeElapsed = 0;

startButton.addEventListener("click", async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("start", () => {
        timeElapsed = 0;
        updateTimer();
        timer = setInterval(updateTimer, 1000);
    });

    mediaRecorder.addEventListener("stop", () => {
        clearInterval(timer);
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayback.src = audioUrl;

        // Abilita il caricamento
        uploadButton.disabled = false;
        uploadButton.addEventListener("click", () => {
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.wav");

            fetch("https://backend-transcription.onrender.com/transcribe", {
                method: "POST",
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    alert("Trascrizione completata: " + data.transcription);
                });
        });
    });

    mediaRecorder.start();
    startButton.disabled = true;
    pauseButton.disabled = false;
    stopButton.disabled = false;
});

pauseButton.addEventListener("click", () => {
    if (mediaRecorder.state === "recording") {
        mediaRecorder.pause();
        clearInterval(timer);
        pauseButton.textContent = "Riprendi";
    } else {
        mediaRecorder.resume();
        timer = setInterval(updateTimer, 1000);
        pauseButton.textContent = "Pausa";
    }
});

stopButton.addEventListener("click", () => {
    mediaRecorder.stop();
    startButton.disabled = false;
    pauseButton.disabled = true;
    stopButton.disabled = true;
});

function updateTimer() {
    timeElapsed += 1;
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
