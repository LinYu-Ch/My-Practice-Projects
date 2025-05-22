class DisplayManager {
  constructor(display) {
    this.root = display;

    this.audioPlayer = document.createElement("audio");
    this.imageDisplay = document.createElement("img");
    this.videoPlayer = document.createElement("video");

    this.audioPlayer.autoplay = true;
    this.videoPlayer.autoplay = true;

    this.root.appendChild(this.audioPlayer);
    this.root.appendChild(this.imageDisplay);
    this.root.appendChild(this.videoPlayer);
  }

  #fadeInGachaEvent(fadeDuration = 500) {
    this.imageDisplay.style.opacity = 0;
    this.imageDisplay.style.transition = `opacity ${fadeDuration}ms ease`;
    setTimeout(() => {
      this.imageDisplay.style.opacity = 1;
    }, 0);
  }

  #fadeOutGachaEvent(totalDuration, fadeDuration = 500) {
    this.imageDisplay.style.transition = `opacity ${fadeDuration}ms ease`;
    setTimeout(() => {
      this.imageDisplay.style.opacity = 0;
    }, totalDuration - fadeDuration);
  }

  #cleanGachaEvent() {
    this.audioPlayer.pause();
    this.videoPlayer.pause();
    this.audioPlayer.currentTime = 0;
    this.videoPlayer.currentTime = 0;
    this.audioPlayer.src = "";
    this.videoPlayer.src = "";
    this.imageDisplay.src = "";
  }

  #getMediaType(media) {
    const fileExtensionTypes = {
      apng: "image",
      avif: "image",
      gif: "image",
      jpg: "image",
      jpeg: "image",
      jfif: "image",
      pjpeg: "image",
      pjp: "image",
      png: "image",
      svg: "image",
      webp: "image",
      mp4: "video",
      webm: "video",
      ogv: "video",
      mov: "video",
      mp3: "audio",
      wav: "audio",
      ogg: "audio",
      oga: "audio",
      opus: "audio",
      weba: "audio",
      flac: "audio",
      aac: "audio",
      m4a: "audio",
      mp4: "audio",
    };

    const regex = /[^.]+$/i;
    const extension = media.match(regex);
    const type = extension[0];

    return fileExtensionTypes[type];
  }

  /**
   *
   * @param {URL} media
   * @param {number} duration
   * @param {URL} audio - optional
   *
   * @returns promise, resolves true on successful media end or rejects immediately if inputs are formatted incorrectly
   */
  displayGachaEvent(media, duration = null, audio = null) {
    return new Promise((resolve, reject) => {
      const mediaType = this.#getMediaType(media);

      if (mediaType === "video") {
        // media play controls
        this.videoPlayer.src = media;
        this.videoPlayer.currentTime = 0; // its this value is cleaned up at the end, but you never know
        this.videoPlayer.play();

        // error reporting
        this.videoPlayer.onerror = () => {
          return reject(
            new Error(
              `${this.videoPlayer.error.code} details: ${this.videoPlayer.error.message}`
            )
          );
        };

        // media end cleanup
        this.videoPlayer.addEventListener(
          "ended",
          () => {
            this.#cleanGachaEvent();
            resolve(true);
          },
          { once: true }
        );

        return;
      }

      if (mediaType === "image") {
        // input validation
        if (duration <= 0 || isNaN(duration)) {
          return reject(
            new Error(
              "[DISPLAY MANAGER] displayGachaEvent input duration is not valid"
            )
          );
        }

        if (audio != null) {
          this.audioPlayer.src = audio;
          this.audioPlayer.currentTime = 0;
          this.audioPlayer.play();
        }

        this.imageDisplay.src = media;

        // media cleanup setup
        this.#fadeInGachaEvent(1000);
        this.#fadeOutGachaEvent(duration, 1000);
        setTimeout(() => {
          this.#cleanGachaEvent();
          resolve(true);
        }, duration);

        return;
      }

      // default behavior
      return reject(
        new Error("[DISPLAY MANAGER] displayGachaEvent invalid media input")
      );
    });
  }
}
