import { useState } from 'react'

export const useInput = (initialValue) => {
  const [value, setValue] = useState(initialValue)
  const [valueChanged, setValueChanged] = useState(false)

  return {
    value,
    setValue,
    valueChanged,
    setValueChanged,
    reset: () => setValue(''),
    bind: {
      value,
      onChange: (event) => {
        const {
          target: { value: newValue },
        } = event

        setValueChanged(initialValue !== newValue)
        setValue(newValue)
      },
    },
  }
}
