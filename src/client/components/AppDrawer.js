import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import PropTypes from 'prop-types'
import React from 'react'
import { Link } from 'react-router-dom'
import Divider from '@material-ui/core/Divider'

const AppDrawer = ({ onClose, open }) => {
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Divider />
      <List component="nav">
        <ListItem button key="1" onClick={onClose}>
          <Link to="/graphs/repo-additions-deletions">
            <ListItemText primary="Adds / Deletes" />
          </Link>
        </ListItem>
        <ListItem button key="2" onClick={onClose}>
          <Link to="/graphs/repo-files">
            <ListItemText primary="Changed Files" />
          </Link>
        </ListItem>
      </List>
    </Drawer>
  )
}

AppDrawer.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
}

export default AppDrawer
