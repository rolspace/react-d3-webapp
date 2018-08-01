import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Divider } from '../node_modules/@material-ui/core';

class AppDrawer extends React.Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    return (
      <Drawer anchor='left' open={this.props.open} onClose={this.props.onClose}>
        <Divider />
        <List component='nav'>
          <ListItem button onClick={this.props.onClose}>
            <Link to='/graphs/repo-additions-deletions'>
              <ListItemText primary='Adds vs. Deletes' />
            </Link>
          </ListItem>
          <ListItem button onClick={this.props.onClose}>
            <Link to='/graphs/repo-files'>
              <ListItemText primary='Changed Files' />
            </Link>
          </ListItem>
        </List>
      </Drawer>
    )
  }
}

AppDrawer.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
}

export default AppDrawer