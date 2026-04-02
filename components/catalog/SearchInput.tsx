'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { debounce } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onSearch: (q: string) => void
}

function SearchInput({ value, onSearch }: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const debouncedSearch = useRef(debounce(onSearch, 300))

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    debouncedSearch.current = debounce(onSearch, 300)
  }, [onSearch])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setLocalValue(next)
    debouncedSearch.current(next)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setLocalValue('')
      onSearch('')
    }
  }

  return (
    <Input
      type="search"
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="Search by name or description..."
    />
  )
}

export { SearchInput }
