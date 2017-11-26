/**
 * ### Осуществляет экспорт в dxf
 * Created by Evgeniy Malyarov on 24.11.2017.
 */

export function exec_dxf (scheme, jscad) {

  // const { CAG, CSG } = require('@jscad/csg');

  const {contours, bounds, ox} = scheme;
  const glasses = scheme.selected_glasses();
  const h = bounds.height + bounds.y;
  let lscript = '';

  // имя будущего файла
  let name = ox.prod_name(true).replace(/\//,'-');
  name = name.substr(0, name.indexOf('/'));

  function export_contour(layer) {
    for(const profile of layer.profiles) {
      let script = 'CAG.fromPoints([';
      profile._attr._corns.forEach(point => script += `[${point.x}, ${h - point.y}],`);
      script += ']),\n';
      lscript+= script;
    }
    // for(const glass of layer.glasses(false, true)) {
    //   layers+= glass.elm;
    // }
    //layer.contours.forEach(export_contour);
  }

  if(glasses.length){
    lscript = 'CAG.fromPoints([';
    const path = glasses[0].path.clone(false);
    path.flatten(0.5);
    let prev;
    path.segments.forEach(({point}) => {
      if(prev && prev.getDistance(point) < 2){
        return;
      }
      prev = point;
      lscript += `[${point.x}, ${h - point.y}],`;
    });
    lscript += '])';
    name += '-' + glasses[0].elm.pad(2);
  }
  else{
    contours.forEach(export_contour);
  }

  const script = `
      function main() {
        return [${lscript}];
      }`;

  // generate compiled version
  jscad.compile(script, {}).then((compiled) => {
    // generate final output data, choosing your prefered format
    const outputData = jscad.generateOutput('dxf', compiled);
    $p.wsql.alasql.utils.saveAs(outputData, `${name}.dxf`);
    // $p.utils.blob_as_text(outputData).
    //   then((text) => {
    //   text = '';
    // })
    // hurray ,we can now write an stl file from our OpenJsCad script!
    //fs.writeFileSync('torus.stl', outputData.asBuffer())
  });

}
