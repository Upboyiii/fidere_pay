// React Imports
import type { SVGAttributes } from 'react'

const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <defs>
        <linearGradient id='fidereGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#6366f1' />
          <stop offset='50%' stopColor='#7c3aed' />
          <stop offset='100%' stopColor='#8b5cf6' />
        </linearGradient>
        <linearGradient id='fidereGradientLight' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#818cf8' />
          <stop offset='100%' stopColor='#a78bfa' />
        </linearGradient>
      </defs>
      
      {/* Shield shape - represents security and trust */}
      <path
        d='M16 2L6 6V16C6 22.6274 10.3726 27 16 27C21.6274 27 26 22.6274 26 16V6L16 2Z'
        fill='url(#fidereGradient)'
      />
      
      {/* Shield highlight for depth */}
      <path
        d='M16 2L6 6V16C6 22.6274 10.3726 27 16 27C21.6274 27 26 22.6274 26 16V6L16 2Z'
        fill='url(#fidereGradientLight)'
        fillOpacity='0.3'
      />
      
      {/* Letter F - stylized for Fidere */}
      <path
        d='M13 10H19C19.5523 10 20 10.4477 20 11V12C20 12.5523 19.5523 13 19 13H15V15H19C19.5523 15 20 15.4477 20 16V17C20 17.5523 19.5523 18 19 18H13C12.4477 18 12 17.5523 12 17V11C12 10.4477 12.4477 10 13 10Z'
        fill='white'
      />
      
      {/* Payment card icon - represents payment functionality */}
      <rect
        x='10'
        y='20'
        width='12'
        height='8'
        rx='1.5'
        fill='white'
        fillOpacity='0.95'
      />
      <rect
        x='12'
        y='22'
        width='8'
        height='1.5'
        rx='0.75'
        fill='url(#fidereGradient)'
      />
      <circle
        cx='22'
        cy='25'
        r='1.5'
        fill='url(#fidereGradient)'
      />
    </svg>
  )
}

export default Logo
