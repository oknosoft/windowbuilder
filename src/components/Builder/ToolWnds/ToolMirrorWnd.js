import React from 'react';
import Bar from '../Controls/Bar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import HtmlTooltip from 'metadata-react/App/Tip';
import FieldSelectStatic from 'metadata-react/DataField/FieldSelectStatic';
import PropField from 'metadata-react/DataField/PropField';

import FlipIcon from '@material-ui/icons/Flip';

const options = [
  {
    valueOf() {return 'copy'},
    toString() {return 'Копирование'}
  },
  {
    valueOf() {return 'substitution'},
    toString() {return 'Замещение'}
  }
  ];

export default function ToolMirrorWnd(props) {
  const {tool} = props.editor;
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    function layers_change() {
      setIndex((index) => index + 1);
    }
    tool.on({layers_change});
    return () => tool.off({layers_change});
  }, [tool]);

  return <>
    <Bar>{tool.options.title}</Bar>
    <Toolbar disableGutters variant="dense">
      {tool.layers.size ? <>
        <HtmlTooltip title="Отразить влево">
          <IconButton onClick={() => tool.execute('left')}><FlipIcon style={{transform: 'rotate(0.5turn)'}}/></IconButton>
        </HtmlTooltip>
        <HtmlTooltip title="Отразить вправо">
          <IconButton onClick={() => tool.execute('right')}><FlipIcon/></IconButton>
        </HtmlTooltip>
        <div style={{flex: 1}}></div>
        <Typography color="primary" style={{paddingRight: 8}}>
          {`Выбрано рамных слоёв: ${tool.layers.size}`}
        </Typography>
      </> : <Typography color="primary" style={{paddingLeft: 8}}>
        Для выделения слоя, клик мыши на эскизе
      </Typography>}
    </Toolbar>
    <div style={{paddingLeft: 8, paddingRight: 8}}>
      <PropField
        Component={FieldSelectStatic}
        _obj={tool}
        _fld="mode"
        _meta={{synonym: 'Режим'}}
        options={options}
        handleValueChange={() => {
          setIndex(index + 1);
        }}
      />
      <Typography color="primary" variant="body2">
        {tool.mode === 'copy' ?
          'В режиме копирования, к изделию добавляются отраженные слои' :
          <>В режиме замещения,<br/>к изделию добавляются отраженные слои, а исходные - удаляются</>
        }
      </Typography>
    </div>
  </>;
}
