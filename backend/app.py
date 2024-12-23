import os
from flask import Flask, request, jsonify
from whisper_transcription import transcribe_audio

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    if audio_file.filename.split('.')[-1] not in ["wav", "mp3"]:
        return jsonify({"error": "Unsupported file format"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
    audio_file.save(file_path)

    transcription = transcribe_audio(file_path)
    return jsonify({"transcription": transcription})

if __name__ == "__main__":
    # Ottieni la porta dalla variabile di ambiente, default 5000 per sviluppo locale
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
