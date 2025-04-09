import React, { use, useEffect, useRef, useState } from 'react'
import { FiArrowRight, FiArrowLeft, FiX } from "react-icons/fi";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Zoom, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/zoom';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Recommendation({item}) {
  // const swiperRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [eyeglassModel, setEyeglassModel] = useState(null);
  
  let gender = { Female: 'perempuan', Male: 'laki-laki' };
  let faceshape = { Heart: 'hati', Oblong: 'persegi panjang', Oval: 'oval', Round: 'bulat', Square: 'persegi' };

  const openModal = (model, images, index) => {
    // console.log(index)
    setEyeglassModel(model);
    setSelectedImage(images);
    setCurrentIndex(index);

    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedImage(null)

    document.body.style.overflow = 'unset';
  };

  // const nextImage = () => {
  //   if (selectedImage) {
  //     setCurrentIndex((prev) => (prev + 1) % selectedImage.length);
  //   }
  // };

  // const prevImage = () => {
  //   if (selectedImage) {
  //     setCurrentIndex((prev) => (prev - 1 + selectedImage.length) % selectedImage.length);
  //   }
  // };

  return (
    <div id='Recommendation' className=" w-auto md:my-6 md:mx-6 bg-white rounded-2xl shadow-lg mt-6">
      <div className='w-full rounded-t-2xl p-6 bg-gradient-to-r from-blue-500 to-blue-800 flex flex-col items-center justify-center'>
        <h1 className=' text-2xl font-semibold text-white'>Anda adalah seorang {gender[item.gender]} yang memiliki wajah berbentuk {faceshape[item.faceshape]}</h1>
      </div>
      <div className='px-6 pb-6 pt-4'>
        <h2 className=' text-2xl font-semibold'>Rekomendasi model kacamata</h2>

        {
          item.eyeglasses.map((eyeglass, index) => (
            <div key={index} className=' mt-3'>
              <hr className=' my-4 text-gray-300'/>
              <p className='font-semibold text-xl'>{eyeglass.model}</p>
              <div className=' w-fit flex flex-row gap-6 overflow-x-auto overflow-y-hidden mt-3 p-4'>
                {
                  eyeglass.images.map((image, index) => (
                    <img 
                      key={index}
                      src={`data:image/jpg;base64,${image}`} 
                      alt={eyeglass.model} 
                      className=' md:w-[40vh] md:h-[40vh] w-2/3 aspect-ratio rounded-xl transition-all duration-300 hover:scale-105 hover:cursor-pointer active:scale-95' 
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
            <div className='fixed top-0 left-0 w-full h-screen bg-black/80 z-0'>
              <div className='w-full h-[5rem] px-5 flex items-center justify-between bg-black/50'>
              <div></div>
                <h1 className='text-white font-semibold text-xl md:text-3xl'>
                  {eyeglassModel}
                </h1>
                  <FiX className='text-white hover:cursor-pointer' size={24} onClick={closeModal}/>
                {/* <button className='bg-gray-900 p-2 rounded-full hover:cursor-pointer hover:bg-gray-800 active:bg-gray-700 active:scale-90 transition-all duration-300' onClick={closeModal}>
                </button> */}
              </div>
              <Swiper
                // ref={swiperRef}
                modules={[Zoom, Navigation, Pagination]}
                zoom={true}
                navigation
                pagination={{ clickable: true }}
                speed={500}
                initialSlide={currentIndex}
                className='w-full h-[calc(100vh-5rem)]'
              >
                {selectedImage.map((src, index) => (
                  <SwiperSlide key={index}>
                    <div className="swiper-zoom-container p-12">
                      <img 
                        src={`data:image/jpg;base64,${src}`} 
                        alt={`Image ${index}`} 
                        className='w-full'/>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              {/* <div className='w-full h-[5rem] px-5 flex items-center justify-between bg-black/50'>
              <div></div>
                <h1 className='text-white font-semibold text-xl md:text-3xl'>
                  {eyeglassModel}
                </h1>
                <button className='bg-gray-900 p-2 rounded-full hover:cursor-pointer hover:bg-gray-800 active:bg-gray-700 active:scale-90 transition-all duration-300' onClick={closeModal}>
                  <FiX className='text-white' size={24} />
                </button>
              </div>

              <div className='relative w-full h-[calc(100vh-5rem)] flex items-center justify-center p-9' onClick={(e) => e.stopPropagation()}>
                <button className='absolute left-4 bg-gray-900 p-2 rounded-full hover:cursor-pointer hover:bg-gray-800 active:bg-gray-700 active:scale-90 transition-all duration-300 z-50' onClick={prevImage}>
                  <FiArrowLeft className='text-white' size={24} />
                </button>
                <div className='overflow-hidden rounded-lg shadow-lg h-full w-full'>
                  <div
                    className={` flex transition-transform duration-500 ease-in-out rounded-lg shadow-lg w-full aspect-square`}
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                  >
                    {selectedImage.map((img, idx) => (
                      <img
                        key={idx}
                        src={`data:image/jpg;base64,${img}`}
                        className=' flex-none rounded-lg shadow-lg'
                      />
                    ))}
                  </div>
                </div>
                <button className='absolute right-4 bg-gray-900 p-2 rounded-full hover:cursor-pointer hover:bg-gray-800 active:bg-gray-700 active:scale-90 transition-all duration-300 z-50' onClick={nextImage}>
                  <FiArrowRight className='text-white' size={24} />
                </button>

              </div> */}


            </div>
          )
        }

      </div>
    </div>
  )
}
