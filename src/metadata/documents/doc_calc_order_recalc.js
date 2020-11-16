/**
 *
 *
 * @module doc_calc_order_recalc
 *
 * Created by Evgeniy Malyarov on 15.11.2020.
 */

// даёт процессору отдохнуть
function sleep(time = 100, res) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(res), time);
  });
}

export default function ({doc: {calc_order}, cat: {branches}, adapters: {pouch}, wsql, utils: {blank}}) {

  function src_branch(doc) {
    let branch;
    for(const o of branches) {
      if(o.divisions.find({acl_obj: doc.department}) && o.partners.find({acl_obj: doc.partner})) {
        branch = o;
        if(!o._children().length) {
          break;
        }
      }
    }
    return branch;
  }

  function frame() {
    const docs = [];
    return pouch.remote.doc.find({
      selector: {
        class_name: 'doc.calc_order',
        date: {$gt: '2020-10-28'},
        search: {$ne: null},
      },
      fields: ['_id', 'timestamp', 'obj_delivery_state'],
      limit: 50000,
    })
      .then((res) => {
        for(const doc of res.docs) {
          if(doc.timestamp && doc.timestamp.moment > '2020-11-13' &&
            doc.obj_delivery_state !== 'Шаблон' &&
            doc.obj_delivery_state !== 'Подтвержден'
          ) {
            docs.push(doc._id.substr(15));
          }
        }
        return docs;
      });
  }

  function frame2() {
    const docs = [];
    return pouch.remote.doc.find({
      selector: {
        class_name: 'doc.calc_order',
        date: {$gt: '2020-10-28'},
        search: {$ne: null},
      },
      fields: ['_id', 'timestamp', 'obj_delivery_state', 'state', 'department', 'partner'],
      limit: 50000,
    })
      .then((res) => {
        for(const doc of res.docs) {
          if(doc.timestamp && !doc.state && doc.obj_delivery_state &&
            doc.obj_delivery_state !== '_' && doc.obj_delivery_state !== 'Шаблон' && doc.obj_delivery_state !== 'Подтвержден' &&
            doc.department && doc.department !== blank.guid &&
            doc.partner && doc.partner !== blank.guid
          ) {
            docs.push(doc._id.substr(15));
          }
        }
        return docs;
      });
  }

  calc_order.recalc_bs = async function () {

    const refs = JSON.parse(wsql.get_user_param('bs_refs') || '{}');

    if(Object.keys(refs).length < 2) {
      const docs = await frame();
      for(const ref of docs) {
        const doc = await calc_order.get(ref, 'promise');
        await doc.load_linked_refs();
        for(const {characteristic} of doc.production) {
          if(!characteristic.empty() && characteristic.is_new()) {
            const branch = src_branch(doc);
            const br = branch ? branch.valueOf() : blank.guid;
            if(!refs[br]) {
              refs[br] = [];
            }
            if(!refs[br].includes(ref)) {
              refs[br].push(ref);
              wsql.set_user_param('bs_refs', JSON.stringify(refs));
            }
            break;
          }
        }
        for(const {characteristic} of doc.production) {
          if(!characteristic.empty()) {
            characteristic.unload();
          }
        }
        doc.unload();
      }
    }

    for(const br in refs) {
      if(br === blank.guid) {
        continue;
      }
      pouch.props.branch =  br;
      for(const ref of refs[br]) {
        const doc = await calc_order.get(ref, 'promise');
        if(doc.obj_delivery_state == 'Подтвержден') {
          continue;
        }
        await doc.load_linked_refs();
        let err;
        for(const {characteristic} of doc.production) {
          if(!characteristic.empty() && characteristic.is_new()) {
            err = true;
            break;
          }
        }
        if(!err) {
          try {
            await doc.save();
          }
          catch (err) {
            console.log(err);
          }
        }
      }
    }
  };

  calc_order.recalc_bss = async function () {
    //const keys = Object.keys(branches)
    for(let brc = branches.alatable.length - 1; brc >=0; brc-- ) {
      const branch = branches.get(branches.alatable[brc].ref);
      if(!branch.use) {
        continue;
      }
      pouch.props.branch = branch.empty() ? null : branch.valueOf();
      try {
        const docs = await frame2();
        console.log(brc, branch.name, docs.length);
        await sleep();
        for(const ref of docs) {
          const doc = await calc_order.get(ref, 'promise');
          await doc.load_linked_refs();
          let err;
          for(const {characteristic} of doc.production) {
            if(!characteristic.empty() && characteristic.is_new()) {
              err = true;
              break;
            }
          }
          if(!err) {
            try {
              await doc.save();
            }
            catch (err) {
              console.log(err);
            }
          }
          for(const {characteristic} of doc.production) {
            if(!characteristic.empty()) {
              characteristic.unload();
            }
          }
          doc.unload();
          await sleep(500);
        }
      }
      catch (e) {}
    }

  };

}
