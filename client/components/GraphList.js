import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { withStyles } from 'material-ui/styles'
import ButtonBase from 'material-ui/ButtonBase'
import Typography from 'material-ui/Typography'
import Card, { CardContent } from 'material-ui/Card'
import GridList, { GridListTile } from 'material-ui/GridList'

const styles = {
	card_anchor: {
		minWidth: '100%',
		textDecoration: 'none'
	},
	card_button: {
		minWidth: '100%',
		padding: '1px 1px 2px 1px'
	}
}

const GraphList = (props) => {
	const { classes } = props

	return (
		<GridList cols={2} spacing={16} cellHeight='auto'>
			<GridListTile>
				<ButtonBase className={classes.card_button}>
					<Link className={classes.card_anchor} to="/graphs/repo-additions-deletions">
						<Card>
							<CardContent className={classes.card_content}>
								<Typography align='left' variant='subheading' component='h5'>Additions vs. Deletions</Typography>
								<Typography align='left' variant='caption'>Groups the commits based on the number of lines that have been added or deleted</Typography>
							</CardContent>
						</Card>
					</Link>
				</ButtonBase>
			</GridListTile>
			<GridListTile>
				<ButtonBase className={classes.card_button}>
					<Link className={classes.card_anchor} to="/">
						<Card>
							<CardContent>
								<Typography align='left' variant='subheading' component='h5'>Graph #2</Typography>
							</CardContent>
						</Card>
					</Link>
				</ButtonBase>
			</GridListTile>
      <GridListTile>
				<ButtonBase className={classes.card_button}>
					<Link className={classes.card_anchor} to="/">
						<Card>
							<CardContent>
								<Typography align='left' variant='subheading' component='h5'>Graph #3</Typography>
							</CardContent>
						</Card>
					</Link>
				</ButtonBase>
			</GridListTile>
			<GridListTile>
				<ButtonBase className={classes.card_button}>
					<Link className={classes.card_anchor} to="/">
						<Card>
							<CardContent>
								<Typography align='left' variant='subheading' component='h5'>Graph #4</Typography>
							</CardContent>
						</Card>
					</Link>
				</ButtonBase>
			</GridListTile>
		</GridList>
	)
}

GraphList.propTypes = {
	classes: PropTypes.object.isRequired
}

export default withStyles(styles)(GraphList)