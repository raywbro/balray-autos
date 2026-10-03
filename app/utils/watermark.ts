// app/utils/watermark.ts

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadFileAsImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function watermarkImage(file: File): Promise<File> {
  try {
    const img = await loadFileAsImage(file);

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // 1. Draw original
    ctx.drawImage(img, 0, 0);

    // 2. Load logo
    let logo: HTMLImageElement | null = null;
    try {
      logo = await loadImage("/balray-autos-logo.png");
    } catch (e) {
      console.warn("Logo failed for watermark:", e);
    }

    const minSide = Math.min(canvas.width, canvas.height);
    const padding = Math.max(16, minSide * 0.025);

    const logoWidth = Math.max(100, minSide * 0.18);
    const logoHeight = logo
      ? (logo.height / logo.width) * logoWidth
      : logoWidth * 0.4;
    const x = canvas.width - logoWidth - padding;
    const y = canvas.height - logoHeight - padding;

    // 3. Draw semi-transparent logo bottom-right
    if (logo) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.drawImage(logo, x, y, logoWidth, logoHeight);
      ctx.restore();
    } else {
      ctx.save();
      ctx.font = `bold ${Math.max(20, minSide * 0.04)}px Arial, sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      ctx.lineWidth = 4;
      ctx.strokeText("BALRAY AUTOS", canvas.width - padding, canvas.height - padding);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText("BALRAY AUTOS", canvas.width - padding, canvas.height - padding);
      ctx.restore();
    }

    // 4. Gold URL text under the logo
    ctx.save();
    ctx.font = `bold ${Math.max(11, minSide * 0.018)}px Arial, sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    const urlX = canvas.width - padding;
    const urlY = canvas.height - padding * 0.3;
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 3;
    ctx.strokeText("balrayautos.co.za", urlX, urlY);
    ctx.fillStyle = "rgba(210, 182, 106, 0.92)";
    ctx.fillText("balrayautos.co.za", urlX, urlY);
    ctx.restore();

    // 5. Top-left BALRAY AUTOS stamp
    ctx.save();
    ctx.font = `bold ${Math.max(11, minSide * 0.016)}px Arial, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const tlX = padding;
    const tlY = padding;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 3;
    ctx.strokeText("BALRAY AUTOS", tlX, tlY);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("BALRAY AUTOS", tlX, tlY);
    ctx.restore();

    // 6. Convert to File
    return await new Promise<File>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], "watermarked.jpg", { type: "image/jpeg" }));
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        0.88
      );
    });
  } catch (err) {
    console.error("Watermark failed, uploading original:", err);
    return file;
  }
}