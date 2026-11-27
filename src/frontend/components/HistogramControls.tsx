import FormLabel from '@mui/material/FormLabel'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import React, { useId } from 'react'
import { BinScale, MAX_BIN_COUNT, MIN_BIN_COUNT } from '../utils/binning'
import ScaleToggle from './ScaleToggle'

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
      <ScaleToggle value={scale} onChange={onScaleChange} />
    </Stack>
  )
}

export default HistogramControls
