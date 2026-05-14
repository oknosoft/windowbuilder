import React from 'react';
import {Command} from '../../Cmdk/index.tsx';

export default function RecentField() {

  return <Command>
    <Command.Input placeholder="Search files..." />
    <Command.List>
      <Command.Empty>No file found.</Command.Empty>
      <Command.Group heading="Recent">
        <Command.Item value="1">
          file
        </Command.Item>
      </Command.Group>
    </Command.List>
  </Command>;
}
