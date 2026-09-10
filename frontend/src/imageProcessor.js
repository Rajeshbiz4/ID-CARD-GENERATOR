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
      reject(
        new Error(
          "Unable to read selected image."
        )
      );
    };

    image.src = url;
  });
}

function canvasToFile(
  canvas,
  filename
) {
  return new Promise(
    (resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Unable to process image."
              )
            );
            return;
          }

          resolve(
            new File(
              [blob],
              filename,
              {
                type:
                  "image/png",
              }
            )
          );
        },
        "image/png",
        0.95
      );
    }
  );
}

function contain(
  image,
  ctx,
  width,
  height,
  padding = 0,
  source = null
) {
  const src =
    source || {
      x: 0,
      y: 0,
      width:
        image.naturalWidth,
      height:
        image.naturalHeight,
    };

  const availableWidth =
    width -
    padding * 2;

  const availableHeight =
    height -
    padding * 2;

  const scale =
    Math.min(
      availableWidth /
        src.width,
      availableHeight /
        src.height
    );

  const drawWidth =
    src.width * scale;

  const drawHeight =
    src.height * scale;

  const x =
    (width - drawWidth) /
    2;

  const y =
    (height - drawHeight) /
    2;

  ctx.drawImage(
    image,
    src.x,
    src.y,
    src.width,
    src.height,
    x,
    y,
    drawWidth,
    drawHeight
  );
}

function cover(
  image,
  ctx,
  width,
  height
) {
  const scale =
    Math.max(
      width /
        image.naturalWidth,
      height /
        image.naturalHeight
    );

  const sourceWidth =
    width / scale;

  const sourceHeight =
    height / scale;

  const sx =
    Math.max(
      0,
      (
        image.naturalWidth -
        sourceWidth
      ) / 2
    );

  const sy =
    Math.max(
      0,
      (
        image.naturalHeight -
        sourceHeight
      ) / 2
    );

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

function estimateBackground(
  data,
  width,
  height
) {
  const samples = [];

  const points = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [
      width - 3,
      height - 3,
    ],
  ];

  for (
    const [x, y]
    of points
  ) {
    const i =
      (
        y * width +
        x
      ) * 4;

    samples.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
      a: data[i + 3],
    });
  }

  const avg = (key) =>
    samples.reduce(
      (sum, item) =>
        sum + item[key],
      0
    ) / samples.length;

  return {
    r: avg("r"),
    g: avg("g"),
    b: avg("b"),
    a: avg("a"),
  };
}

function findSignatureBounds(
  image
) {
  const maxScanSize =
    1600;

  const sourceWidth =
    image.naturalWidth;

  const sourceHeight =
    image.naturalHeight;

  const scale =
    Math.min(
      1,
      maxScanSize /
        Math.max(
          sourceWidth,
          sourceHeight
        )
    );

  const width =
    Math.max(
      1,
      Math.round(
        sourceWidth * scale
      )
    );

  const height =
    Math.max(
      1,
      Math.round(
        sourceHeight *
          scale
      )
    );

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = width;
  canvas.height = height;

  const ctx =
    canvas.getContext(
      "2d",
      {
        willReadFrequently:
          true,
      }
    );

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  ctx.drawImage(
    image,
    0,
    0,
    width,
    height
  );

  const imageData =
    ctx.getImageData(
      0,
      0,
      width,
      height
    );

  const data =
    imageData.data;

  const background =
    estimateBackground(
      data,
      width,
      height
    );

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (
    let y = 0;
    y < height;
    y += 1
  ) {
    for (
      let x = 0;
      x < width;
      x += 1
    ) {
      const i =
        (
          y * width +
          x
        ) * 4;

      const r = data[i];
      const g =
        data[i + 1];
      const b =
        data[i + 2];
      const a =
        data[i + 3];

      if (a < 20) {
        continue;
      }

      const difference =
        Math.abs(
          r -
            background.r
        ) +
        Math.abs(
          g -
            background.g
        ) +
        Math.abs(
          b -
            background.b
        );

      const brightness =
        (
          r +
          g +
          b
        ) / 3;

      const saturation =
        Math.max(
          r,
          g,
          b
        ) -
        Math.min(
          r,
          g,
          b
        );

      const isInk =
        difference > 55 ||
        brightness < 215 ||
        saturation > 35;

      if (!isInk) {
        continue;
      }

      minX =
        Math.min(
          minX,
          x
        );

      minY =
        Math.min(
          minY,
          y
        );

      maxX =
        Math.max(
          maxX,
          x
        );

      maxY =
        Math.max(
          maxY,
          y
        );
    }
  }

  if (
    maxX < minX ||
    maxY < minY
  ) {
    return null;
  }

  const inkWidth =
    maxX -
    minX +
    1;

  const inkHeight =
    maxY -
    minY +
    1;

  const padX =
    Math.max(
      4,
      Math.round(
        inkWidth *
          0.08
      )
    );

  const padY =
    Math.max(
      4,
      Math.round(
        inkHeight *
          0.18
      )
    );

  minX =
    Math.max(
      0,
      minX - padX
    );

  minY =
    Math.max(
      0,
      minY - padY
    );

  maxX =
    Math.min(
      width - 1,
      maxX + padX
    );

  maxY =
    Math.min(
      height - 1,
      maxY + padY
    );

  return {
    x:
      minX / scale,
    y:
      minY / scale,
    width:
      (
        maxX -
        minX +
        1
      ) / scale,
    height:
      (
        maxY -
        minY +
        1
      ) / scale,
    background,
  };
}

