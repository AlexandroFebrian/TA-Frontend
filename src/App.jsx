import { useRef, useEffect, useState } from "react";
import Button from "./Button";
import noCameraIcon from "./assets/no-camera-icon.svg";
import profileIcon from "./assets/profile-icon.svg";
import axios from "axios";
import loadingSpinner from "./assets/loading-spinner.svg"
import xCrossRed from "./assets/x-cross-red.svg"
import xCrossBlack from "./assets/x-cross-black.svg"
import Recommendation from "./Recommendation";

export default function CameraComponent() {
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  
  const checkCamera = async () => {
    try{
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia is not supported on this browser");
        return;
      }else{
        const userMedia = await navigator.mediaDevices.getUserMedia({ video: true });
        if (userMedia) {
          userMedia.getTracks().forEach(track => track.stop());
          await getCameras();
        }else{
          return
        }
      }
    }catch(error){
      console.error("Error getting cameras: ", error);
    }
  }

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error getting cameras: ", error);
    }
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported on this browser");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          width: { max: 1920 },
          height: { max: 1920 },
          aspectRatio: 1,
        } 
      });

      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);

      const selectedCam = devices.find(device => device.deviceId === selectedDevice);
      setIsFrontCamera(selectedCam && (selectedCam.label.toLowerCase().includes("front") || selectedCam.label.toLowerCase().includes("user") || selectedCam.label.toLowerCase().includes("facing")));
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      // const ctx = canvasRef.current.getContext("2d");
      // console.log(ctx)
      // canvasRef.current.width = videoRef.current.videoWidth;
      // canvasRef.current.height = videoRef.current.videoHeight;
      // ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      // setCapturedImage(canvasRef.current.toDataURL("image/png")); // Simpan gambar sebagai Base64

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      console.log(video.videoWidth, video.videoHeight)
      // Pastikan ukuran canvas sesuai dengan resolusi video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      console.log(canvas.width, canvas.height)

      // Gambar video ke canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Simpan hasil gambar sebagai Base64
      setCapturedImage(canvas.toDataURL("image/jpg"));
    }
  };

  const [image, setImage] = useState(null);
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImage(file); // Set image file
  };

  const getRecommendation = async () => {
    setResponse(null);
    if(capturedImage){
      setLoading(true);
      // const image = await fetch(captureImage).then(res => res.blob()).then(blob => blob);

      // Convert Base64 to Blob
      const byteString = atob(capturedImage.split(',')[1]); // ambil data setelah ','
      const mimeString = capturedImage.split(',')[0].split(':')[1].split(';')[0]; // ambil MIME type
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uintArray = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < byteString.length; i++) {
        uintArray[i] = byteString.charCodeAt(i);
      }

      // Convert to Blob
      const blob = new Blob([uintArray], { type: mimeString });
      
      // Create FormData and append the image Blob

      const formData = new FormData();
      formData.append("file", blob, "image.jpg");
      axios.post(
        `${backendURL}/get-recommendation`, 
        formData
      ).then(response => {
          console.log(response.data);
          if(response.status == 200){
            setResponse(response.data.faces);
          }else{
            setError(response.data.error)
          }
          setLoading(false);
        })
        .catch(error => {
          // console.log(error.response.data.error);
          setLoading(false);
          setError(error.response.data.error);
        });
    }
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if(selectedDevice){
      startCamera();
    }
  }, [selectedDevice])

  return (
    <>
      {
        loading
        &&
        <div className="w-full h-screen flex items-center justify-center fixed bg-black/40 top-0 z-10 p-6">
          <div className="w-[30rem] h-fit bg-white p-12 rounded-lg shadow-lg">
            <div className="w-full flex justify-center">
              <img src={loadingSpinner} alt="Loading" className="w-1/2"/>
            </div>
            <div className="w-full flex justify-center mt-3">
              <h1 className="font-semibold text-xl text-center">Mohon tunggu, foto anda sedang diproses</h1>
            </div>
          </div>
        </div>
      }
      {
        error
        &&
        <div className="w-full h-screen flex items-center justify-center fixed bg-black/40 top-0 z-10 p-6">
          <div className="w-[30rem] h-fit bg-white p-12 rounded-lg shadow-lg relative">
            <div className="absolute top-3 right-3 cursor-pointer" onClick={() => setError(null)}>
              <img src={xCrossBlack} alt="Close"/>
            </div>
            <div className="w-full flex justify-center">
              <img src={xCrossRed} alt="Error" className="w-1/2"/>
            </div>
            <div className="w-full flex justify-center mt-3">
              <h1 className="font-semibold text-xl">Error: {error}</h1>
            </div>
          </div>
        </div>
      }
      <div className="w-full flex justify-center xl:py-6">
        <div className=" xl:w-1/2 w-full shadow-lg xl:rounded-lg p-6 bg-white">
          <div className="flex items-center justify-between">
            <h1 className=" text-2xl font-semibold mr-4">Kamera</h1>
            <Button
              onClick={checkCamera}
              disabled={devices.length != 0}
              className={"bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"}
            >
              Cek Kamera
            </Button>
            
          </div>
          <select 
            name="" 
            id="" 
            className=" border border-gray-300 rounded w-full p-2 mt-2 hover:cursor-pointer" 
            onChange={(e) => setSelectedDevice(e.target.value)}
          >

            {
              devices.length == 0
              ?
              <option value="">No Camera Available</option>
              :
              devices.map((device, index) => (
                <option key={index} value={device.deviceId}>{device.label}</option>
              ))
            }
          </select>
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className={`w-full mt-3 border border-gray-100 rounded aspect-square ${!stream && "hidden"} ${isFrontCamera && "transform scale-x-[-1]"}`}
          />
          <div className={`w-full mt-3 border border-gray-100 rounded aspect-square flex items-center justify-center ${stream && "hidden"}`}>
            <img src={noCameraIcon} alt="Camera" className=" w-1/2"/>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {/* <button onClick={startCamera} disabled={stream !== null}>Open Camera</button> */}
            <Button 
              onClick={startCamera} 
              disabled={stream !== null || selectedDevice === null}
              className={"bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-2 px-4 rounded"}
            >
              Buka Kamera
            </Button>
            <Button
              onClick={stopCamera}
              disabled={stream === null}
              className={"bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-2 px-4 rounded"}
            >
              Tutup Kamera
            </Button>
          </div>

          <Button
            onClick={captureImage}
            disabled={stream === null}
            className={"w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"}
          >
            Ambil Gambar
          </Button>

          <canvas ref={canvasRef} className="hidden" />
          <h1 className=" mt-3 text-2xl font-semibold">Hasil Gambar</h1>
          <div className="mt-3 w-full aspect-square border border-gray-100 rounded">
            { capturedImage 
              ?
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full rounded "
              />
              :
              <img 
                src={profileIcon} 
                alt="Profile" 
                className="w-full rounded "
              />
            }
          </div>
          
          <Button
            onClick={getRecommendation}
            disabled={capturedImage === null}
            className={"w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"}
          >
            Cek Bentuk Wajah dan Dapatkan Rekomendasi
          </Button>
          {/* <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          /> */}
        </div>


      </div>
      {
        response
        &&
        response.map((item, index) => (
          <Recommendation key={index} item={item}/>
        ))

      }
      
    </>
  );
}
