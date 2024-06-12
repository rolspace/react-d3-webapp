import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import PropTypes from 'prop-types'
import React from 'react'
import { Link } from 'react-router-dom'

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
