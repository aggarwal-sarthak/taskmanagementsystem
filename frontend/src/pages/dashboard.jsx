import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';


import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import axios from 'axios';


const drawerWidth = 240;

export default function ResponsiveDrawer(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {['Home', 'Profile'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [idCounter, setIdCounter] = useState(1);

  const fetchtasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/usertask')
      console.log(response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }
  useEffect(() => {
    fetchtasks();
  }, []);
  const addTask = async () => {
    if (taskName.trim() !== '') {
      const newTask = {
        id: idCounter,
        name: taskName
      };
      setTasks([...tasks, newTask]);
      const response = await axios.post('http://localhost:5000/tasks', newTask);
      console.log(response.data);
      setTaskName('');
      setIdCounter(idCounter + 1);
    }
  };

  const deleteTask = async id => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    
    try {
      console.log(id)
      const response = await axios.post(`http://localhost:5000/delete`, {id: id});
      console.log(response.data);
    } catch (error) {
      console.error('Error updating task:', error);
    }
    setTasks(updatedTasks);
    setEditIndex(null);
  };

  const editTask = (id, index) => {
    setEditIndex(index);
    const taskToEdit = tasks.find(task => task.id === id);
    setEditValue(taskToEdit.name);
  };

  const saveEdit = async id => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, name: editValue };
      }
      return task;
    });
    setTasks(updatedTasks);
    setEditIndex(null);
    
    try {
      const response = await axios.post(`http://localhost:5000/tasks`, updatedTasks[0]);
      console.log(response.data);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Task Management System
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <TextField
        label="Task Name"
        value={taskName}
        onChange={e => setTaskName(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={addTask}
        style={{ marginLeft: '10px' }}
      >
        Add Task
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Task Name</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task, index) => (
              <TableRow key={task.id}>
                <TableCell>{task.id}</TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <TextField
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                    />
                  ) : (
                    task.name
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <IconButton
                      color="primary"
                      onClick={() => saveEdit(task.id)}
                      aria-label="save-edit"
                    >
                      <SaveIcon />
                    </IconButton>
                  ) : (
                    <>
                      <IconButton
                        color="default"
                        onClick={() => editTask(task.id, index)}
                        aria-label="edit-task"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => deleteTask(task.id)}
                        aria-label="delete-task"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Box>
    </Box>
  );
}