function removeBrightBackground(
  canvas
) {
  const ctx =
    canvas.getContext(
      "2d",
      {
        willReadFrequently:
          true,
      }
    );

  const imageData =
    ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

  const data =
    imageData.data;

  for (
    let i = 0;
    i < data.length;
    i += 4
  ) {
    const r = data[i];
    const g =
      data[i + 1];
    const b =
      data[i + 2];

    const brightness =
      (
        r +
        g +
        b
      ) / 3;

    const spread =
      Math.max(
        r,
        g,
        b
      ) -
      Math.min(
        r,
        g,
        b
      );

    // Remove white/near-white paper while preserving
    // colored or dark pen strokes.
    if (
      brightness > 244 &&
      spread < 18
    ) {
      data[i + 3] = 0;
    } else if (
      brightness > 232 &&
      spread < 16
    ) {
      data[i + 3] =
        Math.min(
          data[i + 3],
          90
        );
    }
  }

  ctx.putImageData(
    imageData,
    0,
    0
  );
}

async function normalizeSignature(
  image
) {
  const width = 1000;
  const height = 500;

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = width;
  canvas.height = height;

  const ctx =
    canvas.getContext(
      "2d"
    );

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  const bounds =
    findSignatureBounds(
      image
    );

  contain(
    image,
    ctx,
    width,
    height,
    8,
    bounds || null
  );

  removeBrightBackground(
    canvas
  );

  return canvasToFile(
    canvas,
    "principal-signature.png"
  );
}

export async function normalizeImage(
  file,
  preset = "student"
) {
  if (!file) {
    throw new Error(
      "Image file is required."
    );
  }

  if (
    !file.type.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      "Please choose an image file."
    );
  }

  const image =
    await loadImage(file);

  if (
    preset ===
    "signature"
  ) {
    return normalizeSignature(
      image
    );
  }

  const presets = {
    logo: {
      width: 600,
      height: 600,
      mode: "contain",
      padding: 50,
      transparent: true,
      name:
        "school-logo.png",
    },

    student: {
      width: 600,
      height: 750,
      mode: "cover",
      padding: 0,
      transparent: false,
      name:
        "student-photo.png",
    },

    templateBackgroundPortrait:
      {
        width: 1320,
        height: 2080,
        mode: "cover",
        padding: 0,
        transparent: false,
        name:
          "template-background-portrait.png",
      },

    templateBackgroundLandscape:
      {
        width: 2080,
        height: 1320,
        mode: "cover",
        padding: 0,
        transparent: false,
        name:
          "template-background-landscape.png",
      },
  };

  const config =
    presets[preset] ||
    presets.student;

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    config.width;

  canvas.height =
    config.height;

  const ctx =
    canvas.getContext(
      "2d"
    );

  if (
    !config.transparent
  ) {
    ctx.fillStyle =
      "#ffffff";

    ctx.fillRect(
      0,
      0,
      config.width,
      config.height
    );
  } else {
    ctx.clearRect(
      0,
      0,
      config.width,
      config.height
    );
  }

  if (
    config.mode ===
    "cover"
  ) {
    cover(
      image,
      ctx,
      config.width,
      config.height
    );
  } else {
    contain(
      image,
      ctx,
      config.width,
      config.height,
      config.padding
    );
  }

  return canvasToFile(
    canvas,
    config.name
  );
}

export async function normalizeSignatureBlob(
  blob
) {
  if (!blob) {
    return blob;
  }

  const file =
    new File(
      [blob],
      "stored-signature.png",
      {
        type:
          blob.type ||
          "image/png",
      }
    );

  return normalizeImage(
    file,
    "signature"
  );
}
