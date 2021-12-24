import React from 'react'
import renderer from 'react-test-renderer'
import BarGraph from '../BarGraph'

describe('Components: BarGraph component', () => {
  it('renders correctly', () => {
    const data = {
      sets: [],
      xAxis: 'xAxis',
      yAxis: 'yAxis',
      xAxisLabel: 'xAxisLabel',
      yAxisLabel: 'yAxisLabel',
    }

    const tree = renderer.create(<BarGraph data={data} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
