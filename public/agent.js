import * as webRTCHandler from "./RTCHandlerAgent.js";
import * as socketCon from "./wssAgent.js";
import * as store from "./store.js"
import * as ui from "./uiInteract.js"
webRTCHandler.getLocalPreview();

const getBrowserName = (userAgent) => {
  if (userAgent.includes("firefox")) {
      return "Mozilla Firefox";
  } else if (userAgent.includes("SamsungBrowser")) {
      return "Samsung Internet";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
      return "Opera";
  } else if (userAgent.includes("Trident")) {
      return "Microsoft Internet Explorer";
  } else if (userAgent.includes("Edge") || userAgent.includes("Edg")) {
      return "Microsoft Edge";
  } else if (userAgent.includes("Chrome")) {
      return "Google Chrome";
  } else if (userAgent.includes("Safari")) {
      return "Safari";
  } else {
      return "Unknown browser";
  }
};

// Example user-agent string from an incoming HTTP request
const req = {
  headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
  }
};

const browserName = getBrowserName(req.headers['user-agent']);

console.log('Browser Name:', browserName);



const screenshotButton = document.getElementById("screenshot_button_image");
screenshotButton.addEventListener('click', () => {
  const video = document.getElementById('local_video');
    const canvas = document.getElementById('screenshotCanvas');
    const img = document.getElementById('screenshot_button_image');
    const downloadButton = document.getElementById('downloadButton');
// Set the canvas size to the video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    console.log("Set the canvas size to the video size");
     // Draw the current video frame onto the canvas
     const context = canvas.getContext('2d');
     context.drawImage(video, 0, 0, canvas.width, canvas.height);
     console.log("Draw the current video frame onto the canvas");
    // Convert the canvas image to a data URL and set it as the src of the img tag
    const dataURL = canvas.toDataURL('image/png');
    console.log("screenshotDone");
    console.log(dataURL);
   // img.src = dataURL;
   
      
  // to save the captured screenshot in  pictures folder

  savingscreenshot();
  async function savingscreenshot() {
    try {
      console.log("savingscreenshot1");
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        console.log("savingscreenshot2");
        // Request the user to choose a directory to save the image
        const fileHandle = await window.showSaveFilePicker({
           startIn: 'pictures',
           // suggestedName: `customNodeApplicationScreenshot-${Date.now()}.png`,
           suggestedName: `customNodeScreenshot-${getFormattedTimestamp()}.png`,
            types: [{
                description: 'PNG Image',
                accept: { 'image/png': ['.png'] },
            }],
        });    
        console.log("savingscreenshot3");
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(blob);
        await writableStream.close();
  
        console.log('Screenshot saved successfully!');
    } catch (error) {
        console.error('Error saving the file:', error);
    }
  }

});

function getFormattedTimestamp() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}






const micButton = document.getElementById("mic_button");
micButton.addEventListener("click", () => {
  const localStream = store.getState().localStream;
  const micEnabled = localStream.getAudioTracks()[0].enabled;
  localStream.getAudioTracks()[0].enabled = !micEnabled;
  if (localStream.getAudioTracks()[0].enabled) {
    store.setMute(true);
  } else {
    store.setMute(false);
  }
  ui.updateMicButton(micEnabled);
});

let URLParams = new URLSearchParams(window.location.search);

const cameraButton = document.getElementById("camera_button");
cameraButton.addEventListener("click", () => {
  const localStream = store.getState().localStream;
  const cameraEnabled = localStream.getVideoTracks()[0].enabled;
  localStream.getVideoTracks()[0].enabled = !cameraEnabled;
  ui.updateCameraButton(cameraEnabled);
});


// const startRecordingButton = document.getElementById("start_recording_button");
// startRecordingButton.addEventListener("click", () => {
//   recordingUtils.startRecording();
//   ui.showRecordingPanel();
// });

// const stopRecordingButton = document.getElementById("stop_recording_button");
// stopRecordingButton.addEventListener("click", () => {
//   recordingUtils.stopRecording();
//   ui.resetRecordingButtons();
// });

// const pauseRecordingButton = document.getElementById("pause_recording_button");
// pauseRecordingButton.addEventListener("click", () => {
//   recordingUtils.pauseRecording();
//   ui.switchRecordingButtons(true);
// });

// const resumeRecordingButton = document.getElementById(
//   "resume_recording_button"
// );
// resumeRecordingButton.addEventListener("click", () => {
//   recordingUtils.resumeRecording();
//   ui.switchRecordingButtons();
// });

// hang up

const hangUpButton = document.getElementById("hang_up_button");
hangUpButton.addEventListener("click", () => {
  webRTCHandler.handleHangUp();
});

const changeCamer = document.querySelector(".dropdown-item");
changeCamer.addEventListener("click", () => {
  console.log(store.getVideoDevices());
});

if (URLParams.get("channel")) {
  store.setDevice(URLParams.get("channel"));
}


