import React from 'react'

export default function Button({ children, onClick, disabled, className }) {
  return (
    <button 
      onClick={onClick} 
      className={` hover:cursor-pointer active:scale-95 py-3 px-6 font-semibold text-white rounded-xl shadow-lg transition-all duration-300 disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-context-menu ${className}`}
      disabled={disabled}>
      {children}
    </button>
  )
}
