// import React, { useEffect, useState } from 'react'
// import { useAppStore } from '../stores/appStore'

import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { styled, Theme } from '@mui/material/styles'
import React, { useState } from 'react'
import { Link, BrowserRouter as Router } from 'react-router'
import AppDrawer from './AppDrawer'
import AppRouter from './AppRouter'

// export const App: React.FC = () => {
//   const { items, loading, error, fetchItems, addItem, clearError } =
//     useAppStore()
//   const [newName, setNewName] = useState('')
//   const [newValue, setNewValue] = useState('')

//   useEffect(() => {
//     fetchItems()
//   }, [fetchItems])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     const value = parseFloat(newValue)
//     if (!newName.trim() || isNaN(value)) {
//       return
//     }

//     await addItem({ name: newName.trim(), value })
//     setNewName('')
//     setNewValue('')
//   }

//   return (
//     <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
//       <h1>BFF Demo Application</h1>

//       <div
//         style={{
//           marginBottom: '20px',
//           padding: '15px',
//           backgroundColor: '#f5f5f5',
//           borderRadius: '5px',
//         }}
//       >
//         <h2>Add New Item</h2>
//         <form onSubmit={handleSubmit}>
//           <div style={{ marginBottom: '10px' }}>
//             <input
//               type='text'
//               placeholder='Name'
//               value={newName}
//               onChange={(e) => setNewName(e.target.value)}
//               style={{
//                 padding: '8px',
//                 marginRight: '10px',
//                 width: '200px',
//                 borderRadius: '3px',
//                 border: '1px solid #ccc',
//               }}
//             />
//             <input
//               type='number'
//               placeholder='Value'
//               value={newValue}
//               onChange={(e) => setNewValue(e.target.value)}
//               style={{
//                 padding: '8px',
//                 marginRight: '10px',
//                 width: '100px',
//                 borderRadius: '3px',
//                 border: '1px solid #ccc',
//               }}
//             />
//             <button
//               type='submit'
//               disabled={loading}
//               style={{
//                 padding: '8px 16px',
//                 backgroundColor: '#4CAF50',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '3px',
//                 cursor: loading ? 'not-allowed' : 'pointer',
//               }}
//             >
//               {loading ? 'Adding...' : 'Add Item'}
//             </button>
//           </div>
//         </form>
//       </div>

//       {error && (
//         <div
//           style={{
//             padding: '15px',
//             backgroundColor: '#ffebee',
//             color: '#c62828',
//             borderRadius: '5px',
//             marginBottom: '20px',
//           }}
//         >
//           <strong>Error:</strong> {error.message}
//           <button
//             onClick={clearError}
//             style={{
//               marginLeft: '10px',
//               padding: '5px 10px',
//               backgroundColor: '#c62828',
//               color: 'white',
//               border: 'none',
//               borderRadius: '3px',
//               cursor: 'pointer',
//             }}
//           >
//             Dismiss
//           </button>
//         </div>
//       )}

//       {loading && items.length === 0
//         ? (
//           <div>Loading...</div>
//           )
//         : (
//           <div>
//             <h2>Sample Items ({items.length})</h2>
//             {items.length === 0
//               ? (
//                 <p>No items yet. Add one above!</p>
//                 )
//               : (
//                 <table
//                   style={{
//                     width: '100%',
//                     borderCollapse: 'collapse',
//                     marginTop: '10px',
//                   }}
//                 >
//                   <thead>
//                     <tr style={{ backgroundColor: '#f5f5f5' }}>
//                       <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
//                       <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
//                       <th style={{ padding: '10px', textAlign: 'left' }}>Value</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {items.map((item) => (
//                       <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
//                         <td style={{ padding: '10px' }}>{item.id}</td>
//                         <td style={{ padding: '10px' }}>{item.name}</td>
//                         <td style={{ padding: '10px' }}>{item.value}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 )}
//           </div>
//           )}
//     </div>
//   )
// }

const PREFIX = 'App'

const classes = {
  container: `${PREFIX}-container`,
  bar_anchor: `${PREFIX}-bar_anchor`,
  bar_anchor_reset: `${PREFIX}-bar_anchor_reset`,
  menuButton: `${PREFIX}-menuButton`,
}

const AppRoot = styled('div')<{ theme?: Theme }>(({ theme }) => ({
  [`& .${classes.container}`]: {
    [theme?.breakpoints?.up('md')]: {
      paddingLeft: '80px',
      paddingRight: '80px',
    },
  },
  [`& .${classes.bar_anchor}`]: {
    color: 'white',
    textDecoration: 'none',
  },
  [`& .${classes.bar_anchor_reset}`]: {
    color: 'inherit',
    textDecoration: 'inherit',
  },
}))

const App: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleDrawer = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <Router>
      <AppRoot>
        <AppBar>
          <Toolbar>
            <IconButton
              onClick={handleDrawer}
              className={classes.menuButton}
              color="inherit"
              aria-label="Menu"
              size="large"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.bar_anchor}>
              <Link className={classes.bar_anchor_reset} to="/">
                GH repositories / charts and data
              </Link>
            </Typography>
          </Toolbar>
        </AppBar>
        <AppDrawer open={menuOpen} onClose={handleDrawer} />
        <Grid container className={classes.container}>
          <Grid size={{ xs: 12, sm: 12 }}>
            <AppRouter />
          </Grid>
        </Grid>
      </AppRoot>
    </Router>
  )
}

export default App
