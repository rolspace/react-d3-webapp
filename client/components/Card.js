/*eslint-disable no-irregular-whitespace*/

import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import ButtonBase from '@material-ui/core/ButtonBase'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

const styles = {
  card: {
    '&:hover': {
      backgroundColor: '#eee'
    },
    '&:hover h6': {
      textDecoration: 'underline'
    }
  },
	card_anchor: {
		minWidth: '100%',
    textDecoration: 'none'
	},
	card_button: {
		minWidth: '100%',
    padding: '1px 1px 2px 1px'
  },
  card_subtitle: {
    color: '#aaa'
  },
}

const CustomCard = (props) => {
  const { classes } = props

  return (
    <ButtonBase className={classes.card_button} disableRipple={true}>
      <Link className={classes.card_anchor} to={props.to}>
        <Card className={classes.card}>
          <CardContent>
            <Typography align='left' variant='h6' component='h6'>{props.title}</Typography>
            <Typography className={classes.card_subtitle} align='left' variant='subtitle2' component='div'>{props.description}</Typography>
          </CardContent>
        </Card>
      </Link>
    </ButtonBase>
  )
}

CustomCard.propTypes = {
  classes: PropTypes.object.isRequired,
  to: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
}

export default withStyles(styles)(CustomCard)
