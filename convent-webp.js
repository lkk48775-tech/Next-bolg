async function main() {
  const sharp = (await import("sharp")).default;
  const path = await import("node:path");
  const fs = await import("node:fs");

  const input = path.join(
    process.cwd(),
    "public",
    "images",
    "ai-sidebar-robot-64.png",
  );
  const output = input.replace(/\.(jpg|jpeg|png)$/i, ".webp");

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  await sharp(input).resize({width:128,height:128}).webp({ quality: 80 }).toFile(output);

  const oldSize = fs.statSync(input).size;
  const newSize = fs.statSync(output).size;

  console.log("转换成功：", output);
  console.log("原来大小：", formatSize(oldSize));
  console.log("现在大小：", formatSize(newSize));
}

main().catch((err) => {
  console.error("转换失败：", err);
  process.exitCode = 1;
});
