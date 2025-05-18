/**
 * Редактор каркаса витража
 *
 * @module tool_vitrazh
 *
 * Created by Evgeniy Malyarov on 21.11.2020.
 */

// http://localhost:3000/builder/b0b0fcf0-d593-11eb-8d4e-01b541f37852
import ToolWnd from '../../components/Builder/ToolWnds/VitrazhWnd';

export default function tool_vitrazh ({Editor, dp: {builder_lay_impost}}) {

  const {ToolElement} = Editor;

  class ToolVitrazh extends ToolElement {

    constructor() {
      super();
      Object.assign(this, {
        options: {name: 'vitrazh'},
        dp: null,
      });
      this.on({
        activate: this.on_activate,
        deactivate: this.on_deactivate,
      });
    }

    on_activate() {
      super.on_activate('cursor-text-select');
      const {options, project, _scope} = this;
      _scope.tb_left && _scope.tb_left.select(options.name);
      if(!project._attr._vitrazh) {
        const obj = builder_lay_impost.create();
        obj.init_vitrazh(project, Editor);
      }
      this.dp = project._attr._vitrazh;
    }

    on_deactivate() {
      this.dp = null;
    }

    createProfiles() {
      const {project, dp: {h, align_by_x, align_by_y, sizes}} = this;
      const {activeLayer} = project;
      activeLayer.clear(true);
      if(!h) {
        return;
      }
      // стойки
      const byX = sizes.find_rows({elm: 1, sz: {gt: 0}});
      const xMap = new Map();
      const profiles = [];
      if(byX.length) {

        // стойки
        const left = align_by_x.is('left');
        const sign = left ? 1 : -1;
        let x = 0;
        for(let i = 0; i <= byX.length; i++) {
          if(i) {
            x += sign * byX[i - 1].sz;
          }
          let attr;
          if(left) {
            attr = i ? {b: [x, -h], e: [x, 0]} : {e: [x, -h], b: [x, 0]};
          }
          else {
            attr = i ? {b: [x, 0], e: [x, -h]} : {e: [x, 0], b: [x, -h]};
          }
          const profile = activeLayer.createProfile(attr);
          profiles.push(profile);
          xMap.set(x, profile);

        }

        // ригели
        const byY = sizes.find_rows({elm: 0});
        const yMap = new Map();
        if(byY.length) {
          const bottom = align_by_y.is('bottom');
          x = 0;
          for(let i = 1; i <= byX.length; i++) {
            // находим примыкающие стойки и сообщаем их узлам
            const cnns = {b: {profile: xMap.get(x)}};
            x += sign * byX[i - 1].sz;
            cnns.e = {profile: xMap.get(x)};

            let y = 0;
            let prevCy = null;
            for(let j = 0; j < byY.length; j++) {
              y += (byY[j].sz || 0);
              const cy = bottom ? -y : (-h + y);
              if(cy > 0 || cy < -h) {
                continue;
              }
              if(prevCy === null) {
                prevCy = cy;
              }
              else {
                if(prevCy === cy) {
                  continue;
                }
                prevCy = cy;
              }
              let profile;
              if(bottom && cy > -100) {
                profile = activeLayer.createProfile({
                  b: [cnns.e.profile.b.x, cy],
                  e: [cnns.b.profile.b.x, cy],
                  cnns: {b: cnns.e, e: cnns.b}
                });
              }
              else {
                profile = activeLayer.createProfile({
                  b: [cnns.b.profile.b.x, cy],
                  e: [cnns.e.profile.b.x, cy],
                  cnns
                });
              }

              profiles.push(profile);
              if(left && i === byX.length || !left && i === 1) {
                yMap.set(cy, profile);
              }
            }
          }
        }
        //activeLayer.skeleton.addProfiles(profiles);
        project.redraw();
        project.zoom_fit();
        project.redraw();
      }

    }

  }

  ToolVitrazh.ToolWnd = ToolWnd;
  Editor.ToolVitrazh = ToolVitrazh;
}
