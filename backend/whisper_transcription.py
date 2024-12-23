from faster_whisper import WhisperModel

def transcribe_audio(file_path):
    model = WhisperModel("base", device="cpu")
    segments, _ = model.transcribe(file_path, beam_size=5)
    return " ".join(segment.text for segment in segments)
