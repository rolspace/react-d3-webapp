import ButtonBase from '@material-ui/core/ButtonBase'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React from 'react'
import { Link } from 'react-router-dom'

const styles = {
  card: {
    '&:hover': {
      backgroundColor: '#eee',
    },
    '&:hover h6': {
      textDecoration: 'underline',
    },
  },
  card_anchor: {
    minWidth: '100%',
    textDecoration: 'none',
  },
  card_button: {
    minWidth: '100%',
    padding: '1px 1px 2px 1px',
  },
  card_subtitle: {
    color: '#aaa',
  },
}

const CustomCard = ({ description, classes, title, to }) => {
  return (
    <ButtonBase className={classes.card_button} disableRipple={true}>
      <Link className={classes.card_anchor} to={to}>
        <Card className={classes.card}>
          <CardContent>
            <Typography align="left" variant="h6" component="h6">
              {title}
            </Typography>
            <Typography
              className={classes.card_subtitle}
              align="left"
              variant="subtitle2"
              component="div">
              {description}
            </Typography>
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
  description: PropTypes.string.isRequired,
}

export default withStyles(styles)(CustomCard)
