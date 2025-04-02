import React from 'react'

export default function Recommendation({item}) {
  let gender = []
  gender['Female'] = "perempuan"
  gender['Male'] = "laki-laki"

  let faceshape = []
  faceshape["Heart"] = "hati"
  faceshape["Oblong"] = "persegi panjang"
  faceshape["Oval"] = "oval"
  faceshape["Round"] = "bulat"
  faceshape["Square"] = "persegi"

  return (
    <div className="w-auto mt-6 p-6 bg-white xl:rounded-lg shadow-lg">
      <h1 className=' text-2xl font-semibold'>Anda adalah seorang {gender[item.gender]} yang memiliki wajah berbentuk {faceshape[item.faceshape]}</h1>
      <h2 className=' text-xl font-semibold mt-3'>Rekomendasi model kacamata</h2>

      {
        item.eyeglasses.map((eyeglass, index) => (
          <div className=' mt-3'>
            <p className='font-semibold'>{eyeglass.model}</p>
            <div className=' w-fit flex flex-row gap-6 overflow-x-auto overflow-y-hidden mt-3'>
              {
                eyeglass.images.map((image, index) => (
                  <img 
                    src={`data:image/jpg;base64,${image}`} 
                    alt={eyeglass.model} 
                    className=' xl:w-[30rem] xl:h-[30rem] md:w-[20rem] md:h-[20rem] w-2/3 aspect-ratio rounded' />
                ))
              }
            </div>
          </div>
        ))
      }
    </div>
  )
}
