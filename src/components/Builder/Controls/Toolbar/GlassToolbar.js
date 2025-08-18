import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import BorderHorizontalIcon from '@material-ui/icons/BorderHorizontal';
import BorderVerticalIcon from '@material-ui/icons/BorderVertical';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import AddBoxIcon from '@material-ui/icons/AddBox';
import Tip from 'metadata-react/App/Tip';
import InfoButton from 'metadata-react/App/InfoButton';
import SmallButton from '../../Toolbar/IconButton';
import IconButton from '@material-ui/core/IconButton';
import GoLayer from './GoLayer';
import {useStyles} from '../../Toolbar/styles';

function addImpost(elm, orienattion) {

  const {elm_types, positions} = $p.enm;
  const inset = elm.project.default_inset({
    elm,
    elm_type: elm_types.impost,
    pos: positions[orienattion],
  });
  const pt = elm.interiorPoint();
  let {top, bottom, left, right} = elm.profiles_by_side();
  const {layer} = elm;

  const gen = (profile) => !layer.level || profile.elm_type.is('impost') ? profile.generatrix : profile.rays.outer;

  let path;
  if(orienattion == 'vert') {
    if(Math.abs(bottom.profile.b.x - pt.x) < 100) {
      pt.x = bottom.profile.generatrix.getPointAt(150).x;
    }
    if(Math.abs(bottom.profile.e.x - pt.x) < 100) {
      pt.x = bottom.profile.generatrix.getPointAt(bottom.profile.generatrix.length - 150).x;
    }
    if(Math.abs(top.profile.b.x - pt.x) < 100) {
      pt.x = top.profile.generatrix.getPointAt(150).x;
    }
    if(Math.abs(top.profile.e.x - pt.x) < 100) {
      pt.x = top.profile.generatrix.getPointAt(top.profile.generatrix.length - 150).x;
    }
    path = new paper.Path([pt.add([0, 10000]), pt.add([0, -10000])]);
    let b = path.intersect_point(gen(bottom.profile));
    let e = path.intersect_point(gen(top.profile));
    if(b && e) {
      path.firstSegment.point = b;
      path.lastSegment.point = e;
    }
    else {
      let tmp;
      if(!b) {
        for(const segm of elm.profiles) {
          if(segm.profile !== top.profile && segm.profile !== bottom.profile) {
            tmp = path.intersect_point(segm.sub_path);
            if(tmp) {
              bottom = segm;
              break;
            }
          }
        }
        if(!tmp) {
          pt.x = bottom.profile.generatrix.getPointAt(bottom.profile.generatrix.length / 2).x;
        }
      }
      else if(!e) {
        for(const segm of elm.profiles) {
          if(segm.profile !== top.profile && segm.profile !== bottom.profile) {
            tmp = path.intersect_point(segm.sub_path);
            if(tmp) {
              top = segm;
              break;
            }
          }
        }
        if(!tmp) {
          pt.x = top.profile.generatrix.getPointAt(top.profile.generatrix.length / 2).x;
        }
      }
      path = new paper.Path([pt.add([0, 10000]), pt.add([0, -10000])]);
      path.firstSegment.point = path.intersect_point(gen(bottom.profile));
      path.lastSegment.point = path.intersect_point(gen(top.profile));
    }
  }
  else {
    if(Math.abs(left.profile.b.y - pt.y) < 100) {
      pt.y = left.profile.generatrix.getPointAt(150).y;
    }
    if(Math.abs(left.profile.e.y - pt.y) < 100) {
      pt.y = left.profile.generatrix.getPointAt(left.profile.generatrix.length - 150).y;
    }
    if(Math.abs(right.profile.b.y - pt.y) < 100) {
      pt.y = right.profile.generatrix.getPointAt(150).y;
    }
    if(Math.abs(right.profile.e.y - pt.y) < 100) {
      pt.y = right.profile.generatrix.getPointAt(right.profile.generatrix.length - 150).y;
    }
    path = new paper.Path([pt.add([-10000, 0]), pt.add([10000, 0])]);
    let b = path.intersect_point(gen(left.profile));
    let e = path.intersect_point(gen(right.profile));
    if(b && e) {
      path.firstSegment.point = b;
      path.lastSegment.point = e;
    }
    else {
      let tmp;
      if(!b) {
        for(const segm of elm.profiles) {
          if(segm.profile !== left.profile && segm.profile !== right.profile) {
            tmp = path.intersect_point(segm.sub_path);
            if(tmp) {
              left = segm;
              break;
            }
          }
        }
        if(!tmp) {
          pt.y = left.profile.generatrix.getPointAt(left.profile.generatrix.length / 2).y;
        }
      }
      else if(!e) {
        for(const segm of elm.profiles) {
          if(segm.profile !== left.profile && segm.profile !== right.profile) {
            tmp = path.intersect_point(segm.sub_path);
            if(tmp) {
              right = segm;
              break;
            }
          }
        }
        if(!tmp) {
          pt.y = right.profile.generatrix.getPointAt(right.profile.generatrix.length / 2).y;
        }
      }
      path = new paper.Path([pt.add([-10000, 0]), pt.add([10000, 0])]);
      path.firstSegment.point = path.intersect_point(gen(left.profile));
      path.lastSegment.point = path.intersect_point(gen(right.profile));
    }
  }

  const {profiles} = layer;
  const impost = new $p.EditorInvisible.Profile({
    generatrix: path,
    layer,
    parent: layer.children?.profiles,
    proto: {inset, clr: top.profile.clr}
  });
  for(const inode of 'be') {
    const pt = impost[inode];
    for(const profile of profiles) {
      for(const pnode of 'be') {
        if(profile[pnode].is_nearest(pt, true) && impost.isAbove(profile)) {
          impost.insertBelow(profile);
        }
      }
    }
  }
}

function GlassToolbar({editor, elm, classes}) {
  const {inset, reflect_grp} = elm;

  return <Toolbar disableGutters>
    <Tip title="Вставить Створку ">
      <SmallButton onClick={() => elm.create_leaf()}>
        <AddBoxIcon/>
      </SmallButton>
    </Tip>
    <Tip title="Вставить вертикальный импост">
      <SmallButton onClick={() => addImpost(elm, 'vert')}>
        <BorderVerticalIcon/>
      </SmallButton>
    </Tip>
    <Tip title="Вставить горизонтальный импост">
      <SmallButton onClick={() => addImpost(elm, 'hor')}>
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
