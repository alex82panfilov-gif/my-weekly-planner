'use client'

import { useState, useEffect } from 'react'
import { localStorageUtils } from '@/lib/local-storage'
import { Check, AlertTriangle, X } from 'lucide-react'

export function LocalStorageIndicator() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [size, setSize] = useState(0)

  useEffect(() => {
    const checkStorage = () => {
      const available = localStorageUtils.isAvailable()
      setIsAvailable(available)
      
      if (available) {
        setSize(localStorageUtils.getSize())
      }
    }

    // Проверяем при монтировании
    checkStorage()

    // Проверяем периодически
    const interval = setInterval(checkStorage, 5000)

    return () => clearInterval(interval)
  }, [])

  if (isAvailable === null) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-3 h-3 border border-gray-300 rounded-full animate-pulse" />
        <span>Проверка хранилища...</span>
      </div>
    )
  }

  if (!isAvailable) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-500">
        <X className="w-3 h-3" />
        <span>Хранилище недоступно</span>
      </div>
    )
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isNearLimit = size > 4 * 1024 * 1024 // Близко к лимиту 5MB

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      {isNearLimit ? (
        <AlertTriangle className="w-3 h-3 text-yellow-500" />
      ) : (
        <Check className="w-3 h-3 text-green-500" />
      )}
      <span>{formatSize(size)}</span>
    </div>
  )
}
