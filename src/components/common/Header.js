import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const Header = () => {
  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🎓 Administration Scolaire - Gestion des Notes
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;