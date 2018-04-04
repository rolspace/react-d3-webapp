import React from 'react'
import { Link } from 'react-router-dom'
import Grid from 'material-ui/Grid'
import ButtonBase from 'material-ui/ButtonBase'
import Typography from 'material-ui/Typography'
import Card, { CardContent } from 'material-ui/Card';

const GraphList = () => {
	return (
		<div>
			<Grid container justify='center'>
				<Grid item xs={12} sm={6}>
					<ButtonBase>
						<Link to="/graphs/repo-additions-deletions">
							<Card>
								<CardContent>
									<Typography variant='subheading' component='h5'>Additions vs. Deletions</Typography>
								</CardContent>
							</Card>
						</Link>
					</ButtonBase>
				</Grid>
			</Grid>
		</div>
	)
}

export default GraphList