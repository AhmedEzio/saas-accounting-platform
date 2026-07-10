export const downloadFile = async (e, fileUrl, fileName, fileType) => {
  e.preventDefault();
  try {
    let finalFileName = fileName;
    let ext = "";
    if (fileType) {
      if (fileType.toLowerCase().includes("pdf")) ext = "pdf";
      else if (fileType.toLowerCase().includes("png")) ext = "png";
      else if (fileType.toLowerCase().includes("jpg") || fileType.toLowerCase().includes("jpeg")) ext = "jpg";
    }
    if (!ext) {
      const urlExtMatch = fileUrl.match(/\.(pdf|jpg|jpeg|png)(?:[?#]|$)/i);
      if (urlExtMatch) ext = urlExtMatch[1].toLowerCase();
    }
    if (ext && !finalFileName.toLowerCase().endsWith(`.${ext}`)) {
      finalFileName = `${finalFileName}.${ext}`;
    }

    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    window.open(fileUrl, "_blank");
  }
};
