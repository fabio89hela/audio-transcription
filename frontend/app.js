// File: app.js

// Questo script gestisce la navigazione dalla pagina principale (index.html)
// ai moduli di caricamento o registrazione in base alle selezioni effettuate.

// Riferimenti agli elementi del DOM
const categorySelect = document.getElementById('category-select');
const uploadButton = document.getElementById('upload-button');
const recordButton = document.getElementById('record-button');

// Funzione per abilitare i pulsanti solo se una categoria è stata selezionata
categorySelect.addEventListener('change', () => {
    if (categorySelect.value) {
        // Se una categoria è selezionata, abilita i pulsanti
        uploadButton.disabled = false;
        recordButton.disabled = false;
    } else {
        // Altrimenti, disabilita i pulsanti
        uploadButton.disabled = true;
        recordButton.disabled = true;
    }
});

// Navigazione verso la pagina di caricamento file
uploadButton.addEventListener('click', () => {
    window.location.href = 'upload.html'; // Reindirizza alla pagina upload.html
});

// Navigazione verso la pagina di registrazione
recordButton.addEventListener('click', () => {
    window.location.href = 'record.html'; // Reindirizza alla pagina record.html
});
