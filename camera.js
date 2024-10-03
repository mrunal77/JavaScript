let mediaRecorder;
const recordedChunks = [];
let currentStream = null;
let usingFrontCamera = true; // Track if we're using the front camera

// Function to get video input devices (cameras)
async function getVideoInputs() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === "videoinput");
}

// Function to switch camera
async function switchCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
  }

  const videoInputs = await getVideoInputs();

  // Switch between front and back camera
  usingFrontCamera = !usingFrontCamera;

  const constraints = {
    video: {
      facingMode: usingFrontCamera ? "user" : "environment", // 'user' is front, 'environment' is back
    },
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoElement = document.getElementById("videoElement");
    videoElement.srcObject = stream;
    currentStream = stream;
  } catch (err) {
    console.error("Error switching camera: ", err);
  }
}

// Get access to the camera
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then(function (stream) {
    var videoElement = document.getElementById("videoElement");
    videoElement.srcObject = stream;
    currentStream = stream;
  })
  .catch(function (err) {
    console.error("Error accessing the camera: ", err);
  });

// Capture button functionality
document.getElementById("captureButton").addEventListener("click", function () {
  var videoElement = document.getElementById("videoElement");
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");

  // Set canvas dimensions to match video element
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  // Draw current frame from video onto canvas
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  // Create a temporary link to download the image
  var link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "snapshot.png";
  link.click();
});

// Record button functionality
document.getElementById("recordButton").addEventListener("click", function () {
  var videoElement = document.getElementById("videoElement");

  if (!mediaRecorder) {
    mediaRecorder = new MediaRecorder(videoElement.srcObject);
    mediaRecorder.ondataavailable = function (event) {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
  }

  if (mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    mediaRecorder.onstop = function () {
      var blob = new Blob(recordedChunks, { type: "video/webm" });
      var url = URL.createObjectURL(blob);

      var link = document.createElement("a");
      link.href = url;
      link.download = "recorded-video.webm";
      link.click();

      recordedChunks.length = 0;
      mediaRecorder = null;
      document.getElementById("recordButton").innerHTML = "Record";
    };
  } else {
    recordedChunks.length = 0;
    mediaRecorder.start();
    document.getElementById("recordButton").innerHTML = "Stop";
  }
});

// Switch camera button functionality
document
  .getElementById("switchCameraButton")
  .addEventListener("click", switchCamera);
