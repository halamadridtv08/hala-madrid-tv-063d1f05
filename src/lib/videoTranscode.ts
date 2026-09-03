// Conversion locale (navigateur) d'une vidéo incompatible vers MP4 H.264/AAC via ffmpeg.wasm.
// Chargement paresseux : rien n'est téléchargé tant que l'utilisateur ne lance pas la conversion.

type Progress = (ratio: number) => void;

let ffmpegPromise: Promise<any> | null = null;

async function getFFmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const [{ FFmpeg }, { toBlobURL }, coreUrl, wasmUrl] = await Promise.all([
        import('@ffmpeg/ffmpeg'),
        import('@ffmpeg/util'),
        import('@ffmpeg/core?url').then((m) => m.default as string),
        import('@ffmpeg/core/wasm?url').then((m) => m.default as string),
      ]);
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: await toBlobURL(new URL(coreUrl, window.location.href).href, 'text/javascript'),
        wasmURL: await toBlobURL(new URL(wasmUrl, window.location.href).href, 'application/wasm'),
      });
      return ffmpeg;
    })().catch((error) => {
      ffmpegPromise = null;
      throw error;
    });
  }
  return ffmpegPromise;
}

export async function transcodeToMp4(file: File, onProgress?: Progress): Promise<File> {
  const { fetchFile } = await import('@ffmpeg/util');
  const ffmpeg = await getFFmpeg();

  const handler = ({ progress }: { progress: number }) => {
    if (onProgress) onProgress(Math.max(0, Math.min(1, progress)));
  };
  ffmpeg.on('progress', handler);

  const inputName = `input-${Date.now()}`;
  const outputName = `output-${Date.now()}.mp4`;

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    await ffmpeg.exec([
      '-i', inputName,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '26',
      '-profile:v', 'main',
      '-pix_fmt', 'yuv420p',
      '-vf', "scale='min(1080,iw)':-2",
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      outputName,
    ]);
    const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
    if (!data || data.length === 0) throw new Error('La conversion a produit un fichier vide.');
    const cleanName = file.name.replace(/\.[^.]+$/, '') || 'story';
    const buffer = new ArrayBuffer(data.byteLength);
    new Uint8Array(buffer).set(data);
    return new File([buffer], `${cleanName}.mp4`, { type: 'video/mp4' });
  } finally {
    ffmpeg.off?.('progress', handler);
    try { await ffmpeg.deleteFile(inputName); } catch { /* ignore */ }
    try { await ffmpeg.deleteFile(outputName); } catch { /* ignore */ }
  }
}
