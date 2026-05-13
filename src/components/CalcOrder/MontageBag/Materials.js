import React from 'react';
import ReactDataGrid from 'react-data-grid';
import SimpleToolbar from './SimpleToolbar';
import {columns} from './columns';
import {Command} from '../../Cmdk/index.tsx';

export default function Materials({prodRow, predefined}) {
  return <div style={{
    height: '26vh',
    minHeight: 260,
  }}>
    <SimpleToolbar row={null} title="Материалы"/>
    <Command>
      <Command.Input placeholder="Search files..." />
      <Command.List>
        <Command.Empty>No file found.</Command.Empty>
        <Command.Group heading="Recent">
          <Command.Item value="1">
            file
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command>
  </div>;
}
