import clsx, { type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'fluid-xs',
        'fluid-sm',
        'fluid-base',
        'fluid-lg',
        'fluid-2xl',
        'fluid-3xl',
        'fluid-4xl',
        'fluid-hero',
      ],
    },
  },
})

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
