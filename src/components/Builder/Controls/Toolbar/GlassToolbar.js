import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import BorderHorizontalIcon from '@material-ui/icons/BorderHorizontal';
import BorderVerticalIcon from '@material-ui/icons/BorderVertical';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import Tip from 'metadata-react/App/Tip';
import InfoButton from 'metadata-react/App/InfoButton';
import SmallButton from '../../Toolbar/IconButton';
import IconButton from '@material-ui/core/IconButton';
import GoLayer from './GoLayer';
import AddBoxIcon from '@material-ui/icons/AddBox';
import {useStyles} from '../../Toolbar/styles';

function GlassToolbar({editor, elm, classes}) {
  const {inset, reflect_grp} = elm;

  function add_vert(elm) { 
    
    var ins_from_sys = editor.project.ox.sys.elmnts.find({elm_type:$p.enm.elm_types.Импост,by_default:true}).nom
    const {top, bottom} = elm.profiles_by_side();
const pt = elm.interiorPoint();
      const path = new paper.Path([pt.add([0, 10000]), pt.add([0, -10000])]);
      const pb = path.intersect_point(bottom.profile.generatrix);
      const pe = path.intersect_point(top.profile.generatrix);
    const {layer, clr} = top.profile;
      path.firstSegment.point = pb;
      path.lastSegment.point = pe;
      const impost = new $p.EditorInvisible.Profile({
        generatrix: path,
        proto: { inset :ins_from_sys, clr, parent: layer}
      });
  

  }  


  function add_hor(elm) {
    var ins_from_sys = editor.project.ox.sys.elmnts.find({elm_type:$p.enm.elm_types.Импост,by_default:true}).nom

    const {left, right} = elm.profiles_by_side();
const pt = elm.interiorPoint();
      const path = new paper.Path([pt.add([-10000, 0]), pt.add([10000, 0])]);
      const pb = path.intersect_point(left.profile.generatrix);
      const pe = path.intersect_point(right.profile.generatrix);
    const {layer, clr} = left.profile;
      path.firstSegment.point = pb;
      path.lastSegment.point = pe;
      const impost = new $p.EditorInvisible.Profile({
        generatrix: path,
        proto: { inset :ins_from_sys, clr, parent: layer}
      });
    

  }

  function add_leaf_iface(elm) {
    
    elm.create_leaf()
   
  }

  return <Toolbar disableGutters>
      <Tip title="Вставить  Створку ">
      <SmallButton disabled={false} onClick={() => {add_leaf_iface(elm)}}>
        <AddBoxIcon/>
      </SmallButton>
    </Tip>
    <Tip title="Вставить вертикальный импост">
      <SmallButton disabled={false} onClick={() => {add_vert(elm)}}>
        <BorderVerticalIcon/>
      </SmallButton>
    </Tip>
    <Tip title="Вставить горизонтальный импост">
      <SmallButton disabled={false}  onClick={() => {add_hor(elm)}}>
        <BorderHorizontalIcon/>
      </SmallButton>
    </Tip>
    <Tip title="Уравнять">
      <SmallButton disabled={!reflect_grp} onClick={() => editor.glass_align()}>
        <OpenWithIcon/>
      </SmallButton>
    </Tip>
    <div className={classes.title}/>
    <GoLayer elm={elm} editor={editor}/>
    <Tip title={$p.msg.elm_spec}>
      <IconButton onClick={() => editor.elm_spec(elm)}>
        <i className="fa fa-table" />
      </IconButton>
    </Tip>
    {inset?.note &&
      <Tip title='Информация' >
        <InfoButton text={inset.note} />
      </Tip>
    }
  </Toolbar>;
}

export default useStyles(GlassToolbar);

GlassToolbar.propTypes = {
  editor: PropTypes.object.isRequired,
  elm: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};
