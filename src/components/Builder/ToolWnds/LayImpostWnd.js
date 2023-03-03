import React from 'react';
import PropTypes from 'prop-types';
import DataField from 'metadata-react/DataField/PropField';
import FieldSelectStatic from 'metadata-react/DataField/FieldSelectStatic';
import FieldNumberNative from 'metadata-react/DataField/FieldNumberNative';
import LayImpostAccordion from './LayImpostAccordion';
import {useStyles} from './styles';

let insertsCache = [];
let etypes;

export default function LayImpostWnd({editor}) {
  const {enm : {lay_split_types, elm_types}, cat: {clrs}} = $p;
  const classes = useStyles();
  const {tool: {profile}, project}  = editor;

  const [split, setSplit] = React.useState([]);
  const [inserts, setInserts] = React.useState([]);
  const [rev, setRev] = React.useState(1);

  if(!etypes) {
    etypes = [elm_types.rama, elm_types.impost, elm_types.layout];
  }

  const cmeta = profile._metadata('clr');
  clrs.selection_exclude_service(cmeta, profile.inset_by_y.clr_group.empty() ? profile.inset_by_x : profile.inset_by_y, project);

  // Пересчёт связанных списков
  React.useEffect(() => {

    const inserts = project._dp.sys.inserts(profile.elm_type, '', {project, layer: project.activeLayer});
    setInserts(inserts);
    if(!inserts.includes(profile.inset_by_y)) {
      insertsCache = inserts;
      profile.inset_by_y = inserts[0];
    }

  }, [profile.elm_type]);

  // Слушаем изменения
  React.useEffect(() => {

    const split_all = Object.values(lay_split_types.by_ref).filter(v => !v.empty());
    const split_ri = [lay_split_types.ДелениеВертикальных, lay_split_types.ДелениеГоризонтальных];

    function dataChange(obj, fields, first) {

      let touchx = true;

      if('inset_by_y' in fields) {
        const {pair, split_type, region} = obj.inset_by_y;
        if(split_type.length) {
          obj.split = split_type[0];
          setSplit(split_type);
        }
        else if(profile.elm_type === elm_types.layout) {
          setSplit(split_all);
        }
        else {
          setSplit(split_ri);
          if(!split_ri.includes(obj.split)) {
            obj.split = split_ri[0];
          }
        }

        if(!pair.empty()) {
          obj.inset_by_x = pair;
          touchx = false;
        }
        else if (!insertsCache.includes(obj.inset_by_x)) {
          obj.inset_by_x = obj.inset_by_y;
        }
        if(region && !region.empty?.()) {
          obj.region = region;
        }
      }
      if(touchx && 'inset_by_x' in fields) {
        const {pair, split_type, region} = obj.inset_by_x;
        if(split_type.length && obj.split != split_type[0]) {
          obj.split = split_type[0];
        }
        if(!pair.empty()) {
          obj.inset_by_y = pair;
        }
        if(region && !region.empty?.()) {
          obj.region = region;
        }
      }

      if('elm_type' in fields || 'inset_by_y' in fields || 'inset_by_x' in fields) {
        clrs.selection_exclude_service(cmeta, obj.inset_by_y.clr_group.empty() ? obj.inset_by_x : obj.inset_by_y, project);
      }

      first !== true && setRev((v) => v + 1);
    }

    dataChange(profile, {inset_by_y: profile.inset_by_y}, true);
    profile._manager.on('update', dataChange);

    return () => {
      profile._manager.off('update', dataChange);
    };
  }, []);

  return <div className={classes.root}>
    <DataField _obj={profile} Component={FieldSelectStatic} _fld="elm_type" options={etypes}/>
    <DataField _obj={profile} _fld="clr" _meta={cmeta}/>
    <DataField _obj={profile}
               _fld="split"
               Component={FieldSelectStatic}
               options={split}
               read_only={split.length === 1 || profile.inset_by_y.lay_split_types}
    />
    {profile.elm_type === elm_types.rama ? <DataField _obj={profile} _fld="w" Component={FieldNumberNative}/> : null}
    {profile.elm_type === elm_types.rama ? <DataField _obj={profile} _fld="h" Component={FieldNumberNative}/> : null}
    {profile.elm_type === elm_types.layout ? <DataField _obj={profile} _fld="region"/> : null}
    <LayImpostAccordion profile={profile} inserts={inserts} direction="y" />
    <LayImpostAccordion profile={profile} inserts={inserts} direction="x" />
  </div>;
}

LayImpostWnd.propTypes = {
  editor: PropTypes.object.isRequired,
};
