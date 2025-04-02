import React from 'react'

export default function Button({ children, onClick, disabled, className }) {
  return (
    <button 
      onClick={onClick} 
      className={` hover:cursor-pointer py-2 px-4 rounded transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-context-menu ${className}`}
      disabled={disabled}>
      {children}
    </button>
  )
}
