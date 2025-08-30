import ButtonBase from '@mui/material/ButtonBase'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React from 'react'
import { Link } from 'react-router-dom'

interface CustomCardProps {
  description: string
  title: string
  to: string
}

const PREFIX = 'Card'

const classes = {
  card: `${PREFIX}-card`,
  card_anchor: `${PREFIX}-card_anchor`,
  card_button: `${PREFIX}-card_button`,
  card_subtitle: `${PREFIX}-card_subtitle`,
}

const StyledButtonBase = styled(ButtonBase)({
  [`& .${classes.card}`]: {
    '&:hover': {
      backgroundColor: '#eee',
    },
    '&:hover h6': {
      textDecoration: 'underline',
    },
  },
  [`& .${classes.card_anchor}`]: {
    minWidth: '100%',
    textDecoration: 'none',
  },
  [`&.${classes.card_button}`]: {
    minWidth: '100%',
    padding: '1px 1px 2px 1px',
  },
  [`& .${classes.card_subtitle}`]: {
    color: '#aaa',
  },
})

const CustomCard = (props: CustomCardProps) => {
  const { description, title, to } = props
  return (
    <StyledButtonBase className={classes.card_button} disableRipple>
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
              component="div"
            >
              {description}
            </Typography>
          </CardContent>
        </Card>
      </Link>
    </StyledButtonBase>
  )
}

export default CustomCard
