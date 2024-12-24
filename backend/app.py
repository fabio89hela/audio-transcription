from flask import Flask, request, jsonify  # Importiamo Flask e moduli per gestire richieste e risposte
import os  # Importiamo il modulo per operazioni sui file locali
from whisper_transcription import transcribe_audio  # Importiamo la funzione di trascrizione

app = Flask(__name__)  # Inizializziamo l'app Flask
UPLOAD_FOLDER = "uploads"  # Cartella dove salvare i file caricati
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Creiamo la cartella se non esiste

# Endpoint per la trascrizione di un file audio
@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:  # Controlliamo se il file audio è presente nella richiesta
        return jsonify({"error": "Nessun file audio fornito"}), 400

    audio_file = request.files["audio"]  # Otteniamo il file audio dalla richiesta
    # Verifichiamo che il formato del file sia accettabile
    if audio_file.filename.split('.')[-1] not in ["wav", "mp3"]:
        return jsonify({"error": "Formato file non supportato"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)  # Percorso completo per salvare il file
    audio_file.save(file_path)  # Salviamo il file audio nella cartella `uploads`

    # Trascrizione del file audio
    transcription = transcribe_audio(file_path)  # Chiamata alla funzione di trascrizione
    return jsonify({"transcription": transcription})  # Restituiamo la trascrizione come risposta JSON

if __name__ == "__main__":
    app.run(debug=True)  # Avviamo il server Flask in modalità debug
