import FormLabel from '@mui/material/FormLabel'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import React, { useId } from 'react'
import { BinScale, MAX_BIN_COUNT, MIN_BIN_COUNT } from '../utils/binning'

interface HistogramControlsProps {
  binCount: number
  scale: BinScale
  onBinCountChange: (binCount: number) => void
  onScaleChange: (scale: BinScale) => void
}

const HistogramControls: React.FC<HistogramControlsProps> = ({
  binCount, scale, onBinCountChange, onScaleChange,
}) => {
  const binLabelId = useId()
  const scaleLabelId = useId()

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ alignItems: 'center', mb: 2 }}>
      <Stack sx={{ minWidth: 220 }}>
        <FormLabel id={binLabelId}>Bins: {binCount}</FormLabel>
        <Slider
          aria-labelledby={binLabelId}
          min={MIN_BIN_COUNT}
          max={MAX_BIN_COUNT}
          step={1}
          value={binCount}
          valueLabelDisplay="auto"
          onChange={(_, value) => onBinCountChange(value as number)}
        />
      </Stack>
      <Stack>
        <FormLabel id={scaleLabelId}>Scale</FormLabel>
        <ToggleButtonGroup
          aria-labelledby={scaleLabelId}
          exclusive
          size="small"
          value={scale}
          onChange={(_, value: BinScale | null) => value && onScaleChange(value)}
        >
          <ToggleButton value="linear">Linear</ToggleButton>
          <ToggleButton value="log">Log</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  )
}

export default HistogramControls
