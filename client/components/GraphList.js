import React from 'react'
import { Link } from 'react-router-dom'
import ButtonBase from 'material-ui/ButtonBase'
import Typography from 'material-ui/Typography'
import Card, { CardContent } from 'material-ui/Card'

const GraphList = () => {
	return (
		<ButtonBase>
			<Link to="/graphs/repo-additions-deletions">
				<Card>
					<CardContent>
						<Typography variant='subheading' component='h5'>Additions vs. Deletions</Typography>
					</CardContent>
				</Card>
			</Link>
		</ButtonBase>
	)
}

export default GraphList