import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import PropTypes from 'prop-types'
import React from 'react'
import { Link } from 'react-router-dom'

const AppDrawer = ({ onClose, open }) => {
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Divider />
      <List component="nav">
        <ListItemButton key="1" onClick={onClose}>
          <Link to="/graphs/repo-additions-deletions">
            <ListItemText primary="Adds / Deletes" />
          </Link>
        </ListItemButton>
        <ListItemButton key="2" onClick={onClose}>
          <Link to="/graphs/repo-files">
            <ListItemText primary="Changed Files" />
          </Link>
        </ListItemButton>
      </List>
    </Drawer>
  )
}

AppDrawer.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
}

export default AppDrawer
