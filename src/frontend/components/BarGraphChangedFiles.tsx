import React, { useMemo, useState } from 'react'
import { RepoGraphProps } from '../types/graph.types'
import { BinScale, DEFAULT_BIN_COUNT, binSeries } from '../utils/binning'
import BarGraph from './BarGraph'
import HistogramControls from './HistogramControls'

const graphStyle = {
  colors: ['#00bcd4'],
  xAxisLabel: 'Changed Files',
  yAxisLabel: 'Total Commits',
}

const BarGraphChangedFiles: React.FC<RepoGraphProps> = ({ commits, status }) => {
  const [binCount, setBinCount] = useState(DEFAULT_BIN_COUNT)
  const [scale, setScale] = useState<BinScale>('linear')

  const sets = useMemo(
    () => [binSeries(commits.map((c) => c.changedFiles), { binCount, scale })],
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

export default BarGraphChangedFiles
