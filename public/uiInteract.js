import * as constants from "./constants.js";
import * as store from "./store.js";

export const updateLocalVideo = (stream) => {
  const localVideo = document.getElementById("local_video");
  localVideo.srcObject = stream;

  localVideo.addEventListener("loadedmetadata", () => {
    localVideo.play();
  });
};

export const showVideoCallButtons = () => {
  // const personalCodeVideoButton = document.getElementById(
  //     "call_buttons"
  // );
  const videoButton = document.getElementById(
    "hang_up_button"
  );
  videoButton.disabled = true;
  // showElement(personalCodeVideoButton);
};

const showElement = (element) => {
  if (element.classList.contains("display_none")) {
    element.classList.remove("display_none");
  }
};

const connected_user = document.getElementById("connected_user");

export const updatePersonalCode = (personalCode) => {
  const personal = document.getElementById(
    "user_id"
  );
  if (personal != null) {
    personal.textContent = personalCode;
  }
  console.log(personalCode);
};

export const showCallingDialog = (rejectCallHandler) => {

  const dialog = document.getElementById("call_display");
  dialog.style.display = "flex";
  showElement(dialog);
};

export const removeAllDialogs = () => {
  const dialog = document.getElementById("call_display");
  dialog.style.display = "none";
};

export const showInfoDialog = (preOfferAnswer) => {
  let infoDialog = null;

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    callNFI("onReject");
    getFormattedTimestamp();
    console.log("On Reject callback timestamp" + getFormattedTimestamp());
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    getFormattedTimestamp();
    console.log("CallIdNotFound callback timestamp" + getFormattedTimestamp());
    close_camera();
    callNFI("CallIdNotFound");
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    getFormattedTimestamp();
    console.log("AgentBusy callback timestamp" + getFormattedTimestamp());
    close_camera();
    console.log("close function in agent busy is called");
    callNFI("AgentBusy");
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_NOT_ANSWERED) {
    getFormattedTimestamp();
    console.log("CallNotAnswered callback timestamp" + getFormattedTimestamp());
    close_camera();
    callNFI("CallNotAnswered");
  }
};

export const callNFI = (msg) => {

  console.log(msg);
  try {

    if (store.getDevice()==="Android" || store.getDevice()==="") {
      Android && Android.callCallBack(msg);
    }else if(store.getDevice()==="iphone"){
      var callbackToIOSNative = {'VCCallbackIOS':msg};
      window.webkit.messageHandlers.fromNodeVC.postMessage(callbackToIOSNative);
    }
  } catch (ex) {
    console.log("NFI Android is not defined");
  }

}
export const showIncomingCallDialog = (
  callType,
  acceptCallHandler,
  rejectCallHandler
) => {
  const callTypeInfo =
    callType === constants.callType.CHAT_PERSONAL_CODE ? "Chat" : "Video";
  let ringtone = new Audio("./audio/cell-phone-ringing.mp3");
  ringtone.loop = true;
  Swal.fire({
    title: "Incoming Call!!!",
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "Accept",
    denyButtonText: `Cancel`,
    timer: 15000,
    didOpen: () => {
      ringtone.play();
    }
  }).then((result) => {
    if (result.isConfirmed) {
      acceptCallHandler();
    } else if (result.isDismissed) {
      rejectCallHandler(result.dismiss);
    }
    ringtone.pause();
  });
};

export const updateRemoteVideo = (stream) => {
  const remoteVideo = document.getElementById("remote_video");
  remoteVideo.srcObject = stream;
  showElement(document.getElementById("call_buttons"));
};

// ui call buttons

const micOnImgSrc = "./images/mic.png";
const micOffImgSrc = "./images/micOff.png";

export const updateMicButton = (micActive) => {
  const micButtonImage = document.getElementById("mic_button_image");
  micButtonImage.src = micActive ? micOffImgSrc : micOnImgSrc;
};

const cameraOnImgSrc = "./images/camera.png";
const cameraOffImgSrc = "./images/cameraOff.png";

export const updateCameraButton = (cameraActive) => {
  const cameraButtonImage = document.getElementById("camera_button_image");
  cameraButtonImage.src = cameraActive ? cameraOffImgSrc : cameraOnImgSrc;
};

// recording
export const showRecordingPanel = () => {
  const recordingButtons = document.getElementById("video_recording_buttons");
  showElement(recordingButtons);

  // // hide start recording button if it is active
  // const startRecordingButton = document.getElementById(
  //   "start_recording_button"
  // );
  // hideElement(startRecordingButton);
};

export const resetRecordingButtons = () => {
  // const startRecordingButton = document.getElementById(
  //   "start_recording_button"
  // );
  const recordingButtons = document.getElementById("video_recording_buttons");

  hideElement(recordingButtons);
  // showElement(startRecordingButton);
};

export const switchRecordingButtons = (switchForResumeButton = false) => {
  const resumeButton = document.getElementById("resume_recording_button");
  const pauseButton = document.getElementById("pause_recording_button");

  if (switchForResumeButton) {
    hideElement(pauseButton);
    showElement(resumeButton);
  } else {
    hideElement(resumeButton);
    showElement(pauseButton);
  }
};


const hideElement = (element) => {
  if (!element.classList.contains("display_none")) {
    element.classList.add("display_none");
  }
};

// update the status
const status = document.querySelector("#status");
status.textContent = "Not Connected";

export const updateStatus = (statusContent) => {
  status.textContent = statusContent;
  if (connected_user) {
    connected_user.textContent = "";
  }
};

export const updateConnectedUser = () => {
  if (connected_user) {
    connected_user.textContent = store.getRemoteUser();
  }
};
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
};

async function close_camera() {
  
   try {
     
       console.log('inside close_camera');
       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream to release the camera
       stream.getTracks().forEach(track => track.stop());
 }
 catch(error){
 console.log("Error in close camera" + error);
 }
 }
