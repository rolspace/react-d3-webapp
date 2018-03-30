import React from 'react'
import { Link } from 'react-router-dom'
import Grid from 'material-ui/Grid'
import Typography from 'material-ui/Typography'
import Card, { CardContent } from 'material-ui/Card';

const GraphList = () => {
	return (
		<div>
			<Grid container>
				<Grid item xs={12} sm={6}>
					<Link to="/graphs/repo-additions-deletions">
						<Card>
							<CardContent>
								<Typography>Additions vs. Deletions</Typography>
							</CardContent>
						</Card>
					</Link>
				</Grid>
			</Grid>
		</div>
	)
}

export default GraphList