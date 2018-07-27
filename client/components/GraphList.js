import React from 'react'
import GridList, { GridListTile } from 'material-ui/GridList'
import CustomCard from './Card'

const GraphList = () => {
	return (
		<GridList cols={2} spacing={16} cellHeight='auto'>
			<GridListTile>
				<CustomCard
					to='/graphs/repo-additions-deletions'
					title='Additions vs. Deletions'
					description='Groups commits based on the number of lines that have been added or deleted' />
			</GridListTile>
			<GridListTile>
				<CustomCard
					to='/graphs/repo-files'
					title='Changed Files'
					description='Groups commits based on the number of files that have been modified' />
			</GridListTile>
			<GridListTile>
				<CustomCard
					to='/'
					title='Graph #3'
					description='' />
			</GridListTile>
			<GridListTile>
				<CustomCard
					to='/'
					title='Graph #4'
					description='' />
			</GridListTile>
		</GridList>
	)
}

export default GraphList