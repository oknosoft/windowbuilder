import React from 'react';
import PropTypes from 'prop-types';
import DataGrid from 'react-data-grid';

const columns = [
  {key: 'id', name: 'ID'},
  {key: 'title', name: 'Title'}
];

const rows = [
  {id: 0, title: 'Example'},
  {id: 1, title: 'Demo'},
  {id: 2, title: 'Deo'},
  {id: 3, title: 'Deo4'}
];

for(let id = 4; id < 100; id++) {
  rows.push({id, title: `rnd-${id}`});
}

class DynList extends React.Component {

  render() {
    return <DataGrid
      columns={columns}
      rows={rows}
      defaultColumnOptions={{resizable: true}}
      onScroll={(evt) => {
        const { scrollTop, scrollLeft } = evt.currentTarget;
        console.log([scrollTop, scrollLeft]);
      }}
    />;
  }
}

export default DynList;
