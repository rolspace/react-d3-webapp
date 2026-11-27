import FormLabel from '@mui/material/FormLabel'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import React, { useId } from 'react'
import { BinScale } from '../utils/binning'

interface ScaleToggleProps {
  value: BinScale
  onChange: (scale: BinScale) => void
}

const ScaleToggle: React.FC<ScaleToggleProps> = ({ value, onChange }) => {
  const scaleLabelId = useId()

  return (
    <Stack>
      <FormLabel id={scaleLabelId}>Scale</FormLabel>
      <ToggleButtonGroup
        aria-labelledby={scaleLabelId}
        exclusive
        size="small"
        value={value}
        onChange={(_, next: BinScale | null) => next && onChange(next)}
      >
        <ToggleButton value="linear">Linear</ToggleButton>
        <ToggleButton value="log">Log</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  )
}

export default ScaleToggle
