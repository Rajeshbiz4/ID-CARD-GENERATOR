function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read selected image."));
    };

    image.src = url;
  });
}

function canvasToFile(canvas, filename) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to process image."));
          return;
        }

        resolve(
          new File([blob], filename, {
            type: "image/png",
          })
        );
      },
      "image/png",
      0.95
    );
  });
}

function contain(image, ctx, width, height, padding = 0) {
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;

  const scale = Math.min(
    availableWidth / image.naturalWidth,
    availableHeight / image.naturalHeight
  );

  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;

  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function cover(image, ctx, width, height) {
  const scale = Math.max(
    width / image.naturalWidth,
    height / image.naturalHeight
  );

  const sourceWidth = width / scale;
  const sourceHeight = height / scale;

  const sx = Math.max(0, (image.naturalWidth - sourceWidth) / 2);
  const sy = Math.max(0, (image.naturalHeight - sourceHeight) / 2);

  ctx.drawImage(
    image,
    sx,
    sy,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height
  );
}

/**
 * Standard upload presets:
 *
 * logo:
 *   600x600 transparent PNG
 *   entire logo is preserved with safe padding
 *
 * student:
 *   600x750 portrait PNG
 *   center-cropped to a standard ID-photo ratio
 *
 * signature:
 *   1000x300 transparent PNG
 *   entire signature is preserved
 *
 * templateBackgroundPortrait:
 *   1320x2080 PNG
 *
 * templateBackgroundLandscape:
 *   2080x1320 PNG
 */
export async function normalizeImage(file, preset = "student") {
  if (!file) {
    throw new Error("Image file is required.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const image = await loadImage(file);

  const presets = {
    logo: {
      width: 600,
      height: 600,
      mode: "contain",
      padding: 50,
      transparent: true,
      name: "school-logo.png",
    },
    student: {
      width: 600,
      height: 750,
      mode: "cover",
      padding: 0,
      transparent: false,
      name: "student-photo.png",
    },
    signature: {
      width: 1000,
      height: 300,
      mode: "contain",
      padding: 30,
      transparent: true,
      name: "principal-signature.png",
    },
    templateBackgroundPortrait: {
      width: 1320,
      height: 2080,
      mode: "cover",
      padding: 0,
      transparent: false,
      name: "template-background-portrait.png",
    },
    templateBackgroundLandscape: {
      width: 2080,
      height: 1320,
      mode: "cover",
      padding: 0,
      transparent: false,
      name: "template-background-landscape.png",
    },
  };

  const config = presets[preset] || presets.student;

  const canvas = document.createElement("canvas");
  canvas.width = config.width;
  canvas.height = config.height;

  const ctx = canvas.getContext("2d");

  if (!config.transparent) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, config.width, config.height);
  } else {
    ctx.clearRect(0, 0, config.width, config.height);
  }

  if (config.mode === "cover") {
    cover(image, ctx, config.width, config.height);
  } else {
    contain(
      image,
      ctx,
      config.width,
      config.height,
      config.padding
    );
  }

  return canvasToFile(canvas, config.name);
}
