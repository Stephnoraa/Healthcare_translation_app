from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
from deep_translator import GoogleTranslator
from gtts import gTTS
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Dictionary of supported languages with their codes
LANGUAGES = {
    "en": "English",
    "es": "Spanish",
    "zh-CN": "Chinese",
    "ar": "Arabic",
    "fr": "French",
    "ru": "Russian",
    "hi": "Hindi",
    "vi": "Vietnamese",
    "ko": "Korean",
    "de": "German"
}


@app.route('/')
def index():
    return render_template('index.html', languages=LANGUAGES)


@app.route('/translate', methods=['POST'])
def translate():
    data = request.json
    text = data.get('text')
    source_lang = data.get('source_lang')
    target_lang = data.get('target_lang')

    if not all([text, source_lang, target_lang]):
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        # Use deep_translator to translate the text
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translated_text = translator.translate(text)

        return jsonify({
            "original_text": text,
            "translated_text": translated_text,
            "source_lang": source_lang,
            "target_lang": target_lang
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/text-to-speech', methods=['POST'])
def text_to_speech():
    data = request.json
    text = data.get('text')
    lang = data.get('lang')

    if not all([text, lang]):
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        # Generate a unique filename
        filename = f"speech_{uuid.uuid4()}.mp3"
        filepath = os.path.join('static', 'audio', filename)

        # Ensure directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        # Generate speech
        tts = gTTS(text=text, lang=lang)
        tts.save(filepath)

        return jsonify({
            "audio_url": f"/static/audio/{filename}"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('static/audio', exist_ok=True)
    app.run(debug=True)

print("Medical Translation API is running!")