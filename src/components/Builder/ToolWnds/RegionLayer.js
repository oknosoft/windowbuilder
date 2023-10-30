import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';

function RegionLayer({project, layer, region}) {
  return <div>
    {`layer.info #${region}`}
    </div>;
}

RegionLayer.propTypes = {
  editor: PropTypes.object.isRequired,
};

export function region_layer({Editor, ui: {dialogs}}) {
  dialogs.region_layer = function (project) {
    const layer = project.getActiveLayer();
    if(!layer || ![0, 4].includes(layer.kind)) {
      return dialogs.alert({
        title: 'Слой ряда',
        text: 'Текущий слой не выбран либо не может иметь рядов',
        timeout: 10000,
      });
    }
    const insets = new Set;
    const regions = new Set;
    for(const {inset} of layer.profiles) {
      for(const row of inset.inserts) {
        if(row.inset.region) {
          insets.add(row.inset);
          regions.add(row.inset.region);
        }
      }
    }
    if(!insets.size) {
      return dialogs.alert({
        title: `Ряд для ${layer.info}`,
        text: 'Вставки профилей текущего слоя не содержат рекомендуемых вставок рядов',
        timeout: 10000,
      });
    }
    const values = Array.from(regions).map(v => v.toFixed());
    const initialValue = values[0];
    let pre = Promise.resolve(initialValue);
    if(regions.size > 1) {
      pre = dialogs.input_value({
        title: `Ряд для ${layer.info}`,
        text: 'Уточните номер ряда',
        list: values,
        timeout: 10000,
      });
    }

    return pre
      .then((region) => {
        region = parseInt(region);
        const parent = region > 0 ? layer.children.bottomLayers : layer.children.topLayers;
        for(const rl of parent.children) {
          if(rl.dop.region === region) {
            return dialogs.alert({
              title: `Ряд для ${layer.info}`,
              text: `Слой ряда №${region} уже существует`,
              timeout: 10000,
            });
          }
        }
        const rl = Editor.Contour.create({kind: 5, region, project, layer, parent});
      })
      .catch(() => null);
  };
}
export default RegionLayer;
