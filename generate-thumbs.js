import sharp from "sharp";
import fs from "fs";
import path from "path";

const folders = [
  {
    input: "./public/assets/Artistas",
    output: "./public/assets/Artistas/thumbs",
    size: 320
  },
  {
    input: "./public/assets/Cover",
    output: "./public/assets/Cover/thumbs",
    size: 300
  }
];

async function generate() {

  for (const folder of folders) {

    if (!fs.existsSync(folder.output)) {
      fs.mkdirSync(folder.output, { recursive: true });
    }

    const files = fs.readdirSync(folder.input);

    for (const file of files) {

      if (!file.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

      const inputPath = path.join(folder.input, file);
      const outputPath = path.join(
        folder.output,
        file.replace(/\.(jpg|jpeg|png)$/i, ".webp")
      );

      try {

        await sharp(inputPath)
          .resize(folder.size)
          .webp({ quality: 80 })
          .toFile(outputPath);

        console.log("✔ thumb creada:", outputPath);

      } catch (err) {
        console.log("Error:", file, err.message);
      }
    }
  }
}

generate();