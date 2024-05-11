function embedMessage() {
  const imageInput = document.getElementById("imageInput");
  const messageInput = document.getElementById("messageInput");
  const resultContainer = document.getElementById("resultContainer");

  if (!imageInput.files[0]) {
    alert("Please select an image.");
    return;
  }

  if (!messageInput.value.trim()) {
    alert("Please enter a message to embed.");
    return;
  }

  const maxWidth = resultContainer.offsetWidth; // Lebar maksimal sesuai dengan lebar container

  const reader = new FileReader();
  reader.onload = function (event) {
    const image = new Image();
    image.onload = function () {
      const scaleFactor = maxWidth / image.width; // Perbandingan skala antara lebar gambar asli dan lebar maksimal
      const newWidth = image.width * scaleFactor;
      const newHeight = image.height * scaleFactor;

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, newWidth, newHeight);

      const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
      const pixels = imageData.data;

      // Embed message into pixels (distortion method)
      const message = messageInput.value;
      const messageLength = message.length;

      let embeddedBits = "";
      for (let i = 0; i < messageLength; i++) {
        const charCode = message.charCodeAt(i);
        const binaryCharCode = charCode.toString(2).padStart(8, "0");
        embeddedBits += binaryCharCode;
      }

      let bitIndex = 0;
      for (let i = 0; i < pixels.length && bitIndex < embeddedBits.length; i += 4) {
        const red = pixels[i];
        const green = pixels[i + 1];
        const blue = pixels[i + 2];

        if (embeddedBits[bitIndex] === "1") {
          // Set pixel color to white for embedding bit '1'
          pixels[i] = pixels[i + 1] = pixels[i + 2] = 255;
        }

        bitIndex++;
      }

      ctx.putImageData(imageData, 0, 0);

      const embeddedImage = canvas.toDataURL();

      // Display embedded image
      resultContainer.innerHTML = `<img src="${embeddedImage}" alt="Embedded Image" style="max-width: 100%;">`; // Gaya CSS untuk memastikan gambar tidak melebihi lebar container
    };
    image.src = event.target.result;
  };
  reader.readAsDataURL(imageInput.files[0]);
}

function decodeImage() {
  const imageInput = document.getElementById("imageInput");
  const resultContainer = document.getElementById("resultContainer");

  if (!imageInput.files[0]) {
    alert("Please select an image.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const image = new Image();
    image.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      let extractedBits = "";
      for (let i = 0; i < pixels.length; i += 4) {
        const red = pixels[i];
        const green = pixels[i + 1];
        const blue = pixels[i + 2];

        if (red === 255 && green === 255 && blue === 255) {
          extractedBits += "1";
        } else {
          extractedBits += "0";
        }
      }

      let extractedMessage = "";
      for (let i = 0; i < extractedBits.length; i += 8) {
        const byte = extractedBits.substr(i, 8);
        const charCode = parseInt(byte, 2);
        extractedMessage += String.fromCharCode(charCode);
      }

      // Display extracted message
      resultContainer.innerHTML = `Extracted Message: ${extractedMessage}`;
    };
    image.src = event.target.result;
  };
  reader.readAsDataURL(imageInput.files[0]);
}