let dropDown = document.querySelector(".dropdown");
let dropDownMenu = document.querySelector(".dropdown-menu");
let dropdownItem = document.querySelector(".dropdown-item");
let divider = document.querySelector(".dropdown-divider");

let previousSelectedVideo = "", previousSelectedAudio = "";

dropDown.addEventListener("click", () => {
  dropDownMenu.innerHTML = "";
  let selectD = store.getSelectedDevices()
  store.getVideoDevices().forEach((item) => {
    let cloneItem = dropdownItem.cloneNode(true);
    cloneItem.dataset.deviceid = item.deviceId;
    cloneItem.textContent = item.label;
    cloneItem.title = item.label;
    cloneItem.onclick = selectDeviceVideo;
    if (selectD && selectD.video && selectD.video.dataset.deviceid === item.deviceId) {
      cloneItem.style.color = "#1e2125";
      cloneItem.style.backgroundColor = "#e9ecef";
      previousSelectedVideo = cloneItem;
    }
    dropDownMenu.appendChild(cloneItem);
  });

  dropDownMenu.appendChild(divider);

  store.getAudioDevices().forEach((item) => {
    let cloneItem = dropdownItem.cloneNode(true);
    cloneItem.dataset.deviceid = item.deviceId;
    cloneItem.textContent = item.label;
    cloneItem.title = item.label;
    cloneItem.onclick = selectDeviceAudio;
    if (selectD && selectD.audio && selectD.audio.dataset.deviceid === item.deviceId) {
      cloneItem.style.color = "#1e2125";
      cloneItem.style.backgroundColor = "#e9ecef";
      previousSelectedAudio = cloneItem;
    }
    dropDownMenu.appendChild(cloneItem);
  });
})

function selectDeviceVideo(event) {
  event.target.style.color = "#1e2125";
  event.target.style.backgroundColor = "#e9ecef";
  event.stopPropagation();
  if (previousSelectedVideo && previousSelectedVideo.dataset.deviceid !== event.target.dataset.deviceid) {
    previousSelectedVideo.style.removeProperty("color");
    previousSelectedVideo.style.removeProperty("background-color");
  }
  previousSelectedVideo = event.target;
  store.setSelectedDevice({ video: event.target });
  webRTCHandler.getLocalPreview({
    audio: {
      deviceId: store.getSelectedDevices().audio.dataset.deviceid
    },
    video: {
      deviceId: event.target.dataset.deviceid
    }
  }, true);
}

function selectDeviceAudio(event) {
  event.target.style.color = "#1e2125";
  event.target.style.backgroundColor = "#e9ecef";
  event.stopPropagation();
  if (previousSelectedAudio && previousSelectedAudio.dataset.deviceid !== event.target.dataset.deviceid) {
    previousSelectedAudio.style.removeProperty("color");
    previousSelectedAudio.style.removeProperty("background-color");
  }
  previousSelectedAudio = event.target;
  store.setSelectedDevice({ audio: event.target });
  webRTCHandler.getLocalPreview({
    audio: {
      deviceId: event.target.dataset.deviceid
    },
    video: {
      deviceId: store.getSelectedDevices().video.dataset.deviceid
    }
  }, true);
}

const status = document.querySelector("#status");
status.textContent = "Not Connected";

let socket = null;
document.querySelector("#status").textContent = "VC Disconnected";
const connect_vc = document.querySelector("#connect_vc")
connect_vc.addEventListener("click", () => {

  if (connect_vc.dataset.status === "disconnected") {
    connect_vc.classList.remove("btn-secondary");
    connect_vc.classList.add("btn-success");
    connect_vc.textContent = "Disconnect VC";
    connect_vc.dataset.status = "connected";
    document.querySelector("#status").textContent = "VC Connected";
    socket = io.connect("/" , {
      query: {
        manual: true
      }});
    socketCon.registerSocketEvents(socket);
    session.start();
  } else {
    connect_vc.classList.add("btn-secondary");
    connect_vc.classList.remove("btn-success");
    connect_vc.textContent = "Connect VC";
    connect_vc.dataset.status = "disconnected";
    document.querySelector("#status").textContent = "VC Disconnected";
    socket.close();
    session.dispose();
  }
});


// timeout 
export let session = new IdleSessionTimeout(30 * 60 * 1000);
// let session = new IdleSessionTimeout(500);

session.onTimeOut = () => {

  connect_vc.click();
  // here you can call your server to log out the user
  let ringtone = new Audio("./audio/user_disconnect.mp3");
  Swal.fire({
    title: "Session Expired, Please Login Again",
    showDenyButton: false,
    showCancelButton: false,
    confirmButtonText: "Refresh",
    denyButtonText: `Cancel`,
    allowOutsideClick: false,
    didOpen: () => {
      ringtone.play();
    }
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/agent";
    }
    ringtone.pause();
  });

};
