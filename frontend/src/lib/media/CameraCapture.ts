/**
 * Camera capture for AI image product search.
 *
 * `CameraCapture` owns the getUserMedia stream and can grab a still frame as a
 * compressed JPEG data URL, ready for the vision model. File uploads go
 * through the same `ImageEncoder`, so both paths produce identical payloads.
 */

export class ImageEncoder {
  constructor(
    private readonly maxSide = 1024,
    private readonly quality = 0.82,
  ) {}

  /** Downscales and re-encodes to a JPEG data URL (keeps requests small). */
  async fromSource(source: CanvasImageSource, width: number, height: number): Promise<string> {
    const scale = Math.min(1, this.maxSide / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available");
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", this.quality);
  }

  async fromFile(file: File): Promise<string> {
    const bitmap = await createImageBitmap(file);
    try {
      return await this.fromSource(bitmap, bitmap.width, bitmap.height);
    } finally {
      bitmap.close();
    }
  }
}

export class CameraCapture {
  private stream: MediaStream | null = null;

  constructor(private readonly encoder = new ImageEncoder()) {}

  static get supported() {
    return typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
  }

  async start(video: HTMLVideoElement) {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
      audio: false,
    });
    video.srcObject = this.stream;
    await video.play();
  }

  async capture(video: HTMLVideoElement): Promise<string> {
    return this.encoder.fromSource(video, video.videoWidth || 640, video.videoHeight || 480);
  }

  stop() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}
