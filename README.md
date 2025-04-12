# inSets <small>dev-2025-04</small>
Unleash your creativity with inSets! Upload audio files, let the app blend them
using generative algorithms, and tweak effects like reverb, delay, or pitch to
craft dynamic compositions. With customizable probabilities, you control the
chaos, making every session a new sonic adventure. Perfect for musicians, sound
designers, or anyone exploring generative music.

**Important:** Ensure your browser supports the Web Audio API, as it’s essential for inSets’ audio processing features.

## Key Features
* **Randomized Audio Mixing:** Generate unexpected combinations of your audio
files for fresh inspiration.
* **Effect Customization:** Fine-tune parameters like reverb, delay, pitch, and more to sculpt your sound.
* **Generative Probabilities:** Adjust the likelihood of audio or effect combinations for evolving compositions.
* **Web-Based & Cross-Platform:** Runs in any modern browser on desktop or mobile—no installation needed.

## Installation
Get started with inSets in one of two easy ways:
**1. Copy the index.html file:**
 * Github:
    - in github, go to [index.html](https://github.com/AxelArielSaravia/insets/blob/main/index.html)
    - press the download button
 * With `wget`:
    ```sh
    wget https://raw.githubusercontent.com/AxelArielSaravia/insets/refs/heads/main/index.html -O index.html
    ```
 * With `curl`:
    ```sh
    curl -O -L https://raw.githubusercontent.com/AxelArielSaravia/insets/refs/heads/main/index.html
    ```
 * Open index.html in a Web Audio API-compatible browser

**2. Download as PWA: (NOT YET)**
 * Visit [hostname]() in a compatible browser.
 * Click the browser’s "Add to Home Screen" or "Install" prompt (usually found in the menu or address bar).
 * Launch inSets from your device’s home screen for offline access and a seamless app experience.


## How To Build:
To build inSets from source:

The `src/index.html` file is a Go template/html that needs to be parsed.

 * **Dependencies:**
    - [Go compiler >= 1.23](https://go.dev/)
    - [tdewolff/minify](https://github.com/tdewolff/minify)

 * **Steps:**
    **1. Clone the Repository:**
    ```sh
    git clone https://github.com/AxelArielSaravia/insets.git
    cd insets
    ```
    **2. Build `index.html` (Production):**
    ```sh
    go run tools/builder/build.go prod minify
    ```
    Generates a minified index.html for deployment.
    **3. Build `public/` (Hosting Environment):**
    ```sh
    go run tools/builder/build.go hosting
    ```
    Prepares all files for hosting.
    **4. Build `dev.html` (Debugging):**
    ```sh
    go run tools/builder/build.go dev
    ```
    Creates a developer-friendly file for testing.

 * **Test Locally:**
    - Open the generated `index.html` or `dev.html` in a Web Audio API-compatible browser.
    - Or use a local server (e.g., `go run tools/server/server.go 8000` or `go run tools/server/server.go public` for listen `public/` dir).

## ToDo:
* [x] Light Theme palette
* [x] Adds the change AudioEvent
* [x] Adds the audio visualization
* [x] Review killing zombies
* [x] Animation cancel
* [x] Use the localstorage to save the configuration
* [x] Implement "import"/"export" functionalities
* [x] Implement the FadeIn and Fadeout on the Play and Pause actions
* [x] Thinking about audios less than 1 second
* [x] Thinking about the relation of Playback Rate and the fadeout aplication
* [x] Favicons
* [x] ogg
* [ ] Implement a notification sistem
* [x] Add a minify to the Prodcution Builder

## License
This project is licensed under the MIT License (LICENSE)—free to use, modify, and share.
