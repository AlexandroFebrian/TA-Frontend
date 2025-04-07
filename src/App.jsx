import { useRef, useEffect, useState } from "react";
import Button from "./Button";
import noCameraIcon from "./assets/no-camera-icon.svg";
import profileIcon from "./assets/profile-icon.svg";
import axios from "axios";
import loadingSpinner from "./assets/loading-spinner.svg"
import xCrossRed from "./assets/x-cross-red.svg"
import xCrossBlack from "./assets/x-cross-black.svg"
import Recommendation from "./Recommendation";
import { FiX } from "react-icons/fi";

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

      if (isFrontCamera) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1); // Mirror horizontal
      }  

      // Gambar video ke canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Simpan hasil gambar sebagai Base64
      setCapturedImage(canvas.toDataURL("image/jpg"));

      window.scrollTo({
        top: document.getElementById("HasilGambar").offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const [image, setImage] = useState(null);
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImage(file); // Set image file
  };

  const getRecommendation = async () => {
    stopCamera();
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
          // console.log(response.data);
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
          setError(error.response?.data.error || error.message);
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

  useEffect(() => {
    if(response){
      window.scrollTo({
        top: document.getElementById("Recommendation").offsetTop,
        behavior: 'smooth'
      });
    }
  }, [response])

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
              <FiX size={"25"}/>
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
        <div className=" xl:w-1/2 w-full rounded-2xl shadow-2xl bg-white border border-gray-300">
          <div className="p-6 flex rounded-t-2xl items-center justify-between gap-3 bg-gradient-to-r from-blue-500 to-blue-800">
            <h1 className=" text-xl xl:text-2xl font-semibold text-white">Rekomendasi Kacamata</h1>
            <Button
              onClick={checkCamera}
              disabled={devices.length != 0}
              className={"bg-gradient-to-r from-green-500 to-green-600 bg-[size:_150%] bg-[position:_0%_0%] hover:bg-[position:_100%_100%]W"}
            >
              Cek Kamera
            </Button>
          </div>
          <div className="px-6 pb-6 pt-4">
            <p className="font-semibold text-xl">Daftar Kamera: </p>
            <select 
              name="" 
              id="" 
              className=" w-full h-12 p-3 mt-2 rounded-xl bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:cursor-pointer" 
              onChange={(e) => setSelectedDevice(e.target.value)}
            >

              {
                devices.length == 0
                ?
                <option value="">Kamera tidak tersedia</option>
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
              className={`w-full rounded-xl mt-3 shadow-md border border-gray-100 aspect-square ${!stream && "hidden"} ${isFrontCamera && "transform scale-x-[-1]"}`}
            />
            <div className={`w-full mt-3 border border-gray-100 rounded-xl shadow-md aspect-square flex items-center justify-center ${stream && "hidden"}`}>
              <img src={noCameraIcon} alt="Camera" className=" w-1/2 opacity-50"/>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {/* <button onClick={startCamera} disabled={stream !== null}>Open Camera</button> */}
              <Button 
                onClick={startCamera} 
                disabled={stream !== null || selectedDevice === null}
                className={"bg-gradient-to-r from-blue-400 to-blue-600 bg-[size:_150%] bg-[position:_0%_0%] hover:bg-[position:_100%_100%]"}
              >
                Buka Kamera
              </Button>
              <Button
                onClick={stopCamera}
                disabled={stream === null}
                className={"bg-gradient-to-r from-red-600 to-red-500 bg-[size:_150%] bg-[position:_100%_100%] hover:bg-[position:_0%_0%]"}
              >
                Tutup Kamera
              </Button>
            </div>

            <Button
              onClick={captureImage}
              disabled={stream === null}
              className={"w-full mt-2 bg-gradient-to-r from-green-400 to-green-700 bg-[size:_150%] bg-[position:_0%_0%] hover:bg-[position:_100%_100%]"}
            >
              Ambil Gambar
            </Button>

            <canvas ref={canvasRef} className="hidden" />
            <h1 id="HasilGambar" className=" mt-3 text-2xl font-semibold">Hasil Gambar</h1>
            <div className="mt-3 w-full aspect-square border border-gray-100 rounded-xl">
              { 
              capturedImage 
                ?
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out"
                />
                :
                <img 
                  src={profileIcon} 
                  alt="Profile" 
                  className="w-full rounded-xl shadow-md opacity-50"
                />
              }
            </div>
            
            <Button
              onClick={getRecommendation}
              disabled={capturedImage === null}
              className={"w-full mt-2 bg-gradient-to-r from-green-400 to-green-700 bg-[size:_150%] bg-[position:_0%_0%] hover:bg-[position:_100%_100%]"}
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
