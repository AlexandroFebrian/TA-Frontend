import React, { useState } from 'react'
import { FiArrowRight, FiArrowLeft, FiX } from "react-icons/fi";

export default function Recommendation({item}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [eyeglassModel, setEyeglassModel] = useState(null);
  
  let gender = { Female: 'perempuan', Male: 'laki-laki' };
  let faceshape = { Heart: 'hati', Oblong: 'persegi panjang', Oval: 'oval', Round: 'bulat', Square: 'persegi' };

  const openModal = (model, images, index) => {
    setEyeglassModel(model);
    setSelectedImage(images);
    setCurrentIndex(index);

    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedImage(null)

    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    if (selectedImage) {
      setCurrentIndex((prev) => (prev + 1) % selectedImage.length);
    }
  };

  const prevImage = () => {
    if (selectedImage) {
      setCurrentIndex((prev) => (prev - 1 + selectedImage.length) % selectedImage.length);
    }
  };

  return (
    <div id='Recommendation' className="w-auto mt-6 p-6 bg-white xl:rounded-xl shadow-lg">
      <h1 className=' text-2xl font-semibold'>Anda adalah seorang {gender[item.gender]} yang memiliki wajah berbentuk {faceshape[item.faceshape]}</h1>
      <h2 className=' text-xl font-semibold mt-3'>Rekomendasi model kacamata</h2>

      {
        item.eyeglasses.map((eyeglass, index) => (
          <div className=' mt-3'>
            <p className='font-semibold'>{eyeglass.model}</p>
            <div className=' w-fit flex flex-row gap-6 overflow-x-auto overflow-y-hidden mt-3 p-4'>
              {
                eyeglass.images.map((image, index) => (
                  <img 
                    src={`data:image/jpg;base64,${image}`} 
                    alt={eyeglass.model} 
                    className=' xl:w-[30rem] xl:h-[30rem] md:w-[20rem] md:h-[20rem] w-2/3 aspect-ratio rounded-xl transition-all duration-300 hover:scale-105 hover:cursor-pointer active:scale-95' 
                    onClick={() => {openModal(eyeglass.model, eyeglass.images, index)}}
                  />
                ))
              }
            </div>
          </div>
        ))
      }

      {
        selectedImage 
        && 
        (
          <div className='fixed top-0 left-0 w-full h-screen bg-black/80 flex items-center justify-center z-50 lg:p-44 xl:p-88 2xl:px-[36rem] p-9 aspect-square'>
            <div className='relative w-full max-w-[100%] max-h-[100%] flex items-center justify-center' onClick={(e) => e.stopPropagation()}>
              <div className='overflow-hidden max-h-[100%]  w-full rounded-lg shadow-lg'>
                <div
                  className={`h-full flex transition-transform duration-500 ease-in-out rounded-lg shadow-lg`}
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {selectedImage.map((img, idx) => (
                    <img
                      key={idx}
                      src={`data:image/jpg;base64,${img}`}
                      className=' w-full flex-none rounded-lg shadow-lg'
                    />
                  ))}
                </div>
              </div>

            </div>

            <div className='absolute w-full h-[5rem] top-0 flex items-center justify-center bg-black/50'>
              <h1 className='text-white font-semibold text-xl md:text-3xl'>
                {eyeglassModel}
              </h1>
            </div>

            <button className='absolute top-4 right-4 bg-gray-900 p-2 rounded-full hover:cursor-pointer hover:bg-gray-800 active:bg-gray-700 active:scale-90 transition-all duration-300' onClick={closeModal}>
              <FiX className='text-white' size={24} />
            </button>
            <button className='absolute left-4 bg-gray-900 p-2 rounded-full hover:cursor-pointer hover:bg-gray-800 active:bg-gray-700 active:scale-90 transition-all duration-300' onClick={prevImage}>
              <FiArrowLeft className='text-white' size={24} />
            </button>
            <button className='absolute right-4 bg-gray-900 p-2 rounded-full hover:cursor-pointer hover:bg-gray-800 active:bg-gray-700 active:scale-90 transition-all duration-300' onClick={nextImage}>
              <FiArrowRight className='text-white' size={24} />
            </button>
          </div>
        )
      }
    </div>
  )
}
