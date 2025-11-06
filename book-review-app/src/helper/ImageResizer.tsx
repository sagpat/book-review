import Resizer from "react-image-file-resizer";
 
 // Resize and set image
 const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    let resizedFile;
    if (file) {
      try {
        Resizer.imageFileResizer(
          file,
          400,
          400,
          "JPEG",
          100,
          0,
          (uri) => {
            // Convert resized image back to file
            resizedFile = new File([uri], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
          },
          "blob" // output type as blob
        );
      } catch (err) {
        console.error("Error resizing image", err);
      }
    }
    return resizedFile
  };

  export default handleImageUpload;