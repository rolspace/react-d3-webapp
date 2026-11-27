import React, { useMemo, useState } from 'react'
import { RepoGraphProps } from '../types/graph.types'
import { BinScale, DEFAULT_BIN_COUNT, binSharedSeries } from '../utils/binning'
import BarGraph from './BarGraph'
import HistogramControls from './HistogramControls'

const graphStyle = {
  colors: ['#2da44e', '#cf222e'],
  xAxisLabel: 'Code Lines',
  yAxisLabel: 'Total Commits',
}

const BarGraphAddsDeletes: React.FC<RepoGraphProps> = ({ commits, status }) => {
  const [binCount, setBinCount] = useState(DEFAULT_BIN_COUNT)
  const [scale, setScale] = useState<BinScale>('linear')

  const sets = useMemo(
    () => binSharedSeries(
      [commits.map((c) => c.additions), commits.map((c) => c.deletions)],
      { binCount, scale },
    ),
    [commits, binCount, scale],
  )

  return (
    <>
      {commits.length > 0 && (
        <HistogramControls
          binCount={binCount}
          scale={scale}
          onBinCountChange={setBinCount}
          onScaleChange={setScale}
        />
      )}
      <BarGraph graphStyle={graphStyle} sets={sets} status={status} />
    </>
  )
}

export default BarGraphAddsDeletes
