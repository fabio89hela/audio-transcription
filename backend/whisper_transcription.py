from faster_whisper import WhisperModel  # Importiamo il modello di Whisper da Faster Whisper

# Funzione per trascrivere un file audio
def transcribe_audio(file_path):
    # Carichiamo il modello Whisper (base) su CPU
    model = WhisperModel("base", device="cpu")

    # Trascrizione del file audio
    # Il metodo `transcribe` restituisce i segmenti trascritti
    segments, _ = model.transcribe(file_path, beam_size=5)

    # Combiniamo i testi dei segmenti in un'unica stringa
    return " ".join(segment.text for segment in segments)
