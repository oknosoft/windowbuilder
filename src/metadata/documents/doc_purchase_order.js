
import FrmObj from '../../components/PurchaseOrder/FrmObj';

export default function ({doc, DocPurchase_order}) {

  DocPurchase_order.prototype.before_save = function () {
    //this.doc_amount = this.goods.aggregate([], 'amount') + this.services.aggregate([], 'amount');
    return this;
  };

  doc.purchase_order.FrmObj = FrmObj;
}
