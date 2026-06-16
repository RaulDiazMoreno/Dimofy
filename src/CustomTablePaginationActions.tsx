import React from 'react';
import { IconButton } from '@mui/material';
import {
  FirstPage, LastPage, KeyboardArrowLeft, KeyboardArrowRight
} from '@mui/icons-material';

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

const CustomTablePaginationActions = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
}: TablePaginationActionsProps) => {
  const lastPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: '0.25rem 0.5rem',
        boxSizing: 'border-box',
        gap: '0.25rem',
        fontSize: '0.875rem',
      }}
    >
      <IconButton size="small" onClick={(e) => onPageChange(e, 0)} disabled={page === 0}>
        <FirstPage fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={(e) => onPageChange(e, page - 1)} disabled={page === 0}>
        <KeyboardArrowLeft fontSize="small" />
      </IconButton>
      <span>{`${page + 1} / ${lastPage + 1}`}</span>
      <IconButton size="small" onClick={(e) => onPageChange(e, page + 1)} disabled={page >= lastPage}>
        <KeyboardArrowRight fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={(e) => onPageChange(e, lastPage)} disabled={page >= lastPage}>
        <LastPage fontSize="small" />
      </IconButton>
    </div>
  );
};

export default CustomTablePaginationActions;




