import React from 'react';
import Grid from '@material-ui/core/Grid';
import {decorators, Treebeard} from 'wb-forms/dist/Treebeard';


const height = {height: '60vh'};
const {utils} = $p;

export default function Layers({calc_order, rowData, tree}) {

  const [current, setCurrent] = React.useState(null);
  const [i, setI] = React.useState(0);
  const forceUpdate = () => setI(i + 1);


  const svg = current ? current.svg : '';

  return <Grid
    container
    direction="row"
    justify="space-between"
    alignItems="flex-start"
    spacing = {1}
    style={{minWidth: '60vw'}}
  >
    <Grid item xs={12} md={7} style={height}>
      <div className="dsn-tree" onDoubleClick={() => null}>
        <Treebeard
          ref={(el) => {
            console.log(el);
          }}
          data={tree}
          decorators={decorators}
          separateToggleEvent={true}
          onToggle={(node, toggled) => {
            if (node.children) {
              node.toggled = toggled;
              forceUpdate();
            }
          }}
          onClickHeader={(node) => {
            tree.deselect();
            node.active = true;
            setCurrent(node.key === 'root' ? null : node.owner);
            forceUpdate();
          }}
        />
      </div>
    </Grid>
    <Grid item xs={12} md={5} style={height}>
      <div dangerouslySetInnerHTML={{
        __html: current ? utils.scale_svg(current.svg, {width: 100, height: 100, zoom: 0.2}, 0) : 'Изделие не выбрано'
      }}/>
    </Grid>
  </Grid>;
}
