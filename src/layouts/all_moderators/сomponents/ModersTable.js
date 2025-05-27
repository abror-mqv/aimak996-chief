import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ModeratorsTable = ({ moderators, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper} elevation={3} sx={{ mt: 4 }}>
      <Table sx={{ minWidth: 650 }} aria-label="moderators table">

        <TableBody>
          {moderators.length > 0 ? (
            moderators.map((moderator) => (
              <TableRow key={moderator.id} hover>
                <TableCell>{moderator.full_name}</TableCell>
                <TableCell>{moderator.phone}</TableCell>
                <TableCell>
                  <Box sx={{ 
                    fontFamily: 'monospace',
                    backgroundColor: 'grey.100',
                    p: 0.5,
                    borderRadius: 1,
                    display: 'inline-block'
                  }}>
                    {moderator.raw_password}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton 
                    aria-label="edit" 
                    onClick={() => onEdit(moderator)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    aria-label="delete" 
                    onClick={() => onDelete(moderator.id)}
                    color="error"
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
                  Модераторы не найдены
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ModeratorsTable;