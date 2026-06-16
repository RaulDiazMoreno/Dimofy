import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';

interface Item {
  id: number | string;
  nombre: string;
}

interface DualListBoxProps {
  data: Item[];
  value: Item[];
  onChange: (selected: Item[]) => void;
}

const not = (a: Item[], b: Item[]) =>
  a.filter((value) => !b.some((item) => item.id === value.id));

const intersection = (a: Item[], b: Item[]) =>
  a.filter((value) => b.some((item) => item.id === value.id));

const DualListBox: React.FC<DualListBoxProps> = ({ data, value, onChange }) => {
  const [left, setLeft] = useState<Item[]>([]);
  const [checked, setChecked] = useState<Item[]>([]);

  useEffect(() => {
    setLeft(data.filter((item) => !value.some((v) => v.id === item.id)));
  }, [data, value]);

  const handleToggle = (item: Item) => () => {
    const currentIndex = checked.findIndex((i) => i.id === item.id);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(item);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleAllRight = () => {
    onChange([...value, ...left]);
    setLeft([]);
  };

  const handleCheckedRight = () => {
    const toMove = intersection(checked, left);
    onChange([...value, ...toMove]);
    setLeft(not(left, toMove));
    setChecked(not(checked, toMove));
  };

  const handleCheckedLeft = () => {
    const toMove = intersection(checked, value);
    onChange(value.filter((v) => !toMove.some((t) => t.id === v.id)));
    setLeft([...left, ...toMove]);
    setChecked(not(checked, toMove));
  };

  const handleAllLeft = () => {
    setLeft([...left, ...value]);
    onChange([]);
  };

  const customList = (items: Item[]) => (
    <Paper sx={{ width: 500, height: 200, overflow: 'auto' }}>
      <List dense component="div" role="list">
        {items.map((item) => (
          <ListItem
            key={item.id}
            role="listitem"
            button
            onClick={handleToggle(item)}
            selected={checked.some((i) => i.id === item.id)}
          >
            <ListItemText primary={item.nombre} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  return (
    <Box sx={{ margin: 2 }}>
      <Typography variant="h6" gutterBottom>
        Selecciona elementos
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        {customList(left)}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={handleAllRight} disabled={left.length === 0}>
            ≫
          </Button>
          <Button variant="outlined" size="small" onClick={handleCheckedRight} disabled={intersection(checked, left).length === 0}>
            &gt;
          </Button>
          <Button variant="outlined" size="small" onClick={handleCheckedLeft} disabled={intersection(checked, value).length === 0}>
            &lt;
          </Button>
          <Button variant="outlined" size="small" onClick={handleAllLeft} disabled={value.length === 0}>
            ≪
          </Button>
        </Box>
        {customList(value)}
      </Box>
    </Box>
  );
};

export default DualListBox;
