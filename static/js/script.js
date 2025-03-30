document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const providerBox = document.getElementById('providerBox');
    const patientBox = document.getElementById('patientBox');
    const providerRecordBtn = document.getElementById('providerRecordBtn');
    const patientRecordBtn = document.getElementById('patientRecordBtn');
    const providerPlayBtn = document.getElementById('providerPlayBtn');
    const patientPlayBtn = document.getElementById('patientPlayBtn');
    const providerLanguage = document.getElementById('providerLanguage');
    const patientLanguage = document.getElementById('patientLanguage');
    const switchSpeakerBtn = document.getElementById('switchSpeakerBtn');
    const conversationHistory = document.getElementById('conversationHistory');
    const audioPlayer = document.getElementById('audioPlayer');

    // State
    let isRecording = false;
    let recognition = null;
    let currentSpeaker = 'provider'; // 'provider' or 'patient'
    let transcript = '';
    let translatedText = '';

    // Initialize speech recognition
    function initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = function(event) {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        transcript = result;
                    } else {
                        interimTranscript += result;
                    }
                }

                // Update the appropriate box
                if (currentSpeaker === 'provider') {
                    providerBox.textContent = transcript || interimTranscript;
                } else {
                    patientBox.textContent = transcript || interimTranscript;
                }
            };

            recognition.onerror = function(event) {
                console.error('Speech recognition error', event.error);
                stopRecording();
            };

            recognition.onend = function() {
                if (isRecording) {
                    // If we're still supposed to be recording, restart
                    recognition.start();
                } else if (transcript) {
                    // If we have a transcript, translate it
                    translateText();
                }
            };
        } else {
            alert('Speech recognition is not supported in your browser.');
        }
    }

    // Toggle recording
    function toggleRecording() {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    // Start recording
    function startRecording() {
        if (!recognition) {
            initSpeechRecognition();
        }

        // Clear previous transcript
        transcript = '';
        translatedText = '';

        // Update UI
        if (currentSpeaker === 'provider') {
            providerBox.textContent = '';
            providerBox.classList.add('active-speaker');
            patientBox.classList.remove('active-speaker');
            providerRecordBtn.innerHTML = `
                <svg class="icon mic-icon" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                Stop Recording
            `;
            providerRecordBtn.classList.add('recording');
            patientPlayBtn.classList.add('hidden');
        } else {
            patientBox.textContent = '';
            patientBox.classList.add('active-speaker');
            providerBox.classList.remove('active-speaker');
            patientRecordBtn.innerHTML = `
                <svg class="icon mic-icon" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                Stop Recording
            `;
            patientRecordBtn.classList.add('recording');
            providerPlayBtn.classList.add('hidden');
        }

        // Set language
        recognition.lang = currentSpeaker === 'provider' ? providerLanguage.value : patientLanguage.value;

        // Start recording
        recognition.start();
        isRecording = true;
    }

    // Stop recording
    function stopRecording() {
        if (recognition) {
            recognition.stop();
        }

        // Update UI
        if (currentSpeaker === 'provider') {
            providerRecordBtn.innerHTML = `
                <svg class="icon mic-icon" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                Start Recording
            `;
            providerRecordBtn.classList.remove('recording');
        } else {
            patientRecordBtn.innerHTML = `
                <svg class="icon mic-icon" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                Start Recording
            `;
            patientRecordBtn.classList.remove('recording');
        }

        isRecording = false;
    }

    // Translate text
    function translateText() {
        if (!transcript) return;

        const sourceLang = currentSpeaker === 'provider' ? providerLanguage.value : patientLanguage.value;
        const targetLang = currentSpeaker === 'provider' ? patientLanguage.value : providerLanguage.value;

        // Show loading indicator
        const targetBox = currentSpeaker === 'provider' ? patientBox : providerBox;
        targetBox.textContent = 'Translating...';

        fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: transcript,
                source_lang: sourceLang,
                target_lang: targetLang
            })
        })
        .then(response => response.json())
        .then(data => {
            translatedText = data.translated_text;

            // Update the appropriate box
            if (currentSpeaker === 'provider') {
                patientBox.textContent = translatedText;
                patientPlayBtn.classList.remove('hidden');
            } else {
                providerBox.textContent = translatedText;
                providerPlayBtn.classList.remove('hidden');
            }

            // Add to conversation history
            addToHistory(transcript, translatedText, currentSpeaker);

            // Generate speech
            generateSpeech(translatedText, targetLang);
        })
        .catch(error => {
            console.error('Translation error:', error);
            targetBox.textContent = 'Translation error. Please try again.';
        });
    }

    // Generate speech
    function generateSpeech(text, lang) {
        fetch('/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                lang: lang
            })
        })
        .then(response => response.json())
        .then(data => {
            // Set the audio source
            audioPlayer.src = data.audio_url;
        })
        .catch(error => {
            console.error('Text-to-speech error:', error);
        });
    }

    // Play audio
    function playAudio() {
        if (audioPlayer.src) {
            audioPlayer.play();
        }
    }

    // Add to conversation history
    function addToHistory(original, translated, speaker) {
        const entry = document.createElement('div');
        entry.className = 'history-entry';

        const speakerName = document.createElement('div');
        speakerName.className = 'history-speaker';
        speakerName.textContent = speaker === 'provider' ? 'Healthcare Provider:' : 'Patient:';

        const originalText = document.createElement('div');
        originalText.className = 'history-original';
        originalText.textContent = original;

        const translatedText = document.createElement('div');
        translatedText.className = 'history-translated';
        translatedText.textContent = translated;

        entry.appendChild(speakerName);
        entry.appendChild(originalText);
        entry.appendChild(translatedText);

        conversationHistory.appendChild(entry);

        // Scroll to bottom of history
        conversationHistory.scrollTop = conversationHistory.scrollHeight;
    }

    // Switch speaker
    function switchSpeaker() {
        currentSpeaker = currentSpeaker === 'provider' ? 'patient' : 'provider';

        // Update UI
        if (currentSpeaker === 'provider') {
            providerBox.classList.add('active-speaker');
            patientBox.classList.remove('active-speaker');
        } else {
            patientBox.classList.add('active-speaker');
            providerBox.classList.remove('active-speaker');
        }

        // Clear boxes
        providerBox.textContent = '';
        patientBox.textContent = '';

        // Hide play buttons
        providerPlayBtn.classList.add('hidden');
        patientPlayBtn.classList.add('hidden');

        // Reset transcript
        transcript = '';
        translatedText = '';
    }

    // Event listeners
    providerRecordBtn.addEventListener('click', function() {
        currentSpeaker = 'provider';
        toggleRecording();
    });

    patientRecordBtn.addEventListener('click', function() {
        currentSpeaker = 'patient';
        toggleRecording();
    });

    providerPlayBtn.addEventListener('click', playAudio);
    patientPlayBtn.addEventListener('click', playAudio);

    switchSpeakerBtn.addEventListener('click', switchSpeaker);

    // Initialize
    initSpeechRecognition();
});