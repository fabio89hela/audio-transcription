async function uploadToGoogleDrive(file, category) {
    const url = "/.netlify/functions/upload-to-drive";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            alert(`File caricato con successo! Link: ${data.fileUrl}`);
        } else {
            alert("Errore nel caricamento del file.");
        }
    } catch (error) {
        console.error("Errore durante il caricamento:", error);
        alert("Errore durante il caricamento. Riprova.");
    }
}
