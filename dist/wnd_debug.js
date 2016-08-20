;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Wnd_debug = factory();
  }
}(this, function() {
$p.wsql.alasql('USE md; CREATE TABLE IF NOT EXISTS `areg_invoice_payments` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `trans` CHAR, `partner` CHAR, `organization` CHAR, `period` Date, `recorder` CHAR, `amount_mutual` FLOAT, `amount_operation` FLOAT); CREATE TABLE IF NOT EXISTS `areg_planning` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `phase` CHAR, `date` Date, `work_center` CHAR, `obj` CHAR, `elm` INT, `specimen` INT, `period` Date, `recorder` CHAR, `quantity` FLOAT, `cost` FLOAT); CREATE TABLE IF NOT EXISTS `ireg_currency_courses` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `currency` CHAR, `period` Date, `course` FLOAT, `multiplicity` INT); CREATE TABLE IF NOT EXISTS `ireg_margin_coefficients` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `price_group` CHAR, `parameters_key` CHAR, `condition_formula` CHAR, `marginality` FLOAT, `marginality_min` FLOAT, `marginality_internal` FLOAT, `price_type_first_cost` CHAR, `price_type_sale` CHAR, `price_type_internal` CHAR, `formula` CHAR, `sale_formula` CHAR, `internal_formula` CHAR, `external_formula` CHAR, `extra_charge_external` FLOAT, `discount_external` FLOAT, `discount` FLOAT, `note` CHAR); CREATE TABLE IF NOT EXISTS `ireg_$log` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `date` INT, `sequence` INT, `class` CHAR, `note` CHAR, `obj` CHAR); CREATE TABLE IF NOT EXISTS `ireg_buyers_order_states` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `invoice` CHAR, `state` CHAR, `event_date` Date, `СуммаОплаты` FLOAT, `ПроцентОплаты` INT, `СуммаОтгрузки` FLOAT, `ПроцентОтгрузки` INT, `СуммаДолга` FLOAT, `ПроцентДолга` INT, `ЕстьРасхожденияОрдерНакладная` BOOLEAN); CREATE TABLE IF NOT EXISTS `doc_planning_event` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `phase` CHAR, `work_center` CHAR, `recipient` CHAR, `calc_order` CHAR, `note` CHAR, `ts_executors` JSON, `ts_planning` JSON); CREATE TABLE IF NOT EXISTS `doc_nom_prices_setup` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `note` CHAR, `responsible` CHAR, `price_type` CHAR, `ts_goods` JSON); CREATE TABLE IF NOT EXISTS `doc_selling` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `warehouse` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_goods` JSON, `ts_services` JSON); CREATE TABLE IF NOT EXISTS `doc_credit_cash_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `partner_T` CHAR, `department` CHAR, `cashbox` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON); CREATE TABLE IF NOT EXISTS `doc_debit_cash_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `partner_T` CHAR, `department` CHAR, `cashbox` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON); CREATE TABLE IF NOT EXISTS `doc_credit_bank_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON); CREATE TABLE IF NOT EXISTS `doc_debit_bank_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON); CREATE TABLE IF NOT EXISTS `doc_work_centers_performance` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `start_date` Date, `expiration_date` Date, `responsible` CHAR, `note` CHAR, `ts_planning` JSON); CREATE TABLE IF NOT EXISTS `doc_credit_card_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON); CREATE TABLE IF NOT EXISTS `doc_calc_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `number_internal` CHAR, `project` CHAR, `organization` CHAR, `partner` CHAR, `client_of_dealer` CHAR, `contract` CHAR, `organizational_unit` CHAR, `note` CHAR, `manager` CHAR, `leading_manager` CHAR, `department` CHAR, `doc_amount` FLOAT, `amount_operation` FLOAT, `amount_internal` FLOAT, `accessory_characteristic` CHAR, `sys_profile` CHAR, `sys_furn` CHAR, `phone` CHAR, `delivery_area` CHAR, `shipping_address` CHAR, `coordinates` CHAR, `address_fields` CHAR, `difficult` BOOLEAN, `vat_consider` BOOLEAN, `vat_included` BOOLEAN, `settlements_course` FLOAT, `settlements_multiplicity` INT, `obj_delivery_state` CHAR, `category` CHAR, `ts_production` JSON, `ts_extra_fields` JSON, `ts_contact_information` JSON, `ts_planning` JSON); CREATE TABLE IF NOT EXISTS `doc_work_centers_task` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `work_center` CHAR, `recipient` CHAR, `responsible` CHAR, `note` CHAR, `ts_planning` JSON); CREATE TABLE IF NOT EXISTS `doc_purchase` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `warehouse` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_goods` JSON, `ts_services` JSON); CREATE TABLE IF NOT EXISTS `doc_registers_correction` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `original_doc_type` CHAR, `responsible` CHAR, `note` CHAR, `ts_registers_table` JSON); CREATE TABLE IF NOT EXISTS `cat_planning_keys` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `work_shift` CHAR, `department` CHAR, `work_center` CHAR, `work_center_kind` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_insert_bind` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `inset` CHAR, `inset_T` CHAR, `zone` INT, `predefined_name` CHAR, `ts_production` JSON); CREATE TABLE IF NOT EXISTS `cat_nom_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `vat_rate` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_price_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `definition` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_characteristics` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `x` FLOAT, `y` FLOAT, `z` FLOAT, `s` FLOAT, `clr` CHAR, `weight` FLOAT, `condition_products` FLOAT, `calc_order` CHAR, `product` INT, `leading_product` CHAR, `leading_elm` INT, `note` CHAR, `partner` CHAR, `sys` CHAR, `predefined_name` CHAR, `owner` CHAR, `ts_constructions` JSON, `ts_coordinates` JSON, `ts_cnn_elmnts` JSON, `ts_params` JSON, `ts_glass_specification` JSON, `ts_extra_fields` JSON, `ts_glasses` JSON, `ts_mosquito` JSON, `ts_specification` JSON); CREATE TABLE IF NOT EXISTS `cat_individuals` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `birth_date` Date, `inn` CHAR, `imns_code` CHAR, `note` CHAR, `pfr_number` CHAR, `sex` CHAR, `birth_place` CHAR, `ОсновноеИзображение` CHAR, `Фамилия` CHAR, `Имя` CHAR, `Отчество` CHAR, `ФамилияРП` CHAR, `ИмяРП` CHAR, `ОтчествоРП` CHAR, `ОснованиеРП` CHAR, `ДолжностьРП` CHAR, `Должность` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_contact_information` JSON); CREATE TABLE IF NOT EXISTS `cat_nom_prices_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `price_currency` CHAR, `discount_percent` FLOAT, `vat_price_included` BOOLEAN, `rounding_order` CHAR, `rounding_in_a_big_way` BOOLEAN, `note` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_cash_flow_articles` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `definition` CHAR, `sorting_field` INT, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_stores` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `note` CHAR, `department` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_projects` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `start` Date, `finish` Date, `launch` Date, `readiness` Date, `finished` BOOLEAN, `responsible` CHAR, `note` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_users` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `invalid` BOOLEAN, `department` CHAR, `individual_person` CHAR, `note` CHAR, `ancillary` BOOLEAN, `user_ib_uid` CHAR, `user_fresh_uid` CHAR, `id` CHAR, `predefined_name` CHAR, `ts_extra_fields` JSON, `ts_contact_information` JSON); CREATE TABLE IF NOT EXISTS `cat_divisions` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `main_project` CHAR, `sorting` INT, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_color_price_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `for_pricing_only` CHAR, `for_pricing_only_T` CHAR, `predefined_name` CHAR, `ts_price_groups` JSON, `ts_clr_conformity` JSON); CREATE TABLE IF NOT EXISTS `cat_clrs` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `ral` CHAR, `machine_tools_clr` CHAR, `clr_str` CHAR, `clr_out` CHAR, `clr_in` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_furns` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `flap_weight_max` INT, `left_right` BOOLEAN, `is_set` BOOLEAN, `is_sliding` BOOLEAN, `furn_set` CHAR, `side_count` INT, `handle_side` INT, `open_type` CHAR, `name_short` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_open_tunes` JSON, `ts_specification` JSON, `ts_selection_params` JSON, `ts_specification_restrictions` JSON, `ts_colors` JSON); CREATE TABLE IF NOT EXISTS `cat_cnns` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `priority` INT, `amin` INT, `amax` INT, `sd1` CHAR, `sd2` CHAR, `sz` FLOAT, `cnn_type` CHAR, `ahmin` INT, `ahmax` INT, `lmin` INT, `lmax` INT, `tmin` INT, `tmax` INT, `var_layers` BOOLEAN, `for_direct_profile_only` INT, `art1vert` BOOLEAN, `art1glass` BOOLEAN, `art2glass` BOOLEAN, `predefined_name` CHAR, `ts_specification` JSON, `ts_cnn_elmnts` JSON, `ts_selection_params` JSON); CREATE TABLE IF NOT EXISTS `cat_delivery_areas` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `country` CHAR, `region` CHAR, `city` CHAR, `latitude` FLOAT, `longitude` FLOAT, `ind` CHAR, `delivery_area` CHAR, `specify_area_by_geocoder` BOOLEAN, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_users_acl` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `prefix` CHAR, `predefined_name` CHAR, `owner` CHAR, `ts_acl_objs` JSON); CREATE TABLE IF NOT EXISTS `cat_production_params` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `default_clr` CHAR, `allow_open_cnn` BOOLEAN, `clr_group` CHAR, `is_drainage` BOOLEAN, `tmin` INT, `tmax` INT, `lay_split_type` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_elmnts` JSON, `ts_production` JSON, `ts_product_params` JSON, `ts_furn_params` JSON, `ts_colors` JSON, `ts_base_blocks` JSON); CREATE TABLE IF NOT EXISTS `cat_parameters_keys` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `КоличествоПараметров` INT, `predefined_name` CHAR, `ts_params` JSON); CREATE TABLE IF NOT EXISTS `cat_inserts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `insert_type` CHAR, `clr` CHAR, `priority` INT, `lmin` INT, `lmax` INT, `hmin` INT, `hmax` INT, `smin` FLOAT, `smax` FLOAT, `for_direct_profile_only` INT, `ahmin` INT, `ahmax` INT, `mmin` INT, `mmax` INT, `insert_glass_type` CHAR, `impost_fixation` CHAR, `shtulp_fixation` BOOLEAN, `can_rotate` BOOLEAN, `sizeb` FLOAT, `predefined_name` CHAR, `ts_specification` JSON, `ts_selection_params` JSON); CREATE TABLE IF NOT EXISTS `cat_organizations` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `prefix` CHAR, `individual_legal` CHAR, `individual_entrepreneur` CHAR, `inn` CHAR, `kpp` CHAR, `main_bank_account` CHAR, `main_cashbox` CHAR, `certificate_series_number` CHAR, `certificate_date_issue` Date, `certificate_authority_name` CHAR, `certificate_authority_code` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_contact_information` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_nom` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `article` CHAR, `name_full` CHAR, `base_unit` CHAR, `storage_unit` CHAR, `nom_kind` CHAR, `nom_group` CHAR, `vat_rate` CHAR, `note` CHAR, `price_group` CHAR, `elm_type` CHAR, `len` FLOAT, `width` FLOAT, `thickness` FLOAT, `sizefurn` FLOAT, `sizefaltz` FLOAT, `density` FLOAT, `volume` FLOAT, `arc_elongation` FLOAT, `loss_factor` FLOAT, `rounding_quantity` INT, `clr` CHAR, `cutting_optimization_type` CHAR, `saw_width` FLOAT, `double_cut` INT, `overmeasure` FLOAT, `coloration_area` FLOAT, `pricing` CHAR, `visualization` CHAR, `complete_list_sorting` INT, `is_accessory` BOOLEAN, `is_procedure` BOOLEAN, `is_service` BOOLEAN, `is_pieces` BOOLEAN, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_partners` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `main_bank_account` CHAR, `note` CHAR, `kpp` CHAR, `okpo` CHAR, `inn` CHAR, `individual_legal` CHAR, `main_contract` CHAR, `identification_document` CHAR, `buyer_main_manager` CHAR, `is_buyer` BOOLEAN, `is_supplier` BOOLEAN, `primary_contact` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_contact_information` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_units` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `international_short` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_cashboxes` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `funds_currency` CHAR, `department` CHAR, `current_account` CHAR, `predefined_name` CHAR, `owner` CHAR); CREATE TABLE IF NOT EXISTS `cat_meta_ids` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `full_moniker` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_property_values` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `heft` FLOAT, `ПолноеНаименование` CHAR, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_nom_units` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `qualifier_unit` CHAR, `heft` FLOAT, `volume` FLOAT, `coefficient` FLOAT, `rounding_threshold` INT, `ПредупреждатьОНецелыхМестах` BOOLEAN, `predefined_name` CHAR, `owner` CHAR, `owner_T` CHAR); CREATE TABLE IF NOT EXISTS `cat_contracts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `settlements_currency` CHAR, `mutual_settlements` CHAR, `contract_kind` CHAR, `date` Date, `check_days_without_pay` BOOLEAN, `allowable_debts_amount` FLOAT, `allowable_debts_days` INT, `note` CHAR, `check_debts_amount` BOOLEAN, `check_debts_days` BOOLEAN, `number_doc` CHAR, `organization` CHAR, `main_cash_flow_article` CHAR, `main_project` CHAR, `accounting_reflect` BOOLEAN, `tax_accounting_reflect` BOOLEAN, `prepayment_percent` FLOAT, `validity` Date, `vat_included` BOOLEAN, `price_type` CHAR, `vat_consider` BOOLEAN, `days_without_pay` INT, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_nom_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `nom_type` CHAR, `НаборСвойствНоменклатура` CHAR, `НаборСвойствХарактеристика` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_contact_information_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `ВидПоляДругое` CHAR, `Используется` BOOLEAN, `mandatory_fields` BOOLEAN, `type` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_currencies` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `extra_charge` FLOAT, `main_currency` CHAR, `parameters_russian_recipe` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_elm_visualization` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `svg_path` CHAR, `note` CHAR, `attributes` CHAR, `rotate` INT, `offset` INT, `side` CHAR, `elm_side` INT, `cx` INT, `cy` INT, `angle_hor` INT, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_formulas` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `formula` CHAR, `leading_formula` CHAR, `condition_formula` BOOLEAN, `definition` CHAR, `template` CHAR, `zone` INT, `predefined_name` CHAR, `parent` CHAR, `ts_params` JSON); CREATE TABLE IF NOT EXISTS `cat_countries` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `alpha2` CHAR, `alpha3` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_work_centers` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `work_center_kind` CHAR, `КоэффициентВремениРаботы` FLOAT, `МаксимальнаяЗагрузка` FLOAT, `calendar` CHAR, `definition` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_destinations` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `КоличествоРеквизитов` CHAR, `КоличествоСведений` CHAR, `Используется` BOOLEAN, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON, `ts_extra_properties` JSON); CREATE TABLE IF NOT EXISTS `cat_banks_qualifier` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `correspondent_account` CHAR, `city` CHAR, `address` CHAR, `phone_numbers` CHAR, `activity_ceased` BOOLEAN, `swift` CHAR, `inn` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_property_values_hierarchy` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `heft` FLOAT, `ПолноеНаименование` CHAR, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_work_center_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `department` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_organization_bank_accounts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `bank` CHAR, `bank_bic` CHAR, `funds_currency` CHAR, `account_number` CHAR, `settlements_bank` CHAR, `settlements_bank_bic` CHAR, `department` CHAR, `predefined_name` CHAR, `owner` CHAR); CREATE TABLE IF NOT EXISTS `cat_partner_bank_accounts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `account_number` CHAR, `bank` CHAR, `settlements_bank` CHAR, `correspondent_text` CHAR, `appointments_text` CHAR, `funds_currency` CHAR, `bank_bic` CHAR, `bank_name` CHAR, `bank_correspondent_account` CHAR, `bank_city` CHAR, `bank_address` CHAR, `bank_phone_numbers` CHAR, `settlements_bank_bic` CHAR, `settlements_bank_correspondent_account` CHAR, `settlements_bank_city` CHAR, `predefined_name` CHAR, `owner` CHAR, `owner_T` CHAR); CREATE TABLE IF NOT EXISTS `cat_params_links` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `master` CHAR, `slave` CHAR, `zone` INT, `predefined_name` CHAR, `ts_values` JSON); CREATE TABLE IF NOT EXISTS `cch_properties` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `shown` BOOLEAN, `extra_values_owner` CHAR, `available` BOOLEAN, `caption` CHAR, `mandatory` BOOLEAN, `note` CHAR, `destination` CHAR, `tooltip` CHAR, `is_extra_property` BOOLEAN, `list` BOOLEAN, `predefined_name` CHAR, `type` JSON, `ts_extra_fields_dependencies` JSON); CREATE TABLE IF NOT EXISTS `cch_predefined_elmnts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `value` CHAR, `value_T` CHAR, `definition` CHAR, `synonym` CHAR, `list` INT, `zone` INT, `predefined_name` CHAR, `parent` CHAR, `type` CHAR, `ts_elmnts` JSON); CREATE TABLE IF NOT EXISTS `enm_individual_legal` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_nom_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_contact_information_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_vat_rates` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_buyers_order_states` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_gender` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_positions` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_elm_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_cnn_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_sz_line_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_open_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_cutting_optimization_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_lay_split_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_inserts_glass_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_inserts_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_cnn_sides` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_specification_installation_methods` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_angle_calculating_ways` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_count_calculating_ways` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_simple_complex_all` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_orientations` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_plan_limit` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_open_directions` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_color_groups_destination` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_text_aligns` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_contraction_options` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_offset_options` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_transfer_operations_options` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_order_categories` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_caching_type` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_obj_delivery_states` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_contract_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_mutual_contract_settlements` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_impost_mount_options` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_inset_attrs_options` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `enm_accumulation_record_type` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); ', []);

$p.md.create_managers=function(){
$p.enm.accumulation_record_type = new $p.EnumManager('enm.accumulation_record_type');
$p.enm.inset_attrs_options = new $p.EnumManager('enm.inset_attrs_options');
$p.enm.impost_mount_options = new $p.EnumManager('enm.impost_mount_options');
$p.enm.mutual_contract_settlements = new $p.EnumManager('enm.mutual_contract_settlements');
$p.enm.contract_kinds = new $p.EnumManager('enm.contract_kinds');
$p.enm.obj_delivery_states = new $p.EnumManager('enm.obj_delivery_states');
$p.enm.caching_type = new $p.EnumManager('enm.caching_type');
$p.enm.order_categories = new $p.EnumManager('enm.order_categories');
$p.enm.transfer_operations_options = new $p.EnumManager('enm.transfer_operations_options');
$p.enm.offset_options = new $p.EnumManager('enm.offset_options');
$p.enm.contraction_options = new $p.EnumManager('enm.contraction_options');
$p.enm.text_aligns = new $p.EnumManager('enm.text_aligns');
$p.enm.color_groups_destination = new $p.EnumManager('enm.color_groups_destination');
$p.enm.open_directions = new $p.EnumManager('enm.open_directions');
$p.enm.plan_limit = new $p.EnumManager('enm.plan_limit');
$p.enm.orientations = new $p.EnumManager('enm.orientations');
$p.enm.simple_complex_all = new $p.EnumManager('enm.simple_complex_all');
$p.enm.count_calculating_ways = new $p.EnumManager('enm.count_calculating_ways');
$p.enm.angle_calculating_ways = new $p.EnumManager('enm.angle_calculating_ways');
$p.enm.specification_installation_methods = new $p.EnumManager('enm.specification_installation_methods');
$p.enm.cnn_sides = new $p.EnumManager('enm.cnn_sides');
$p.enm.inserts_types = new $p.EnumManager('enm.inserts_types');
$p.enm.inserts_glass_types = new $p.EnumManager('enm.inserts_glass_types');
$p.enm.lay_split_types = new $p.EnumManager('enm.lay_split_types');
$p.enm.cutting_optimization_types = new $p.EnumManager('enm.cutting_optimization_types');
$p.enm.open_types = new $p.EnumManager('enm.open_types');
$p.enm.sz_line_types = new $p.EnumManager('enm.sz_line_types');
$p.enm.cnn_types = new $p.EnumManager('enm.cnn_types');
$p.enm.elm_types = new $p.EnumManager('enm.elm_types');
$p.enm.positions = new $p.EnumManager('enm.positions');
$p.enm.gender = new $p.EnumManager('enm.gender');
$p.enm.buyers_order_states = new $p.EnumManager('enm.buyers_order_states');
$p.enm.vat_rates = new $p.EnumManager('enm.vat_rates');
$p.enm.contact_information_types = new $p.EnumManager('enm.contact_information_types');
$p.enm.nom_types = new $p.EnumManager('enm.nom_types');
$p.enm.individual_legal = new $p.EnumManager('enm.individual_legal');

/**
* ### План видов характеристик ПредопределенныеЭлементы
* Хранит значения настроек и параметров подсистем
* @class CchPredefined_elmnts
* @extends CatObj
* @constructor 
*/
function CchPredefined_elmnts(attr, manager){CchPredefined_elmnts.superclass.constructor.call(this, attr, manager)}
CchPredefined_elmnts._extend($p.CatObj);
$p.CchPredefined_elmnts = CchPredefined_elmnts;
CchPredefined_elmnts.prototype.__define({value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
definition: {get: function(){return this._getter('definition')}, set: function(v){this._setter('definition',v)}, enumerable: true, configurable: true},
synonym: {get: function(){return this._getter('synonym')}, set: function(v){this._setter('synonym',v)}, enumerable: true, configurable: true},
list: {get: function(){return this._getter('list')}, set: function(v){this._setter('list',v)}, enumerable: true, configurable: true},
zone: {get: function(){return this._getter('zone')}, set: function(v){this._setter('zone',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
type: {get: function(){return this._getter('type')}, set: function(v){this._setter('type',v)}, enumerable: true, configurable: true}});
function CchPredefined_elmntsElmntsRow(owner){CchPredefined_elmntsElmntsRow.superclass.constructor.call(this, owner)};
CchPredefined_elmntsElmntsRow._extend($p.TabularSectionRow);
$p.CchPredefined_elmntsElmntsRow = CchPredefined_elmntsElmntsRow;
CchPredefined_elmntsElmntsRow.prototype.__define({value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true}});
CchPredefined_elmnts.prototype.__define('elmnts', {get: function(){return this._getter_ts('elmnts')}, set: function(v){this._setter_ts('elmnts',v)}, enumerable: true, configurable: true});
$p.cch.predefined_elmnts = new $p.ChartOfCharacteristicManager('cch.predefined_elmnts');

/**
* ### План видов характеристик ДополнительныеРеквизитыИСведения
* Дополнительные реквизиты и сведения
* @class CchProperties
* @extends CatObj
* @constructor 
*/
function CchProperties(attr, manager){CchProperties.superclass.constructor.call(this, attr, manager)}
CchProperties._extend($p.CatObj);
$p.CchProperties = CchProperties;
CchProperties.prototype.__define({shown: {get: function(){return this._getter('shown')}, set: function(v){this._setter('shown',v)}, enumerable: true, configurable: true},
extra_values_owner: {get: function(){return this._getter('extra_values_owner')}, set: function(v){this._setter('extra_values_owner',v)}, enumerable: true, configurable: true},
available: {get: function(){return this._getter('available')}, set: function(v){this._setter('available',v)}, enumerable: true, configurable: true},
caption: {get: function(){return this._getter('caption')}, set: function(v){this._setter('caption',v)}, enumerable: true, configurable: true},
mandatory: {get: function(){return this._getter('mandatory')}, set: function(v){this._setter('mandatory',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
destination: {get: function(){return this._getter('destination')}, set: function(v){this._setter('destination',v)}, enumerable: true, configurable: true},
tooltip: {get: function(){return this._getter('tooltip')}, set: function(v){this._setter('tooltip',v)}, enumerable: true, configurable: true},
is_extra_property: {get: function(){return this._getter('is_extra_property')}, set: function(v){this._setter('is_extra_property',v)}, enumerable: true, configurable: true},
list: {get: function(){return this._getter('list')}, set: function(v){this._setter('list',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
type: {get: function(){return this._getter('type')}, set: function(v){this._setter('type',v)}, enumerable: true, configurable: true}});
function CchPropertiesExtra_fields_dependenciesRow(owner){CchPropertiesExtra_fields_dependenciesRow.superclass.constructor.call(this, owner)};
CchPropertiesExtra_fields_dependenciesRow._extend($p.TabularSectionRow);
$p.CchPropertiesExtra_fields_dependenciesRow = CchPropertiesExtra_fields_dependenciesRow;
CchPropertiesExtra_fields_dependenciesRow.prototype.__define({ЗависимоеСвойство: {get: function(){return this._getter('ЗависимоеСвойство')}, set: function(v){this._setter('ЗависимоеСвойство',v)}, enumerable: true, configurable: true},
field: {get: function(){return this._getter('field')}, set: function(v){this._setter('field',v)}, enumerable: true, configurable: true},
condition: {get: function(){return this._getter('condition')}, set: function(v){this._setter('condition',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true}});
CchProperties.prototype.__define('extra_fields_dependencies', {get: function(){return this._getter_ts('extra_fields_dependencies')}, set: function(v){this._setter_ts('extra_fields_dependencies',v)}, enumerable: true, configurable: true});
$p.cch.properties = new $p.ChartOfCharacteristicManager('cch.properties');

/**
* ### Справочник пзСвязиПараметров
* Подчиненные параметры
* @class CatParams_links
* @extends CatObj
* @constructor 
*/
function CatParams_links(attr, manager){CatParams_links.superclass.constructor.call(this, attr, manager)}
CatParams_links._extend($p.CatObj);
$p.CatParams_links = CatParams_links;
CatParams_links.prototype.__define({master: {get: function(){return this._getter('master')}, set: function(v){this._setter('master',v)}, enumerable: true, configurable: true},
slave: {get: function(){return this._getter('slave')}, set: function(v){this._setter('slave',v)}, enumerable: true, configurable: true},
zone: {get: function(){return this._getter('zone')}, set: function(v){this._setter('zone',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
function CatParams_linksValuesRow(owner){CatParams_linksValuesRow.superclass.constructor.call(this, owner)};
CatParams_linksValuesRow._extend($p.TabularSectionRow);
$p.CatParams_linksValuesRow = CatParams_linksValuesRow;
CatParams_linksValuesRow.prototype.__define({value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
by_default: {get: function(){return this._getter('by_default')}, set: function(v){this._setter('by_default',v)}, enumerable: true, configurable: true}});
CatParams_links.prototype.__define('values', {get: function(){return this._getter_ts('values')}, set: function(v){this._setter_ts('values',v)}, enumerable: true, configurable: true});
$p.cat.params_links = new $p.CatManager('cat.params_links');

/**
* ### Справочник БанковскиеСчетаКонтрагентов
* Банковские счета сторонних контрагентов и физических лиц.
* @class CatPartner_bank_accounts
* @extends CatObj
* @constructor 
*/
function CatPartner_bank_accounts(attr, manager){CatPartner_bank_accounts.superclass.constructor.call(this, attr, manager)}
CatPartner_bank_accounts._extend($p.CatObj);
$p.CatPartner_bank_accounts = CatPartner_bank_accounts;
CatPartner_bank_accounts.prototype.__define({account_number: {get: function(){return this._getter('account_number')}, set: function(v){this._setter('account_number',v)}, enumerable: true, configurable: true},
bank: {get: function(){return this._getter('bank')}, set: function(v){this._setter('bank',v)}, enumerable: true, configurable: true},
settlements_bank: {get: function(){return this._getter('settlements_bank')}, set: function(v){this._setter('settlements_bank',v)}, enumerable: true, configurable: true},
correspondent_text: {get: function(){return this._getter('correspondent_text')}, set: function(v){this._setter('correspondent_text',v)}, enumerable: true, configurable: true},
appointments_text: {get: function(){return this._getter('appointments_text')}, set: function(v){this._setter('appointments_text',v)}, enumerable: true, configurable: true},
funds_currency: {get: function(){return this._getter('funds_currency')}, set: function(v){this._setter('funds_currency',v)}, enumerable: true, configurable: true},
bank_bic: {get: function(){return this._getter('bank_bic')}, set: function(v){this._setter('bank_bic',v)}, enumerable: true, configurable: true},
bank_name: {get: function(){return this._getter('bank_name')}, set: function(v){this._setter('bank_name',v)}, enumerable: true, configurable: true},
bank_correspondent_account: {get: function(){return this._getter('bank_correspondent_account')}, set: function(v){this._setter('bank_correspondent_account',v)}, enumerable: true, configurable: true},
bank_city: {get: function(){return this._getter('bank_city')}, set: function(v){this._setter('bank_city',v)}, enumerable: true, configurable: true},
bank_address: {get: function(){return this._getter('bank_address')}, set: function(v){this._setter('bank_address',v)}, enumerable: true, configurable: true},
bank_phone_numbers: {get: function(){return this._getter('bank_phone_numbers')}, set: function(v){this._setter('bank_phone_numbers',v)}, enumerable: true, configurable: true},
settlements_bank_bic: {get: function(){return this._getter('settlements_bank_bic')}, set: function(v){this._setter('settlements_bank_bic',v)}, enumerable: true, configurable: true},
settlements_bank_correspondent_account: {get: function(){return this._getter('settlements_bank_correspondent_account')}, set: function(v){this._setter('settlements_bank_correspondent_account',v)}, enumerable: true, configurable: true},
settlements_bank_city: {get: function(){return this._getter('settlements_bank_city')}, set: function(v){this._setter('settlements_bank_city',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
owner: {get: function(){return this._getter('owner')}, set: function(v){this._setter('owner',v)}, enumerable: true, configurable: true}});
$p.cat.partner_bank_accounts = new $p.CatManager('cat.partner_bank_accounts');

/**
* ### Справочник БанковскиеСчетаОрганизаций
* Банковские счета собственных организаций. 
* @class CatOrganization_bank_accounts
* @extends CatObj
* @constructor 
*/
function CatOrganization_bank_accounts(attr, manager){CatOrganization_bank_accounts.superclass.constructor.call(this, attr, manager)}
CatOrganization_bank_accounts._extend($p.CatObj);
$p.CatOrganization_bank_accounts = CatOrganization_bank_accounts;
CatOrganization_bank_accounts.prototype.__define({bank: {get: function(){return this._getter('bank')}, set: function(v){this._setter('bank',v)}, enumerable: true, configurable: true},
bank_bic: {get: function(){return this._getter('bank_bic')}, set: function(v){this._setter('bank_bic',v)}, enumerable: true, configurable: true},
funds_currency: {get: function(){return this._getter('funds_currency')}, set: function(v){this._setter('funds_currency',v)}, enumerable: true, configurable: true},
account_number: {get: function(){return this._getter('account_number')}, set: function(v){this._setter('account_number',v)}, enumerable: true, configurable: true},
settlements_bank: {get: function(){return this._getter('settlements_bank')}, set: function(v){this._setter('settlements_bank',v)}, enumerable: true, configurable: true},
settlements_bank_bic: {get: function(){return this._getter('settlements_bank_bic')}, set: function(v){this._setter('settlements_bank_bic',v)}, enumerable: true, configurable: true},
department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
owner: {get: function(){return this._getter('owner')}, set: function(v){this._setter('owner',v)}, enumerable: true, configurable: true}});
$p.cat.organization_bank_accounts = new $p.CatManager('cat.organization_bank_accounts');

/**
* ### Справочник ВидыРабочихЦентров
* Виды рабочих центров
* @class CatWork_center_kinds
* @extends CatObj
* @constructor 
*/
function CatWork_center_kinds(attr, manager){CatWork_center_kinds.superclass.constructor.call(this, attr, manager)}
CatWork_center_kinds._extend($p.CatObj);
$p.CatWork_center_kinds = CatWork_center_kinds;
CatWork_center_kinds.prototype.__define({department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
$p.cat.work_center_kinds = new $p.CatManager('cat.work_center_kinds');

/**
* ### Справочник ЗначенияСвойствОбъектовИерархия
* Дополнительные значения (иерархия)
* @class CatProperty_values_hierarchy
* @extends CatObj
* @constructor 
*/
function CatProperty_values_hierarchy(attr, manager){CatProperty_values_hierarchy.superclass.constructor.call(this, attr, manager)}
CatProperty_values_hierarchy._extend($p.CatObj);
$p.CatProperty_values_hierarchy = CatProperty_values_hierarchy;
CatProperty_values_hierarchy.prototype.__define({heft: {get: function(){return this._getter('heft')}, set: function(v){this._setter('heft',v)}, enumerable: true, configurable: true},
ПолноеНаименование: {get: function(){return this._getter('ПолноеНаименование')}, set: function(v){this._setter('ПолноеНаименование',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
owner: {get: function(){return this._getter('owner')}, set: function(v){this._setter('owner',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
$p.cat.property_values_hierarchy = new $p.CatManager('cat.property_values_hierarchy');

/**
* ### Справочник КлассификаторБанковРФ
* Классификатор банков РФ
* @class CatBanks_qualifier
* @extends CatObj
* @constructor 
*/
function CatBanks_qualifier(attr, manager){CatBanks_qualifier.superclass.constructor.call(this, attr, manager)}
CatBanks_qualifier._extend($p.CatObj);
$p.CatBanks_qualifier = CatBanks_qualifier;
CatBanks_qualifier.prototype.__define({correspondent_account: {get: function(){return this._getter('correspondent_account')}, set: function(v){this._setter('correspondent_account',v)}, enumerable: true, configurable: true},
city: {get: function(){return this._getter('city')}, set: function(v){this._setter('city',v)}, enumerable: true, configurable: true},
address: {get: function(){return this._getter('address')}, set: function(v){this._setter('address',v)}, enumerable: true, configurable: true},
phone_numbers: {get: function(){return this._getter('phone_numbers')}, set: function(v){this._setter('phone_numbers',v)}, enumerable: true, configurable: true},
activity_ceased: {get: function(){return this._getter('activity_ceased')}, set: function(v){this._setter('activity_ceased',v)}, enumerable: true, configurable: true},
swift: {get: function(){return this._getter('swift')}, set: function(v){this._setter('swift',v)}, enumerable: true, configurable: true},
inn: {get: function(){return this._getter('inn')}, set: function(v){this._setter('inn',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
$p.cat.banks_qualifier = new $p.CatManager('cat.banks_qualifier');

/**
* ### Справочник НаборыДополнительныхРеквизитовИСведений
* Наборы дополнительных реквизитов и сведений
* @class CatDestinations
* @extends CatObj
* @constructor 
*/
function CatDestinations(attr, manager){CatDestinations.superclass.constructor.call(this, attr, manager)}
CatDestinations._extend($p.CatObj);
$p.CatDestinations = CatDestinations;
CatDestinations.prototype.__define({КоличествоРеквизитов: {get: function(){return this._getter('КоличествоРеквизитов')}, set: function(v){this._setter('КоличествоРеквизитов',v)}, enumerable: true, configurable: true},
КоличествоСведений: {get: function(){return this._getter('КоличествоСведений')}, set: function(v){this._setter('КоличествоСведений',v)}, enumerable: true, configurable: true},
Используется: {get: function(){return this._getter('Используется')}, set: function(v){this._setter('Используется',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
function CatDestinationsExtra_fieldsRow(owner){CatDestinationsExtra_fieldsRow.superclass.constructor.call(this, owner)};
CatDestinationsExtra_fieldsRow._extend($p.TabularSectionRow);
$p.CatDestinationsExtra_fieldsRow = CatDestinationsExtra_fieldsRow;
CatDestinationsExtra_fieldsRow.prototype.__define({property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
_deleted: {get: function(){return this._getter('_deleted')}, set: function(v){this._setter('_deleted',v)}, enumerable: true, configurable: true}});
CatDestinations.prototype.__define('extra_fields', {get: function(){return this._getter_ts('extra_fields')}, set: function(v){this._setter_ts('extra_fields',v)}, enumerable: true, configurable: true});
function CatDestinationsExtra_propertiesRow(owner){CatDestinationsExtra_propertiesRow.superclass.constructor.call(this, owner)};
CatDestinationsExtra_propertiesRow._extend($p.TabularSectionRow);
$p.CatDestinationsExtra_propertiesRow = CatDestinationsExtra_propertiesRow;
CatDestinationsExtra_propertiesRow.prototype.__define({property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
_deleted: {get: function(){return this._getter('_deleted')}, set: function(v){this._setter('_deleted',v)}, enumerable: true, configurable: true},
property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
_deleted: {get: function(){return this._getter('_deleted')}, set: function(v){this._setter('_deleted',v)}, enumerable: true, configurable: true}});
CatDestinations.prototype.__define('extra_properties', {get: function(){return this._getter_ts('extra_properties')}, set: function(v){this._setter_ts('extra_properties',v)}, enumerable: true, configurable: true});
$p.cat.destinations = new $p.CatManager('cat.destinations');

/**
* ### Справочник РабочиеЦентры
* Рабочие центры
* @class CatWork_centers
* @extends CatObj
* @constructor 
*/
function CatWork_centers(attr, manager){CatWork_centers.superclass.constructor.call(this, attr, manager)}
CatWork_centers._extend($p.CatObj);
$p.CatWork_centers = CatWork_centers;
CatWork_centers.prototype.__define({work_center_kind: {get: function(){return this._getter('work_center_kind')}, set: function(v){this._setter('work_center_kind',v)}, enumerable: true, configurable: true},
КоэффициентВремениРаботы: {get: function(){return this._getter('КоэффициентВремениРаботы')}, set: function(v){this._setter('КоэффициентВремениРаботы',v)}, enumerable: true, configurable: true},
МаксимальнаяЗагрузка: {get: function(){return this._getter('МаксимальнаяЗагрузка')}, set: function(v){this._setter('МаксимальнаяЗагрузка',v)}, enumerable: true, configurable: true},
calendar: {get: function(){return this._getter('calendar')}, set: function(v){this._setter('calendar',v)}, enumerable: true, configurable: true},
definition: {get: function(){return this._getter('definition')}, set: function(v){this._setter('definition',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
$p.cat.work_centers = new $p.CatManager('cat.work_centers');

/**
* ### Справочник СтраныМира
* Страны мира
* @class CatCountries
* @extends CatObj
* @constructor 
*/
function CatCountries(attr, manager){CatCountries.superclass.constructor.call(this, attr, manager)}
CatCountries._extend($p.CatObj);
$p.CatCountries = CatCountries;
CatCountries.prototype.__define({name_full: {get: function(){return this._getter('name_full')}, set: function(v){this._setter('name_full',v)}, enumerable: true, configurable: true},
alpha2: {get: function(){return this._getter('alpha2')}, set: function(v){this._setter('alpha2',v)}, enumerable: true, configurable: true},
alpha3: {get: function(){return this._getter('alpha3')}, set: function(v){this._setter('alpha3',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
$p.cat.countries = new $p.CatManager('cat.countries');

/**
* ### Справочник Формулы
* Формулы пользователя, для выполнения при расчете спецификаций в справочниках Вставки, Соединения, Фурнитура и регистре Корректировки спецификации
* @class CatFormulas
* @extends CatObj
* @constructor 
*/
function CatFormulas(attr, manager){CatFormulas.superclass.constructor.call(this, attr, manager)}
CatFormulas._extend($p.CatObj);
$p.CatFormulas = CatFormulas;
CatFormulas.prototype.__define({formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
leading_formula: {get: function(){return this._getter('leading_formula')}, set: function(v){this._setter('leading_formula',v)}, enumerable: true, configurable: true},
condition_formula: {get: function(){return this._getter('condition_formula')}, set: function(v){this._setter('condition_formula',v)}, enumerable: true, configurable: true},
definition: {get: function(){return this._getter('definition')}, set: function(v){this._setter('definition',v)}, enumerable: true, configurable: true},
template: {get: function(){return this._getter('template')}, set: function(v){this._setter('template',v)}, enumerable: true, configurable: true},
zone: {get: function(){return this._getter('zone')}, set: function(v){this._setter('zone',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
function CatFormulasParamsRow(owner){CatFormulasParamsRow.superclass.constructor.call(this, owner)};
CatFormulasParamsRow._extend($p.TabularSectionRow);
$p.CatFormulasParamsRow = CatFormulasParamsRow;
CatFormulasParamsRow.prototype.__define({param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true}});
CatFormulas.prototype.__define('params', {get: function(){return this._getter_ts('params')}, set: function(v){this._setter_ts('params',v)}, enumerable: true, configurable: true});
$p.cat.formulas = new $p.CatManager('cat.formulas');

/**
* ### Справочник пзВизуализацияЭлементов
* Строки svg для рисования петель, ручек и графических примитивов
* @class CatElm_visualization
* @extends CatObj
* @constructor 
*/
function CatElm_visualization(attr, manager){CatElm_visualization.superclass.constructor.call(this, attr, manager)}
CatElm_visualization._extend($p.CatObj);
$p.CatElm_visualization = CatElm_visualization;
CatElm_visualization.prototype.__define({svg_path: {get: function(){return this._getter('svg_path')}, set: function(v){this._setter('svg_path',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
attributes: {get: function(){return this._getter('attributes')}, set: function(v){this._setter('attributes',v)}, enumerable: true, configurable: true},
rotate: {get: function(){return this._getter('rotate')}, set: function(v){this._setter('rotate',v)}, enumerable: true, configurable: true},
offset: {get: function(){return this._getter('offset')}, set: function(v){this._setter('offset',v)}, enumerable: true, configurable: true},
side: {get: function(){return this._getter('side')}, set: function(v){this._setter('side',v)}, enumerable: true, configurable: true},
elm_side: {get: function(){return this._getter('elm_side')}, set: function(v){this._setter('elm_side',v)}, enumerable: true, configurable: true},
cx: {get: function(){return this._getter('cx')}, set: function(v){this._setter('cx',v)}, enumerable: true, configurable: true},
cy: {get: function(){return this._getter('cy')}, set: function(v){this._setter('cy',v)}, enumerable: true, configurable: true},
angle_hor: {get: function(){return this._getter('angle_hor')}, set: function(v){this._setter('angle_hor',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
$p.cat.elm_visualization = new $p.CatManager('cat.elm_visualization');

/**
* ### Справочник Валюты
* Валюты, используемые при расчетах
* @class CatCurrencies
* @extends CatObj
* @constructor 
*/
function CatCurrencies(attr, manager){CatCurrencies.superclass.constructor.call(this, attr, manager)}
CatCurrencies._extend($p.CatObj);
$p.CatCurrencies = CatCurrencies;
CatCurrencies.prototype.__define({name_full: {get: function(){return this._getter('name_full')}, set: function(v){this._setter('name_full',v)}, enumerable: true, configurable: true},
extra_charge: {get: function(){return this._getter('extra_charge')}, set: function(v){this._setter('extra_charge',v)}, enumerable: true, configurable: true},
main_currency: {get: function(){return this._getter('main_currency')}, set: function(v){this._setter('main_currency',v)}, enumerable: true, configurable: true},
parameters_russian_recipe: {get: function(){return this._getter('parameters_russian_recipe')}, set: function(v){this._setter('parameters_russian_recipe',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
$p.cat.currencies = new $p.CatManager('cat.currencies');

/**
* ### Справочник ВидыКонтактнойИнформации
* Виды контактной информации
* @class CatContact_information_kinds
* @extends CatObj
* @constructor 
*/
function CatContact_information_kinds(attr, manager){CatContact_information_kinds.superclass.constructor.call(this, attr, manager)}
CatContact_information_kinds._extend($p.CatObj);
$p.CatContact_information_kinds = CatContact_information_kinds;
CatContact_information_kinds.prototype.__define({ВидПоляДругое: {get: function(){return this._getter('ВидПоляДругое')}, set: function(v){this._setter('ВидПоляДругое',v)}, enumerable: true, configurable: true},
Используется: {get: function(){return this._getter('Используется')}, set: function(v){this._setter('Используется',v)}, enumerable: true, configurable: true},
mandatory_fields: {get: function(){return this._getter('mandatory_fields')}, set: function(v){this._setter('mandatory_fields',v)}, enumerable: true, configurable: true},
type: {get: function(){return this._getter('type')}, set: function(v){this._setter('type',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
$p.cat.contact_information_kinds = new $p.CatManager('cat.contact_information_kinds');

/**
* ### Справочник ВидыНоменклатуры
* Виды номенклатуры
* @class CatNom_kinds
* @extends CatObj
* @constructor 
*/
function CatNom_kinds(attr, manager){CatNom_kinds.superclass.constructor.call(this, attr, manager)}
CatNom_kinds._extend($p.CatObj);
$p.CatNom_kinds = CatNom_kinds;
CatNom_kinds.prototype.__define({nom_type: {get: function(){return this._getter('nom_type')}, set: function(v){this._setter('nom_type',v)}, enumerable: true, configurable: true},
НаборСвойствНоменклатура: {get: function(){return this._getter('НаборСвойствНоменклатура')}, set: function(v){this._setter('НаборСвойствНоменклатура',v)}, enumerable: true, configurable: true},
НаборСвойствХарактеристика: {get: function(){return this._getter('НаборСвойствХарактеристика')}, set: function(v){this._setter('НаборСвойствХарактеристика',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
$p.cat.nom_kinds = new $p.CatManager('cat.nom_kinds');

/**
* ### Справочник ДоговорыКонтрагентов
* Перечень договоров, заключенных с контрагентами
* @class CatContracts
* @extends CatObj
* @constructor 
*/
function CatContracts(attr, manager){CatContracts.superclass.constructor.call(this, attr, manager)}
CatContracts._extend($p.CatObj);
$p.CatContracts = CatContracts;
CatContracts.prototype.__define({settlements_currency: {get: function(){return this._getter('settlements_currency')}, set: function(v){this._setter('settlements_currency',v)}, enumerable: true, configurable: true},
mutual_settlements: {get: function(){return this._getter('mutual_settlements')}, set: function(v){this._setter('mutual_settlements',v)}, enumerable: true, configurable: true},
contract_kind: {get: function(){return this._getter('contract_kind')}, set: function(v){this._setter('contract_kind',v)}, enumerable: true, configurable: true},
date: {get: function(){return this._getter('date')}, set: function(v){this._setter('date',v)}, enumerable: true, configurable: true},
check_days_without_pay: {get: function(){return this._getter('check_days_without_pay')}, set: function(v){this._setter('check_days_without_pay',v)}, enumerable: true, configurable: true},
allowable_debts_amount: {get: function(){return this._getter('allowable_debts_amount')}, set: function(v){this._setter('allowable_debts_amount',v)}, enumerable: true, configurable: true},
allowable_debts_days: {get: function(){return this._getter('allowable_debts_days')}, set: function(v){this._setter('allowable_debts_days',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
check_debts_amount: {get: function(){return this._getter('check_debts_amount')}, set: function(v){this._setter('check_debts_amount',v)}, enumerable: true, configurable: true},
check_debts_days: {get: function(){return this._getter('check_debts_days')}, set: function(v){this._setter('check_debts_days',v)}, enumerable: true, configurable: true},
number_doc: {get: function(){return this._getter('number_doc')}, set: function(v){this._setter('number_doc',v)}, enumerable: true, configurable: true},
organization: {get: function(){return this._getter('organization')}, set: function(v){this._setter('organization',v)}, enumerable: true, configurable: true},
main_cash_flow_article: {get: function(){return this._getter('main_cash_flow_article')}, set: function(v){this._setter('main_cash_flow_article',v)}, enumerable: true, configurable: true},
main_project: {get: function(){return this._getter('main_project')}, set: function(v){this._setter('main_project',v)}, enumerable: true, configurable: true},
accounting_reflect: {get: function(){return this._getter('accounting_reflect')}, set: function(v){this._setter('accounting_reflect',v)}, enumerable: true, configurable: true},
tax_accounting_reflect: {get: function(){return this._getter('tax_accounting_reflect')}, set: function(v){this._setter('tax_accounting_reflect',v)}, enumerable: true, configurable: true},
prepayment_percent: {get: function(){return this._getter('prepayment_percent')}, set: function(v){this._setter('prepayment_percent',v)}, enumerable: true, configurable: true},
validity: {get: function(){return this._getter('validity')}, set: function(v){this._setter('validity',v)}, enumerable: true, configurable: true},
vat_included: {get: function(){return this._getter('vat_included')}, set: function(v){this._setter('vat_included',v)}, enumerable: true, configurable: true},
price_type: {get: function(){return this._getter('price_type')}, set: function(v){this._setter('price_type',v)}, enumerable: true, configurable: true},
vat_consider: {get: function(){return this._getter('vat_consider')}, set: function(v){this._setter('vat_consider',v)}, enumerable: true, configurable: true},
days_without_pay: {get: function(){return this._getter('days_without_pay')}, set: function(v){this._setter('days_without_pay',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
owner: {get: function(){return this._getter('owner')}, set: function(v){this._setter('owner',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
$p.cat.contracts = new $p.CatManager('cat.contracts');

/**
* ### Справочник ЕдиницыИзмерения
* Перечень единиц измерения номенклатуры и номенклатурных групп
* @class CatNom_units
* @extends CatObj
* @constructor 
*/
function CatNom_units(attr, manager){CatNom_units.superclass.constructor.call(this, attr, manager)}
CatNom_units._extend($p.CatObj);
$p.CatNom_units = CatNom_units;
CatNom_units.prototype.__define({qualifier_unit: {get: function(){return this._getter('qualifier_unit')}, set: function(v){this._setter('qualifier_unit',v)}, enumerable: true, configurable: true},
heft: {get: function(){return this._getter('heft')}, set: function(v){this._setter('heft',v)}, enumerable: true, configurable: true},
volume: {get: function(){return this._getter('volume')}, set: function(v){this._setter('volume',v)}, enumerable: true, configurable: true},
coefficient: {get: function(){return this._getter('coefficient')}, set: function(v){this._setter('coefficient',v)}, enumerable: true, configurable: true},
rounding_threshold: {get: function(){return this._getter('rounding_threshold')}, set: function(v){this._setter('rounding_threshold',v)}, enumerable: true, configurable: true},
ПредупреждатьОНецелыхМестах: {get: function(){return this._getter('ПредупреждатьОНецелыхМестах')}, set: function(v){this._setter('ПредупреждатьОНецелыхМестах',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
owner: {get: function(){return this._getter('owner')}, set: function(v){this._setter('owner',v)}, enumerable: true, configurable: true}});
$p.cat.nom_units = new $p.CatManager('cat.nom_units');

/**
* ### Справочник ЗначенияСвойствОбъектов
* Дополнительные значения
* @class CatProperty_values
* @extends CatObj
* @constructor 
*/
function CatProperty_values(attr, manager){CatProperty_values.superclass.constructor.call(this, attr, manager)}
CatProperty_values._extend($p.CatObj);
$p.CatProperty_values = CatProperty_values;
CatProperty_values.prototype.__define({heft: {get: function(){return this._getter('heft')}, set: function(v){this._setter('heft',v)}, enumerable: true, configurable: true},
ПолноеНаименование: {get: function(){return this._getter('ПолноеНаименование')}, set: function(v){this._setter('ПолноеНаименование',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
owner: {get: function(){return this._getter('owner')}, set: function(v){this._setter('owner',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
$p.cat.property_values = new $p.CatManager('cat.property_values');

/**
* ### Справочник ИдентификаторыОбъектовМетаданных
* Идентификаторы объектов метаданных для использования в базе данных.
* @class CatMeta_ids
* @extends CatObj
* @constructor 
*/
function CatMeta_ids(attr, manager){CatMeta_ids.superclass.constructor.call(this, attr, manager)}
CatMeta_ids._extend($p.CatObj);
$p.CatMeta_ids = CatMeta_ids;
CatMeta_ids.prototype.__define({full_moniker: {get: function(){return this._getter('full_moniker')}, set: function(v){this._setter('full_moniker',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
$p.cat.meta_ids = new $p.CatManager('cat.meta_ids');

/**
* ### Справочник Кассы
* Список мест фактического хранения и движения наличных денежных средств предприятия. Кассы разделены по организациям и валютам денежных средств. 
* @class CatCashboxes
* @extends CatObj
* @constructor 
*/
function CatCashboxes(attr, manager){CatCashboxes.superclass.constructor.call(this, attr, manager)}
CatCashboxes._extend($p.CatObj);
$p.CatCashboxes = CatCashboxes;
CatCashboxes.prototype.__define({funds_currency: {get: function(){return this._getter('funds_currency')}, set: function(v){this._setter('funds_currency',v)}, enumerable: true, configurable: true},
department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
current_account: {get: function(){return this._getter('current_account')}, set: function(v){this._setter('current_account',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
owner: {get: function(){return this._getter('owner')}, set: function(v){this._setter('owner',v)}, enumerable: true, configurable: true}});
$p.cat.cashboxes = new $p.CatManager('cat.cashboxes');

/**
* ### Справочник КлассификаторЕдиницИзмерения
* Классификатор единиц измерения
* @class CatUnits
* @extends CatObj
* @constructor 
*/
function CatUnits(attr, manager){CatUnits.superclass.constructor.call(this, attr, manager)}
CatUnits._extend($p.CatObj);
$p.CatUnits = CatUnits;
CatUnits.prototype.__define({name_full: {get: function(){return this._getter('name_full')}, set: function(v){this._setter('name_full',v)}, enumerable: true, configurable: true},
international_short: {get: function(){return this._getter('international_short')}, set: function(v){this._setter('international_short',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
$p.cat.units = new $p.CatManager('cat.units');

/**
* ### Справочник Контрагенты
* Список юридических или физических лиц клиентов (поставщиков, покупателей).
* @class CatPartners
* @extends CatObj
* @constructor 
*/
function CatPartners(attr, manager){CatPartners.superclass.constructor.call(this, attr, manager)}
CatPartners._extend($p.CatObj);
$p.CatPartners = CatPartners;
CatPartners.prototype.__define({name_full: {get: function(){return this._getter('name_full')}, set: function(v){this._setter('name_full',v)}, enumerable: true, configurable: true},
main_bank_account: {get: function(){return this._getter('main_bank_account')}, set: function(v){this._setter('main_bank_account',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
kpp: {get: function(){return this._getter('kpp')}, set: function(v){this._setter('kpp',v)}, enumerable: true, configurable: true},
okpo: {get: function(){return this._getter('okpo')}, set: function(v){this._setter('okpo',v)}, enumerable: true, configurable: true},
inn: {get: function(){return this._getter('inn')}, set: function(v){this._setter('inn',v)}, enumerable: true, configurable: true},
individual_legal: {get: function(){return this._getter('individual_legal')}, set: function(v){this._setter('individual_legal',v)}, enumerable: true, configurable: true},
main_contract: {get: function(){return this._getter('main_contract')}, set: function(v){this._setter('main_contract',v)}, enumerable: true, configurable: true},
identification_document: {get: function(){return this._getter('identification_document')}, set: function(v){this._setter('identification_document',v)}, enumerable: true, configurable: true},
buyer_main_manager: {get: function(){return this._getter('buyer_main_manager')}, set: function(v){this._setter('buyer_main_manager',v)}, enumerable: true, configurable: true},
is_buyer: {get: function(){return this._getter('is_buyer')}, set: function(v){this._setter('is_buyer',v)}, enumerable: true, configurable: true},
is_supplier: {get: function(){return this._getter('is_supplier')}, set: function(v){this._setter('is_supplier',v)}, enumerable: true, configurable: true},
primary_contact: {get: function(){return this._getter('primary_contact')}, set: function(v){this._setter('primary_contact',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
function CatPartnersContact_informationRow(owner){CatPartnersContact_informationRow.superclass.constructor.call(this, owner)};
CatPartnersContact_informationRow._extend($p.TabularSectionRow);
$p.CatPartnersContact_informationRow = CatPartnersContact_informationRow;
CatPartnersContact_informationRow.prototype.__define({type: {get: function(){return this._getter('type')}, set: function(v){this._setter('type',v)}, enumerable: true, configurable: true},
kind: {get: function(){return this._getter('kind')}, set: function(v){this._setter('kind',v)}, enumerable: true, configurable: true},
presentation: {get: function(){return this._getter('presentation')}, set: function(v){this._setter('presentation',v)}, enumerable: true, configurable: true},
values_fields: {get: function(){return this._getter('values_fields')}, set: function(v){this._setter('values_fields',v)}, enumerable: true, configurable: true},
country: {get: function(){return this._getter('country')}, set: function(v){this._setter('country',v)}, enumerable: true, configurable: true},
region: {get: function(){return this._getter('region')}, set: function(v){this._setter('region',v)}, enumerable: true, configurable: true},
city: {get: function(){return this._getter('city')}, set: function(v){this._setter('city',v)}, enumerable: true, configurable: true},
email_address: {get: function(){return this._getter('email_address')}, set: function(v){this._setter('email_address',v)}, enumerable: true, configurable: true},
server_domain_name: {get: function(){return this._getter('server_domain_name')}, set: function(v){this._setter('server_domain_name',v)}, enumerable: true, configurable: true},
phone_number: {get: function(){return this._getter('phone_number')}, set: function(v){this._setter('phone_number',v)}, enumerable: true, configurable: true},
phone_without_codes: {get: function(){return this._getter('phone_without_codes')}, set: function(v){this._setter('phone_without_codes',v)}, enumerable: true, configurable: true}});
CatPartners.prototype.__define('contact_information', {get: function(){return this._getter_ts('contact_information')}, set: function(v){this._setter_ts('contact_information',v)}, enumerable: true, configurable: true});
function CatPartnersExtra_fieldsRow(owner){CatPartnersExtra_fieldsRow.superclass.constructor.call(this, owner)};
CatPartnersExtra_fieldsRow._extend($p.TabularSectionRow);
$p.CatPartnersExtra_fieldsRow = CatPartnersExtra_fieldsRow;
CatPartnersExtra_fieldsRow.prototype.__define({type: {get: function(){return this._getter('type')}, set: function(v){this._setter('type',v)}, enumerable: true, configurable: true},
kind: {get: function(){return this._getter('kind')}, set: function(v){this._setter('kind',v)}, enumerable: true, configurable: true},
presentation: {get: function(){return this._getter('presentation')}, set: function(v){this._setter('presentation',v)}, enumerable: true, configurable: true},
values_fields: {get: function(){return this._getter('values_fields')}, set: function(v){this._setter('values_fields',v)}, enumerable: true, configurable: true},
country: {get: function(){return this._getter('country')}, set: function(v){this._setter('country',v)}, enumerable: true, configurable: true},
region: {get: function(){return this._getter('region')}, set: function(v){this._setter('region',v)}, enumerable: true, configurable: true},
city: {get: function(){return this._getter('city')}, set: function(v){this._setter('city',v)}, enumerable: true, configurable: true},
email_address: {get: function(){return this._getter('email_address')}, set: function(v){this._setter('email_address',v)}, enumerable: true, configurable: true},
server_domain_name: {get: function(){return this._getter('server_domain_name')}, set: function(v){this._setter('server_domain_name',v)}, enumerable: true, configurable: true},
phone_number: {get: function(){return this._getter('phone_number')}, set: function(v){this._setter('phone_number',v)}, enumerable: true, configurable: true},
phone_without_codes: {get: function(){return this._getter('phone_without_codes')}, set: function(v){this._setter('phone_without_codes',v)}, enumerable: true, configurable: true},
property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true}});
CatPartners.prototype.__define('extra_fields', {get: function(){return this._getter_ts('extra_fields')}, set: function(v){this._setter_ts('extra_fields',v)}, enumerable: true, configurable: true});
$p.cat.partners = new $p.CatManager('cat.partners');

/**
* ### Справочник Номенклатура
* Перечень товаров, продукции, материалов, полуфабрикатов, тары, услуг
* @class CatNom
* @extends CatObj
* @constructor 
*/
function CatNom(attr, manager){CatNom.superclass.constructor.call(this, attr, manager)}
CatNom._extend($p.CatObj);
$p.CatNom = CatNom;
CatNom.prototype.__define({article: {get: function(){return this._getter('article')}, set: function(v){this._setter('article',v)}, enumerable: true, configurable: true},
name_full: {get: function(){return this._getter('name_full')}, set: function(v){this._setter('name_full',v)}, enumerable: true, configurable: true},
base_unit: {get: function(){return this._getter('base_unit')}, set: function(v){this._setter('base_unit',v)}, enumerable: true, configurable: true},
storage_unit: {get: function(){return this._getter('storage_unit')}, set: function(v){this._setter('storage_unit',v)}, enumerable: true, configurable: true},
nom_kind: {get: function(){return this._getter('nom_kind')}, set: function(v){this._setter('nom_kind',v)}, enumerable: true, configurable: true},
nom_group: {get: function(){return this._getter('nom_group')}, set: function(v){this._setter('nom_group',v)}, enumerable: true, configurable: true},
vat_rate: {get: function(){return this._getter('vat_rate')}, set: function(v){this._setter('vat_rate',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
price_group: {get: function(){return this._getter('price_group')}, set: function(v){this._setter('price_group',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
width: {get: function(){return this._getter('width')}, set: function(v){this._setter('width',v)}, enumerable: true, configurable: true},
thickness: {get: function(){return this._getter('thickness')}, set: function(v){this._setter('thickness',v)}, enumerable: true, configurable: true},
sizefurn: {get: function(){return this._getter('sizefurn')}, set: function(v){this._setter('sizefurn',v)}, enumerable: true, configurable: true},
sizefaltz: {get: function(){return this._getter('sizefaltz')}, set: function(v){this._setter('sizefaltz',v)}, enumerable: true, configurable: true},
density: {get: function(){return this._getter('density')}, set: function(v){this._setter('density',v)}, enumerable: true, configurable: true},
volume: {get: function(){return this._getter('volume')}, set: function(v){this._setter('volume',v)}, enumerable: true, configurable: true},
arc_elongation: {get: function(){return this._getter('arc_elongation')}, set: function(v){this._setter('arc_elongation',v)}, enumerable: true, configurable: true},
loss_factor: {get: function(){return this._getter('loss_factor')}, set: function(v){this._setter('loss_factor',v)}, enumerable: true, configurable: true},
rounding_quantity: {get: function(){return this._getter('rounding_quantity')}, set: function(v){this._setter('rounding_quantity',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
cutting_optimization_type: {get: function(){return this._getter('cutting_optimization_type')}, set: function(v){this._setter('cutting_optimization_type',v)}, enumerable: true, configurable: true},
saw_width: {get: function(){return this._getter('saw_width')}, set: function(v){this._setter('saw_width',v)}, enumerable: true, configurable: true},
double_cut: {get: function(){return this._getter('double_cut')}, set: function(v){this._setter('double_cut',v)}, enumerable: true, configurable: true},
overmeasure: {get: function(){return this._getter('overmeasure')}, set: function(v){this._setter('overmeasure',v)}, enumerable: true, configurable: true},
coloration_area: {get: function(){return this._getter('coloration_area')}, set: function(v){this._setter('coloration_area',v)}, enumerable: true, configurable: true},
pricing: {get: function(){return this._getter('pricing')}, set: function(v){this._setter('pricing',v)}, enumerable: true, configurable: true},
visualization: {get: function(){return this._getter('visualization')}, set: function(v){this._setter('visualization',v)}, enumerable: true, configurable: true},
complete_list_sorting: {get: function(){return this._getter('complete_list_sorting')}, set: function(v){this._setter('complete_list_sorting',v)}, enumerable: true, configurable: true},
is_accessory: {get: function(){return this._getter('is_accessory')}, set: function(v){this._setter('is_accessory',v)}, enumerable: true, configurable: true},
is_procedure: {get: function(){return this._getter('is_procedure')}, set: function(v){this._setter('is_procedure',v)}, enumerable: true, configurable: true},
is_service: {get: function(){return this._getter('is_service')}, set: function(v){this._setter('is_service',v)}, enumerable: true, configurable: true},
is_pieces: {get: function(){return this._getter('is_pieces')}, set: function(v){this._setter('is_pieces',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
function CatNomExtra_fieldsRow(owner){CatNomExtra_fieldsRow.superclass.constructor.call(this, owner)};
CatNomExtra_fieldsRow._extend($p.TabularSectionRow);
$p.CatNomExtra_fieldsRow = CatNomExtra_fieldsRow;
CatNomExtra_fieldsRow.prototype.__define({property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true}});
CatNom.prototype.__define('extra_fields', {get: function(){return this._getter_ts('extra_fields')}, set: function(v){this._setter_ts('extra_fields',v)}, enumerable: true, configurable: true});
$p.cat.nom = new $p.CatManager('cat.nom');

/**
* ### Справочник Организации
* Организации
* @class CatOrganizations
* @extends CatObj
* @constructor 
*/
function CatOrganizations(attr, manager){CatOrganizations.superclass.constructor.call(this, attr, manager)}
CatOrganizations._extend($p.CatObj);
$p.CatOrganizations = CatOrganizations;
CatOrganizations.prototype.__define({prefix: {get: function(){return this._getter('prefix')}, set: function(v){this._setter('prefix',v)}, enumerable: true, configurable: true},
individual_legal: {get: function(){return this._getter('individual_legal')}, set: function(v){this._setter('individual_legal',v)}, enumerable: true, configurable: true},
individual_entrepreneur: {get: function(){return this._getter('individual_entrepreneur')}, set: function(v){this._setter('individual_entrepreneur',v)}, enumerable: true, configurable: true},
inn: {get: function(){return this._getter('inn')}, set: function(v){this._setter('inn',v)}, enumerable: true, configurable: true},
kpp: {get: function(){return this._getter('kpp')}, set: function(v){this._setter('kpp',v)}, enumerable: true, configurable: true},
main_bank_account: {get: function(){return this._getter('main_bank_account')}, set: function(v){this._setter('main_bank_account',v)}, enumerable: true, configurable: true},
main_cashbox: {get: function(){return this._getter('main_cashbox')}, set: function(v){this._setter('main_cashbox',v)}, enumerable: true, configurable: true},
certificate_series_number: {get: function(){return this._getter('certificate_series_number')}, set: function(v){this._setter('certificate_series_number',v)}, enumerable: true, configurable: true},
certificate_date_issue: {get: function(){return this._getter('certificate_date_issue')}, set: function(v){this._setter('certificate_date_issue',v)}, enumerable: true, configurable: true},
certificate_authority_name: {get: function(){return this._getter('certificate_authority_name')}, set: function(v){this._setter('certificate_authority_name',v)}, enumerable: true, configurable: true},
certificate_authority_code: {get: function(){return this._getter('certificate_authority_code')}, set: function(v){this._setter('certificate_authority_code',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
function CatOrganizationsContact_informationRow(owner){CatOrganizationsContact_informationRow.superclass.constructor.call(this, owner)};
CatOrganizationsContact_informationRow._extend($p.TabularSectionRow);
$p.CatOrganizationsContact_informationRow = CatOrganizationsContact_informationRow;
CatOrganizationsContact_informationRow.prototype.__define({type: {get: function(){return this._getter('type')}, set: function(v){this._setter('type',v)}, enumerable: true, configurable: true},
kind: {get: function(){return this._getter('kind')}, set: function(v){this._setter('kind',v)}, enumerable: true, configurable: true},
presentation: {get: function(){return this._getter('presentation')}, set: function(v){this._setter('presentation',v)}, enumerable: true, configurable: true},
values_fields: {get: function(){return this._getter('values_fields')}, set: function(v){this._setter('values_fields',v)}, enumerable: true, configurable: true},
country: {get: function(){return this._getter('country')}, set: function(v){this._setter('country',v)}, enumerable: true, configurable: true},
region: {get: function(){return this._getter('region')}, set: function(v){this._setter('region',v)}, enumerable: true, configurable: true},
city: {get: function(){return this._getter('city')}, set: function(v){this._setter('city',v)}, enumerable: true, configurable: true},
email_address: {get: function(){return this._getter('email_address')}, set: function(v){this._setter('email_address',v)}, enumerable: true, configurable: true},
server_domain_name: {get: function(){return this._getter('server_domain_name')}, set: function(v){this._setter('server_domain_name',v)}, enumerable: true, configurable: true},
phone_number: {get: function(){return this._getter('phone_number')}, set: function(v){this._setter('phone_number',v)}, enumerable: true, configurable: true},
phone_without_codes: {get: function(){return this._getter('phone_without_codes')}, set: function(v){this._setter('phone_without_codes',v)}, enumerable: true, configurable: true},
ВидДляСписка: {get: function(){return this._getter('ВидДляСписка')}, set: function(v){this._setter('ВидДляСписка',v)}, enumerable: true, configurable: true},
ДействуетС: {get: function(){return this._getter('ДействуетС')}, set: function(v){this._setter('ДействуетС',v)}, enumerable: true, configurable: true}});
CatOrganizations.prototype.__define('contact_information', {get: function(){return this._getter_ts('contact_information')}, set: function(v){this._setter_ts('contact_information',v)}, enumerable: true, configurable: true});
function CatOrganizationsExtra_fieldsRow(owner){CatOrganizationsExtra_fieldsRow.superclass.constructor.call(this, owner)};
CatOrganizationsExtra_fieldsRow._extend($p.TabularSectionRow);
$p.CatOrganizationsExtra_fieldsRow = CatOrganizationsExtra_fieldsRow;
CatOrganizationsExtra_fieldsRow.prototype.__define({type: {get: function(){return this._getter('type')}, set: function(v){this._setter('type',v)}, enumerable: true, configurable: true},
kind: {get: function(){return this._getter('kind')}, set: function(v){this._setter('kind',v)}, enumerable: true, configurable: true},
presentation: {get: function(){return this._getter('presentation')}, set: function(v){this._setter('presentation',v)}, enumerable: true, configurable: true},
values_fields: {get: function(){return this._getter('values_fields')}, set: function(v){this._setter('values_fields',v)}, enumerable: true, configurable: true},
country: {get: function(){return this._getter('country')}, set: function(v){this._setter('country',v)}, enumerable: true, configurable: true},
region: {get: function(){return this._getter('region')}, set: function(v){this._setter('region',v)}, enumerable: true, configurable: true},
city: {get: function(){return this._getter('city')}, set: function(v){this._setter('city',v)}, enumerable: true, configurable: true},
email_address: {get: function(){return this._getter('email_address')}, set: function(v){this._setter('email_address',v)}, enumerable: true, configurable: true},
server_domain_name: {get: function(){return this._getter('server_domain_name')}, set: function(v){this._setter('server_domain_name',v)}, enumerable: true, configurable: true},
phone_number: {get: function(){return this._getter('phone_number')}, set: function(v){this._setter('phone_number',v)}, enumerable: true, configurable: true},
phone_without_codes: {get: function(){return this._getter('phone_without_codes')}, set: function(v){this._setter('phone_without_codes',v)}, enumerable: true, configurable: true},
ВидДляСписка: {get: function(){return this._getter('ВидДляСписка')}, set: function(v){this._setter('ВидДляСписка',v)}, enumerable: true, configurable: true},
ДействуетС: {get: function(){return this._getter('ДействуетС')}, set: function(v){this._setter('ДействуетС',v)}, enumerable: true, configurable: true},
property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true}});
CatOrganizations.prototype.__define('extra_fields', {get: function(){return this._getter_ts('extra_fields')}, set: function(v){this._setter_ts('extra_fields',v)}, enumerable: true, configurable: true});
$p.cat.organizations = new $p.CatManager('cat.organizations');

/**
* ### Справочник пзВставки
* Армирование, пленки, вставки - дополнение спецификации, которое зависит от одного элемента
* @class CatInserts
* @extends CatObj
* @constructor 
*/
function CatInserts(attr, manager){CatInserts.superclass.constructor.call(this, attr, manager)}
CatInserts._extend($p.CatObj);
$p.CatInserts = CatInserts;
CatInserts.prototype.__define({insert_type: {get: function(){return this._getter('insert_type')}, set: function(v){this._setter('insert_type',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
priority: {get: function(){return this._getter('priority')}, set: function(v){this._setter('priority',v)}, enumerable: true, configurable: true},
lmin: {get: function(){return this._getter('lmin')}, set: function(v){this._setter('lmin',v)}, enumerable: true, configurable: true},
lmax: {get: function(){return this._getter('lmax')}, set: function(v){this._setter('lmax',v)}, enumerable: true, configurable: true},
hmin: {get: function(){return this._getter('hmin')}, set: function(v){this._setter('hmin',v)}, enumerable: true, configurable: true},
hmax: {get: function(){return this._getter('hmax')}, set: function(v){this._setter('hmax',v)}, enumerable: true, configurable: true},
smin: {get: function(){return this._getter('smin')}, set: function(v){this._setter('smin',v)}, enumerable: true, configurable: true},
smax: {get: function(){return this._getter('smax')}, set: function(v){this._setter('smax',v)}, enumerable: true, configurable: true},
for_direct_profile_only: {get: function(){return this._getter('for_direct_profile_only')}, set: function(v){this._setter('for_direct_profile_only',v)}, enumerable: true, configurable: true},
ahmin: {get: function(){return this._getter('ahmin')}, set: function(v){this._setter('ahmin',v)}, enumerable: true, configurable: true},
ahmax: {get: function(){return this._getter('ahmax')}, set: function(v){this._setter('ahmax',v)}, enumerable: true, configurable: true},
mmin: {get: function(){return this._getter('mmin')}, set: function(v){this._setter('mmin',v)}, enumerable: true, configurable: true},
mmax: {get: function(){return this._getter('mmax')}, set: function(v){this._setter('mmax',v)}, enumerable: true, configurable: true},
insert_glass_type: {get: function(){return this._getter('insert_glass_type')}, set: function(v){this._setter('insert_glass_type',v)}, enumerable: true, configurable: true},
impost_fixation: {get: function(){return this._getter('impost_fixation')}, set: function(v){this._setter('impost_fixation',v)}, enumerable: true, configurable: true},
shtulp_fixation: {get: function(){return this._getter('shtulp_fixation')}, set: function(v){this._setter('shtulp_fixation',v)}, enumerable: true, configurable: true},
can_rotate: {get: function(){return this._getter('can_rotate')}, set: function(v){this._setter('can_rotate',v)}, enumerable: true, configurable: true},
sizeb: {get: function(){return this._getter('sizeb')}, set: function(v){this._setter('sizeb',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
function CatInsertsSpecificationRow(owner){CatInsertsSpecificationRow.superclass.constructor.call(this, owner)};
CatInsertsSpecificationRow._extend($p.TabularSectionRow);
$p.CatInsertsSpecificationRow = CatInsertsSpecificationRow;
CatInsertsSpecificationRow.prototype.__define({elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
sz: {get: function(){return this._getter('sz')}, set: function(v){this._setter('sz',v)}, enumerable: true, configurable: true},
coefficient: {get: function(){return this._getter('coefficient')}, set: function(v){this._setter('coefficient',v)}, enumerable: true, configurable: true},
angle_calc_method: {get: function(){return this._getter('angle_calc_method')}, set: function(v){this._setter('angle_calc_method',v)}, enumerable: true, configurable: true},
count_calc_method: {get: function(){return this._getter('count_calc_method')}, set: function(v){this._setter('count_calc_method',v)}, enumerable: true, configurable: true},
formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
lmin: {get: function(){return this._getter('lmin')}, set: function(v){this._setter('lmin',v)}, enumerable: true, configurable: true},
lmax: {get: function(){return this._getter('lmax')}, set: function(v){this._setter('lmax',v)}, enumerable: true, configurable: true},
ahmin: {get: function(){return this._getter('ahmin')}, set: function(v){this._setter('ahmin',v)}, enumerable: true, configurable: true},
ahmax: {get: function(){return this._getter('ahmax')}, set: function(v){this._setter('ahmax',v)}, enumerable: true, configurable: true},
smin: {get: function(){return this._getter('smin')}, set: function(v){this._setter('smin',v)}, enumerable: true, configurable: true},
smax: {get: function(){return this._getter('smax')}, set: function(v){this._setter('smax',v)}, enumerable: true, configurable: true},
step: {get: function(){return this._getter('step')}, set: function(v){this._setter('step',v)}, enumerable: true, configurable: true},
УголШага: {get: function(){return this._getter('УголШага')}, set: function(v){this._setter('УголШага',v)}, enumerable: true, configurable: true},
offsets: {get: function(){return this._getter('offsets')}, set: function(v){this._setter('offsets',v)}, enumerable: true, configurable: true},
do_center: {get: function(){return this._getter('do_center')}, set: function(v){this._setter('do_center',v)}, enumerable: true, configurable: true},
attrs_option: {get: function(){return this._getter('attrs_option')}, set: function(v){this._setter('attrs_option',v)}, enumerable: true, configurable: true},
end_mount: {get: function(){return this._getter('end_mount')}, set: function(v){this._setter('end_mount',v)}, enumerable: true, configurable: true},
is_order_row: {get: function(){return this._getter('is_order_row')}, set: function(v){this._setter('is_order_row',v)}, enumerable: true, configurable: true},
is_main_elm: {get: function(){return this._getter('is_main_elm')}, set: function(v){this._setter('is_main_elm',v)}, enumerable: true, configurable: true}});
CatInserts.prototype.__define('specification', {get: function(){return this._getter_ts('specification')}, set: function(v){this._setter_ts('specification',v)}, enumerable: true, configurable: true});
function CatInsertsSelection_paramsRow(owner){CatInsertsSelection_paramsRow.superclass.constructor.call(this, owner)};
CatInsertsSelection_paramsRow._extend($p.TabularSectionRow);
$p.CatInsertsSelection_paramsRow = CatInsertsSelection_paramsRow;
CatInsertsSelection_paramsRow.prototype.__define({elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
sz: {get: function(){return this._getter('sz')}, set: function(v){this._setter('sz',v)}, enumerable: true, configurable: true},
coefficient: {get: function(){return this._getter('coefficient')}, set: function(v){this._setter('coefficient',v)}, enumerable: true, configurable: true},
angle_calc_method: {get: function(){return this._getter('angle_calc_method')}, set: function(v){this._setter('angle_calc_method',v)}, enumerable: true, configurable: true},
count_calc_method: {get: function(){return this._getter('count_calc_method')}, set: function(v){this._setter('count_calc_method',v)}, enumerable: true, configurable: true},
formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
lmin: {get: function(){return this._getter('lmin')}, set: function(v){this._setter('lmin',v)}, enumerable: true, configurable: true},
lmax: {get: function(){return this._getter('lmax')}, set: function(v){this._setter('lmax',v)}, enumerable: true, configurable: true},
ahmin: {get: function(){return this._getter('ahmin')}, set: function(v){this._setter('ahmin',v)}, enumerable: true, configurable: true},
ahmax: {get: function(){return this._getter('ahmax')}, set: function(v){this._setter('ahmax',v)}, enumerable: true, configurable: true},
smin: {get: function(){return this._getter('smin')}, set: function(v){this._setter('smin',v)}, enumerable: true, configurable: true},
smax: {get: function(){return this._getter('smax')}, set: function(v){this._setter('smax',v)}, enumerable: true, configurable: true},
step: {get: function(){return this._getter('step')}, set: function(v){this._setter('step',v)}, enumerable: true, configurable: true},
УголШага: {get: function(){return this._getter('УголШага')}, set: function(v){this._setter('УголШага',v)}, enumerable: true, configurable: true},
offsets: {get: function(){return this._getter('offsets')}, set: function(v){this._setter('offsets',v)}, enumerable: true, configurable: true},
do_center: {get: function(){return this._getter('do_center')}, set: function(v){this._setter('do_center',v)}, enumerable: true, configurable: true},
attrs_option: {get: function(){return this._getter('attrs_option')}, set: function(v){this._setter('attrs_option',v)}, enumerable: true, configurable: true},
end_mount: {get: function(){return this._getter('end_mount')}, set: function(v){this._setter('end_mount',v)}, enumerable: true, configurable: true},
is_order_row: {get: function(){return this._getter('is_order_row')}, set: function(v){this._setter('is_order_row',v)}, enumerable: true, configurable: true},
is_main_elm: {get: function(){return this._getter('is_main_elm')}, set: function(v){this._setter('is_main_elm',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true}});
CatInserts.prototype.__define('selection_params', {get: function(){return this._getter_ts('selection_params')}, set: function(v){this._setter_ts('selection_params',v)}, enumerable: true, configurable: true});
$p.cat.inserts = new $p.CatManager('cat.inserts');

/**
* ### Справочник пзКлючиПараметров
* Списки пар {Параметр:Значение} для фильтрации в подсистемах корректировки спецификации и ценообразования

* @class CatParameters_keys
* @extends CatObj
* @constructor 
*/
function CatParameters_keys(attr, manager){CatParameters_keys.superclass.constructor.call(this, attr, manager)}
CatParameters_keys._extend($p.CatObj);
$p.CatParameters_keys = CatParameters_keys;
CatParameters_keys.prototype.__define({КоличествоПараметров: {get: function(){return this._getter('КоличествоПараметров')}, set: function(v){this._setter('КоличествоПараметров',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
function CatParameters_keysParamsRow(owner){CatParameters_keysParamsRow.superclass.constructor.call(this, owner)};
CatParameters_keysParamsRow._extend($p.TabularSectionRow);
$p.CatParameters_keysParamsRow = CatParameters_keysParamsRow;
CatParameters_keysParamsRow.prototype.__define({property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true}});
CatParameters_keys.prototype.__define('params', {get: function(){return this._getter_ts('params')}, set: function(v){this._setter_ts('params',v)}, enumerable: true, configurable: true});
$p.cat.parameters_keys = new $p.CatManager('cat.parameters_keys');

/**
* ### Справочник пзПараметрыПродукции
* Настройки системы профилей и фурнитуры
* @class CatProduction_params
* @extends CatObj
* @constructor 
*/
function CatProduction_params(attr, manager){CatProduction_params.superclass.constructor.call(this, attr, manager)}
CatProduction_params._extend($p.CatObj);
$p.CatProduction_params = CatProduction_params;
CatProduction_params.prototype.__define({default_clr: {get: function(){return this._getter('default_clr')}, set: function(v){this._setter('default_clr',v)}, enumerable: true, configurable: true},
allow_open_cnn: {get: function(){return this._getter('allow_open_cnn')}, set: function(v){this._setter('allow_open_cnn',v)}, enumerable: true, configurable: true},
clr_group: {get: function(){return this._getter('clr_group')}, set: function(v){this._setter('clr_group',v)}, enumerable: true, configurable: true},
is_drainage: {get: function(){return this._getter('is_drainage')}, set: function(v){this._setter('is_drainage',v)}, enumerable: true, configurable: true},
tmin: {get: function(){return this._getter('tmin')}, set: function(v){this._setter('tmin',v)}, enumerable: true, configurable: true},
tmax: {get: function(){return this._getter('tmax')}, set: function(v){this._setter('tmax',v)}, enumerable: true, configurable: true},
lay_split_type: {get: function(){return this._getter('lay_split_type')}, set: function(v){this._setter('lay_split_type',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
function CatProduction_paramsElmntsRow(owner){CatProduction_paramsElmntsRow.superclass.constructor.call(this, owner)};
CatProduction_paramsElmntsRow._extend($p.TabularSectionRow);
$p.CatProduction_paramsElmntsRow = CatProduction_paramsElmntsRow;
CatProduction_paramsElmntsRow.prototype.__define({by_default: {get: function(){return this._getter('by_default')}, set: function(v){this._setter('by_default',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
pos: {get: function(){return this._getter('pos')}, set: function(v){this._setter('pos',v)}, enumerable: true, configurable: true}});
CatProduction_params.prototype.__define('elmnts', {get: function(){return this._getter_ts('elmnts')}, set: function(v){this._setter_ts('elmnts',v)}, enumerable: true, configurable: true});
function CatProduction_paramsProductionRow(owner){CatProduction_paramsProductionRow.superclass.constructor.call(this, owner)};
CatProduction_paramsProductionRow._extend($p.TabularSectionRow);
$p.CatProduction_paramsProductionRow = CatProduction_paramsProductionRow;
CatProduction_paramsProductionRow.prototype.__define({by_default: {get: function(){return this._getter('by_default')}, set: function(v){this._setter('by_default',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
pos: {get: function(){return this._getter('pos')}, set: function(v){this._setter('pos',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true}});
CatProduction_params.prototype.__define('production', {get: function(){return this._getter_ts('production')}, set: function(v){this._setter_ts('production',v)}, enumerable: true, configurable: true});
function CatProduction_paramsProduct_paramsRow(owner){CatProduction_paramsProduct_paramsRow.superclass.constructor.call(this, owner)};
CatProduction_paramsProduct_paramsRow._extend($p.TabularSectionRow);
$p.CatProduction_paramsProduct_paramsRow = CatProduction_paramsProduct_paramsRow;
CatProduction_paramsProduct_paramsRow.prototype.__define({by_default: {get: function(){return this._getter('by_default')}, set: function(v){this._setter('by_default',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
pos: {get: function(){return this._getter('pos')}, set: function(v){this._setter('pos',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
forcibly: {get: function(){return this._getter('forcibly')}, set: function(v){this._setter('forcibly',v)}, enumerable: true, configurable: true}});
CatProduction_params.prototype.__define('product_params', {get: function(){return this._getter_ts('product_params')}, set: function(v){this._setter_ts('product_params',v)}, enumerable: true, configurable: true});
function CatProduction_paramsFurn_paramsRow(owner){CatProduction_paramsFurn_paramsRow.superclass.constructor.call(this, owner)};
CatProduction_paramsFurn_paramsRow._extend($p.TabularSectionRow);
$p.CatProduction_paramsFurn_paramsRow = CatProduction_paramsFurn_paramsRow;
CatProduction_paramsFurn_paramsRow.prototype.__define({by_default: {get: function(){return this._getter('by_default')}, set: function(v){this._setter('by_default',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
pos: {get: function(){return this._getter('pos')}, set: function(v){this._setter('pos',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
forcibly: {get: function(){return this._getter('forcibly')}, set: function(v){this._setter('forcibly',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
forcibly: {get: function(){return this._getter('forcibly')}, set: function(v){this._setter('forcibly',v)}, enumerable: true, configurable: true}});
CatProduction_params.prototype.__define('furn_params', {get: function(){return this._getter_ts('furn_params')}, set: function(v){this._setter_ts('furn_params',v)}, enumerable: true, configurable: true});
function CatProduction_paramsColorsRow(owner){CatProduction_paramsColorsRow.superclass.constructor.call(this, owner)};
CatProduction_paramsColorsRow._extend($p.TabularSectionRow);
$p.CatProduction_paramsColorsRow = CatProduction_paramsColorsRow;
CatProduction_paramsColorsRow.prototype.__define({by_default: {get: function(){return this._getter('by_default')}, set: function(v){this._setter('by_default',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
pos: {get: function(){return this._getter('pos')}, set: function(v){this._setter('pos',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
forcibly: {get: function(){return this._getter('forcibly')}, set: function(v){this._setter('forcibly',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
forcibly: {get: function(){return this._getter('forcibly')}, set: function(v){this._setter('forcibly',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true}});
CatProduction_params.prototype.__define('colors', {get: function(){return this._getter_ts('colors')}, set: function(v){this._setter_ts('colors',v)}, enumerable: true, configurable: true});
function CatProduction_paramsBase_blocksRow(owner){CatProduction_paramsBase_blocksRow.superclass.constructor.call(this, owner)};
CatProduction_paramsBase_blocksRow._extend($p.TabularSectionRow);
$p.CatProduction_paramsBase_blocksRow = CatProduction_paramsBase_blocksRow;
CatProduction_paramsBase_blocksRow.prototype.__define({by_default: {get: function(){return this._getter('by_default')}, set: function(v){this._setter('by_default',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
pos: {get: function(){return this._getter('pos')}, set: function(v){this._setter('pos',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
forcibly: {get: function(){return this._getter('forcibly')}, set: function(v){this._setter('forcibly',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
forcibly: {get: function(){return this._getter('forcibly')}, set: function(v){this._setter('forcibly',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
calc_order: {get: function(){return this._getter('calc_order')}, set: function(v){this._setter('calc_order',v)}, enumerable: true, configurable: true}});
CatProduction_params.prototype.__define('base_blocks', {get: function(){return this._getter_ts('base_blocks')}, set: function(v){this._setter_ts('base_blocks',v)}, enumerable: true, configurable: true});
$p.cat.production_params = new $p.CatManager('cat.production_params');

/**
* ### Справочник ИнтеграцияПраваПользователей
* Права дилеров и менеджеров
* @class CatUsers_acl
* @extends CatObj
* @constructor 
*/
function CatUsers_acl(attr, manager){CatUsers_acl.superclass.constructor.call(this, attr, manager)}
CatUsers_acl._extend($p.CatObj);
$p.CatUsers_acl = CatUsers_acl;
CatUsers_acl.prototype.__define({prefix: {get: function(){return this._getter('prefix')}, set: function(v){this._setter('prefix',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
owner: {get: function(){return this._getter('owner')}, set: function(v){this._setter('owner',v)}, enumerable: true, configurable: true}});
function CatUsers_aclAcl_objsRow(owner){CatUsers_aclAcl_objsRow.superclass.constructor.call(this, owner)};
CatUsers_aclAcl_objsRow._extend($p.TabularSectionRow);
$p.CatUsers_aclAcl_objsRow = CatUsers_aclAcl_objsRow;
CatUsers_aclAcl_objsRow.prototype.__define({acl_obj: {get: function(){return this._getter('acl_obj')}, set: function(v){this._setter('acl_obj',v)}, enumerable: true, configurable: true},
type: {get: function(){return this._getter('type')}, set: function(v){this._setter('type',v)}, enumerable: true, configurable: true},
by_default: {get: function(){return this._getter('by_default')}, set: function(v){this._setter('by_default',v)}, enumerable: true, configurable: true}});
CatUsers_acl.prototype.__define('acl_objs', {get: function(){return this._getter_ts('acl_objs')}, set: function(v){this._setter_ts('acl_objs',v)}, enumerable: true, configurable: true});
$p.cat.users_acl = new $p.CatManager('cat.users_acl');

/**
* ### Справочник пзРайоныДоставки
* Районы доставки
* @class CatDelivery_areas
* @extends CatObj
* @constructor 
*/
function CatDelivery_areas(attr, manager){CatDelivery_areas.superclass.constructor.call(this, attr, manager)}
CatDelivery_areas._extend($p.CatObj);
$p.CatDelivery_areas = CatDelivery_areas;
CatDelivery_areas.prototype.__define({country: {get: function(){return this._getter('country')}, set: function(v){this._setter('country',v)}, enumerable: true, configurable: true},
region: {get: function(){return this._getter('region')}, set: function(v){this._setter('region',v)}, enumerable: true, configurable: true},
city: {get: function(){return this._getter('city')}, set: function(v){this._setter('city',v)}, enumerable: true, configurable: true},
latitude: {get: function(){return this._getter('latitude')}, set: function(v){this._setter('latitude',v)}, enumerable: true, configurable: true},
longitude: {get: function(){return this._getter('longitude')}, set: function(v){this._setter('longitude',v)}, enumerable: true, configurable: true},
ind: {get: function(){return this._getter('ind')}, set: function(v){this._setter('ind',v)}, enumerable: true, configurable: true},
delivery_area: {get: function(){return this._getter('delivery_area')}, set: function(v){this._setter('delivery_area',v)}, enumerable: true, configurable: true},
specify_area_by_geocoder: {get: function(){return this._getter('specify_area_by_geocoder')}, set: function(v){this._setter('specify_area_by_geocoder',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
$p.cat.delivery_areas = new $p.CatManager('cat.delivery_areas');

/**
* ### Справочник пзСоединения
* Спецификации соединений элементов
* @class CatCnns
* @extends CatObj
* @constructor 
*/
function CatCnns(attr, manager){CatCnns.superclass.constructor.call(this, attr, manager)}
CatCnns._extend($p.CatObj);
$p.CatCnns = CatCnns;
CatCnns.prototype.__define({priority: {get: function(){return this._getter('priority')}, set: function(v){this._setter('priority',v)}, enumerable: true, configurable: true},
amin: {get: function(){return this._getter('amin')}, set: function(v){this._setter('amin',v)}, enumerable: true, configurable: true},
amax: {get: function(){return this._getter('amax')}, set: function(v){this._setter('amax',v)}, enumerable: true, configurable: true},
sd1: {get: function(){return this._getter('sd1')}, set: function(v){this._setter('sd1',v)}, enumerable: true, configurable: true},
sd2: {get: function(){return this._getter('sd2')}, set: function(v){this._setter('sd2',v)}, enumerable: true, configurable: true},
sz: {get: function(){return this._getter('sz')}, set: function(v){this._setter('sz',v)}, enumerable: true, configurable: true},
cnn_type: {get: function(){return this._getter('cnn_type')}, set: function(v){this._setter('cnn_type',v)}, enumerable: true, configurable: true},
ahmin: {get: function(){return this._getter('ahmin')}, set: function(v){this._setter('ahmin',v)}, enumerable: true, configurable: true},
ahmax: {get: function(){return this._getter('ahmax')}, set: function(v){this._setter('ahmax',v)}, enumerable: true, configurable: true},
lmin: {get: function(){return this._getter('lmin')}, set: function(v){this._setter('lmin',v)}, enumerable: true, configurable: true},
lmax: {get: function(){return this._getter('lmax')}, set: function(v){this._setter('lmax',v)}, enumerable: true, configurable: true},
tmin: {get: function(){return this._getter('tmin')}, set: function(v){this._setter('tmin',v)}, enumerable: true, configurable: true},
tmax: {get: function(){return this._getter('tmax')}, set: function(v){this._setter('tmax',v)}, enumerable: true, configurable: true},
var_layers: {get: function(){return this._getter('var_layers')}, set: function(v){this._setter('var_layers',v)}, enumerable: true, configurable: true},
for_direct_profile_only: {get: function(){return this._getter('for_direct_profile_only')}, set: function(v){this._setter('for_direct_profile_only',v)}, enumerable: true, configurable: true},
art1vert: {get: function(){return this._getter('art1vert')}, set: function(v){this._setter('art1vert',v)}, enumerable: true, configurable: true},
art1glass: {get: function(){return this._getter('art1glass')}, set: function(v){this._setter('art1glass',v)}, enumerable: true, configurable: true},
art2glass: {get: function(){return this._getter('art2glass')}, set: function(v){this._setter('art2glass',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
function CatCnnsSpecificationRow(owner){CatCnnsSpecificationRow.superclass.constructor.call(this, owner)};
CatCnnsSpecificationRow._extend($p.TabularSectionRow);
$p.CatCnnsSpecificationRow = CatCnnsSpecificationRow;
CatCnnsSpecificationRow.prototype.__define({elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
coefficient: {get: function(){return this._getter('coefficient')}, set: function(v){this._setter('coefficient',v)}, enumerable: true, configurable: true},
sz: {get: function(){return this._getter('sz')}, set: function(v){this._setter('sz',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
sz_min: {get: function(){return this._getter('sz_min')}, set: function(v){this._setter('sz_min',v)}, enumerable: true, configurable: true},
sz_max: {get: function(){return this._getter('sz_max')}, set: function(v){this._setter('sz_max',v)}, enumerable: true, configurable: true},
amin: {get: function(){return this._getter('amin')}, set: function(v){this._setter('amin',v)}, enumerable: true, configurable: true},
amax: {get: function(){return this._getter('amax')}, set: function(v){this._setter('amax',v)}, enumerable: true, configurable: true},
set_specification: {get: function(){return this._getter('set_specification')}, set: function(v){this._setter('set_specification',v)}, enumerable: true, configurable: true},
for_direct_profile_only: {get: function(){return this._getter('for_direct_profile_only')}, set: function(v){this._setter('for_direct_profile_only',v)}, enumerable: true, configurable: true},
by_contour: {get: function(){return this._getter('by_contour')}, set: function(v){this._setter('by_contour',v)}, enumerable: true, configurable: true},
contraction_by_contour: {get: function(){return this._getter('contraction_by_contour')}, set: function(v){this._setter('contraction_by_contour',v)}, enumerable: true, configurable: true},
on_aperture: {get: function(){return this._getter('on_aperture')}, set: function(v){this._setter('on_aperture',v)}, enumerable: true, configurable: true},
angle_calc_method: {get: function(){return this._getter('angle_calc_method')}, set: function(v){this._setter('angle_calc_method',v)}, enumerable: true, configurable: true},
contour_number: {get: function(){return this._getter('contour_number')}, set: function(v){this._setter('contour_number',v)}, enumerable: true, configurable: true},
is_order_row: {get: function(){return this._getter('is_order_row')}, set: function(v){this._setter('is_order_row',v)}, enumerable: true, configurable: true}});
CatCnns.prototype.__define('specification', {get: function(){return this._getter_ts('specification')}, set: function(v){this._setter_ts('specification',v)}, enumerable: true, configurable: true});
function CatCnnsCnn_elmntsRow(owner){CatCnnsCnn_elmntsRow.superclass.constructor.call(this, owner)};
CatCnnsCnn_elmntsRow._extend($p.TabularSectionRow);
$p.CatCnnsCnn_elmntsRow = CatCnnsCnn_elmntsRow;
CatCnnsCnn_elmntsRow.prototype.__define({elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
coefficient: {get: function(){return this._getter('coefficient')}, set: function(v){this._setter('coefficient',v)}, enumerable: true, configurable: true},
sz: {get: function(){return this._getter('sz')}, set: function(v){this._setter('sz',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
sz_min: {get: function(){return this._getter('sz_min')}, set: function(v){this._setter('sz_min',v)}, enumerable: true, configurable: true},
sz_max: {get: function(){return this._getter('sz_max')}, set: function(v){this._setter('sz_max',v)}, enumerable: true, configurable: true},
amin: {get: function(){return this._getter('amin')}, set: function(v){this._setter('amin',v)}, enumerable: true, configurable: true},
amax: {get: function(){return this._getter('amax')}, set: function(v){this._setter('amax',v)}, enumerable: true, configurable: true},
set_specification: {get: function(){return this._getter('set_specification')}, set: function(v){this._setter('set_specification',v)}, enumerable: true, configurable: true},
for_direct_profile_only: {get: function(){return this._getter('for_direct_profile_only')}, set: function(v){this._setter('for_direct_profile_only',v)}, enumerable: true, configurable: true},
by_contour: {get: function(){return this._getter('by_contour')}, set: function(v){this._setter('by_contour',v)}, enumerable: true, configurable: true},
contraction_by_contour: {get: function(){return this._getter('contraction_by_contour')}, set: function(v){this._setter('contraction_by_contour',v)}, enumerable: true, configurable: true},
on_aperture: {get: function(){return this._getter('on_aperture')}, set: function(v){this._setter('on_aperture',v)}, enumerable: true, configurable: true},
angle_calc_method: {get: function(){return this._getter('angle_calc_method')}, set: function(v){this._setter('angle_calc_method',v)}, enumerable: true, configurable: true},
contour_number: {get: function(){return this._getter('contour_number')}, set: function(v){this._setter('contour_number',v)}, enumerable: true, configurable: true},
is_order_row: {get: function(){return this._getter('is_order_row')}, set: function(v){this._setter('is_order_row',v)}, enumerable: true, configurable: true},
nom1: {get: function(){return this._getter('nom1')}, set: function(v){this._setter('nom1',v)}, enumerable: true, configurable: true},
clr1: {get: function(){return this._getter('clr1')}, set: function(v){this._setter('clr1',v)}, enumerable: true, configurable: true},
nom2: {get: function(){return this._getter('nom2')}, set: function(v){this._setter('nom2',v)}, enumerable: true, configurable: true},
clr2: {get: function(){return this._getter('clr2')}, set: function(v){this._setter('clr2',v)}, enumerable: true, configurable: true},
varclr: {get: function(){return this._getter('varclr')}, set: function(v){this._setter('varclr',v)}, enumerable: true, configurable: true},
is_nom_combinations_row: {get: function(){return this._getter('is_nom_combinations_row')}, set: function(v){this._setter('is_nom_combinations_row',v)}, enumerable: true, configurable: true}});
CatCnns.prototype.__define('cnn_elmnts', {get: function(){return this._getter_ts('cnn_elmnts')}, set: function(v){this._setter_ts('cnn_elmnts',v)}, enumerable: true, configurable: true});
function CatCnnsSelection_paramsRow(owner){CatCnnsSelection_paramsRow.superclass.constructor.call(this, owner)};
CatCnnsSelection_paramsRow._extend($p.TabularSectionRow);
$p.CatCnnsSelection_paramsRow = CatCnnsSelection_paramsRow;
CatCnnsSelection_paramsRow.prototype.__define({elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
coefficient: {get: function(){return this._getter('coefficient')}, set: function(v){this._setter('coefficient',v)}, enumerable: true, configurable: true},
sz: {get: function(){return this._getter('sz')}, set: function(v){this._setter('sz',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
sz_min: {get: function(){return this._getter('sz_min')}, set: function(v){this._setter('sz_min',v)}, enumerable: true, configurable: true},
sz_max: {get: function(){return this._getter('sz_max')}, set: function(v){this._setter('sz_max',v)}, enumerable: true, configurable: true},
amin: {get: function(){return this._getter('amin')}, set: function(v){this._setter('amin',v)}, enumerable: true, configurable: true},
amax: {get: function(){return this._getter('amax')}, set: function(v){this._setter('amax',v)}, enumerable: true, configurable: true},
set_specification: {get: function(){return this._getter('set_specification')}, set: function(v){this._setter('set_specification',v)}, enumerable: true, configurable: true},
for_direct_profile_only: {get: function(){return this._getter('for_direct_profile_only')}, set: function(v){this._setter('for_direct_profile_only',v)}, enumerable: true, configurable: true},
by_contour: {get: function(){return this._getter('by_contour')}, set: function(v){this._setter('by_contour',v)}, enumerable: true, configurable: true},
contraction_by_contour: {get: function(){return this._getter('contraction_by_contour')}, set: function(v){this._setter('contraction_by_contour',v)}, enumerable: true, configurable: true},
on_aperture: {get: function(){return this._getter('on_aperture')}, set: function(v){this._setter('on_aperture',v)}, enumerable: true, configurable: true},
angle_calc_method: {get: function(){return this._getter('angle_calc_method')}, set: function(v){this._setter('angle_calc_method',v)}, enumerable: true, configurable: true},
contour_number: {get: function(){return this._getter('contour_number')}, set: function(v){this._setter('contour_number',v)}, enumerable: true, configurable: true},
is_order_row: {get: function(){return this._getter('is_order_row')}, set: function(v){this._setter('is_order_row',v)}, enumerable: true, configurable: true},
nom1: {get: function(){return this._getter('nom1')}, set: function(v){this._setter('nom1',v)}, enumerable: true, configurable: true},
clr1: {get: function(){return this._getter('clr1')}, set: function(v){this._setter('clr1',v)}, enumerable: true, configurable: true},
nom2: {get: function(){return this._getter('nom2')}, set: function(v){this._setter('nom2',v)}, enumerable: true, configurable: true},
clr2: {get: function(){return this._getter('clr2')}, set: function(v){this._setter('clr2',v)}, enumerable: true, configurable: true},
varclr: {get: function(){return this._getter('varclr')}, set: function(v){this._setter('varclr',v)}, enumerable: true, configurable: true},
is_nom_combinations_row: {get: function(){return this._getter('is_nom_combinations_row')}, set: function(v){this._setter('is_nom_combinations_row',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true}});
CatCnns.prototype.__define('selection_params', {get: function(){return this._getter_ts('selection_params')}, set: function(v){this._setter_ts('selection_params',v)}, enumerable: true, configurable: true});
$p.cat.cnns = new $p.CatManager('cat.cnns');

/**
* ### Справочник пзФурнитура
* Описывает ограничения и правила формирования спецификаций фурнитуры
* @class CatFurns
* @extends CatObj
* @constructor 
*/
function CatFurns(attr, manager){CatFurns.superclass.constructor.call(this, attr, manager)}
CatFurns._extend($p.CatObj);
$p.CatFurns = CatFurns;
CatFurns.prototype.__define({flap_weight_max: {get: function(){return this._getter('flap_weight_max')}, set: function(v){this._setter('flap_weight_max',v)}, enumerable: true, configurable: true},
left_right: {get: function(){return this._getter('left_right')}, set: function(v){this._setter('left_right',v)}, enumerable: true, configurable: true},
is_set: {get: function(){return this._getter('is_set')}, set: function(v){this._setter('is_set',v)}, enumerable: true, configurable: true},
is_sliding: {get: function(){return this._getter('is_sliding')}, set: function(v){this._setter('is_sliding',v)}, enumerable: true, configurable: true},
furn_set: {get: function(){return this._getter('furn_set')}, set: function(v){this._setter('furn_set',v)}, enumerable: true, configurable: true},
side_count: {get: function(){return this._getter('side_count')}, set: function(v){this._setter('side_count',v)}, enumerable: true, configurable: true},
handle_side: {get: function(){return this._getter('handle_side')}, set: function(v){this._setter('handle_side',v)}, enumerable: true, configurable: true},
open_type: {get: function(){return this._getter('open_type')}, set: function(v){this._setter('open_type',v)}, enumerable: true, configurable: true},
name_short: {get: function(){return this._getter('name_short')}, set: function(v){this._setter('name_short',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
function CatFurnsOpen_tunesRow(owner){CatFurnsOpen_tunesRow.superclass.constructor.call(this, owner)};
CatFurnsOpen_tunesRow._extend($p.TabularSectionRow);
$p.CatFurnsOpen_tunesRow = CatFurnsOpen_tunesRow;
CatFurnsOpen_tunesRow.prototype.__define({side: {get: function(){return this._getter('side')}, set: function(v){this._setter('side',v)}, enumerable: true, configurable: true},
lmin: {get: function(){return this._getter('lmin')}, set: function(v){this._setter('lmin',v)}, enumerable: true, configurable: true},
lmax: {get: function(){return this._getter('lmax')}, set: function(v){this._setter('lmax',v)}, enumerable: true, configurable: true},
amin: {get: function(){return this._getter('amin')}, set: function(v){this._setter('amin',v)}, enumerable: true, configurable: true},
amax: {get: function(){return this._getter('amax')}, set: function(v){this._setter('amax',v)}, enumerable: true, configurable: true},
arc_available: {get: function(){return this._getter('arc_available')}, set: function(v){this._setter('arc_available',v)}, enumerable: true, configurable: true},
shtulp_available: {get: function(){return this._getter('shtulp_available')}, set: function(v){this._setter('shtulp_available',v)}, enumerable: true, configurable: true},
shtulp_fix_here: {get: function(){return this._getter('shtulp_fix_here')}, set: function(v){this._setter('shtulp_fix_here',v)}, enumerable: true, configurable: true},
rotation_axis: {get: function(){return this._getter('rotation_axis')}, set: function(v){this._setter('rotation_axis',v)}, enumerable: true, configurable: true},
partial_opening: {get: function(){return this._getter('partial_opening')}, set: function(v){this._setter('partial_opening',v)}, enumerable: true, configurable: true},
outline: {get: function(){return this._getter('outline')}, set: function(v){this._setter('outline',v)}, enumerable: true, configurable: true}});
CatFurns.prototype.__define('open_tunes', {get: function(){return this._getter_ts('open_tunes')}, set: function(v){this._setter_ts('open_tunes',v)}, enumerable: true, configurable: true});
function CatFurnsSpecificationRow(owner){CatFurnsSpecificationRow.superclass.constructor.call(this, owner)};
CatFurnsSpecificationRow._extend($p.TabularSectionRow);
$p.CatFurnsSpecificationRow = CatFurnsSpecificationRow;
CatFurnsSpecificationRow.prototype.__define({side: {get: function(){return this._getter('side')}, set: function(v){this._setter('side',v)}, enumerable: true, configurable: true},
lmin: {get: function(){return this._getter('lmin')}, set: function(v){this._setter('lmin',v)}, enumerable: true, configurable: true},
lmax: {get: function(){return this._getter('lmax')}, set: function(v){this._setter('lmax',v)}, enumerable: true, configurable: true},
amin: {get: function(){return this._getter('amin')}, set: function(v){this._setter('amin',v)}, enumerable: true, configurable: true},
amax: {get: function(){return this._getter('amax')}, set: function(v){this._setter('amax',v)}, enumerable: true, configurable: true},
arc_available: {get: function(){return this._getter('arc_available')}, set: function(v){this._setter('arc_available',v)}, enumerable: true, configurable: true},
shtulp_available: {get: function(){return this._getter('shtulp_available')}, set: function(v){this._setter('shtulp_available',v)}, enumerable: true, configurable: true},
shtulp_fix_here: {get: function(){return this._getter('shtulp_fix_here')}, set: function(v){this._setter('shtulp_fix_here',v)}, enumerable: true, configurable: true},
rotation_axis: {get: function(){return this._getter('rotation_axis')}, set: function(v){this._setter('rotation_axis',v)}, enumerable: true, configurable: true},
partial_opening: {get: function(){return this._getter('partial_opening')}, set: function(v){this._setter('partial_opening',v)}, enumerable: true, configurable: true},
outline: {get: function(){return this._getter('outline')}, set: function(v){this._setter('outline',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
dop: {get: function(){return this._getter('dop')}, set: function(v){this._setter('dop',v)}, enumerable: true, configurable: true},
nom_set: {get: function(){return this._getter('nom_set')}, set: function(v){this._setter('nom_set',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
handle_height_base: {get: function(){return this._getter('handle_height_base')}, set: function(v){this._setter('handle_height_base',v)}, enumerable: true, configurable: true},
handle_height_min: {get: function(){return this._getter('handle_height_min')}, set: function(v){this._setter('handle_height_min',v)}, enumerable: true, configurable: true},
handle_height_max: {get: function(){return this._getter('handle_height_max')}, set: function(v){this._setter('handle_height_max',v)}, enumerable: true, configurable: true},
contraction: {get: function(){return this._getter('contraction')}, set: function(v){this._setter('contraction',v)}, enumerable: true, configurable: true},
contraction_option: {get: function(){return this._getter('contraction_option')}, set: function(v){this._setter('contraction_option',v)}, enumerable: true, configurable: true},
coefficient: {get: function(){return this._getter('coefficient')}, set: function(v){this._setter('coefficient',v)}, enumerable: true, configurable: true},
flap_weight_min: {get: function(){return this._getter('flap_weight_min')}, set: function(v){this._setter('flap_weight_min',v)}, enumerable: true, configurable: true},
flap_weight_max: {get: function(){return this._getter('flap_weight_max')}, set: function(v){this._setter('flap_weight_max',v)}, enumerable: true, configurable: true},
side: {get: function(){return this._getter('side')}, set: function(v){this._setter('side',v)}, enumerable: true, configurable: true},
cnn_side: {get: function(){return this._getter('cnn_side')}, set: function(v){this._setter('cnn_side',v)}, enumerable: true, configurable: true},
offset_option: {get: function(){return this._getter('offset_option')}, set: function(v){this._setter('offset_option',v)}, enumerable: true, configurable: true},
formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
transfer_option: {get: function(){return this._getter('transfer_option')}, set: function(v){this._setter('transfer_option',v)}, enumerable: true, configurable: true},
is_main_specification_row: {get: function(){return this._getter('is_main_specification_row')}, set: function(v){this._setter('is_main_specification_row',v)}, enumerable: true, configurable: true},
is_set_row: {get: function(){return this._getter('is_set_row')}, set: function(v){this._setter('is_set_row',v)}, enumerable: true, configurable: true},
is_procedure_row: {get: function(){return this._getter('is_procedure_row')}, set: function(v){this._setter('is_procedure_row',v)}, enumerable: true, configurable: true},
is_order_row: {get: function(){return this._getter('is_order_row')}, set: function(v){this._setter('is_order_row',v)}, enumerable: true, configurable: true}});
CatFurns.prototype.__define('specification', {get: function(){return this._getter_ts('specification')}, set: function(v){this._setter_ts('specification',v)}, enumerable: true, configurable: true});
function CatFurnsSelection_paramsRow(owner){CatFurnsSelection_paramsRow.superclass.constructor.call(this, owner)};
CatFurnsSelection_paramsRow._extend($p.TabularSectionRow);
$p.CatFurnsSelection_paramsRow = CatFurnsSelection_paramsRow;
CatFurnsSelection_paramsRow.prototype.__define({side: {get: function(){return this._getter('side')}, set: function(v){this._setter('side',v)}, enumerable: true, configurable: true},
lmin: {get: function(){return this._getter('lmin')}, set: function(v){this._setter('lmin',v)}, enumerable: true, configurable: true},
lmax: {get: function(){return this._getter('lmax')}, set: function(v){this._setter('lmax',v)}, enumerable: true, configurable: true},
amin: {get: function(){return this._getter('amin')}, set: function(v){this._setter('amin',v)}, enumerable: true, configurable: true},
amax: {get: function(){return this._getter('amax')}, set: function(v){this._setter('amax',v)}, enumerable: true, configurable: true},
arc_available: {get: function(){return this._getter('arc_available')}, set: function(v){this._setter('arc_available',v)}, enumerable: true, configurable: true},
shtulp_available: {get: function(){return this._getter('shtulp_available')}, set: function(v){this._setter('shtulp_available',v)}, enumerable: true, configurable: true},
shtulp_fix_here: {get: function(){return this._getter('shtulp_fix_here')}, set: function(v){this._setter('shtulp_fix_here',v)}, enumerable: true, configurable: true},
rotation_axis: {get: function(){return this._getter('rotation_axis')}, set: function(v){this._setter('rotation_axis',v)}, enumerable: true, configurable: true},
partial_opening: {get: function(){return this._getter('partial_opening')}, set: function(v){this._setter('partial_opening',v)}, enumerable: true, configurable: true},
outline: {get: function(){return this._getter('outline')}, set: function(v){this._setter('outline',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
dop: {get: function(){return this._getter('dop')}, set: function(v){this._setter('dop',v)}, enumerable: true, configurable: true},
nom_set: {get: function(){return this._getter('nom_set')}, set: function(v){this._setter('nom_set',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
handle_height_base: {get: function(){return this._getter('handle_height_base')}, set: function(v){this._setter('handle_height_base',v)}, enumerable: true, configurable: true},
handle_height_min: {get: function(){return this._getter('handle_height_min')}, set: function(v){this._setter('handle_height_min',v)}, enumerable: true, configurable: true},
handle_height_max: {get: function(){return this._getter('handle_height_max')}, set: function(v){this._setter('handle_height_max',v)}, enumerable: true, configurable: true},
contraction: {get: function(){return this._getter('contraction')}, set: function(v){this._setter('contraction',v)}, enumerable: true, configurable: true},
contraction_option: {get: function(){return this._getter('contraction_option')}, set: function(v){this._setter('contraction_option',v)}, enumerable: true, configurable: true},
coefficient: {get: function(){return this._getter('coefficient')}, set: function(v){this._setter('coefficient',v)}, enumerable: true, configurable: true},
flap_weight_min: {get: function(){return this._getter('flap_weight_min')}, set: function(v){this._setter('flap_weight_min',v)}, enumerable: true, configurable: true},
flap_weight_max: {get: function(){return this._getter('flap_weight_max')}, set: function(v){this._setter('flap_weight_max',v)}, enumerable: true, configurable: true},
side: {get: function(){return this._getter('side')}, set: function(v){this._setter('side',v)}, enumerable: true, configurable: true},
cnn_side: {get: function(){return this._getter('cnn_side')}, set: function(v){this._setter('cnn_side',v)}, enumerable: true, configurable: true},
offset_option: {get: function(){return this._getter('offset_option')}, set: function(v){this._setter('offset_option',v)}, enumerable: true, configurable: true},
formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
transfer_option: {get: function(){return this._getter('transfer_option')}, set: function(v){this._setter('transfer_option',v)}, enumerable: true, configurable: true},
is_main_specification_row: {get: function(){return this._getter('is_main_specification_row')}, set: function(v){this._setter('is_main_specification_row',v)}, enumerable: true, configurable: true},
is_set_row: {get: function(){return this._getter('is_set_row')}, set: function(v){this._setter('is_set_row',v)}, enumerable: true, configurable: true},
is_procedure_row: {get: function(){return this._getter('is_procedure_row')}, set: function(v){this._setter('is_procedure_row',v)}, enumerable: true, configurable: true},
is_order_row: {get: function(){return this._getter('is_order_row')}, set: function(v){this._setter('is_order_row',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
dop: {get: function(){return this._getter('dop')}, set: function(v){this._setter('dop',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true}});
CatFurns.prototype.__define('selection_params', {get: function(){return this._getter_ts('selection_params')}, set: function(v){this._setter_ts('selection_params',v)}, enumerable: true, configurable: true});
function CatFurnsSpecification_restrictionsRow(owner){CatFurnsSpecification_restrictionsRow.superclass.constructor.call(this, owner)};
CatFurnsSpecification_restrictionsRow._extend($p.TabularSectionRow);
$p.CatFurnsSpecification_restrictionsRow = CatFurnsSpecification_restrictionsRow;
CatFurnsSpecification_restrictionsRow.prototype.__define({side: {get: function(){return this._getter('side')}, set: function(v){this._setter('side',v)}, enumerable: true, configurable: true},
lmin: {get: function(){return this._getter('lmin')}, set: function(v){this._setter('lmin',v)}, enumerable: true, configurable: true},
lmax: {get: function(){return this._getter('lmax')}, set: function(v){this._setter('lmax',v)}, enumerable: true, configurable: true},
amin: {get: function(){return this._getter('amin')}, set: function(v){this._setter('amin',v)}, enumerable: true, configurable: true},
amax: {get: function(){return this._getter('amax')}, set: function(v){this._setter('amax',v)}, enumerable: true, configurable: true},
arc_available: {get: function(){return this._getter('arc_available')}, set: function(v){this._setter('arc_available',v)}, enumerable: true, configurable: true},
shtulp_available: {get: function(){return this._getter('shtulp_available')}, set: function(v){this._setter('shtulp_available',v)}, enumerable: true, configurable: true},
shtulp_fix_here: {get: function(){return this._getter('shtulp_fix_here')}, set: function(v){this._setter('shtulp_fix_here',v)}, enumerable: true, configurable: true},
rotation_axis: {get: function(){return this._getter('rotation_axis')}, set: function(v){this._setter('rotation_axis',v)}, enumerable: true, configurable: true},
partial_opening: {get: function(){return this._getter('partial_opening')}, set: function(v){this._setter('partial_opening',v)}, enumerable: true, configurable: true},
outline: {get: function(){return this._getter('outline')}, set: function(v){this._setter('outline',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
dop: {get: function(){return this._getter('dop')}, set: function(v){this._setter('dop',v)}, enumerable: true, configurable: true},
nom_set: {get: function(){return this._getter('nom_set')}, set: function(v){this._setter('nom_set',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
handle_height_base: {get: function(){return this._getter('handle_height_base')}, set: function(v){this._setter('handle_height_base',v)}, enumerable: true, configurable: true},
handle_height_min: {get: function(){return this._getter('handle_height_min')}, set: function(v){this._setter('handle_height_min',v)}, enumerable: true, configurable: true},
handle_height_max: {get: function(){return this._getter('handle_height_max')}, set: function(v){this._setter('handle_height_max',v)}, enumerable: true, configurable: true},
contraction: {get: function(){return this._getter('contraction')}, set: function(v){this._setter('contraction',v)}, enumerable: true, configurable: true},
contraction_option: {get: function(){return this._getter('contraction_option')}, set: function(v){this._setter('contraction_option',v)}, enumerable: true, configurable: true},
coefficient: {get: function(){return this._getter('coefficient')}, set: function(v){this._setter('coefficient',v)}, enumerable: true, configurable: true},
flap_weight_min: {get: function(){return this._getter('flap_weight_min')}, set: function(v){this._setter('flap_weight_min',v)}, enumerable: true, configurable: true},
flap_weight_max: {get: function(){return this._getter('flap_weight_max')}, set: function(v){this._setter('flap_weight_max',v)}, enumerable: true, configurable: true},
side: {get: function(){return this._getter('side')}, set: function(v){this._setter('side',v)}, enumerable: true, configurable: true},
cnn_side: {get: function(){return this._getter('cnn_side')}, set: function(v){this._setter('cnn_side',v)}, enumerable: true, configurable: true},
offset_option: {get: function(){return this._getter('offset_option')}, set: function(v){this._setter('offset_option',v)}, enumerable: true, configurable: true},
formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
transfer_option: {get: function(){return this._getter('transfer_option')}, set: function(v){this._setter('transfer_option',v)}, enumerable: true, configurable: true},
is_main_specification_row: {get: function(){return this._getter('is_main_specification_row')}, set: function(v){this._setter('is_main_specification_row',v)}, enumerable: true, configurable: true},
is_set_row: {get: function(){return this._getter('is_set_row')}, set: function(v){this._setter('is_set_row',v)}, enumerable: true, configurable: true},
is_procedure_row: {get: function(){return this._getter('is_procedure_row')}, set: function(v){this._setter('is_procedure_row',v)}, enumerable: true, configurable: true},
is_order_row: {get: function(){return this._getter('is_order_row')}, set: function(v){this._setter('is_order_row',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
dop: {get: function(){return this._getter('dop')}, set: function(v){this._setter('dop',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
dop: {get: function(){return this._getter('dop')}, set: function(v){this._setter('dop',v)}, enumerable: true, configurable: true},
side: {get: function(){return this._getter('side')}, set: function(v){this._setter('side',v)}, enumerable: true, configurable: true},
lmin: {get: function(){return this._getter('lmin')}, set: function(v){this._setter('lmin',v)}, enumerable: true, configurable: true},
lmax: {get: function(){return this._getter('lmax')}, set: function(v){this._setter('lmax',v)}, enumerable: true, configurable: true},
amin: {get: function(){return this._getter('amin')}, set: function(v){this._setter('amin',v)}, enumerable: true, configurable: true},
amax: {get: function(){return this._getter('amax')}, set: function(v){this._setter('amax',v)}, enumerable: true, configurable: true}});
CatFurns.prototype.__define('specification_restrictions', {get: function(){return this._getter_ts('specification_restrictions')}, set: function(v){this._setter_ts('specification_restrictions',v)}, enumerable: true, configurable: true});
function CatFurnsColorsRow(owner){CatFurnsColorsRow.superclass.constructor.call(this, owner)};
CatFurnsColorsRow._extend($p.TabularSectionRow);
$p.CatFurnsColorsRow = CatFurnsColorsRow;
CatFurnsColorsRow.prototype.__define({side: {get: function(){return this._getter('side')}, set: function(v){this._setter('side',v)}, enumerable: true, configurable: true},
lmin: {get: function(){return this._getter('lmin')}, set: function(v){this._setter('lmin',v)}, enumerable: true, configurable: true},
lmax: {get: function(){return this._getter('lmax')}, set: function(v){this._setter('lmax',v)}, enumerable: true, configurable: true},
amin: {get: function(){return this._getter('amin')}, set: function(v){this._setter('amin',v)}, enumerable: true, configurable: true},
amax: {get: function(){return this._getter('amax')}, set: function(v){this._setter('amax',v)}, enumerable: true, configurable: true},
arc_available: {get: function(){return this._getter('arc_available')}, set: function(v){this._setter('arc_available',v)}, enumerable: true, configurable: true},
shtulp_available: {get: function(){return this._getter('shtulp_available')}, set: function(v){this._setter('shtulp_available',v)}, enumerable: true, configurable: true},
shtulp_fix_here: {get: function(){return this._getter('shtulp_fix_here')}, set: function(v){this._setter('shtulp_fix_here',v)}, enumerable: true, configurable: true},
rotation_axis: {get: function(){return this._getter('rotation_axis')}, set: function(v){this._setter('rotation_axis',v)}, enumerable: true, configurable: true},
partial_opening: {get: function(){return this._getter('partial_opening')}, set: function(v){this._setter('partial_opening',v)}, enumerable: true, configurable: true},
outline: {get: function(){return this._getter('outline')}, set: function(v){this._setter('outline',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
dop: {get: function(){return this._getter('dop')}, set: function(v){this._setter('dop',v)}, enumerable: true, configurable: true},
nom_set: {get: function(){return this._getter('nom_set')}, set: function(v){this._setter('nom_set',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
handle_height_base: {get: function(){return this._getter('handle_height_base')}, set: function(v){this._setter('handle_height_base',v)}, enumerable: true, configurable: true},
handle_height_min: {get: function(){return this._getter('handle_height_min')}, set: function(v){this._setter('handle_height_min',v)}, enumerable: true, configurable: true},
handle_height_max: {get: function(){return this._getter('handle_height_max')}, set: function(v){this._setter('handle_height_max',v)}, enumerable: true, configurable: true},
contraction: {get: function(){return this._getter('contraction')}, set: function(v){this._setter('contraction',v)}, enumerable: true, configurable: true},
contraction_option: {get: function(){return this._getter('contraction_option')}, set: function(v){this._setter('contraction_option',v)}, enumerable: true, configurable: true},
coefficient: {get: function(){return this._getter('coefficient')}, set: function(v){this._setter('coefficient',v)}, enumerable: true, configurable: true},
flap_weight_min: {get: function(){return this._getter('flap_weight_min')}, set: function(v){this._setter('flap_weight_min',v)}, enumerable: true, configurable: true},
flap_weight_max: {get: function(){return this._getter('flap_weight_max')}, set: function(v){this._setter('flap_weight_max',v)}, enumerable: true, configurable: true},
side: {get: function(){return this._getter('side')}, set: function(v){this._setter('side',v)}, enumerable: true, configurable: true},
cnn_side: {get: function(){return this._getter('cnn_side')}, set: function(v){this._setter('cnn_side',v)}, enumerable: true, configurable: true},
offset_option: {get: function(){return this._getter('offset_option')}, set: function(v){this._setter('offset_option',v)}, enumerable: true, configurable: true},
formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
transfer_option: {get: function(){return this._getter('transfer_option')}, set: function(v){this._setter('transfer_option',v)}, enumerable: true, configurable: true},
is_main_specification_row: {get: function(){return this._getter('is_main_specification_row')}, set: function(v){this._setter('is_main_specification_row',v)}, enumerable: true, configurable: true},
is_set_row: {get: function(){return this._getter('is_set_row')}, set: function(v){this._setter('is_set_row',v)}, enumerable: true, configurable: true},
is_procedure_row: {get: function(){return this._getter('is_procedure_row')}, set: function(v){this._setter('is_procedure_row',v)}, enumerable: true, configurable: true},
is_order_row: {get: function(){return this._getter('is_order_row')}, set: function(v){this._setter('is_order_row',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
dop: {get: function(){return this._getter('dop')}, set: function(v){this._setter('dop',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
dop: {get: function(){return this._getter('dop')}, set: function(v){this._setter('dop',v)}, enumerable: true, configurable: true},
side: {get: function(){return this._getter('side')}, set: function(v){this._setter('side',v)}, enumerable: true, configurable: true},
lmin: {get: function(){return this._getter('lmin')}, set: function(v){this._setter('lmin',v)}, enumerable: true, configurable: true},
lmax: {get: function(){return this._getter('lmax')}, set: function(v){this._setter('lmax',v)}, enumerable: true, configurable: true},
amin: {get: function(){return this._getter('amin')}, set: function(v){this._setter('amin',v)}, enumerable: true, configurable: true},
amax: {get: function(){return this._getter('amax')}, set: function(v){this._setter('amax',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true}});
CatFurns.prototype.__define('colors', {get: function(){return this._getter_ts('colors')}, set: function(v){this._setter_ts('colors',v)}, enumerable: true, configurable: true});
$p.cat.furns = new $p.CatManager('cat.furns');

/**
* ### Справочник пзЦвета
* Цвета
* @class CatClrs
* @extends CatObj
* @constructor 
*/
function CatClrs(attr, manager){CatClrs.superclass.constructor.call(this, attr, manager)}
CatClrs._extend($p.CatObj);
$p.CatClrs = CatClrs;
CatClrs.prototype.__define({ral: {get: function(){return this._getter('ral')}, set: function(v){this._setter('ral',v)}, enumerable: true, configurable: true},
machine_tools_clr: {get: function(){return this._getter('machine_tools_clr')}, set: function(v){this._setter('machine_tools_clr',v)}, enumerable: true, configurable: true},
clr_str: {get: function(){return this._getter('clr_str')}, set: function(v){this._setter('clr_str',v)}, enumerable: true, configurable: true},
clr_out: {get: function(){return this._getter('clr_out')}, set: function(v){this._setter('clr_out',v)}, enumerable: true, configurable: true},
clr_in: {get: function(){return this._getter('clr_in')}, set: function(v){this._setter('clr_in',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
$p.cat.clrs = new $p.CatManager('cat.clrs');

/**
* ### Справочник ЦветоЦеновыеГруппы
* Цвето-ценовые группы
* @class CatColor_price_groups
* @extends CatObj
* @constructor 
*/
function CatColor_price_groups(attr, manager){CatColor_price_groups.superclass.constructor.call(this, attr, manager)}
CatColor_price_groups._extend($p.CatObj);
$p.CatColor_price_groups = CatColor_price_groups;
CatColor_price_groups.prototype.__define({for_pricing_only: {get: function(){return this._getter('for_pricing_only')}, set: function(v){this._setter('for_pricing_only',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
function CatColor_price_groupsPrice_groupsRow(owner){CatColor_price_groupsPrice_groupsRow.superclass.constructor.call(this, owner)};
CatColor_price_groupsPrice_groupsRow._extend($p.TabularSectionRow);
$p.CatColor_price_groupsPrice_groupsRow = CatColor_price_groupsPrice_groupsRow;
CatColor_price_groupsPrice_groupsRow.prototype.__define({price_group: {get: function(){return this._getter('price_group')}, set: function(v){this._setter('price_group',v)}, enumerable: true, configurable: true}});
CatColor_price_groups.prototype.__define('price_groups', {get: function(){return this._getter_ts('price_groups')}, set: function(v){this._setter_ts('price_groups',v)}, enumerable: true, configurable: true});
function CatColor_price_groupsClr_conformityRow(owner){CatColor_price_groupsClr_conformityRow.superclass.constructor.call(this, owner)};
CatColor_price_groupsClr_conformityRow._extend($p.TabularSectionRow);
$p.CatColor_price_groupsClr_conformityRow = CatColor_price_groupsClr_conformityRow;
CatColor_price_groupsClr_conformityRow.prototype.__define({price_group: {get: function(){return this._getter('price_group')}, set: function(v){this._setter('price_group',v)}, enumerable: true, configurable: true},
clr1: {get: function(){return this._getter('clr1')}, set: function(v){this._setter('clr1',v)}, enumerable: true, configurable: true},
clr2: {get: function(){return this._getter('clr2')}, set: function(v){this._setter('clr2',v)}, enumerable: true, configurable: true}});
CatColor_price_groups.prototype.__define('clr_conformity', {get: function(){return this._getter_ts('clr_conformity')}, set: function(v){this._setter_ts('clr_conformity',v)}, enumerable: true, configurable: true});
$p.cat.color_price_groups = new $p.CatManager('cat.color_price_groups');

/**
* ### Справочник Подразделения
* Перечень подразделений предприятия
* @class CatDivisions
* @extends CatObj
* @constructor 
*/
function CatDivisions(attr, manager){CatDivisions.superclass.constructor.call(this, attr, manager)}
CatDivisions._extend($p.CatObj);
$p.CatDivisions = CatDivisions;
CatDivisions.prototype.__define({main_project: {get: function(){return this._getter('main_project')}, set: function(v){this._setter('main_project',v)}, enumerable: true, configurable: true},
sorting: {get: function(){return this._getter('sorting')}, set: function(v){this._setter('sorting',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
function CatDivisionsExtra_fieldsRow(owner){CatDivisionsExtra_fieldsRow.superclass.constructor.call(this, owner)};
CatDivisionsExtra_fieldsRow._extend($p.TabularSectionRow);
$p.CatDivisionsExtra_fieldsRow = CatDivisionsExtra_fieldsRow;
CatDivisionsExtra_fieldsRow.prototype.__define({property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true}});
CatDivisions.prototype.__define('extra_fields', {get: function(){return this._getter_ts('extra_fields')}, set: function(v){this._setter_ts('extra_fields',v)}, enumerable: true, configurable: true});
$p.cat.divisions = new $p.CatManager('cat.divisions');

/**
* ### Справочник Пользователи
* Пользователи
* @class CatUsers
* @extends CatObj
* @constructor 
*/
function CatUsers(attr, manager){CatUsers.superclass.constructor.call(this, attr, manager)}
CatUsers._extend($p.CatObj);
$p.CatUsers = CatUsers;
CatUsers.prototype.__define({invalid: {get: function(){return this._getter('invalid')}, set: function(v){this._setter('invalid',v)}, enumerable: true, configurable: true},
department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
individual_person: {get: function(){return this._getter('individual_person')}, set: function(v){this._setter('individual_person',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
ancillary: {get: function(){return this._getter('ancillary')}, set: function(v){this._setter('ancillary',v)}, enumerable: true, configurable: true},
user_ib_uid: {get: function(){return this._getter('user_ib_uid')}, set: function(v){this._setter('user_ib_uid',v)}, enumerable: true, configurable: true},
user_fresh_uid: {get: function(){return this._getter('user_fresh_uid')}, set: function(v){this._setter('user_fresh_uid',v)}, enumerable: true, configurable: true},
id: {get: function(){return this._getter('id')}, set: function(v){this._setter('id',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
function CatUsersExtra_fieldsRow(owner){CatUsersExtra_fieldsRow.superclass.constructor.call(this, owner)};
CatUsersExtra_fieldsRow._extend($p.TabularSectionRow);
$p.CatUsersExtra_fieldsRow = CatUsersExtra_fieldsRow;
CatUsersExtra_fieldsRow.prototype.__define({property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true}});
CatUsers.prototype.__define('extra_fields', {get: function(){return this._getter_ts('extra_fields')}, set: function(v){this._setter_ts('extra_fields',v)}, enumerable: true, configurable: true});
function CatUsersContact_informationRow(owner){CatUsersContact_informationRow.superclass.constructor.call(this, owner)};
CatUsersContact_informationRow._extend($p.TabularSectionRow);
$p.CatUsersContact_informationRow = CatUsersContact_informationRow;
CatUsersContact_informationRow.prototype.__define({property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true},
type: {get: function(){return this._getter('type')}, set: function(v){this._setter('type',v)}, enumerable: true, configurable: true},
kind: {get: function(){return this._getter('kind')}, set: function(v){this._setter('kind',v)}, enumerable: true, configurable: true},
presentation: {get: function(){return this._getter('presentation')}, set: function(v){this._setter('presentation',v)}, enumerable: true, configurable: true},
values_fields: {get: function(){return this._getter('values_fields')}, set: function(v){this._setter('values_fields',v)}, enumerable: true, configurable: true},
country: {get: function(){return this._getter('country')}, set: function(v){this._setter('country',v)}, enumerable: true, configurable: true},
region: {get: function(){return this._getter('region')}, set: function(v){this._setter('region',v)}, enumerable: true, configurable: true},
city: {get: function(){return this._getter('city')}, set: function(v){this._setter('city',v)}, enumerable: true, configurable: true},
email_address: {get: function(){return this._getter('email_address')}, set: function(v){this._setter('email_address',v)}, enumerable: true, configurable: true},
server_domain_name: {get: function(){return this._getter('server_domain_name')}, set: function(v){this._setter('server_domain_name',v)}, enumerable: true, configurable: true},
phone_number: {get: function(){return this._getter('phone_number')}, set: function(v){this._setter('phone_number',v)}, enumerable: true, configurable: true},
phone_without_codes: {get: function(){return this._getter('phone_without_codes')}, set: function(v){this._setter('phone_without_codes',v)}, enumerable: true, configurable: true},
ВидДляСписка: {get: function(){return this._getter('ВидДляСписка')}, set: function(v){this._setter('ВидДляСписка',v)}, enumerable: true, configurable: true}});
CatUsers.prototype.__define('contact_information', {get: function(){return this._getter_ts('contact_information')}, set: function(v){this._setter_ts('contact_information',v)}, enumerable: true, configurable: true});
$p.cat.users = new $p.CatManager('cat.users');

/**
* ### Справочник Проекты
* Проекты
* @class CatProjects
* @extends CatObj
* @constructor 
*/
function CatProjects(attr, manager){CatProjects.superclass.constructor.call(this, attr, manager)}
CatProjects._extend($p.CatObj);
$p.CatProjects = CatProjects;
CatProjects.prototype.__define({start: {get: function(){return this._getter('start')}, set: function(v){this._setter('start',v)}, enumerable: true, configurable: true},
finish: {get: function(){return this._getter('finish')}, set: function(v){this._setter('finish',v)}, enumerable: true, configurable: true},
launch: {get: function(){return this._getter('launch')}, set: function(v){this._setter('launch',v)}, enumerable: true, configurable: true},
readiness: {get: function(){return this._getter('readiness')}, set: function(v){this._setter('readiness',v)}, enumerable: true, configurable: true},
finished: {get: function(){return this._getter('finished')}, set: function(v){this._setter('finished',v)}, enumerable: true, configurable: true},
responsible: {get: function(){return this._getter('responsible')}, set: function(v){this._setter('responsible',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
function CatProjectsExtra_fieldsRow(owner){CatProjectsExtra_fieldsRow.superclass.constructor.call(this, owner)};
CatProjectsExtra_fieldsRow._extend($p.TabularSectionRow);
$p.CatProjectsExtra_fieldsRow = CatProjectsExtra_fieldsRow;
CatProjectsExtra_fieldsRow.prototype.__define({property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true}});
CatProjects.prototype.__define('extra_fields', {get: function(){return this._getter_ts('extra_fields')}, set: function(v){this._setter_ts('extra_fields',v)}, enumerable: true, configurable: true});
$p.cat.projects = new $p.CatManager('cat.projects');

/**
* ### Справочник Склады
* Сведения о местах хранения товаров (складах), их структуре и физических лицах, назначенных материально ответственными (МОЛ) за тот или иной склад
* @class CatStores
* @extends CatObj
* @constructor 
*/
function CatStores(attr, manager){CatStores.superclass.constructor.call(this, attr, manager)}
CatStores._extend($p.CatObj);
$p.CatStores = CatStores;
CatStores.prototype.__define({note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
function CatStoresExtra_fieldsRow(owner){CatStoresExtra_fieldsRow.superclass.constructor.call(this, owner)};
CatStoresExtra_fieldsRow._extend($p.TabularSectionRow);
$p.CatStoresExtra_fieldsRow = CatStoresExtra_fieldsRow;
CatStoresExtra_fieldsRow.prototype.__define({property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true}});
CatStores.prototype.__define('extra_fields', {get: function(){return this._getter_ts('extra_fields')}, set: function(v){this._setter_ts('extra_fields',v)}, enumerable: true, configurable: true});
$p.cat.stores = new $p.CatManager('cat.stores');

/**
* ### Справочник СтатьиДвиженияДенежныхСредств
* Перечень статей движения денежных средств (ДДС), используемых в предприятии для проведения анализа поступлений и расходов в разрезе статей движения денежных средств. 
* @class CatCash_flow_articles
* @extends CatObj
* @constructor 
*/
function CatCash_flow_articles(attr, manager){CatCash_flow_articles.superclass.constructor.call(this, attr, manager)}
CatCash_flow_articles._extend($p.CatObj);
$p.CatCash_flow_articles = CatCash_flow_articles;
CatCash_flow_articles.prototype.__define({definition: {get: function(){return this._getter('definition')}, set: function(v){this._setter('definition',v)}, enumerable: true, configurable: true},
sorting_field: {get: function(){return this._getter('sorting_field')}, set: function(v){this._setter('sorting_field',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
$p.cat.cash_flow_articles = new $p.CatManager('cat.cash_flow_articles');

/**
* ### Справочник ТипыЦенНоменклатуры
* Перечень типов отпускных цен предприятия
* @class CatNom_prices_types
* @extends CatObj
* @constructor 
*/
function CatNom_prices_types(attr, manager){CatNom_prices_types.superclass.constructor.call(this, attr, manager)}
CatNom_prices_types._extend($p.CatObj);
$p.CatNom_prices_types = CatNom_prices_types;
CatNom_prices_types.prototype.__define({price_currency: {get: function(){return this._getter('price_currency')}, set: function(v){this._setter('price_currency',v)}, enumerable: true, configurable: true},
discount_percent: {get: function(){return this._getter('discount_percent')}, set: function(v){this._setter('discount_percent',v)}, enumerable: true, configurable: true},
vat_price_included: {get: function(){return this._getter('vat_price_included')}, set: function(v){this._setter('vat_price_included',v)}, enumerable: true, configurable: true},
rounding_order: {get: function(){return this._getter('rounding_order')}, set: function(v){this._setter('rounding_order',v)}, enumerable: true, configurable: true},
rounding_in_a_big_way: {get: function(){return this._getter('rounding_in_a_big_way')}, set: function(v){this._setter('rounding_in_a_big_way',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
$p.cat.nom_prices_types = new $p.CatManager('cat.nom_prices_types');

/**
* ### Справочник ФизическиеЛица
* Физические лица
* @class CatIndividuals
* @extends CatObj
* @constructor 
*/
function CatIndividuals(attr, manager){CatIndividuals.superclass.constructor.call(this, attr, manager)}
CatIndividuals._extend($p.CatObj);
$p.CatIndividuals = CatIndividuals;
CatIndividuals.prototype.__define({birth_date: {get: function(){return this._getter('birth_date')}, set: function(v){this._setter('birth_date',v)}, enumerable: true, configurable: true},
inn: {get: function(){return this._getter('inn')}, set: function(v){this._setter('inn',v)}, enumerable: true, configurable: true},
imns_code: {get: function(){return this._getter('imns_code')}, set: function(v){this._setter('imns_code',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
pfr_number: {get: function(){return this._getter('pfr_number')}, set: function(v){this._setter('pfr_number',v)}, enumerable: true, configurable: true},
sex: {get: function(){return this._getter('sex')}, set: function(v){this._setter('sex',v)}, enumerable: true, configurable: true},
birth_place: {get: function(){return this._getter('birth_place')}, set: function(v){this._setter('birth_place',v)}, enumerable: true, configurable: true},
ОсновноеИзображение: {get: function(){return this._getter('ОсновноеИзображение')}, set: function(v){this._setter('ОсновноеИзображение',v)}, enumerable: true, configurable: true},
Фамилия: {get: function(){return this._getter('Фамилия')}, set: function(v){this._setter('Фамилия',v)}, enumerable: true, configurable: true},
Имя: {get: function(){return this._getter('Имя')}, set: function(v){this._setter('Имя',v)}, enumerable: true, configurable: true},
Отчество: {get: function(){return this._getter('Отчество')}, set: function(v){this._setter('Отчество',v)}, enumerable: true, configurable: true},
ФамилияРП: {get: function(){return this._getter('ФамилияРП')}, set: function(v){this._setter('ФамилияРП',v)}, enumerable: true, configurable: true},
ИмяРП: {get: function(){return this._getter('ИмяРП')}, set: function(v){this._setter('ИмяРП',v)}, enumerable: true, configurable: true},
ОтчествоРП: {get: function(){return this._getter('ОтчествоРП')}, set: function(v){this._setter('ОтчествоРП',v)}, enumerable: true, configurable: true},
ОснованиеРП: {get: function(){return this._getter('ОснованиеРП')}, set: function(v){this._setter('ОснованиеРП',v)}, enumerable: true, configurable: true},
ДолжностьРП: {get: function(){return this._getter('ДолжностьРП')}, set: function(v){this._setter('ДолжностьРП',v)}, enumerable: true, configurable: true},
Должность: {get: function(){return this._getter('Должность')}, set: function(v){this._setter('Должность',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
function CatIndividualsContact_informationRow(owner){CatIndividualsContact_informationRow.superclass.constructor.call(this, owner)};
CatIndividualsContact_informationRow._extend($p.TabularSectionRow);
$p.CatIndividualsContact_informationRow = CatIndividualsContact_informationRow;
CatIndividualsContact_informationRow.prototype.__define({type: {get: function(){return this._getter('type')}, set: function(v){this._setter('type',v)}, enumerable: true, configurable: true},
kind: {get: function(){return this._getter('kind')}, set: function(v){this._setter('kind',v)}, enumerable: true, configurable: true},
presentation: {get: function(){return this._getter('presentation')}, set: function(v){this._setter('presentation',v)}, enumerable: true, configurable: true},
values_fields: {get: function(){return this._getter('values_fields')}, set: function(v){this._setter('values_fields',v)}, enumerable: true, configurable: true},
country: {get: function(){return this._getter('country')}, set: function(v){this._setter('country',v)}, enumerable: true, configurable: true},
region: {get: function(){return this._getter('region')}, set: function(v){this._setter('region',v)}, enumerable: true, configurable: true},
city: {get: function(){return this._getter('city')}, set: function(v){this._setter('city',v)}, enumerable: true, configurable: true},
email_address: {get: function(){return this._getter('email_address')}, set: function(v){this._setter('email_address',v)}, enumerable: true, configurable: true},
server_domain_name: {get: function(){return this._getter('server_domain_name')}, set: function(v){this._setter('server_domain_name',v)}, enumerable: true, configurable: true},
phone_number: {get: function(){return this._getter('phone_number')}, set: function(v){this._setter('phone_number',v)}, enumerable: true, configurable: true},
phone_without_codes: {get: function(){return this._getter('phone_without_codes')}, set: function(v){this._setter('phone_without_codes',v)}, enumerable: true, configurable: true},
ВидДляСписка: {get: function(){return this._getter('ВидДляСписка')}, set: function(v){this._setter('ВидДляСписка',v)}, enumerable: true, configurable: true}});
CatIndividuals.prototype.__define('contact_information', {get: function(){return this._getter_ts('contact_information')}, set: function(v){this._setter_ts('contact_information',v)}, enumerable: true, configurable: true});
$p.cat.individuals = new $p.CatManager('cat.individuals');

/**
* ### Справочник ХарактеристикиНоменклатуры
* Дополнительные характеристики элементов номенклатуры: цвет, размер и т.п.
* @class CatCharacteristics
* @extends CatObj
* @constructor 
*/
function CatCharacteristics(attr, manager){CatCharacteristics.superclass.constructor.call(this, attr, manager)}
CatCharacteristics._extend($p.CatObj);
$p.CatCharacteristics = CatCharacteristics;
CatCharacteristics.prototype.__define({x: {get: function(){return this._getter('x')}, set: function(v){this._setter('x',v)}, enumerable: true, configurable: true},
y: {get: function(){return this._getter('y')}, set: function(v){this._setter('y',v)}, enumerable: true, configurable: true},
z: {get: function(){return this._getter('z')}, set: function(v){this._setter('z',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
weight: {get: function(){return this._getter('weight')}, set: function(v){this._setter('weight',v)}, enumerable: true, configurable: true},
condition_products: {get: function(){return this._getter('condition_products')}, set: function(v){this._setter('condition_products',v)}, enumerable: true, configurable: true},
calc_order: {get: function(){return this._getter('calc_order')}, set: function(v){this._setter('calc_order',v)}, enumerable: true, configurable: true},
product: {get: function(){return this._getter('product')}, set: function(v){this._setter('product',v)}, enumerable: true, configurable: true},
leading_product: {get: function(){return this._getter('leading_product')}, set: function(v){this._setter('leading_product',v)}, enumerable: true, configurable: true},
leading_elm: {get: function(){return this._getter('leading_elm')}, set: function(v){this._setter('leading_elm',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
partner: {get: function(){return this._getter('partner')}, set: function(v){this._setter('partner',v)}, enumerable: true, configurable: true},
sys: {get: function(){return this._getter('sys')}, set: function(v){this._setter('sys',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
owner: {get: function(){return this._getter('owner')}, set: function(v){this._setter('owner',v)}, enumerable: true, configurable: true}});
function CatCharacteristicsConstructionsRow(owner){CatCharacteristicsConstructionsRow.superclass.constructor.call(this, owner)};
CatCharacteristicsConstructionsRow._extend($p.TabularSectionRow);
$p.CatCharacteristicsConstructionsRow = CatCharacteristicsConstructionsRow;
CatCharacteristicsConstructionsRow.prototype.__define({cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
x: {get: function(){return this._getter('x')}, set: function(v){this._setter('x',v)}, enumerable: true, configurable: true},
y: {get: function(){return this._getter('y')}, set: function(v){this._setter('y',v)}, enumerable: true, configurable: true},
z: {get: function(){return this._getter('z')}, set: function(v){this._setter('z',v)}, enumerable: true, configurable: true},
w: {get: function(){return this._getter('w')}, set: function(v){this._setter('w',v)}, enumerable: true, configurable: true},
h: {get: function(){return this._getter('h')}, set: function(v){this._setter('h',v)}, enumerable: true, configurable: true},
furn: {get: function(){return this._getter('furn')}, set: function(v){this._setter('furn',v)}, enumerable: true, configurable: true},
clr_furn: {get: function(){return this._getter('clr_furn')}, set: function(v){this._setter('clr_furn',v)}, enumerable: true, configurable: true},
direction: {get: function(){return this._getter('direction')}, set: function(v){this._setter('direction',v)}, enumerable: true, configurable: true},
mskt: {get: function(){return this._getter('mskt')}, set: function(v){this._setter('mskt',v)}, enumerable: true, configurable: true},
clr_mskt: {get: function(){return this._getter('clr_mskt')}, set: function(v){this._setter('clr_mskt',v)}, enumerable: true, configurable: true},
h_ruch: {get: function(){return this._getter('h_ruch')}, set: function(v){this._setter('h_ruch',v)}, enumerable: true, configurable: true},
fix_ruch: {get: function(){return this._getter('fix_ruch')}, set: function(v){this._setter('fix_ruch',v)}, enumerable: true, configurable: true},
is_rectangular: {get: function(){return this._getter('is_rectangular')}, set: function(v){this._setter('is_rectangular',v)}, enumerable: true, configurable: true}});
CatCharacteristics.prototype.__define('constructions', {get: function(){return this._getter_ts('constructions')}, set: function(v){this._setter_ts('constructions',v)}, enumerable: true, configurable: true});
function CatCharacteristicsCoordinatesRow(owner){CatCharacteristicsCoordinatesRow.superclass.constructor.call(this, owner)};
CatCharacteristicsCoordinatesRow._extend($p.TabularSectionRow);
$p.CatCharacteristicsCoordinatesRow = CatCharacteristicsCoordinatesRow;
CatCharacteristicsCoordinatesRow.prototype.__define({cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
x: {get: function(){return this._getter('x')}, set: function(v){this._setter('x',v)}, enumerable: true, configurable: true},
y: {get: function(){return this._getter('y')}, set: function(v){this._setter('y',v)}, enumerable: true, configurable: true},
z: {get: function(){return this._getter('z')}, set: function(v){this._setter('z',v)}, enumerable: true, configurable: true},
w: {get: function(){return this._getter('w')}, set: function(v){this._setter('w',v)}, enumerable: true, configurable: true},
h: {get: function(){return this._getter('h')}, set: function(v){this._setter('h',v)}, enumerable: true, configurable: true},
furn: {get: function(){return this._getter('furn')}, set: function(v){this._setter('furn',v)}, enumerable: true, configurable: true},
clr_furn: {get: function(){return this._getter('clr_furn')}, set: function(v){this._setter('clr_furn',v)}, enumerable: true, configurable: true},
direction: {get: function(){return this._getter('direction')}, set: function(v){this._setter('direction',v)}, enumerable: true, configurable: true},
mskt: {get: function(){return this._getter('mskt')}, set: function(v){this._setter('mskt',v)}, enumerable: true, configurable: true},
clr_mskt: {get: function(){return this._getter('clr_mskt')}, set: function(v){this._setter('clr_mskt',v)}, enumerable: true, configurable: true},
h_ruch: {get: function(){return this._getter('h_ruch')}, set: function(v){this._setter('h_ruch',v)}, enumerable: true, configurable: true},
fix_ruch: {get: function(){return this._getter('fix_ruch')}, set: function(v){this._setter('fix_ruch',v)}, enumerable: true, configurable: true},
is_rectangular: {get: function(){return this._getter('is_rectangular')}, set: function(v){this._setter('is_rectangular',v)}, enumerable: true, configurable: true},
cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
path_data: {get: function(){return this._getter('path_data')}, set: function(v){this._setter('path_data',v)}, enumerable: true, configurable: true},
x1: {get: function(){return this._getter('x1')}, set: function(v){this._setter('x1',v)}, enumerable: true, configurable: true},
y1: {get: function(){return this._getter('y1')}, set: function(v){this._setter('y1',v)}, enumerable: true, configurable: true},
x2: {get: function(){return this._getter('x2')}, set: function(v){this._setter('x2',v)}, enumerable: true, configurable: true},
y2: {get: function(){return this._getter('y2')}, set: function(v){this._setter('y2',v)}, enumerable: true, configurable: true},
r: {get: function(){return this._getter('r')}, set: function(v){this._setter('r',v)}, enumerable: true, configurable: true},
arc_ccw: {get: function(){return this._getter('arc_ccw')}, set: function(v){this._setter('arc_ccw',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
angle_hor: {get: function(){return this._getter('angle_hor')}, set: function(v){this._setter('angle_hor',v)}, enumerable: true, configurable: true},
alp1: {get: function(){return this._getter('alp1')}, set: function(v){this._setter('alp1',v)}, enumerable: true, configurable: true},
alp2: {get: function(){return this._getter('alp2')}, set: function(v){this._setter('alp2',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
pos: {get: function(){return this._getter('pos')}, set: function(v){this._setter('pos',v)}, enumerable: true, configurable: true},
orientation: {get: function(){return this._getter('orientation')}, set: function(v){this._setter('orientation',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true}});
CatCharacteristics.prototype.__define('coordinates', {get: function(){return this._getter_ts('coordinates')}, set: function(v){this._setter_ts('coordinates',v)}, enumerable: true, configurable: true});
function CatCharacteristicsCnn_elmntsRow(owner){CatCharacteristicsCnn_elmntsRow.superclass.constructor.call(this, owner)};
CatCharacteristicsCnn_elmntsRow._extend($p.TabularSectionRow);
$p.CatCharacteristicsCnn_elmntsRow = CatCharacteristicsCnn_elmntsRow;
CatCharacteristicsCnn_elmntsRow.prototype.__define({cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
x: {get: function(){return this._getter('x')}, set: function(v){this._setter('x',v)}, enumerable: true, configurable: true},
y: {get: function(){return this._getter('y')}, set: function(v){this._setter('y',v)}, enumerable: true, configurable: true},
z: {get: function(){return this._getter('z')}, set: function(v){this._setter('z',v)}, enumerable: true, configurable: true},
w: {get: function(){return this._getter('w')}, set: function(v){this._setter('w',v)}, enumerable: true, configurable: true},
h: {get: function(){return this._getter('h')}, set: function(v){this._setter('h',v)}, enumerable: true, configurable: true},
furn: {get: function(){return this._getter('furn')}, set: function(v){this._setter('furn',v)}, enumerable: true, configurable: true},
clr_furn: {get: function(){return this._getter('clr_furn')}, set: function(v){this._setter('clr_furn',v)}, enumerable: true, configurable: true},
direction: {get: function(){return this._getter('direction')}, set: function(v){this._setter('direction',v)}, enumerable: true, configurable: true},
mskt: {get: function(){return this._getter('mskt')}, set: function(v){this._setter('mskt',v)}, enumerable: true, configurable: true},
clr_mskt: {get: function(){return this._getter('clr_mskt')}, set: function(v){this._setter('clr_mskt',v)}, enumerable: true, configurable: true},
h_ruch: {get: function(){return this._getter('h_ruch')}, set: function(v){this._setter('h_ruch',v)}, enumerable: true, configurable: true},
fix_ruch: {get: function(){return this._getter('fix_ruch')}, set: function(v){this._setter('fix_ruch',v)}, enumerable: true, configurable: true},
is_rectangular: {get: function(){return this._getter('is_rectangular')}, set: function(v){this._setter('is_rectangular',v)}, enumerable: true, configurable: true},
cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
path_data: {get: function(){return this._getter('path_data')}, set: function(v){this._setter('path_data',v)}, enumerable: true, configurable: true},
x1: {get: function(){return this._getter('x1')}, set: function(v){this._setter('x1',v)}, enumerable: true, configurable: true},
y1: {get: function(){return this._getter('y1')}, set: function(v){this._setter('y1',v)}, enumerable: true, configurable: true},
x2: {get: function(){return this._getter('x2')}, set: function(v){this._setter('x2',v)}, enumerable: true, configurable: true},
y2: {get: function(){return this._getter('y2')}, set: function(v){this._setter('y2',v)}, enumerable: true, configurable: true},
r: {get: function(){return this._getter('r')}, set: function(v){this._setter('r',v)}, enumerable: true, configurable: true},
arc_ccw: {get: function(){return this._getter('arc_ccw')}, set: function(v){this._setter('arc_ccw',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
angle_hor: {get: function(){return this._getter('angle_hor')}, set: function(v){this._setter('angle_hor',v)}, enumerable: true, configurable: true},
alp1: {get: function(){return this._getter('alp1')}, set: function(v){this._setter('alp1',v)}, enumerable: true, configurable: true},
alp2: {get: function(){return this._getter('alp2')}, set: function(v){this._setter('alp2',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
pos: {get: function(){return this._getter('pos')}, set: function(v){this._setter('pos',v)}, enumerable: true, configurable: true},
orientation: {get: function(){return this._getter('orientation')}, set: function(v){this._setter('orientation',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
elm1: {get: function(){return this._getter('elm1')}, set: function(v){this._setter('elm1',v)}, enumerable: true, configurable: true},
node1: {get: function(){return this._getter('node1')}, set: function(v){this._setter('node1',v)}, enumerable: true, configurable: true},
elm2: {get: function(){return this._getter('elm2')}, set: function(v){this._setter('elm2',v)}, enumerable: true, configurable: true},
node2: {get: function(){return this._getter('node2')}, set: function(v){this._setter('node2',v)}, enumerable: true, configurable: true},
cnn: {get: function(){return this._getter('cnn')}, set: function(v){this._setter('cnn',v)}, enumerable: true, configurable: true},
aperture_len: {get: function(){return this._getter('aperture_len')}, set: function(v){this._setter('aperture_len',v)}, enumerable: true, configurable: true}});
CatCharacteristics.prototype.__define('cnn_elmnts', {get: function(){return this._getter_ts('cnn_elmnts')}, set: function(v){this._setter_ts('cnn_elmnts',v)}, enumerable: true, configurable: true});
function CatCharacteristicsParamsRow(owner){CatCharacteristicsParamsRow.superclass.constructor.call(this, owner)};
CatCharacteristicsParamsRow._extend($p.TabularSectionRow);
$p.CatCharacteristicsParamsRow = CatCharacteristicsParamsRow;
CatCharacteristicsParamsRow.prototype.__define({cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
x: {get: function(){return this._getter('x')}, set: function(v){this._setter('x',v)}, enumerable: true, configurable: true},
y: {get: function(){return this._getter('y')}, set: function(v){this._setter('y',v)}, enumerable: true, configurable: true},
z: {get: function(){return this._getter('z')}, set: function(v){this._setter('z',v)}, enumerable: true, configurable: true},
w: {get: function(){return this._getter('w')}, set: function(v){this._setter('w',v)}, enumerable: true, configurable: true},
h: {get: function(){return this._getter('h')}, set: function(v){this._setter('h',v)}, enumerable: true, configurable: true},
furn: {get: function(){return this._getter('furn')}, set: function(v){this._setter('furn',v)}, enumerable: true, configurable: true},
clr_furn: {get: function(){return this._getter('clr_furn')}, set: function(v){this._setter('clr_furn',v)}, enumerable: true, configurable: true},
direction: {get: function(){return this._getter('direction')}, set: function(v){this._setter('direction',v)}, enumerable: true, configurable: true},
mskt: {get: function(){return this._getter('mskt')}, set: function(v){this._setter('mskt',v)}, enumerable: true, configurable: true},
clr_mskt: {get: function(){return this._getter('clr_mskt')}, set: function(v){this._setter('clr_mskt',v)}, enumerable: true, configurable: true},
h_ruch: {get: function(){return this._getter('h_ruch')}, set: function(v){this._setter('h_ruch',v)}, enumerable: true, configurable: true},
fix_ruch: {get: function(){return this._getter('fix_ruch')}, set: function(v){this._setter('fix_ruch',v)}, enumerable: true, configurable: true},
is_rectangular: {get: function(){return this._getter('is_rectangular')}, set: function(v){this._setter('is_rectangular',v)}, enumerable: true, configurable: true},
cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
path_data: {get: function(){return this._getter('path_data')}, set: function(v){this._setter('path_data',v)}, enumerable: true, configurable: true},
x1: {get: function(){return this._getter('x1')}, set: function(v){this._setter('x1',v)}, enumerable: true, configurable: true},
y1: {get: function(){return this._getter('y1')}, set: function(v){this._setter('y1',v)}, enumerable: true, configurable: true},
x2: {get: function(){return this._getter('x2')}, set: function(v){this._setter('x2',v)}, enumerable: true, configurable: true},
y2: {get: function(){return this._getter('y2')}, set: function(v){this._setter('y2',v)}, enumerable: true, configurable: true},
r: {get: function(){return this._getter('r')}, set: function(v){this._setter('r',v)}, enumerable: true, configurable: true},
arc_ccw: {get: function(){return this._getter('arc_ccw')}, set: function(v){this._setter('arc_ccw',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
angle_hor: {get: function(){return this._getter('angle_hor')}, set: function(v){this._setter('angle_hor',v)}, enumerable: true, configurable: true},
alp1: {get: function(){return this._getter('alp1')}, set: function(v){this._setter('alp1',v)}, enumerable: true, configurable: true},
alp2: {get: function(){return this._getter('alp2')}, set: function(v){this._setter('alp2',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
pos: {get: function(){return this._getter('pos')}, set: function(v){this._setter('pos',v)}, enumerable: true, configurable: true},
orientation: {get: function(){return this._getter('orientation')}, set: function(v){this._setter('orientation',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
elm1: {get: function(){return this._getter('elm1')}, set: function(v){this._setter('elm1',v)}, enumerable: true, configurable: true},
node1: {get: function(){return this._getter('node1')}, set: function(v){this._setter('node1',v)}, enumerable: true, configurable: true},
elm2: {get: function(){return this._getter('elm2')}, set: function(v){this._setter('elm2',v)}, enumerable: true, configurable: true},
node2: {get: function(){return this._getter('node2')}, set: function(v){this._setter('node2',v)}, enumerable: true, configurable: true},
cnn: {get: function(){return this._getter('cnn')}, set: function(v){this._setter('cnn',v)}, enumerable: true, configurable: true},
aperture_len: {get: function(){return this._getter('aperture_len')}, set: function(v){this._setter('aperture_len',v)}, enumerable: true, configurable: true},
cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true}});
CatCharacteristics.prototype.__define('params', {get: function(){return this._getter_ts('params')}, set: function(v){this._setter_ts('params',v)}, enumerable: true, configurable: true});
function CatCharacteristicsGlass_specificationRow(owner){CatCharacteristicsGlass_specificationRow.superclass.constructor.call(this, owner)};
CatCharacteristicsGlass_specificationRow._extend($p.TabularSectionRow);
$p.CatCharacteristicsGlass_specificationRow = CatCharacteristicsGlass_specificationRow;
CatCharacteristicsGlass_specificationRow.prototype.__define({cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
x: {get: function(){return this._getter('x')}, set: function(v){this._setter('x',v)}, enumerable: true, configurable: true},
y: {get: function(){return this._getter('y')}, set: function(v){this._setter('y',v)}, enumerable: true, configurable: true},
z: {get: function(){return this._getter('z')}, set: function(v){this._setter('z',v)}, enumerable: true, configurable: true},
w: {get: function(){return this._getter('w')}, set: function(v){this._setter('w',v)}, enumerable: true, configurable: true},
h: {get: function(){return this._getter('h')}, set: function(v){this._setter('h',v)}, enumerable: true, configurable: true},
furn: {get: function(){return this._getter('furn')}, set: function(v){this._setter('furn',v)}, enumerable: true, configurable: true},
clr_furn: {get: function(){return this._getter('clr_furn')}, set: function(v){this._setter('clr_furn',v)}, enumerable: true, configurable: true},
direction: {get: function(){return this._getter('direction')}, set: function(v){this._setter('direction',v)}, enumerable: true, configurable: true},
mskt: {get: function(){return this._getter('mskt')}, set: function(v){this._setter('mskt',v)}, enumerable: true, configurable: true},
clr_mskt: {get: function(){return this._getter('clr_mskt')}, set: function(v){this._setter('clr_mskt',v)}, enumerable: true, configurable: true},
h_ruch: {get: function(){return this._getter('h_ruch')}, set: function(v){this._setter('h_ruch',v)}, enumerable: true, configurable: true},
fix_ruch: {get: function(){return this._getter('fix_ruch')}, set: function(v){this._setter('fix_ruch',v)}, enumerable: true, configurable: true},
is_rectangular: {get: function(){return this._getter('is_rectangular')}, set: function(v){this._setter('is_rectangular',v)}, enumerable: true, configurable: true},
cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
path_data: {get: function(){return this._getter('path_data')}, set: function(v){this._setter('path_data',v)}, enumerable: true, configurable: true},
x1: {get: function(){return this._getter('x1')}, set: function(v){this._setter('x1',v)}, enumerable: true, configurable: true},
y1: {get: function(){return this._getter('y1')}, set: function(v){this._setter('y1',v)}, enumerable: true, configurable: true},
x2: {get: function(){return this._getter('x2')}, set: function(v){this._setter('x2',v)}, enumerable: true, configurable: true},
y2: {get: function(){return this._getter('y2')}, set: function(v){this._setter('y2',v)}, enumerable: true, configurable: true},
r: {get: function(){return this._getter('r')}, set: function(v){this._setter('r',v)}, enumerable: true, configurable: true},
arc_ccw: {get: function(){return this._getter('arc_ccw')}, set: function(v){this._setter('arc_ccw',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
angle_hor: {get: function(){return this._getter('angle_hor')}, set: function(v){this._setter('angle_hor',v)}, enumerable: true, configurable: true},
alp1: {get: function(){return this._getter('alp1')}, set: function(v){this._setter('alp1',v)}, enumerable: true, configurable: true},
alp2: {get: function(){return this._getter('alp2')}, set: function(v){this._setter('alp2',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
pos: {get: function(){return this._getter('pos')}, set: function(v){this._setter('pos',v)}, enumerable: true, configurable: true},
orientation: {get: function(){return this._getter('orientation')}, set: function(v){this._setter('orientation',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
elm1: {get: function(){return this._getter('elm1')}, set: function(v){this._setter('elm1',v)}, enumerable: true, configurable: true},
node1: {get: function(){return this._getter('node1')}, set: function(v){this._setter('node1',v)}, enumerable: true, configurable: true},
elm2: {get: function(){return this._getter('elm2')}, set: function(v){this._setter('elm2',v)}, enumerable: true, configurable: true},
node2: {get: function(){return this._getter('node2')}, set: function(v){this._setter('node2',v)}, enumerable: true, configurable: true},
cnn: {get: function(){return this._getter('cnn')}, set: function(v){this._setter('cnn',v)}, enumerable: true, configurable: true},
aperture_len: {get: function(){return this._getter('aperture_len')}, set: function(v){this._setter('aperture_len',v)}, enumerable: true, configurable: true},
cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
gno: {get: function(){return this._getter('gno')}, set: function(v){this._setter('gno',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true}});
CatCharacteristics.prototype.__define('glass_specification', {get: function(){return this._getter_ts('glass_specification')}, set: function(v){this._setter_ts('glass_specification',v)}, enumerable: true, configurable: true});
function CatCharacteristicsExtra_fieldsRow(owner){CatCharacteristicsExtra_fieldsRow.superclass.constructor.call(this, owner)};
CatCharacteristicsExtra_fieldsRow._extend($p.TabularSectionRow);
$p.CatCharacteristicsExtra_fieldsRow = CatCharacteristicsExtra_fieldsRow;
CatCharacteristicsExtra_fieldsRow.prototype.__define({cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
x: {get: function(){return this._getter('x')}, set: function(v){this._setter('x',v)}, enumerable: true, configurable: true},
y: {get: function(){return this._getter('y')}, set: function(v){this._setter('y',v)}, enumerable: true, configurable: true},
z: {get: function(){return this._getter('z')}, set: function(v){this._setter('z',v)}, enumerable: true, configurable: true},
w: {get: function(){return this._getter('w')}, set: function(v){this._setter('w',v)}, enumerable: true, configurable: true},
h: {get: function(){return this._getter('h')}, set: function(v){this._setter('h',v)}, enumerable: true, configurable: true},
furn: {get: function(){return this._getter('furn')}, set: function(v){this._setter('furn',v)}, enumerable: true, configurable: true},
clr_furn: {get: function(){return this._getter('clr_furn')}, set: function(v){this._setter('clr_furn',v)}, enumerable: true, configurable: true},
direction: {get: function(){return this._getter('direction')}, set: function(v){this._setter('direction',v)}, enumerable: true, configurable: true},
mskt: {get: function(){return this._getter('mskt')}, set: function(v){this._setter('mskt',v)}, enumerable: true, configurable: true},
clr_mskt: {get: function(){return this._getter('clr_mskt')}, set: function(v){this._setter('clr_mskt',v)}, enumerable: true, configurable: true},
h_ruch: {get: function(){return this._getter('h_ruch')}, set: function(v){this._setter('h_ruch',v)}, enumerable: true, configurable: true},
fix_ruch: {get: function(){return this._getter('fix_ruch')}, set: function(v){this._setter('fix_ruch',v)}, enumerable: true, configurable: true},
is_rectangular: {get: function(){return this._getter('is_rectangular')}, set: function(v){this._setter('is_rectangular',v)}, enumerable: true, configurable: true},
cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
path_data: {get: function(){return this._getter('path_data')}, set: function(v){this._setter('path_data',v)}, enumerable: true, configurable: true},
x1: {get: function(){return this._getter('x1')}, set: function(v){this._setter('x1',v)}, enumerable: true, configurable: true},
y1: {get: function(){return this._getter('y1')}, set: function(v){this._setter('y1',v)}, enumerable: true, configurable: true},
x2: {get: function(){return this._getter('x2')}, set: function(v){this._setter('x2',v)}, enumerable: true, configurable: true},
y2: {get: function(){return this._getter('y2')}, set: function(v){this._setter('y2',v)}, enumerable: true, configurable: true},
r: {get: function(){return this._getter('r')}, set: function(v){this._setter('r',v)}, enumerable: true, configurable: true},
arc_ccw: {get: function(){return this._getter('arc_ccw')}, set: function(v){this._setter('arc_ccw',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
angle_hor: {get: function(){return this._getter('angle_hor')}, set: function(v){this._setter('angle_hor',v)}, enumerable: true, configurable: true},
alp1: {get: function(){return this._getter('alp1')}, set: function(v){this._setter('alp1',v)}, enumerable: true, configurable: true},
alp2: {get: function(){return this._getter('alp2')}, set: function(v){this._setter('alp2',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
pos: {get: function(){return this._getter('pos')}, set: function(v){this._setter('pos',v)}, enumerable: true, configurable: true},
orientation: {get: function(){return this._getter('orientation')}, set: function(v){this._setter('orientation',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
elm1: {get: function(){return this._getter('elm1')}, set: function(v){this._setter('elm1',v)}, enumerable: true, configurable: true},
node1: {get: function(){return this._getter('node1')}, set: function(v){this._setter('node1',v)}, enumerable: true, configurable: true},
elm2: {get: function(){return this._getter('elm2')}, set: function(v){this._setter('elm2',v)}, enumerable: true, configurable: true},
node2: {get: function(){return this._getter('node2')}, set: function(v){this._setter('node2',v)}, enumerable: true, configurable: true},
cnn: {get: function(){return this._getter('cnn')}, set: function(v){this._setter('cnn',v)}, enumerable: true, configurable: true},
aperture_len: {get: function(){return this._getter('aperture_len')}, set: function(v){this._setter('aperture_len',v)}, enumerable: true, configurable: true},
cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
gno: {get: function(){return this._getter('gno')}, set: function(v){this._setter('gno',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true}});
CatCharacteristics.prototype.__define('extra_fields', {get: function(){return this._getter_ts('extra_fields')}, set: function(v){this._setter_ts('extra_fields',v)}, enumerable: true, configurable: true});
function CatCharacteristicsGlassesRow(owner){CatCharacteristicsGlassesRow.superclass.constructor.call(this, owner)};
CatCharacteristicsGlassesRow._extend($p.TabularSectionRow);
$p.CatCharacteristicsGlassesRow = CatCharacteristicsGlassesRow;
CatCharacteristicsGlassesRow.prototype.__define({cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
x: {get: function(){return this._getter('x')}, set: function(v){this._setter('x',v)}, enumerable: true, configurable: true},
y: {get: function(){return this._getter('y')}, set: function(v){this._setter('y',v)}, enumerable: true, configurable: true},
z: {get: function(){return this._getter('z')}, set: function(v){this._setter('z',v)}, enumerable: true, configurable: true},
w: {get: function(){return this._getter('w')}, set: function(v){this._setter('w',v)}, enumerable: true, configurable: true},
h: {get: function(){return this._getter('h')}, set: function(v){this._setter('h',v)}, enumerable: true, configurable: true},
furn: {get: function(){return this._getter('furn')}, set: function(v){this._setter('furn',v)}, enumerable: true, configurable: true},
clr_furn: {get: function(){return this._getter('clr_furn')}, set: function(v){this._setter('clr_furn',v)}, enumerable: true, configurable: true},
direction: {get: function(){return this._getter('direction')}, set: function(v){this._setter('direction',v)}, enumerable: true, configurable: true},
mskt: {get: function(){return this._getter('mskt')}, set: function(v){this._setter('mskt',v)}, enumerable: true, configurable: true},
clr_mskt: {get: function(){return this._getter('clr_mskt')}, set: function(v){this._setter('clr_mskt',v)}, enumerable: true, configurable: true},
h_ruch: {get: function(){return this._getter('h_ruch')}, set: function(v){this._setter('h_ruch',v)}, enumerable: true, configurable: true},
fix_ruch: {get: function(){return this._getter('fix_ruch')}, set: function(v){this._setter('fix_ruch',v)}, enumerable: true, configurable: true},
is_rectangular: {get: function(){return this._getter('is_rectangular')}, set: function(v){this._setter('is_rectangular',v)}, enumerable: true, configurable: true},
cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
path_data: {get: function(){return this._getter('path_data')}, set: function(v){this._setter('path_data',v)}, enumerable: true, configurable: true},
x1: {get: function(){return this._getter('x1')}, set: function(v){this._setter('x1',v)}, enumerable: true, configurable: true},
y1: {get: function(){return this._getter('y1')}, set: function(v){this._setter('y1',v)}, enumerable: true, configurable: true},
x2: {get: function(){return this._getter('x2')}, set: function(v){this._setter('x2',v)}, enumerable: true, configurable: true},
y2: {get: function(){return this._getter('y2')}, set: function(v){this._setter('y2',v)}, enumerable: true, configurable: true},
r: {get: function(){return this._getter('r')}, set: function(v){this._setter('r',v)}, enumerable: true, configurable: true},
arc_ccw: {get: function(){return this._getter('arc_ccw')}, set: function(v){this._setter('arc_ccw',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
angle_hor: {get: function(){return this._getter('angle_hor')}, set: function(v){this._setter('angle_hor',v)}, enumerable: true, configurable: true},
alp1: {get: function(){return this._getter('alp1')}, set: function(v){this._setter('alp1',v)}, enumerable: true, configurable: true},
alp2: {get: function(){return this._getter('alp2')}, set: function(v){this._setter('alp2',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
pos: {get: function(){return this._getter('pos')}, set: function(v){this._setter('pos',v)}, enumerable: true, configurable: true},
orientation: {get: function(){return this._getter('orientation')}, set: function(v){this._setter('orientation',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
elm1: {get: function(){return this._getter('elm1')}, set: function(v){this._setter('elm1',v)}, enumerable: true, configurable: true},
node1: {get: function(){return this._getter('node1')}, set: function(v){this._setter('node1',v)}, enumerable: true, configurable: true},
elm2: {get: function(){return this._getter('elm2')}, set: function(v){this._setter('elm2',v)}, enumerable: true, configurable: true},
node2: {get: function(){return this._getter('node2')}, set: function(v){this._setter('node2',v)}, enumerable: true, configurable: true},
cnn: {get: function(){return this._getter('cnn')}, set: function(v){this._setter('cnn',v)}, enumerable: true, configurable: true},
aperture_len: {get: function(){return this._getter('aperture_len')}, set: function(v){this._setter('aperture_len',v)}, enumerable: true, configurable: true},
cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
gno: {get: function(){return this._getter('gno')}, set: function(v){this._setter('gno',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
width: {get: function(){return this._getter('width')}, set: function(v){this._setter('width',v)}, enumerable: true, configurable: true},
height: {get: function(){return this._getter('height')}, set: function(v){this._setter('height',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
is_rectangular: {get: function(){return this._getter('is_rectangular')}, set: function(v){this._setter('is_rectangular',v)}, enumerable: true, configurable: true},
is_sandwich: {get: function(){return this._getter('is_sandwich')}, set: function(v){this._setter('is_sandwich',v)}, enumerable: true, configurable: true},
thickness: {get: function(){return this._getter('thickness')}, set: function(v){this._setter('thickness',v)}, enumerable: true, configurable: true},
coffer: {get: function(){return this._getter('coffer')}, set: function(v){this._setter('coffer',v)}, enumerable: true, configurable: true}});
CatCharacteristics.prototype.__define('glasses', {get: function(){return this._getter_ts('glasses')}, set: function(v){this._setter_ts('glasses',v)}, enumerable: true, configurable: true});
function CatCharacteristicsMosquitoRow(owner){CatCharacteristicsMosquitoRow.superclass.constructor.call(this, owner)};
CatCharacteristicsMosquitoRow._extend($p.TabularSectionRow);
$p.CatCharacteristicsMosquitoRow = CatCharacteristicsMosquitoRow;
CatCharacteristicsMosquitoRow.prototype.__define({cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
x: {get: function(){return this._getter('x')}, set: function(v){this._setter('x',v)}, enumerable: true, configurable: true},
y: {get: function(){return this._getter('y')}, set: function(v){this._setter('y',v)}, enumerable: true, configurable: true},
z: {get: function(){return this._getter('z')}, set: function(v){this._setter('z',v)}, enumerable: true, configurable: true},
w: {get: function(){return this._getter('w')}, set: function(v){this._setter('w',v)}, enumerable: true, configurable: true},
h: {get: function(){return this._getter('h')}, set: function(v){this._setter('h',v)}, enumerable: true, configurable: true},
furn: {get: function(){return this._getter('furn')}, set: function(v){this._setter('furn',v)}, enumerable: true, configurable: true},
clr_furn: {get: function(){return this._getter('clr_furn')}, set: function(v){this._setter('clr_furn',v)}, enumerable: true, configurable: true},
direction: {get: function(){return this._getter('direction')}, set: function(v){this._setter('direction',v)}, enumerable: true, configurable: true},
mskt: {get: function(){return this._getter('mskt')}, set: function(v){this._setter('mskt',v)}, enumerable: true, configurable: true},
clr_mskt: {get: function(){return this._getter('clr_mskt')}, set: function(v){this._setter('clr_mskt',v)}, enumerable: true, configurable: true},
h_ruch: {get: function(){return this._getter('h_ruch')}, set: function(v){this._setter('h_ruch',v)}, enumerable: true, configurable: true},
fix_ruch: {get: function(){return this._getter('fix_ruch')}, set: function(v){this._setter('fix_ruch',v)}, enumerable: true, configurable: true},
is_rectangular: {get: function(){return this._getter('is_rectangular')}, set: function(v){this._setter('is_rectangular',v)}, enumerable: true, configurable: true},
cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
path_data: {get: function(){return this._getter('path_data')}, set: function(v){this._setter('path_data',v)}, enumerable: true, configurable: true},
x1: {get: function(){return this._getter('x1')}, set: function(v){this._setter('x1',v)}, enumerable: true, configurable: true},
y1: {get: function(){return this._getter('y1')}, set: function(v){this._setter('y1',v)}, enumerable: true, configurable: true},
x2: {get: function(){return this._getter('x2')}, set: function(v){this._setter('x2',v)}, enumerable: true, configurable: true},
y2: {get: function(){return this._getter('y2')}, set: function(v){this._setter('y2',v)}, enumerable: true, configurable: true},
r: {get: function(){return this._getter('r')}, set: function(v){this._setter('r',v)}, enumerable: true, configurable: true},
arc_ccw: {get: function(){return this._getter('arc_ccw')}, set: function(v){this._setter('arc_ccw',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
angle_hor: {get: function(){return this._getter('angle_hor')}, set: function(v){this._setter('angle_hor',v)}, enumerable: true, configurable: true},
alp1: {get: function(){return this._getter('alp1')}, set: function(v){this._setter('alp1',v)}, enumerable: true, configurable: true},
alp2: {get: function(){return this._getter('alp2')}, set: function(v){this._setter('alp2',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
pos: {get: function(){return this._getter('pos')}, set: function(v){this._setter('pos',v)}, enumerable: true, configurable: true},
orientation: {get: function(){return this._getter('orientation')}, set: function(v){this._setter('orientation',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
elm1: {get: function(){return this._getter('elm1')}, set: function(v){this._setter('elm1',v)}, enumerable: true, configurable: true},
node1: {get: function(){return this._getter('node1')}, set: function(v){this._setter('node1',v)}, enumerable: true, configurable: true},
elm2: {get: function(){return this._getter('elm2')}, set: function(v){this._setter('elm2',v)}, enumerable: true, configurable: true},
node2: {get: function(){return this._getter('node2')}, set: function(v){this._setter('node2',v)}, enumerable: true, configurable: true},
cnn: {get: function(){return this._getter('cnn')}, set: function(v){this._setter('cnn',v)}, enumerable: true, configurable: true},
aperture_len: {get: function(){return this._getter('aperture_len')}, set: function(v){this._setter('aperture_len',v)}, enumerable: true, configurable: true},
cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
gno: {get: function(){return this._getter('gno')}, set: function(v){this._setter('gno',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
width: {get: function(){return this._getter('width')}, set: function(v){this._setter('width',v)}, enumerable: true, configurable: true},
height: {get: function(){return this._getter('height')}, set: function(v){this._setter('height',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
is_rectangular: {get: function(){return this._getter('is_rectangular')}, set: function(v){this._setter('is_rectangular',v)}, enumerable: true, configurable: true},
is_sandwich: {get: function(){return this._getter('is_sandwich')}, set: function(v){this._setter('is_sandwich',v)}, enumerable: true, configurable: true},
thickness: {get: function(){return this._getter('thickness')}, set: function(v){this._setter('thickness',v)}, enumerable: true, configurable: true},
coffer: {get: function(){return this._getter('coffer')}, set: function(v){this._setter('coffer',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
width: {get: function(){return this._getter('width')}, set: function(v){this._setter('width',v)}, enumerable: true, configurable: true},
height: {get: function(){return this._getter('height')}, set: function(v){this._setter('height',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true}});
CatCharacteristics.prototype.__define('mosquito', {get: function(){return this._getter_ts('mosquito')}, set: function(v){this._setter_ts('mosquito',v)}, enumerable: true, configurable: true});
function CatCharacteristicsSpecificationRow(owner){CatCharacteristicsSpecificationRow.superclass.constructor.call(this, owner)};
CatCharacteristicsSpecificationRow._extend($p.TabularSectionRow);
$p.CatCharacteristicsSpecificationRow = CatCharacteristicsSpecificationRow;
CatCharacteristicsSpecificationRow.prototype.__define({cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
x: {get: function(){return this._getter('x')}, set: function(v){this._setter('x',v)}, enumerable: true, configurable: true},
y: {get: function(){return this._getter('y')}, set: function(v){this._setter('y',v)}, enumerable: true, configurable: true},
z: {get: function(){return this._getter('z')}, set: function(v){this._setter('z',v)}, enumerable: true, configurable: true},
w: {get: function(){return this._getter('w')}, set: function(v){this._setter('w',v)}, enumerable: true, configurable: true},
h: {get: function(){return this._getter('h')}, set: function(v){this._setter('h',v)}, enumerable: true, configurable: true},
furn: {get: function(){return this._getter('furn')}, set: function(v){this._setter('furn',v)}, enumerable: true, configurable: true},
clr_furn: {get: function(){return this._getter('clr_furn')}, set: function(v){this._setter('clr_furn',v)}, enumerable: true, configurable: true},
direction: {get: function(){return this._getter('direction')}, set: function(v){this._setter('direction',v)}, enumerable: true, configurable: true},
mskt: {get: function(){return this._getter('mskt')}, set: function(v){this._setter('mskt',v)}, enumerable: true, configurable: true},
clr_mskt: {get: function(){return this._getter('clr_mskt')}, set: function(v){this._setter('clr_mskt',v)}, enumerable: true, configurable: true},
h_ruch: {get: function(){return this._getter('h_ruch')}, set: function(v){this._setter('h_ruch',v)}, enumerable: true, configurable: true},
fix_ruch: {get: function(){return this._getter('fix_ruch')}, set: function(v){this._setter('fix_ruch',v)}, enumerable: true, configurable: true},
is_rectangular: {get: function(){return this._getter('is_rectangular')}, set: function(v){this._setter('is_rectangular',v)}, enumerable: true, configurable: true},
cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
path_data: {get: function(){return this._getter('path_data')}, set: function(v){this._setter('path_data',v)}, enumerable: true, configurable: true},
x1: {get: function(){return this._getter('x1')}, set: function(v){this._setter('x1',v)}, enumerable: true, configurable: true},
y1: {get: function(){return this._getter('y1')}, set: function(v){this._setter('y1',v)}, enumerable: true, configurable: true},
x2: {get: function(){return this._getter('x2')}, set: function(v){this._setter('x2',v)}, enumerable: true, configurable: true},
y2: {get: function(){return this._getter('y2')}, set: function(v){this._setter('y2',v)}, enumerable: true, configurable: true},
r: {get: function(){return this._getter('r')}, set: function(v){this._setter('r',v)}, enumerable: true, configurable: true},
arc_ccw: {get: function(){return this._getter('arc_ccw')}, set: function(v){this._setter('arc_ccw',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
angle_hor: {get: function(){return this._getter('angle_hor')}, set: function(v){this._setter('angle_hor',v)}, enumerable: true, configurable: true},
alp1: {get: function(){return this._getter('alp1')}, set: function(v){this._setter('alp1',v)}, enumerable: true, configurable: true},
alp2: {get: function(){return this._getter('alp2')}, set: function(v){this._setter('alp2',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
pos: {get: function(){return this._getter('pos')}, set: function(v){this._setter('pos',v)}, enumerable: true, configurable: true},
orientation: {get: function(){return this._getter('orientation')}, set: function(v){this._setter('orientation',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
elm1: {get: function(){return this._getter('elm1')}, set: function(v){this._setter('elm1',v)}, enumerable: true, configurable: true},
node1: {get: function(){return this._getter('node1')}, set: function(v){this._setter('node1',v)}, enumerable: true, configurable: true},
elm2: {get: function(){return this._getter('elm2')}, set: function(v){this._setter('elm2',v)}, enumerable: true, configurable: true},
node2: {get: function(){return this._getter('node2')}, set: function(v){this._setter('node2',v)}, enumerable: true, configurable: true},
cnn: {get: function(){return this._getter('cnn')}, set: function(v){this._setter('cnn',v)}, enumerable: true, configurable: true},
aperture_len: {get: function(){return this._getter('aperture_len')}, set: function(v){this._setter('aperture_len',v)}, enumerable: true, configurable: true},
cnstr: {get: function(){return this._getter('cnstr')}, set: function(v){this._setter('cnstr',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
gno: {get: function(){return this._getter('gno')}, set: function(v){this._setter('gno',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
width: {get: function(){return this._getter('width')}, set: function(v){this._setter('width',v)}, enumerable: true, configurable: true},
height: {get: function(){return this._getter('height')}, set: function(v){this._setter('height',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
is_rectangular: {get: function(){return this._getter('is_rectangular')}, set: function(v){this._setter('is_rectangular',v)}, enumerable: true, configurable: true},
is_sandwich: {get: function(){return this._getter('is_sandwich')}, set: function(v){this._setter('is_sandwich',v)}, enumerable: true, configurable: true},
thickness: {get: function(){return this._getter('thickness')}, set: function(v){this._setter('thickness',v)}, enumerable: true, configurable: true},
coffer: {get: function(){return this._getter('coffer')}, set: function(v){this._setter('coffer',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
width: {get: function(){return this._getter('width')}, set: function(v){this._setter('width',v)}, enumerable: true, configurable: true},
height: {get: function(){return this._getter('height')}, set: function(v){this._setter('height',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
characteristic: {get: function(){return this._getter('characteristic')}, set: function(v){this._setter('characteristic',v)}, enumerable: true, configurable: true},
qty: {get: function(){return this._getter('qty')}, set: function(v){this._setter('qty',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
width: {get: function(){return this._getter('width')}, set: function(v){this._setter('width',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
alp1: {get: function(){return this._getter('alp1')}, set: function(v){this._setter('alp1',v)}, enumerable: true, configurable: true},
alp2: {get: function(){return this._getter('alp2')}, set: function(v){this._setter('alp2',v)}, enumerable: true, configurable: true},
totqty: {get: function(){return this._getter('totqty')}, set: function(v){this._setter('totqty',v)}, enumerable: true, configurable: true},
totqty1: {get: function(){return this._getter('totqty1')}, set: function(v){this._setter('totqty1',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
amount_marged: {get: function(){return this._getter('amount_marged')}, set: function(v){this._setter('amount_marged',v)}, enumerable: true, configurable: true},
origin: {get: function(){return this._getter('origin')}, set: function(v){this._setter('origin',v)}, enumerable: true, configurable: true},
changed: {get: function(){return this._getter('changed')}, set: function(v){this._setter('changed',v)}, enumerable: true, configurable: true},
dop: {get: function(){return this._getter('dop')}, set: function(v){this._setter('dop',v)}, enumerable: true, configurable: true}});
CatCharacteristics.prototype.__define('specification', {get: function(){return this._getter_ts('specification')}, set: function(v){this._setter_ts('specification',v)}, enumerable: true, configurable: true});
$p.cat.characteristics = new $p.CatManager('cat.characteristics');

/**
* ### Справочник ЦеновыеГруппы
* Ценовые группы
* @class CatPrice_groups
* @extends CatObj
* @constructor 
*/
function CatPrice_groups(attr, manager){CatPrice_groups.superclass.constructor.call(this, attr, manager)}
CatPrice_groups._extend($p.CatObj);
$p.CatPrice_groups = CatPrice_groups;
CatPrice_groups.prototype.__define({definition: {get: function(){return this._getter('definition')}, set: function(v){this._setter('definition',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
$p.cat.price_groups = new $p.CatManager('cat.price_groups');

/**
* ### Справочник ГруппыФинансовогоУчетаНоменклатуры
* Перечень номенклатурных групп для учета затрат и укрупненного планирования продаж, закупок и производства
* @class CatNom_groups
* @extends CatObj
* @constructor 
*/
function CatNom_groups(attr, manager){CatNom_groups.superclass.constructor.call(this, attr, manager)}
CatNom_groups._extend($p.CatObj);
$p.CatNom_groups = CatNom_groups;
CatNom_groups.prototype.__define({vat_rate: {get: function(){return this._getter('vat_rate')}, set: function(v){this._setter('vat_rate',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true},
parent: {get: function(){return this._getter('parent')}, set: function(v){this._setter('parent',v)}, enumerable: true, configurable: true}});
$p.cat.nom_groups = new $p.CatManager('cat.nom_groups');

/**
* ### Справочник ПривязкиВставок
* Замена регистра "Корректировка спецификации"
* @class CatInsert_bind
* @extends CatObj
* @constructor 
*/
function CatInsert_bind(attr, manager){CatInsert_bind.superclass.constructor.call(this, attr, manager)}
CatInsert_bind._extend($p.CatObj);
$p.CatInsert_bind = CatInsert_bind;
CatInsert_bind.prototype.__define({inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
zone: {get: function(){return this._getter('zone')}, set: function(v){this._setter('zone',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
function CatInsert_bindProductionRow(owner){CatInsert_bindProductionRow.superclass.constructor.call(this, owner)};
CatInsert_bindProductionRow._extend($p.TabularSectionRow);
$p.CatInsert_bindProductionRow = CatInsert_bindProductionRow;
CatInsert_bindProductionRow.prototype.__define({nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true}});
CatInsert_bind.prototype.__define('production', {get: function(){return this._getter_ts('production')}, set: function(v){this._setter_ts('production',v)}, enumerable: true, configurable: true});
$p.cat.insert_bind = new $p.CatManager('cat.insert_bind');

/**
* ### Справочник КлючиПланирования
* Смена + Подразделение + Участок
* @class CatPlanning_keys
* @extends CatObj
* @constructor 
*/
function CatPlanning_keys(attr, manager){CatPlanning_keys.superclass.constructor.call(this, attr, manager)}
CatPlanning_keys._extend($p.CatObj);
$p.CatPlanning_keys = CatPlanning_keys;
CatPlanning_keys.prototype.__define({work_shift: {get: function(){return this._getter('work_shift')}, set: function(v){this._setter('work_shift',v)}, enumerable: true, configurable: true},
department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
work_center: {get: function(){return this._getter('work_center')}, set: function(v){this._setter('work_center',v)}, enumerable: true, configurable: true},
work_center_kind: {get: function(){return this._getter('work_center_kind')}, set: function(v){this._setter('work_center_kind',v)}, enumerable: true, configurable: true},
predefined_name: {get: function(){return this._getter('predefined_name')}, set: function(v){this._setter('predefined_name',v)}, enumerable: true, configurable: true}});
$p.cat.planning_keys = new $p.CatManager('cat.planning_keys');

/**
* ### Документ КорректировкаРегистров
* Корректировка регистров
* @class DocRegisters_correction
* @extends DocObj
* @constructor 
*/
function DocRegisters_correction(attr, manager){DocRegisters_correction.superclass.constructor.call(this, attr, manager)}
DocRegisters_correction._extend($p.DocObj);
$p.DocRegisters_correction = DocRegisters_correction;
DocRegisters_correction.prototype.__define({original_doc_type: {get: function(){return this._getter('original_doc_type')}, set: function(v){this._setter('original_doc_type',v)}, enumerable: true, configurable: true},
responsible: {get: function(){return this._getter('responsible')}, set: function(v){this._setter('responsible',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true}});
function DocRegisters_correctionRegisters_tableRow(owner){DocRegisters_correctionRegisters_tableRow.superclass.constructor.call(this, owner)};
DocRegisters_correctionRegisters_tableRow._extend($p.TabularSectionRow);
$p.DocRegisters_correctionRegisters_tableRow = DocRegisters_correctionRegisters_tableRow;
DocRegisters_correctionRegisters_tableRow.prototype.__define({Имя: {get: function(){return this._getter('Имя')}, set: function(v){this._setter('Имя',v)}, enumerable: true, configurable: true}});
DocRegisters_correction.prototype.__define('registers_table', {get: function(){return this._getter_ts('registers_table')}, set: function(v){this._setter_ts('registers_table',v)}, enumerable: true, configurable: true});
$p.doc.registers_correction = new $p.DocManager('doc.registers_correction');

/**
* ### Документ ПоступлениеТоваровУслуг
* Документы отражают поступление товаров и услуг
* @class DocPurchase
* @extends DocObj
* @constructor 
*/
function DocPurchase(attr, manager){DocPurchase.superclass.constructor.call(this, attr, manager)}
DocPurchase._extend($p.DocObj);
$p.DocPurchase = DocPurchase;
DocPurchase.prototype.__define({organization: {get: function(){return this._getter('organization')}, set: function(v){this._setter('organization',v)}, enumerable: true, configurable: true},
partner: {get: function(){return this._getter('partner')}, set: function(v){this._setter('partner',v)}, enumerable: true, configurable: true},
department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
warehouse: {get: function(){return this._getter('warehouse')}, set: function(v){this._setter('warehouse',v)}, enumerable: true, configurable: true},
doc_amount: {get: function(){return this._getter('doc_amount')}, set: function(v){this._setter('doc_amount',v)}, enumerable: true, configurable: true},
responsible: {get: function(){return this._getter('responsible')}, set: function(v){this._setter('responsible',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true}});
function DocPurchaseGoodsRow(owner){DocPurchaseGoodsRow.superclass.constructor.call(this, owner)};
DocPurchaseGoodsRow._extend($p.TabularSectionRow);
$p.DocPurchaseGoodsRow = DocPurchaseGoodsRow;
DocPurchaseGoodsRow.prototype.__define({nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
unit: {get: function(){return this._getter('unit')}, set: function(v){this._setter('unit',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
vat_rate: {get: function(){return this._getter('vat_rate')}, set: function(v){this._setter('vat_rate',v)}, enumerable: true, configurable: true},
vat_amount: {get: function(){return this._getter('vat_amount')}, set: function(v){this._setter('vat_amount',v)}, enumerable: true, configurable: true},
trans: {get: function(){return this._getter('trans')}, set: function(v){this._setter('trans',v)}, enumerable: true, configurable: true}});
DocPurchase.prototype.__define('goods', {get: function(){return this._getter_ts('goods')}, set: function(v){this._setter_ts('goods',v)}, enumerable: true, configurable: true});
function DocPurchaseServicesRow(owner){DocPurchaseServicesRow.superclass.constructor.call(this, owner)};
DocPurchaseServicesRow._extend($p.TabularSectionRow);
$p.DocPurchaseServicesRow = DocPurchaseServicesRow;
DocPurchaseServicesRow.prototype.__define({nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
unit: {get: function(){return this._getter('unit')}, set: function(v){this._setter('unit',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
vat_rate: {get: function(){return this._getter('vat_rate')}, set: function(v){this._setter('vat_rate',v)}, enumerable: true, configurable: true},
vat_amount: {get: function(){return this._getter('vat_amount')}, set: function(v){this._setter('vat_amount',v)}, enumerable: true, configurable: true},
trans: {get: function(){return this._getter('trans')}, set: function(v){this._setter('trans',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
content: {get: function(){return this._getter('content')}, set: function(v){this._setter('content',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
vat_rate: {get: function(){return this._getter('vat_rate')}, set: function(v){this._setter('vat_rate',v)}, enumerable: true, configurable: true},
vat_amount: {get: function(){return this._getter('vat_amount')}, set: function(v){this._setter('vat_amount',v)}, enumerable: true, configurable: true},
nom_group: {get: function(){return this._getter('nom_group')}, set: function(v){this._setter('nom_group',v)}, enumerable: true, configurable: true},
department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
cost_item: {get: function(){return this._getter('cost_item')}, set: function(v){this._setter('cost_item',v)}, enumerable: true, configurable: true},
project: {get: function(){return this._getter('project')}, set: function(v){this._setter('project',v)}, enumerable: true, configurable: true},
buyers_order: {get: function(){return this._getter('buyers_order')}, set: function(v){this._setter('buyers_order',v)}, enumerable: true, configurable: true}});
DocPurchase.prototype.__define('services', {get: function(){return this._getter_ts('services')}, set: function(v){this._setter_ts('services',v)}, enumerable: true, configurable: true});
$p.doc.purchase = new $p.DocManager('doc.purchase');

/**
* ### Документ НарядРЦ
* Задание рабочему центру
* @class DocWork_centers_task
* @extends DocObj
* @constructor 
*/
function DocWork_centers_task(attr, manager){DocWork_centers_task.superclass.constructor.call(this, attr, manager)}
DocWork_centers_task._extend($p.DocObj);
$p.DocWork_centers_task = DocWork_centers_task;
DocWork_centers_task.prototype.__define({work_center: {get: function(){return this._getter('work_center')}, set: function(v){this._setter('work_center',v)}, enumerable: true, configurable: true},
recipient: {get: function(){return this._getter('recipient')}, set: function(v){this._setter('recipient',v)}, enumerable: true, configurable: true},
responsible: {get: function(){return this._getter('responsible')}, set: function(v){this._setter('responsible',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true}});
function DocWork_centers_taskPlanningRow(owner){DocWork_centers_taskPlanningRow.superclass.constructor.call(this, owner)};
DocWork_centers_taskPlanningRow._extend($p.TabularSectionRow);
$p.DocWork_centers_taskPlanningRow = DocWork_centers_taskPlanningRow;
DocWork_centers_taskPlanningRow.prototype.__define({obj: {get: function(){return this._getter('obj')}, set: function(v){this._setter('obj',v)}, enumerable: true, configurable: true},
specimen: {get: function(){return this._getter('specimen')}, set: function(v){this._setter('specimen',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
performance: {get: function(){return this._getter('performance')}, set: function(v){this._setter('performance',v)}, enumerable: true, configurable: true}});
DocWork_centers_task.prototype.__define('planning', {get: function(){return this._getter_ts('planning')}, set: function(v){this._setter_ts('planning',v)}, enumerable: true, configurable: true});
$p.doc.work_centers_task = new $p.DocManager('doc.work_centers_task');

/**
* ### Документ Расчет
* Аналог заказа покупателя типовых конфигураций.
Содержит инструменты для формирования спецификаций и подготовки данных производства и диспетчеризации
* @class DocCalc_order
* @extends DocObj
* @constructor 
*/
function DocCalc_order(attr, manager){DocCalc_order.superclass.constructor.call(this, attr, manager)}
DocCalc_order._extend($p.DocObj);
$p.DocCalc_order = DocCalc_order;
DocCalc_order.prototype.__define({number_internal: {get: function(){return this._getter('number_internal')}, set: function(v){this._setter('number_internal',v)}, enumerable: true, configurable: true},
project: {get: function(){return this._getter('project')}, set: function(v){this._setter('project',v)}, enumerable: true, configurable: true},
organization: {get: function(){return this._getter('organization')}, set: function(v){this._setter('organization',v)}, enumerable: true, configurable: true},
partner: {get: function(){return this._getter('partner')}, set: function(v){this._setter('partner',v)}, enumerable: true, configurable: true},
client_of_dealer: {get: function(){return this._getter('client_of_dealer')}, set: function(v){this._setter('client_of_dealer',v)}, enumerable: true, configurable: true},
contract: {get: function(){return this._getter('contract')}, set: function(v){this._setter('contract',v)}, enumerable: true, configurable: true},
organizational_unit: {get: function(){return this._getter('organizational_unit')}, set: function(v){this._setter('organizational_unit',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
manager: {get: function(){return this._getter('manager')}, set: function(v){this._setter('manager',v)}, enumerable: true, configurable: true},
leading_manager: {get: function(){return this._getter('leading_manager')}, set: function(v){this._setter('leading_manager',v)}, enumerable: true, configurable: true},
department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
doc_amount: {get: function(){return this._getter('doc_amount')}, set: function(v){this._setter('doc_amount',v)}, enumerable: true, configurable: true},
amount_operation: {get: function(){return this._getter('amount_operation')}, set: function(v){this._setter('amount_operation',v)}, enumerable: true, configurable: true},
amount_internal: {get: function(){return this._getter('amount_internal')}, set: function(v){this._setter('amount_internal',v)}, enumerable: true, configurable: true},
accessory_characteristic: {get: function(){return this._getter('accessory_characteristic')}, set: function(v){this._setter('accessory_characteristic',v)}, enumerable: true, configurable: true},
sys_profile: {get: function(){return this._getter('sys_profile')}, set: function(v){this._setter('sys_profile',v)}, enumerable: true, configurable: true},
sys_furn: {get: function(){return this._getter('sys_furn')}, set: function(v){this._setter('sys_furn',v)}, enumerable: true, configurable: true},
phone: {get: function(){return this._getter('phone')}, set: function(v){this._setter('phone',v)}, enumerable: true, configurable: true},
delivery_area: {get: function(){return this._getter('delivery_area')}, set: function(v){this._setter('delivery_area',v)}, enumerable: true, configurable: true},
shipping_address: {get: function(){return this._getter('shipping_address')}, set: function(v){this._setter('shipping_address',v)}, enumerable: true, configurable: true},
coordinates: {get: function(){return this._getter('coordinates')}, set: function(v){this._setter('coordinates',v)}, enumerable: true, configurable: true},
address_fields: {get: function(){return this._getter('address_fields')}, set: function(v){this._setter('address_fields',v)}, enumerable: true, configurable: true},
difficult: {get: function(){return this._getter('difficult')}, set: function(v){this._setter('difficult',v)}, enumerable: true, configurable: true},
vat_consider: {get: function(){return this._getter('vat_consider')}, set: function(v){this._setter('vat_consider',v)}, enumerable: true, configurable: true},
vat_included: {get: function(){return this._getter('vat_included')}, set: function(v){this._setter('vat_included',v)}, enumerable: true, configurable: true},
settlements_course: {get: function(){return this._getter('settlements_course')}, set: function(v){this._setter('settlements_course',v)}, enumerable: true, configurable: true},
settlements_multiplicity: {get: function(){return this._getter('settlements_multiplicity')}, set: function(v){this._setter('settlements_multiplicity',v)}, enumerable: true, configurable: true},
obj_delivery_state: {get: function(){return this._getter('obj_delivery_state')}, set: function(v){this._setter('obj_delivery_state',v)}, enumerable: true, configurable: true},
category: {get: function(){return this._getter('category')}, set: function(v){this._setter('category',v)}, enumerable: true, configurable: true}});
function DocCalc_orderProductionRow(owner){DocCalc_orderProductionRow.superclass.constructor.call(this, owner)};
DocCalc_orderProductionRow._extend($p.TabularSectionRow);
$p.DocCalc_orderProductionRow = DocCalc_orderProductionRow;
DocCalc_orderProductionRow.prototype.__define({nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
characteristic: {get: function(){return this._getter('characteristic')}, set: function(v){this._setter('characteristic',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
unit: {get: function(){return this._getter('unit')}, set: function(v){this._setter('unit',v)}, enumerable: true, configurable: true},
qty: {get: function(){return this._getter('qty')}, set: function(v){this._setter('qty',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
width: {get: function(){return this._getter('width')}, set: function(v){this._setter('width',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
first_cost: {get: function(){return this._getter('first_cost')}, set: function(v){this._setter('first_cost',v)}, enumerable: true, configurable: true},
marginality: {get: function(){return this._getter('marginality')}, set: function(v){this._setter('marginality',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
discount_percent: {get: function(){return this._getter('discount_percent')}, set: function(v){this._setter('discount_percent',v)}, enumerable: true, configurable: true},
discount_percent_internal: {get: function(){return this._getter('discount_percent_internal')}, set: function(v){this._setter('discount_percent_internal',v)}, enumerable: true, configurable: true},
discount: {get: function(){return this._getter('discount')}, set: function(v){this._setter('discount',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
margin: {get: function(){return this._getter('margin')}, set: function(v){this._setter('margin',v)}, enumerable: true, configurable: true},
price_internal: {get: function(){return this._getter('price_internal')}, set: function(v){this._setter('price_internal',v)}, enumerable: true, configurable: true},
amount_internal: {get: function(){return this._getter('amount_internal')}, set: function(v){this._setter('amount_internal',v)}, enumerable: true, configurable: true},
vat_rate: {get: function(){return this._getter('vat_rate')}, set: function(v){this._setter('vat_rate',v)}, enumerable: true, configurable: true},
vat_amount: {get: function(){return this._getter('vat_amount')}, set: function(v){this._setter('vat_amount',v)}, enumerable: true, configurable: true},
ordn: {get: function(){return this._getter('ordn')}, set: function(v){this._setter('ordn',v)}, enumerable: true, configurable: true},
changed: {get: function(){return this._getter('changed')}, set: function(v){this._setter('changed',v)}, enumerable: true, configurable: true}});
DocCalc_order.prototype.__define('production', {get: function(){return this._getter_ts('production')}, set: function(v){this._setter_ts('production',v)}, enumerable: true, configurable: true});
function DocCalc_orderExtra_fieldsRow(owner){DocCalc_orderExtra_fieldsRow.superclass.constructor.call(this, owner)};
DocCalc_orderExtra_fieldsRow._extend($p.TabularSectionRow);
$p.DocCalc_orderExtra_fieldsRow = DocCalc_orderExtra_fieldsRow;
DocCalc_orderExtra_fieldsRow.prototype.__define({nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
characteristic: {get: function(){return this._getter('characteristic')}, set: function(v){this._setter('characteristic',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
unit: {get: function(){return this._getter('unit')}, set: function(v){this._setter('unit',v)}, enumerable: true, configurable: true},
qty: {get: function(){return this._getter('qty')}, set: function(v){this._setter('qty',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
width: {get: function(){return this._getter('width')}, set: function(v){this._setter('width',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
first_cost: {get: function(){return this._getter('first_cost')}, set: function(v){this._setter('first_cost',v)}, enumerable: true, configurable: true},
marginality: {get: function(){return this._getter('marginality')}, set: function(v){this._setter('marginality',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
discount_percent: {get: function(){return this._getter('discount_percent')}, set: function(v){this._setter('discount_percent',v)}, enumerable: true, configurable: true},
discount_percent_internal: {get: function(){return this._getter('discount_percent_internal')}, set: function(v){this._setter('discount_percent_internal',v)}, enumerable: true, configurable: true},
discount: {get: function(){return this._getter('discount')}, set: function(v){this._setter('discount',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
margin: {get: function(){return this._getter('margin')}, set: function(v){this._setter('margin',v)}, enumerable: true, configurable: true},
price_internal: {get: function(){return this._getter('price_internal')}, set: function(v){this._setter('price_internal',v)}, enumerable: true, configurable: true},
amount_internal: {get: function(){return this._getter('amount_internal')}, set: function(v){this._setter('amount_internal',v)}, enumerable: true, configurable: true},
vat_rate: {get: function(){return this._getter('vat_rate')}, set: function(v){this._setter('vat_rate',v)}, enumerable: true, configurable: true},
vat_amount: {get: function(){return this._getter('vat_amount')}, set: function(v){this._setter('vat_amount',v)}, enumerable: true, configurable: true},
ordn: {get: function(){return this._getter('ordn')}, set: function(v){this._setter('ordn',v)}, enumerable: true, configurable: true},
changed: {get: function(){return this._getter('changed')}, set: function(v){this._setter('changed',v)}, enumerable: true, configurable: true},
property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true}});
DocCalc_order.prototype.__define('extra_fields', {get: function(){return this._getter_ts('extra_fields')}, set: function(v){this._setter_ts('extra_fields',v)}, enumerable: true, configurable: true});
function DocCalc_orderContact_informationRow(owner){DocCalc_orderContact_informationRow.superclass.constructor.call(this, owner)};
DocCalc_orderContact_informationRow._extend($p.TabularSectionRow);
$p.DocCalc_orderContact_informationRow = DocCalc_orderContact_informationRow;
DocCalc_orderContact_informationRow.prototype.__define({nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
characteristic: {get: function(){return this._getter('characteristic')}, set: function(v){this._setter('characteristic',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
unit: {get: function(){return this._getter('unit')}, set: function(v){this._setter('unit',v)}, enumerable: true, configurable: true},
qty: {get: function(){return this._getter('qty')}, set: function(v){this._setter('qty',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
width: {get: function(){return this._getter('width')}, set: function(v){this._setter('width',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
first_cost: {get: function(){return this._getter('first_cost')}, set: function(v){this._setter('first_cost',v)}, enumerable: true, configurable: true},
marginality: {get: function(){return this._getter('marginality')}, set: function(v){this._setter('marginality',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
discount_percent: {get: function(){return this._getter('discount_percent')}, set: function(v){this._setter('discount_percent',v)}, enumerable: true, configurable: true},
discount_percent_internal: {get: function(){return this._getter('discount_percent_internal')}, set: function(v){this._setter('discount_percent_internal',v)}, enumerable: true, configurable: true},
discount: {get: function(){return this._getter('discount')}, set: function(v){this._setter('discount',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
margin: {get: function(){return this._getter('margin')}, set: function(v){this._setter('margin',v)}, enumerable: true, configurable: true},
price_internal: {get: function(){return this._getter('price_internal')}, set: function(v){this._setter('price_internal',v)}, enumerable: true, configurable: true},
amount_internal: {get: function(){return this._getter('amount_internal')}, set: function(v){this._setter('amount_internal',v)}, enumerable: true, configurable: true},
vat_rate: {get: function(){return this._getter('vat_rate')}, set: function(v){this._setter('vat_rate',v)}, enumerable: true, configurable: true},
vat_amount: {get: function(){return this._getter('vat_amount')}, set: function(v){this._setter('vat_amount',v)}, enumerable: true, configurable: true},
ordn: {get: function(){return this._getter('ordn')}, set: function(v){this._setter('ordn',v)}, enumerable: true, configurable: true},
changed: {get: function(){return this._getter('changed')}, set: function(v){this._setter('changed',v)}, enumerable: true, configurable: true},
property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true},
type: {get: function(){return this._getter('type')}, set: function(v){this._setter('type',v)}, enumerable: true, configurable: true},
kind: {get: function(){return this._getter('kind')}, set: function(v){this._setter('kind',v)}, enumerable: true, configurable: true},
presentation: {get: function(){return this._getter('presentation')}, set: function(v){this._setter('presentation',v)}, enumerable: true, configurable: true},
values_fields: {get: function(){return this._getter('values_fields')}, set: function(v){this._setter('values_fields',v)}, enumerable: true, configurable: true},
country: {get: function(){return this._getter('country')}, set: function(v){this._setter('country',v)}, enumerable: true, configurable: true},
region: {get: function(){return this._getter('region')}, set: function(v){this._setter('region',v)}, enumerable: true, configurable: true},
city: {get: function(){return this._getter('city')}, set: function(v){this._setter('city',v)}, enumerable: true, configurable: true},
email_address: {get: function(){return this._getter('email_address')}, set: function(v){this._setter('email_address',v)}, enumerable: true, configurable: true},
server_domain_name: {get: function(){return this._getter('server_domain_name')}, set: function(v){this._setter('server_domain_name',v)}, enumerable: true, configurable: true},
phone_number: {get: function(){return this._getter('phone_number')}, set: function(v){this._setter('phone_number',v)}, enumerable: true, configurable: true},
phone_without_codes: {get: function(){return this._getter('phone_without_codes')}, set: function(v){this._setter('phone_without_codes',v)}, enumerable: true, configurable: true}});
DocCalc_order.prototype.__define('contact_information', {get: function(){return this._getter_ts('contact_information')}, set: function(v){this._setter_ts('contact_information',v)}, enumerable: true, configurable: true});
function DocCalc_orderPlanningRow(owner){DocCalc_orderPlanningRow.superclass.constructor.call(this, owner)};
DocCalc_orderPlanningRow._extend($p.TabularSectionRow);
$p.DocCalc_orderPlanningRow = DocCalc_orderPlanningRow;
DocCalc_orderPlanningRow.prototype.__define({nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
characteristic: {get: function(){return this._getter('characteristic')}, set: function(v){this._setter('characteristic',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
unit: {get: function(){return this._getter('unit')}, set: function(v){this._setter('unit',v)}, enumerable: true, configurable: true},
qty: {get: function(){return this._getter('qty')}, set: function(v){this._setter('qty',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
width: {get: function(){return this._getter('width')}, set: function(v){this._setter('width',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
first_cost: {get: function(){return this._getter('first_cost')}, set: function(v){this._setter('first_cost',v)}, enumerable: true, configurable: true},
marginality: {get: function(){return this._getter('marginality')}, set: function(v){this._setter('marginality',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
discount_percent: {get: function(){return this._getter('discount_percent')}, set: function(v){this._setter('discount_percent',v)}, enumerable: true, configurable: true},
discount_percent_internal: {get: function(){return this._getter('discount_percent_internal')}, set: function(v){this._setter('discount_percent_internal',v)}, enumerable: true, configurable: true},
discount: {get: function(){return this._getter('discount')}, set: function(v){this._setter('discount',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
margin: {get: function(){return this._getter('margin')}, set: function(v){this._setter('margin',v)}, enumerable: true, configurable: true},
price_internal: {get: function(){return this._getter('price_internal')}, set: function(v){this._setter('price_internal',v)}, enumerable: true, configurable: true},
amount_internal: {get: function(){return this._getter('amount_internal')}, set: function(v){this._setter('amount_internal',v)}, enumerable: true, configurable: true},
vat_rate: {get: function(){return this._getter('vat_rate')}, set: function(v){this._setter('vat_rate',v)}, enumerable: true, configurable: true},
vat_amount: {get: function(){return this._getter('vat_amount')}, set: function(v){this._setter('vat_amount',v)}, enumerable: true, configurable: true},
ordn: {get: function(){return this._getter('ordn')}, set: function(v){this._setter('ordn',v)}, enumerable: true, configurable: true},
changed: {get: function(){return this._getter('changed')}, set: function(v){this._setter('changed',v)}, enumerable: true, configurable: true},
property: {get: function(){return this._getter('property')}, set: function(v){this._setter('property',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
txt_row: {get: function(){return this._getter('txt_row')}, set: function(v){this._setter('txt_row',v)}, enumerable: true, configurable: true},
type: {get: function(){return this._getter('type')}, set: function(v){this._setter('type',v)}, enumerable: true, configurable: true},
kind: {get: function(){return this._getter('kind')}, set: function(v){this._setter('kind',v)}, enumerable: true, configurable: true},
presentation: {get: function(){return this._getter('presentation')}, set: function(v){this._setter('presentation',v)}, enumerable: true, configurable: true},
values_fields: {get: function(){return this._getter('values_fields')}, set: function(v){this._setter('values_fields',v)}, enumerable: true, configurable: true},
country: {get: function(){return this._getter('country')}, set: function(v){this._setter('country',v)}, enumerable: true, configurable: true},
region: {get: function(){return this._getter('region')}, set: function(v){this._setter('region',v)}, enumerable: true, configurable: true},
city: {get: function(){return this._getter('city')}, set: function(v){this._setter('city',v)}, enumerable: true, configurable: true},
email_address: {get: function(){return this._getter('email_address')}, set: function(v){this._setter('email_address',v)}, enumerable: true, configurable: true},
server_domain_name: {get: function(){return this._getter('server_domain_name')}, set: function(v){this._setter('server_domain_name',v)}, enumerable: true, configurable: true},
phone_number: {get: function(){return this._getter('phone_number')}, set: function(v){this._setter('phone_number',v)}, enumerable: true, configurable: true},
phone_without_codes: {get: function(){return this._getter('phone_without_codes')}, set: function(v){this._setter('phone_without_codes',v)}, enumerable: true, configurable: true},
date: {get: function(){return this._getter('date')}, set: function(v){this._setter('date',v)}, enumerable: true, configurable: true},
work_center: {get: function(){return this._getter('work_center')}, set: function(v){this._setter('work_center',v)}, enumerable: true, configurable: true},
obj: {get: function(){return this._getter('obj')}, set: function(v){this._setter('obj',v)}, enumerable: true, configurable: true},
specimen: {get: function(){return this._getter('specimen')}, set: function(v){this._setter('specimen',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
performance: {get: function(){return this._getter('performance')}, set: function(v){this._setter('performance',v)}, enumerable: true, configurable: true}});
DocCalc_order.prototype.__define('planning', {get: function(){return this._getter_ts('planning')}, set: function(v){this._setter_ts('planning',v)}, enumerable: true, configurable: true});
$p.doc.calc_order = new $p.DocManager('doc.calc_order');

/**
* ### Документ ОплатаОтПокупателяПлатежнойКартой
* Оплата от покупателя платежной картой
* @class DocCredit_card_order
* @extends DocObj
* @constructor 
*/
function DocCredit_card_order(attr, manager){DocCredit_card_order.superclass.constructor.call(this, attr, manager)}
DocCredit_card_order._extend($p.DocObj);
$p.DocCredit_card_order = DocCredit_card_order;
DocCredit_card_order.prototype.__define({organization: {get: function(){return this._getter('organization')}, set: function(v){this._setter('organization',v)}, enumerable: true, configurable: true},
partner: {get: function(){return this._getter('partner')}, set: function(v){this._setter('partner',v)}, enumerable: true, configurable: true},
department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
doc_amount: {get: function(){return this._getter('doc_amount')}, set: function(v){this._setter('doc_amount',v)}, enumerable: true, configurable: true},
responsible: {get: function(){return this._getter('responsible')}, set: function(v){this._setter('responsible',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true}});
function DocCredit_card_orderPayment_detailsRow(owner){DocCredit_card_orderPayment_detailsRow.superclass.constructor.call(this, owner)};
DocCredit_card_orderPayment_detailsRow._extend($p.TabularSectionRow);
$p.DocCredit_card_orderPayment_detailsRow = DocCredit_card_orderPayment_detailsRow;
DocCredit_card_orderPayment_detailsRow.prototype.__define({cash_flow_article: {get: function(){return this._getter('cash_flow_article')}, set: function(v){this._setter('cash_flow_article',v)}, enumerable: true, configurable: true},
trans: {get: function(){return this._getter('trans')}, set: function(v){this._setter('trans',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true}});
DocCredit_card_order.prototype.__define('payment_details', {get: function(){return this._getter_ts('payment_details')}, set: function(v){this._setter_ts('payment_details',v)}, enumerable: true, configurable: true});
$p.doc.credit_card_order = new $p.DocManager('doc.credit_card_order');

/**
* ### Документ МощностиРЦ
* Мощности рабочих центров
* @class DocWork_centers_performance
* @extends DocObj
* @constructor 
*/
function DocWork_centers_performance(attr, manager){DocWork_centers_performance.superclass.constructor.call(this, attr, manager)}
DocWork_centers_performance._extend($p.DocObj);
$p.DocWork_centers_performance = DocWork_centers_performance;
DocWork_centers_performance.prototype.__define({start_date: {get: function(){return this._getter('start_date')}, set: function(v){this._setter('start_date',v)}, enumerable: true, configurable: true},
expiration_date: {get: function(){return this._getter('expiration_date')}, set: function(v){this._setter('expiration_date',v)}, enumerable: true, configurable: true},
responsible: {get: function(){return this._getter('responsible')}, set: function(v){this._setter('responsible',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true}});
function DocWork_centers_performancePlanningRow(owner){DocWork_centers_performancePlanningRow.superclass.constructor.call(this, owner)};
DocWork_centers_performancePlanningRow._extend($p.TabularSectionRow);
$p.DocWork_centers_performancePlanningRow = DocWork_centers_performancePlanningRow;
DocWork_centers_performancePlanningRow.prototype.__define({date: {get: function(){return this._getter('date')}, set: function(v){this._setter('date',v)}, enumerable: true, configurable: true},
work_center: {get: function(){return this._getter('work_center')}, set: function(v){this._setter('work_center',v)}, enumerable: true, configurable: true},
performance: {get: function(){return this._getter('performance')}, set: function(v){this._setter('performance',v)}, enumerable: true, configurable: true}});
DocWork_centers_performance.prototype.__define('planning', {get: function(){return this._getter_ts('planning')}, set: function(v){this._setter_ts('planning',v)}, enumerable: true, configurable: true});
$p.doc.work_centers_performance = new $p.DocManager('doc.work_centers_performance');

/**
* ### Документ ПлатежноеПоручениеВходящее
* Платежное поручение входящее
* @class DocDebit_bank_order
* @extends DocObj
* @constructor 
*/
function DocDebit_bank_order(attr, manager){DocDebit_bank_order.superclass.constructor.call(this, attr, manager)}
DocDebit_bank_order._extend($p.DocObj);
$p.DocDebit_bank_order = DocDebit_bank_order;
DocDebit_bank_order.prototype.__define({organization: {get: function(){return this._getter('organization')}, set: function(v){this._setter('organization',v)}, enumerable: true, configurable: true},
partner: {get: function(){return this._getter('partner')}, set: function(v){this._setter('partner',v)}, enumerable: true, configurable: true},
department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
doc_amount: {get: function(){return this._getter('doc_amount')}, set: function(v){this._setter('doc_amount',v)}, enumerable: true, configurable: true},
responsible: {get: function(){return this._getter('responsible')}, set: function(v){this._setter('responsible',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true}});
function DocDebit_bank_orderPayment_detailsRow(owner){DocDebit_bank_orderPayment_detailsRow.superclass.constructor.call(this, owner)};
DocDebit_bank_orderPayment_detailsRow._extend($p.TabularSectionRow);
$p.DocDebit_bank_orderPayment_detailsRow = DocDebit_bank_orderPayment_detailsRow;
DocDebit_bank_orderPayment_detailsRow.prototype.__define({cash_flow_article: {get: function(){return this._getter('cash_flow_article')}, set: function(v){this._setter('cash_flow_article',v)}, enumerable: true, configurable: true},
trans: {get: function(){return this._getter('trans')}, set: function(v){this._setter('trans',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true}});
DocDebit_bank_order.prototype.__define('payment_details', {get: function(){return this._getter_ts('payment_details')}, set: function(v){this._setter_ts('payment_details',v)}, enumerable: true, configurable: true});
$p.doc.debit_bank_order = new $p.DocManager('doc.debit_bank_order');

/**
* ### Документ ПлатежноеПоручениеИсходящее
* Платежное поручение исходящее
* @class DocCredit_bank_order
* @extends DocObj
* @constructor 
*/
function DocCredit_bank_order(attr, manager){DocCredit_bank_order.superclass.constructor.call(this, attr, manager)}
DocCredit_bank_order._extend($p.DocObj);
$p.DocCredit_bank_order = DocCredit_bank_order;
DocCredit_bank_order.prototype.__define({organization: {get: function(){return this._getter('organization')}, set: function(v){this._setter('organization',v)}, enumerable: true, configurable: true},
partner: {get: function(){return this._getter('partner')}, set: function(v){this._setter('partner',v)}, enumerable: true, configurable: true},
department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
doc_amount: {get: function(){return this._getter('doc_amount')}, set: function(v){this._setter('doc_amount',v)}, enumerable: true, configurable: true},
responsible: {get: function(){return this._getter('responsible')}, set: function(v){this._setter('responsible',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true}});
function DocCredit_bank_orderPayment_detailsRow(owner){DocCredit_bank_orderPayment_detailsRow.superclass.constructor.call(this, owner)};
DocCredit_bank_orderPayment_detailsRow._extend($p.TabularSectionRow);
$p.DocCredit_bank_orderPayment_detailsRow = DocCredit_bank_orderPayment_detailsRow;
DocCredit_bank_orderPayment_detailsRow.prototype.__define({cash_flow_article: {get: function(){return this._getter('cash_flow_article')}, set: function(v){this._setter('cash_flow_article',v)}, enumerable: true, configurable: true},
trans: {get: function(){return this._getter('trans')}, set: function(v){this._setter('trans',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true}});
DocCredit_bank_order.prototype.__define('payment_details', {get: function(){return this._getter_ts('payment_details')}, set: function(v){this._setter_ts('payment_details',v)}, enumerable: true, configurable: true});
$p.doc.credit_bank_order = new $p.DocManager('doc.credit_bank_order');

/**
* ### Документ ПриходныйКассовыйОрдер
* Приходный кассовый ордер
* @class DocDebit_cash_order
* @extends DocObj
* @constructor 
*/
function DocDebit_cash_order(attr, manager){DocDebit_cash_order.superclass.constructor.call(this, attr, manager)}
DocDebit_cash_order._extend($p.DocObj);
$p.DocDebit_cash_order = DocDebit_cash_order;
DocDebit_cash_order.prototype.__define({organization: {get: function(){return this._getter('organization')}, set: function(v){this._setter('organization',v)}, enumerable: true, configurable: true},
partner: {get: function(){return this._getter('partner')}, set: function(v){this._setter('partner',v)}, enumerable: true, configurable: true},
department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
cashbox: {get: function(){return this._getter('cashbox')}, set: function(v){this._setter('cashbox',v)}, enumerable: true, configurable: true},
doc_amount: {get: function(){return this._getter('doc_amount')}, set: function(v){this._setter('doc_amount',v)}, enumerable: true, configurable: true},
responsible: {get: function(){return this._getter('responsible')}, set: function(v){this._setter('responsible',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true}});
function DocDebit_cash_orderPayment_detailsRow(owner){DocDebit_cash_orderPayment_detailsRow.superclass.constructor.call(this, owner)};
DocDebit_cash_orderPayment_detailsRow._extend($p.TabularSectionRow);
$p.DocDebit_cash_orderPayment_detailsRow = DocDebit_cash_orderPayment_detailsRow;
DocDebit_cash_orderPayment_detailsRow.prototype.__define({cash_flow_article: {get: function(){return this._getter('cash_flow_article')}, set: function(v){this._setter('cash_flow_article',v)}, enumerable: true, configurable: true},
trans: {get: function(){return this._getter('trans')}, set: function(v){this._setter('trans',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true}});
DocDebit_cash_order.prototype.__define('payment_details', {get: function(){return this._getter_ts('payment_details')}, set: function(v){this._setter_ts('payment_details',v)}, enumerable: true, configurable: true});
$p.doc.debit_cash_order = new $p.DocManager('doc.debit_cash_order');

/**
* ### Документ РасходныйКассовыйОрдер
* Расходный кассовый ордер
* @class DocCredit_cash_order
* @extends DocObj
* @constructor 
*/
function DocCredit_cash_order(attr, manager){DocCredit_cash_order.superclass.constructor.call(this, attr, manager)}
DocCredit_cash_order._extend($p.DocObj);
$p.DocCredit_cash_order = DocCredit_cash_order;
DocCredit_cash_order.prototype.__define({organization: {get: function(){return this._getter('organization')}, set: function(v){this._setter('organization',v)}, enumerable: true, configurable: true},
partner: {get: function(){return this._getter('partner')}, set: function(v){this._setter('partner',v)}, enumerable: true, configurable: true},
department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
cashbox: {get: function(){return this._getter('cashbox')}, set: function(v){this._setter('cashbox',v)}, enumerable: true, configurable: true},
doc_amount: {get: function(){return this._getter('doc_amount')}, set: function(v){this._setter('doc_amount',v)}, enumerable: true, configurable: true},
responsible: {get: function(){return this._getter('responsible')}, set: function(v){this._setter('responsible',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true}});
function DocCredit_cash_orderPayment_detailsRow(owner){DocCredit_cash_orderPayment_detailsRow.superclass.constructor.call(this, owner)};
DocCredit_cash_orderPayment_detailsRow._extend($p.TabularSectionRow);
$p.DocCredit_cash_orderPayment_detailsRow = DocCredit_cash_orderPayment_detailsRow;
DocCredit_cash_orderPayment_detailsRow.prototype.__define({cash_flow_article: {get: function(){return this._getter('cash_flow_article')}, set: function(v){this._setter('cash_flow_article',v)}, enumerable: true, configurable: true},
trans: {get: function(){return this._getter('trans')}, set: function(v){this._setter('trans',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true}});
DocCredit_cash_order.prototype.__define('payment_details', {get: function(){return this._getter_ts('payment_details')}, set: function(v){this._setter_ts('payment_details',v)}, enumerable: true, configurable: true});
$p.doc.credit_cash_order = new $p.DocManager('doc.credit_cash_order');

/**
* ### Документ РеализацияТоваровУслуг
* Документы отражают факт реализации (отгрузки) товаров
* @class DocSelling
* @extends DocObj
* @constructor 
*/
function DocSelling(attr, manager){DocSelling.superclass.constructor.call(this, attr, manager)}
DocSelling._extend($p.DocObj);
$p.DocSelling = DocSelling;
DocSelling.prototype.__define({organization: {get: function(){return this._getter('organization')}, set: function(v){this._setter('organization',v)}, enumerable: true, configurable: true},
partner: {get: function(){return this._getter('partner')}, set: function(v){this._setter('partner',v)}, enumerable: true, configurable: true},
department: {get: function(){return this._getter('department')}, set: function(v){this._setter('department',v)}, enumerable: true, configurable: true},
warehouse: {get: function(){return this._getter('warehouse')}, set: function(v){this._setter('warehouse',v)}, enumerable: true, configurable: true},
doc_amount: {get: function(){return this._getter('doc_amount')}, set: function(v){this._setter('doc_amount',v)}, enumerable: true, configurable: true},
responsible: {get: function(){return this._getter('responsible')}, set: function(v){this._setter('responsible',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true}});
function DocSellingGoodsRow(owner){DocSellingGoodsRow.superclass.constructor.call(this, owner)};
DocSellingGoodsRow._extend($p.TabularSectionRow);
$p.DocSellingGoodsRow = DocSellingGoodsRow;
DocSellingGoodsRow.prototype.__define({nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
unit: {get: function(){return this._getter('unit')}, set: function(v){this._setter('unit',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
discount_percent: {get: function(){return this._getter('discount_percent')}, set: function(v){this._setter('discount_percent',v)}, enumerable: true, configurable: true},
vat_rate: {get: function(){return this._getter('vat_rate')}, set: function(v){this._setter('vat_rate',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
vat_amount: {get: function(){return this._getter('vat_amount')}, set: function(v){this._setter('vat_amount',v)}, enumerable: true, configurable: true},
trans: {get: function(){return this._getter('trans')}, set: function(v){this._setter('trans',v)}, enumerable: true, configurable: true}});
DocSelling.prototype.__define('goods', {get: function(){return this._getter_ts('goods')}, set: function(v){this._setter_ts('goods',v)}, enumerable: true, configurable: true});
function DocSellingServicesRow(owner){DocSellingServicesRow.superclass.constructor.call(this, owner)};
DocSellingServicesRow._extend($p.TabularSectionRow);
$p.DocSellingServicesRow = DocSellingServicesRow;
DocSellingServicesRow.prototype.__define({nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
unit: {get: function(){return this._getter('unit')}, set: function(v){this._setter('unit',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
discount_percent: {get: function(){return this._getter('discount_percent')}, set: function(v){this._setter('discount_percent',v)}, enumerable: true, configurable: true},
vat_rate: {get: function(){return this._getter('vat_rate')}, set: function(v){this._setter('vat_rate',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
vat_amount: {get: function(){return this._getter('vat_amount')}, set: function(v){this._setter('vat_amount',v)}, enumerable: true, configurable: true},
trans: {get: function(){return this._getter('trans')}, set: function(v){this._setter('trans',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
content: {get: function(){return this._getter('content')}, set: function(v){this._setter('content',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
discount_percent: {get: function(){return this._getter('discount_percent')}, set: function(v){this._setter('discount_percent',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
vat_rate: {get: function(){return this._getter('vat_rate')}, set: function(v){this._setter('vat_rate',v)}, enumerable: true, configurable: true},
vat_amount: {get: function(){return this._getter('vat_amount')}, set: function(v){this._setter('vat_amount',v)}, enumerable: true, configurable: true},
trans: {get: function(){return this._getter('trans')}, set: function(v){this._setter('trans',v)}, enumerable: true, configurable: true}});
DocSelling.prototype.__define('services', {get: function(){return this._getter_ts('services')}, set: function(v){this._setter_ts('services',v)}, enumerable: true, configurable: true});
$p.doc.selling = new $p.DocManager('doc.selling');

/**
* ### Документ УстановкаЦенНоменклатуры
* Установка цен номенклатуры
* @class DocNom_prices_setup
* @extends DocObj
* @constructor 
*/
function DocNom_prices_setup(attr, manager){DocNom_prices_setup.superclass.constructor.call(this, attr, manager)}
DocNom_prices_setup._extend($p.DocObj);
$p.DocNom_prices_setup = DocNom_prices_setup;
DocNom_prices_setup.prototype.__define({note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
responsible: {get: function(){return this._getter('responsible')}, set: function(v){this._setter('responsible',v)}, enumerable: true, configurable: true},
price_type: {get: function(){return this._getter('price_type')}, set: function(v){this._setter('price_type',v)}, enumerable: true, configurable: true}});
function DocNom_prices_setupGoodsRow(owner){DocNom_prices_setupGoodsRow.superclass.constructor.call(this, owner)};
DocNom_prices_setupGoodsRow._extend($p.TabularSectionRow);
$p.DocNom_prices_setupGoodsRow = DocNom_prices_setupGoodsRow;
DocNom_prices_setupGoodsRow.prototype.__define({price_type: {get: function(){return this._getter('price_type')}, set: function(v){this._setter('price_type',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
nom_characteristic: {get: function(){return this._getter('nom_characteristic')}, set: function(v){this._setter('nom_characteristic',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
currency: {get: function(){return this._getter('currency')}, set: function(v){this._setter('currency',v)}, enumerable: true, configurable: true}});
DocNom_prices_setup.prototype.__define('goods', {get: function(){return this._getter_ts('goods')}, set: function(v){this._setter_ts('goods',v)}, enumerable: true, configurable: true});
$p.doc.nom_prices_setup = new $p.DocManager('doc.nom_prices_setup');

/**
* ### Документ СобытиеПланирования
* Событие планирования
* @class DocPlanning_event
* @extends DocObj
* @constructor 
*/
function DocPlanning_event(attr, manager){DocPlanning_event.superclass.constructor.call(this, attr, manager)}
DocPlanning_event._extend($p.DocObj);
$p.DocPlanning_event = DocPlanning_event;
DocPlanning_event.prototype.__define({phase: {get: function(){return this._getter('phase')}, set: function(v){this._setter('phase',v)}, enumerable: true, configurable: true},
work_center: {get: function(){return this._getter('work_center')}, set: function(v){this._setter('work_center',v)}, enumerable: true, configurable: true},
recipient: {get: function(){return this._getter('recipient')}, set: function(v){this._setter('recipient',v)}, enumerable: true, configurable: true},
calc_order: {get: function(){return this._getter('calc_order')}, set: function(v){this._setter('calc_order',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true}});
function DocPlanning_eventExecutorsRow(owner){DocPlanning_eventExecutorsRow.superclass.constructor.call(this, owner)};
DocPlanning_eventExecutorsRow._extend($p.TabularSectionRow);
$p.DocPlanning_eventExecutorsRow = DocPlanning_eventExecutorsRow;
DocPlanning_eventExecutorsRow.prototype.__define({executor: {get: function(){return this._getter('executor')}, set: function(v){this._setter('executor',v)}, enumerable: true, configurable: true}});
DocPlanning_event.prototype.__define('executors', {get: function(){return this._getter_ts('executors')}, set: function(v){this._setter_ts('executors',v)}, enumerable: true, configurable: true});
function DocPlanning_eventPlanningRow(owner){DocPlanning_eventPlanningRow.superclass.constructor.call(this, owner)};
DocPlanning_eventPlanningRow._extend($p.TabularSectionRow);
$p.DocPlanning_eventPlanningRow = DocPlanning_eventPlanningRow;
DocPlanning_eventPlanningRow.prototype.__define({executor: {get: function(){return this._getter('executor')}, set: function(v){this._setter('executor',v)}, enumerable: true, configurable: true},
obj: {get: function(){return this._getter('obj')}, set: function(v){this._setter('obj',v)}, enumerable: true, configurable: true},
specimen: {get: function(){return this._getter('specimen')}, set: function(v){this._setter('specimen',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
performance: {get: function(){return this._getter('performance')}, set: function(v){this._setter('performance',v)}, enumerable: true, configurable: true},
event_time: {get: function(){return this._getter('event_time')}, set: function(v){this._setter('event_time',v)}, enumerable: true, configurable: true}});
DocPlanning_event.prototype.__define('planning', {get: function(){return this._getter_ts('planning')}, set: function(v){this._setter_ts('planning',v)}, enumerable: true, configurable: true});
$p.doc.planning_event = new $p.DocManager('doc.planning_event');

/**
* ### Регистр сведений СостоянияЗаказовКлиентов
* Состояния заказов клиентов
* @class IregBuyers_order_states
* @extends RegisterRow
* @constructor 
*/
function IregBuyers_order_states(attr, manager){IregBuyers_order_states.superclass.constructor.call(this, attr, manager)}
IregBuyers_order_states._extend($p.RegisterRow);
$p.IregBuyers_order_states = IregBuyers_order_states;
IregBuyers_order_states.prototype.__define({invoice: {get: function(){return this._getter('invoice')}, set: function(v){this._setter('invoice',v)}, enumerable: true, configurable: true},
state: {get: function(){return this._getter('state')}, set: function(v){this._setter('state',v)}, enumerable: true, configurable: true},
event_date: {get: function(){return this._getter('event_date')}, set: function(v){this._setter('event_date',v)}, enumerable: true, configurable: true},
СуммаОплаты: {get: function(){return this._getter('СуммаОплаты')}, set: function(v){this._setter('СуммаОплаты',v)}, enumerable: true, configurable: true},
ПроцентОплаты: {get: function(){return this._getter('ПроцентОплаты')}, set: function(v){this._setter('ПроцентОплаты',v)}, enumerable: true, configurable: true},
СуммаОтгрузки: {get: function(){return this._getter('СуммаОтгрузки')}, set: function(v){this._setter('СуммаОтгрузки',v)}, enumerable: true, configurable: true},
ПроцентОтгрузки: {get: function(){return this._getter('ПроцентОтгрузки')}, set: function(v){this._setter('ПроцентОтгрузки',v)}, enumerable: true, configurable: true},
СуммаДолга: {get: function(){return this._getter('СуммаДолга')}, set: function(v){this._setter('СуммаДолга',v)}, enumerable: true, configurable: true},
ПроцентДолга: {get: function(){return this._getter('ПроцентДолга')}, set: function(v){this._setter('ПроцентДолга',v)}, enumerable: true, configurable: true},
ЕстьРасхожденияОрдерНакладная: {get: function(){return this._getter('ЕстьРасхожденияОрдерНакладная')}, set: function(v){this._setter('ЕстьРасхожденияОрдерНакладная',v)}, enumerable: true, configurable: true}});
$p.ireg.buyers_order_states = new $p.InfoRegManager('ireg.buyers_order_states');

/**
* ### Регистр сведений $log
* Журнал событий
* @class Ireg$log
* @extends RegisterRow
* @constructor 
*/
function Ireg$log(attr, manager){Ireg$log.superclass.constructor.call(this, attr, manager)}
Ireg$log._extend($p.RegisterRow);
$p.Ireg$log = Ireg$log;
Ireg$log.prototype.__define({date: {get: function(){return this._getter('date')}, set: function(v){this._setter('date',v)}, enumerable: true, configurable: true},
sequence: {get: function(){return this._getter('sequence')}, set: function(v){this._setter('sequence',v)}, enumerable: true, configurable: true},
class: {get: function(){return this._getter('class')}, set: function(v){this._setter('class',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
obj: {get: function(){return this._getter('obj')}, set: function(v){this._setter('obj',v)}, enumerable: true, configurable: true}});
$p.ireg.$log = new $p.LogManager('ireg.$log');

/**
* ### Регистр сведений пзМаржинальныеКоэффициентыИСкидки
* Маржинальные коэффициенты
* @class IregMargin_coefficients
* @extends RegisterRow
* @constructor 
*/
function IregMargin_coefficients(attr, manager){IregMargin_coefficients.superclass.constructor.call(this, attr, manager)}
IregMargin_coefficients._extend($p.RegisterRow);
$p.IregMargin_coefficients = IregMargin_coefficients;
IregMargin_coefficients.prototype.__define({price_group: {get: function(){return this._getter('price_group')}, set: function(v){this._setter('price_group',v)}, enumerable: true, configurable: true},
parameters_key: {get: function(){return this._getter('parameters_key')}, set: function(v){this._setter('parameters_key',v)}, enumerable: true, configurable: true},
condition_formula: {get: function(){return this._getter('condition_formula')}, set: function(v){this._setter('condition_formula',v)}, enumerable: true, configurable: true},
marginality: {get: function(){return this._getter('marginality')}, set: function(v){this._setter('marginality',v)}, enumerable: true, configurable: true},
marginality_min: {get: function(){return this._getter('marginality_min')}, set: function(v){this._setter('marginality_min',v)}, enumerable: true, configurable: true},
marginality_internal: {get: function(){return this._getter('marginality_internal')}, set: function(v){this._setter('marginality_internal',v)}, enumerable: true, configurable: true},
price_type_first_cost: {get: function(){return this._getter('price_type_first_cost')}, set: function(v){this._setter('price_type_first_cost',v)}, enumerable: true, configurable: true},
price_type_sale: {get: function(){return this._getter('price_type_sale')}, set: function(v){this._setter('price_type_sale',v)}, enumerable: true, configurable: true},
price_type_internal: {get: function(){return this._getter('price_type_internal')}, set: function(v){this._setter('price_type_internal',v)}, enumerable: true, configurable: true},
formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
sale_formula: {get: function(){return this._getter('sale_formula')}, set: function(v){this._setter('sale_formula',v)}, enumerable: true, configurable: true},
internal_formula: {get: function(){return this._getter('internal_formula')}, set: function(v){this._setter('internal_formula',v)}, enumerable: true, configurable: true},
external_formula: {get: function(){return this._getter('external_formula')}, set: function(v){this._setter('external_formula',v)}, enumerable: true, configurable: true},
extra_charge_external: {get: function(){return this._getter('extra_charge_external')}, set: function(v){this._setter('extra_charge_external',v)}, enumerable: true, configurable: true},
discount_external: {get: function(){return this._getter('discount_external')}, set: function(v){this._setter('discount_external',v)}, enumerable: true, configurable: true},
discount: {get: function(){return this._getter('discount')}, set: function(v){this._setter('discount',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true}});
$p.ireg.margin_coefficients = new $p.InfoRegManager('ireg.margin_coefficients');

/**
* ### Регистр сведений КурсыВалют
* Курсы валют
* @class IregCurrency_courses
* @extends RegisterRow
* @constructor 
*/
function IregCurrency_courses(attr, manager){IregCurrency_courses.superclass.constructor.call(this, attr, manager)}
IregCurrency_courses._extend($p.RegisterRow);
$p.IregCurrency_courses = IregCurrency_courses;
IregCurrency_courses.prototype.__define({currency: {get: function(){return this._getter('currency')}, set: function(v){this._setter('currency',v)}, enumerable: true, configurable: true},
period: {get: function(){return this._getter('period')}, set: function(v){this._setter('period',v)}, enumerable: true, configurable: true},
course: {get: function(){return this._getter('course')}, set: function(v){this._setter('course',v)}, enumerable: true, configurable: true},
multiplicity: {get: function(){return this._getter('multiplicity')}, set: function(v){this._setter('multiplicity',v)}, enumerable: true, configurable: true}});
$p.ireg.currency_courses = new $p.InfoRegManager('ireg.currency_courses');

/**
* ### Регистр накопления Планирование
* Планирование
* @class AregPlanning
* @extends RegisterRow
* @constructor 
*/
function AregPlanning(attr, manager){AregPlanning.superclass.constructor.call(this, attr, manager)}
AregPlanning._extend($p.RegisterRow);
$p.AregPlanning = AregPlanning;
AregPlanning.prototype.__define({phase: {get: function(){return this._getter('phase')}, set: function(v){this._setter('phase',v)}, enumerable: true, configurable: true},
date: {get: function(){return this._getter('date')}, set: function(v){this._setter('date',v)}, enumerable: true, configurable: true},
work_center: {get: function(){return this._getter('work_center')}, set: function(v){this._setter('work_center',v)}, enumerable: true, configurable: true},
obj: {get: function(){return this._getter('obj')}, set: function(v){this._setter('obj',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
specimen: {get: function(){return this._getter('specimen')}, set: function(v){this._setter('specimen',v)}, enumerable: true, configurable: true},
period: {get: function(){return this._getter('period')}, set: function(v){this._setter('period',v)}, enumerable: true, configurable: true},
recorder: {get: function(){return this._getter('recorder')}, set: function(v){this._setter('recorder',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
cost: {get: function(){return this._getter('cost')}, set: function(v){this._setter('cost',v)}, enumerable: true, configurable: true}});
$p.areg.planning = new $p.AccumRegManager('areg.planning');

/**
* ### Регистр накопления РасчетыСКонтрагентами
* Расчеты с контрагентами
* @class AregInvoice_payments
* @extends RegisterRow
* @constructor 
*/
function AregInvoice_payments(attr, manager){AregInvoice_payments.superclass.constructor.call(this, attr, manager)}
AregInvoice_payments._extend($p.RegisterRow);
$p.AregInvoice_payments = AregInvoice_payments;
AregInvoice_payments.prototype.__define({trans: {get: function(){return this._getter('trans')}, set: function(v){this._setter('trans',v)}, enumerable: true, configurable: true},
partner: {get: function(){return this._getter('partner')}, set: function(v){this._setter('partner',v)}, enumerable: true, configurable: true},
organization: {get: function(){return this._getter('organization')}, set: function(v){this._setter('organization',v)}, enumerable: true, configurable: true},
period: {get: function(){return this._getter('period')}, set: function(v){this._setter('period',v)}, enumerable: true, configurable: true},
recorder: {get: function(){return this._getter('recorder')}, set: function(v){this._setter('recorder',v)}, enumerable: true, configurable: true},
amount_mutual: {get: function(){return this._getter('amount_mutual')}, set: function(v){this._setter('amount_mutual',v)}, enumerable: true, configurable: true},
amount_operation: {get: function(){return this._getter('amount_operation')}, set: function(v){this._setter('amount_operation',v)}, enumerable: true, configurable: true}});
$p.areg.invoice_payments = new $p.AccumRegManager('areg.invoice_payments');

/**
* ### Обработка builder_price
* Метаданные карточки цен номенклатуры
* @class DpBuilder_price
* @extends DataProcessorObj
* @constructor 
*/
function DpBuilder_price(attr, manager){DpBuilder_price.superclass.constructor.call(this, attr, manager)}
DpBuilder_price._extend($p.DataProcessorObj);
$p.DpBuilder_price = DpBuilder_price;
DpBuilder_price.prototype.__define({nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true}});
function DpBuilder_priceGoodsRow(owner){DpBuilder_priceGoodsRow.superclass.constructor.call(this, owner)};
DpBuilder_priceGoodsRow._extend($p.TabularSectionRow);
$p.DpBuilder_priceGoodsRow = DpBuilder_priceGoodsRow;
DpBuilder_priceGoodsRow.prototype.__define({price_type: {get: function(){return this._getter('price_type')}, set: function(v){this._setter('price_type',v)}, enumerable: true, configurable: true},
date: {get: function(){return this._getter('date')}, set: function(v){this._setter('date',v)}, enumerable: true, configurable: true},
nom_characteristic: {get: function(){return this._getter('nom_characteristic')}, set: function(v){this._setter('nom_characteristic',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
currency: {get: function(){return this._getter('currency')}, set: function(v){this._setter('currency',v)}, enumerable: true, configurable: true}});
DpBuilder_price.prototype.__define('goods', {get: function(){return this._getter_ts('goods')}, set: function(v){this._setter_ts('goods',v)}, enumerable: true, configurable: true});
$p.dp.builder_price = new $p.DataProcessorsManager('dp.builder_price');

/**
* ### Обработка ЗаказПокупателя
* УПзП: Заказ покупателя
* @class DpBuyers_order
* @extends DataProcessorObj
* @constructor 
*/
function DpBuyers_order(attr, manager){DpBuyers_order.superclass.constructor.call(this, attr, manager)}
DpBuyers_order._extend($p.DataProcessorObj);
$p.DpBuyers_order = DpBuyers_order;
DpBuyers_order.prototype.__define({nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
characteristic: {get: function(){return this._getter('characteristic')}, set: function(v){this._setter('characteristic',v)}, enumerable: true, configurable: true},
sys: {get: function(){return this._getter('sys')}, set: function(v){this._setter('sys',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
height: {get: function(){return this._getter('height')}, set: function(v){this._setter('height',v)}, enumerable: true, configurable: true},
depth: {get: function(){return this._getter('depth')}, set: function(v){this._setter('depth',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
first_cost: {get: function(){return this._getter('first_cost')}, set: function(v){this._setter('first_cost',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
discount_percent: {get: function(){return this._getter('discount_percent')}, set: function(v){this._setter('discount_percent',v)}, enumerable: true, configurable: true},
discount_percent_internal: {get: function(){return this._getter('discount_percent_internal')}, set: function(v){this._setter('discount_percent_internal',v)}, enumerable: true, configurable: true},
discount: {get: function(){return this._getter('discount')}, set: function(v){this._setter('discount',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
shipping_date: {get: function(){return this._getter('shipping_date')}, set: function(v){this._setter('shipping_date',v)}, enumerable: true, configurable: true},
client_number: {get: function(){return this._getter('client_number')}, set: function(v){this._setter('client_number',v)}, enumerable: true, configurable: true},
inn: {get: function(){return this._getter('inn')}, set: function(v){this._setter('inn',v)}, enumerable: true, configurable: true},
shipping_address: {get: function(){return this._getter('shipping_address')}, set: function(v){this._setter('shipping_address',v)}, enumerable: true, configurable: true},
phone: {get: function(){return this._getter('phone')}, set: function(v){this._setter('phone',v)}, enumerable: true, configurable: true},
price_internal: {get: function(){return this._getter('price_internal')}, set: function(v){this._setter('price_internal',v)}, enumerable: true, configurable: true},
amount_internal: {get: function(){return this._getter('amount_internal')}, set: function(v){this._setter('amount_internal',v)}, enumerable: true, configurable: true},
base_block: {get: function(){return this._getter('base_block')}, set: function(v){this._setter('base_block',v)}, enumerable: true, configurable: true}});
function DpBuyers_orderProduct_paramsRow(owner){DpBuyers_orderProduct_paramsRow.superclass.constructor.call(this, owner)};
DpBuyers_orderProduct_paramsRow._extend($p.TabularSectionRow);
$p.DpBuyers_orderProduct_paramsRow = DpBuyers_orderProduct_paramsRow;
DpBuyers_orderProduct_paramsRow.prototype.__define({ind: {get: function(){return this._getter('ind')}, set: function(v){this._setter('ind',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true}});
DpBuyers_order.prototype.__define('product_params', {get: function(){return this._getter_ts('product_params')}, set: function(v){this._setter_ts('product_params',v)}, enumerable: true, configurable: true});
function DpBuyers_orderProductionRow(owner){DpBuyers_orderProductionRow.superclass.constructor.call(this, owner)};
DpBuyers_orderProductionRow._extend($p.TabularSectionRow);
$p.DpBuyers_orderProductionRow = DpBuyers_orderProductionRow;
DpBuyers_orderProductionRow.prototype.__define({ind: {get: function(){return this._getter('ind')}, set: function(v){this._setter('ind',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
characteristic: {get: function(){return this._getter('characteristic')}, set: function(v){this._setter('characteristic',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
height: {get: function(){return this._getter('height')}, set: function(v){this._setter('height',v)}, enumerable: true, configurable: true},
depth: {get: function(){return this._getter('depth')}, set: function(v){this._setter('depth',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
first_cost: {get: function(){return this._getter('first_cost')}, set: function(v){this._setter('first_cost',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
discount_percent: {get: function(){return this._getter('discount_percent')}, set: function(v){this._setter('discount_percent',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
ordn: {get: function(){return this._getter('ordn')}, set: function(v){this._setter('ordn',v)}, enumerable: true, configurable: true},
qty: {get: function(){return this._getter('qty')}, set: function(v){this._setter('qty',v)}, enumerable: true, configurable: true}});
DpBuyers_order.prototype.__define('production', {get: function(){return this._getter_ts('production')}, set: function(v){this._setter_ts('production',v)}, enumerable: true, configurable: true});
function DpBuyers_orderGlass_specificationRow(owner){DpBuyers_orderGlass_specificationRow.superclass.constructor.call(this, owner)};
DpBuyers_orderGlass_specificationRow._extend($p.TabularSectionRow);
$p.DpBuyers_orderGlass_specificationRow = DpBuyers_orderGlass_specificationRow;
DpBuyers_orderGlass_specificationRow.prototype.__define({ind: {get: function(){return this._getter('ind')}, set: function(v){this._setter('ind',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
characteristic: {get: function(){return this._getter('characteristic')}, set: function(v){this._setter('characteristic',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
height: {get: function(){return this._getter('height')}, set: function(v){this._setter('height',v)}, enumerable: true, configurable: true},
depth: {get: function(){return this._getter('depth')}, set: function(v){this._setter('depth',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
first_cost: {get: function(){return this._getter('first_cost')}, set: function(v){this._setter('first_cost',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
discount_percent: {get: function(){return this._getter('discount_percent')}, set: function(v){this._setter('discount_percent',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
ordn: {get: function(){return this._getter('ordn')}, set: function(v){this._setter('ordn',v)}, enumerable: true, configurable: true},
qty: {get: function(){return this._getter('qty')}, set: function(v){this._setter('qty',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
sorting: {get: function(){return this._getter('sorting')}, set: function(v){this._setter('sorting',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true}});
DpBuyers_order.prototype.__define('glass_specification', {get: function(){return this._getter_ts('glass_specification')}, set: function(v){this._setter_ts('glass_specification',v)}, enumerable: true, configurable: true});
function DpBuyers_orderSpecificationRow(owner){DpBuyers_orderSpecificationRow.superclass.constructor.call(this, owner)};
DpBuyers_orderSpecificationRow._extend($p.TabularSectionRow);
$p.DpBuyers_orderSpecificationRow = DpBuyers_orderSpecificationRow;
DpBuyers_orderSpecificationRow.prototype.__define({ind: {get: function(){return this._getter('ind')}, set: function(v){this._setter('ind',v)}, enumerable: true, configurable: true},
param: {get: function(){return this._getter('param')}, set: function(v){this._setter('param',v)}, enumerable: true, configurable: true},
value: {get: function(){return this._getter('value')}, set: function(v){this._setter('value',v)}, enumerable: true, configurable: true},
hide: {get: function(){return this._getter('hide')}, set: function(v){this._setter('hide',v)}, enumerable: true, configurable: true},
nom: {get: function(){return this._getter('nom')}, set: function(v){this._setter('nom',v)}, enumerable: true, configurable: true},
characteristic: {get: function(){return this._getter('characteristic')}, set: function(v){this._setter('characteristic',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
len: {get: function(){return this._getter('len')}, set: function(v){this._setter('len',v)}, enumerable: true, configurable: true},
height: {get: function(){return this._getter('height')}, set: function(v){this._setter('height',v)}, enumerable: true, configurable: true},
depth: {get: function(){return this._getter('depth')}, set: function(v){this._setter('depth',v)}, enumerable: true, configurable: true},
s: {get: function(){return this._getter('s')}, set: function(v){this._setter('s',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
note: {get: function(){return this._getter('note')}, set: function(v){this._setter('note',v)}, enumerable: true, configurable: true},
first_cost: {get: function(){return this._getter('first_cost')}, set: function(v){this._setter('first_cost',v)}, enumerable: true, configurable: true},
price: {get: function(){return this._getter('price')}, set: function(v){this._setter('price',v)}, enumerable: true, configurable: true},
discount_percent: {get: function(){return this._getter('discount_percent')}, set: function(v){this._setter('discount_percent',v)}, enumerable: true, configurable: true},
amount: {get: function(){return this._getter('amount')}, set: function(v){this._setter('amount',v)}, enumerable: true, configurable: true},
ordn: {get: function(){return this._getter('ordn')}, set: function(v){this._setter('ordn',v)}, enumerable: true, configurable: true},
qty: {get: function(){return this._getter('qty')}, set: function(v){this._setter('qty',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
sorting: {get: function(){return this._getter('sorting')}, set: function(v){this._setter('sorting',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
elm: {get: function(){return this._getter('elm')}, set: function(v){this._setter('elm',v)}, enumerable: true, configurable: true},
dop: {get: function(){return this._getter('dop')}, set: function(v){this._setter('dop',v)}, enumerable: true, configurable: true},
nom_set: {get: function(){return this._getter('nom_set')}, set: function(v){this._setter('nom_set',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
quantity: {get: function(){return this._getter('quantity')}, set: function(v){this._setter('quantity',v)}, enumerable: true, configurable: true},
handle_height_base: {get: function(){return this._getter('handle_height_base')}, set: function(v){this._setter('handle_height_base',v)}, enumerable: true, configurable: true},
handle_height_min: {get: function(){return this._getter('handle_height_min')}, set: function(v){this._setter('handle_height_min',v)}, enumerable: true, configurable: true},
handle_height_max: {get: function(){return this._getter('handle_height_max')}, set: function(v){this._setter('handle_height_max',v)}, enumerable: true, configurable: true},
contraction: {get: function(){return this._getter('contraction')}, set: function(v){this._setter('contraction',v)}, enumerable: true, configurable: true},
contraction_option: {get: function(){return this._getter('contraction_option')}, set: function(v){this._setter('contraction_option',v)}, enumerable: true, configurable: true},
coefficient: {get: function(){return this._getter('coefficient')}, set: function(v){this._setter('coefficient',v)}, enumerable: true, configurable: true},
flap_weight_min: {get: function(){return this._getter('flap_weight_min')}, set: function(v){this._setter('flap_weight_min',v)}, enumerable: true, configurable: true},
flap_weight_max: {get: function(){return this._getter('flap_weight_max')}, set: function(v){this._setter('flap_weight_max',v)}, enumerable: true, configurable: true},
side: {get: function(){return this._getter('side')}, set: function(v){this._setter('side',v)}, enumerable: true, configurable: true},
cnn_side: {get: function(){return this._getter('cnn_side')}, set: function(v){this._setter('cnn_side',v)}, enumerable: true, configurable: true},
offset_option: {get: function(){return this._getter('offset_option')}, set: function(v){this._setter('offset_option',v)}, enumerable: true, configurable: true},
formula: {get: function(){return this._getter('formula')}, set: function(v){this._setter('formula',v)}, enumerable: true, configurable: true},
transfer_option: {get: function(){return this._getter('transfer_option')}, set: function(v){this._setter('transfer_option',v)}, enumerable: true, configurable: true},
is_main_specification_row: {get: function(){return this._getter('is_main_specification_row')}, set: function(v){this._setter('is_main_specification_row',v)}, enumerable: true, configurable: true},
is_set_row: {get: function(){return this._getter('is_set_row')}, set: function(v){this._setter('is_set_row',v)}, enumerable: true, configurable: true},
is_procedure_row: {get: function(){return this._getter('is_procedure_row')}, set: function(v){this._setter('is_procedure_row',v)}, enumerable: true, configurable: true},
is_order_row: {get: function(){return this._getter('is_order_row')}, set: function(v){this._setter('is_order_row',v)}, enumerable: true, configurable: true},
origin: {get: function(){return this._getter('origin')}, set: function(v){this._setter('origin',v)}, enumerable: true, configurable: true}});
DpBuyers_order.prototype.__define('specification', {get: function(){return this._getter_ts('specification')}, set: function(v){this._setter_ts('specification',v)}, enumerable: true, configurable: true});
$p.dp.buyers_order = new $p.DataProcessorsManager('dp.buyers_order');

/**
* ### Обработка builder_lay_impost
* Импосты и раскладки
* @class DpBuilder_lay_impost
* @extends DataProcessorObj
* @constructor 
*/
function DpBuilder_lay_impost(attr, manager){DpBuilder_lay_impost.superclass.constructor.call(this, attr, manager)}
DpBuilder_lay_impost._extend($p.DataProcessorObj);
$p.DpBuilder_lay_impost = DpBuilder_lay_impost;
DpBuilder_lay_impost.prototype.__define({elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
split: {get: function(){return this._getter('split')}, set: function(v){this._setter('split',v)}, enumerable: true, configurable: true},
elm_by_y: {get: function(){return this._getter('elm_by_y')}, set: function(v){this._setter('elm_by_y',v)}, enumerable: true, configurable: true},
step_by_y: {get: function(){return this._getter('step_by_y')}, set: function(v){this._setter('step_by_y',v)}, enumerable: true, configurable: true},
align_by_y: {get: function(){return this._getter('align_by_y')}, set: function(v){this._setter('align_by_y',v)}, enumerable: true, configurable: true},
inset_by_y: {get: function(){return this._getter('inset_by_y')}, set: function(v){this._setter('inset_by_y',v)}, enumerable: true, configurable: true},
elm_by_x: {get: function(){return this._getter('elm_by_x')}, set: function(v){this._setter('elm_by_x',v)}, enumerable: true, configurable: true},
step_by_x: {get: function(){return this._getter('step_by_x')}, set: function(v){this._setter('step_by_x',v)}, enumerable: true, configurable: true},
align_by_x: {get: function(){return this._getter('align_by_x')}, set: function(v){this._setter('align_by_x',v)}, enumerable: true, configurable: true},
inset_by_x: {get: function(){return this._getter('inset_by_x')}, set: function(v){this._setter('inset_by_x',v)}, enumerable: true, configurable: true},
w: {get: function(){return this._getter('w')}, set: function(v){this._setter('w',v)}, enumerable: true, configurable: true},
h: {get: function(){return this._getter('h')}, set: function(v){this._setter('h',v)}, enumerable: true, configurable: true}});
$p.dp.builder_lay_impost = new $p.DataProcessorsManager('dp.builder_lay_impost');

/**
* ### Обработка builder_pen
* Метаданные инструмента pen (рисование профилей) графического построителя
* @class DpBuilder_pen
* @extends DataProcessorObj
* @constructor 
*/
function DpBuilder_pen(attr, manager){DpBuilder_pen.superclass.constructor.call(this, attr, manager)}
DpBuilder_pen._extend($p.DataProcessorObj);
$p.DpBuilder_pen = DpBuilder_pen;
DpBuilder_pen.prototype.__define({elm_type: {get: function(){return this._getter('elm_type')}, set: function(v){this._setter('elm_type',v)}, enumerable: true, configurable: true},
inset: {get: function(){return this._getter('inset')}, set: function(v){this._setter('inset',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
bind_generatrix: {get: function(){return this._getter('bind_generatrix')}, set: function(v){this._setter('bind_generatrix',v)}, enumerable: true, configurable: true},
bind_node: {get: function(){return this._getter('bind_node')}, set: function(v){this._setter('bind_node',v)}, enumerable: true, configurable: true}});
$p.dp.builder_pen = new $p.DataProcessorsManager('dp.builder_pen');

/**
* ### Обработка builder_text
* Метаданные инструмента text графического построителя
* @class DpBuilder_text
* @extends DataProcessorObj
* @constructor 
*/
function DpBuilder_text(attr, manager){DpBuilder_text.superclass.constructor.call(this, attr, manager)}
DpBuilder_text._extend($p.DataProcessorObj);
$p.DpBuilder_text = DpBuilder_text;
DpBuilder_text.prototype.__define({text: {get: function(){return this._getter('text')}, set: function(v){this._setter('text',v)}, enumerable: true, configurable: true},
font_family: {get: function(){return this._getter('font_family')}, set: function(v){this._setter('font_family',v)}, enumerable: true, configurable: true},
bold: {get: function(){return this._getter('bold')}, set: function(v){this._setter('bold',v)}, enumerable: true, configurable: true},
font_size: {get: function(){return this._getter('font_size')}, set: function(v){this._setter('font_size',v)}, enumerable: true, configurable: true},
angle: {get: function(){return this._getter('angle')}, set: function(v){this._setter('angle',v)}, enumerable: true, configurable: true},
align: {get: function(){return this._getter('align')}, set: function(v){this._setter('align',v)}, enumerable: true, configurable: true},
clr: {get: function(){return this._getter('clr')}, set: function(v){this._setter('clr',v)}, enumerable: true, configurable: true},
x: {get: function(){return this._getter('x')}, set: function(v){this._setter('x',v)}, enumerable: true, configurable: true},
y: {get: function(){return this._getter('y')}, set: function(v){this._setter('y',v)}, enumerable: true, configurable: true}});
$p.dp.builder_text = new $p.DataProcessorsManager('dp.builder_text');
};


$p.md.init({"enm":{"accumulation_record_type":[{"order":0,"name":"debit","synonym":"Приход"},{"order":1,"name":"credit","synonym":"Расход"}],"inset_attrs_options":[{"order":0,"name":"НеПоперечина","synonym":"Не поперечина"},{"order":1,"name":"ОбаНаправления","synonym":"Оба направления"},{"order":2,"name":"ОтключитьВтороеНаправление","synonym":"Отключить второе направление"},{"order":3,"name":"ОтключитьШагиВторогоНаправления","synonym":"Отключить шаги второго направления"},{"order":4,"name":"ОтключитьПервоеНаправление","synonym":"Отключить первое направление"},{"order":5,"name":"ОтключитьШагиПервогоНаправления","synonym":"Отключить шаги первого направления"}],"impost_mount_options":[{"order":0,"name":"НетКрепленийИмпостовИРам","synonym":"Нет креплений импостов и рам"},{"order":1,"name":"МогутКрепитьсяИмпосты","synonym":"Могут крепиться импосты"},{"order":2,"name":"ДолжныБытьКрепленияИмпостов","synonym":"Должны быть крепления импостов"}],"mutual_contract_settlements":[{"order":0,"name":"ПоДоговоруВЦелом","synonym":"По договору в целом"},{"order":1,"name":"ПоЗаказам","synonym":"По заказам"},{"order":2,"name":"ПоСчетам","synonym":"По счетам"}],"contract_kinds":[{"order":0,"name":"СПоставщиком","synonym":"С поставщиком"},{"order":1,"name":"СПокупателем","synonym":"С покупателем"},{"order":2,"name":"СКомитентом","synonym":"С комитентом"},{"order":3,"name":"СКомиссионером","synonym":"С комиссионером"},{"order":4,"name":"Прочее","synonym":"Прочее"}],"obj_delivery_states":[{"order":0,"name":"Черновик","synonym":"Черновик"},{"order":1,"name":"Отправлен","synonym":"Отправлен"},{"order":2,"name":"Подтвержден","synonym":"Подтвержден"},{"order":3,"name":"Отклонен","synonym":"Отклонен"},{"order":4,"name":"Отозван","synonym":"Отозван"},{"order":5,"name":"Архив","synonym":"Перенесён в архив"},{"order":6,"name":"Шаблон","synonym":"Шаблон"}],"caching_type":[{"order":0,"name":"ram","synonym":"ram"},{"order":1,"name":"doc","synonym":"doc"},{"order":2,"name":"doc_remote","synonym":"doc_remote"},{"order":3,"name":"meta","synonym":"meta"},{"order":4,"name":"e1cib","synonym":"e1cib"}],"order_categories":[{"order":0,"name":"РасчетЗаказ","synonym":"Расчет заказ"},{"order":1,"name":"Сервис","synonym":"Сервис"},{"order":2,"name":"Рекламация","synonym":"Рекламация"}],"transfer_operations_options":[{"order":0,"name":"НетПереноса","synonym":"Нет переноса"},{"order":1,"name":"НаПримыкающий","synonym":"На примыкающий"}],"offset_options":[{"order":0,"name":"ОтНачалаСтороны","synonym":"От начала стороны"},{"order":1,"name":"ОтКонцаСтороны","synonym":"От конца стороны"},{"order":2,"name":"ОтРучки","synonym":"От ручки"},{"order":3,"name":"РазмерПоФальцу","synonym":"Размер по фальцу"},{"order":4,"name":"Формула","synonym":"Формула"}],"contraction_options":[{"order":0,"name":"ОтДлиныСтороны","synonym":"От длины стороны"},{"order":1,"name":"ОтВысотыРучки","synonym":"От высоты ручки"},{"order":2,"name":"ОтДлиныСтороныМинусВысотыРучки","synonym":"От длины стороны минус высота ручки"},{"order":3,"name":"ФиксированнаяДлина","synonym":"Фиксированная длина"}],"text_aligns":[{"order":0,"name":"left","synonym":"Лево"},{"order":1,"name":"right","synonym":"Право"},{"order":2,"name":"center","synonym":"Центр"}],"color_groups_destination":[{"order":0,"name":"ДляЦенообразования","synonym":"Для ценообразования"},{"order":1,"name":"ДляХарактеристик","synonym":"Для характеристик"},{"order":2,"name":"ДляГруппировкиВПараметрах","synonym":"Для группировки в параметрах"}],"open_directions":[{"order":0,"name":"Левое","synonym":"Левое"},{"order":1,"name":"Правое","synonym":"Правое"},{"order":2,"name":"Откидное","synonym":"Откидное"}],"plan_limit":[{"order":0,"name":"ПоУО","synonym":"По условным изделиям"},{"order":1,"name":"ПоПлощади","synonym":"По площади изделий"},{"order":2,"name":"ПоКоличеству","synonym":"По количеству изделий или элементов"},{"order":3,"name":"ПоКоличествуОпераций","synonym":"По количеству технологических операций"},{"order":4,"name":"НеОграничивать","synonym":"Не ограничивать"}],"orientations":[{"order":0,"name":"Горизонтальная","synonym":"Горизонтальная"},{"order":1,"name":"Вертикальная","synonym":"Вертикальная"},{"order":2,"name":"Наклонная","synonym":"Наклонная"}],"simple_complex_all":[{"order":0,"name":"Простые","synonym":"Простые"},{"order":1,"name":"Сложные","synonym":"Сложные"},{"order":2,"name":"Все","synonym":"Все"}],"count_calculating_ways":[{"order":0,"name":"ПоПериметру","synonym":"По периметру"},{"order":1,"name":"ПоПлощади","synonym":"По площади"},{"order":2,"name":"ДляЭлемента","synonym":"Для элемента"},{"order":3,"name":"ПоШагам","synonym":"По шагам"},{"order":4,"name":"ПоФормуле","synonym":"По формуле"}],"angle_calculating_ways":[{"order":0,"name":"Основной","synonym":"Основной"},{"order":1,"name":"СварнойШов","synonym":"Сварной шов"},{"order":2,"name":"СоединениеПополам","synonym":"Соед./2"},{"order":3,"name":"Соединение","synonym":"Соединение"},{"order":4,"name":"_90","synonym":"90"},{"order":5,"name":"НеСчитать","synonym":"Не считать"}],"specification_installation_methods":[{"order":0,"name":"Всегда","synonym":"Всегда"},{"order":1,"name":"САртикулом1","synonym":"с Арт1"},{"order":2,"name":"САртикулом2","synonym":"с Арт2"}],"cnn_sides":[{"order":0,"name":"Изнутри","synonym":"Изнутри"},{"order":1,"name":"Снаружи","synonym":"Снаружи"},{"order":2,"name":"Любая","synonym":"Любая"}],"inserts_types":[{"order":0,"name":"Профиль","synonym":"Профиль"},{"order":1,"name":"Заполнение","synonym":"Заполнение"},{"order":2,"name":"Стеклопакет","synonym":"Стеклопакет"},{"order":3,"name":"ТиповойСтеклопакет","synonym":"Типовой стеклопакет"},{"order":4,"name":"МоскитнаяСетка","synonym":"Москитная сетка"},{"order":5,"name":"Раскладка","synonym":"Раскладка"},{"order":6,"name":"Набор","synonym":"Набор"},{"order":7,"name":"Аксессуар","synonym":"Аксессуар"},{"order":8,"name":"Монтаж","synonym":"Монтаж"},{"order":9,"name":"Контур","synonym":"Контур"},{"order":10,"name":"Изделие","synonym":"Изделие"}],"inserts_glass_types":[{"order":0,"name":"Стекло","synonym":"Стекло"},{"order":1,"name":"Рамка","synonym":"Рамка"},{"order":2,"name":"Газозаполнение","synonym":"Газозаполнение"}],"lay_split_types":[{"order":0,"name":"ДелениеГоризонтальных","synonym":"Деление горизонтальных"},{"order":1,"name":"ДелениеВертикальных","synonym":"Деление вертикальных"},{"order":2,"name":"КрестВСтык","synonym":"Крест в стык"},{"order":3,"name":"КрестПересечение","synonym":"Крест пересечение"}],"cutting_optimization_types":[{"order":0,"name":"Нет","synonym":"Нет"},{"order":1,"name":"РасчетНарезки","synonym":"Расчет нарезки"},{"order":2,"name":"НельзяВращатьПереворачивать","synonym":"Нельзя вращать переворачивать"},{"order":3,"name":"ТолькоНомераЯчеек","synonym":"Только номера ячеек"}],"open_types":[{"order":0,"name":"Глухое","synonym":"Глухое"},{"order":1,"name":"Поворотное","synonym":"Поворотное"},{"order":2,"name":"Откидное","synonym":"Откидное"},{"order":3,"name":"ПоворотноОткидное","synonym":"Поворотно-откидное"},{"order":4,"name":"Раздвижное","synonym":"Раздвижное"},{"order":5,"name":"Неподвижное","synonym":"Неподвижное"}],"sz_line_types":[{"order":0,"name":"Обычные","synonym":"Обычные"},{"order":1,"name":"ТолькоГабаритные","synonym":"Только габаритные"},{"order":2,"name":"РазмерыПоСтворкам","synonym":"Размеры по створкам"},{"order":3,"name":"БезРазмеров","synonym":"Без размеров"},{"order":4,"name":"Сокращенные","synonym":"Сокращенные"}],"cnn_types":[{"order":0,"name":"УгловоеДиагональное","synonym":"Угловое диагональное"},{"order":1,"name":"УгловоеКВертикальной","synonym":"Угловое к вертикальной"},{"order":2,"name":"УгловоеКГоризонтальной","synonym":"Угловое к горизонтальной"},{"order":3,"name":"ТОбразное","synonym":"Т-образное"},{"order":4,"name":"Наложение","synonym":"Наложение"},{"order":5,"name":"НезамкнутыйКонтур","synonym":"Незамкнутый контур"},{"order":6,"name":"КрестВСтык","synonym":"Крест в стык"},{"order":7,"name":"КрестПересечение","synonym":"Крест пересечение"}],"elm_types":[{"order":0,"name":"Рама","synonym":"Рама"},{"order":1,"name":"Створка","synonym":"Створка"},{"order":2,"name":"Импост","synonym":"Импост"},{"order":3,"name":"Штульп","synonym":"Штульп"},{"order":4,"name":"Стекло","synonym":"Стекло - стеклопакет"},{"order":5,"name":"Заполнение","synonym":"Заполнение - сэндвич"},{"order":6,"name":"Раскладка","synonym":"Раскладка - фальшпереплет"},{"order":7,"name":"Текст","synonym":"Текст"},{"order":8,"name":"Линия","synonym":"Линия"},{"order":9,"name":"Размер","synonym":"Размер"},{"order":10,"name":"Добор","synonym":"Доборный проф."},{"order":11,"name":"Соединитель","synonym":"Соединит. профиль"},{"order":12,"name":"Москитка","synonym":"Москитн. сетка"},{"order":13,"name":"Фурнитура","synonym":"Фурнитура"},{"order":14,"name":"Макрос","synonym":"Макрос обр центра"},{"order":15,"name":"Подоконник","synonym":"Подоконник"},{"order":16,"name":"Водоотлив","synonym":"Водоотлив"},{"order":17,"name":"ОшибкаКритическая","synonym":"Ошибка критическая"},{"order":18,"name":"ОшибкаИнфо","synonym":"Ошибка инфо"},{"order":19,"name":"Визуализация","synonym":"Визуализация"},{"order":20,"name":"Прочее","synonym":"Прочее"},{"order":21,"name":"Продукция","synonym":"Продукция"},{"order":22,"name":"Доставка","synonym":"Доставка"},{"order":23,"name":"РаботыЦеха","synonym":"Работы цеха"},{"order":24,"name":"РаботыМонтажа","synonym":"Работы монтажа"},{"order":25,"name":"Монтаж","synonym":"Монтаж"},{"order":26,"name":"Уплотнение","synonym":"Уплотнение"},{"order":27,"name":"Арматура","synonym":"Армирование"},{"order":28,"name":"Штапик","synonym":"Штапик"},{"order":29,"name":"Порог","synonym":"Порог"},{"order":30,"name":"Подставочник","synonym":"Подставочн. профиль"}],"positions":[{"order":0,"name":"Любое","synonym":"Любое"},{"order":1,"name":"Верх","synonym":"Верх"},{"order":2,"name":"Низ","synonym":"Низ"},{"order":3,"name":"Лев","synonym":"Лев"},{"order":4,"name":"Прав","synonym":"Прав"},{"order":5,"name":"ЦентрВертикаль","synonym":"Центр вертикаль"},{"order":6,"name":"ЦентрГоризонталь","synonym":"Центр горизонталь"},{"order":7,"name":"Центр","synonym":"Центр"},{"order":8,"name":"ЛевВерх","synonym":"Лев верх"},{"order":9,"name":"ЛевНиз","synonym":"Лев низ"},{"order":10,"name":"ПравВерх","synonym":"Прав верх"},{"order":11,"name":"ПравНиз","synonym":"Прав низ"}],"gender":[{"order":0,"name":"Мужской","synonym":"Мужской"},{"order":1,"name":"Женский","synonym":"Женский"}],"buyers_order_states":[{"order":0,"name":"ОжидаетсяСогласование","synonym":"Ожидается согласование"},{"order":1,"name":"ОжидаетсяАвансДоОбеспечения","synonym":"Ожидается аванс (до обеспечения)"},{"order":2,"name":"ГотовКОбеспечению","synonym":"Готов к обеспечению"},{"order":3,"name":"ОжидаетсяПредоплатаДоОтгрузки","synonym":"Ожидается предоплата (до отгрузки)"},{"order":4,"name":"ОжидаетсяОбеспечение","synonym":"Ожидается обеспечение"},{"order":5,"name":"ГотовКОтгрузке","synonym":"Готов к отгрузке"},{"order":6,"name":"ВПроцессеОтгрузки","synonym":"В процессе отгрузки"},{"order":7,"name":"ОжидаетсяОплатаПослеОтгрузки","synonym":"Ожидается оплата (после отгрузки)"},{"order":8,"name":"ГотовКЗакрытию","synonym":"Готов к закрытию"},{"order":9,"name":"Закрыт","synonym":"Закрыт"}],"vat_rates":[{"order":0,"name":"НДС18","synonym":"18%"},{"order":1,"name":"НДС18_118","synonym":"18% / 118%"},{"order":2,"name":"НДС10","synonym":"10%"},{"order":3,"name":"НДС10_110","synonym":"10% / 110%"},{"order":4,"name":"НДС0","synonym":"0%"},{"order":5,"name":"БезНДС","synonym":"Без НДС"},{"order":6,"name":"НДС20","synonym":"20%"},{"order":7,"name":"НДС20_120","synonym":"20% / 120%"}],"contact_information_types":[{"order":0,"name":"Адрес","synonym":"Адрес"},{"order":1,"name":"Телефон","synonym":"Телефон"},{"order":2,"name":"АдресЭлектроннойПочты","synonym":"Адрес электронной почты"},{"order":3,"name":"ВебСтраница","synonym":"Веб страница"},{"order":4,"name":"Факс","synonym":"Факс"},{"order":5,"name":"Другое","synonym":"Другое"},{"order":6,"name":"Skype","synonym":"Skype"}],"nom_types":[{"order":0,"name":"Товар","synonym":"Товар, материал"},{"order":1,"name":"Услуга","synonym":"Услуга"},{"order":2,"name":"Работа","synonym":"Работа, техоперация"}],"individual_legal":[{"order":0,"name":"ЮрЛицо","synonym":"Юрлицо"},{"order":1,"name":"ФизЛицо","synonym":"Физлицо"}]},"cat":{"params_links":{"name":"пзСвязиПараметров","splitted":true,"synonym":"Связи параметров","illustration":"Подчиненные параметры","obj_presentation":"Связь параметров","list_presentation":"Связи параметров","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"master":{"synonym":"Ведущий","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"slave":{"synonym":"Ведомый","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"zone":{"synonym":"Область","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"values":{"name":"Значения","synonym":"Значения","tooltip":"","fields":{"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["slave"]}],"choice_groups_elm":"elm","choice_type":{"path":["slave"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}}},"cachable":"ram"},"partner_bank_accounts":{"name":"БанковскиеСчетаКонтрагентов","splitted":true,"synonym":"Банковские счета","illustration":"Банковские счета сторонних контрагентов и физических лиц.","obj_presentation":"Банковский счет","list_presentation":"Банковские счета","input_by_string":["name","account_number"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"account_number":{"synonym":"Номер счета","multiline_mode":false,"tooltip":"Номер расчетного счета организации","mandatory":true,"type":{"types":["string"],"str_len":20}},"bank":{"synonym":"Банк","multiline_mode":false,"tooltip":"Банк, в котором открыт расчетный счет организации","choice_groups_elm":"elm","type":{"types":["cat.banks_qualifier"],"is_ref":true}},"settlements_bank":{"synonym":"Банк для расчетов","multiline_mode":false,"tooltip":"Банк, в случае непрямых расчетов","choice_groups_elm":"elm","type":{"types":["cat.banks_qualifier"],"is_ref":true}},"correspondent_text":{"synonym":"Текст корреспондента","multiline_mode":false,"tooltip":"Текст \"Плательщик\\Получатель\" в платежных документах","type":{"types":["string"],"str_len":250}},"appointments_text":{"synonym":"Текст назначения","multiline_mode":false,"tooltip":"Текст назначения платежа","type":{"types":["string"],"str_len":250}},"funds_currency":{"synonym":"Валюта","multiline_mode":false,"tooltip":"Валюта учета денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"bank_bic":{"synonym":"БИКБанка","multiline_mode":false,"tooltip":"БИК банка, в котором открыт счет","type":{"types":["string"],"str_len":9}},"bank_name":{"synonym":"Наименование банка","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":100}},"bank_correspondent_account":{"synonym":"Корр. счет банк","multiline_mode":false,"tooltip":"Корр.счет банка","type":{"types":["string"],"str_len":20}},"bank_city":{"synonym":"Город банка","multiline_mode":false,"tooltip":"Город банка","type":{"types":["string"],"str_len":50}},"bank_address":{"synonym":"Адрес банка","multiline_mode":false,"tooltip":"Адрес банка","type":{"types":["string"],"str_len":0}},"bank_phone_numbers":{"synonym":"Телефоны банка","multiline_mode":false,"tooltip":"Телефоны банка","type":{"types":["string"],"str_len":0}},"settlements_bank_bic":{"synonym":"БИК банка для расчетов","multiline_mode":false,"tooltip":"БИК банка, в случае непрямых расчетов","type":{"types":["string"],"str_len":9}},"settlements_bank_correspondent_account":{"synonym":"Корр. счет банка для расчетов","multiline_mode":false,"tooltip":"Корр.счет банка, в случае непрямых расчетов","type":{"types":["string"],"str_len":20}},"settlements_bank_city":{"synonym":"Город банка для расчетов","multiline_mode":false,"tooltip":"Город банка, в случае непрямых расчетов","type":{"types":["string"],"str_len":50}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"Контрагент или физическое лицо, являющиеся владельцем банковского счета","choice_params":[{"name":"is_folder","path":false}],"mandatory":true,"type":{"types":["cat.individuals","cat.partners"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","hide":true,"form":{"obj":{"head":{" ":["name","owner","account_number","funds_currency","bank_bic","bank","settlements_bank_bic","settlements_bank"]}}}},"organization_bank_accounts":{"name":"БанковскиеСчетаОрганизаций","splitted":true,"synonym":"Банковские счета организаций","illustration":"Банковские счета собственных организаций. ","obj_presentation":"Банковский счет организации","list_presentation":"Банковские счета","input_by_string":["name","account_number"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"bank":{"synonym":"Банк","multiline_mode":false,"tooltip":"Банк, в котором открыт расчетный счет организации","choice_groups_elm":"elm","type":{"types":["cat.banks_qualifier"],"is_ref":true}},"bank_bic":{"synonym":"БИКБанка","multiline_mode":false,"tooltip":"БИК банка, в котором открыт счет","type":{"types":["string"],"str_len":9}},"funds_currency":{"synonym":"Валюта денежных средств","multiline_mode":false,"tooltip":"Валюта учета денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"account_number":{"synonym":"Номер счета","multiline_mode":false,"tooltip":"Номер расчетного счета организации","mandatory":true,"type":{"types":["string"],"str_len":20}},"settlements_bank":{"synonym":"Банк для расчетов","multiline_mode":false,"tooltip":"Банк, в случае непрямых расчетов","choice_groups_elm":"elm","type":{"types":["cat.banks_qualifier"],"is_ref":true}},"settlements_bank_bic":{"synonym":"БИК банка для расчетов","multiline_mode":false,"tooltip":"БИК банка, в случае непрямых расчетов","type":{"types":["string"],"str_len":9}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"Подразделение, отвечающее за банковский счет.","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Организация","multiline_mode":false,"tooltip":"Организация, являющиеся владельцем банковского счета","choice_params":[{"name":"is_folder","path":false}],"mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","hide":true,"form":{"obj":{"head":{" ":["name","owner","account_number","funds_currency","bank_bic","bank","settlements_bank_bic","settlements_bank"]}}}},"work_center_kinds":{"name":"ВидыРабочихЦентров","splitted":true,"synonym":"Виды рабочих центров","illustration":"","obj_presentation":"Вид рабочего центра","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"Подразделение, к которому относится вид рабочего центра.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа видов рабочих центров","multiline_mode":false,"tooltip":"Группа, в которую входит данный вид рабочего центра","type":{"types":["cat.work_center_kinds"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","grouping":"array"},"property_values_hierarchy":{"name":"ЗначенияСвойствОбъектовИерархия","splitted":true,"synonym":"Дополнительные значения (иерархия)","illustration":"","obj_presentation":"Дополнительное значение (иерархия)","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":true,"group_hierarchy":false,"main_presentation_name":true,"code_length":0,"fields":{"heft":{"synonym":"Весовой коэффициент","multiline_mode":false,"tooltip":"Относительный вес дополнительного значения (значимость).","type":{"types":["number"],"digits":10,"fraction_figits":2}},"ПолноеНаименование":{"synonym":"Полное наименование","multiline_mode":true,"tooltip":"Подробное описание значения дополнительного реквизита","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит или сведение.","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"parent":{"synonym":"Входит в группу","multiline_mode":false,"tooltip":"Вышестоящее дополнительное значение свойства.","choice_links":[{"name":["selection","owner"],"path":["owner"]}],"type":{"types":["cat.property_values_hierarchy"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","grouping":"array"},"banks_qualifier":{"name":"КлассификаторБанковРФ","splitted":false,"synonym":"Классификатор банков РФ","illustration":"","obj_presentation":"Банк","list_presentation":"Банки","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"correspondent_account":{"synonym":"Корр. счет","multiline_mode":false,"tooltip":"Корреспондентский счет банка","type":{"types":["string"],"str_len":20}},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город банка","type":{"types":["string"],"str_len":50}},"address":{"synonym":"Адрес","multiline_mode":false,"tooltip":"Адрес банка","type":{"types":["string"],"str_len":500}},"phone_numbers":{"synonym":"Телефоны","multiline_mode":false,"tooltip":"Телефоны банка","type":{"types":["string"],"str_len":250}},"activity_ceased":{"synonym":"Деятельность прекращена","multiline_mode":false,"tooltip":"Банк по каким-либо причинам прекратил свою деятельность","type":{"types":["boolean"]}},"swift":{"synonym":"СВИФТ БИК","multiline_mode":false,"tooltip":"Международный банковский идентификационный код (SWIFT BIC)","type":{"types":["string"],"str_len":11}},"inn":{"synonym":"ИНН","multiline_mode":false,"tooltip":"Идентификационный номер налогоплательщика","type":{"types":["string"],"str_len":12}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа банков","multiline_mode":false,"tooltip":"Группа банков, в которую входит данный банк","type":{"types":["cat.banks_qualifier"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","hide":true},"destinations":{"name":"НаборыДополнительныхРеквизитовИСведений","splitted":true,"synonym":"Наборы дополнительных реквизитов и сведений","illustration":"","obj_presentation":"Набор дополнительных реквизитов и сведений","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"КоличествоРеквизитов":{"synonym":"Количество реквизитов","multiline_mode":false,"tooltip":"Количество реквизитов в наборе не помеченных на удаление.","type":{"types":["string"],"str_len":5}},"КоличествоСведений":{"synonym":"Количество сведений","multiline_mode":false,"tooltip":"Количество сведений в наборе не помеченных на удаление.","type":{"types":["string"],"str_len":5}},"Используется":{"synonym":"Используется","multiline_mode":false,"tooltip":"Набор свойств отображается в форме списка","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Входит в группу","multiline_mode":false,"tooltip":"Группа, к которой относится набор.","type":{"types":["cat.destinations"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Дополнительный реквизит","multiline_mode":false,"tooltip":"Дополнительный реквизит этого набора","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"_deleted":{"synonym":"Пометка удаления","multiline_mode":false,"tooltip":"Устанавливается при исключении дополнительного реквизита из набора,\nчтобы можно было вернуть связь с уникальным дополнительным реквизитом.","type":{"types":["boolean"]}}}},"extra_properties":{"name":"ДополнительныеСведения","synonym":"Дополнительные сведения","tooltip":"","fields":{"property":{"synonym":"Дополнительное сведение","multiline_mode":false,"tooltip":"Дополнительное сведение этого набора","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"_deleted":{"synonym":"Пометка удаления","multiline_mode":false,"tooltip":"Устанавливается при исключении дополнительного сведения из набора,\nчтобы можно было вернуть связь с уникальным дополнительным сведением.","type":{"types":["boolean"]}}}}},"cachable":"ram","grouping":"array"},"work_centers":{"name":"РабочиеЦентры","splitted":true,"synonym":"Рабочие центры","illustration":"","obj_presentation":"Рабочий центр","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"work_center_kind":{"synonym":"Вид рабочего центра","multiline_mode":false,"tooltip":"Вид, к которому относится данный рабочий центр для планирования","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.work_center_kinds"],"is_ref":true}},"КоэффициентВремениРаботы":{"synonym":"Коэффициент времени работы","multiline_mode":false,"tooltip":"Определяет коэффициент изменения нормативного времени работы","mandatory":true,"type":{"types":["number"],"digits":5,"fraction_figits":2}},"МаксимальнаяЗагрузка":{"synonym":"Максимальная загрузка","multiline_mode":false,"tooltip":"Максимальная загрузка рабочего центра","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"calendar":{"synonym":"График работы","multiline_mode":false,"tooltip":"График работы рабочего центра.","choice_groups_elm":"elm","type":{"types":["cat.calendars"],"is_ref":true}},"definition":{"synonym":"Описание","multiline_mode":false,"tooltip":"Произвольный комментарий","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Входит в группу","multiline_mode":false,"tooltip":"Группа, в которую входит рабочий центр","type":{"types":["cat.work_centers"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","grouping":"array"},"countries":{"name":"СтраныМира","splitted":true,"synonym":"Страны мира","illustration":"","obj_presentation":"Страна мира","list_presentation":"","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":3,"fields":{"name_full":{"synonym":"Наименование полное","multiline_mode":false,"tooltip":"Полное наименование страны мира","type":{"types":["string"],"str_len":100}},"alpha2":{"synonym":"Код альфа-2","multiline_mode":false,"tooltip":"Двузначный буквенный код альфа-2 страны по ОКСМ","type":{"types":["string"],"str_len":2}},"alpha3":{"synonym":"Код альфа-3","multiline_mode":false,"tooltip":"Трехзначный буквенный код альфа-3 страны по ОКСМ","type":{"types":["string"],"str_len":3}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram","grouping":"array"},"formulas":{"name":"Формулы","splitted":true,"synonym":"Формулы","illustration":"Формулы пользователя, для выполнения при расчете спецификаций в справочниках Вставки, Соединения, Фурнитура и регистре Корректировки спецификации","obj_presentation":"Формула","list_presentation":"","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"Текст функции на языке javascript","type":{"types":["string"],"str_len":0}},"leading_formula":{"synonym":"Ведущая формула","multiline_mode":false,"tooltip":"Если указано, выполняется код ведущей формулы с параметрами, заданными для текущей формулы","choice_params":[{"name":"leading_formula","path":{"ref":"00000000-0000-0000-0000-000000000000","presentation":"","type":"cat.formulas"}}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"condition_formula":{"synonym":"Это формула условия","multiline_mode":false,"tooltip":"Формула используется, как фильтр, а не как алгоритм расчета количества.\nЕсли возвращает не Истина, строка в спецификацию не добавляется","type":{"types":["boolean"]}},"definition":{"synonym":"Описание","multiline_mode":true,"tooltip":"Описание в формате html","type":{"types":["string"],"str_len":0}},"template":{"synonym":"Шаблон","multiline_mode":true,"tooltip":"html шаблон отчета","type":{"types":["string"],"str_len":0}},"zone":{"synonym":"Область","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"Группа формул","type":{"types":["cat.formulas"],"is_ref":true}}},"tabular_sections":{"params":{"name":"Параметры","synonym":"Параметры","tooltip":"","fields":{"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["string","cch.properties"],"str_len":50,"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["param"],"path":["params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}}}}},"cachable":"doc"},"elm_visualization":{"name":"пзВизуализацияЭлементов","splitted":true,"synonym":"Визуализация элементов","illustration":"Строки svg для рисования петель, ручек и графических примитивов","obj_presentation":"Визуализация элемента","list_presentation":"Визуализация элементов","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"svg_path":{"synonym":"Путь SVG","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"note":{"synonym":"Комментарий","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"attributes":{"synonym":"Атрибуты","multiline_mode":false,"tooltip":"Дополнительные атрибуты svg path","type":{"types":["string"],"str_len":0}},"rotate":{"synonym":"Поворачивать","multiline_mode":false,"tooltip":"правила поворота эскиза параллельно касательной профиля в точке визуализации\n0 - поворачивать\n1 - ручка","type":{"types":["number"],"digits":1,"fraction_figits":0}},"offset":{"synonym":"Смещение","multiline_mode":false,"tooltip":"Смещение в мм относительно внещнего ребра элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"side":{"synonym":"Сторона соедин.","multiline_mode":false,"tooltip":"имеет смысл только для импостов","choice_groups_elm":"elm","type":{"types":["enm.cnn_sides"],"is_ref":true}},"elm_side":{"synonym":"Сторона элем.","multiline_mode":false,"tooltip":"(0) - изнутри, (1) - снаружи, (-1) - в середине элемента","type":{"types":["number"],"digits":1,"fraction_figits":0}},"cx":{"synonym":"cx","multiline_mode":false,"tooltip":"Координата точки привязки","type":{"types":["number"],"digits":6,"fraction_figits":0}},"cy":{"synonym":"cy","multiline_mode":false,"tooltip":"Координата точки привязки","type":{"types":["number"],"digits":6,"fraction_figits":0}},"angle_hor":{"synonym":"Угол к горизонту","multiline_mode":false,"tooltip":"Угол к к горизонту элемента по умолчанию","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram"},"currencies":{"name":"Валюты","splitted":true,"synonym":"Валюты","illustration":"Валюты, используемые при расчетах","obj_presentation":"Валюта","list_presentation":"","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":3,"fields":{"name_full":{"synonym":"Наименование валюты","multiline_mode":false,"tooltip":"Полное наименование валюты","mandatory":true,"type":{"types":["string"],"str_len":50}},"extra_charge":{"synonym":"Наценка","multiline_mode":false,"tooltip":"Коэффициент, который применяется к курсу основной валюты для вычисления курса текущей валюты.","type":{"types":["number"],"digits":10,"fraction_figits":2}},"main_currency":{"synonym":"Основная валюта","multiline_mode":false,"tooltip":"Валюта, на основании курса которой рассчитывается курс текущей валюты","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"parameters_russian_recipe":{"synonym":"Параметры прописи на русском","multiline_mode":false,"tooltip":"Параметры прописи валюты на русском языке","type":{"types":["string"],"str_len":200}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram","grouping":"array","form":{"selection":{"fields":["ref","_deleted","id","name as presentation","name_full"],"cols":[{"id":"id","width":"120","type":"ro","align":"left","sort":"server","caption":"Код"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Обозначение"},{"id":"name_full","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"}]},"obj":{"head":{" ":["id","name","name_full","parameters_russian_recipe"],"Дополнительно":["main_currency","extra_charge"]},"tabular_sections":{},"tabular_sections_order":[]}}},"contact_information_kinds":{"name":"ВидыКонтактнойИнформации","splitted":true,"synonym":"Виды контактной информации","illustration":"","obj_presentation":"Вид контактной информации","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"ВидПоляДругое":{"synonym":"Вид поля другое","multiline_mode":false,"tooltip":"Внешний вид поля другое на форме","type":{"types":["string"],"str_len":20}},"Используется":{"synonym":"Используется","multiline_mode":false,"tooltip":"Вид контактной информации используется","type":{"types":["boolean"]}},"mandatory_fields":{"synonym":"Обязательное заполнение","multiline_mode":false,"tooltip":"Вид контактной информации обязателен к заполнению","type":{"types":["boolean"]}},"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (адрес, телефон и т.д.)","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.contact_information_types"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"Группа вида контактной информации","type":{"types":["cat.contact_information_kinds"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","grouping":"array"},"nom_kinds":{"name":"ВидыНоменклатуры","splitted":true,"synonym":"Виды номенклатуры","illustration":"","obj_presentation":"Вид номенклатуры","list_presentation":"","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"nom_type":{"synonym":"Тип номенклатуры","multiline_mode":false,"tooltip":"Указывается тип, к которому относится номенклатура данного вида.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.nom_types"],"is_ref":true}},"НаборСвойствНоменклатура":{"synonym":"Набор свойств номенклатура","multiline_mode":false,"tooltip":"Набор свойств, которым будет обладать номенклатура с этим видом","choice_groups_elm":"elm","type":{"types":["cat.destinations"],"is_ref":true}},"НаборСвойствХарактеристика":{"synonym":"Набор свойств характеристика","multiline_mode":false,"tooltip":"Набор свойств, которым будет обладать характеристика с этим видом","choice_groups_elm":"elm","type":{"types":["cat.destinations"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"","type":{"types":["cat.nom_kinds"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","grouping":"array"},"contracts":{"name":"ДоговорыКонтрагентов","splitted":true,"synonym":"Договоры контрагентов","illustration":"Перечень договоров, заключенных с контрагентами","obj_presentation":"Договор контрагента","list_presentation":"Договоры контрагентов","input_by_string":["name","id"],"hierarchical":true,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"settlements_currency":{"synonym":"Валюта взаиморасчетов","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"mutual_settlements":{"synonym":"Ведение взаиморасчетов","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.mutual_contract_settlements"],"is_ref":true}},"contract_kind":{"synonym":"Вид договора","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.contract_kinds"],"is_ref":true}},"date":{"synonym":"Дата","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"check_days_without_pay":{"synonym":"Держать резерв без оплаты ограниченное время","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"allowable_debts_amount":{"synonym":"Допустимая сумма дебиторской задолженности","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"allowable_debts_days":{"synonym":"Допустимое число дней дебиторской задолженности","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":0}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"check_debts_amount":{"synonym":"Контролировать сумму дебиторской задолженности","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"check_debts_days":{"synonym":"Контролировать число дней дебиторской задолженности","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"number_doc":{"synonym":"Номер","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}},"main_cash_flow_article":{"synonym":"Основная статья движения денежных средств","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"main_project":{"synonym":"Основной проект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.projects"],"is_ref":true}},"accounting_reflect":{"synonym":"Отражать в бухгалтерском учете","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"tax_accounting_reflect":{"synonym":"Отражать в налоговом учете","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"prepayment_percent":{"synonym":"Процент предоплаты","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"validity":{"synonym":"Срок действия договора","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"vat_included":{"synonym":"Сумма включает НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"price_type":{"synonym":"Тип цен","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"vat_consider":{"synonym":"Учитывать НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"days_without_pay":{"synonym":"Число дней резерва без оплаты","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_folder","path":false}],"mandatory":true,"type":{"types":["cat.partners"],"is_ref":true}},"parent":{"synonym":"Группа договоров","multiline_mode":false,"tooltip":"","type":{"types":["cat.contracts"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","form":{"selection":{"fields":["is_folder","id","_t_.name as presentation","enm_contract_kinds.synonym as contract_kind","enm_mutual_settlements.synonym as mutual_settlements","cat_organizations.name as organization","cat_partners.name as partner"],"cols":[{"id":"partner","width":"180","type":"ro","align":"left","sort":"server","caption":"Контрагент"},{"id":"organization","width":"180","type":"ro","align":"left","sort":"server","caption":"Организация"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"},{"id":"contract_kind","width":"150","type":"ro","align":"left","sort":"server","caption":"Вид договора"},{"id":"mutual_settlements","width":"150","type":"ro","align":"left","sort":"server","caption":"Ведение расчетов"}]},"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},"parent","name","number_doc","date","validity","owner","organization","contract_kind","mutual_settlements","settlements_currency"],"Дополнительно":["accounting_reflect","tax_accounting_reflect","vat_consider","vat_included","price_type","main_project","main_cash_flow_article","check_debts_amount","check_debts_days","check_days_without_pay","prepayment_percent","allowable_debts_amount","allowable_debts_days","note"]}}}},"nom_units":{"name":"ЕдиницыИзмерения","splitted":true,"synonym":"Единицы измерения","illustration":"Перечень единиц измерения номенклатуры и номенклатурных групп","obj_presentation":"Единица измерения","list_presentation":"Единицы измерения","input_by_string":["name","id"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"qualifier_unit":{"synonym":"Единица по классификатору","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.units"],"is_ref":true}},"heft":{"synonym":"Вес","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":3}},"volume":{"synonym":"Объем","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":3}},"coefficient":{"synonym":"Коэффициент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"rounding_threshold":{"synonym":"Порог округления","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":0}},"ПредупреждатьОНецелыхМестах":{"synonym":"При округлении предупреждать о нецелых местах","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["cat.nom_groups","cat.nom"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"property_values":{"name":"ЗначенияСвойствОбъектов","splitted":true,"synonym":"Дополнительные значения","illustration":"","obj_presentation":"Дополнительное значение","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"heft":{"synonym":"Весовой коэффициент","multiline_mode":false,"tooltip":"Относительный вес дополнительного значения (значимость).","type":{"types":["number"],"digits":10,"fraction_figits":2}},"ПолноеНаименование":{"synonym":"Полное наименование","multiline_mode":true,"tooltip":"Подробное описание значения дополнительного реквизита","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит или сведение.","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"parent":{"synonym":"Входит в группу","multiline_mode":false,"tooltip":"Группа дополнительных значений свойства.","choice_links":[{"name":["selection","owner"],"path":["owner"]}],"type":{"types":["cat.property_values"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","grouping":"array"},"meta_ids":{"name":"ИдентификаторыОбъектовМетаданных","splitted":false,"synonym":"Идентификаторы объектов метаданных","illustration":"Идентификаторы объектов метаданных для использования в базе данных.","obj_presentation":"Идентификатор объекта метаданных","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":false,"main_presentation_name":true,"code_length":0,"fields":{"full_moniker":{"synonym":"Полное имя","multiline_mode":false,"tooltip":"Полное имя объекта метаданных","type":{"types":["string"],"str_len":430}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа объектов","multiline_mode":false,"tooltip":"Группа объектов метаданных.","type":{"types":["cat.meta_ids"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"cashboxes":{"name":"Кассы","splitted":true,"synonym":"Кассы","illustration":"Список мест фактического хранения и движения наличных денежных средств предприятия. Кассы разделены по организациям и валютам денежных средств. ","obj_presentation":"Касса","list_presentation":"Кассы предприятия","input_by_string":["name","id"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"funds_currency":{"synonym":"Валюта денежных средств","multiline_mode":false,"tooltip":"Валюта учета денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"Подразделение, отвечающее за кассу.","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"current_account":{"synonym":"Расчетный счет","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["owner"]}],"choice_groups_elm":"elm","type":{"types":["cat.organization_bank_accounts"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_folder","path":false}],"mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","grouping":"array","form":{"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},"name","owner","funds_currency"]}}}},"units":{"name":"КлассификаторЕдиницИзмерения","splitted":true,"synonym":"Классификатор единиц измерения","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":3,"fields":{"name_full":{"synonym":"Полное наименование","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":100}},"international_short":{"synonym":"Международное сокращение","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":3}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram"},"partners":{"name":"Контрагенты","splitted":true,"synonym":"Контрагенты","illustration":"Список юридических или физических лиц клиентов (поставщиков, покупателей).","obj_presentation":"Контрагент","list_presentation":"Контрагенты","input_by_string":["name","id","inn"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"name_full":{"synonym":"Полное наименование","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"main_bank_account":{"synonym":"Основной банковский счет","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.partner_bank_accounts"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"kpp":{"synonym":"КПП","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":9}},"okpo":{"synonym":"Код по ОКПО","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":10}},"inn":{"synonym":"ИНН","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":12}},"individual_legal":{"synonym":"Юр. / физ. лицо","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.individual_legal"],"is_ref":true}},"main_contract":{"synonym":"Основной договор контрагента","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.contracts"],"is_ref":true}},"identification_document":{"synonym":"Документ, удостоверяющий личность","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"buyer_main_manager":{"synonym":"Основной менеджер покупателя","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"is_buyer":{"synonym":"Покупатель","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_supplier":{"synonym":"Поставщик","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"primary_contact":{"synonym":"Основное контактное лицо","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа контрагентов","multiline_mode":false,"tooltip":"","type":{"types":["cat.partners"],"is_ref":true}}},"tabular_sections":{"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_params":[{"name":"parent","path":{"ref":"139d49b9-5301-45f3-b851-4488420d7d15","presentation":"Справочник \"Контрагенты\"","type":"cat.contact_information_kinds"}}],"choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0},"hide":true},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100},"hide":true},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50},"hide":true},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50},"hide":true},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100},"hide":true},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100},"hide":true},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20},"hide":true},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20},"hide":true}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0},"hide":true}}}},"cachable":"ram","form":{"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},"parent","name","name_full","is_buyer","is_supplier","individual_legal","inn","kpp","okpo","main_bank_account","main_contract","primary_contact","buyer_main_manager"],"Дополнительные реквизиты":[]},"tabular_sections":{"contact_information":{"fields":["kind","presentation"],"headers":"Вид,Представление","widths":"200,*","min_widths":"100,200","aligns":"","sortings":"na,na","types":"ref,txt"}},"tabular_sections_order":["contact_information"]}}},"nom":{"name":"Номенклатура","splitted":true,"synonym":"Номенклатура","illustration":"Перечень товаров, продукции, материалов, полуфабрикатов, тары, услуг","obj_presentation":"Позиция номенклатуры","list_presentation":"","input_by_string":["name","id","article"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":11,"fields":{"article":{"synonym":"Артикул ","multiline_mode":false,"tooltip":"Артикул номенклатуры.","type":{"types":["string"],"str_len":25}},"name_full":{"synonym":"Наименование для печати","multiline_mode":true,"tooltip":"Наименование номенклатуры, которое будет печататься во всех документах.","type":{"types":["string"],"str_len":1024}},"base_unit":{"synonym":"Базовая единица измерения","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.units"],"is_ref":true}},"storage_unit":{"synonym":"Единица хранения остатков","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.nom_units"],"is_ref":true}},"nom_kind":{"synonym":"Вид номенклатуры","multiline_mode":false,"tooltip":"Указывается вид, к которому следует отнести данную позицию номенклатуры.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_kinds"],"is_ref":true}},"nom_group":{"synonym":"Номенклатурная группа","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_groups"],"is_ref":true}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"Определяется ставка НДС товара или услуги","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.vat_rates"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"price_group":{"synonym":"Ценовая группа","multiline_mode":false,"tooltip":"Определяет ценовую группу, к которой относится номенклатурная позиция.","choice_groups_elm":"elm","type":{"types":["cat.price_groups"],"is_ref":true}},"elm_type":{"synonym":"Тип элемента: рама, створка и т.п.","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}},"len":{"synonym":"Длина","multiline_mode":false,"tooltip":"Длина стандартной загатовки, мм","type":{"types":["number"],"digits":8,"fraction_figits":1}},"width":{"synonym":"Ширина - A","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"thickness":{"synonym":"Толщина - T","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"sizefurn":{"synonym":"Размер фурн. паза - D","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"sizefaltz":{"synonym":"Размер фальца - F","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"density":{"synonym":"Плотность, кг / ед. хранения","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"volume":{"synonym":"Объем, м³ / ед. хранения","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"arc_elongation":{"synonym":"Удлинение арки","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"loss_factor":{"synonym":"Коэффициент потерь","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":4}},"rounding_quantity":{"synonym":"Округлять количество","multiline_mode":false,"tooltip":"При расчете спецификации построителя, как в функции Окр(). 1: до десятых долей,  0: до целых, -1: до десятков","type":{"types":["number"],"digits":1,"fraction_figits":0}},"clr":{"synonym":"Цвет по умолчанию","multiline_mode":false,"tooltip":"Цвет материала по умолчанию. Актуально для заполнений, которые берём НЕ из системы","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"cutting_optimization_type":{"synonym":"Тип оптимизации","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.cutting_optimization_types"],"is_ref":true}},"saw_width":{"synonym":"Ширина пилы, мм.","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"double_cut":{"synonym":"Парный раскрой","multiline_mode":false,"tooltip":"0, 1 - одиночный.\n2 - парный","type":{"types":["number"],"digits":1,"fraction_figits":0}},"overmeasure":{"synonym":"Припуск в раскрое, мм","multiline_mode":false,"tooltip":"Оставлять на хлысте припуск (мм) для захвата станком","type":{"types":["number"],"digits":8,"fraction_figits":1}},"coloration_area":{"synonym":"Площадь окраски","multiline_mode":false,"tooltip":"Площадь окраски в м² на  единицу хранения","type":{"types":["number"],"digits":10,"fraction_figits":4}},"pricing":{"synonym":"","multiline_mode":false,"tooltip":"Расценка операций с данной номенклатурой либо формула визуализации","choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"visualization":{"synonym":"Визуализация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.elm_visualization"],"is_ref":true}},"complete_list_sorting":{"synonym":"Сортировка в листе комплектации","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":2,"fraction_figits":0}},"is_accessory":{"synonym":"Это аксессуар","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_procedure":{"synonym":"Это техоперация","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_service":{"synonym":"Это услуга","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_pieces":{"synonym":"Штуки","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"Группа, в которую входит данная позиция номенклатуры.","type":{"types":["cat.nom"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0},"hide":true}}}},"cachable":"ram","form":{"selection":{"fields":[],"cols":[{"id":"id","width":"140","type":"ro","align":"left","sort":"server","caption":"Код"},{"id":"article","width":"150","type":"ro","align":"left","sort":"server","caption":"Артикул"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"},{"id":"nom_unit","width":"70","type":"ro","align":"left","sort":"server","caption":"Ед"},{"id":"thickness","width":"70","type":"ro","align":"left","sort":"server","caption":"Толщина"}]}}},"organizations":{"name":"Организации","splitted":true,"synonym":"Организации","illustration":"","obj_presentation":"Организация","list_presentation":"","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"prefix":{"synonym":"Префикс","multiline_mode":false,"tooltip":"Используется при нумерации документов. В начало каждого номера документов данной организации добавляется два символа префикса.","type":{"types":["string"],"str_len":2}},"individual_legal":{"synonym":"Юр. / физ. лицо","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.individual_legal"],"is_ref":true}},"individual_entrepreneur":{"synonym":"Индивидуальный предприниматель","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals"],"is_ref":true}},"inn":{"synonym":"ИНН","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":12}},"kpp":{"synonym":"КПП","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":9}},"main_bank_account":{"synonym":"Основной банковский счет","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.organization_bank_accounts"],"is_ref":true}},"main_cashbox":{"synonym":"Основноая касса","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.cashboxes"],"is_ref":true}},"certificate_series_number":{"synonym":"Серия и номер свидетельства о постановке на учет","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":25}},"certificate_date_issue":{"synonym":"Дата выдачи свидетельства о постановке на учет","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"certificate_authority_name":{"synonym":"Наименование налогового органа, выдавшего свидетельство","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":254}},"certificate_authority_code":{"synonym":"Код налогового органа, выдавшего свидетельство","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":4}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.organizations"],"is_ref":true}}},"tabular_sections":{"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"Хранение контактной информации (адреса, веб-страницы, номера телефонов и др.)","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_params":[{"name":"parent","path":{"ref":"c34c4e9d-c7c5-42bb-8def-93ecfe7b1977","presentation":"Справочник \"Организации\"","type":"cat.contact_information_kinds"}}],"choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0},"hide":true},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100},"hide":true},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50},"hide":true},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50},"hide":true},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100},"hide":true},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100},"hide":true},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20},"hide":true},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20},"hide":true},"ВидДляСписка":{"synonym":"Вид для списка","multiline_mode":false,"tooltip":"Вид контактной информации для списка","choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"ДействуетС":{"synonym":"Действует С","multiline_mode":false,"tooltip":"Дата актуальности контактная информация","type":{"types":["date"],"date_part":"date"}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0},"hide":true}}}},"cachable":"ram","grouping":"array","form":{"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},{"id":"prefix","path":"o.prefix","synonym":"Префикс","type":"ro"},"name","individual_legal","individual_entrepreneur","main_bank_account","main_cashbox"],"Коды":["inn","kpp","certificate_series_number","certificate_date_issue","certificate_authority_name","certificate_authority_code"]},"tabular_sections":{"contact_information":{"fields":["kind","presentation"],"headers":"Вид,Представление","widths":"200,*","min_widths":"100,200","aligns":"","sortings":"na,na","types":"ref,txt"}},"tabular_sections_order":["contact_information"]}}},"inserts":{"name":"пзВставки","splitted":true,"synonym":"Вставки","illustration":"Армирование, пленки, вставки - дополнение спецификации, которое зависит от одного элемента","obj_presentation":"Вставка","list_presentation":"Вставки","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"insert_type":{"synonym":"Тип вставки","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.inserts_types"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"Вставку можно использовать для элементов с этим цветом","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.clrs"],"is_ref":true}},"priority":{"synonym":"Приоритет","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"lmin":{"synonym":"X min","multiline_mode":false,"tooltip":"X min (длина или ширина)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"X max","multiline_mode":false,"tooltip":"X max (длина или ширина)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"hmin":{"synonym":"Y min","multiline_mode":false,"tooltip":"Y min (высота)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"hmax":{"synonym":"Y max","multiline_mode":false,"tooltip":"Y max (высота)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"smin":{"synonym":"S min","multiline_mode":false,"tooltip":"Площадь min","type":{"types":["number"],"digits":8,"fraction_figits":3}},"smax":{"synonym":"S max","multiline_mode":false,"tooltip":"Площадь max","type":{"types":["number"],"digits":8,"fraction_figits":3}},"for_direct_profile_only":{"synonym":"Для прямых","multiline_mode":false,"tooltip":"Использовать только для прямых профилей (1), только для кривых (-1) или всегда(0)","type":{"types":["number"],"digits":1,"fraction_figits":0}},"ahmin":{"synonym":"α min","multiline_mode":false,"tooltip":"AH min (угол к горизонтали)","type":{"types":["number"],"digits":3,"fraction_figits":0}},"ahmax":{"synonym":"α max","multiline_mode":false,"tooltip":"AH max (угол к горизонтали)","type":{"types":["number"],"digits":3,"fraction_figits":0}},"mmin":{"synonym":"Масса min","multiline_mode":false,"tooltip":"M min (масса)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"mmax":{"synonym":"Масса max","multiline_mode":false,"tooltip":"M max (масса)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"insert_glass_type":{"synonym":"Тип вставки стп","multiline_mode":false,"tooltip":"Тип вставки стеклопакета","choice_groups_elm":"elm","type":{"types":["enm.inserts_glass_types"],"is_ref":true}},"impost_fixation":{"synonym":"Крепление импостов","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.impost_mount_options"],"is_ref":true}},"shtulp_fixation":{"synonym":"Крепление штульпа","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"can_rotate":{"synonym":"Можно поворачивать","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"sizeb":{"synonym":"Размер \"B\"","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.inserts","cat.nom"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"sz":{"synonym":"Размер","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"coefficient":{"synonym":"Коэфф.","multiline_mode":false,"tooltip":"коэффициент (кол-во комплектующего на 1мм профиля или 1м² заполнения)","type":{"types":["number"],"digits":10,"fraction_figits":6}},"angle_calc_method":{"synonym":"Расчет угла","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.angle_calculating_ways"],"is_ref":true}},"count_calc_method":{"synonym":"Расчет колич.","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.count_calculating_ways"],"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","choice_params":[{"name":"parent","path":[{"ref":"3220e24b-ffcd-11e5-8303-e67fda7f6b46","presentation":"Вставки","type":"cat.formulas"},{"ref":"3220e251-ffcd-11e5-8303-e67fda7f6b46","presentation":"Общее","type":"cat.formulas"}]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"lmin":{"synonym":"X min","multiline_mode":false,"tooltip":"Минимальная длина или ширина","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"X max","multiline_mode":false,"tooltip":"Максимальная длина или ширина","type":{"types":["number"],"digits":6,"fraction_figits":0}},"ahmin":{"synonym":"α min","multiline_mode":false,"tooltip":"Минимальный угол к горизонтали","type":{"types":["number"],"digits":3,"fraction_figits":0}},"ahmax":{"synonym":"α max","multiline_mode":false,"tooltip":"Максимальный угол к горизонтали","type":{"types":["number"],"digits":3,"fraction_figits":0}},"smin":{"synonym":"Площадь min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"smax":{"synonym":"Площадь max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"step":{"synonym":"Шаг","multiline_mode":false,"tooltip":"Шаг (по умолчанию, в горизонтальном направлении)","type":{"types":["number"],"digits":10,"fraction_figits":3}},"УголШага":{"synonym":"Угол шага","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"offsets":{"synonym":"Отступы шага","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"do_center":{"synonym":"Центрировать","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"attrs_option":{"synonym":"Направления","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.inset_attrs_options"],"is_ref":true}},"end_mount":{"synonym":"Концевые крепления","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_order_row":{"synonym":"Это строка заказа","multiline_mode":false,"tooltip":"Если \"Истина\", строка будет добавлена в заказ, а не в спецификацию текущей продукции","type":{"types":["boolean"]}},"is_main_elm":{"synonym":"Это основной элемент","multiline_mode":false,"tooltip":"Для профильных вставок определяет номенклатуру, размеры которой будут использованы при построении эскиза","type":{"types":["boolean"]}}}},"selection_params":{"name":"ПараметрыОтбора","synonym":"Параметры отбора","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["selection_params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["selection_params","param"],"elm":0},"mandatory":true,"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}}}}},"cachable":"ram"},"parameters_keys":{"name":"пзКлючиПараметров","splitted":true,"synonym":"Ключи параметров","illustration":"Списки пар {Параметр:Значение} для фильтрации в подсистемах корректировки спецификации и ценообразования\n","obj_presentation":"Ключ параметров","list_presentation":"Ключи параметров","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"КоличествоПараметров":{"synonym":"Приоритет","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"params":{"name":"Параметры","synonym":"Параметры","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["string","cch.properties"],"str_len":50,"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["params","property"]}],"choice_type":{"path":["params","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}}}}},"cachable":"ram"},"production_params":{"name":"пзПараметрыПродукции","splitted":true,"synonym":"Параметры продукции","illustration":"Настройки системы профилей и фурнитуры","obj_presentation":"Система","list_presentation":"Параметры продукции","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"default_clr":{"synonym":"Осн цвет","multiline_mode":false,"tooltip":"Основной цвет изделия","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"allow_open_cnn":{"synonym":"Допускаются незамкн. контуры","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"clr_group":{"synonym":"Цветовая группа","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.color_price_groups"],"is_ref":true}},"is_drainage":{"synonym":"Это водоотлив","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"tmin":{"synonym":"Толщина заполнения min ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"tmax":{"synonym":"Толщина заполнения max ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lay_split_type":{"synonym":"Тип деления раскладки","multiline_mode":false,"tooltip":"Тип деления раскладки по умолчанию","choice_groups_elm":"elm","type":{"types":["enm.lay_split_types"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"","type":{"types":["cat.production_params"],"is_ref":true}}},"tabular_sections":{"elmnts":{"name":"Элементы","synonym":"Элементы","tooltip":"Типовые рама, створка, импост и заполнение для данной системы","fields":{"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"elm_type":{"synonym":"Тип элемента","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":[{"name":"Рама","presentation":"Рама","type":"enm.elm_types"},{"name":"Створка","presentation":"Створка","type":"enm.elm_types"},{"name":"Импост","presentation":"Импост","type":"enm.elm_types"},{"name":"Штульп","presentation":"Штульп","type":"enm.elm_types"},{"name":"Стекло","presentation":"Стекло - стеклопакет","type":"enm.elm_types"},{"name":"Заполнение","presentation":"Заполнение - сэндвич","type":"enm.elm_types"},{"name":"Раскладка","presentation":"Раскладка - фальшпереплет","type":"enm.elm_types"},{"name":"Добор","presentation":"Доборный проф.","type":"enm.elm_types"},{"name":"Соединитель","presentation":"Соединит. профиль","type":"enm.elm_types"},{"name":"Москитка","presentation":"Москитн. сетка","type":"enm.elm_types"}]}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.elm_types"],"is_ref":true}},"nom":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.inserts"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"pos":{"synonym":"Положение","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":[{"name":"Лев","presentation":"Лев","type":"enm.positions"},{"name":"Прав","presentation":"Прав","type":"enm.positions"},{"name":"Верх","presentation":"Верх","type":"enm.positions"},{"name":"Низ","presentation":"Низ","type":"enm.positions"},{"name":"ЦентрВертикаль","presentation":"Центр вертикаль","type":"enm.positions"},{"name":"ЦентрГоризонталь","presentation":"Центр горизонталь","type":"enm.positions"},{"name":"Центр","presentation":"Центр","type":"enm.positions"},{"name":"Любое","presentation":"Любое","type":"enm.positions"}]}],"choice_groups_elm":"elm","type":{"types":["enm.positions"],"is_ref":true}}}},"production":{"name":"Продукция","synonym":"Продукция","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["production","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["production","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}}}},"product_params":{"name":"ПараметрыИзделия","synonym":"Параметры изделия","tooltip":"Значения параметров изделия по умолчанию","fields":{"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["product_params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["product_params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"hide":{"synonym":"Скрыть","multiline_mode":false,"tooltip":"Не показывать строку параметра в диалоге свойств изделия","type":{"types":["boolean"]}},"forcibly":{"synonym":"Принудительно","multiline_mode":false,"tooltip":"Замещать установленное ранее значение при перевыборе системы","type":{"types":["boolean"]}}}},"furn_params":{"name":"ПараметрыФурнитуры","synonym":"Параметры фурнитуры","tooltip":"Значения параметров фурнитуры по умолчанию","fields":{"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["furn_params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["furn_params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"hide":{"synonym":"Скрыть","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"forcibly":{"synonym":"Принудительно","multiline_mode":false,"tooltip":"Замещать установленное ранее значение при перевыборе системы","type":{"types":["boolean"]}}}},"colors":{"name":"Цвета","synonym":"Цвета","tooltip":"Цаета, доступные для данной продукции","fields":{"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","type":{"types":["cat.clrs"],"is_ref":true}}}},"base_blocks":{"name":"ТиповыеБлоки","synonym":"Шаблоны","tooltip":"","fields":{"calc_order":{"synonym":"Расчет","multiline_mode":false,"tooltip":"","choice_params":[{"name":"obj_delivery_state","path":{"name":"Шаблон","presentation":"Шаблон","type":"enm.obj_delivery_states"}}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["doc.calc_order"],"is_ref":true}}}}},"cachable":"ram"},"users_acl":{"name":"ИнтеграцияПраваПользователей","splitted":true,"synonym":"Права дилеров и менеджеров","illustration":"","obj_presentation":"Права дилеров и менеджеров","list_presentation":"Права дилеров и менеджеров","input_by_string":[],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":false,"code_length":0,"fields":{"prefix":{"synonym":"Префикс нумерации документов","multiline_mode":false,"tooltip":"Префикс номеров документов текущего пользователя","type":{"types":["string"],"str_len":2}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Пользователь","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}}},"tabular_sections":{"acl_objs":{"name":"ОбъектыДоступа","synonym":"Объекты доступа","tooltip":"","fields":{"acl_obj":{"synonym":"Объект доступа","multiline_mode":false,"tooltip":"","type":{"types":["cat.individuals","cat.users","cat.divisions","cat.partners","cat.organizations","cat.Абоненты","cat.cashboxes","cat.meta_ids","cat.stores"],"is_ref":true}},"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}}},"cachable":"ram","hide":true},"delivery_areas":{"name":"пзРайоныДоставки","splitted":true,"synonym":"Районы доставки","illustration":"","obj_presentation":"Район доставки","list_presentation":"Районы доставки","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.countries"],"is_ref":true}},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион, край, область","mandatory":true,"type":{"types":["string"],"str_len":50}},"city":{"synonym":"Город (населенный пункт)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"latitude":{"synonym":"Гео. коорд. Широта","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":12}},"longitude":{"synonym":"Гео. коорд. Долгота","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":12}},"ind":{"synonym":"Индекс","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":6}},"delivery_area":{"synonym":"Район (внутри города)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"specify_area_by_geocoder":{"synonym":"Уточнять район геокодером","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram","grouping":"array"},"cnns":{"name":"пзСоединения","splitted":true,"synonym":"Соединения элементов","illustration":"Спецификации соединений элементов","obj_presentation":"Соединение","list_presentation":"Соединения","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"priority":{"synonym":"Приоритет","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"amin":{"synonym":"Угол минимальный","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"amax":{"synonym":"Угол максимальный","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"sd1":{"synonym":"Сторона1","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.cnn_sides"],"is_ref":true}},"sd2":{"synonym":"Сторона2","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.cnn_sides"],"is_ref":true}},"sz":{"synonym":"Размер","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"cnn_type":{"synonym":"Тип соединения","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.cnn_types"],"is_ref":true}},"ahmin":{"synonym":"AH min (угол к горизонтали)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"ahmax":{"synonym":"AH max (угол к горизонтали)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"lmin":{"synonym":"Длина шва min ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"Длина шва max ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"tmin":{"synonym":"Толщина min ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"tmax":{"synonym":"Толщина max ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"var_layers":{"synonym":"Створки в разн. плоск.","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"for_direct_profile_only":{"synonym":"Для прямых","multiline_mode":false,"tooltip":"Использовать только для прямых профилей (1), только для кривых (-1) или всегда(0)","type":{"types":["number"],"digits":1,"fraction_figits":0}},"art1vert":{"synonym":"Арт1 верт.","multiline_mode":false,"tooltip":"Соединение используется только в том случае, если Артикул1 - вертикальный","type":{"types":["boolean"]}},"art1glass":{"synonym":"Арт1 - стеклопакет","multiline_mode":false,"tooltip":"Артикул1 может быть составным стеклопакетом","type":{"types":["boolean"]}},"art2glass":{"synonym":"Арт2 - стеклопакет","multiline_mode":false,"tooltip":"Артикул2 может быть составным стеклопакетом","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.inserts","cat.nom"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"coefficient":{"synonym":"Коэффициент","multiline_mode":false,"tooltip":"коэффициент (кол-во комплектующего на 1мм профиля)","type":{"types":["number"],"digits":10,"fraction_figits":6}},"sz":{"synonym":"Размер","multiline_mode":false,"tooltip":"размер (в мм, на которое компл. заходит на Артикул 2)","type":{"types":["number"],"digits":10,"fraction_figits":3}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","choice_params":[{"name":"parent","path":[{"ref":"3220e259-ffcd-11e5-8303-e67fda7f6b46","presentation":"Соединения","type":"cat.formulas"},{"ref":"3220e251-ffcd-11e5-8303-e67fda7f6b46","presentation":"Общее","type":"cat.formulas"}]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"sz_min":{"synonym":"Размер мин","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"sz_max":{"synonym":"Размер макс","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"amin":{"synonym":"Угол мин","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"amax":{"synonym":"Угол макс","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"set_specification":{"synonym":"Устанавливать","multiline_mode":false,"tooltip":"Устанавливать спецификацию","choice_groups_elm":"elm","type":{"types":["enm.specification_installation_methods"],"is_ref":true}},"for_direct_profile_only":{"synonym":"Для прямых","multiline_mode":false,"tooltip":"Использовать только для прямых профилей (1), только для кривых (-1) или всегда(0)","type":{"types":["number"],"digits":1,"fraction_figits":0}},"by_contour":{"synonym":"По контуру","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"contraction_by_contour":{"synonym":"Укорочение по контуру","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"on_aperture":{"synonym":"На проем","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"angle_calc_method":{"synonym":"Способ расч. угла","multiline_mode":false,"tooltip":"Способ расчета угла","choice_groups_elm":"elm","type":{"types":["enm.angle_calculating_ways"],"is_ref":true}},"contour_number":{"synonym":"Контур №","multiline_mode":false,"tooltip":"Номер контура (доп)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"is_order_row":{"synonym":"Это строка заказа","multiline_mode":false,"tooltip":"Если \"Истина\", строка будет добавлена в заказ, а не в спецификацию текущей продукции","type":{"types":["boolean"]}}}},"cnn_elmnts":{"name":"СоединяемыеЭлементы","synonym":"Соединяемые элементы","tooltip":"","fields":{"nom1":{"synonym":"Номенклатура1","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"clr1":{"synonym":"Цвет1","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"nom2":{"synonym":"Номенклатура2","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"clr2":{"synonym":"Цвет2","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"varclr":{"synonym":"Разные цвета","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_nom_combinations_row":{"synonym":"Это строка сочетания номенклатур","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"selection_params":{"name":"ПараметрыОтбора","synonym":"Параметры отбора","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["selection_params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["selection_params","param"],"elm":0},"mandatory":true,"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}}}}},"cachable":"ram","form":{"selection":{"fields":[],"cols":[{"id":"id","width":"140","type":"ro","align":"left","sort":"server","caption":"Код"},{"id":"cnn_type","width":"150","type":"ro","align":"left","sort":"server","caption":"Тип"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"}]}}},"furns":{"name":"пзФурнитура","splitted":true,"synonym":"Фурнитура","illustration":"Описывает ограничения и правила формирования спецификаций фурнитуры","obj_presentation":"Фурнитура","list_presentation":"Фурнитура","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"flap_weight_max":{"synonym":"Масса створки макс","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"left_right":{"synonym":"Левая правая","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_set":{"synonym":"Это набор","multiline_mode":false,"tooltip":"Определяет, является элемент набором для построения спецификации или комплектом фурнитуры для выбора в построителе","type":{"types":["boolean"]}},"is_sliding":{"synonym":"Это раздвижка","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"furn_set":{"synonym":"Набор фурнитуры","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_set","path":true}],"choice_groups_elm":"elm","type":{"types":["cat.furns"],"is_ref":true}},"side_count":{"synonym":"Количество сторон","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"handle_side":{"synonym":"Ручка на стороне","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"open_type":{"synonym":"Тип открывания","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.open_types"],"is_ref":true}},"name_short":{"synonym":"Наименование сокращенное","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":3}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"","type":{"types":["cat.furns"],"is_ref":true}}},"tabular_sections":{"open_tunes":{"name":"НастройкиОткрывания","synonym":"Настройки открывания","tooltip":"","fields":{"side":{"synonym":"Сторона","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"lmin":{"synonym":"X min (длина или ширина)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"X max (длина или ширина)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"amin":{"synonym":"Угол мин","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"amax":{"synonym":"Угол макс","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"arc_available":{"synonym":"Выпуклая дуга","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"shtulp_available":{"synonym":"Штульп безимп соед","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"shtulp_fix_here":{"synonym":"Крепится штульп","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"rotation_axis":{"synonym":"Ось поворота","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"partial_opening":{"synonym":"Неполн. откр.","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"outline":{"synonym":"Эскиз","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}}}},"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"dop":{"synonym":"№ доп","multiline_mode":false,"tooltip":"Элемент дополнительной спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom_set":{"synonym":"Номенклатура/Набор","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_set","path":true}],"choice_groups_elm":"elm","type":{"types":["cat.inserts","cat.nom","cat.furns"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"handle_height_base":{"synonym":"Выс. ручк.","multiline_mode":false,"tooltip":"Стандартная высота ручки","type":{"types":["number"],"digits":6,"fraction_figits":0}},"handle_height_min":{"synonym":"Выс. ручк. min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"handle_height_max":{"synonym":"Выс. ручк. max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"contraction":{"synonym":"Укорочение","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"contraction_option":{"synonym":"Укороч. от","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.contraction_options"],"is_ref":true}},"coefficient":{"synonym":"Коэффициент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"flap_weight_min":{"synonym":"Масса створки min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"flap_weight_max":{"synonym":"Масса створки max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"side":{"synonym":"Сторона","multiline_mode":false,"tooltip":"Сторона фурнитуры, на которую устанавливается элемент или на которой выполняется операция","type":{"types":["number"],"digits":1,"fraction_figits":0}},"cnn_side":{"synonym":"Сторона соед.","multiline_mode":false,"tooltip":"Фильтр: выполнять операцию, если примыкающий элемент примыкает с заданной стороны","choice_groups_elm":"elm","type":{"types":["enm.cnn_sides"],"is_ref":true}},"offset_option":{"synonym":"Смещ. от","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.offset_options"],"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","choice_params":[{"name":"parent","path":[{"ref":"3220e25a-ffcd-11e5-8303-e67fda7f6b46","presentation":"Фурнитура","type":"cat.formulas"},{"ref":"3220e251-ffcd-11e5-8303-e67fda7f6b46","presentation":"Общее","type":"cat.formulas"}]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"transfer_option":{"synonym":"Перенос опер.","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.transfer_operations_options"],"is_ref":true}},"is_main_specification_row":{"synonym":"Это строка основной спецификации","multiline_mode":false,"tooltip":"Интерфейсное поле (доп=0) для редактирования без кода","type":{"types":["boolean"]}},"is_set_row":{"synonym":"Это строка набора","multiline_mode":false,"tooltip":"Интерфейсное поле (НоменклатураНабор=Фурнитура) для редактирования без кода","type":{"types":["number"],"digits":1,"fraction_figits":0}},"is_procedure_row":{"synonym":"Это строка операции","multiline_mode":false,"tooltip":"Интерфейсное поле (НоменклатураНабор=Номенклатура И ТипНоменклатуры = Техоперация) для редактирования без кода","type":{"types":["number"],"digits":1,"fraction_figits":0}},"is_order_row":{"synonym":"Это строка заказа","multiline_mode":false,"tooltip":"Если \"Истина\", строка будет добавлена в заказ, а не в спецификацию текущей продукции","type":{"types":["boolean"]}}}},"selection_params":{"name":"ПараметрыОтбора","synonym":"Параметры отбора","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"dop":{"synonym":"Доп","multiline_mode":false,"tooltip":"Элемент дополнительной спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["selection_params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["selection_params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}}}},"specification_restrictions":{"name":"ОграниченияСпецификации","synonym":"Ограничения спецификации","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"dop":{"synonym":"Доп","multiline_mode":false,"tooltip":"Элемент дополнительной спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"side":{"synonym":"Сторона","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"lmin":{"synonym":"X min (длина или ширина)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"X max (длина или ширина)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"amin":{"synonym":"Угол мин","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"amax":{"synonym":"Угол макс","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}}}},"colors":{"name":"Цвета","synonym":"Цвета","tooltip":"Цаета, доступные для данной фурнитуры","fields":{"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","type":{"types":["cat.clrs"],"is_ref":true}}}}},"cachable":"ram","form":{"selection":{"fields":[],"cols":[{"id":"id","width":"140","type":"ro","align":"left","sort":"server","caption":"Код"},{"id":"open_type","width":"150","type":"ro","align":"left","sort":"server","caption":"Тип открывания"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"}]}}},"clrs":{"name":"пзЦвета","splitted":true,"synonym":"Цвета","illustration":"","obj_presentation":"Цвет","list_presentation":"Цвета","input_by_string":["name","id","ral"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"ral":{"synonym":"Цвет RAL","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"machine_tools_clr":{"synonym":"Код для станка","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"clr_str":{"synonym":"Цвет в построителе","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":36}},"clr_out":{"synonym":"Цвет снаружи","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"clr_in":{"synonym":"Цвет изнутри","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.clrs"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","grouping":"array"},"color_price_groups":{"name":"ЦветоЦеновыеГруппы","splitted":true,"synonym":"Цвето-ценовые группы","illustration":"","obj_presentation":"Цвето-ценовая группа","list_presentation":"Цвето-ценовые группы","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"for_pricing_only":{"synonym":"Использование","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["boolean","enm.color_groups_destination"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"price_groups":{"name":"ЦеновыеГруппы","synonym":"Ценовые группы","tooltip":"","fields":{"price_group":{"synonym":"Ценовая гр. или номенклатура","multiline_mode":false,"tooltip":"Ссылка на ценовую группу или номенклатуру или папку (родитель - первый уровень иерархии) номенклатуры, для которой действует соответствие цветов","type":{"types":["cat.price_groups","string","cat.nom"],"is_ref":true,"str_len":50}}}},"clr_conformity":{"name":"СоответствиеЦветов","synonym":"Соответствие цветов","tooltip":"","fields":{"clr1":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"clr2":{"synonym":"Соответствие","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}}}}},"cachable":"ram","grouping":"array"},"divisions":{"name":"Подразделения","splitted":true,"synonym":"Подразделения","illustration":"Перечень подразделений предприятия","obj_presentation":"Подразделение","list_presentation":"Подразделения","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":false,"main_presentation_name":true,"code_length":9,"fields":{"main_project":{"synonym":"Основной проект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.projects"],"is_ref":true}},"sorting":{"synonym":"Порядок","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Входит в подразделение","multiline_mode":false,"tooltip":"","type":{"types":["cat.divisions"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"ram","grouping":"array"},"users":{"name":"Пользователи","splitted":true,"synonym":"Пользователи","illustration":"","obj_presentation":"Пользователь","list_presentation":"","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"invalid":{"synonym":"Недействителен","multiline_mode":false,"tooltip":"Пользователь больше не работает в программе, но сведения о нем сохранены.\nНедействительные пользователи скрываются из всех списков\nпри выборе или подборе в документах и других местах программы.","type":{"types":["boolean"]}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"Подразделение, в котором работает пользователь","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"individual_person":{"synonym":"Физическое лицо","multiline_mode":false,"tooltip":"Физическое лицо, с которым связан пользователь","choice_groups_elm":"elm","type":{"types":["cat.individuals"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":true,"tooltip":"Произвольная строка","type":{"types":["string"],"str_len":0}},"ancillary":{"synonym":"Служебный","multiline_mode":false,"tooltip":"Неразделенный или разделенный служебный пользователь, права к которому устанавливаются непосредственно и программно.","type":{"types":["boolean"]}},"user_ib_uid":{"synonym":"Идентификатор пользователя ИБ","multiline_mode":false,"tooltip":"Уникальный идентификатор пользователя информационной базы, с которым сопоставлен этот элемент справочника.","choice_groups_elm":"elm","type":{"types":["string"],"str_len":36,"str_fix":true}},"user_fresh_uid":{"synonym":"Идентификатор пользователя сервиса","multiline_mode":false,"tooltip":"Уникальный идентификатор пользователя сервиса, с которым сопоставлен этот элемент справочника.","choice_groups_elm":"elm","type":{"types":["string"],"str_len":36,"str_fix":true}},"id":{"synonym":"Логин","multiline_mode":true,"tooltip":"Произвольная строка","type":{"types":["string"],"str_len":50}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Дополнительные реквизиты объекта","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}},"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"Хранение контактной информации (адреса, веб-страницы, номера телефонов и др.)","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_params":[{"name":"parent","path":{"ref":"8cbaa30d-faab-45ad-880e-84f8b421f448","presentation":"Справочник \"Пользователи\"","type":"cat.contact_information_kinds"}}],"choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0}},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100}},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100}},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100}},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20}},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20}},"ВидДляСписка":{"synonym":"Вид для списка","multiline_mode":false,"tooltip":"Вид контактной информации для списка","choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}}}}},"cachable":"ram","form":{"obj":{"head":{" ":["id","name","individual_person"],"Дополнительно":["ancillary","invalid",{"id":"user_ib_uid","path":"o.user_ib_uid","synonym":"Идентификатор пользователя ИБ","type":"ro"},{"id":"user_fresh_uid","path":"o.user_fresh_uid","synonym":"Идентификатор пользователя сервиса","type":"ro"},"note"]},"tabular_sections":{"contact_information":{"fields":["kind","presentation"],"headers":"Вид,Представление","widths":"200,*","min_widths":"100,200","aligns":"","sortings":"na,na","types":"ref,txt"}},"tabular_sections_order":["contact_information"]}}},"projects":{"name":"Проекты","splitted":true,"synonym":"Проекты","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":11,"fields":{"start":{"synonym":"Старт","multiline_mode":false,"tooltip":"Плановая дата начала работ по проекту.","type":{"types":["date"],"date_part":"date"}},"finish":{"synonym":"Финиш","multiline_mode":false,"tooltip":"Плановая дата окончания работ по проекту.","type":{"types":["date"],"date_part":"date"}},"launch":{"synonym":"Запуск","multiline_mode":false,"tooltip":"Фактическая дата начала работ по проекту.","type":{"types":["date"],"date_part":"date_time"}},"readiness":{"synonym":"Готовность","multiline_mode":false,"tooltip":"Фактическая дата окончания  работ по проекту.","type":{"types":["date"],"date_part":"date_time"}},"finished":{"synonym":"Завершен","multiline_mode":false,"tooltip":"Признак, указывающий на то, что работы по проекту завершены.","type":{"types":["boolean"]}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Ответственный за реализацию проекта.","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"Любые комментарии по проекту","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.projects"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"ram","grouping":"array"},"stores":{"name":"Склады","splitted":true,"synonym":"Склады (места хранения)","illustration":"Сведения о местах хранения товаров (складах), их структуре и физических лицах, назначенных материально ответственными (МОЛ) за тот или иной склад","obj_presentation":"Склад","list_presentation":"Склады","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"","type":{"types":["cat.stores"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"ram","grouping":"array"},"cash_flow_articles":{"name":"СтатьиДвиженияДенежныхСредств","splitted":true,"synonym":"Статьи движения денежных средств","illustration":"Перечень статей движения денежных средств (ДДС), используемых в предприятии для проведения анализа поступлений и расходов в разрезе статей движения денежных средств. ","obj_presentation":"Статья движения денежных средств","list_presentation":"Статьи движения денежных средств","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"definition":{"synonym":"Описание","multiline_mode":true,"tooltip":"Рекомендации по выбору статьи движения денежных средств в документах","type":{"types":["string"],"str_len":0}},"sorting_field":{"synonym":"Порядок","multiline_mode":false,"tooltip":"Определяет порядок вывода вариантов анализа в мониторе целевых показателей при группировке по категориям целей.","type":{"types":["number"],"digits":5,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"В группе статей","multiline_mode":false,"tooltip":"Группа статей движения денежных средств","type":{"types":["cat.cash_flow_articles"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","grouping":"array"},"nom_prices_types":{"name":"ТипыЦенНоменклатуры","splitted":true,"synonym":"Типы цен номенклатуры","illustration":"Перечень типов отпускных цен предприятия","obj_presentation":"Тип цен номенклатуры","list_presentation":"Типы цен номенклатуры","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"price_currency":{"synonym":"Валюта цены по умолчанию","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.currencies"],"is_ref":true}},"discount_percent":{"synonym":"Процент скидки или наценки по умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"vat_price_included":{"synonym":"Цена включает НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"rounding_order":{"synonym":"Порядок округления","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":10}},"rounding_in_a_big_way":{"synonym":"Округлять в большую сторону","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram","grouping":"array"},"individuals":{"name":"ФизическиеЛица","splitted":true,"synonym":"Физические лица","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":10,"fields":{"birth_date":{"synonym":"Дата рождения","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"inn":{"synonym":"ИНН","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":12}},"imns_code":{"synonym":"Код ИФНС","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":4}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"pfr_number":{"synonym":"Страховой номер ПФР","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":14}},"sex":{"synonym":"Пол","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.gender"],"is_ref":true}},"birth_place":{"synonym":"Место рождения","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":240}},"ОсновноеИзображение":{"synonym":"Основное изображение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.Файлы"],"is_ref":true}},"Фамилия":{"synonym":"Фамилия","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"Имя":{"synonym":"Имя","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"Отчество":{"synonym":"Отчество","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ФамилияРП":{"synonym":"Фамилия (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ИмяРП":{"synonym":"Имя (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ОтчествоРП":{"synonym":"Отчество (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ОснованиеРП":{"synonym":"Основание (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ДолжностьРП":{"synonym":"Должность (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"Должность":{"synonym":"Должность","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.individuals"],"is_ref":true}}},"tabular_sections":{"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"Хранение контактной информации (адреса, веб-страницы, номера телефонов и др.)","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_params":[{"name":"parent","path":{"ref":"822f19bc-09ab-4913-b283-b5461382a75d","presentation":"Справочник \"Физические лица\"","type":"cat.contact_information_kinds"}}],"choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0}},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100}},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100}},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100}},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20}},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20}},"ВидДляСписка":{"synonym":"Вид для списка","multiline_mode":false,"tooltip":"Вид контактной информации для списка","choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}}}}},"cachable":"ram","hide":true,"form":{"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},"name","sex","birth_date",{"id":"parent","path":"o.parent","synonym":"Группа","type":"ref"}],"Коды":["inn","imns_code","pfr_number"],"Для печатных форм":["Фамилия","Имя","Отчество","ФамилияРП","ИмяРП","ОтчествоРП","Должность","ДолжностьРП","ОснованиеРП"]},"tabular_sections":{"contact_information":{"fields":["kind","presentation"],"headers":"Вид,Представление","widths":"200,*","min_widths":"100,200","aligns":"","sortings":"na,na","types":"ref,txt"}},"tabular_sections_order":["contact_information"]}}},"characteristics":{"name":"ХарактеристикиНоменклатуры","splitted":true,"synonym":"Характеристики номенклатуры","illustration":"Дополнительные характеристики элементов номенклатуры: цвет, размер и т.п.","obj_presentation":"Характеристика номенклатуры","list_presentation":"Характеристики номенклатуры","input_by_string":["name"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"x":{"synonym":"Длина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"y":{"synonym":"Высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"z":{"synonym":"Толщина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"weight":{"synonym":"Масса, кг","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"condition_products":{"synonym":"Условных изд.","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"calc_order":{"synonym":"Расчет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"product":{"synonym":"Изделие","multiline_mode":false,"tooltip":"Для продукции - номер строки заказа, для характеристики стеклопакета - номер элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"leading_product":{"synonym":"Ведущая продукция","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"leading_elm":{"synonym":"Ведущий элемент","multiline_mode":false,"tooltip":"Для москиток и стеклопакетов - номер элемента ведущей продукции","type":{"types":["number"],"digits":6,"fraction_figits":0}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":100}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"Для целей RLS","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"sys":{"synonym":"Система","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.production_params"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}}},"tabular_sections":{"constructions":{"name":"Конструкции","synonym":"Конструкции","tooltip":"Конструкции изделия. Они же - слои или контуры","fields":{"cnstr":{"synonym":"№ Конструкции","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"parent":{"synonym":"Внешн. констр.","multiline_mode":false,"tooltip":"№ внешней конструкции","type":{"types":["number"],"digits":6,"fraction_figits":0}},"x":{"synonym":"Ширина, м","multiline_mode":false,"tooltip":"Габаритная ширина контура","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y":{"synonym":"Высота, м","multiline_mode":false,"tooltip":"Габаритная высота контура","type":{"types":["number"],"digits":8,"fraction_figits":1}},"z":{"synonym":"Глубина","multiline_mode":false,"tooltip":"Z-координата плоскости (z-index) длч многослойных конструкций","type":{"types":["number"],"digits":8,"fraction_figits":1}},"w":{"synonym":"Ширина фурн","multiline_mode":false,"tooltip":"Ширина фурнитуры (по фальцу)","type":{"types":["number"],"digits":8,"fraction_figits":1}},"h":{"synonym":"Высота фурн","multiline_mode":false,"tooltip":"Высота фурнитуры (по фальцу)","type":{"types":["number"],"digits":8,"fraction_figits":1}},"furn":{"synonym":"Фурнитура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_folder","path":false},{"name":"is_set","path":false}],"choice_groups_elm":"elm","type":{"types":["cat.furns"],"is_ref":true}},"clr_furn":{"synonym":"Цвет фурнитуры","multiline_mode":false,"tooltip":"Цвет москитной сетки","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"direction":{"synonym":"Направл. откр.","multiline_mode":false,"tooltip":"Направление открывания","choice_params":[{"name":"ref","path":[{"name":"Левое","presentation":"Левое","type":"enm.open_directions"},{"name":"Правое","presentation":"Правое","type":"enm.open_directions"}]}],"choice_groups_elm":"elm","type":{"types":["enm.open_directions"],"is_ref":true}},"mskt":{"synonym":"Москитка","multiline_mode":false,"tooltip":"Номенклатура москитной сетки","choice_params":[{"name":"insert_type","path":{"name":"МоскитнаяСетка","presentation":"Москитная сетка","type":"enm.inserts_types"}}],"choice_groups_elm":"elm","type":{"types":["cat.inserts","cat.nom"],"is_ref":true}},"clr_mskt":{"synonym":"Цвет москитки","multiline_mode":false,"tooltip":"Цвет москитной сетки","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"h_ruch":{"synonym":"Высота ручки","multiline_mode":false,"tooltip":"Высота ручки в координатах контура (от габарита створки)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"fix_ruch":{"synonym":"Высота ручки фиксирована","multiline_mode":false,"tooltip":"Вычисляется по свойствам фурнитуры","type":{"types":["boolean"]}},"is_rectangular":{"synonym":"Есть кривые","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"coordinates":{"name":"Координаты","synonym":"Координаты","tooltip":"Координаты элементов","fields":{"cnstr":{"synonym":"Конструкция","multiline_mode":false,"tooltip":"Номер конструкции (слоя)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"parent":{"synonym":"Родитель","multiline_mode":false,"tooltip":"Дополнительная иерархия. Например, номер стеклопакета для раскладки или внешняя примыкающая палка для створки или доборного профиля","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Номер элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm_type":{"synonym":"Тип элемента","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"path_data":{"synonym":"Путь SVG","multiline_mode":false,"tooltip":"Данные пути образующей в терминах svg или json элемента","type":{"types":["string"],"str_len":1000}},"x1":{"synonym":"X1","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y1":{"synonym":"Y1","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"x2":{"synonym":"X2","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y2":{"synonym":"Y2","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"r":{"synonym":"Радиус","multiline_mode":false,"tooltip":"Вспомогательное поле - частный случай криволинейного элемента","type":{"types":["number"],"digits":8,"fraction_figits":1}},"arc_ccw":{"synonym":"Против часов.","multiline_mode":false,"tooltip":"Вспомогательное поле - частный случай криволинейного элемента - дуга против часовой стрелки","type":{"types":["boolean"]}},"s":{"synonym":"Площадь","multiline_mode":false,"tooltip":"Вычисляемое","type":{"types":["number"],"digits":14,"fraction_figits":6}},"angle_hor":{"synonym":"Угол к горизонту","multiline_mode":false,"tooltip":"Вычисляется для прямой, проходящей через узлы","type":{"types":["number"],"digits":8,"fraction_figits":1}},"alp1":{"synonym":"Угол 1, °","multiline_mode":false,"tooltip":"Вычисляемое - угол реза в первом узле","type":{"types":["number"],"digits":8,"fraction_figits":1}},"alp2":{"synonym":"Угол 2, °","multiline_mode":false,"tooltip":"Вычисляемое - угол реза во втором узле","type":{"types":["number"],"digits":8,"fraction_figits":1}},"len":{"synonym":"Длина, м","multiline_mode":false,"tooltip":"Вычисляется по координатам и соединениям","type":{"types":["number"],"digits":8,"fraction_figits":1}},"pos":{"synonym":"Положение","multiline_mode":false,"tooltip":"Вычисляется во соседним элементам","choice_groups_elm":"elm","type":{"types":["enm.positions"],"is_ref":true}},"orientation":{"synonym":"Ориентация","multiline_mode":false,"tooltip":"Вычисляется по углу к горизонту","choice_groups_elm":"elm","type":{"types":["enm.orientations"],"is_ref":true}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"Вычисляется по вставке, геометрии и параметрам","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}}}},"cnn_elmnts":{"name":"СоединяемыеЭлементы","synonym":"Соединяемые элементы","tooltip":"Соединения элементов","fields":{"elm1":{"synonym":"Элем 1","multiline_mode":false,"tooltip":"Номер первого элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"node1":{"synonym":"Узел 1","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":1}},"elm2":{"synonym":"Элем 2","multiline_mode":false,"tooltip":"Номер второго элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"node2":{"synonym":"Узел 2","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":1}},"cnn":{"synonym":"Соединение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.cnns"],"is_ref":true}},"aperture_len":{"synonym":"Длина шва/проема","multiline_mode":false,"tooltip":"Для соединений с заполнениями: длина светового проема примыкающего элемента","type":{"types":["number"],"digits":8,"fraction_figits":1}}}},"params":{"name":"Параметры","synonym":"Параметры","tooltip":"Параметры изделий и фурнитуры","fields":{"cnstr":{"synonym":"Конструкция","multiline_mode":false,"tooltip":"Если 0, параметр относится к изделию. Иначе к фурнитуре створки","type":{"types":["number"],"digits":6,"fraction_figits":0}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"hide":{"synonym":"Скрыть","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"glass_specification":{"name":"СпецификацияЗаполнений","synonym":"Спецификация заполнений (ORDGLP)","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"gno":{"synonym":"Порядок","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}},"glasses":{"name":"Заполнения","synonym":"Заполнения","tooltip":"Стеклопакеты и сэндвичи - вычисляемая табличная часть (кеш) для упрощения отчетов","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"№ элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["string","cat.nom"],"str_len":50,"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics","string"],"is_ref":true,"str_len":50}},"width":{"synonym":"Ширина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"height":{"synonym":"Высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"s":{"synonym":"Площадь, м ²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"is_rectangular":{"synonym":"Прямоуг.","multiline_mode":false,"tooltip":"Прямоугольное заполнение","type":{"types":["boolean"]}},"is_sandwich":{"synonym":"Листовые","multiline_mode":false,"tooltip":"Непрозрачное заполнение - сэндвич","type":{"types":["boolean"]}},"thickness":{"synonym":"Толщина","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":2,"fraction_figits":0}},"coffer":{"synonym":"Камеры","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}}}},"mosquito":{"name":"Москитки","synonym":"Москитки","tooltip":"Москитные сетки - вычисляемая табличная часть (кеш) для упрощения отчетов","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["string","cat.nom"],"str_len":50,"is_ref":true}},"width":{"synonym":"Ширина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"height":{"synonym":"Высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"s":{"synonym":"Площадь, м ²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}}}},"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Номер элемента, если значение > 0, либо номер конструкции, если значение < 0","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["specification","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"qty":{"synonym":"Количество (шт)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"len":{"synonym":"Длина, м","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"width":{"synonym":"Ширина, м","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"alp1":{"synonym":"Угол 1, °","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"alp2":{"synonym":"Угол 2, °","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"totqty":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":4}},"totqty1":{"synonym":"Количество (+%)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":4}},"price":{"synonym":"Себест.план","multiline_mode":false,"tooltip":"Цена плановой себестоимости строки спецификации","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма себест.","multiline_mode":false,"tooltip":"Сумма плановой себестоимости строки спецификации","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_marged":{"synonym":"Сумма с наценкой","multiline_mode":false,"tooltip":"Вклад строки спецификации в стоимость изделия для сценария КМАРЖ_В_СПЕЦИФИКАЦИИ","type":{"types":["number"],"digits":15,"fraction_figits":2}},"origin":{"synonym":"Происхождение","multiline_mode":false,"tooltip":"Ссылка на настройки построителя, из которых возникла строка спецификации","choice_groups_elm":"elm","type":{"types":["cat.inserts","number","cat.cnns","cat.furns"],"is_ref":true,"digits":6,"fraction_figits":0}},"changed":{"synonym":"Запись изменена","multiline_mode":false,"tooltip":"Запись изменена оператором (1) или добавлена корректировкой спецификации (-1)","type":{"types":["number"],"digits":1,"fraction_figits":0}},"dop":{"synonym":"Это акс. или визуализ.","multiline_mode":false,"tooltip":"Содержит (1) для строк аксессуаров и (-1) для строк с визуализацией","type":{"types":["number"],"digits":1,"fraction_figits":0}}}}},"cachable":"doc","form":{"obj":{"head":{" ":["name","owner","calc_order","product","leading_product","leading_elm"],"Дополнительно":["x","y","z","s","clr","weight","condition_products"]},"tabular_sections":{"specification":{"fields":["elm","nom","clr","characteristic","qty","len","width","s","alp1","alp2","totqty1","price","amount","amount_marged"],"headers":"Эл.,Номенклатура,Цвет,Характеристика,Колич.,Длина,Высота,Площадь,Угол1,Угол2,Колич++,Цена,Сумма,Сумма++","widths":"50,*,70,*,50,70,70,70,70,70,70,70,70,80","min_widths":"50,180,70,180,50,70,70,70,70,70,70,70,70,70","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na,na,na,na,na","types":"ron,ref,ref,ref,calck,calck,calck,calck,calck,calck,ron,ron,ron,ron"},"constructions":{"fields":["cnstr","parent","x","y","w","h","furn","clr_furn","direction","h_ruch","mskt","clr_mskt"],"headers":"Констр.,Внешн.,Ширина,Высота,Ширина фурн.,Высота фурн.,Фурнитура,Цвет фурн.,Открывание,Высота ручки,Москитка,Цвет москитки","widths":"50,50,70,70,70,70,*,80,80,70,*,70","min_widths":"50,50,70,70,70,70,120,80,80,70,120,70","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na,na,na","types":"ron,ron,ron,ron,ron,ron,ref,ro,ro,ro,ref,ro"},"coordinates":{"fields":["cnstr","parent","elm","elm_type","clr","inset","path_data","x1","y1","x2","y2","len","alp1","alp2","angle_hor","s","pos","orientation"],"headers":"Констр.,Внешн.,Эл.,Тип,Цвет,Вставка,Путь,x1,y1,x2,y2,Длина,Угол1,Угол2,Горизонт,Площадь,Положение,Ориентация","widths":"50,50,50,70,80,*,70,70,70,70,70,70,70,70,70,70,70,70","min_widths":"50,50,50,70,80,120,70,70,70,70,70,70,70,70,70,70,70,70","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na,na,na,na,na,na,na,na,na","types":"ron,ron,ron,ref,ref,ref,ro,ron,ron,ron,ron,ron,ron,ron,ron,ron,ro,ro"},"cnn_elmnts":{"fields":["elm1","elm2","node1","node2","aperture_len","cnn"],"headers":"Эл1,Эл2,Узел1,Узел2,Длина,Соединение","widths":"50,50,50,50,160,*","min_widths":"50,50,50,50,100,200","aligns":"","sortings":"na,na,na,na,na,na","types":"ron,ron,ro,ro,ron,ref"},"params":{"fields":["cnstr","param","value","hide"],"headers":"Констр.,Параметр,Значение,Скрыть","widths":"50,*,*,50","min_widths":"50,200,200,50","aligns":"","sortings":"na,na,na,na","types":"ron,ref,ref,ch"}},"tabular_sections_order":["specification","constructions","coordinates","cnn_elmnts","params"]}}},"price_groups":{"name":"ЦеновыеГруппы","splitted":true,"synonym":"Ценовые группы","illustration":"","obj_presentation":"Ценовая группа","list_presentation":"Ценовые группы","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"definition":{"synonym":"Описание","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":1024}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram","grouping":"array"},"nom_groups":{"name":"ГруппыФинансовогоУчетаНоменклатуры","splitted":true,"synonym":"Группы фин. учета номенклатуры","illustration":"Перечень номенклатурных групп для учета затрат и укрупненного планирования продаж, закупок и производства","obj_presentation":"Номенклатурная группа","list_presentation":"Номенклатурные группы","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Раздел","multiline_mode":false,"tooltip":"","type":{"types":["cat.nom_groups"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","grouping":"array"},"insert_bind":{"name":"ПривязкиВставок","splitted":true,"synonym":"Привязки вставок","illustration":"Замена регистра \"Корректировка спецификации\"","obj_presentation":"Привязка вставки","list_presentation":"Привязки вставок","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts","cat.formulas","cat.furns"],"is_ref":true}},"zone":{"synonym":"Область","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"production":{"name":"Продукция","synonym":"Продукция","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","type":{"types":["cat.nom"],"is_ref":true}}}}},"cachable":"ram"},"planning_keys":{"name":"КлючиПланирования","splitted":true,"synonym":"Ключи планирования","illustration":"Смена + Подразделение + Участок","obj_presentation":"Ключ планирования","list_presentation":"Ключи планирования","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"work_shift":{"synonym":"Смена","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.work_shifts"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"work_center":{"synonym":"Рабочий центр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.work_centers"],"is_ref":true}},"work_center_kind":{"synonym":"Вид рабочего центра","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.work_center_kinds"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"doc"}},"doc":{"registers_correction":{"name":"КорректировкаРегистров","splitted":true,"synonym":"Корректировка регистров","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"original_doc_type":{"synonym":"Тип исходного документа","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"Произвольный комментарий. ","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"registers_table":{"name":"ТаблицаРегистров","synonym":"Таблица регистров","tooltip":"","fields":{"Имя":{"synonym":"Имя","multiline_mode":false,"tooltip":"Имя регистра, которому скорректированы записи.","mandatory":true,"type":{"types":["string"],"str_len":255}}}}},"cachable":"doc_remote","hide":true},"purchase":{"name":"ПоступлениеТоваровУслуг","splitted":true,"synonym":"Поступление товаров и услуг","illustration":"Документы отражают поступление товаров и услуг","obj_presentation":"Поступление товаров и услуг","list_presentation":"Поступление товаров и услуг","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_supplier","path":true}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"warehouse":{"synonym":"Склад","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.stores"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"goods":{"name":"Товары","synonym":"Товары","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"Услуга","path":false},{"name":"set","path":false}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"unit":{"synonym":"Единица измерения","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["goods","nom"]}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_units"],"is_ref":true}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"trans":{"synonym":"Заказ резерв","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}}}},"services":{"name":"Услуги","synonym":"Услуги","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"Услуга","path":true},{"name":"set","path":false}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"content":{"synonym":"Содержание услуги, доп. сведения","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["string"],"str_len":0}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"nom_group":{"synonym":"Номенклатурная группа","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_groups"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"cost_item":{"synonym":"Статья затрат","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":10}},"project":{"synonym":"Проект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.projects"],"is_ref":true}},"buyers_order":{"synonym":"Заказ затрат","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}}}}},"cachable":"doc","hide":true},"work_centers_task":{"name":"НарядРЦ","splitted":true,"synonym":"Задание рабочему центру","illustration":"","obj_presentation":"Наряд","list_presentation":"Задания рабочим центрам","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"work_center":{"synonym":"Рабочий центр","multiline_mode":false,"tooltip":"Участок или станок в подразделении производства","choice_groups_elm":"elm","type":{"types":["cat.planning_keys"],"is_ref":true}},"recipient":{"synonym":"Получатель","multiline_mode":false,"tooltip":"СГП или следующий передел","choice_groups_elm":"elm","type":{"types":["cat.planning_keys"],"is_ref":true}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"planning":{"name":"Планирование","synonym":"Планирование","tooltip":"","fields":{"obj":{"synonym":"Объект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"specimen":{"synonym":"Экземпляр","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"performance":{"synonym":"Мощность","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}}}}},"cachable":"doc_remote"},"calc_order":{"name":"Расчет","splitted":true,"synonym":"Расчет-заказ","illustration":"Аналог заказа покупателя типовых конфигураций.\nСодержит инструменты для формирования спецификаций и подготовки данных производства и диспетчеризации","obj_presentation":"Расчет-заказ","list_presentation":"Расчеты-заказы","input_by_string":["number_doc","number_internal"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"number_internal":{"synonym":"Номер внутр","multiline_mode":false,"tooltip":"Дополнительный (внутренний) номер документа","type":{"types":["string"],"str_len":20}},"project":{"synonym":"Проект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.projects"],"is_ref":true}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_folder","path":false}],"choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_buyer","path":true},{"name":"is_folder","path":false}],"choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"client_of_dealer":{"synonym":"Клиент дилера","multiline_mode":false,"tooltip":"Наименование конечного клиента в дилерских заказах","type":{"types":["string"],"str_len":255}},"contract":{"synonym":"Договор контрагента","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["cat.contracts"],"is_ref":true}},"organizational_unit":{"synonym":"Банк/касса","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["cat.organization_bank_accounts"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"Дополнительная информация","type":{"types":["string"],"str_len":255}},"manager":{"synonym":"Менеджер","multiline_mode":false,"tooltip":"Менеджер, оформивший заказ","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"leading_manager":{"synonym":"Ведущий менеджер","multiline_mode":false,"tooltip":"Куратор, ведущий менеджер","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"department":{"synonym":"Офис продаж","multiline_mode":false,"tooltip":"Подразделение продаж","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_operation":{"synonym":"Сумма упр","multiline_mode":false,"tooltip":"Сумма в валюте управленческого учета","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_internal":{"synonym":"Сумма внутр.","multiline_mode":false,"tooltip":"Сумма внутренней реализации","type":{"types":["number"],"digits":15,"fraction_figits":2}},"accessory_characteristic":{"synonym":"Характеристика аксессуаров","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"sys_profile":{"synonym":"Профиль","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"sys_furn":{"synonym":"Фурнитура","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"phone":{"synonym":"Телефон","multiline_mode":false,"tooltip":"Телефон по адресу доставки","type":{"types":["string"],"str_len":100}},"delivery_area":{"synonym":"Район","multiline_mode":false,"tooltip":"Район (зона, направление) доставки для группировки при планировании и оптимизации маршрута геокодером","choice_groups_elm":"elm","type":{"types":["cat.delivery_areas"],"is_ref":true}},"shipping_address":{"synonym":"Адрес доставки","multiline_mode":false,"tooltip":"Адрес доставки изделий заказа","type":{"types":["string"],"str_len":255}},"coordinates":{"synonym":"Координаты","multiline_mode":false,"tooltip":"Гео - координаты адреса доставки","type":{"types":["string"],"str_len":50}},"address_fields":{"synonym":"Значения полей адреса","multiline_mode":false,"tooltip":"Служебный реквизит","type":{"types":["string"],"str_len":0}},"difficult":{"synonym":"Сложный","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"vat_consider":{"synonym":"Учитывать НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"vat_included":{"synonym":"Сумма включает НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"settlements_course":{"synonym":"Курс взаиморасчетов","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"settlements_multiplicity":{"synonym":"Кратность взаиморасчетов","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":0}},"obj_delivery_state":{"synonym":"Состояние транспорта","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.obj_delivery_states"],"is_ref":true}},"category":{"synonym":"Категория заказа","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.order_categories"],"is_ref":true}}},"tabular_sections":{"production":{"name":"Продукция","synonym":"Продукция","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["production","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"unit":{"synonym":"Ед.","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["production","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.nom_units"],"is_ref":true}},"qty":{"synonym":"Количество, шт","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"len":{"synonym":"Длина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":1}},"width":{"synonym":"Высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":1}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"Площадь изделия","type":{"types":["number"],"digits":10,"fraction_figits":4}},"first_cost":{"synonym":"Себест. ед.","multiline_mode":false,"tooltip":"Плановая себестоимость единицы продукции","type":{"types":["number"],"digits":15,"fraction_figits":2}},"marginality":{"synonym":"К. марж","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":3}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Скидка %","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount_percent_internal":{"synonym":"Скидка внутр. %","multiline_mode":false,"tooltip":"Процент скидки для внутренней перепродажи (холдинг) или внешней (дилеры)","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount":{"synonym":"Скидка","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"margin":{"synonym":"Маржа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"price_internal":{"synonym":"Цена внутр.","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_internal":{"synonym":"Сумма внутр.","multiline_mode":false,"tooltip":"Сумма внутренней реализации (холдинг) или внешней (от дилера конечному клиенту)","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"ordn":{"synonym":"Ведущая продукция","multiline_mode":false,"tooltip":"ссылка на продукциию, к которой относится материал","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"changed":{"synonym":"Запись изменена","multiline_mode":false,"tooltip":"Запись изменена оператором (1, -2) или добавлена корректировкой спецификации (-1)","type":{"types":["number"],"digits":1,"fraction_figits":0}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}},"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"Хранение контактной информации (адреса, веб-страницы, номера телефонов и др.)","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0}},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100}},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100}},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100}},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20}},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20}}}},"planning":{"name":"Планирование","synonym":"Планирование","tooltip":"","fields":{"date":{"synonym":"Дата","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"work_center":{"synonym":"Рабочий центр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.planning_keys"],"is_ref":true}},"obj":{"synonym":"Объект","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","calc_order"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"specimen":{"synonym":"Экземпляр","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"performance":{"synonym":"Мощность","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}}}}},"cachable":"doc","hide":true,"form":{"selection":{"fields":["posted","date","number_doc","number_internal","partner","client_of_dealer","doc_amount","obj_delivery_state","sys_profile","note"],"cols":[{"id":"date","width":"160","type":"ro","align":"left","sort":"server","caption":"Дата"},{"id":"number_doc","width":"120","type":"ro","align":"left","sort":"na","caption":"№"},{"id":"number_internal","width":"100","type":"ro","align":"left","sort":"na","caption":"№ внутр"},{"id":"partner","width":"170","type":"ro","align":"left","sort":"na","caption":"Контрагент"},{"id":"client_of_dealer","width":"170","type":"ro","align":"left","sort":"na","caption":"Клиент"},{"id":"doc_amount","width":"120","type":"ron","align":"right","sort":"na","caption":"Сумма"},{"id":"obj_delivery_state","width":"120","type":"ro","align":"left","sort":"na","caption":"Статус"},{"id":"note","width":"*","type":"ro","align":"left","sort":"na","caption":"Комментарий"},{"id":"sys_profile","width":"120","type":"ro","align":"left","sort":"na","caption":"Профиль"}]},"obj":{"head":{" ":["name","owner","calc_order","product","leading_product","leading_elm"]},"tabular_sections":{"production":{"fields":["row","nom","characteristic","note","qty","len","width","s","quantity","unit","discount_percent","price","amount","discount_percent_internal","price_internal","amount_internal"],"aligns":"center,left,left,left,right,right,right,right,right,left,right,right,right,right,right,right","sortings":"na,na,na,na,na,na,na,na,na,na,na,na,na,na,na,na","types":""},"planning":{"fields":["obj","elm","specimen","work_center","date","performance"],"aligns":"left,right,right,left,left,right","sortings":"na,na,na,na,na,na","headers":"Продукция,Элемент,Экземпляр,Рабочий центр,Дата,Мощность","widths":"*,70,70,*,120,90","min_widths":"180,60,60,180,110,80","types":"ref,calck,calck,ref,dhxCalendar,calck"}},"tabular_sections_order":["production","planning"]}}},"credit_card_order":{"name":"ОплатаОтПокупателяПлатежнойКартой","splitted":true,"synonym":"Оплата от покупателя платежной картой","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент, подотчетник, касса ККМ","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}}},"cachable":"doc","hide":true},"work_centers_performance":{"name":"МощностиРЦ","splitted":true,"synonym":"Мощности рабочих центров","illustration":"","obj_presentation":"Мощность рабочих центров","list_presentation":"Мощности рабочих центров","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"start_date":{"synonym":"Дата начала","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"expiration_date":{"synonym":"Дата окончания","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"planning":{"name":"Планирование","synonym":"Планирование","tooltip":"","fields":{"date":{"synonym":"Дата","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"work_center":{"synonym":"Рабочий центр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.planning_keys"],"is_ref":true}},"performance":{"synonym":"Мощность","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}}}}},"cachable":"doc_remote"},"debit_bank_order":{"name":"ПлатежноеПоручениеВходящее","splitted":true,"synonym":"Платежное поручение входящее","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Плательщик","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}}},"cachable":"doc","hide":true},"credit_bank_order":{"name":"ПлатежноеПоручениеИсходящее","splitted":true,"synonym":"Платежное поручение исходящее","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Получатель","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}}},"cachable":"doc","hide":true},"debit_cash_order":{"name":"ПриходныйКассовыйОрдер","splitted":true,"synonym":"Приходный кассовый ордер","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент, подотчетник, касса ККМ","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals","cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"cashbox":{"synonym":"Касса","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["cat.cashboxes"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}}},"cachable":"doc","hide":true},"credit_cash_order":{"name":"РасходныйКассовыйОрдер","splitted":true,"synonym":"Расходный кассовый ордер","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент, подотчетник, Касса ККМ","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals","cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"cashbox":{"synonym":"Касса","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["cat.cashboxes"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}}},"cachable":"doc","hide":true},"selling":{"name":"РеализацияТоваровУслуг","splitted":true,"synonym":"Реализация товаров и услуг","illustration":"Документы отражают факт реализации (отгрузки) товаров","obj_presentation":"Реализация товаров и услуг","list_presentation":"Реализация товаров и услуг","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_buyer","path":true}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"warehouse":{"synonym":"Склад","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.stores"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"goods":{"name":"Товары","synonym":"Товары","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"Услуга","path":false},{"name":"set","path":false}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"unit":{"synonym":"Единица измерения","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["goods","nom"]}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_units"],"is_ref":true}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Процент скидки или наценки","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}}}},"services":{"name":"Услуги","synonym":"Услуги","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"Услуга","path":true},{"name":"set","path":false}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"content":{"synonym":"Содержание услуги, доп. сведения","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["string"],"str_len":0}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Процент скидки или наценки","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}}}}},"cachable":"doc"},"nom_prices_setup":{"name":"УстановкаЦенНоменклатуры","splitted":true,"synonym":"Установка цен номенклатуры","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"price_type":{"synonym":"Тип Цен","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}}},"tabular_sections":{"goods":{"name":"Товары","synonym":"Товары","tooltip":"","fields":{"price_type":{"synonym":"Тип Цен","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"nom_characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["goods","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"currency":{"synonym":"Валюта","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.currencies"],"is_ref":true}}}}},"cachable":"doc","form":{"selection":{"fields":["posted","date","number_doc","price_type","note"],"cols":[{"id":"date","width":"160","type":"ro","align":"left","sort":"server","caption":"Дата"},{"id":"number_doc","width":"120","type":"ro","align":"left","sort":"na","caption":"№"},{"id":"price_type","width":"*","type":"ro","align":"left","sort":"na","caption":"Тип цен"},{"id":"note","width":"*","type":"ro","align":"left","sort":"na","caption":"Комментарий"}]},"obj":{"head":{" ":[{"id":"number_doc","path":"o.number_doc","type":"ro","synonym":"Номер"},"date","responsible","note","price_type"]},"tabular_sections":{"goods":{"fields":["row","nom","nom_characteristic","price_type","price","currency"],"headers":"№,Номенклатура,Характеристика,Тип цен,Цена,Валюта","aligns":"center,left,left,left,right,left","sortings":"na,na,na,na,na,na","types":"cntr,ref,ref,ref,calck,ref","widths":"50,*,*,80,90,70","min_widths":"40,200,140,0,80,70"}}}}},"planning_event":{"name":"СобытиеПланирования","splitted":true,"synonym":"Событие планирования","illustration":"","obj_presentation":"Событие планирования","list_presentation":"События планирования","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"phase":{"synonym":"Фаза","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.ФазыПланирования"],"is_ref":true}},"work_center":{"synonym":"Рабочий центр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.planning_keys"],"is_ref":true}},"recipient":{"synonym":"Получатель","multiline_mode":false,"tooltip":"СГП или следующий передел","choice_groups_elm":"elm","type":{"types":["cat.planning_keys"],"is_ref":true}},"calc_order":{"synonym":"Расчет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"executors":{"name":"Исполнители","synonym":"Исполнители","tooltip":"","fields":{"executor":{"synonym":"Исполнитель","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals","cat.partners"],"is_ref":true}}}},"planning":{"name":"Планирование","synonym":"Планирование","tooltip":"","fields":{"obj":{"synonym":"Объект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"specimen":{"synonym":"Экземпляр","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"performance":{"synonym":"Мощность","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"event_time":{"synonym":"Время события","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date_time"}}}}},"cachable":"doc"}},"ireg":{"buyers_order_states":{"name":"СостоянияЗаказовКлиентов","splitted":true,"note":"","synonym":"Состояния заказов клиентов","dimensions":{"invoice":{"synonym":"Заказ","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["doc.calc_order"],"is_ref":true}}},"resources":{"state":{"synonym":"Состояние","multiline_mode":false,"tooltip":"Текущее состояние заказа","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.buyers_order_states"],"is_ref":true}},"event_date":{"synonym":"Дата события","multiline_mode":false,"tooltip":"Дата, на которую заказ считается просроченным","type":{"types":["date"],"date_part":"date"}}},"attributes":{"СуммаОплаты":{"synonym":"Сумма оплаты","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"ПроцентОплаты":{"synonym":"Процент оплаты","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"СуммаОтгрузки":{"synonym":"Сумма отгрузки заказа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"ПроцентОтгрузки":{"synonym":"Процент отгрузки заказа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"СуммаДолга":{"synonym":"Сумма долга","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"ПроцентДолга":{"synonym":"Процент долга","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"ЕстьРасхожденияОрдерНакладная":{"synonym":"Есть расхождения ордер накладная","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}},"cachable":"doc","grouping":"record","hide":true},"$log":{"name":"$log","note":"","synonym":"Журнал событий","dimensions":{"date":{"synonym":"Дата","multiline_mode":false,"tooltip":"Время события","type":{"types":["number"],"digits":15,"fraction_figits":0}},"sequence":{"synonym":"Порядок","multiline_mode":false,"tooltip":"Порядок следования","type":{"types":["number"],"digits":6,"fraction_figits":0}}},"resources":{"class":{"synonym":"Класс","multiline_mode":false,"tooltip":"Класс события","type":{"types":["string"],"str_len":100}},"note":{"synonym":"Комментарий","multiline_mode":true,"tooltip":"Текст события","type":{"types":["string"],"str_len":0}},"obj":{"synonym":"Объект","multiline_mode":true,"tooltip":"Объект, к которому относится событие","type":{"types":["string"],"str_len":0}}}},"margin_coefficients":{"name":"пзМаржинальныеКоэффициентыИСкидки","splitted":true,"note":"","synonym":"Маржинальные коэффициенты","dimensions":{"price_group":{"synonym":"Ценовая группа","multiline_mode":false,"tooltip":"Если указано, правило распространяется только на продукцию данной ценовой группы","choice_groups_elm":"elm","type":{"types":["cat.price_groups"],"is_ref":true}},"parameters_key":{"synonym":"Ключ параметров","multiline_mode":false,"tooltip":"Если указано, правило распространяется только на продукцию, параметры документа Расчет, Договора, Организации и Контрагента которой совпадают с параметрами ключа параметров","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"condition_formula":{"synonym":"Формула условия","multiline_mode":false,"tooltip":"В этом поле можно указать дополнительное условие на языке 1С. Например, применять строку только к аркам или непрямоугольным изделиям","choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}}},"resources":{"marginality":{"synonym":"К марж","multiline_mode":false,"tooltip":"На этот коэффициент будет умножена плановая себестоимость для получения отпускной цены. Имеет смысл, если \"тип цен прайс\" не указан и константа КМАРЖ_В_СПЕЦИФИКАЦИИ сброшена","type":{"types":["number"],"digits":10,"fraction_figits":4}},"marginality_min":{"synonym":"К марж мин.","multiline_mode":false,"tooltip":"Не позволяет установить в документе расчет скидку, при которой маржинальность строки опустится ниже указанного значения","type":{"types":["number"],"digits":10,"fraction_figits":4}},"marginality_internal":{"synonym":"К марж внутр.","multiline_mode":false,"tooltip":"Маржинальный коэффициент внутренней продажи","type":{"types":["number"],"digits":10,"fraction_figits":4}},"price_type_first_cost":{"synonym":"Тип цен плановой себестоимости","multiline_mode":false,"tooltip":"Этот тип цен будет использован для расчета плановой себестоимости продукции","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"price_type_sale":{"synonym":"Тип прайсовых цен","multiline_mode":false,"tooltip":"Этот тип цен будет использован для расчета отпускной цены продукции. Если указано, значения КМарж и КМарж.мин игнорируются","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"price_type_internal":{"synonym":"Тип цен внутренней продажи","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"В этом поле можно указать произвольный код на языке 1С для расчета (корректировки) себестоимости","choice_params":[{"name":"parent","path":[{"ref":"3220e251-ffcd-11e5-8303-e67fda7f6b46","presentation":"Общее","type":"cat.formulas"},{"ref":"3220e25b-ffcd-11e5-8303-e67fda7f6b46","presentation":"Ценообразование","type":"cat.formulas"}]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"sale_formula":{"synonym":"Формула продажа","multiline_mode":false,"tooltip":"В этом поле можно указать произвольный код на языке 1С для расчета (корректировки) цены продажи","choice_params":[{"name":"parent","path":[{"ref":"3220e251-ffcd-11e5-8303-e67fda7f6b46","presentation":"Общее","type":"cat.formulas"},{"ref":"3220e25b-ffcd-11e5-8303-e67fda7f6b46","presentation":"Ценообразование","type":"cat.formulas"}]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"internal_formula":{"synonym":"Формула внутр","multiline_mode":false,"tooltip":"В этом поле можно указать произвольный код на языке 1С для расчета цены внутренней продажи или заказа поставщику","choice_params":[{"name":"parent","path":[{"ref":"3220e251-ffcd-11e5-8303-e67fda7f6b46","presentation":"Общее","type":"cat.formulas"},{"ref":"3220e25b-ffcd-11e5-8303-e67fda7f6b46","presentation":"Ценообразование","type":"cat.formulas"}]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"external_formula":{"synonym":"Формула внешн.","multiline_mode":false,"tooltip":"В этом поле можно указать произвольный код на языке 1С для расчета внешней (дилерской) цены","choice_params":[{"name":"parent","path":[{"ref":"3220e251-ffcd-11e5-8303-e67fda7f6b46","presentation":"Общее","type":"cat.formulas"},{"ref":"3220e25b-ffcd-11e5-8303-e67fda7f6b46","presentation":"Ценообразование","type":"cat.formulas"}]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"extra_charge_external":{"synonym":"Наценка внешн.","multiline_mode":false,"tooltip":"Наценка внешней (дилерской) продажи по отношению к цене производителя, %. Перекрывается, если указан в лёгклм клиенте","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount_external":{"synonym":"Скидка внешн.","multiline_mode":false,"tooltip":"Скидка по умолчанию для внешней (дилерской) продажи по отношению к дилерской цене, %. Перекрывается, если указан в лёгклм клиенте","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount":{"synonym":"Скидка","multiline_mode":false,"tooltip":"Скидка по умолчанию, %","type":{"types":["number"],"digits":5,"fraction_figits":2}}},"attributes":{"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":200}}},"cachable":"ram","grouping":"record","form":{"selection":{"fields":["cat_price_groups.name as price_group","cat_parameters_keys.name as parameters_key","cat_formulas.name as condition_formula"],"cols":[{"id":"price_group","width":"*","type":"ro","align":"left","sort":"server","caption":"Ценовая группа"},{"id":"parameters_key","width":"*","type":"ro","align":"left","sort":"server","caption":"Ключ параметров"},{"id":"condition_formula","width":"*","type":"ro","align":"left","sort":"server","caption":"Формула условия"}]}}},"currency_courses":{"name":"КурсыВалют","splitted":true,"note":"","synonym":"Курсы валют","dimensions":{"currency":{"synonym":"Валюта","multiline_mode":false,"tooltip":"Ссылка на валюты","choice_groups_elm":"elm","type":{"types":["cat.currencies"],"is_ref":true}},"period":{"synonym":"Дата курса","multiline_mode":false,"tooltip":"Дата курса валюты","mandatory":true,"type":{"types":["date"],"date_part":"date"}}},"resources":{"course":{"synonym":"Курс","multiline_mode":false,"tooltip":"Курс валюты","mandatory":true,"type":{"types":["number"],"digits":10,"fraction_figits":4}},"multiplicity":{"synonym":"Кратность","multiline_mode":false,"tooltip":"Кратность валюты","mandatory":true,"type":{"types":["number"],"digits":10,"fraction_figits":0}}},"attributes":{},"cachable":"ram","grouping":"record","form":{"selection":{"fields":["cat_currencies.name as currency","period","course"],"cols":[{"id":"currency","width":"*","type":"ro","align":"left","sort":"server","caption":"Валюта"},{"id":"period","width":"*","type":"ro","align":"left","sort":"server","caption":"Дата курса"},{"id":"course","width":"*","type":"ron","align":"right","sort":"server","caption":"Курс"}]}}}},"areg":{"planning":{"name":"Планирование","splitted":true,"note":"","synonym":"Планирование","dimensions":{"phase":{"synonym":"Фаза","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.ФазыПланирования"],"is_ref":true}},"date":{"synonym":"Дата","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"work_center":{"synonym":"Рабочий центр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.planning_keys"],"is_ref":true}},"obj":{"synonym":"Объект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics","doc.work_centers_task","doc.calc_order"],"is_ref":true}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"specimen":{"synonym":"Экземпляр","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"period":{"synonym":"","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["date"],"date_part":"date_time"}},"recorder":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["doc.work_centers_performance","doc.planning_event","doc.registers_correction","doc.work_centers_task","doc.calc_order"],"is_ref":true}}},"resources":{"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":2}},"cost":{"synonym":"Стоимость","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}}},"attributes":{},"cachable":"e1cib","grouping":"balances","hide":true},"invoice_payments":{"name":"РасчетыСКонтрагентами","splitted":true,"note":"(Упр)","synonym":"Расчеты с контрагентами","dimensions":{"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"period":{"synonym":"","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["date"],"date_part":"date_time"}},"recorder":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["doc.credit_card_order","doc.debit_bank_order","doc.registers_correction","doc.credit_cash_order","doc.selling","doc.purchase","doc.debit_cash_order","doc.credit_bank_order"],"is_ref":true}}},"resources":{"amount_mutual":{"synonym":"Сумма взаиморасчетов","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_operation":{"synonym":"Сумма упр. учета","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}}},"attributes":{},"cachable":"e1cib","grouping":"balances","hide":true}},"dp":{"builder_price":{"name":"builder_price","splitted":false,"synonym":"Цены номенклатуры","illustration":"Метаданные карточки цен номенклатуры","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}}},"tabular_sections":{"goods":{"name":"Товары","synonym":"Цены","tooltip":"","fields":{"price_type":{"synonym":"Тип Цен","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"date":{"synonym":"Дата","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"nom_characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"currency":{"synonym":"Валюта","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.currencies"],"is_ref":true}}}}},"cachable":"e1cib","hide":true},"buyers_order":{"name":"ЗаказПокупателя","splitted":false,"synonym":"УПзП: Заказ покупателя","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"sys":{"synonym":"Система","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.production_params"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"len":{"synonym":"Длина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"height":{"synonym":"Высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"depth":{"synonym":"Глубина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"quantity":{"synonym":"Колич., шт","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":150}},"first_cost":{"synonym":"Себест. ед.","multiline_mode":false,"tooltip":"Плановая себестоимость единицы продукции","type":{"types":["number"],"digits":15,"fraction_figits":2}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Скидка %","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount_percent_internal":{"synonym":"Скидка внутр. %","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount":{"synonym":"Скидка","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"shipping_date":{"synonym":"Дата доставки","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"client_number":{"synonym":"Номер клиента","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"inn":{"synonym":"ИНН Клиента","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"shipping_address":{"synonym":"Адрес доставки","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"phone":{"synonym":"Телефон","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":100}},"price_internal":{"synonym":"Цена внутр.","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_internal":{"synonym":"Сумма внутр.","multiline_mode":false,"tooltip":"Сумма внутренней реализации (холдинг) или внешней (от дилера конечному клиенту)","type":{"types":["number"],"digits":15,"fraction_figits":2}},"base_block":{"synonym":"Типовой блок","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}}},"tabular_sections":{"product_params":{"name":"ПараметрыИзделия","synonym":"Параметры продукции","tooltip":"","fields":{"ind":{"synonym":"Индекс","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":0}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["product_params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["product_params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"hide":{"synonym":"Скрыть","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"production":{"name":"Продукция","synonym":"Продукция","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["production","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"len":{"synonym":"Длина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"height":{"synonym":"Высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"depth":{"synonym":"Глубина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"Площадь изделия","type":{"types":["number"],"digits":10,"fraction_figits":4}},"quantity":{"synonym":"Количество, шт","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":150}},"first_cost":{"synonym":"Себест. ед.","multiline_mode":false,"tooltip":"Плановая себестоимость единицы продукции","type":{"types":["number"],"digits":15,"fraction_figits":2}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Скидка %","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"ordn":{"synonym":"Ведущая продукция","multiline_mode":false,"tooltip":"ссылка на продукциию, к которой относится материал","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"qty":{"synonym":"Количество, шт","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}}}},"glass_specification":{"name":"СпецификацияЗаполнений","synonym":"Спецификация заполнений (ORDGLP)","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"sorting":{"synonym":"Порядок","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}}}},"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"dop":{"synonym":"Доп","multiline_mode":false,"tooltip":"Элемент дополнительной спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom_set":{"synonym":"Номенклатура/Набор","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_set","path":true}],"choice_groups_elm":"elm","type":{"types":["cat.inserts","cat.nom","cat.furns"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"handle_height_base":{"synonym":"Выс. ручк.","multiline_mode":false,"tooltip":"Стандартная высота ручки","type":{"types":["number"],"digits":6,"fraction_figits":0}},"handle_height_min":{"synonym":"Выс. ручк. min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"handle_height_max":{"synonym":"Выс. ручк. max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"contraction":{"synonym":"Укорочение","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"contraction_option":{"synonym":"Укороч. от","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.contraction_options"],"is_ref":true}},"coefficient":{"synonym":"Коэффициент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"flap_weight_min":{"synonym":"Масса створки min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"flap_weight_max":{"synonym":"Масса створки max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"side":{"synonym":"Сторона","multiline_mode":false,"tooltip":"Сторона фурнитуры, на которую устанавливается элемент или на которой выполняется операция","type":{"types":["number"],"digits":1,"fraction_figits":0}},"cnn_side":{"synonym":"Сторона соед.","multiline_mode":false,"tooltip":"Фильтр: выполнять операцию, если примыкающий элемент примыкает с заданной стороны","choice_groups_elm":"elm","type":{"types":["enm.cnn_sides"],"is_ref":true}},"offset_option":{"synonym":"Смещ. от","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.offset_options"],"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"transfer_option":{"synonym":"Перенос опер.","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.transfer_operations_options"],"is_ref":true}},"is_main_specification_row":{"synonym":"Это строка основной спецификации","multiline_mode":false,"tooltip":"Интерфейсное поле (доп=0) для редактирования без кода","type":{"types":["boolean"]}},"is_set_row":{"synonym":"Это строка набора","multiline_mode":false,"tooltip":"Интерфейсное поле (НоменклатураНабор=Фурнитура) для редактирования без кода","type":{"types":["number"],"digits":1,"fraction_figits":0}},"is_procedure_row":{"synonym":"Это строка операции","multiline_mode":false,"tooltip":"Интерфейсное поле (НоменклатураНабор=Номенклатура И ТипНоменклатуры = Техоперация) для редактирования без кода","type":{"types":["number"],"digits":1,"fraction_figits":0}},"is_order_row":{"synonym":"Это строка заказа","multiline_mode":false,"tooltip":"Если \"Истина\", строка будет добавлена в заказ, а не в спецификацию текущей продукции","type":{"types":["boolean"]}},"origin":{"synonym":"Происхождение","multiline_mode":false,"tooltip":"Ссылка на настройки построителя, из которых возникла строка спецификации","choice_groups_elm":"elm","type":{"types":["cat.inserts","number","cat.cnns","cat.furns"],"is_ref":true,"digits":6,"fraction_figits":0}}}}},"cachable":"e1cib","hide":true,"form":{"obj":{"head":{" ":["calc_order"]},"tabular_sections":{"production":{"fields":["row","nom","clr","len","height","s","quantity","note"],"headers":"№,Номенклатура,Цвет,Длина,Высота,Площадь,Колич.,Комментарий","widths":"40,*,120,70,70,70,70,*","min_widths":"30,200,100,70,70,70,70,80","aligns":"center,left,left,right,right,right,right,left","sortings":"na,na,na,na,na,na,na,na","types":"cntr,ref,ref,calck,calck,calck,calck,txt"}}}}},"builder_lay_impost":{"name":"builder_lay_impost","splitted":false,"synonym":"Импосты и раскладки","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"elm_type":{"synonym":"Тип элемента","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":[{"name":"Импост","presentation":"Импост","type":"enm.elm_types"},{"name":"Раскладка","presentation":"Раскладка - фальшпереплет","type":"enm.elm_types"},{"name":"Рама","presentation":"Рама","type":"enm.elm_types"}]}],"choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"split":{"synonym":"Тип деления","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.lay_split_types"],"is_ref":true}},"elm_by_y":{"synonym":"Элементов","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":2,"fraction_figits":0}},"step_by_y":{"synonym":"Шаг","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":4,"fraction_figits":0}},"align_by_y":{"synonym":"Опора","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":[{"name":"Низ","presentation":"Низ","type":"enm.positions"},{"name":"Верх","presentation":"Верх","type":"enm.positions"},{"name":"Центр","presentation":"Центр","type":"enm.positions"}]}],"choice_groups_elm":"elm","type":{"types":["enm.positions"],"is_ref":true}},"inset_by_y":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"elm_by_x":{"synonym":"Элементов","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":2,"fraction_figits":0}},"step_by_x":{"synonym":"Шаг","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":4,"fraction_figits":0}},"align_by_x":{"synonym":"Опора","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":[{"name":"Лев","presentation":"Лев","type":"enm.positions"},{"name":"Прав","presentation":"Прав","type":"enm.positions"},{"name":"Центр","presentation":"Центр","type":"enm.positions"}]}],"choice_groups_elm":"elm","type":{"types":["enm.positions"],"is_ref":true}},"inset_by_x":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"w":{"synonym":"Ширина","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"h":{"synonym":"Высота","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}}},"tabular_sections":{},"cachable":"e1cib","hide":true,"form":{"obj":{"head":{" ":["elm_type","clr","split"],"Деление Y":["inset_by_y","elm_by_y","step_by_y","align_by_y"],"Деление X":["inset_by_x","elm_by_x","step_by_x","align_by_x"],"Габариты":["w","h"]}}}},"builder_pen":{"name":"builder_pen","splitted":false,"synonym":"Рисование","illustration":"Метаданные инструмента pen (рисование профилей) графического построителя","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"elm_type":{"synonym":"Тип элемента","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":[{"name":"Рама","presentation":"Рама","type":"enm.elm_types"},{"name":"Импост","presentation":"Импост","type":"enm.elm_types"},{"name":"Раскладка","presentation":"Раскладка - фальшпереплет","type":"enm.elm_types"},{"name":"Добор","presentation":"Доборный проф.","type":"enm.elm_types"},{"name":"Соединитель","presentation":"Соединит. профиль","type":"enm.elm_types"}]}],"choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}},"inset":{"synonym":"Материал профиля","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"bind_generatrix":{"synonym":"Магнит к профилю","multiline_mode":true,"tooltip":"","type":{"types":["boolean"]}},"bind_node":{"synonym":"Магнит к узлам","multiline_mode":true,"tooltip":"","type":{"types":["boolean"]}}},"tabular_sections":{},"cachable":"e1cib","hide":true},"builder_text":{"name":"builder_text","splitted":false,"synonym":"Произвольный текст","illustration":"Метаданные инструмента text графического построителя","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"text":{"synonym":"Текст","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"font_family":{"synonym":"Шрифт","multiline_mode":true,"tooltip":"Имя шрифта","type":{"types":["string"],"str_len":50}},"bold":{"synonym":"Жирный","multiline_mode":true,"tooltip":"","type":{"types":["boolean"]}},"font_size":{"synonym":"Размер","multiline_mode":true,"tooltip":"Размер шрифта","type":{"types":["number"],"digits":3,"fraction_figits":0}},"angle":{"synonym":"Поворот","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"align":{"synonym":"Выравнивание","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.text_aligns"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"x":{"synonym":"X коорд.","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y":{"synonym":"Y коорд.","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}}},"tabular_sections":{},"cachable":"e1cib","hide":true}},"rep":{},"cch":{"predefined_elmnts":{"name":"ПредопределенныеЭлементы","splitted":true,"synonym":"Константы и списки","illustration":"Хранит значения настроек и параметров подсистем","obj_presentation":"Значение настроек","list_presentation":"","input_by_string":[],"hierarchical":true,"has_owners":false,"group_hierarchy":false,"main_presentation_name":true,"code_length":0,"fields":{"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_type":{"path":["ТипЗначения"],"elm":0},"type":{"types":["cat.production_params","cat.currencies","boolean","cat.nom_prices_types","cat.divisions","string","cat.nom_kinds","date","number","doc.calc_order","cat.nom","cat.furns","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date","digits":8,"fraction_figits":1}},"definition":{"synonym":"Описание","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"synonym":{"synonym":"Синоним","multiline_mode":false,"tooltip":"Синоним предопределенного элемента","mandatory":true,"type":{"types":["string"],"str_len":50}},"list":{"synonym":"Список","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"zone":{"synonym":"Область","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cch.predefined_elmnts"],"is_ref":true}},"type":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.production_params","cat.currencies","boolean","cat.nom_prices_types","cat.divisions","string","cat.nom_kinds","date","number","doc.calc_order","cat.nom","cat.furns","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date","digits":8,"fraction_figits":1}}},"tabular_sections":{"elmnts":{"name":"Элементы","synonym":"Элементы","tooltip":"","fields":{"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_type":{"path":["ТипЗначения"],"elm":0},"type":{"types":["cat.production_params","cat.currencies","boolean","cat.nom_prices_types","cat.divisions","string","cat.nom_kinds","date","number","doc.calc_order","cat.nom","cat.furns","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date","digits":8,"fraction_figits":1}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["cat.production_params","cat.currencies","boolean","cat.nom_prices_types","cat.divisions","string","cat.nom_kinds","date","number","doc.calc_order","cat.nom","cat.furns","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date","digits":8,"fraction_figits":1}}}}},"cachable":"doc","form":{"obj":{"head":{" ":[{"id":"name","path":"o.name","synonym":"Наименование","type":"ro"},{"id":"synonym","path":"o.synonym","synonym":"Синоним","type":"ro"},"list","zone","value"]},"tabular_sections":{"elmnts":{"fields":["elm","value"],"headers":"Элемент,Значение","widths":"*,*","min_widths":"150,150","aligns":"","sortings":"na,na","types":"ref,ref"}}}}},"properties":{"name":"ДополнительныеРеквизитыИСведения","splitted":true,"synonym":"Дополнительные реквизиты и сведения","illustration":"","obj_presentation":"Дополнительный реквизит / сведение","list_presentation":"","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":true,"code_length":0,"fields":{"shown":{"synonym":"Виден","multiline_mode":false,"tooltip":"Настройка видимости дополнительного реквизита","type":{"types":["boolean"]}},"extra_values_owner":{"synonym":"Владелец дополнительных значений","multiline_mode":false,"tooltip":"Свойство-образец, с которым у этого свойства одинаковый список дополнительных значений","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"available":{"synonym":"Доступен","multiline_mode":false,"tooltip":"Настройка доступности дополнительного реквизита","type":{"types":["boolean"]}},"caption":{"synonym":"Наименование","multiline_mode":false,"tooltip":"Краткое представление свойства, которое\nвыводится в формах редактирования его значения","mandatory":true,"type":{"types":["string"],"str_len":75}},"mandatory":{"synonym":"Заполнять обязательно","multiline_mode":false,"tooltip":"Настройка проверки заполненности дополнительного реквизита","type":{"types":["boolean"]}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"Поясняет назначение свойства","type":{"types":["string"],"str_len":0}},"destination":{"synonym":"Набор свойств","multiline_mode":false,"tooltip":"Набор свойств, которому принадлежит уникальное свойство. Если не задан, значит свойство общее.","choice_groups_elm":"elm","type":{"types":["cat.destinations"],"is_ref":true}},"tooltip":{"synonym":"Подсказка","multiline_mode":false,"tooltip":"Показывается пользователю при редактировании свойства в форме объекта","type":{"types":["string"],"str_len":0}},"is_extra_property":{"synonym":"Это дополнительное сведение","multiline_mode":false,"tooltip":"Свойство является дополнительным сведением, а не дополнительным реквизитом","type":{"types":["boolean"]}},"list":{"synonym":"Список","multiline_mode":false,"tooltip":"Значение представляет собой список опций","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"type":{"synonym":"","multiline_mode":false,"tooltip":"Типы значения, которое можно ввести при заполнении свойства.","mandatory":true,"type":{"types":["cat.nom_groups","cat.Автомобили","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.property_values","boolean","cat.divisions","cat.parameters_keys","cat.partners","string","cat.organizations","date","cat.units","number","cat.work_centers","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}}},"tabular_sections":{"extra_fields_dependencies":{"name":"ЗависимостиДополнительныхРеквизитов","synonym":"Зависимости дополнительных реквизитов","tooltip":"","fields":{"ЗависимоеСвойство":{"synonym":"Зависимое свойство","multiline_mode":false,"tooltip":"Имя свойства дополнительного реквизита, для которого настроена зависимость.","type":{"types":["string"],"str_len":0}},"field":{"synonym":"Реквизит","multiline_mode":false,"tooltip":"Имя реквизита формы или ссылка на дополнительный реквизит, от которого зависит текущий дополнительный реквизит.","choice_groups_elm":"elm","type":{"types":["string","cch.properties"],"str_len":99,"is_ref":true}},"condition":{"synonym":"Условие","multiline_mode":false,"tooltip":"Вид зависимости. \"Равно\", \"Не равно\", \"Заполнено\" или \"Не заполнено\".","type":{"types":["string"],"str_len":20}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение реквизита в условии.","choice_groups_elm":"elm","type":{"types":["cat.ПапкиЭлектронныхПисем","enm.caching_type","enm.ТипыХраненияФайлов","enm.ФорматыСканированногоИзображения","doc.work_centers_performance","bp.Задание","enm.СрокиХраненияВерсий","enm.ВидыДополнительныхОтчетовИОбработок","cat.ОбщиеДанныеИнформационногоЦентра","enm.contact_information_types","enm.individual_legal","enm.ДействияПриОбмене","enm.СостоянияЗапросовНаИспользованиеВнешнихРесурсов","cat.nom_groups","cat.Заметки","enm.count_calculating_ways","enm.task_states","enm.ТипыТекстовЭлектронныхПисем","cat.Автомобили","enm.text_aligns","enm.РезультатыВыполненияОбмена","cat.production_params","cat.СценарииОбменовДанными","cat.inserts","cat.price_groups","doc.credit_card_order","cat.nom_units","cat.ОчередьЗаданий","doc.planning_event","cat.ШаблоныЗаданийОчереди","cch.predefined_elmnts","cat.currencies","enm.ВариантыОчисткиФайлов","enm.simple_complex_all","enm.offset_options","doc.ЭлектронноеПисьмоИсходящее","enm.ВидыРасходовНУ","enm.open_directions","enm.УдалитьКлючевыеОперации","doc.nom_prices_setup","cat.ПолныеПутиКФормам","doc.ЗапланированноеВзаимодействие","enm.РазрешенияСканированногоИзображения","enm.ПричиныОтключенияРасширенийВМоделиСервиса","enm.lay_split_types","enm.ТипХранилищаСертификатов","enm.ВидыДнейПроизводственногоКалендаря","enm.ВариантыВажностиЗадачи","cat.characteristics","cat.ПапкиФайлов","enm.ПричиныОтключенияДополнительныхОтчетовИОбработокВМоделиСервиса","enm.СостоянияПроверкиКонтрагентов","enm.ТипыДанныхКэшаПрограммныхИнтерфейсов","cat.projects","pnt.Задание","enm.ТипыПроблемОбменаДанными","cat.ГруппыДоступа","cat.ЭлектронноеПисьмоИсходящееПрисоединенныеФайлы","enm.СпособыSMTPАутентификации","cat.individuals","cat.ВнешниеПользователи","cat.users","cat.insert_bind","enm.УровниПроизводительности","enm.ВариантыВажностиВзаимодействия","enm.cutting_optimization_types","enm.angle_calculating_ways","enm.ИнтеграцияТипСвёртки","cat.partner_bank_accounts","enm.ТипыВерсийОбъекта","cat.delivery_areas","cat.color_price_groups","enm.СпособыРедактированияЭлектронныхПисем","cat.elm_visualization","doc.ЭлектронноеПисьмоВходящее","doc.debit_bank_order","doc.workers_schedules","cat.planning_keys","cch.ОбъектыАдресацииЗадач","doc.ТелефонныйЗвонок","enm.specification_installation_methods","cat.ЭлектронноеПисьмоВходящееПрисоединенныеФайлы","doc.registers_correction","cat.property_values_hierarchy","cat.formulas","cat.УчетныеЗаписиСинхронизацииФайлов","enm.СпособыЗаполненияГрафикаРаботы","cat.СтроковыеКонтактыВзаимодействий","cat.ПоставляемыеРасширения","enm.ФазыПланирования","enm.contract_kinds","enm.СтатусыОбластейДанных","enm.СостоянияЗаявленияНаВыпускСертификата","enm.СостоянияСуществованияКонтрагента","doc.СогласиеНаОбработкуПерсональныхДанных","enm.ВидыПравилДляОбменаДанными","cat.property_values","boolean","enm.buyers_order_states","cat.ПользовательскиеНастройкиОтчетов","enm.СостоянияБизнесПроцессов","cat.banks_qualifier","cat.ИдентификаторыОбъектовРасширений","doc.credit_cash_order","doc.selling","cat.КлючевыеОперации","enm.ВидыТранспортаСообщенийОбмена","enm.ЦветаЗаметок","enm.ДоступныеПериодыОтчета","cat.ТипыИнформацииИнформационногоЦентра","enm.СпособыPOP3Аутентификации","cat.ГруппыВнешнихПользователей","cat.ЗакладкиВзаимодействий","enm.ДополнительныеЗначенияДоступа","enm.order_categories","enm.РежимыВыгрузкиОбъектовОбмена","cat.ПравилаОбработкиЭлектроннойПочты","enm.СтатусыИзвлеченияТекстаФайлов","enm.ТипыФайловДляВстроенногоРедактора","cat.nom_prices_types","cat.ЗапланированноеВзаимодействиеПрисоединенныеФайлы","cat.organization_bank_accounts","enm.СпособыОткрытияФайлаНаПросмотр","cat.divisions","enm.РезультатыОбработкиЗапросовНаИспользованиеВнешнихРесурсовВМоделиСервиса","doc.Встреча","enm.ПриоритетыОбъектовОбмена","enm.РазмерыБумаги","cat.Файлы","cat.destinations","enm.elm_types","enm.color_groups_destination","doc.ОтзывСогласияНаОбработкуПерсональныхДанных","cat.ИнформационныеСсылкиДляФорм","cat.РассылкиОтчетов","cat.СообщенияСистемы","cat.parameters_keys","enm.УдалитьВидыКалендарей","cat.ВидыДокументовФизическихЛиц","doc.purchase","enm.nom_types","cat.ПредопределенныеВариантыОтчетовРасширений","enm.СпособыПоворотаИзображения","cat.РолиИсполнителей","cat.contact_information_kinds","cch.УдалитьВидыДоступа","cat.params_links","cat.ПроизводственныеКалендари","enm.contraction_options","cat.partners","enm.РежимыИспользованияИнформационнойБазы","enm.ФорматыХраненияМногостраничныхФайлов","enm.transfer_operations_options","doc.debit_cash_order","cat.пзРазныеСпискиИСоответствия","enm.ПровайдерыSMS","cat.ПоставляемыеДополнительныеОтчетыИОбработки","string","enm.ПорядокОтветовНаЗапросыУведомленийОПрочтении","cat.СертификатыКлючейЭлектроннойПодписиИШифрования","cat.ПоставляемыеДанные","enm.ЦветностиИзображения","enm.course_installation_methods","enm.inserts_types","cat.ОчередьЗаданийОбластейДанных","enm.sz_line_types","cat.nom_kinds","enm.СпособыВызоваДополнительныхОбработок","enm.РежимыСовместимостиРазрешенийДополнительныхОтчетовИОбработок","enm.orientations","enm.ОперацииАдминистрированияПрофилейБезопасности","cat.ВерсииРасширений","cat.organizations","date","cat.countries","enm.mutual_contract_settlements","cat.ДополнительныеОтчетыИОбработки","enm.inset_attrs_options","cat.УчетныеЗаписиЭлектроннойПочты","cat.units","number","cat.СообщениеSMSПрисоединенныеФайлы","cat.work_centers","enm.gender","cat.ГруппыПользователей","cat.СообщенияОбластейДанных","cat.ВариантыОтчетов","cat.ВерсииФайлов","enm.СпособыСравненияВерсийФайлов","cat.ТомаХраненияФайлов","tsk.ЗадачаИсполнителя","doc.work_centers_task","doc.СообщениеSMS","enm.СостоянияПроцессовДляЗапуска","enm.ДействияСФайламиПоДвойномуЩелчку","enm.ВариантыSMTPАутентификации","cat.Абоненты","cat.work_shifts","enm.ФорматыСохраненияОтчетов","cat.ПредопределенныеВариантыОтчетов","enm.impost_mount_options","cat.ГруппыИсполнителейЗадач","enm.ВариантыВерсионированияОбъектов","cat.work_center_kinds","enm.ИсточникиПравилДляОбменаДанными","enm.ВариантыСжатияTIFF","cat.СтатистикаАбонентов","cat.ПрограммыЭлектроннойПодписиИШифрования","enm.plan_limit","cat.КлиентыДилеров","doc.calc_order","enm.positions","enm.ВидыНазначенияДатЗапрета","enm.ПериодОчисткиФайлов","doc.credit_bank_order","cat.cashboxes","enm.open_types","cch.РазделыДатЗапретаИзменения","enm.СтатусыИсходящегоЭлектронногоПисьма","enm.cnn_types","cat.nom","enm.obj_delivery_states","cat.cnns","cat.furns","enm.ПериодичностиРасписанийРассылокОтчетов","enm.inserts_glass_types","enm.ФорматыХраненияОдностраничныхФайлов","cat.cash_flow_articles","enm.СостоянияДокументаСообщениеSMS","enm.СпособыУстановкиВремениНапоминания","enm.vat_rates","cat.ВстречаПрисоединенныеФайлы","enm.cnn_sides","enm.ВариантыПубликацииДополнительныхОтчетовИОбработок","cat.ПрофилиГруппДоступа","cat.meta_ids","cat.contracts","cat.calendars","enm.ТипыОтчетов","cat.ТелефонныйЗвонокПрисоединенныеФайлы","cat.stores","cch.properties","cat.clrs","cat.users_acl","enm.СостоянияСообщенияSMS"],"is_ref":true,"str_len":50,"date_part":"date","digits":10,"fraction_figits":0}}}}},"cachable":"ram"}},"cacc":{},"bp":{},"tsk":{},"syns_1с":["arcCCW","CH","RADIUS","Автор","АвтоУравнивание","Адрес","АдресБанка","АдресДоставки","АдресЭП","Аксессуар","Активная","Арт1Стеклопакет","Арт1ТолькоВертикальный","Арт2Стеклопакет","Арт2ТолькоВертикальный","Артикул","Атрибуты","БазоваяЕдиницаИзмерения","Банк","БанкДляРасчетов","Банки","БанковскиеСчета","БанковскиеСчетаКонтрагентов","БанковскиеСчетаОрганизаций","БанковскийСчет","БизнесПроцесс","БИКБанка","БИКБанкаДляРасчетов","Булево","Валюта","ВалютаВзаиморасчетов","ВалютаДенежныхСредств","ВалютаДокумента","ВалютаЦены","Валюты","ВариантАтрибутов","ВариантПереноса","ВариантСмещения","ВариантУкорочения","ВариантыАтрибутовВставок","ВариантыКрепленияИмпостов","ВводПоСтроке","ВедениеВзаиморасчетов","ВедениеВзаиморасчетовПоДоговорам","Ведомый","ВедущаяБаза","ВедущаяЗадача","ВедущаяПродукция","ВедущаяФормула","Ведущий","ВедущийМенеджер","ВедущийЭлемент","ВерсияДанных","Вес","Вид","ВидДоговора","Виден","ВидЗатрат","ВидНоменклатуры","ВидОперации","ВидРабот","ВидРабочегоЦентра","ВидСкидкиНаценки","ВидСчета","ВидТранспортногоСредства","ВидыДоговоровКонтрагентов","ВидыЗатрат","ВидыКонтактнойИнформации","ВидыНачисленийИУдержаний","ВидыНоменклатуры","ВидыОперацийЗаказПокупателя","ВидыОперацийЗаказПоставщику","ВидыОперацийПеремещениеЗапасов","ВидыРабочихЦентров","ВидыСкидокНаценок","ВидыТранспортныхСредств","Визуализация","Владелец","ВладелецДополнительныхЗначений","Владельцы","ВнутренниеЗаказы","ВремяИзменения","ВремяНачала","ВремяОкончания","ВремяСобытия","Всего","Вставка","ВходящееИсходящееСобытие","ВыборГруппИЭлементов","Выполнена","ВыпуклаяДуга","Высота","ВысотаМакс","ВысотаМин","ВысотаРучки","ВысотаРучкиМакс","ВысотаРучкиМин","ВысотаРучкиФиксирована","Глубина","Город","ГородБанка","ГородБанкаДляРасчетов","Готовность","ГрафикиРаботников","ГрафикРаботы","ГруппыФинансовогоУчетаНоменклатуры","ДаНет","Дата","ДатаДоставки","ДатаИзменения","ДатаНачала","ДатаОкончания","ДатаРождения","ДатаСобытия","ДебетКредит","Действие","ДержатьРезервБезОплатыОграниченноеВремя","ДеятельностьПрекращена","Длина","ДлинаКода","ДлинаМакс","ДлинаМин","ДлинаНомера","ДлинаПроема","ДниНедели","ДоговорКонтрагента","ДоговорыКонтрагентов","Документ.Расчет","ДокументУдостоверяющийЛичность","Долгота","ДоменноеИмяСервера","Доп","ДополнительныеРеквизиты","ДополнительныеРеквизитыИСведения","ДополнительныеСведения","ДопускаютсяНезамкнутыеКонтуры","ДопустимаяСуммаЗадолженности","ДопустимоеЧислоДнейЗадолженности","Доступен","ЕдиницаИзмерения","ЕдиницаПоКлассификатору","ЕдиницаХраненияОстатков","ЕдиницыИзмерения","Завершен","Завершение","ЗависимостиДополнительныхРеквизитов","Заголовок","Заказ","ЗаказПокупателя","ЗаказПоставщику","Закрыт","Запасы","Заполнения","ЗаполнятьОбязательно","Запуск","Значение","ЗначениеЗаполнения","Значения","ЗначенияПолей","ЗначенияПолейАдреса","ЗначенияСвойствОбъектов","ЗначенияСвойствОбъектовИерархия","Идентификатор","ИдентификаторПользователяИБ","ИдентификаторПользователяСервиса","ИдентификаторыОбъектовМетаданных","Иерархический","ИерархияГруппИЭлементов","Изделие","ИзмененЗдесь","ИмяПредопределенныхДанных","Инд","Индекс","ИндивидуальныйПредприниматель","ИНН","ИнтеграцияКешСсылок","ИнтеграцияПраваПользователей","ИнтеграцияСостоянияТранспорта","ИнтеграцияТипКеширования","ИнтеграцияТипРегистрации","Исполнители","Исполнитель","ИспользоватьТовары","ИтогСебестоимость","Календари","КалендариGoogle","Календарь","Камеры","Касса","Кассы","КатегорииЗаказов","Категория","КлассификаторБанковРФ","КлассификаторЕдиницИзмерения","КлиентДилера","КлючиПланирования","КлючПараметров","КМарж","КМаржВнутр","КМаржМин","Код","КодАльфа2","КодАльфа3","КодИМНС","КодПоОКПО","КодЦветаДляСтанка","Количество","КоличествоСторон","Комментарий","Конструкции","Конструкция","КонтактнаяИнформация","КонтактныеЛица","КонтактныеЛицаКонтрагентов","Контрагент","Контрагенты","КонтролироватьСуммуЗадолженности","КонтролироватьЧислоДнейЗадолженности","КонцевыеКрепления","Координата","Координаты","КоординатыЗаполнений","КорректировкаРегистров","КоррСчет","КоррСчетБанка","КоррСчетБанкаДляРасчетов","Коэффициент","КоэффициентПотерь","КПП","Кратность","КратностьВзаиморасчетов","КрепитсяШтульп","КреплениеИмпостов","КреплениеШтульпа","Курс","КурсВзаиморасчетов","КурсыВалют","ЛеваяПравая","Листовые","Маржа","Марка","Масса","МассаМакс","МассаМин","МассаСтворкиМакс","МассаСтворкиМин","МатериалОперация","Материалы","МеждународноеСокращение","Менеджер","МестоРождения","МногострочныйРежим","МожноПоворачивать","Москитка","МоскиткаЦвет","Москитки","МощностиРЦ","Мощность","Набор","НаборСвойств","НаборФурнитуры","НаборыДополнительныхРеквизитовИСведений","Наименование","НаименованиеБанка","НаименованиеПолное","НаименованиеСокращенное","НалогообложениеНДС","Направление","НаПроем","НарядРЦ","НастройкиОткрывания","Наценка","НаценкаВнешн","Недействителен","НеполноеОткрывание","НеРаботаетВремяНачала","НеРаботаетВремяОкончания","Номенклатура","Номенклатура1","Номенклатура2","НоменклатураНабор","НоменклатурнаяГруппа","Номер","НомерSW","НомерВнутр","НомерКлиента","НомерКонтура","НомерОтдела","НомерСтроки","НомерСчета","НомерТелефона","НомерТелефонаБезКодов","ОбластиДоступаGoogle","Область","Объект","ОбъектДоступа","ОбъектыДоступа","Объем","ОбязательноеЗаполнение","ОграниченияСпецификации","ОкруглятьВБольшуюСторону","ОкруглятьКоличество","Описание","ОплатаОтПокупателяПлатежнойКартой","Организации","Организация","Ориентация","ОсновнаяВалюта","ОсновнаяСтатьяДвиженияДенежныхСредств","ОсновноаяКасса","ОсновноеКонтактноеЛицо","ОсновноеПредставлениеИмя","ОсновнойБанковскийСчет","ОсновнойДоговорКонтрагента","ОсновнойМенеджерПокупателя","ОсновнойПроект","ОснЦвет","ОсьПоворота","Отбор","Ответственный","ОтражатьВБухгалтерскомУчете","ОтражатьВНалоговомУчете","Отступы","Параметр","Параметры","ПараметрыВыбора","ПараметрыИзделия","ПараметрыОтбора","ПараметрыПрописиНаРусском","ПараметрыФурнитуры","ПарныйРаскрой","пзВариантыПереносаОпераций","пзВариантыСмещений","пзВариантыУкорочений","пзВизуализацияЭлементов","пзВставки","пзВыравниваниеТекста","пзКлючиПараметров","пзМаржинальныеКоэффициентыИСкидки","пзНазначенияЦветовыхГрупп","пзНаправлениеОткрывания","пзОграничениеПлана","пзОриентация","пзПараметрыПродукции","пзПростыеСложныеВсе","пзРайоныДоставки","пзСвязиПараметров","пзСоединения","пзСпособыРасчетаКоличества","пзСпособыРасчетаУгла","пзСпособыУстановкиСпецификации","пзСторонаСоединения","пзТипыВставок","пзТипыВставокСтеклопакета","пзТипыДеленияРаскладки","пзТипыОптимизацийРаскроя","пзТипыОткрывания","пзТипыРазмерныхЛиний","пзТипыСоединений","пзТипыЭлементов","пзФурнитура","пзЦвета","Планирование","ПлатежноеПоручениеВходящее","ПлатежноеПоручениеИсходящее","ПлатежныйКалендарь","Плотность","Площадь","ПлощадьМакс","ПлощадьМин","ПлощадьППМ","Поворачивать","ПоДоговоруВЦелом","Подразделение","ПодразделениеПроизводства","Подразделения","Подсказка","Подчиненый","ПоЗаказам","ПоКонтуру","Покупатель","Пол","ПолноеИмя","Положение","ПоложениеЭлемента","Получатель","ПолФизическихЛиц","Пользователи","ПометкаУдаления","ПорогОкругления","Порядок","ПорядокОкругления","Поставщик","ПоступлениеТоваровУслуг","ПоСчетам","ПоУмолчанию","Пояснение","Предоплата","ПредопределенныеЭлементы","Предопределенный","Представление","ПредставлениеИдентификатора","ПредставлениеОбъекта","ПредставлениеСписка","Префикс","Привязки","ПривязкиВставок","Принудительно","Приоритет","Припуск","ПриходныйКассовыйОрдер","Проведен","Продукция","Проект","Проекты","Происхождение","Пропорции","Процент","ПроцентАвтоматическихСкидок","ПроцентПредоплаты","ПроцентСкидкиНаценки","ПроцентСкидкиНаценкиВнутр","Прочее","Прямоугольный","ПутьSVG","РаботаетВремяНачала","РаботаетВремяОкончания","Работники","Работы","РабочиеЦентры","РабочийЦентр","Разделитель","Размер","Размер_B","РазмерМакс","РазмерМин","РазмерныеЛинии","РазмерФальца","РазмерФурнПаза","РазныеЦвета","Район","РасходныйКассовыйОрдер","Расценка","Расчет","РасчетныйСчет","РасчетыСКонтрагентами","РасширенныйРежим","РасшифровкаПлатежа","РеализацияТоваровУслуг","Регион","Реквизит","РеквизитДопУпорядочивания","Реквизиты","Родитель","РучкаНаСтороне","СвидетельствоДатаВыдачи","СвидетельствоКодОргана","СвидетельствоНаименованиеОргана","СвидетельствоСерияНомер","СВИФТБИК","Свойство","Связи","СвязиПараметровВыбора","СвязьПоТипу","Сделка","Себестоимость","Синоним","Система","СистемыПрофилей","СистемыФурнитуры","Скидка","СкидкаВнешн","СкидкиНаценки","Склад","Склады","СКомиссионером","СКомитентом","Скрыть","Сложный","Служебный","Смена","Смены","Смещение","Событие","СобытиеПланирования","Содержание","Соедин","СоединяемыеЭлементы","Соответствие","СоответствиеЦветов","СортировкаВЛистеКомплектации","Состояние","СостояниеТранспорта","СостоянияЗаданий","СостоянияЗаказовКлиентов","Сотрудник","Сотрудники","Спецификации","Спецификация","СпецификацияЗаполнений","Список","СПокупателем","СпособРасчетаКоличества","СпособРасчетаУгла","СпособУстановкиКурса","СпособыУстановкиКурсаВалюты","СПоставщиком","СрокДействия","Ссылка","СтавкаНДС","СтавкиНДС","СтандартнаяВысотаРучки","Старт","Стартован","СтатусМатериальныхЗатрат","СтатусыЗаказов","СтатусыМатериальныхЗатратНаПроизводство","СтатьиДвиженияДенежныхСредств","СтатьиЗатрат","СтатьяДвиженияДенежныхСредств","СтатьяЗатрат","Створка","СтворкиВРазныхПлоскостях","Стоимость","Сторона","Сторона1","Сторона2","СторонаСоединения","СторонаЭлемента","Страна","СтраныМира","СтраховойНомерПФР","стрНомер","Строка","СтрокаПодключения","СтруктурнаяЕдиница","стрЭлементы","Сумма","СуммаАвтоматическойСкидки","СуммаВзаиморасчетов","СуммаВключаетНДС","СуммаВнутр","СуммаДокумента","СуммаНДС","СуммаСНаценкой","СуммаУпр","Суффикс","СчетУчета","ТаблицаРегистров","ТабличнаяЧасть","ТабличныеЧасти","ТекстКорреспондента","ТекстНазначения","ТекстоваяСтрока","Телефон","Телефоны","ТелефоныБанка","Тип","ТипВставки","ТипВставкиСтеклопакета","ТипДеления","ТипДеленияРаскладки","ТипДенежныхСредств","ТипИсходногоДокумента","ТипНоменклатуры","ТиповойБлок","ТиповыеБлоки","ТипОптимизации","ТипОткрывания","ТипСоединения","ТипСчета","ТипЦен","ТипЦенВнутр","ТипЦенПрайс","ТипЦенСебестоимость","ТипыДенежныхСредств","ТипыКонтактнойИнформации","ТипыНалогообложенияНДС","ТипыНоменклатуры","ТипыСобытий","ТипыСтрокСоставаСпецификации","ТипыСтруктурныхЕдиниц","ТипыСчетов","ТипыЦенНоменклатуры","ТипЭлемента","Товары","Толщина","ТолщинаМакс","ТолщинаМин","ТолькоДляПрямыхПрофилей","ТолькоДляЦенообразования","ТочкаМаршрута","ТранспортныеСредства","УголКГоризонту","УголКГоризонтуМакс","УголКГоризонтуМин","УголМакс","УголМин","УголРеза1","УголРеза2","УдлинениеАрки","Узел1","Узел2","Укорочение","УкорочениеПоКонтуру","Управленческий","Условие","УсловныхИзделий","Услуги","УстанавливатьСпецификацию","УстановкаЦенНоменклатуры","УточнятьРайонГеокодером","УчитыватьНДС","Фаза","ФизическиеЛица","ФизическоеЛицо","Финиш","ФормироватьНомерПоНомеруВнутр","Формула","ФормулаВнешн","ФормулаВнутр","ФормулаПродажа","ФормулаРасчетаКурса","ФормулаУсловия","Формулы","Фурнитура","ФурнитураЦвет","ХарактерЗатрат","Характеристика","ХарактеристикаАксессуаров","ХарактеристикаНоменклатуры","ХарактеристикаПродукции","ХарактеристикиНоменклатуры","Цвет","Цвет1","Цвет2","ЦветRAL","Цвета","ЦветВРисовалке","ЦветИзнутри","ЦветоваяГруппа","ЦветоЦеновыеГруппы","ЦветСнаружи","Цена","ЦенаВключаетНДС","ЦенаВнутр","ЦеноваяГруппа","ЦеновыеГруппы","Центрировать","ЦеныНоменклатуры","Число","ЧислоДнейРезерваБезОплаты","Шаблон","Шаг","Ширина","ШиринаПилы","Широта","Шкала","Штуки","ШтульпБезимпСоед","Экземпляр","Элемент","Элемент1","Элемент2","Элементы","Эскиз","ЭтоАксессуар","ЭтоВодоотлив","ЭтоГруппа","ЭтоДополнительноеСведение","ЭтоНабор","ЭтоОсновнойЭлемент","ЭтоРаздвижка","ЭтоСоединение","ЭтоСтрокаЗаказа","ЭтоСтрокаНабора","ЭтоСтрокаОперации","ЭтоСтрокаОсновнойСпецификации","ЭтоСтрокаСочетанияНоменклатур","ЭтоТехоперация","ЭтоУслуга","ЮрЛицо","ЮрФизЛицо","Ячейка","Ячейки"],"syns_js":["arc_ccw","changed","arc_r","author","auto_align","address","bank_address","shipping_address","email_address","accessory","active","art1glass","art1vert","art2glass","art2vert","article","attributes","base_unit","bank","settlements_bank","banks","bank_accounts","partner_bank_accounts","organization_bank_accounts","bank_account","buisness_process","bank_bic","settlements_bank_bic","boolean","currency","settlements_currency","funds_currency","doc_currency","price_currency","currencies","attrs_option","transfer_option","offset_option","contraction_option","inset_attrs_options","impost_mount_options","input_by_string","mutual_settlements","mutual_contract_settlements","slave","leading_base","leading_task","leading_product","leading_formula","master","leading_manager","leading_elm","data_version","heft","kind","contract_kind","shown","cost_kind","nom_kind","transactions_kind","work_kind","work_center_kind","charges_discounts_kind","account_kind","motor_vehicle_kind","contract_kinds","costs_kinds","contact_information_kinds","charges_deductions_kinds","nom_kinds","transactions_kinds_buyers_order","transactions_kinds_purchase_order","transactions_kinds_stock_transfer","work_center_kinds","charges_discounts_kinds","motor_vehicle_kinds","visualization","owner","extra_values_owner","owners","internal_orders","change_time","begin_time","end_time","event_time","altogether","inset","inbound_outbound","choice_groups_elm","completed","arc_available","height","hmax","hmin","h_ruch","handle_height_max","handle_height_min","fix_ruch","depth","city","bank_city","settlements_bank_city","readiness","workers_schedules","worker_schedule","nom_groups","yes_no","date","shipping_date","change_date","start_date","expiration_date","birth_date","event_date","debit_credit","action","check_days_without_pay","activity_ceased","len","code_length","lmax","lmin","number_doc_len","aperture_len","week_days","contract","contracts","Документ.итРасчет","identification_document","longitude","server_domain_name","dop","extra_fields","properties","extra_properties","allow_open_cnn","allowable_debts_amount","allowable_debts_days","available","unit","qualifier_unit","storage_unit","nom_units","finished","completion","extra_fields_dependencies","caption","invoice","buyers_order","purchase_order","closed","inventories","glasses","mandatory","launch","value","fill_value","values","values_fields","address_fields","property_values","property_values_hierarchy","identifier","user_ib_uid","user_fresh_uid","meta_ids","hierarchical","group_hierarchy","product","changed_here","predefined_name","icounter","ind","individual_entrepreneur","inn","integration_links_cache","users_acl","obj_delivery_states","caching_type","registration_type","executors","executor","use_goods","first_cost_total","calendars","calendars_google","calendar","coffer","cashbox","cashboxes","order_categories","category","banks_qualifier","units","client_of_dealer","planning_keys","parameters_key","marginality","marginality_internal","marginality_min","id","alpha2","alpha3","imns_code","okpo","machine_tools_clr","quantity","side_count","note","constructions","cnstr","contact_information","contact_persons","contact_persons_partners","partner","partners","check_debts_amount","check_debts_days","end_mount","coordinate","coordinates","glass_coordinates","registers_correction","correspondent_account","bank_correspondent_account","settlements_bank_correspondent_account","coefficient","loss_factor","kpp","multiplicity","settlements_multiplicity","shtulp_fix_here","impost_fixation","shtulp_fixation","course","settlements_course","currency_courses","left_right","is_sandwich","margin","brand","weight","mmax","mmin","flap_weight_max","flap_weight_min","material_operation","materials","international_short","manager","birth_place","multiline_mode","can_rotate","mskt","clr_mskt","mosquito","work_centers_performance","performance","set","destination","furn_set","destinations","name","bank_name","name_full","name_short","vat","direction","on_aperture","work_centers_task","open_tunes","extra_charge","extra_charge_external","invalid","partial_opening","not_work_begin_time","not_work_end_time","nom","nom1","nom2","nom_set","nom_group","number_doc","number_cnt","number_internal","client_number","contour_number","number_division","row","account_number","phone_number","phone_without_codes","google_access_areas","area","obj","acl_obj","acl_objs","volume","mandatory_fields","specification_restrictions","rounding_in_a_big_way","rounding_quantity","definition","credit_card_order","organizations","organization","orientation","main_currency","main_cash_flow_article","main_cashbox","primary_contact","main_presentation_name","main_bank_account","main_contract","buyer_main_manager","main_project","default_clr","rotation_axis","selection","responsible","accounting_reflect","tax_accounting_reflect","offsets","param","params","choice_params","product_params","selection_params","parameters_russian_recipe","furn_params","double_cut","transfer_operations_options","offset_options","contraction_options","elm_visualization","inserts","text_aligns","parameters_keys","margin_coefficients","color_groups_destination","open_directions","plan_limit","orientations","production_params","simple_complex_all","delivery_areas","params_links","cnns","count_calculating_ways","angle_calculating_ways","specification_installation_methods","cnn_sides","inserts_types","inserts_glass_types","lay_split_types","cutting_optimization_types","open_types","sz_line_types","cnn_types","elm_types","furns","clrs","planning","debit_bank_order","credit_bank_order","calendar_payments","density","s","smax","smin","coloration_area","rotate","by_entire_contract","department","department_manufactory","divisions","tooltip","has_owners","by_orders","by_contour","is_buyer","sex","full_moniker","pos","positions","recipient","gender","users","_deleted","rounding_threshold","sorting","rounding_order","is_supplier","purchase","by_invoices","by_default","illustration","prepayment","predefined_elmnts","predefined","presentation","identifier_presentation","obj_presentation","list_presentation","prefix","bindings","insert_bind","forcibly","priority","overmeasure","debit_cash_order","posted","production","project","projects","origin","proportions","rate","discount_percent_automatic","prepayment_percent","discount_percent","discount_percent_internal","others","is_rectangular","svg_path","work_begin_time","work_end_time","workers","jobs","work_centers","work_center","delimiter","sz","sizeb","sz_max","sz_min","sz_lines","sizefaltz","sizefurn","varclr","delivery_area","credit_cash_order","pricing","calc_order","current_account","invoice_payments","extended_mode","payment_details","selling","region","field","sorting_field","fields","parent","handle_side","certificate_date_issue","certificate_authority_code","certificate_authority_name","certificate_series_number","swift","property","links","choice_links","choice_type","trans","first_cost","synonym","sys","sys_profile","sys_furn","discount","discount_external","charges_discounts","warehouse","stores","with_commission_agent","with_committent","hide","difficult","ancillary","work_shift","work_shifts","offset","event","planning_event","content","cnn","cnn_elmnts","conformity","clr_conformity","complete_list_sorting","state","obj_delivery_state","task_states","buyers_order_states","employee","staff","specifications","specification","glass_specification","list","with_buyer","count_calc_method","angle_calc_method","course_installation_method","course_installation_methods","with_supplier","validity","ref","vat_rate","vat_rates","handle_height_base","start","started","costs_material_feed","invoice_conditions","costs_material_feeds","cash_flow_articles","cost_items","cash_flow_article","cost_item","flap","var_layers","cost","side","sd1","sd2","cnn_side","elm_side","country","countries","pfr_number","number_str","string","connection_str","organizational_unit","elm_str","amount","discount_amount_automatic","amount_mutual","vat_included","amount_internal","doc_amount","vat_amount","amount_marged","amount_operation","suffix","account_accounting","registers_table","tabular_section","tabular_sections","correspondent_text","appointments_text","txt_row","phone","phone_numbers","bank_phone_numbers","type","insert_type","insert_glass_type","split_type","lay_split_type","cash_flow_type","original_doc_type","nom_type","base_block","base_blocks","cutting_optimization_type","open_type","cnn_type","account_type","price_type","price_type_internal","price_type_sale","price_type_first_cost","cash_flow_types","contact_information_types","vat_types","nom_types","event_types","specification_row_types","structural_unit_types","account_types","nom_prices_types","elm_type","goods","thickness","tmax","tmin","for_direct_profile_only","for_pricing_only","buisness_process_point","transport_means","angle_hor","ahmax","ahmin","amax","amin","alp1","alp2","arc_elongation","node1","node2","contraction","contraction_by_contour","managerial","condition","condition_products","services","set_specification","nom_prices_setup","specify_area_by_geocoder","vat_consider","phase","individuals","individual_person","finish","number_by_number_internal","formula","external_formula","internal_formula","sale_formula","course_calc_formula","condition_formula","formulas","furn","clr_furn","costs_character","characteristic","accessory_characteristic","nom_characteristic","product_characteristic","characteristics","clr","clr1","clr2","ral","colors","clr_str","clr_in","clr_group","color_price_groups","clr_out","price","vat_price_included","price_internal","price_group","price_groups","do_center","nom_prices","number","days_without_pay","template","step","width","saw_width","latitude","scale","is_pieces","shtulp_available","specimen","elm","elm1","elm2","elmnts","outline","is_accessory","is_drainage","is_folder","is_extra_property","is_set","is_main_elm","is_sliding","is_cnn","is_order_row","is_set_row","is_procedure_row","is_main_specification_row","is_nom_combinations_row","is_procedure","is_service","legal_person","individual_legal","cell","cells"]});

/**
 * Установка параметров по умолчанию из package.json
 */
$p.injected_data._mixin({"toolbar_calc_order_production.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\r\n<toolbar>\r\n\r\n    <item id=\"sep0\" type=\"separator\"/>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_grp_add\" text=\"&lt;i class='fa fa-plus-circle fa-fw'&gt;&lt;/i&gt;\" title=\"Добавить строку заказа\" openAll=\"true\" >\r\n        <item type=\"button\" id=\"btn_add_builder\" text=\"&lt;i class='fa fa-object-ungroup fa-fw'&gt;&lt;/i&gt; Изделие построителя\" />\r\n        <item type=\"button\" id=\"btn_add_product\" text=\"&lt;i class='fa fa-gavel fa-fw'&gt;&lt;/i&gt; Продукцию или услугу\" />\r\n        <item type=\"button\" id=\"btn_add_material\" text=\"&lt;i class='fa fa-cube fa-fw'&gt;&lt;/i&gt; Материал\" />\r\n    </item>\r\n\r\n    <item type=\"button\" id=\"btn_edit\" text=\"&lt;i class='fa fa-object-ungroup fa-fw'&gt;&lt;/i&gt;\" title=\"Редактировать изделие построителя\" />\r\n    <item type=\"button\" id=\"btn_spec\" text=\"&lt;i class='fa fa-table fa-fw'&gt;&lt;/i&gt;\" title=\"Открыть спецификацию изделия\" />\r\n    <item type=\"button\" id=\"btn_delete\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\" title=\"Удалить строку заказа\" />\r\n\r\n    <item type=\"button\" id=\"btn_discount\" text=\"&lt;i class='fa fa-percent fa-fw'&gt;&lt;/i&gt;\" title=\"Скидки по типам строк заказа\"/>\r\n\r\n    <item id=\"sep1\" type=\"separator\"/>\r\n\r\n</toolbar>","toolbar_calc_order_obj.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\r\n<toolbar>\r\n    <item id=\"sep0\" type=\"separator\"/>\r\n    <item type=\"button\" id=\"btn_save_close\" text=\"&lt;i class='fa fa-caret-square-o-down fa-fw'&gt;&lt;/i&gt;\" title=\"Записать и закрыть\"/>\r\n    <item type=\"button\" id=\"btn_save\" text=\"&lt;i class='fa fa-floppy-o fa-fw'&gt;&lt;/i&gt;\" title=\"Записать\"/>\r\n    <item type=\"button\" id=\"btn_sent\" text=\"&lt;i class='fa fa-paper-plane-o fa-fw'&gt;&lt;/i&gt;\" title=\"Отправить заказ\" />\r\n\r\n    <item type=\"button\" id=\"btn_post\" enabled=\"false\" text=\"&lt;i class='fa fa-check-square-o fa-fw'&gt;&lt;/i&gt;\" title=\"Провести документ\" />\r\n    <item type=\"button\" id=\"btn_unpost\" enabled=\"false\" text=\"&lt;i class='fa fa-square-o fa-fw'&gt;&lt;/i&gt;\" title=\"Отмена проведения\" />\r\n\r\n    <item type=\"button\" id=\"btn_files\" text=\"&lt;i class='fa fa-paperclip fa-fw'&gt;&lt;/i&gt;\" title=\"Присоединенные файлы\"/>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_print\" text=\"&lt;i class='fa fa-print fa-fw'&gt;&lt;/i&gt;\" title=\"Печать\" openAll=\"true\">\r\n    </item>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_create_by_virtue\" text=\"&lt;i class='fa fa-bolt fa-fw'&gt;&lt;/i&gt;\" title=\"Создать на основании\" openAll=\"true\" >\r\n        <item type=\"button\" id=\"btn_message\" enabled=\"false\" text=\"Сообщение\" />\r\n    </item>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_go_to\" text=\"&lt;i class='fa fa-external-link fa-fw'&gt;&lt;/i&gt;\" title=\"Перейти\" openAll=\"true\" >\r\n        <item type=\"button\" id=\"btn_go_connection\" enabled=\"false\" text=\"Связи\" />\r\n    </item>\r\n\r\n    <item type=\"buttonSelect\"   id=\"bs_more\"  text=\"&lt;i class='fa fa-th-large fa-fw'&gt;&lt;/i&gt;\"  title=\"Дополнительно\" openAll=\"true\">\r\n        <item type=\"button\"     id=\"btn_retrieve\"    text=\"&lt;i class='fa fa-undo fa-fw'&gt;&lt;/i&gt; Отозвать\" title=\"Отозвать заказ\" />\r\n        <item type=\"separator\"  id=\"sep_export\" />\r\n        <item type=\"button\" id=\"btn_import\" text=\"&lt;i class='fa fa-upload fa-fw'&gt;&lt;/i&gt; Загрузить из файла\" />\r\n        <item type=\"button\" id=\"btn_export\" text=\"&lt;i class='fa fa-download fa-fw'&gt;&lt;/i&gt; Выгрузить в файл\" />\r\n    </item>\r\n\r\n    <item id=\"sep_close_1\" type=\"separator\"/>\r\n    <item type=\"button\" id=\"btn_close\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\" title=\"Закрыть форму\"/>\r\n    <item id=\"sep_close_2\" type=\"separator\"/>\r\n\r\n</toolbar>","toolbar_product_list.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\r\n<toolbar>\r\n    <item id=\"btn_ok\"   type=\"button\"   text=\"&lt;b&gt;Рассчитать и закрыть&lt;/b&gt;\" title=\"Рассчитать, записать и закрыть\"  />\r\n    <item id=\"sep0\" type=\"separator\"/>\r\n    <item id=\"btn_xls\"  type=\"button\"\ttext=\"Загрузить из XLS\" title=\"Загрузить список продукции из файла xls\" />\r\n\r\n    <item type=\"button\" id=\"btn_post\" enabled=\"false\" text=\"\" title=\"\" />\r\n    <item type=\"button\" id=\"btn_unpost\" enabled=\"false\" text=\"\" title=\"\" />\r\n    <item type=\"buttonSelect\" id=\"bs_print\" enabled=\"false\" text=\"\" title=\"\" openAll=\"true\">\r\n    </item>\r\n\r\n</toolbar>","tree_events.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"cat.stores\" text=\"Склады\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.divisions\" text=\"Подразделения\"><icons file=\"icon_1c_cat\" /></item>\r\n    <!--\r\n    <item id=\"doc.work_centers_performance\" select=\"1\" text=\"Мощности рабочих центров\"><icons file=\"icon_1c_doc\" /></item>\r\n    <item id=\"doc.planning_event\" text=\"Событие планирования\"><icons file=\"icon_1c_doc\" /></item>\r\n    -->\r\n</tree>\r\n","tree_filteres.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"draft\" text=\"Черновики\" select=\"1\" tooltip=\"Предварительные расчеты\"><icons file=\"fa-pencil\" /></item>\r\n    <item id=\"sent\" text=\"Отправлено\" tooltip=\"Отправленные, но еще не принятые в работу. Могут быть отозваны (переведены в 'черновики')\"><icons file=\"fa-paper-plane-o\" /></item>\r\n    <item id=\"confirmed\" text=\"Согласовано\" tooltip=\"Включены в план производства. Могут быть изменены менеджером. Недоступны для изменения дилером\"><icons file=\"fa-thumbs-o-up\" /></item>\r\n    <item id=\"declined\" text=\"Отклонено\" tooltip=\"Не приняты в работу по техническим причинам. Требуется изменение конструктива или комплектации\"><icons file=\"fa-thumbs-o-down\" /></item>\r\n    <item id=\"execution\" text=\"Долги\" tooltip=\"Оплата, отгрузка\"><icons file=\"fa-money\" /></item>\r\n    <item id=\"plan\" text=\"План\" tooltip=\"Согласованы, но еще не запущены в работу\"><icons file=\"fa-calendar-check-o\" /></item>\r\n    <item id=\"underway\" text=\"В работе\" tooltip=\"Включены в задания на производство, но еще не изготовлены\"><icons file=\"fa-industry\" /></item>\r\n    <item id=\"manufactured\" text=\"Изготовлено\" tooltip=\"Изготовлены, но еще не отгружены\"><icons file=\"fa-gavel\" /></item>\r\n    <item id=\"executed\" text=\"Исполнено\" tooltip=\"Отгружены клиенту\"><icons file=\"fa-truck\" /></item>\r\n\r\n    <item id=\"service\" text=\"Сервис\" tooltip=\"Сервисное обслуживание\"><icons file=\"fa-medkit\" /></item>\r\n    <item id=\"complaints\" text=\"Рекламации\" tooltip=\"Жалобы и рекламации\"><icons file=\"fa-frown-o\" /></item>\r\n\r\n    <item id=\"template\" text=\"Шаблоны\" tooltip=\"Типовые блоки\"><icons file=\"fa-puzzle-piece\" /></item>\r\n    <item id=\"zarchive\" text=\"Архив\" tooltip=\"Старые заказы\"><icons file=\"fa-archive\" /></item>\r\n    <item id=\"all\" text=\"Все\" tooltip=\"Отключить фильтрацию\"><icons file=\"fa-expand\" /></item>\r\n</tree>\r\n","tree_industry.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"cat.nom_kinds\" text=\"Виды номенклатуры\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.nom_groups\" text=\"Номенклатурные группы\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.nom\" text=\"Номенклатура\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.production_params\" text=\"Параметры продукции\" select=\"1\" tooltip=\"системы профилей\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.cnns\" text=\"Соединения\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.inserts\" text=\"Вставки\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.furns\" text=\"Фурнитура\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.clrs\" text=\"Цвета\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.color_price_groups\" text=\"Цвето-ценовые группы\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.params_links\" text=\"Связи параметров\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.elm_visualization\" text=\"Визуализация элементов\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.insert_bind\" text=\"Привязки вставок\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.formulas\" text=\"Формулы\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cch.properties\" text=\"Дополнительные реквизиты\"><icons file=\"icon_1c_cch\" /></item>\r\n</tree>\r\n","tree_price.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"cat.users\" text=\"Пользователи\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.individuals\" text=\"Физические лица\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.organizations\" text=\"Организации\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.partners\" text=\"Контрагенты\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.contracts\" text=\"Договоры\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.nom_prices_types\" text=\"Виды цен\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.price_groups\" text=\"Ценовые группы\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.currencies\" text=\"Валюты\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"ireg.currency_courses\" select=\"1\" text=\"Курсы валют\"><icons file=\"icon_1c_ireg\" /></item>\r\n    <item id=\"ireg.margin_coefficients\" text=\"Маржинальные коэффициенты\"><icons file=\"icon_1c_ireg\" /></item>\r\n    <item id=\"doc.nom_prices_setup\" text=\"Установка цен номенклатуры\"><icons file=\"icon_1c_doc\" /></item>\r\n    <item id=\"cch.predefined_elmnts\" text=\"Константы и списки\"><icons file=\"icon_1c_cch\" /></item>\r\n\r\n</tree>\r\n","view_about.html":"<div class=\"md_column1300\">\r\n    <h1><i class=\"fa fa-info-circle\"></i> Окнософт: Заказ дилера</h1>\r\n    <p>Заказ дилера - это веб-приложение с открытым исходным кодом, разработанное компанией <a href=\"http://www.oknosoft.ru/\" target=\"_blank\">Окнософт</a> на базе фреймворка <a href=\"http://www.oknosoft.ru/metadata/\" target=\"_blank\">Metadata.js</a><br />\r\n        Исходный код и документация доступны на <a href=\"https://github.com/oknosoft/windowbuilder\" target=\"_blank\">GitHub <i class=\"fa fa-github-alt\"></i></a>.<br />\r\n    </p>\r\n\r\n    <h3>Назначение и возможности</h3>\r\n    <ul>\r\n        <li>Построение и редактирование эскизов изделий в графическом 2D редакторе</li>\r\n        <li>Экстремальная поддержка нестандартных изделий (многоугольники, сложные перегибы профиля)</li>\r\n        <li>Расчет спецификации и координат технологических операций</li>\r\n        <li>Расчет цены и плановой себестоимости изделий по произвольным формулам с учетом индивидуальных дилерских скидок и наценок</li>\r\n        <li>Формирование печатных форм для заказчика и производства</li>\r\n        <li>Поддержка автономной работы при отсутствии доступа в Интернет и прозрачного обмена с сервером при возобновлении соединения</li>\r\n    </ul>\r\n\r\n    <p>Использованы следующие библиотеки и инструменты:</p>\r\n\r\n    <h3>Серверная часть</h3>\r\n    <ul>\r\n\t\t<li><a href=\"http://couchdb.apache.org/\" target=\"_blank\">couchDB</a>, NoSQL база данных с поддержкой master-master репликации</li>\r\n\t\t<li><a href=\"http://nginx.org/ru/\" target=\"_blank\">nginx</a>, высокопроизводительный HTTP-сервер</li>\r\n    </ul>\r\n\r\n    <h3>Управление данными в памяти браузера</h3>\r\n    <ul>\r\n\t\t<li><a href=\"http://www.oknosoft.ru/metadata/\" target=\"_blank\">metadata.js</a>, движок ссылочной типизации для браузера и Node.js</li>\r\n\t\t<li><a href=\"https://pouchdb.com/\" target=\"_blank\">pouchDB</a>, клиентская NoSQL база данных с поддержкой автономной работы и репликации с CouchDB</li>\r\n\t\t<li><a href=\"https://github.com/agershun/alasql\" target=\"_blank\">alaSQL</a>, SQL-интерфейс к массивам javascript в памяти браузера и Node.js</li>\r\n    </ul>\r\n\r\n    <h3>UI библиотеки и компоненты интерфейса</h3>\r\n    <ul>\r\n        <li><a href=\"http://paperjs.org/\" target=\"_blank\">paper.js</a>, фреймворк векторной графики для HTML5 Canvas</li>\r\n        <li><a href=\"http://dhtmlx.com/\" target=\"_blank\">dhtmlx</a>, кроссбраузерная библиотека javascript для построения современных веб и мобильных приложений</li>\r\n        <li><a href=\"https://github.com/Diokuz/baron\" target=\"_blank\">baron</a>, компонент управления полосами прокрутки</li>\r\n        <li><a href=\"https://jquery.com/\" target=\"_blank\">jQuery</a>, популярная JavaScript библиотека селекторов и событий DOM</li>\r\n        <li><a href=\"https://github.com/eligrey/FileSaver.js\" target=\"_blank\">filesaver.js</a>, HTML5 реализация метода saveAs</li>\r\n        <li><a href=\"https://github.com/SheetJS/js-xlsx\" target=\"_blank\">xlsx</a>, библиотека для чтения и записи XLSX / XLSM / XLSB / XLS / ODS в браузере</li>\r\n    </ul>\r\n\r\n    <h3>Графика</h3>\r\n    <ul>\r\n        <li><a href=\"https://fortawesome.github.io/Font-Awesome/\" target=\"_blank\">fontawesome</a>, набор шрифтовых иконок</li>\r\n    </ul>\r\n\r\n    <p>&nbsp;</p>\r\n    <h2><i class=\"fa fa-question-circle\"></i> Вопросы</h2>\r\n    <p>Если обнаружили ошибку, пожалуйста,\r\n        <a href=\"https://github.com/oknosoft/windowbuilder/issues/new\" target=\"_blank\">зарегистрируйте вопрос в GitHub</a> или\r\n        <a href=\"http://www.oknosoft.ru/metadata/#page-118\" target=\"_blank\">свяжитесь с разработчиком</a> напрямую<br /></p>\r\n    <p>&nbsp;</p>\r\n\r\n</div>","view_blank.html":"<!DOCTYPE html>\r\n<html lang=\"ru\">\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"/>\r\n    <title>Документ</title>\r\n    <style>\r\n\r\n        html {\r\n            width: 100%;\r\n            height: 100%;\r\n            margin: 0;\r\n            padding: 0;\r\n            overflow: auto;\r\n\r\n        }\r\n        body {\r\n            width: 210mm;\r\n            margin-left: auto;\r\n            margin-right: auto;\r\n            overflow: hidden;\r\n            color: rgb(48, 57, 66);\r\n            font-family: Arial, sans-serif;\r\n            font-size: 11pt;\r\n            text-rendering: optimizeLegibility;\r\n        }\r\n\r\n        /* Таблица */\r\n        table.border {\r\n            border-collapse: collapse; border: 1px solid;\r\n        }\r\n        table.border > tbody > tr > td,\r\n        table.border > tr > td,\r\n        table.border th{\r\n            border: 1px solid;\r\n        }\r\n        .noborder{\r\n            border: none;\r\n        }\r\n\r\n        /* Многоуровневый список */\r\n        ol {\r\n            counter-reset: li;\r\n            list-style: none;\r\n            padding: 0;\r\n        }\r\n        li {\r\n            margin-top: 8px;\r\n        }\r\n        li:before {\r\n            counter-increment: li;\r\n            content: counters(li,\".\") \".\";\r\n            padding-right: 8px;\r\n        }\r\n        li.flex {\r\n            display: flex;\r\n            text-align: left;\r\n            list-style-position: outside;\r\n            font-weight: normal;\r\n        }\r\n\r\n        .container {\r\n            width: 100%;\r\n            position: relative;\r\n        }\r\n\r\n        .margin-top-20 {\r\n            margin-top: 20px;\r\n        }\r\n\r\n        .column-50-percent {\r\n            width: 48%;\r\n            min-width: 40%;\r\n            float: left;\r\n            padding: 8px;\r\n        }\r\n\r\n        .column-30-percent {\r\n            width: 31%;\r\n            min-width: 30%;\r\n            float: left;\r\n            padding: 8px;\r\n        }\r\n\r\n        .block-left {\r\n            display: block;\r\n            float: left;\r\n        }\r\n\r\n        .block-center {\r\n            display: block;\r\n            margin-left: auto;\r\n            margin-right: auto;\r\n        }\r\n\r\n        .block-right {\r\n            display: block;\r\n            float: right;\r\n        }\r\n\r\n        .list-center {\r\n            text-align: center;\r\n            list-style-position: inside;\r\n            font-weight: bold;\r\n        }\r\n\r\n        .clear-both {\r\n            clear: both;\r\n        }\r\n\r\n        .small {\r\n            font-size: small;\r\n        }\r\n\r\n        .text-center {\r\n            text-align: center;\r\n        }\r\n\r\n        .text-justify {\r\n            text-align: justify;\r\n        }\r\n\r\n        .text-right {\r\n            text-align: right;\r\n        }\r\n\r\n        .muted-color {\r\n            color: #636773;\r\n        }\r\n\r\n        .accent-color {\r\n            color: #f30000;\r\n        }\r\n\r\n        .note {\r\n            background: #eaf3f8;\r\n            color: #2980b9;\r\n            font-style: italic;\r\n            padding: 12px 20px;\r\n        }\r\n\r\n        .note:before {\r\n            content: 'Замечание: ';\r\n            font-weight: 500;\r\n        }\r\n        *, *:before, *:after {\r\n            box-sizing: inherit;\r\n        }\r\n\r\n    </style>\r\n</head>\r\n<body>\r\n\r\n</body>\r\n</html>","view_settings.html":"<div class=\"md_column1300\">\r\n\r\n    <div class=\"md_column320\" name=\"form1\" style=\"max-width: 400px;\"><div></div></div>\r\n\r\n    <div class=\"md_column320\" name=\"form2\" style=\"max-width: 400px;\"><div></div></div>\r\n\r\n</div>"});
/**
 * ### Модификаторы обработки _builder_pen_
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 13.05.2016
 * 
 * @module dp_builder_pen
 */

$p.dp.builder_pen.on({

	value_change: function(attr){
		if(attr.field == "elm_type") {
			this.inset = paper.project.default_inset({elm_type: this.elm_type});
			this.rama_impost = paper.project._dp.sys.inserts([this.elm_type]);
		}
	}
});

$p.dp.builder_lay_impost.on({

	value_change: function(attr){
		if(attr.field == "elm_type") {
			this.inset_by_y = paper.project.default_inset({
				elm_type: this.elm_type,
				pos: $p.enm.positions.ЦентрГоризонталь
			});
			this.inset_by_x = paper.project.default_inset({
				elm_type: this.elm_type,
				pos: $p.enm.positions.ЦентрВертикаль
			});
			this.rama_impost = paper.project._dp.sys.inserts([this.elm_type]);
		}
	}
});
/**
 * ### Модификаторы обработки _Заказ покупателя_
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 13.05.2016
 * 
 * @module dp_buyers_order
 */


$p.dp.buyers_order.__define({

	unload_obj: {
		value: function () {

		}
	},

	/**
	 * форма ДобавитьСписокПродукции. публикуемый метод: $p.dp.buyers_order.form_product_list(o, pwnd, attr)
	 * @param pwnd
	 * @param attr
	 */
	form_product_list: {
		value: function (pwnd, callback) {

			var o = this.create(),
				wnd,
				attr = {

					// командная панель формы
					toolbar_struct: $p.injected_data["toolbar_product_list.xml"],

					// переопределяем обработчики кнопок командной панели формы
					toolbar_click: function (btn_id) {
						if(btn_id == "btn_ok"){
							o._data._modified = false;
							wnd.close();
							callback(o.production);
						}
					},

					// переопределяем метод отрисовки шапки документа, т.к. мы хотим разместить табчасть на первой странице без закладок
					draw_pg_header: function (o, wnd) {
						wnd.elmnts.tabs.tab_header.hide();
						wnd.elmnts.frm_tabs.tabsArea.classList.add("tabs_hidden");
						wnd.elmnts.frm_toolbar.hideItem("bs_print");
					}
				};

			// переопределяем метод отрисовки табличных частей, т.к. мы хотим разместить табчасть на первой странице без закладок
			// attr.draw_tabular_sections = function (o, wnd, tabular_init) {
			//
			// };


			o.presentation = "Добавление продукции с параметрами";

			o.form_obj(pwnd, attr)
				.then(function (res) {
					wnd = res.wnd
				});

		}
	}
});

// переопределяем свойства цвет и система - они будут псевдонимами свойств текущей характеристики
delete $p.DpBuyers_order.prototype.clr;
delete $p.DpBuyers_order.prototype.sys;
$p.DpBuyers_order.prototype.__define({

	clr: {
		get: function () {
			return this.characteristic.clr;
		},
		set: function (v) {

			if(this.characteristic.clr == v)
				return;

			Object.getNotifier(this).notify({
				type: 'update',
				name: 'clr',
				oldValue: this.characteristic.clr
			});
			this.characteristic.clr = v;
			this._data._modified = true;
		}
	},

	sys: {
		get: function () {
			return this.characteristic.sys;
		},
		set: function (v) {

			if(this.characteristic.sys == v)
				return;

			Object.getNotifier(this).notify({
				type: 'update',
				name: 'sys',
				oldValue: this.characteristic.sys
			});
			this.characteristic.sys = v;
			this._data._modified = true;
		}
	}
});

/**
 * ### Модуль объекта справочника ХарактеристикиНоменклатуры
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cat_characteristics
 * Created 16.03.2016
 */

// при старте приложения
$p.on({

	// загружаем в ОЗУ обычные характеристики (без ссылок на заказы)
	predefined_elmnts_inited: function common_characteristics() {
		$p.off(common_characteristics);
		return $p.cat.characteristics.pouch_load_view("doc/nom_characteristics");
	}
});

// подписки на события
$p.cat.characteristics.on({

	// перед записью надо пересчитать наименование и рассчитать итоги
	before_save: function (attr) {

		// уточняем номенклатуру системы
		var nom = this.prod_nom;

		// пересчитываем наименование
		var name = this.prod_name();
		if(name)
			this.name = name;

		// дублируем контрагента для целей RLS
		this.partner = this.calc_order.partner;

	}
});

// свойства объекта характеристики
$p.CatCharacteristics.prototype.__define({

	calc_order_row: {
		get: function () {
			var _calc_order_row;
			this.calc_order.production.find_rows({characteristic: this}, function (_row) {
				_calc_order_row = _row;
				return false;
			});
			return _calc_order_row;
		},
		enumerable: false
	},

	prod_name: {
		value: function (short) {

			var _row = this.calc_order_row,
				name = "";

			if(_row){

				if(this.calc_order.number_internal)
					name = this.calc_order.number_internal.trim();

				else{
					// убираем нули из середины номера
					var num0 = this.calc_order.number_doc,
						part = "";
					for(var i = 0; i<num0.length; i++){
						if(isNaN(parseInt(num0[i])))
							name += num0[i];
						else
							break;
					}
					for(var i = num0.length-1; i>0; i--){
						if(isNaN(parseInt(num0[i])))
							break;
						part = num0[i] + part;
					}
					name += parseInt(part || 0).toFixed(0);
				}

				name += "/" + _row.row.pad();

				// добавляем название системы
				if(!this.sys.empty())
					name += "/" + this.sys.name;

				if(!short){

					// добавляем название цвета
					if(this.clr.name)
						name += "/" + this.clr.name;

					// добавляем размеры
					if(this.x && this.y)
						name += "/" + this.x.toFixed(0) + "x" + this.y.toFixed(0);
					else if(this.x)
						name += "/" + this.x.toFixed(0);
					else if(this.y)
						name += "/" + this.y.toFixed(0);

					if(this.z){
						if(this.x || this.y)
							name += "x" + this.z.toFixed(0);
						else
							name += "/" + this.z.toFixed(0);
					}

					if(this.s)
						name += "/S:" + this.s.toFixed(3);
				}
			}
			return name;
		}
	},

	/**
	 * Возвращает номенклатуру продукции по системе
	 */
	prod_nom: {

		get: function () {

			if(!this.sys.empty()){

				var setted,
					param = this.params;

				if(this.sys.production.count() == 1){
					this.owner = this.sys.production.get(0).nom;

				}else if(this.sys.production.count() > 1){
					this.sys.production.each(function (row) {

						if(setted)
							return false;

						if(row.param && !row.param.empty()){
							param.find_rows({cnstr: 0, param: row.param, value: row.value}, function () {
								setted = true;
								param._owner.owner = row.nom;
								return false;
							});
						}

					});
					if(!setted){
						this.sys.production.find_rows({param: $p.utils.blank.guid}, function (row) {
							setted = true;
							param._owner.owner = row.nom;
							return false;
						});
					}
					if(!setted){
						this.owner = this.sys.production.get(0).nom;
					}
				}
			}

			return this.owner;
		}

	}
});



/**
 * ### Форма выбора типового блока
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cat_characteristics_form_selection_block
 * Created 23.12.2015
 */

(function($p){

	var _mgr = $p.cat.characteristics,
		_meta = $p.cat.characteristics.metadata()._clone(),
		selection_block, wnd;

	// попробуем подсунуть типовой форме выбора виртуальные метаданные - с деревом и ограниченным списком значений
	_mgr.form_selection_block = function(pwnd, attr){

		if(!attr)
			attr = {};

		if(!selection_block){

			selection_block = {
				_obj: {
					_calc_order: $p.utils.blank.guid
				}
			};

			_meta.form = {
				selection: {
					fields: ["presentation","svg"],
					cols: [
						{"id": "presentation", "width": "320", "type": "ro", "align": "left", "sort": "na", "caption": "Наименование"},
						{"id": "svg", "width": "*", "type": "rsvg", "align": "left", "sort": "na", "caption": "Эскиз"}
					]
				}
			};

			selection_block.__define({

				// виртуальные метаданные для поля фильтра по заказу
				_metadata: {
					get : function(){

						// возвращаем типовые метаданные зарактеристики, но могли бы вернуть изменённый клон
						//var calc_order = $p.cat.characteristics.metadata().fields.calc_order._clone();
						// calc_order.choice_links = [{
						// 	name: ["selection",	"s"],
						// 	path: [
						// 		function(o, f){
						//
						// 			if($p.utils.is_data_obj(o)){
						// 				return o.s > 0;
						//
						// 			}else{
						// 				var refs = "";
						// 				t.project._dp.sys.elmnts.find_rows(selection, function (row) {
						// 					if(refs)
						// 						refs += ", ";
						// 					refs += "'" + row.nom.ref + "'";
						// 				});
						// 				return "_t_.ref in (" + refs + ")";
						// 			}
						// 		}]}
						// ];

						return {
							fields: {
								calc_order: _meta.fields.calc_order
							}
						};
					}
				},

				// виртуальный датаменеджер для поля фильтра по заказу
				_manager: {
					get: function () {
						return {
							class_name: "dp.fake"
						};
					}
				},

				calc_order: {
					get: function () {
						return $p.CatCharacteristics.prototype._getter.call(this, "calc_order");
					},

					set: function (v) {
						if(this._obj.calc_order == v)
							return;
						$p.CatCharacteristics.prototype.__setter.call(this, "calc_order", v);

						if(wnd && wnd.elmnts && wnd.elmnts.filter && wnd.elmnts.grid && wnd.elmnts.grid.getColumnCount())
							wnd.elmnts.filter.call_event();

						if(!$p.utils.is_empty_guid(this._obj.calc_order) &&
							$p.wsql.get_user_param("template_block_calc_order") != this._obj.calc_order){
							$p.wsql.set_user_param("template_block_calc_order", this._obj.calc_order);
						}
					}
				}
			});
		}

		// объект отбора по ссылке на расчет в продукции
		if(selection_block.calc_order.empty()){
			selection_block.calc_order = $p.wsql.get_user_param("template_block_calc_order");
		}
		if($p.job_prm.builder.base_block && (selection_block.calc_order.empty() || selection_block.calc_order.is_new())){
			$p.job_prm.builder.base_block.some(function (o) {
				selection_block.calc_order = o;
				$p.wsql.set_user_param("template_block_calc_order", selection_block.calc_order.ref);
				return true;
			});
		}

		// начальное значение - выбранные в предыдущий раз типовой блок
		attr.initial_value = $p.wsql.get_user_param("template_block_initial_value");

		// подсовываем типовой форме списка изменённые метаданные
		attr.metadata = _meta;

		// и еще, подсовываем форме собственный обработчик получения данных
		attr.custom_selection = function (attr) {
			var ares = [], crefs = [], calc_order;

			// получаем ссылку на расчет из отбора
			attr.selection.some(function (o) {
				if(Object.keys(o).indexOf("calc_order") != -1){
					calc_order = o.calc_order;
					return true;
				}
			});

			// получаем документ расчет
			return $p.doc.calc_order.get(calc_order, true, true)
				.then(function (o) {

					// получаем массив ссылок на характеристики в табчасти продукции
					o.production.each(function (row) {
						if(!row.characteristic.empty()){
							if(row.characteristic.is_new())
								crefs.push(row.characteristic.ref);

							else{
								// если это характеристика продукции - добавляем
								if(!row.characteristic.calc_order.empty() && row.characteristic.coordinates.count()){
									if(row.characteristic._attachments &&
										row.characteristic._attachments.svg &&
										!row.characteristic._attachments.svg.stub)
										ares.push(row.characteristic);
									else
										crefs.push(row.characteristic.ref);
								}
							}
						}
					});
					return crefs.length ? _mgr.pouch_load_array(crefs, true) : crefs;
				})
				.then(function () {

					// если это характеристика продукции - добавляем
					crefs.forEach(function (o) {
						o = _mgr.get(o, false, true);
						if(o && !o.calc_order.empty() && o.coordinates.count()){
							ares.push(o);
						}
					});

					// фильтруем по подстроке
					crefs.length = 0;
					ares.forEach(function (o) {
						var presentation = (o.calc_order_row.note || o.note || o.name) + "&lt;br /&gt;" + o.owner.name;
						if(!attr.filter || presentation.indexOf(attr.filter) != -1)
							crefs.push({
								ref: o.ref,
								presentation: presentation,
								svg: o._attachments ? o._attachments.svg : ""
							});
					});

					// догружаем изображения
					ares.length = 0;
					crefs.forEach(function (o) {
						if(o.svg && o.svg.data){
							ares.push($p.utils.blob_as_text(o.svg.data)
								.then(function (svg) {
									o.svg = svg;
								}))
						}
					});
					return Promise.all(ares);

				})
				.then(function () {
					// конвертируем в xml для вставки в грид
					return $p.iface.data_to_grid.call(_mgr, crefs, attr);
				});

		};

		// создаём форму списка
		wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

		wnd.elmnts.toolbar.hideItem("btn_new");
		wnd.elmnts.toolbar.hideItem("btn_edit");
		wnd.elmnts.toolbar.hideItem("btn_delete");

		// добавляем элемент управления фильтра по расчету
		wnd.elmnts.filter.add_filter({
			text: "Расчет",
			name: "calc_order"
		});
		var fdiv = wnd.elmnts.filter.custom_selection.calc_order.parentNode;
		fdiv.removeChild(fdiv.firstChild);

		wnd.elmnts.filter.custom_selection.calc_order = new $p.iface.OCombo({
			parent: fdiv,
			obj: selection_block,
			field: "calc_order",
			width: 220,
			get_option_list: function (val, selection) {

				var l = [];

				$p.job_prm.builder.base_block.forEach(function (o) {
					l.push({text: o.note || o.presentation, value: o.ref});
				});

				return Promise.resolve(l);
			}
		});
		wnd.elmnts.filter.custom_selection.calc_order.getBase().style.border = "none";

		return wnd;
	};

})($p);
/**
 * ### Дополнительные методы справочника Цвета
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cat_cnns
 * Created 23.12.2015
 */

$p.cat.clrs.__define({

	/**
	 * ПолучитьЦветПоПредопределенномуЦвету
	 * @param clr
	 * @param clr_elm
	 * @param clr_sch
	 * @return {*}
	 */
	by_predefined: {
		value: function(clr, clr_elm, clr_sch){
			if(clr.predefined_name){
				return clr_elm;
			}else if(clr.empty())
				return clr_elm;
			else
				return clr;
		}
	},

	/**
	 * Дополняет связи параметров выбора отбором, исключающим служебные цвета
	 * @param mf {Object} - описание метаданных поля
	 */
	selection_exclude_service: {
		value: function (mf, sys) {

			if(!mf.choice_params)
				mf.choice_params = [];

			if(mf.choice_params.some(function (ch) {
					if(ch.name == "parent")
						return true;
				}))
				return;

			mf.choice_params.push({
				name: "parent",
				path: {not: $p.cat.clrs.predefined("СЛУЖЕБНЫЕ")}
			});
		}
	},

	/**
	 * Форма выбора с фильтром по двум цветам, создающая при необходимости составной цвет
	 */
	form_selection: {
		value: function (pwnd, attr) {

			attr.hide_filter = true;

			var wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr),
				toolbar = wnd.elmnts.filter,
				eclr = this.get($p.utils.blank.guid, false, true);

			function get_option_list(val, selection) {

				selection.clr_in = $p.utils.blank.guid;
				selection.clr_out = $p.utils.blank.guid;
				
				return this.constructor.prototype.get_option_list.call(this, val, selection);
			}

			toolbar.__define({
				get_filter: {
					value: function () {
						var res = {
							selection: []
						};
						if(clr_in.getSelectedValue())
							res.selection.push({clr_in: clr_in.getSelectedValue()});
						if(clr_out.getSelectedValue())
							res.selection.push({clr_out: clr_out.getSelectedValue()});
						if(res.selection.length)
							res.hide_tree = true;
						return res;
					}
				}
			});

			wnd.attachEvent("onClose", function(){

				clr_in.unload();
				clr_out.unload();

				return true;
			});

			Object.unobserve(eclr);

			// Создаём элементы управления
			var clr_in = new $p.iface.OCombo({
				parent: toolbar.div.obj,
				obj: eclr,
				field: "clr_in",
				width: 150,
				hide_frm: true,
				get_option_list: get_option_list
			}), clr_out = new $p.iface.OCombo({
				parent: toolbar.div.obj,
				obj: eclr,
				field: "clr_out",
				width: 150,
				hide_frm: true,
				get_option_list: get_option_list
			});

			clr_in.DOMelem.style.float = "left";
			clr_in.DOMelem_input.placeholder = "Цвет изнутри";
			clr_out.DOMelem_input.placeholder = "Цвет снаружи";

			clr_in.attachEvent("onChange", toolbar.call_event);
			clr_out.attachEvent("onChange", toolbar.call_event);
			clr_in.attachEvent("onBlur", toolbar.call_event);
			clr_out.attachEvent("onBlur", toolbar.call_event);

			return wnd;
		}
	}
});


/**
 * ### Дополнительные методы справочника _Соединения_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cat_cnns
 * Created 23.12.2015
 */

(function($p){

	var _mgr = $p.cat.cnns,
		_nomcache = {};

	_mgr.sql_selection_list_flds = function(initial_value){
		return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as cnn_type," +
			" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_cnns AS _t_" +
			" left outer join enm_cnn_types as _k_ on _k_.ref = _t_.cnn_type %3 %4 LIMIT 300";
	};


	/**
	 * Возвращает массив соединений, доступный для сочетания номенклатур.
	 * Для соединений с заполнениями учитывается толщина. Контроль остальных геометрических особенностей выполняется на стороне рисовалки
	 * @param nom1 {_cat.nom|BuilderElement}
	 * @param nom2 {_cat.nom|BuilderElement}
	 * @param [cnn_types] {_enm.cnns|Array.<_enm.cnns>}
	 * @return {Array}
	 */
	_mgr.nom_cnn = function(nom1, nom2, cnn_types){

		// если второй элемент вертикальный - меняем местами эл 1-2 при поиске
		if(nom1 instanceof $p.Editor.Profile &&
			nom2 instanceof $p.Editor.Profile &&
			cnn_types && cnn_types.indexOf($p.enm.cnn_types.УгловоеДиагональное) != -1 &&
			nom1.orientation != $p.enm.orientations.Вертикальная &&
			nom2.orientation == $p.enm.orientations.Вертикальная ){

			return _mgr.nom_cnn(nom2, nom1, cnn_types);
		}


		var onom1, onom2,
			is_i = false, art1glass = false, art2glass = false,
			a1, a2, ref1,
			thickness1, thickness2;

		if(nom1 instanceof $p.Editor.BuilderElement){
			onom1 = nom1.nom;

		}else if($p.utils.is_data_obj(nom1)){
			onom1 = nom1;

		}else{
			onom1 = $p.cat.nom.get(nom1);

		}

		if(!onom1 || onom1.empty())
			ref1 = nom1.ref;
		else
			ref1 = onom1.ref;


		if(!nom2 || ($p.utils.is_data_obj(nom2) && nom2.empty())){
			is_i = true;
			onom2 = nom2 = $p.cat.nom.get();

		}else{

			if(nom2 instanceof $p.Editor.BuilderElement){
				onom2 = nom2.nom;

			}else if($p.utils.is_data_obj(nom2)){
				onom2 = nom2;

			}else{
				onom2 = $p.cat.nom.get(nom2);

			}
		}

		if(!is_i){
			if(nom1 instanceof $p.Editor.Filling){
				art1glass = true;
				thickness1 = nom1.thickness;

			}else if(nom2 instanceof $p.Editor.Filling){
				art2glass = true;
				thickness2 = nom2.thickness;
			}

		}

		if(!_nomcache[ref1])
			_nomcache[ref1] = {};
		a1 = _nomcache[ref1];
		if(!a1[onom2.ref]){
			a2 = (a1[onom2.ref] = []);
			// для всех элементов справочника соединения
			_mgr.each(function(оCnn){
				// если в строках соединяемых элементов есть наша - добавляем
				var is_nom1 = art1glass ? (оCnn.art1glass && thickness1 >= Number(оCnn.tmin) && thickness1 <= Number(оCnn.tmax)) : false,
					is_nom2 = art2glass ? (оCnn.art2glass && thickness2 >= Number(оCnn.tmin) && thickness2 <= Number(оCnn.tmax)) : false;

				оCnn.cnn_elmnts.each(function(row){
					if(is_nom1 && is_nom2)
						return false;
					is_nom1 = is_nom1 || $p.utils.is_equal(row.nom1, onom1);
					is_nom2 = is_nom2 || $p.utils.is_equal(row.nom2, onom2);
				});
				if(is_nom1 && is_nom2){
					a2.push(оCnn);
				}
			});
		}

		if(cnn_types){
			var tmp = a1[onom2.ref], res = [], types;

			if(Array.isArray(cnn_types))
				types = cnn_types;
			else if($p.enm.cnn_types.acn.a.indexOf(cnn_types) != -1)
				types = $p.enm.cnn_types.acn.a;
			else
				types = [cnn_types];

			tmp.forEach(function (c) {
				if(types.indexOf(c.cnn_type) != -1)
					res.push(c);
			});
			return res;
		}

		return a1[onom2.ref];
	};

	/**
	 * Возвращает соединение между элементами
	 * @param elm1
	 * @param elm2
	 * @param [cnn_types] {Array}
	 * @param [curr_cnn] {_cat.cnns}
	 */
	_mgr.elm_cnn = function(elm1, elm2, cnn_types, curr_cnn){

		if(curr_cnn && cnn_types && (cnn_types.indexOf(curr_cnn.cnn_type)!=-1)){
			// если установленное ранее соединение проходит по типу, нового не ищем
			// TODO: проверить геометрию
			return curr_cnn;
		}

		var cnns = _mgr.nom_cnn(elm1, elm2, cnn_types);

		// для примера подставляем первое попавшееся соединение
		if(cnns.length)
			return cnns[0];
		else{
			// TODO: возможно, надо вернуть соединение с пустотой
		}
	};

})($p);

// публичные методы объекта
$p.CatCnns.prototype.__define({

	/**
	 * Возвращает основную строку спецификации соединения между элементами
	 */
	main_row: {
		value: function (elm) {

			var ares, nom = elm.nom;

			// если тип соединения угловой, то арт-1-2 определяем по ориентации элемента
			if($p.enm.cnn_types.acn.a.indexOf(this.cnn_type) != -1){

				var art12 = elm.orientation == $p.enm.orientations.Вертикальная ? $p.job_prm.nom.art1 : $p.job_prm.nom.art2;

				ares = this.specification.find_rows({nom: art12});
				if(ares.length)
					return ares[0]._row;
			}

			// в прочих случаях, принадлежность к арт-1-2 определяем по табчасти СоединяемыеЭлементы
			if(this.cnn_elmnts.find_rows({nom1: nom}).length){
				ares = this.specification.find_rows({nom: $p.job_prm.nom.art1});
				if(ares.length)
					return ares[0]._row;
			}
			if(this.cnn_elmnts.find_rows({nom2: nom}).length){
				ares = this.specification.find_rows({nom: $p.job_prm.nom.art2});
				if(ares.length)
					return ares[0]._row;
			}
			ares = this.specification.find_rows({nom: nom});
			if(ares.length)
				return ares[0]._row;

		}
	},

	/**
	 * Проверяет, есть ли nom в колонке nom2 соединяемых элементов
	 */
	check_nom2: {
		value: function (nom) {
			var ref = $p.utils.is_data_obj(nom) ? nom.ref : nom;
			return this.cnn_elmnts._obj.some(function (row) {
				return row.nom == ref;
			})
		}
	}

});

/**
 * ### Дополнительные методы справочника _Договоры контрагентов_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cat_contracts
 * Created 23.12.2015
 */

$p.cat.contracts.__define({

	sql_selection_list_flds: {
		value: function(initial_value){
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as contract_kind, _m_.synonym as mutual_settlements, _o_.name as organization, _p_.name as partner," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_contracts AS _t_" +
				" left outer join cat_organizations as _o_ on _o_.ref = _t_.organization" +
				" left outer join cat_partners as _p_ on _p_.ref = _t_.owner" +
				" left outer join enm_mutual_contract_settlements as _m_ on _m_.ref = _t_.mutual_settlements" +
				" left outer join enm_contract_kinds as _k_ on _k_.ref = _t_.contract_kind %3 %4 LIMIT 300";
		}
	},

	by_partner_and_org: {
		value: function (partner, organization, contract_kind) {
			if(!contract_kind)
				contract_kind = $p.enm.contract_kinds.СПокупателем;
			var res = this.find_rows({owner: partner, organization: organization, contract_kind: contract_kind});
			res.sort(function (a, b) {
				return a.date > b.date;
			});
			return res.length ? res[0] : _mgr.get();
		}
	}


});

// перед записью, устанавливаем код, родителя и наименование
// _mgr.on("before_save", function (attr) {
//
//
//
// });

/**
 * ### Дополнительные методы справочника Визуализация элементов
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 08.04.2016
 * 
 * @module cat_elm_visualization
 */

// публичные методы объекта
$p.CatElm_visualization.prototype.__define({

	draw: {
		value: function (elm, layer, offset) {

			var subpath;

			if(this.svg_path.indexOf('{"method":') == 0){

				if(!layer._by_spec)
					layer._by_spec = new paper.Group({ parent: l_vis });

				var attr = JSON.parse(this.svg_path);

				if(attr.method == "subpath_outer"){

					subpath = elm.rays.outer.get_subpath(elm.corns(1), elm.corns(2)).equidistant(attr.offset || 10);

					subpath.parent = layer._by_spec;
					subpath.strokeWidth = attr.strokeWidth || 4;
					subpath.strokeColor = attr.strokeColor || 'red';
					subpath.strokeCap = attr.strokeCap || 'round';
					if(attr.dashArray)
						subpath.dashArray = attr.dashArray

				}

			}else if(this.svg_path){

				subpath = new paper.CompoundPath({
					pathData: this.svg_path,
					parent: layer._by_spec,
					strokeColor: 'black',
					fillColor: 'white',
					strokeScaling: false,
					pivot: [0, 0],
					opacity: elm.opacity
				});

				// угол касательной
				var angle_hor;
				if(elm.is_linear() || offset < 0)
					angle_hor = elm.generatrix.getTangentAt(0).angle;
				else if(offset > elm.generatrix.length)
					angle_hor = elm.generatrix.getTangentAt(elm.generatrix.length).angle;
				else
					angle_hor = elm.generatrix.getTangentAt(offset).angle;

				if((this.rotate != -1 || elm.orientation == $p.enm.orientations.Горизонтальная) && angle_hor != this.angle_hor){
					subpath.rotation = angle_hor - this.angle_hor;
				}

				offset += elm.generatrix.getOffsetOf(elm.generatrix.getNearestPoint(elm.corns(1)));

				var p0 = elm.generatrix.getPointAt(offset > elm.generatrix.length ? elm.generatrix.length : offset || 0);
				if(this.elm_side == -1){
					// в середине элемента
					var p1 = elm.rays.inner.getNearestPoint(p0),
						p2 = elm.rays.outer.getNearestPoint(p0);

					subpath.position = p1.add(p2).divide(2);

				}else if(!this.elm_side){
					// изнутри
					subpath.position = elm.rays.inner.getNearestPoint(p0);

				}else{
					// снаружи
					subpath.position = elm.rays.outer.getNearestPoint(p0);
				}




			}

		}
	}

});
/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 17.04.2016
 *
 * @module cat_formulas
 *
 */

$p.on({

	pouch_load_data_loaded: function cat_formulas_data_loaded () {

		$p.off(cat_formulas_data_loaded);

		// читаем элементы из pouchdb и создаём формулы
		$p.cat.formulas.pouch_find_rows({ _top: 500, _skip: 0 })
			.then(function (rows) {

				rows.forEach(function (row) {

					// формируем списки печатных форм и внешних обработок
					if(row.parent == $p.cat.formulas.predefined("printing_plates")){
						row.params.find_rows({param: "destination"}, function (dest) {
							var dmgr = $p.md.mgr_by_class_name(dest.value);
							if(dmgr){
								if(!dmgr._printing_plates)
									dmgr._printing_plates = {};
								dmgr._printing_plates["prn_" + row.id] = row;
							}
						})
					}
				});

			});

	}
});

$p.CatFormulas.prototype.__define({

	execute: {
		value: function (obj) {

			// создаём функцию из текста формулы
			if(!this._data._formula && this.formula)
				this._data._formula = (new Function("obj", this.formula)).bind(this);

			if(this.parent == $p.cat.formulas.predefined("printing_plates")){

				// создаём blob из шаблона пустой страницы
				if(!($p.injected_data['view_blank.html'] instanceof Blob))
					$p.injected_data['view_blank.html'] = new Blob([$p.injected_data['view_blank.html']], {type: 'text/html'});

				// получаем HTMLDivElement с отчетом
				return this._data._formula(obj)

				// показываем отчет в отдельном окне
					.then(function (doc) {

						if(doc && doc.content instanceof HTMLElement){

							var url = window.URL.createObjectURL($p.injected_data['view_blank.html']),
								wnd_print = window.open(
									url, "wnd_print", "fullscreen,menubar=no,toolbar=no,location=no,status=no,directories=no,resizable=yes,scrollbars=yes");

							if (wnd_print.outerWidth < screen.availWidth || wnd_print.outerHeight < screen.availHeight){
								wnd_print.moveTo(0,0);
								wnd_print.resizeTo(screen.availWidth, screen.availHeight);
							}

							wnd_print.onload = function(e) {
								window.URL.revokeObjectURL(url);
								wnd_print.document.body.appendChild(doc.content);

								if(doc.title)
									wnd_print.document.title = doc.title;

								wnd_print.print();
							};

							return wnd_print;
						}

					});

			}else
				return this._data._formula(obj)


		}
	},

	_template: {
		get: function () {
			if(!this._data._template)
				this._data._template = new $p.SpreadsheetDocument(this.template);

			return this._data._template;
		}
	}
});
/**
 * Дополнительные методы справочника Фурнитура
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_furns
 */

$p.cat.furns.__define({

	sql_selection_list_flds: {
		value: function(initial_value){
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.parent, case when _t_.is_folder then '' else _t_.id end as id, _t_.name as presentation, _k_.synonym as open_type, \
					 case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_furns AS _t_ \
					 left outer join enm_open_types as _k_ on _k_.ref = _t_.open_type %3 %4 LIMIT 300";
		}
	}
});

$p.CatFurns.prototype.__define({

	/**
	 * Перезаполняет табчасть параметров указанного контура
	 */
	refill_prm: {
		value: function (contour) {

			var osys = contour.project._dp.sys,
				fprms = contour.project.ox.params,
				prm_direction = $p.job_prm.properties.direction;

			// формируем массив требуемых параметров по задействованным в contour.furn.furn_set
			var aprm = contour.furn.furn_set.add_furn_prm();

			// дозаполняем и приклеиваем значения по умолчанию
			var prm_row, forcibly;
			aprm.forEach(function(v){

				// направления в табчасть не добавляем
				if(v == prm_direction)
					return;

				prm_row = null;
				forcibly = true;
				fprms.find_rows({param: v, cnstr: contour.cnstr}, function (row) {
					prm_row = row;
					return forcibly = false;
				});
				if(!prm_row)
					prm_row = fprms.add({param: v, cnstr: contour.cnstr}, true);

				osys.furn_params.each(function(row){
					if(row.param == prm_row.param){
						if(row.forcibly || forcibly)
							prm_row.value = row.value;
						prm_row.hide = row.hide;
						return false;
					}
				});
			});

			// удаляем лишние строки
			var adel = [];
			fprms.find_rows({cnstr: contour.cnstr}, function (row) {
				if(aprm.indexOf(row.param) == -1)
					adel.push(row);
			});
			adel.forEach(function (row) {
				fprms.del(row, true);
			});


		},
		enumerable: false
	},

	add_furn_prm: {
		value: function (aprm, afurn_set) {

			if(!aprm)
				aprm = [];

			if(!afurn_set)
				afurn_set = [];

			// если параметры этого набора уже обработаны - пропускаем
			if(afurn_set.indexOf(this.ref)!=-1)
				return;

			afurn_set.push(this.ref);

			this.selection_params.each(function(row){
				if(aprm.indexOf(row.param)==-1)
					aprm.push(row.param);
			});

			this.specification.each(function(row){
				if(row.nom_set && row.nom_set._manager === $p.cat.furns)
					row.nom_set.add_furn_prm(aprm, afurn_set);
			});

			return aprm;

		},
		enumerable: false
	}

});
/**
 * Дополнительные методы справочника Вставки
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_inserts
 */

$p.cat.inserts.__define({

	_inserts_types_filling: {
		value: [
			$p.enm.inserts_types.Стеклопакет,
			$p.enm.inserts_types.Заполнение,
			$p.enm.inserts_types.ТиповойСтеклопакет
		]
	},

	by_thickness: {
		value: function (min, max) {

			if(!this._by_thickness){
				this._by_thickness = {};
				this.find_rows({insert_type: {in: this._inserts_types_filling}}, function (ins) {
					if(ins.thickness > 0){
						if(!this._by_thickness[ins.thickness])
							this._by_thickness[ins.thickness] = [];
						this._by_thickness[ins.thickness].push(ins);
					}
				}.bind(this));
			}

			var res = [];
			for(var thickness in this._by_thickness){
				if(parseFloat(thickness) >= min && parseFloat(thickness) <= max)
					Array.prototype.push.apply(res, this._by_thickness[thickness]);
			}
			return res;

		}
	}

});

$p.CatInserts.prototype.__define({

	/**
	 * Возвращает номенклатуру вставки в завсисмости от свойств элемента
	 */
	nom: {
		value: function (elm) {

			var main_rows = [], _nom;

			this.specification.find_rows({is_main_elm: true}, function (row) {
				main_rows.push(row);
			});

			if(!this._cache)
				this._cache = {};

			if(this._cache.nom)
				return this._cache.nom;

			if(!main_rows.length && this.specification.count())
				main_rows.push(this.specification.get(0));

			if(main_rows.length && main_rows[0].nom instanceof $p.CatInserts)
				_nom = main_rows[0].nom.nom();

			else if(main_rows.length)
				_nom = main_rows[0].nom;

			else
				_nom = $p.cat.nom.get();

			if(main_rows.length < 2)
				this._cache.nom = _nom;

			return _nom;

		}
	},

	/**
	 * Возвращает толщину вставки
	 */
	thickness: {
		get: function () {

			if(!this._cache)
				this._cache = {};

			var _cache = this._cache;

			if(!_cache.hasOwnProperty("thickness")){
				_cache.thickness = 0;
				if(this.insert_type == $p.enm.inserts_types.ТиповойСтеклопакет || this.insert_type == $p.enm.inserts_types.Стеклопакет){

					if(this.insert_glass_type == $p.enm.inserts_glass_types.Рамка)
						_cache.thickness += this.nom().thickness;

					else if(this.insert_glass_type == $p.enm.inserts_glass_types.Стекло)
						this.specification.each(function (row) {
							_cache.thickness += row.nom.thickness;
						});
				}else
					_cache.thickness = this.nom().thickness;
			}

			return _cache.thickness;

		}
	}

});


/**
 * Дополнительные методы справочника Номенклатура
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cat_nom
 * Created 23.12.2015
 */

// определяем модификаторы
$p.cat.nom.__define({

	sql_selection_list_flds: {
		value: function(initial_value){
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.article, _t_.name as presentation, _u_.name as nom_unit, _k_.name as nom_kind, _t_.thickness," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_nom AS _t_" +
				" left outer join cat_units as _u_ on _u_.ref = _t_.base_unit" +
				" left outer join cat_nom_kinds as _k_ on _k_.ref = _t_.nom_kind %3 %4 LIMIT 300";
		}
	},

	sql_selection_where_flds: {
		value: function(filter){
			return " OR _t_.article LIKE '" + filter + "' OR _t_.id LIKE '" + filter + "' OR _t_.name LIKE '" + filter + "'";
		}
	}
});

// методы ценообразования в прототип номенклатуры
$p.CatNom.prototype.__define({

	/**
	 * Возвращает цену номенклатуры указанного типа
	 * - на дату
	 * - с подбором характеристики по цвету
	 * - с пересчетом из валюты в валюту
	 */
	_price: {
		value: function (attr) {

			if(!attr)
				attr = {};

			if(!attr.price_type)
				attr.price_type = $p.job_prm.pricing.price_type_sale;
			else if($p.utils.is_data_obj(attr.price_type))
				attr.price_type = attr.price_type.ref;

			if(!attr.characteristic)
				attr.characteristic = $p.utils.blank.guid;
			else if($p.utils.is_data_obj(attr.characteristic))
				attr.characteristic = attr.characteristic.ref;

			if(!attr.date)
				attr.date = new Date();

			var price = 0, currency, date = $p.utils.blank.date;

			if(this._data._price){
				if(this._data._price[attr.characteristic]){
					if(this._data._price[attr.characteristic][attr.price_type]){
						this._data._price[attr.characteristic][attr.price_type].forEach(function (row) {
							if(row.date > date && row.date <= attr.date){
								price = row.price;
								currency = row.currency;
							}
						})
					}
				}else if(attr.clr){

				}
			}

			// Пересчитать из валюты в валюту
			return $p.pricing.from_currency_to_currency(price, attr.date, currency, attr.currency);

		}
	}
});
/**
 * ### Дополнительные методы справочника Контрагенты
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cat_partners
 */

$p.cat.partners.__define({

	sql_selection_where_flds: {
		value: function(filter){
			return " OR inn LIKE '" + filter + "' OR name_full LIKE '" + filter + "' OR name LIKE '" + filter + "'";
		}
	}
});

$p.CatPartners.prototype.__define({

	addr: {
		get: function () {

			return this.contact_information._obj.reduce(function (val, row) {

				if(row.kind == $p.cat.contact_information_kinds.predefined("ЮрАдресКонтрагента") && row.presentation)
					return row.presentation;

				else if(val)
					return val;

				else if(row.presentation && (
						row.kind == $p.cat.contact_information_kinds.predefined("ФактАдресКонтрагента") ||
						row.kind == $p.cat.contact_information_kinds.predefined("ПочтовыйАдресКонтрагента")
					))
					return row.presentation;

			}, "")

		}
	},

	phone: {
		get: function () {

			return this.contact_information._obj.reduce(function (val, row) {

				if(row.kind == $p.cat.contact_information_kinds.predefined("ТелефонКонтрагента") && row.presentation)
					return row.presentation;

				else if(val)
					return val;

				else if(row.kind == $p.cat.contact_information_kinds.predefined("ТелефонКонтрагентаМобильный") && row.presentation)
					return row.presentation;

			}, "")
		}
	},

	// полное наименование с телефоном, адресом и банковским счетом
	long_presentation: {
		get: function () {
			var res = this.name_full || this.name,
				addr = this.addr,
				phone = this.phone;

			if(this.inn)
				res+= ", ИНН" + this.inn;

			if(this.kpp)
				res+= ", КПП" + this.kpp;

			if(addr)
				res+= ", " + addr;

			if(phone)
				res+= ", " + phone;

			return res;
		}
	}
});
/**
 * Дополнительные методы справочника Системы (Параметры продукции)
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_production_params
 */

$p.cat.production_params.__define({

	/**
	 * возвращает массив доступных для данного свойства значений
	 * @param prop {CatObj} - планвидовхарактеристик ссылка или объект
	 * @param is_furn {boolean} - интересуют свойства фурнитуры или объекта
	 * @return {Array}
	 */
	slist: function(prop, is_furn){
		var res = [], rt, at, pmgr,
			op = this.get(prop);

		if(op && op.type.is_ref){
			// параметры получаем из локального кеша
			for(rt in op.type.types)
				if(op.type.types[rt].indexOf(".") > -1){
					at = op.type.types[rt].split(".");
					pmgr = $p[at[0]][at[1]];
					if(pmgr){
						if(pmgr.class_name=="enm.open_directions")
							pmgr.each(function(v){
								if(v.name!=$p.enm.tso.folding)
									res.push({value: v.ref, text: v.synonym});
							});
						else
							pmgr.find_rows({owner: prop}, function(v){
								res.push({value: v.ref, text: v.presentation});
							});
					}
				}
		}
		return res;
	}
});

$p.CatProduction_params.prototype.__define({

	/**
	 * возвращает доступные в данной системе элементы
	 * @property noms
	 * @for Production_params
	 */
	noms: {
		get: function(){
			var __noms = [];
			this.elmnts._obj.forEach(function(row){
				if(!$p.utils.is_empty_guid(row.nom) && __noms.indexOf(row.nom) == -1)
					__noms.push(row.nom);
			});
			return __noms;
		}
	},

	/**
	 * возвращает доступные в данной системе элементы (вставки)
	 * @property inserts
	 * @for Production_params
	 * @param elm_types - допустимые типы элементов
	 * @param by_default {Boolean|String} - сортировать по признаку умолчания или по наименованию вставки
	 * @return Array.<_cat.inserts>
	 */
	inserts: {
		value: function(elm_types, by_default){
			var __noms = [];
			if(!elm_types)
				elm_types = $p.enm.elm_types.rama_impost;

			else if(typeof elm_types == "string")
				elm_types = $p.enm.elm_types[elm_types];

			else if(!Array.isArray(elm_types))
				elm_types = [elm_types];

			this.elmnts.each(function(row){
				if(!row.nom.empty() && elm_types.indexOf(row.elm_type) != -1 &&
					(by_default == "rows" || !__noms.some(function (e) {
						return row.nom == e.nom;
					})))
					__noms.push(row);
			});

			if(by_default == "rows")
				return __noms;

			__noms.sort(function (a, b) {

				if(by_default){

					if (a.by_default && !b.by_default)
						return -1;
					else if (!a.by_default && b.by_default)
						return 1;
					else
						return 0;

				}else{
					if (a.nom.name < b.nom.name)
						return -1;
					else if (a.nom.name > b.nom.name)
						return 1;
					else
						return 0;
				}
			});
			return __noms.map(function (e) {
				return e.nom;
			});
		}
	},

	/**
	 * @method refill_prm
	 * @for cat.Production_params
	 * @param ox {Characteristics} - объект характеристики, табчасть которого надо перезаполнить
	 * @param cnstr {Nomber} - номер конструкции. Если 0 - перезаполняем параметры изделия, иначе - фурнитуры
	 */
	refill_prm: {
		value: function (ox, cnstr) {

			var prm_ts = !cnstr ? this.product_params : this.furn_params,
				adel = [];

			// если в характеристике есть лишние параметры - удаляем
			if(!cnstr){
				cnstr = 0;
				ox.params.find_rows({cnstr: cnstr}, function (row) {
					if(prm_ts.find_rows({param: row.param}).length == 0)
						adel.push(row);
				});
				adel.forEach(function (row) {
					ox.params.del(row);
				});
			}

			// бежим по параметрам. при необходимости, добавляем или перезаполняем и устанавливаем признак hide
			prm_ts.forEach(function (default_row) {

				var row;
				ox.params.find_rows({cnstr: cnstr, param: default_row.param}, function (_row) {
					row = _row;
					return false;
				});

				// если не найден параметр изделия - добавляем. если нет параметра фурнитуры - пропускаем
				if(!row){
					if(cnstr)
						return;
					row = ox.params.add({cnstr: cnstr, param: default_row.param, value: default_row.value});
				}

				if(row.hide != default_row.hide)
					row.hide = default_row.hide;

				if(default_row.forcibly && row.value != default_row.value)
					row.value = default_row.value;
			});

			if(!cnstr){
				ox.sys = this;
				ox.owner = ox.prod_nom;

				// одновременно, перезаполним параметры фурнитуры
				ox.constructions.forEach(function (row) {
					if(!row.furn.empty())
						ox.sys.refill_prm(ox, row.cnstr);
				})
			}
		}
	}

});


/**
 * ### Дополнительные методы справочника _Права внешних пользователей_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cat_users_acl
 */


$p.cat.users_acl.__define({

	load_array: {
		value: function(aattr, forse){

			var ref, obj, res = [], acl;

			for(var i in aattr){

				ref = $p.utils.fix_guid(aattr[i]);

				acl = aattr[i].acl;
				if(acl)
					delete aattr[i].acl;

				if(!(obj = this.by_ref[ref])){
					obj = new $p.CatUsers_acl(aattr[i], this);
					if(forse)
						obj._set_loaded();

				}else if(obj.is_new() || forse){
					obj._mixin(aattr[i]);
					obj._set_loaded();
				}

				if(acl && !obj._acl){
					var _acl = {};
					for(var i in acl){
						_acl.__define(i, {
							value: {},
							writable: false
						});
						for(var j in acl[i]){
							_acl[i].__define(j, {
								value: acl[i][j],
								writable: false
							});
						}
					}
					obj.__define({
						_acl: {
							value: _acl,
							writable: false
						}
					});
				}

				res.push(obj);
			}

			return res;
		}
	}
});

$p.CatUsers_acl.prototype.__define({

	/**
	 * ### Роль доступна
	 *
	 * @param name {String}
	 * @returns {Boolean}
	 */
	role_available: {
		value: function (name) {
			return this.acl_objs._obj.some(function (row) {
				return row.type == name;
			});
		}
	},

	/**
	 * ### Идентификаторы доступных контрагентов
	 * Для пользователей с ограниченным доступом
	 *
	 * @returns {Array}
	 */
	partners_uids: {
		get: function () {
			var res = [];
			this.acl_objs.each(function (row) {
				if(row.acl_obj instanceof $p.CatPartners)
					res.push(row.acl_obj.ref)
			});
			return res;
		}
	}
});

/**
 * ### Дополнительные методы ПВХ Предопределенные элементы
 * Предопределенные элементы - аналог констант для хранения ссылочных и списочных настроек приложения
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cch_predefined_elmnts
 */

(function($p){

	// Подписываемся на событие окончания загрузки локальных данных
	$p.on({
		pouch_load_data_loaded: function predefined_elmnts_data_loaded() {

			$p.off(predefined_elmnts_data_loaded);

			// читаем ключи планирования. они хранятся в doc, но нужны оперативно в ram
			$p.cat.planning_keys.pouch_find_rows({_top: 500, _skip: 0 });

			// читаем элементы из pouchdb и создаём свойства
			$p.cch.predefined_elmnts.pouch_find_rows({ _raw: true, _top: 500, _skip: 0 })
				.then(function (rows) {

					var parents = {};

					rows.forEach(function (row) {
						if(row.is_folder && row.synonym){
							var ref = row._id.split("|")[1];
							parents[ref] = row.synonym;
							$p.job_prm.__define(row.synonym, { value: {} });
						}
					});

					rows.forEach(function (row) {

						if(!row.is_folder && row.synonym && parents[row.parent] && !$p.job_prm[parents[row.parent]][row.synonym]){

							var _mgr, tnames;

							if(row.type.is_ref){
								tnames = row.type.types[0].split(".");
								_mgr = $p[tnames[0]][tnames[1]]
							}

							if(row.list == -1){

								$p.job_prm[parents[row.parent]].__define(row.synonym, {
									value: function () {
										var res = {};
										row.elmnts.forEach(function (row) {
											res[row.elm] = _mgr ? _mgr.get(row.value, false) : row.value;
										});
										return res;
									}()
								});

							}else if(row.list){

								$p.job_prm[parents[row.parent]].__define(row.synonym, {
									value: row.elmnts.map(function (row) {
										return _mgr ? _mgr.get(row.value, false) : row.value;
									})
								});

							}else{

								if($p.job_prm[parents[row.parent]].hasOwnProperty(row.synonym))
									delete $p.job_prm[parents[row.parent]][row.synonym];

								$p.job_prm[parents[row.parent]].__define(row.synonym, {
									value: _mgr ? _mgr.get(row.value, false) : row.value,
									configurable: true
								});
							}

						}
					});
				})
				.then(function () {

					// рассчеты, помеченные, как шаблоны, загрузим в память заранее
					setTimeout(function () {

						if(!$p.job_prm.builder.base_block)
							$p.job_prm.builder.base_block = [];

						// дополним base_block шаблонами из систем профилей
						$p.cat.production_params.forEach(function (o) {
							if(!o.is_folder)
								o.base_blocks.forEach(function (row) {
									if($p.job_prm.builder.base_block.indexOf(row.calc_order) == -1)
										$p.job_prm.builder.base_block.push(row.calc_order);
								});
						});

						$p.job_prm.builder.base_block.forEach(function (o) {
							o.load();
						});

					}, 1000);

					// загружаем ключи планирования, т.к. они нужны в ОЗУ
					$p.cat.planning_keys.pouch_find_rows();


					// даём возможность завершиться другим обработчикам, подписанным на _pouch_load_data_loaded_
					setTimeout(function () {
						$p.eve.callEvent("predefined_elmnts_inited");
					}, 200);

				});

		}
	});

	var _mgr = $p.cch.predefined_elmnts;

	
	/**
	 * Переопределяем геттер значения
	 *
	 * @property value
	 * @override
	 * @type {*}
	 */
	delete $p.CchPredefined_elmnts.prototype.value;
	$p.CchPredefined_elmnts.prototype.__define({

		value: {
			get: function () {

				var mf = this.type,
					res = this._obj ? this._obj.value : "",
					mgr, ref;

				if(this._obj.is_folder)
					return "";

				if(typeof res == "object")
					return res;

				else if(mf.is_ref){
					if(mf.digits && typeof res === "number")
						return res;

					if(mf.hasOwnProperty("str_len") && !$p.utils.is_guid(res))
						return res;

					if(mgr = $p.md.value_mgr(this._obj, "value", mf)){
						if($p.utils.is_data_mgr(mgr))
							return mgr.get(res, false);
						else
							return $p.utils.fetch_type(res, mgr);
					}

					if(res){
						console.log(["value", mf, this._obj]);
						return null;
					}

				}else if(mf.date_part)
					return $p.utils.fix_date(this._obj.value, true);

				else if(mf.digits)
					return $p.utils.fix_number(this._obj.value, !mf.hasOwnProperty("str_len"));

				else if(mf.types[0]=="boolean")
					return $p.utils.fix_boolean(this._obj.value);

				else
					return this._obj.value || "";

				return this.characteristic.clr;
			},

			set: function (v) {

				if(this._obj.value === v)
					return;

				Object.getNotifier(this).notify({
					type: 'update',
					name: 'value',
					oldValue: this._obj.value
				});
				this._obj.value = $p.utils.is_data_obj(v) ? v.ref : v;
				this._data._modified = true;
			}
		}
	});
	/**
	 * ### Форма элемента
	 *
	 * @method form_obj
	 * @override
	 * @param pwnd
	 * @param attr
	 * @returns {*}
	 */
	_mgr.form_obj = function(pwnd, attr){

		var o, wnd;

		return this.constructor.prototype.form_obj.call(this, pwnd, attr)
			.then(function (res) {
				if(res){
					o = res.o;
					wnd = res.wnd;
					return res;
				}
			});
	}

})($p);
/**
 * ### Дополнительные методы плана видов характеристик _Свойства объектов_
 * аналог подсистемы _Свойства_ БСП
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cch_properties
 */


$p.cch.properties.__define({

	/**
	 * ### Проверяет заполненность обязательных полей
	 *
	 * @method check_mandatory
	 * @override
	 * @param prms {Array}
	 * @param title {String}
	 * @return {boolean}
	 */
	check_mandatory: {
		value: function(prms, title){

			var t, row;

			// проверяем заполненность полей
			for(t in prms){
				row = prms[t];
				if(row.param.mandatory && (!row.value || row.value.empty())){
					$p.msg.show_msg({
						type: "alert-error",
						text: $p.msg.bld_empty_param + row.param.presentation,
						title: title || $p.msg.bld_title});
					return true;
				}
			}
		}
	},

	/**
	 * ### Возвращает массив доступных для данного свойства значений
	 *
	 * @method slist
	 * @override
	 * @param prop {CatObj} - планвидовхарактеристик ссылка или объект
	 * @param ret_mgr {Object} - установить в этом объекте указатель на менеджера объекта
	 * @return {Array}
	 */
	slist: {
		value: function(prop, ret_mgr){

			var res = [], rt, at, pmgr, op = this.get(prop);

			if(op && op.type.is_ref){
				// параметры получаем из локального кеша
				for(rt in op.type.types)
					if(op.type.types[rt].indexOf(".") > -1){
						at = op.type.types[rt].split(".");
						pmgr = $p[at[0]][at[1]];
						if(pmgr){

							if(ret_mgr)
								ret_mgr.mgr = pmgr;

							if(pmgr.class_name=="enm.open_directions")
								pmgr.get_option_list().forEach(function(v){
									if(v.value && v.value!=$p.enm.tso.folding)
										res.push(v);
								});

							else if(pmgr.class_name.indexOf("enm.")!=-1 || !pmgr.metadata().has_owners)
								res = pmgr.get_option_list();

							else
								pmgr.find_rows({owner: prop}, function(v){
									res.push({value: v.ref, text: v.presentation});
								});
						}
					}
			}
			return res;
		}
	}

});

/**
 * ### Модуль Ценообразование
 * Аналог УПзП-шного __ЦенообразованиеСервер__
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module  glob_pricing
 */

/**
 * ### Ценообразование
 *
 * @class Pricing
 * @param $p {MetaEngine} - контекст
 * @static
 */
function Pricing($p){

	/**
	 * Возвращает цену номенклатуры по типу цен из регистра пзМаржинальныеКоэффициентыИСкидки
	 * Если в маржинальных коэффициентах или номенклатуре указана формула - выполняет
	 *
	 * Аналог УПзП-шного __ПолучитьЦенуНоменклатуры__
	 * @method nom_price
	 * @param nom
	 * @param characteristic
	 * @param price_type
	 * @param prm
	 * @param row
	 */
	this.nom_price = function (nom, characteristic, price_type, prm, row) {

		if(row && prm){
			var calc_order = prm.calc_order_row._owner._owner;
			row.price = nom._price({
				price_type: price_type,
				characteristic: characteristic,
				date: calc_order.date,
				currency: calc_order.doc_currency
			});

			return row.price;
		}
	};

	/**
	 * Возвращает структуру типов цен и КМарж
	 * Аналог УПзП-шного __ПолучитьТипЦенНоменклатуры__
	 * @method price_type
	 * @param prm {Object}
	 * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
	 */
	this.price_type = function (prm) {

		// Рез = Новый Структура("КМарж, КМаржМин, КМаржВнутр, Скидка, СкидкаВнешн, НаценкаВнешн, ТипЦенСебестоимость, ТипЦенПрайс, ТипЦенВнутр,
		// 				|Формула, ФормулаПродажа, ФормулаВнутр, ФормулаВнешн",
		// 				1.9, 1.2, 1.5, 0, 10, 0, ТипЦенПоУмолчанию, ТипЦенПоУмолчанию, ТипЦенПоУмолчанию, "", "", "",);
		prm.price_type = {
			marginality: 1.9,
			marginality_min: 1.2,
			marginality_internal: 1.5,
			discount: 0,
			discount_external: 10,
			extra_charge_external: 0,
			price_type_first_cost: $p.job_prm.pricing.price_type_first_cost,
			price_type_sale: $p.job_prm.pricing.price_type_first_cost,
			price_type_internal: $p.job_prm.pricing.price_type_first_cost,
			formula: "",
			sale_formula: "",
			internal_formula: "",
			external_formula: ""
		};

		var filter = prm.calc_order_row.nom.price_group.empty() ?
			{price_group: prm.calc_order_row.nom.price_group} :
			{price_group: {in: [prm.calc_order_row.nom.price_group, $p.cat.price_groups.get()]}},
			ares = [];

		$p.ireg.margin_coefficients.find_rows(filter, function (row) {
			ares.push(row);
		});

		// заглушка - фильтр только по ценовой группе
		if(ares.length)
			Object.keys(prm.price_type).forEach(function (key) {
				prm.price_type[key] = ares[0][key];
			});

		// если для контрагента установлена индивидуальная наценка, подмешиваем её в prm
		prm.calc_order_row._owner._owner.partner.extra_fields.find_rows({
			property: $p.job_prm.pricing.dealer_surcharge
		}, function (row) {
			prm.price_type.extra_charge_external = row.value;
			return false;
		});

		return prm.price_type;
	};

	/**
	 * Рассчитывает плановую себестоимость строки документа Расчет
	 * Если есть спецификация, расчет ведется по ней. Иначе - по номенклатуре строки расчета
	 *
	 * Аналог УПзП-шного __РассчитатьПлановуюСебестоимость__
	 * @param prm {Object}
	 * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
	 */
	this.calc_first_cost = function (prm) {

		var marginality_in_spec = $p.job_prm.pricing.marginality_in_spec,
			fake_row = {};

		if(!prm.spec)
			return;

		// пытаемся рассчитать по спецификации
		if(prm.spec.count()){
			prm.spec.each(function (row) {

				$p.pricing.nom_price(row.nom, row.characteristic, prm.price_type.price_type_first_cost, prm, row);
				row.amount = row.price * row.totqty1;

				if(marginality_in_spec){
					fake_row._mixin(row, ["nom"]);
					tmp_price = $p.pricing.nom_price(row.nom, row.characteristic, prm.price_type.price_type_sale, prm, fake_row);
					row.amount_marged = (tmp_price ? tmp_price : row.price) * row.totqty1;
				}

			});
			prm.calc_order_row.first_cost = prm.spec.aggregate([], ["amount"]).round(2);
		}else{
			// TODO: реализовать расчет себестомиости по номенклатуре строки расчета
		}




	};

	/**
	 * Рассчитывает стоимость продажи в строке документа Расчет
	 *
	 * Аналог УПзП-шного __РассчитатьСтоимостьПродажи__
	 * @param prm {Object}
	 * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
	 */
	this.calc_amount = function (prm) {

		// TODO: реализовать расчет цены продажи по номенклатуре строки расчета
		var price_cost = $p.job_prm.pricing.marginality_in_spec ? prm.spec.aggregate([], ["amount_marged"]) : 0;

		// цена продажи
		if(price_cost)
			prm.calc_order_row.price = price_cost.round(2);
		else
			prm.calc_order_row.price = (prm.calc_order_row.first_cost * prm.price_type.marginality).round(2);

		// КМарж в строке расчета
		prm.calc_order_row.marginality = prm.calc_order_row.first_cost ?
		prm.calc_order_row.price * ((100 - prm.calc_order_row.discount_percent)/100) / prm.calc_order_row.first_cost : 0;


		// TODO: Рассчитаем цену и сумму ВНУТР или ДИЛЕРСКУЮ цену и скидку
		if(prm.price_type.extra_charge_external){

			prm.calc_order_row.price_internal = (prm.calc_order_row.price *
			(100 - prm.calc_order_row.discount_percent)/100 * (100 + prm.price_type.extra_charge_external)/100).round(2);

			// TODO: учесть формулу

		}


		// TODO: вытягивание строк спецификации в заказ

		// Эмулируем событие окончания редактирования, чтобы единообразно пересчитать строку табчасти
		if(!prm.hand_start){
			$p.doc.calc_order.handle_event(prm.calc_order_row._owner._owner, "value_change", {
				field: "price",
				value: prm.calc_order_row.price,
				tabular_section: "production",
				row: prm.calc_order_row,
				no_extra_charge: true
			});
		}



	};

	/**
	 * Пересчитывает сумму из валюты в валюту
	 * @param amount {Number} - сумма к пересчету
	 * @param date {Date} - дата курса
	 * @param from - исходная валюта
	 * @param [to] - конечная валюта
	 * @return {Number}
	 */
	this.from_currency_to_currency = function (amount, date, from, to) {

		if(!to || to.empty())
			to = $p.job_prm.pricing.main_currency;

		if(!from || from == to)
			return amount;

		if(!date)
			date = new Date();

		if(!this.cource_sql)
			this.cource_sql = $p.wsql.alasql.compile("select top 1 * from `ireg_currency_courses` where `currency` = ? and `period` <= ? order by `date` desc");

		var cfrom = {course: 1, multiplicity: 1},
			cto = {course: 1, multiplicity: 1},
			tmp;
		if(from != $p.job_prm.pricing.main_currency){
			tmp = this.cource_sql([from.ref, date]);
			if(tmp.length)
				cfrom = tmp[0];
		}
		if(to != $p.job_prm.pricing.main_currency){
			tmp = this.cource_sql([to.ref, date]);
			if(tmp.length)
				cto = tmp[0];
		}

		return (amount * cfrom.course / cfrom.multiplicity) * cto.multiplicity / cto.course;
	};


	/**
	 * Выгружает в CouchDB изменённые в RAM справочники
	 */
	this.cut_upload = function () {

		if(!$p.current_acl || (
			!$p.current_acl.role_available("СогласованиеРасчетовЗаказов") &&
			!$p.current_acl.role_available("ИзменениеТехнологическойНСИ"))){
			$p.msg.show_msg({
				type: "alert-error",
				text: $p.msg.error_low_acl,
				title: $p.msg.error_rights
			});
			return true;
		}

		function upload_acc() {
			var mgrs = [
				"cat.users",
				"cat.individuals",
				"cat.organizations",
				"cat.partners",
				"cat.contracts",
				"cat.currencies",
				"cat.nom_prices_types",
				"cat.price_groups",
				"cat.cashboxes",
				"cat.partner_bank_accounts",
				"cat.organization_bank_accounts",
				"cat.projects",
				"cat.stores",
				"cat.cash_flow_articles",
				"cat.cost_items",
				"cat.price_groups",
				"cat.delivery_areas",
				"ireg.currency_courses",
				"ireg.margin_coefficients"
			];

			$p.wsql.pouch.local.ram.replicate.to($p.wsql.pouch.remote.ram, {
				filter: function (doc) {
					return mgrs.indexOf(doc._id.split("|")[0]) != -1;
				}
			})
				.on('change', function (info) {
					//handle change

				})
				.on('paused', function (err) {
					// replication paused (e.g. replication up to date, user went offline)

				})
				.on('active', function () {
					// replicate resumed (e.g. new changes replicating, user went back online)

				})
				.on('denied', function (err) {
					// a document failed to replicate (e.g. due to permissions)
					$p.msg.show_msg(err.reason);
					$p.record_log(err);

				})
				.on('complete', function (info) {

					if($p.current_acl.role_available("ИзменениеТехнологическойНСИ"))
						upload_tech();

					else
						$p.msg.show_msg({
							type: "alert-info",
							text: $p.msg.sync_complite,
							title: $p.msg.sync_title
						});

				})
				.on('error', function (err) {
					$p.msg.show_msg(err.reason);
					$p.record_log(err);

				});
		}

		function upload_tech() {
			var mgrs = [
				"cat.units",
				"cat.nom",
				"cat.nom_groups",
				"cat.nom_units",
				"cat.nom_kinds",
				"cat.elm_visualization",
				"cat.destinations",
				"cat.property_values",
				"cat.property_values_hierarchy",
				"cat.inserts",
				"cat.insert_bind",
				"cat.color_price_groups",
				"cat.clrs",
				"cat.furns",
				"cat.cnns",
				"cat.production_params",
				"cat.parameters_keys",
				"cat.formulas",
				"cch.properties",
				"cch.predefined_elmnts"

			];

			$p.wsql.pouch.local.ram.replicate.to($p.wsql.pouch.remote.ram, {
				filter: function (doc) {
					return mgrs.indexOf(doc._id.split("|")[0]) != -1;
				}
			})
				.on('change', function (info) {
					//handle change

				})
				.on('paused', function (err) {
					// replication paused (e.g. replication up to date, user went offline)

				})
				.on('active', function () {
					// replicate resumed (e.g. new changes replicating, user went back online)

				})
				.on('denied', function (err) {
					// a document failed to replicate (e.g. due to permissions)
					$p.msg.show_msg(err.reason);
					$p.record_log(err);

				})
				.on('complete', function (info) {
					$p.msg.show_msg({
						type: "alert-info",
						text: $p.msg.sync_complite,
						title: $p.msg.sync_title
					});

				})
				.on('error', function (err) {
					$p.msg.show_msg(err.reason);
					$p.record_log(err);

				});
		}


		if($p.current_acl.role_available("СогласованиеРасчетовЗаказов"))
			upload_acc();
		else
			upload_tech();

	};

	// виртуальный срез последних
	function build_cache() {

		return $p.doc.nom_prices_setup.pouch_db.query("doc/doc_nom_prices_setup_slice_last",
			{
				limit : 1000,
				include_docs: false,
				startkey: [''],
				endkey: ['\uffff']
				// ,reduce: function(keys, values, rereduce) {
				// 	return values.length;
				// }
			})
			.then(function (res) {
				res.rows.forEach(function (row) {

					var onom = $p.cat.nom.get(row.key[0], false, true);

					if(!onom || !onom._data)
						return;

					if(!onom._data._price)
						onom._data._price = {};

					if(!onom._data._price[row.key[1]])
						onom._data._price[row.key[1]] = {};

					if(!onom._data._price[row.key[1]][row.key[2]])
						onom._data._price[row.key[1]][row.key[2]] = [];

					onom._data._price[row.key[1]][row.key[2]].push({
						date: new Date(row.value.date),
						price: row.value.price,
						currency: $p.cat.currencies.get(row.value.currency)
					});

				});
			});
	}

	// подписываемся на событие после загрузки из pouchdb-ram и готовности предопределенных
	var init_event_id = $p.eve.attachEvent("predefined_elmnts_inited", function () {
		$p.eve.detachEvent(init_event_id);
		build_cache();
	});

	// следим за изменениями документа установки цен, чтобы при необходимости обновить кеш
	$p.eve.attachEvent("pouch_change", function (dbid, change) {
		if (dbid != $p.doc.nom_prices_setup.cachable)
			return;

		// формируем новый
	});
}


/**
 * ### Модуль Ценообразование
 * Аналог УПзП-шного __ЦенообразованиеСервер__ в контексте MetaEngine
 *
 * @property pricing
 * @type {Pricing}
 */
$p.pricing = new Pricing($p);

/**
 * Аналог УПзП-шного __ПостроительИзделийСервер__
 *
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module  glob_products_building
 * Created 26.05.2015
 */

function ProductsBuilding(){

	var added_cnn_spec,
		ox,
		spec,
		constructions,
		coordinates,
		cnn_elmnts,
		glass_specification,
		glass_formulas,
		params;


	/**
	 * РассчитатьКоличествоПлощадьМассу
	 * @param row_cpec
	 * @param row_coord
	 */
	function calc_count_area_mass(row_cpec, row_coord, angle_calc_method_prev, angle_calc_method_next){

		//TODO: учесть angle_calc_method
		if(!angle_calc_method_next)
			angle_calc_method_next = angle_calc_method_prev;

		if(angle_calc_method_prev && !row_cpec.nom.is_pieces){

			if((angle_calc_method_prev == $p.enm.angle_calculating_ways.Основной) ||
				(angle_calc_method_prev == $p.enm.angle_calculating_ways.СварнойШов)){
				row_cpec.alp1 = row_coord.alp1;

			}else if(angle_calc_method_prev == $p.enm.angle_calculating_ways._90){
				row_cpec.alp1 = 90;

			}else if(angle_calc_method_prev == $p.enm.angle_calculating_ways.СоединениеПополам){
				row_cpec.alp1 = row_coord.alp1 / 2;

			}else if(angle_calc_method_prev == $p.enm.angle_calculating_ways.Соединение){
				row_cpec.alp1 = row_coord.alp1;
			}

			if((angle_calc_method_next == $p.enm.angle_calculating_ways.Основной) ||
				(angle_calc_method_next == $p.enm.angle_calculating_ways.СварнойШов)){
				row_cpec.alp2 = row_coord.alp2;

			}else if(angle_calc_method_next == $p.enm.angle_calculating_ways._90){
				row_cpec.alp2 = 90;

			}else if(angle_calc_method_next == $p.enm.angle_calculating_ways.СоединениеПополам){
				row_cpec.alp2 = row_coord.alp2 / 2;

			}else if(angle_calc_method_next == $p.enm.angle_calculating_ways.Соединение){
				row_cpec.alp2 = row_coord.alp2;

			}
		}

		if(row_cpec.len){
			if(row_cpec.width && !row_cpec.s)
				row_cpec.s = row_cpec.len * row_cpec.width;
		}else
			row_cpec.s = 0;

		if(!row_cpec.qty && (row_cpec.len || row_cpec.width))
			row_cpec.qty = 1;

		if(row_cpec.s)
			row_cpec.totqty = row_cpec.qty * row_cpec.s;

		else if(row_cpec.len)
			row_cpec.totqty = row_cpec.qty * row_cpec.len;

		else
			row_cpec.totqty = row_cpec.qty;

		row_cpec.totqty1 = row_cpec.totqty * row_cpec.nom.loss_factor;

		["len","width","s","qty","totqty","totqty1","alp1","alp2"].forEach(function (fld) {
			row_cpec[fld] = row_cpec[fld].round(4);
		});
	}

	/**
	 * РассчитатьQtyLen
	 * @param row_spec
	 * @param row_base
	 * @param len
	 */
	function calc_qty_len(row_spec, row_base, len){

		var nom = row_spec.nom;

		if(nom.cutting_optimization_type == $p.enm.cutting_optimization_types.Нет ||
			nom.cutting_optimization_type.empty() || nom.is_pieces){

			if(!row_base.coefficient || !len)
				row_spec.qty = row_base.quantity;

			else{
				if(!nom.is_pieces){
					row_spec.qty = row_base.quantity;
					row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
					if(nom.rounding_quantity){
						row_spec.qty = (row_spec.qty * row_spec.len).round(nom.rounding_quantity);
						row_spec.len = 0;
					};

				}else if(!nom.rounding_quantity){
					row_spec.qty = Math.round((len - row_base.sz) * row_base.coefficient * row_base.quantity - 0.5);

				}else{
					row_spec.qty = ((len - row_base.sz) * row_base.coefficient * row_base.quantity).round(nom.rounding_quantity);
				}
			}

		}else{
			row_spec.qty = row_base.quantity;
			row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
		}
	}

	/**
	 * СтрокаСоединений
	 * @param elm1
	 * @param elm2
	 * @return {Number|DataObj}
	 */
	function cnn_row(elm1, elm2){
		var res = cnn_elmnts.find_rows({elm1: elm1, elm2: elm2});
		if(res.length)
			return res[0].row;
		res = cnn_elmnts.find_rows({elm1: elm2, elm2: elm1});
		if(res.length)
			return res[0].row;
		return 0;
	}

	/**
	 * НадоДобавитьСпецификациюСоединения
	 * @param cnn
	 * @param elm1
	 * @param elm2
	 */
	function cnn_need_add_spec(cnn, elm1, elm2){

		// соединения крест пересечение и крест в стык обрабатываем отдельно
		if(cnn && cnn.cnn_type == $p.enm.cnn_types.КрестВСтык)
			return false;

		else if(!cnn || !elm1 || !elm2 || added_cnn_spec[elm1] == elm2 || added_cnn_spec[elm2] == elm1)
			return false;

		added_cnn_spec[elm1] = elm2;
		return true;
	}

	/**
	 * Добавляет или заполняет строку спецификации
	 * @param row_spec
	 * @param elm
	 * @param row_base
	 * @param [nom]
	 * @param [origin]
	 * @return {TabularSectionRow.cat.characteristics.specification}
	 */
	function new_spec_row(row_spec, elm, row_base, nom, origin){
		if(!row_spec)
			row_spec = spec.add();
		row_spec.nom = nom || row_base.nom;
		row_spec.clr = $p.cat.clrs.by_predefined(row_base ? row_base.clr : elm.clr, elm.clr, ox.clr);
		row_spec.elm = elm.elm;
		if(origin)
			row_spec.origin = origin;
		return row_spec;
	}

	/**
	 * ДополнитьСпецификациюСпецификациейСоединения
	 * @method cnn_add_spec
	 * @param cnn {_cat.Cnns}
	 * @param elm {BuilderElement}
	 * @param len_angl {Object}
	 */
	function cnn_add_spec(cnn, elm, len_angl){

		if(!cnn)
			return;

		var sign = cnn.cnn_type == $p.enm.cnn_types.Наложение ? -1 : 1;

		cnn_filter_spec(cnn, elm, len_angl).forEach(function (row_cnn_spec) {
			var nom = row_cnn_spec.nom;

			// TODO: nom может быть вставкой - в этом случае надо разузловать
			if(nom._manager == $p.cat.inserts){
				if(len_angl && (row_cnn_spec.sz || row_cnn_spec.coefficient)){
					var tmp_len_angl = len_angl._clone();
					tmp_len_angl.len = (len_angl.len - sign * 2 * row_cnn_spec.sz) * (row_cnn_spec.coefficient || 0.001);
					inset_spec(elm, nom, tmp_len_angl);
				}else
					inset_spec(elm, nom, len_angl);

			}else {

				var row_spec = new_spec_row(null, elm, row_cnn_spec, nom, len_angl.origin);

				// рассчитаем количество
				if(nom.is_pieces){
					if(!row_cnn_spec.coefficient)
						row_spec.qty = row_cnn_spec.quantity;
					else
						row_spec.qty = ((len_angl.len - sign * 2 * row_cnn_spec.sz) * row_cnn_spec.coefficient * row_cnn_spec.quantity - 0.5)
							.round(nom.rounding_quantity);
				}else{
					// TODO: Строго говоря, нужно брать не размер соединения, а размеры предыдущего и последующего
					row_spec.qty = row_cnn_spec.quantity;

					if(row_cnn_spec.sz || row_cnn_spec.coefficient)
						row_spec.len = (len_angl.len - sign * 2 * row_cnn_spec.sz) * (row_cnn_spec.coefficient || 0.001);
				}

				// если указана формула - выполняем
				if(!row_cnn_spec.formula.empty()) {
					row_cnn_spec.formula.execute({
						ox: ox,
						elm: elm,
						row_cnn: row_cnn_spec,
						row_spec: row_spec
					});
				}

				if(!row_spec.qty)
					spec.del(row_spec.row-1);
				else
					calc_count_area_mass(row_spec, len_angl, row_cnn_spec.angle_calc_method);

			}


		});
	}

	/**
	 * ПолучитьСпецификациюСоединенияСФильтром
	 * @param cnn
	 * @param elm
	 * @param len_angl
	 */
	function cnn_filter_spec(cnn, elm, len_angl){

		var res = [], nom, angle_hor = elm.angle_hor;

		cnn.specification.each(function (row) {
			nom = row.nom;
			if(!nom || nom.empty() ||
				nom == $p.job_prm.nom.art1 ||
				nom == $p.job_prm.nom.art2)
				return;

			// только для прямых или только для кривых профилей
			if((row.for_direct_profile_only > 0 && !elm.profile.is_linear()) ||
				(row.for_direct_profile_only < 0 &&elm.profile.is_linear()))
				return;

			//TODO: реализовать фильтрацию
			if(cnn.cnn_type == $p.enm.cnn_types.Наложение){
				if(row.amin > angle_hor || row.amax < angle_hor)
					return;
			}else{
				if(row.amin > len_angl.angle || row.amax < len_angl.angle)
					return;
			}

			// "Устанавливать с" проверяем только для соединений профиля
			if(($p.enm.cnn_types.acn.a.indexOf(cnn.cnn_type) != -1) && (
					(row.set_specification == $p.enm.specification_installation_methods.САртикулом1 && !len_angl.art1) ||
					(row.set_specification == $p.enm.specification_installation_methods.САртикулом2 && !len_angl.art2)
				))
				return;

			// Проверяем параметры изделия и добавляем, если проходит по ограничениям
			if(check_params(cnn.selection_params, row.elm))
				res.push(row);

		});
		return res;
	}

	/**
	 * Проверяет соответствие параметров отбора параметрам изделия
	 * @param selection_params
	 * @param elm
	 * @param [cnstr]
	 * @return {boolean}
	 */
	function check_params(selection_params, elm, cnstr){
		var ok = true;
		selection_params.find_rows({elm: elm}, function (prm) {
			ok = false;
			params.find_rows({cnstr: cnstr || 0, param: prm.param, value: prm.value}, function () {
				ok = true;
				return false;
			});
			return ok;
		});
		return ok;
	}

	/**
	 * ПроверитьОграниченияВставки
	 * TODO: перенести в прототип объекта вставки
	 * @param inset
	 * @param elm
	 * @param by_perimetr
	 * @return {boolean}
	 */
	function inset_check(inset, elm, by_perimetr, len_angl){

		var is_tabular = true,
			_row = elm._row,
			len = len_angl ? len_angl.len : _row.len;

		// проверяем площадь
		if(inset.smin > _row.s || (_row.s && inset.smax && inset.smax < _row.s))
			return false;

		// Главный элемент с нулевым количеством не включаем
		if(inset.is_main_elm && !inset.quantity)
			return false;

		if($p.utils.is_data_obj(inset)){

			// только для прямых или только для кривых профилей
			if((inset.for_direct_profile_only > 0 && !elm.profile.is_linear()) ||
				(inset.for_direct_profile_only < 0 &&elm.profile.is_linear()))
				return false;

			if(inset.impost_fixation == $p.enm.impost_mount_options.ДолжныБытьКрепленияИмпостов){
				if(!elm.joined_imposts(true))
					return false;

			}else if(inset.impost_fixation == $p.enm.impost_mount_options.НетКрепленийИмпостовИРам){
				if(elm.joined_imposts(true))
					return false;
			}
			is_tabular = false;
		}


		if(!is_tabular || by_perimetr || inset.count_calc_method != $p.enm.count_calculating_ways.ПоПериметру){
			if(inset.lmin > len || (inset.lmax < len && inset.lmax > 0))
				return false;
			if(inset.ahmin > _row.angle_hor || inset.ahmax < _row.angle_hor)
				return false;
		}

		//// Включить проверку размеров и углов, поля "Устанавливать с..." и т.д.

		return true;
	}

	/**
	 * ПолучитьСпецификациюВставкиСФильтром
	 * @param inset
	 * @param elm
	 * @param [is_high_level_call]
	 */
	function inset_filter_spec(inset, elm, is_high_level_call, len_angl){

		var res = [], glass_rows;
		if(!inset || inset.empty())
			return res;

		if(is_high_level_call && inset.insert_type == $p.enm.inserts_types.Стеклопакет){
			glass_rows = glass_specification.find_rows({elm: elm.elm}).map(function (row) {
				return row._row;
			});
			if(!glass_rows.length){
				// заполняем спецификацию заполнений по умолчанию, чтобы склеить формулу
				inset.specification.each(function (row) {
					glass_rows.push(
						glass_specification.add({
							elm: elm.elm,
							gno: 0,
							inset: row.nom,
							clr: row.clr
						})
					);
				});
			}

			if(glass_rows.length){
				glass_formulas[elm.elm] = "";
				glass_rows.forEach(function (row) {
					inset_filter_spec(row.inset, elm, false, len_angl).forEach(function (row) {
						res.push(row);
					});
					if(!glass_formulas[elm.elm])
						glass_formulas[elm.elm] = row.inset.name;
					else
						glass_formulas[elm.elm] += "x" + row.inset.name;
				});
				return res;
			}
		}

		inset.specification.each(function (row) {

			// Проверяем ограничения строки вставки
			if(!inset_check(row, elm, inset.insert_type == $p.enm.inserts_types.Профиль, len_angl))
				return;

			// Проверяем параметры изделия
			if(!check_params(inset.selection_params, row.elm))
				return;

			// Добавляем или разузловываем дальше
			if(row.nom._manager == $p.cat.inserts)
				inset_filter_spec(row.nom, elm, false, len_angl).forEach(function (row) {
					res.push(row);
				});
			else
				res.push(row);

		});

		return res;
	}

	/**
	 * Спецификации фурнитуры
	 * @param contour {Contour}
	 */
	function furn_spec(contour) {

		// у рамных контуров фурнитуры не бывает
		if(!contour.parent)
			return false;

		// кеш сторон фурнитуры
		var cache = {
			profiles: contour.outer_nodes,
			bottom: contour.profiles_by_side("bottom"),
			params: contour.project.ox.params
		};

		// проверяем, подходит ли фурнитура под геометрию контура
		if(!furn_check_opening_restrictions(contour, cache))
			return;

		// уточняем высоту ручки, т.к. от неё зависят координаты в спецификации
		furn_update_handle_height(contour, cache, contour.furn.furn_set);

		// получаем спецификацию фурнитуры и переносим её в спецификацию изделия
		furn_get_spec(contour, cache, contour.furn.furn_set).each(function (row) {
			var elm = {elm: -contour.cnstr, clr: contour.clr_furn},
				row_spec = new_spec_row(null, elm, row, row.nom_set, row.origin);

			if(row.is_procedure_row){
				row_spec.elm = row.handle_height_min;
				row_spec.len = row.coefficient / 1000;
				row_spec.qty = 0;
				row_spec.totqty = 1;
				row_spec.totqty1 = 1;
				if(!row_spec.nom.visualization.empty())
					row_spec.dop = -1;

			}else{
				row_spec.qty = row.quantity * (!row.coefficient ? 1 : row.coefficient);
				calc_count_area_mass(row_spec);
			}
		});
	}

	/**
	 * Проверяет ограничения открывания, добавляет визуализацию ошибок
	 * @param contour {Contour}
	 * @param cache {Object}
	 * @return {boolean}
	 */
	function furn_check_opening_restrictions(contour, cache) {

		var ok = true;

		// TODO: реализовать проверку по количеству сторон

		// проверка геометрии
		contour.furn.open_tunes.each(function (row) {
			var elm = contour.profile_by_furn_side(row.side, cache),
				len = elm._row.len - 2 * elm.nom.sizefurn;

			// angle_hor = elm.angle_hor; TODO: реализовать проверку углов

			if(len < row.lmin ||
				len > row.lmax ||
				(!elm.is_linear() && !row.arc_available)){

				new_spec_row(null, elm, {clr: $p.cat.clrs.get()}, $p.job_prm.nom.furn_error, contour.furn).dop = -1;
				ok = false;
			}

		});

		return ok;
	}

	/**
	 * Аналог УПзП-шного _ПроверитьОграниченияСтрокиФурнитуры_
	 * @param contour {Contour}
	 * @param cache {Object}
	 * @param furn_set {_cat.furns}
	 * @param row {_cat.furns.specification.row}
	 */
	function furn_check_row_restrictions(contour, cache, furn_set, row) {

		var res = true;

		// по таблице параметров
		furn_set.selection_params.find_rows({elm: row.elm, dop: row.dop}, function (row) {

			var ok = false;

			if($p.job_prm.properties.direction == row.param){
				ok = contour.direction == row.value;

			}else{
				cache.params.find_rows({cnstr: contour.cnstr, param: row.param, value: row.value}, function () {
					return !(ok = true);
				});
			}

			if(!ok)
				return res = false;

		});

		// по таблице ограничений
		if(res){
			furn_set.specification_restrictions.find_rows({elm: row.elm, dop: row.dop}, function (row) {

				var len;

				if(contour.is_rectangular){
					if(!cache.w)
						cache.w = contour.w;
					if(!cache.h)
						cache.h = contour.h;

					len = (row.side == 1 || row.side == 3) ? cache.w : cache.h;

				}else{
					var elm = contour.profile_by_furn_side(row.side, cache);
					len = elm._row.len - 2 * elm.nom.sizefurn;
				}

				if(len < row.lmin || len > row.lmax ){
					return res = false;

				}
			});
		}

		return res;
	}

	/**
	 * Уточняет высоту ручки
	 * @param contour {Contour}
	 * @param cache {Object}
	 */
	function furn_update_handle_height(contour, cache, furn_set){

		if(!contour.furn.handle_side && furn_set.empty())
			return;

		// получаем элемент, на котором ручка и длину элемента
		var elm = contour.profile_by_furn_side(contour.furn.handle_side, cache),
			len = elm._row.len;

		// бежим по спецификации набора в поисках строки про ручку
		furn_set.specification.find_rows({dop: 0}, function (row) {

			// проверяем, проходит ли строка
			if(!row.quantity || !furn_check_row_restrictions(contour, cache, furn_set, row))
				return;

			if(furn_set_handle_height(contour, row, len))
				return false;

			if(row.is_set_row){
				var ok = false;
				furn_get_spec(contour, cache, row.nom_set, true).each(function (sub_row) {
					if(furn_set_handle_height(contour, sub_row, len))
						return !(ok = true);
				});
				if(ok)
					return false;
			}

		})


	}

	/**
	 * Устанавливает высоту ручки в контуре, если этого требует текущая строка спецификации фкрнитуры
	 * @param contour {Contour}
	 * @param row {TabularSectionRow.cat.furns.specification}
	 * @param len {Number}
	 */
	function furn_set_handle_height(contour, row, len){

		if(row.handle_height_base == -1){
			contour._row.h_ruch = (len / 2).round(0);
			contour._row.fix_ruch = false;
			return true;

		}else if(row.handle_height_base > 0){
			contour._row.h_ruch = row.handle_height_base;
			contour._row.fix_ruch = true;
			return true;

		}
	}

	/**
	 * Аналог УПзП-шного _ПолучитьСпецификациюФурнитурыСФильтром_
	 * @param contour {Contour}
	 * @param cache {Object}
	 * @param furn_set {_cat.furns}
	 * @param [exclude_dop] {Boolean}
	 */
	function furn_get_spec(contour, cache, furn_set, exclude_dop) {

		var res = $p.dp.buyers_order.create().specification;

		// бежим по всем строкам набора
		furn_set.specification.find_rows({dop: 0}, function (row) {

			// проверяем, проходит ли строка
			if(!row.quantity || !furn_check_row_restrictions(contour, cache, furn_set, row))
				return;

			// ищем строки дополнительной спецификации
			if(!exclude_dop){
				furn_set.specification.find_rows({is_main_specification_row: false, elm: row.elm}, function (dop_row) {

					if(!furn_check_row_restrictions(contour, cache, furn_set, dop_row))
						return;

					// расчет координаты и (или) визуализации
					if(dop_row.is_procedure_row){

						var invert = contour.direction == $p.enm.open_directions.Правое,
							invert_nearest = false,
							coordin = 0,
							elm = contour.profile_by_furn_side(dop_row.side, cache),
							len = elm._row.len,
							sizefurn = elm.nom.sizefurn,
							dx0 = (len - elm.data._len) / 2,
							dx1 = $p.job_prm.builder.add_d ? sizefurn : 0,
							faltz = len - 2 * sizefurn;

						if(dop_row.offset_option == $p.enm.offset_options.Формула){


						}else if(dop_row.offset_option == $p.enm.offset_options.РазмерПоФальцу){
							coordin = faltz + dop_row.contraction;

						}else if(dop_row.offset_option == $p.enm.offset_options.ОтРучки){
							// строим горизонтальную линию от нижней границы контура, находим пересечение и offset
							var bounds = contour.bounds,
								by_side = contour.profiles_by_side(),
								hor;
							if(elm == by_side.top || elm == by_side.bottom){
								hor = new paper.Path({
									insert: false,
									segments: [[bounds.left + contour.h_ruch, bounds.top - 200], [bounds.left + contour.h_ruch, bounds.bottom + 200]]
								});
							}else
								hor = new paper.Path({
									insert: false,
									segments: [[bounds.left - 200, bounds.bottom - contour.h_ruch], [bounds.right + 200, bounds.bottom - contour.h_ruch]]
								});

							coordin = elm.generatrix.getOffsetOf(elm.generatrix.intersect_point(hor)) -
								elm.generatrix.getOffsetOf(elm.generatrix.getNearestPoint(elm.corns(1)));

						}else{

							if(invert){

								if(dop_row.offset_option == $p.enm.offset_options.ОтКонцаСтороны){
									coordin = dop_row.contraction;

								}else{
									coordin = len - dop_row.contraction;
								}

							}else{

								if(dop_row.offset_option == $p.enm.offset_options.ОтКонцаСтороны){
									coordin = len - dop_row.contraction;

								}else{
									coordin = dop_row.contraction;
								}
							}
						}

						var procedure_row = res.add(dop_row);
						procedure_row.origin = furn_set;
						procedure_row.handle_height_min = elm.elm;
						procedure_row.handle_height_max = contour.cnstr;
						procedure_row.coefficient = coordin;

						return;

					}else if(!dop_row.quantity)
						return;

					// в зависимости от типа строки, добавляем саму строку или её подчиненную спецификацию
					if(dop_row.is_set_row){
						furn_get_spec(contour, cache, dop_row.nom_set).each(function (sub_row) {

							if(sub_row.is_procedure_row)
								res.add(sub_row);

							else if(!sub_row.quantity)
								return;

							res.add(sub_row).quantity = row.quantity * sub_row.quantity;

						});
					}else{
						res.add(dop_row).origin = furn_set;
					}

				});
			}

			// в зависимости от типа строки, добавляем саму строку или её подчиненную спецификацию
			if(row.is_set_row){
				furn_get_spec(contour, cache, row.nom_set).each(function (sub_row) {

					if(sub_row.is_procedure_row)
						res.add(sub_row);

					else if(!sub_row.quantity)
						return;

					res.add(sub_row).quantity = row.quantity * sub_row.quantity;

				});
			}else{
				res.add(row).origin = furn_set;
			}

		});

		return res;
	}



	/**
	 * Спецификации соединений примыкающих профилей
	 * @param elm {Profile}
	 */
	function cnn_spec_nearest(elm) {
		var nearest = elm.nearest();
		if(nearest && elm.data._nearest_cnn)
			cnn_add_spec(elm.data._nearest_cnn, elm, {
				angle:  0,
				alp1:   0,
				alp2:   0,
				len:    elm.data._len,
				origin: cnn_row(elm.elm, nearest.elm)
			});
	}

	/**
	 * Спецификация профиля
	 * @param elm {Profile}
	 */
	function base_spec_profile(elm) {

		var b, e, prev, next, len_angle,
			_row, row_cnn_prev, row_cnn_next, row_spec;

		_row = elm._row;
		if(_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure)
			return;

		b = elm.rays.b;
		e = elm.rays.e;

		if(!b.cnn || !e.cnn){
			$p.record_log({
				note: "не найдено соединение",
				obj: _row._obj
			});
			return;
		}

		prev = b.profile;
		next = e.profile;
		row_cnn_prev = b.cnn.main_row(elm);
		row_cnn_next = e.cnn.main_row(elm);

		// добавляем строку спецификации
		if(row_cnn_prev || row_cnn_next){
			row_spec = new_spec_row(null, elm, row_cnn_prev || row_cnn_next, _row.nom, cnn_row(_row.elm, prev ? prev.elm : 0));

			// уточняем размер
			row_spec.len = (_row.len - (row_cnn_prev ? row_cnn_prev.sz : 0) - (row_cnn_next ? row_cnn_next.sz : 0))
				* ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

			// profile.Длина - то, что получится после обработки
			// row_spec.Длина - сколько взять (отрезать)
			elm.data._len = _row.len;
			_row.len = (_row.len
				- (!row_cnn_prev || row_cnn_prev.angle_calc_method == $p.enm.angle_calculating_ways.СварнойШов ? 0 : row_cnn_prev.sz)
				- (!row_cnn_next || row_cnn_next.angle_calc_method == $p.enm.angle_calculating_ways.СварнойШов ? 0 : row_cnn_next.sz))
				* 1000 * ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

			// припуск для гнутых элементов
			if(!elm.is_linear())
				row_spec.len = row_spec.len + _row.nom.arc_elongation / 1000;

			// дополнительная корректировка формулой - здесь можно изменить размер, номенклатуру и вообще, что угодно в спецификации
			if(row_cnn_prev && !row_cnn_prev.formula.empty()){
				row_cnn_prev.formula.execute({
					ox: ox,
					elm: elm,
					row_cnn: row_cnn_prev,
					row_spec: row_spec
				});

			}else if(row_cnn_next && !row_cnn_next.formula.empty()){
				row_cnn_next.formula.execute({
					ox: ox,
					elm: elm,
					row_cnn: row_cnn_next,
					row_spec: row_spec
				});
			}

			// РассчитатьКоличествоПлощадьМассу
			calc_count_area_mass(row_spec, _row, row_cnn_prev ? row_cnn_prev.angle_calc_method : null, row_cnn_next ? row_cnn_next.angle_calc_method : null);
		}

		// НадоДобавитьСпецификациюСоединения
		if(cnn_need_add_spec(b.cnn, _row.elm, prev ? prev.elm : 0)){

			len_angle = {
				angle: 0,
				alp1: prev ? prev.generatrix.angle_to(elm.generatrix, elm.b, true) : 90,
				alp2: next ? elm.generatrix.angle_to(next.generatrix, elm.e, true) : 90
				// art1: true TODO: учесть art-1-2
			};

			if(b.cnn.cnn_type == $p.enm.cnn_types.ТОбразное || b.cnn.cnn_type == $p.enm.cnn_types.НезамкнутыйКонтур){
				// соединение Т-образное или незамкнутый контур: для них арт 1-2 не используется

				// для него надо рассчитать еще и с другой стороны
				if(cnn_need_add_spec(e.cnn, next ? next.elm : 0, _row.elm)){
					//	TODO: ДополнитьСпецификациюСпецификациейСоединения(СтруктураПараметров, СтрК, ДлиныУглыСлед, СоедСлед, След);
				}
			}

			// для раскладок доппроверка
			//Если СтрК.ТипЭлемента = Перечисления.пзТипыЭлементов.Раскладка И (СоедСлед != Неопределено)
			//	И (СоедСлед.ТипСоединения = Перечисления.пзТипыСоединений.ТОбразное
			//	Или СоедСлед.ТипСоединения = Перечисления.пзТипыСоединений.НезамкнутыйКонтур) Тогда
			//	Если НадоДобавитьСпецификациюСоединения(СтруктураПараметров, СоедСлед, СтрК, След) Тогда
			//		ДлиныУглыСлед.Вставить("ДлинаСоединения", СтрК.Длина);
			//		ДополнитьСпецификациюСпецификациейСоединения(СтруктураПараметров, СтрК, ДлиныУглыСлед, СоедСлед, След);
			//	КонецЕсли;
			//КонецЕсли;

			// спецификацию с предыдущей стороны рассчитваем всегда
			cnn_add_spec(b.cnn, elm, len_angle);

		}


		// спецификация вставки
		inset_spec(elm);

		// если у профиля есть примыкающий родительский элемент, добавим спецификацию II соединения
		cnn_spec_nearest(elm);

		// если у профиля есть доборы, добавляем их спецификации
		elm.addls.forEach(base_spec_profile);

	}

	/**
	 * Спецификация заполнения
	 * @param glass {Filling}
	 */
	function base_spec_glass(glass) {

		var curr, prev, next, len_angle, _row, row_cnn;

		var profiles = glass.profiles,
			glength = profiles.length;

		_row = glass._row;

		// для всех рёбер заполнения
		for(var i=0; i<glength; i++ ){
			curr = profiles[i];
			prev = (i==0 ? profiles[glength-1] : profiles[i-1]).profile;
			next = (i==glength-1 ? profiles[0] : profiles[i+1]).profile;
			row_cnn = cnn_elmnts.find_rows({elm1: _row.elm, elm2: curr.profile.elm});

			len_angle = {
				angle: 0,
				alp1: prev.generatrix.angle_to(curr.profile.generatrix, curr.b, true),
				alp2: curr.profile.generatrix.angle_to(next.generatrix, curr.e, true),
				len: row_cnn.length ? row_cnn[0].aperture_len : 0,
				origin: cnn_row(_row.elm, curr.profile.elm)

			};

			// добавляем спецификацию соединения рёбер заполнения с профилем
			cnn_add_spec(curr.cnn, curr.profile, len_angle);

		}

		// добавляем спецификацию вставки в заполнение
		inset_spec(glass);

		// TODO: для всех раскладок заполнения
	}

	/**
	 * Спецификация вставки элемента
	 * @param elm {BuilderElement}
	 */
	function inset_spec(elm, inset, len_angl) {

		var _row = elm._row;

		if(!inset)
			inset = elm.inset;

		inset_filter_spec(inset, elm, true, len_angl).forEach(function (row_ins_spec) {

			var row_spec;

			// добавляем строку спецификации, если профиль или не про шагам
			if((row_ins_spec.count_calc_method != $p.enm.count_calculating_ways.ПоПериметру
				&& row_ins_spec.count_calc_method != $p.enm.count_calculating_ways.ПоШагам) ||
				$p.enm.elm_types.profile_items.indexOf(_row.elm_type) != -1)
				row_spec = new_spec_row(null, elm, row_ins_spec, null, inset);

			if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоФормуле && !row_ins_spec.formula.empty()){

				// если строка спецификации не добавлена на предыдущем шаге, делаем это сейчас
				row_spec = new_spec_row(row_spec, elm, row_ins_spec, null, inset);

				// выполняем формулу
				row_ins_spec.formula.execute({
					ox: ox,
					elm: elm,
					row_ins: row_ins_spec,
					row_spec: row_spec
				});

			}else if($p.enm.elm_types.profile_items.indexOf(_row.elm_type) != -1 ||
				row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ДляЭлемента){
				// для вставок в профиль способ расчета количество не учитывается
				calc_qty_len(row_spec, row_ins_spec, len_angl ? len_angl.len : _row.len);

			}else{

				if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоПлощади){
					row_spec.len = (_row.y2 - _row.y1 - row_ins_spec.sz)/1000;
					row_spec.width = (_row.x2 - _row.x1 - row_ins_spec.sz)/1000;
					row_spec.s = _row.s;

				}else if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоПериметру){
					var row_prm = {_row: {len: 0, angle_hor: 0, s: _row.s}};
					elm.perimeter.forEach(function (rib) {
						row_prm._row._mixin(rib);
						if(inset_check(row_ins_spec, row_prm, true)){
							row_spec = new_spec_row(null, elm, row_ins_spec, null, inset);
							calc_qty_len(row_spec, row_ins_spec, rib.len);
							calc_count_area_mass(row_spec, _row, row_ins_spec.angle_calc_method);
						}
						row_spec = null;
					});

				}else if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоШагам){

					var h = _row.y2 - _row.y1, w = _row.x2 - _row.x1;
					if((row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьШагиВторогоНаправления ||
						row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьВтороеНаправление) && row_ins_spec.step){

						for(var i = 1; i <= Math.ceil(h / row_ins_spec.step); i++){
							row_spec = new_spec_row(null, elm, row_ins_spec, null, inset);
							calc_qty_len(row_spec, row_ins_spec, w);
							calc_count_area_mass(row_spec, _row, row_ins_spec.angle_calc_method);
						}
						row_spec = null;
					}

				}else{
					throw new Error("count_calc_method: " + row_ins_spec.count_calc_method);
				}

			}

			if(row_spec)
				calc_count_area_mass(row_spec, _row, row_ins_spec.angle_calc_method);

		});
	}

	/**
	 * Основная cпецификация по соединениям и вставкам таблицы координат
	 * @param scheme {Scheme}
	 */
	function base_spec(scheme) {

		// сбрасываем структуру обработанных соединений
		added_cnn_spec = {};

		// для всех контуров изделия
		scheme.getItems({class: $p.Editor.Contour}).forEach(function (contour) {

			// для всех профилей контура
			contour.profiles.forEach(base_spec_profile);

			// для всех заполнений контура
			contour.glasses(false, true).forEach(base_spec_glass);

			// фурнитура контура
			furn_spec(contour);

		});

	}

	/**
	 * Пересчет спецификации при записи изделия
	 */
	$p.eve.attachEvent("save_coordinates", function (scheme, attr) {

		//console.time("base_spec");
		//console.profile();


		// ссылки для быстрого доступа к свойствам обхекта продукции
		ox = scheme.ox;
		spec = ox.specification;
		constructions = ox.constructions;
		coordinates = ox.coordinates;
		cnn_elmnts = ox.cnn_elmnts;
		glass_specification = ox.glass_specification;
		glass_formulas = {};
		params = ox.params;

		// чистим спецификацию
		spec.clear();

		// рассчитываем базовую сецификацию
		base_spec(scheme);

		// сворачиваем
		spec.group_by("nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop", "qty,totqty,totqty1");


		//console.timeEnd("base_spec");
		//console.profileEnd();


		// информируем мир об окончании расчета координат
		$p.eve.callEvent("coordinates_calculated", [scheme, attr]);


		// рассчитываем цены

		// типы цен получаем заранее, т.к. они пригодятся при расчете корректировки спецификации
		var prm = {
			calc_order_row: ox.calc_order_row,
			spec: spec
		};
		if(prm.calc_order_row){

			$p.pricing.price_type(prm);

			// производим корректировку спецификации с возможным вытягиванием строк в заказ и удалением строк из заказа
			$p.spec_building.specification_adjustment(prm);

			// рассчитываем плановую себестоимость
			$p.pricing.calc_first_cost(prm);

			// рассчитываем стоимость продажи
			$p.pricing.calc_amount(prm);
		}



		// информируем мир о завершении пересчета
		if(attr.snapshot){
			$p.eve.callEvent("scheme_snapshot", [scheme, attr]);
		}

		// информируем мир о записи продукции
		if(attr.save){

			// сохраняем картинку вместе с изделием
			ox.save(undefined, undefined, {
				svg: {
					"content_type": "image/svg+xml",
					"data": new Blob([scheme.get_svg()], {type: "image/svg+xml"})
				}
			})
				.then(function () {
					$p.msg.show_msg("Спецификация рассчитана");
					delete scheme.data._saving;
					$p.eve.callEvent("characteristic_saved", [scheme, attr]);
				});

		}else{
			delete scheme.data._saving;
		}

	});

}


$p.products_building = new ProductsBuilding();


/**
 * Аналог УПзП-шного __ФормированиеСпецификацийСервер__
 * Содержит методы расчета спецификации без привязки к построителю. Например, по регистру корректировки спецификации 
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module  glob_spec_building
 * Created 26.05.2015
 */

function SpecBuilding(){

	/**
	 * Рассчитывает спецификацию в строке документа Расчет
	 * Аналог УПзП-шного __РассчитатьСпецификациюСтроки__
	 * @param prm
	 * @param cancel
	 */
	this.calc_row_spec = function (prm, cancel) {

	};

	/**
	 * Аналог УПзП-шного РассчитатьСпецификацию_ПривязкиВставок
	 * @param attr
	 */
	this.specification_adjustment = function (attr) {

		var adel = [];

		// удаляем строки, добавленные предыдущими корректировками
		attr.spec.find_rows({ch: {in: [-1,-2]}}, function (row) {
			adel.push(row);
		});
		adel.forEach(function (row) {
			attr.spec.del(row, true);
		});


	}

}

$p.spec_building = new SpecBuilding();




/**
 * ### Модуль менеджера и документа Расчет-заказ
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module doc_calc_order
 */

// переопределяем формирование списка выбора
$p.doc.calc_order.metadata().tabular_sections.production.fields.characteristic._option_list_local = true;

// подписки на события
$p.doc.calc_order.on({

	// после создания надо заполнить реквизиты по умолчанию: контрагент, организация, договор
	after_create: function (attr) {

		var acl = $p.current_acl.acl_objs,
			obj = this;

		//Организация
		acl.find_rows({
			by_default: true,
			type: $p.cat.organizations.metadata().obj_presentation || $p.cat.organizations.metadata().name}, function (row) {
			obj.organization = row.acl_obj;
			return false;
		});

		//Подразделение
		acl.find_rows({
			by_default: true,
			type: $p.cat.divisions.metadata().obj_presentation || $p.cat.divisions.metadata().name}, function (row) {
			obj.department = row.acl_obj;
			return false;
		});

		//Контрагент
		acl.find_rows({
			by_default: true,
			type: $p.cat.partners.metadata().obj_presentation || $p.cat.partners.metadata().name}, function (row) {
			obj.partner = row.acl_obj;
			return false;
		});

		//Договор
		obj.contract = $p.cat.contracts.by_partner_and_org(obj.partner, obj.organization);

		//Менеджер
		obj.manager = $p.current_user;

		//СостояниеТранспорта
		obj.obj_delivery_state = $p.enm.obj_delivery_states.Черновик;

		//Номер документа
		return obj.new_number_doc();

	},

	// перед записью надо присвоить номер для нового и рассчитать итоги
	before_save: function (attr) {

		doc_amount = 0;
		amount_internal = 0;
		sys_profile = "";
		sys_furn = "";

		// если установлен признак проведения, проверим состояние транспорта
		if(this.posted){
			if (this.obj_delivery_state == $p.enm.obj_delivery_states.Отклонен ||
				this.obj_delivery_state == $p.enm.obj_delivery_states.Отозван ||
				this.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон){

				$p.msg.show_msg({
					type: "alert-warning",
					text: "Нельзя провести заказ со статусом<br/>'Отклонён', 'Отозван' или 'Шаблон'",
					title: this.presentation
				});

				return false;

			}else if(this.obj_delivery_state != $p.enm.obj_delivery_states.Подтвержден){
				this.obj_delivery_state = $p.enm.obj_delivery_states.Подтвержден;

			}
		}else if(this.obj_delivery_state == $p.enm.obj_delivery_states.Подтвержден){
			this.obj_delivery_state = $p.enm.obj_delivery_states.Отправлен;
		}

		this.production.each(function (row) {

			doc_amount += row.amount;
			amount_internal += row.amount_internal;

			var name;
			if(!row.characteristic.calc_order.empty()){

				name = row.nom.article || row.nom.nom_group.name || row.nom.id.substr(0, 3);
				if(sys_profile.indexOf(name) == -1){
					if(sys_profile)
						sys_profile += " ";
					sys_profile += name;
				}

				row.characteristic.constructions.each(function (row) {
					if(row.parent && !row.furn.empty()){
						name = row.furn.name_short || row.furn.name;
						if(sys_furn.indexOf(name) == -1){
							if(sys_furn)
								sys_furn += " ";
							sys_furn += name;
						}
					}
				});
			}
		});

		this.doc_amount = doc_amount;
		this.amount_internal = amount_internal;
		this.sys_profile = sys_profile;
		this.sys_furn = sys_furn;
		this.amount_operation = $p.pricing.from_currency_to_currency(doc_amount, this.date, this.doc_currency);

		this._obj.partner_name = this.partner.name;
	},

	// при изменении реквизита
	value_change: function (attr) {

		// реквизиты шапки
		if(attr.field == "organization" && this.contract.organization != attr.value){
			this.contract = $p.cat.contracts.by_partner_and_org(this.partner, attr.value);

		}else if(attr.field == "partner" && this.contract.owner != attr.value){
			this.contract = $p.cat.contracts.by_partner_and_org(attr.value, this.organization);

			// табчасть продукции
		}else if(attr.tabular_section == "production"){

			if(attr.field == "nom" || attr.field == "characteristic"){

			}else if(attr.field == "price" || attr.field == "price_internal" || attr.field == "quantity" ||
				attr.field == "discount_percent" || attr.field == "discount_percent_internal"){

				attr.row[attr.field] = attr.value;

				attr.row.amount = (attr.row.price * ((100 - attr.row.discount_percent)/100) * attr.row.quantity).round(2);

				// если есть внешняя цена дилера, получим текущую дилерскую наценку
				if(!attr.no_extra_charge){
					var prm = {calc_order_row: attr.row};
					$p.pricing.price_type(prm);
					if(prm.price_type.extra_charge_external)
						attr.row.price_internal = (attr.row.price * (100 - attr.row.discount_percent)/100 * (100 + prm.price_type.extra_charge_external)/100).round(2);
				}

				attr.row.amount_internal = (attr.row.price_internal * ((100 - attr.row.discount_percent_internal)/100) * attr.row.quantity).round(2);

				this.doc_amount = this.production.aggregate([], ["amount"]).round(2);
				this.amount_internal = this.production.aggregate([], ["amount_internal"]).round(2);

				// TODO: учесть валюту документа, которая может отличаться от валюты упр. учета и решить вопрос с amount_operation

			}

		}
	}
});

// свойства и методы объекта
$p.DocCalc_order.prototype.__define({


	/**
	 * Возвращает валюту документа
	 */
	doc_currency: {
		get: function () {
			var currency = this.contract.settlements_currency;
			return currency.empty() ? $p.job_prm.pricing.main_currency : currency;
		}
	},

	/**
	 * Возвращает данные для печати
	 */
	print_data: {
		get: function () {
			var our_bank_account = this.organizational_unit && !this.organizational_unit.empty() && this.organizational_unit._manager == cat.organization_bank_accounts ?
					this.organizational_unit : this.organization.main_bank_account,
				get_imgs = [];

			// заполняем res теми данными, которые доступны синхронно
			var res = {
				АдресДоставки: this.shipping_address,
				ВалютаДокумента: this.doc_currency.presentation,
				ДатаЗаказаФорматD: $p.moment(this.date).format("L"),
				ДатаЗаказаФорматDD: $p.moment(this.date).format("LL"),
				ДатаТекущаяФорматD: $p.moment().format("L"),
				ДатаТекущаяФорматDD: $p.moment().format("LL"),
				ДоговорДатаФорматD: $p.moment(this.contract.date.valueOf() == $p.utils.blank.date.valueOf() ? this.date : this.contract.date).format("L"),
				ДоговорДатаФорматDD: $p.moment(this.contract.date.valueOf() == $p.utils.blank.date.valueOf() ? this.date : this.contract.date).format("LL"),
				ДоговорНомер: this.contract.number_doc ? this.contract.number_doc : this.number_doc,
				ДоговорСрокДействия: $p.moment(this.contract.validity).format("L"),
				ЗаказНомер: this.number_doc,
				Контрагент: this.partner.presentation,
				КонтрагентОписание: this.partner.long_presentation,
				КонтрагентДокумент: "",
				КонтрагентКЛДолжность: "",
				КонтрагентКЛДолжностьРП: "",
				КонтрагентКЛИмя: "",
				КонтрагентКЛИмяРП: "",
				КонтрагентКЛК: "",
				КонтрагентКЛОснованиеРП: "",
				КонтрагентКЛОтчество: "",
				КонтрагентКЛОтчествоРП: "",
				КонтрагентКЛФамилия: "",
				КонтрагентКЛФамилияРП: "",
				КонтрагентЮрФизЛицо: "",
				КратностьВзаиморасчетов: this.settlements_multiplicity,
				КурсВзаиморасчетов: this.settlements_course,
				ЛистКомплектацииГруппы: "",
				ЛистКомплектацииСтроки: "",
				Организация: this.organization.presentation,
				ОрганизацияГород: this.organization.contact_information._obj.reduce(function (val, row) { return val || row.city }, "") || "Москва",
				ОрганизацияАдрес: this.organization.contact_information._obj.reduce(function (val, row) {

					if(row.kind == $p.cat.contact_information_kinds.predefined("ЮрАдресОрганизации") && row.presentation)
						return row.presentation;

					else if(val)
						return val;

					else if(row.presentation && (
							row.kind == $p.cat.contact_information_kinds.predefined("ФактАдресОрганизации") ||
							row.kind == $p.cat.contact_information_kinds.predefined("ПочтовыйАдресОрганизации")
						))
						return row.presentation;

				}, ""),
				ОрганизацияТелефон: this.organization.contact_information._obj.reduce(function (val, row) {

					if(row.kind == $p.cat.contact_information_kinds.predefined("ТелефонОрганизации") && row.presentation)
						return row.presentation;

					else if(val)
						return val;

					else if(row.kind == $p.cat.contact_information_kinds.predefined("ФаксОрганизации") && row.presentation)
						return row.presentation;

				}, ""),
				ОрганизацияБанкБИК: our_bank_account.bank.id,
				ОрганизацияБанкГород: our_bank_account.bank.city,
				ОрганизацияБанкКоррСчет: our_bank_account.bank.correspondent_account,
				ОрганизацияБанкНаименование: our_bank_account.bank.name,
				ОрганизацияБанкНомерСчета: our_bank_account.account_number,
				ОрганизацияИндивидуальныйПредприниматель: this.organization.individual_entrepreneur.presentation,
				ОрганизацияИНН: this.organization.inn,
				ОрганизацияКПП: this.organization.kpp,
				ОрганизацияСвидетельствоДатаВыдачи: this.organization.certificate_date_issue,
				ОрганизацияСвидетельствоКодОргана: this.organization.certificate_authority_code,
				ОрганизацияСвидетельствоНаименованиеОргана: this.organization.certificate_authority_name,
				ОрганизацияСвидетельствоСерияНомер: this.organization.certificate_series_number,
				ОрганизацияЮрФизЛицо: this.organization.individual_legal.presentation,
				ПродукцияЭскизы: {},
				Проект: this.project.presentation,
				СистемыПрофилей: this.sys_profile,
				СистемыФурнитуры: this.sys_furn,
				Сотрудник: this.manager.presentation,
				СотрудникДолжность: this.manager.individual_person.Должность || "менеджер",
				СотрудникДолжностьРП: this.manager.individual_person.ДолжностьРП,
				СотрудникИмя: this.manager.individual_person.Имя,
				СотрудникИмяРП: this.manager.individual_person.ИмяРП,
				СотрудникОснованиеРП: this.manager.individual_person.ОснованиеРП,
				СотрудникОтчество: this.manager.individual_person.Отчество,
				СотрудникОтчествоРП: this.manager.individual_person.ОтчествоРП,
				СотрудникФамилия: this.manager.individual_person.Фамилия,
				СотрудникФамилияРП: this.manager.individual_person.ФамилияРП,
				СотрудникФИО: this.manager.individual_person.Фамилия +
				(this.manager.individual_person.Имя ? " " + this.manager.individual_person.Имя[1].toUpperCase() + "." : "" )+
				(this.manager.individual_person.Отчество ? " " + this.manager.individual_person.Отчество[1].toUpperCase() + "." : ""),
				СотрудникФИОРП: this.manager.individual_person.ФамилияРП + " " + this.manager.individual_person.ИмяРП + " " + this.manager.individual_person.ОтчествоРП,
				СуммаДокумента: this.doc_amount.toFixed(2),
				СуммаДокументаПрописью: this.doc_amount.in_words(),
				СуммаДокументаБезСкидки: this.production._obj.reduce(function (val, row){
					return val + row.quantity * row.price;
				}, 0).toFixed(2),
				СуммаСкидки: this.production._obj.reduce(function (val, row){
					return val + row.discount;
				}, 0).toFixed(2),
				СуммаНДС: this.production._obj.reduce(function (val, row){
					return val + row.vat_amount;
				}, 0).toFixed(2),
				ТекстНДС: this.vat_consider ? (this.vat_included ? "В том числе НДС 18%" : "НДС 18% (сверху)") : "Без НДС",
				ТелефонПоАдресуДоставки: this.phone,
				СуммаВключаетНДС: this.contract.vat_included,
				УчитыватьНДС: this.contract.vat_consider,
				ВсегоНаименований: this.production.count(),
				ВсегоИзделий: 0,
				ВсегоПлощадьИзделий: 0
			};

			// дополняем значениями свойств
			this.extra_fields.forEach(function (row) {
				res["Свойство" + row.property.name.replace(/\s/g,"")] = row.value.presentation || row.value;
			});

			// TODO: дополнить датами доставки и монтажа
			if(!this.shipping_address)
				res.МонтажДоставкаСамовывоз = "Самовывоз";
			else
				res.МонтажДоставкаСамовывоз = "Монтаж по адресу: " + this.shipping_address;

			// получаем логотип организации
			for(var key in this.organization._attachments){
				if(key.indexOf("logo") != -1){
					get_imgs.push(this.organization.get_attachment(key)
						.then(function (blob) {
							return $p.utils.blob_as_text(blob, blob.type.indexOf("svg") == -1 ? "data_url" : "")
						})
						.then(function (data_url) {
							res.ОрганизацияЛоготип = data_url;
						})
						.catch($p.record_log));
					break;
				}
			}

			// получаем эскизы продукций, параллельно накапливаем количество и площадь изделий
			this.production.forEach(function (row) {

				if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory){

					res.ВсегоИзделий+= row.quantity;
					res.ВсегоПлощадьИзделий+= row.quantity * row.s;

					get_imgs.push($p.cat.characteristics.get_attachment(row.characteristic.ref, "svg")
						.then(function (blob) {
							return $p.utils.blob_as_text(blob)
						})
						.then(function (svg_text) {
							res.ПродукцияЭскизы[row.characteristic.ref] = svg_text;
						})
						.catch($p.record_log));
				}
			});
			res.ВсегоПлощадьИзделий = res.ВсегоПлощадьИзделий.round(3);

			return (get_imgs.length ? Promise.all(get_imgs) : Promise.resolve([]))
				.then(function () {

					if(!window.QRCode)
						return new Promise(function(resolve, reject){
							$p.load_script("lib/qrcodejs/qrcode.js", "script", resolve);
						});

				})
				.then(function () {

					var svg = document.createElement("SVG");
					svg.innerHTML = "<g />";
					var qrcode = new QRCode(svg, {
						text: "http://www.oknosoft.ru/zd/",
						width: 100,
						height: 100,
						colorDark : "#000000",
						colorLight : "#ffffff",
						correctLevel : QRCode.CorrectLevel.H,
						useSVG: true
					});
					res.qrcode = svg.innerHTML;

					return res;
				});
		}
	},

	/**
	 * Возвращает струклуру с описанием строки продукции для печати
	 */
	row_description: {
		value: function (row) {

			var product = row.characteristic,
				res = {
					НомерСтроки: row.row,
					Количество: row.quantity,
					Ед: row.unit.name || "шт",
					Цвет: product.clr.name,
					Размеры: row.len + "x" + row.width + ", " + row.s + "м²",
					Номенклатура: row.nom.name_full || row.nom.name,
					Характеристика: product.name,
					Заполнения: "",
					Цена: row.price,
					ЦенаВнутр: row.price_internal,
					СкидкаПроцент: row.discount_percent,
					СкидкаПроцентВнутр: row.discount_percent_internal,
					Скидка: row.discount,
					Сумма: row.amount,
					СуммаВнутр: row.amount_internal
				};

			product.glasses.forEach(function (row) {
				if(res.Заполнения.indexOf(row.nom.name) == -1){
					if(res.Заполнения)
						res.Заполнения += ", ";
					res.Заполнения += row.nom.name;
				}
			});

			return res;
		}
	},

	/**
	 * Заполняет табчасть планирования данными по умолчанию
	 */
	fill_plan: {
		value: function (confirmed) {

			// если табчасть не пустая - задаём вопрос
			if(this.planning.count() && !confirmed){
				dhtmlx.confirm({
					title: $p.msg.main_title,
					text: $p.msg.tabular_will_cleared.replace('%1', "Планирование"),
					cancel: $p.msg.cancel,
					callback: function(btn) {
						if(btn){
							this.fill_plan(true);
						}
					}.bind(this)
				});
				return;
			}

			this.planning.clear();

		}
	}


});


/**
 * форма списка документов Расчет-заказ. публикуемый метод: doc.calc_order.form_list(o, pwnd, attr)
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * 
 * @module doc_calc_order_form_list
 */


$p.doc.calc_order.form_list = function(pwnd, attr){

	if(!attr)
		attr = {
			hide_header: true,
			date_from: new Date((new Date()).getFullYear().toFixed() + "-01-01"),
			date_till: new Date((new Date()).getFullYear().toFixed() + "-12-31"),
			on_new: function (o) {
				$p.iface.set_hash(this.class_name, o.ref, "doc");
			},
			on_edit: function (_mgr, rId) {
				$p.iface.set_hash(_mgr.class_name, rId, "doc");
			}
		};

	// разбивка на 2 колонки - дерево и карусель
	var layout = pwnd.attachLayout({
			pattern: "2U",
			cells: [{
				id: "a",
				text: "Фильтр",
				collapsed_text: "Фильтр",
				width: 180
			}, {
				id: "b",
				text: "Заказы",
				header: false
			}],
			offsets: { top: 0, right: 0, bottom: 0, left: 0}
		}),

		tree = layout.cells("a").attachTreeView({
			iconset: "font_awesome"
		}),

		carousel = layout.cells("b").attachCarousel({
			keys:           false,
			touch_scroll:   false,
			offset_left:    0,
			offset_top:     0,
			offset_item:    0
		});

	// страницы карусели
	carousel.hideControls();
	carousel.addCell("list");
	carousel.addCell("report");
	carousel.conf.anim_step = 200;
	carousel.conf.anim_slide = "left 0.1s";

	var wnd = this.form_selection(carousel.cells("list"), attr),
		report;

	// настраиваем фильтр для списка заказов
	wnd.elmnts.filter.custom_selection._view = {
		get value() {
			switch(tree.getSelectedId()) {

				case 'draft':
				case 'sent':
				case 'declined':
				case 'confirmed':
				case 'service':
				case 'complaints':
				case 'template':
				case 'zarchive':
					return 'doc/by_date';

				case 'execution':
				case 'plan':
				case 'underway':
				case 'manufactured':
				case 'executed':
				case 'all':
					return '';
			}
		}
	};
	wnd.elmnts.filter.custom_selection._key = {
		get value(){
			var key, id;

			switch(id = tree.getSelectedId()) {

				case 'draft':
				case 'sent':
				case 'declined':
				case 'confirmed':
				case 'service':
				case 'complaints':
				case 'template':
				case 'zarchive':
					key = id;
					break;

				case 'execution':
				case 'plan':
				case 'underway':
				case 'manufactured':
				case 'executed':
				case 'all':
					return '';
			}

			var filter = wnd.elmnts.filter.get_filter(true);
			return {
				startkey: [key, filter.date_from.getFullYear(), filter.date_from.getMonth()+1, filter.date_from.getDate()],
				endkey: [key, filter.date_till.getFullYear(), filter.date_till.getMonth()+1, filter.date_till.getDate()],
				_drop_date: true,
				_order_by: true,
				_search: filter.filter.toLowerCase()
			};
		}
	};

	// картинка заказа в статусбаре
	wnd.elmnts.svgs = new $p.iface.OSvgs(this, wnd, wnd.elmnts.status_bar);
	wnd.elmnts.grid.attachEvent("onRowSelect", function (rid) {
		wnd.elmnts.svgs.reload(rid);
	});

	// настраиваем дерево
	tree.loadStruct($p.injected_data["tree_filteres.xml"]);
	tree.attachEvent("onSelect", function (rid, mode) {

		if(!mode)
			return;

		// переключаем страницу карусели
		switch(rid) {

			case 'draft':
			case 'sent':
			case 'declined':
			case 'confirmed':
			case 'service':
			case 'complaints':
			case 'template':
			case 'zarchive':
			case 'all':
				carousel.cells("list").setActive();
				wnd.elmnts.filter.call_event();
				return;
		}

		build_report(rid);

	});

	function build_report(rid) {

		carousel.cells("report").setActive();

		function show_report() {

			switch(rid) {

				case 'execution':
					$p.doc.calc_order.rep_invoice_execution(report);
					break;

				case 'plan':
				case 'underway':
				case 'manufactured':
				case 'executed':

					$p.doc.calc_order.rep_planing(report, rid);
					break;
			}

		}

		if(!report){

			report = new $p.HandsontableDocument(carousel.cells("report"), {})

				.then(function (rep) {

					if(!rep._online)
						return report = null;

					show_report();


				});

		}else if(report._online){

			show_report();
		}


	}

	return wnd;
};


/**
 * форма документа Расчет-заказ. публикуемый метод: doc.calc_order.form_obj(o, pwnd, attr)
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * 
 * @module doc_calc_order_form_obj
 */

(function($p){

	var _mgr = $p.doc.calc_order,
		_meta_patched;


	_mgr.form_obj = function(pwnd, attr){

		var o, wnd, evts = [], attr_on_close = attr.on_close;

		/**
		 * структура заголовков табчасти продукции
		 * @param source
		 */
		if(!_meta_patched){
			(function(source){
				// TODO: штуки сейчас спрятаны в ro и имеют нулевую ширину
				if($p.wsql.get_user_param("hide_price_dealer")){
					source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка,Цена,Сумма,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил";
					source.widths = "40,200,*,220,0,70,70,70,70,40,70,70,70,0,0,0";
					source.min_widths = "30,200,220,150,0,70,40,70,70,70,70,70,70,0,0,0";

				}else if($p.wsql.get_user_param("hide_price_manufacturer")){
					source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка,Цена,Сумма";
					source.widths = "40,200,*,220,0,70,70,70,70,40,0,0,0,70,70,70";
					source.min_widths = "30,200,220,150,0,70,40,70,70,70,0,0,0,70,70,70";

				}else{
					source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил";
					source.widths = "40,200,*,220,0,70,70,70,70,40,70,70,70,70,70,70";
					source.min_widths = "30,200,220,150,0,70,40,70,70,70,70,70,70,70,70,70";
				}

				if($p.current_acl.role_available("СогласованиеРасчетовЗаказов") || $p.current_acl.role_available("РедактированиеСкидок"))
					source.types = "cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,calck,calck,ro,calck,calck,ro";
				else
					source.types = "cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,ro,ro,ro,calck,calck,ro";

			})($p.doc.calc_order.metadata().form.obj.tabular_sections.production);
			_meta_patched = true;
		}

		attr.draw_tabular_sections = function (o, wnd, tabular_init) {

			/**
			 * получим задействованные в заказе объекты характеристик
			 */
			var refs = [];
			o.production.each(function (row) {
				if(!$p.utils.is_empty_guid(row._obj.characteristic) && row.characteristic.is_new())
					refs.push(row._obj.characteristic);
			});
			$p.cat.characteristics.pouch_load_array(refs)
				.then(function () {

					// табчасть продукции со специфическим набором кнопок
					tabular_init("production", $p.injected_data["toolbar_calc_order_production.xml"]);

					var toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
					toolbar.addSpacer("btn_delete");
					toolbar.attachEvent("onclick", toolbar_click);

					// табчасть планирования
					tabular_init("planning");
					toolbar = wnd.elmnts.tabs.tab_planning.getAttachedToolbar();
					toolbar.addButton("btn_fill_plan", 3, "Заполнить");
					toolbar.attachEvent("onclick", toolbar_click);


					// попап для присоединенных файлов
					wnd.elmnts.discount_pop = new dhtmlXPopup({
						toolbar: toolbar,
						id: "btn_discount"
					});
					wnd.elmnts.discount_pop.attachEvent("onShow", show_discount);

					// в зависимости от статуса
					setTimeout(set_editable, 50);

				});

			/**
			 *	статусбар с картинками
			 */
			wnd.elmnts.statusbar = wnd.attachStatusBar({text: "<div></div>"});
			wnd.elmnts.svgs = new $p.iface.OSvgs($p.doc.calc_order, wnd, wnd.elmnts.statusbar);
			wnd.elmnts.svgs.reload(o);

		};

		attr.draw_pg_header = function (o, wnd) {

			function layout_resize_finish() {
				setTimeout(function () {
					if(wnd.elmnts.layout_header.setSizes){
						wnd.elmnts.layout_header.setSizes();
						wnd.elmnts.pg_left.objBox.style.width = "100%";
						wnd.elmnts.pg_right.objBox.style.width = "100%";
					}
				}, 200);
			}

			/**
			 *	закладка шапка
			 */
			wnd.elmnts.layout_header = wnd.elmnts.tabs.tab_header.attachLayout('3U');

			wnd.elmnts.layout_header.attachEvent("onResizeFinish", layout_resize_finish);

			wnd.elmnts.layout_header.attachEvent("onPanelResizeFinish", layout_resize_finish);

			/**
			 *	левая колонка шапки документа
			 */
			wnd.elmnts.cell_left = wnd.elmnts.layout_header.cells('a');
			wnd.elmnts.cell_left.hideHeader();
			wnd.elmnts.pg_left = wnd.elmnts.cell_left.attachHeadFields({
				obj: o,
				pwnd: wnd,
				read_only: wnd.elmnts.ro,
				oxml: {
					" ": [{id: "number_doc", path: "o.number_doc", synonym: "Номер", type: "ro", txt: o.number_doc},
						{id: "date", path: "o.date", synonym: "Дата", type: "ro", txt: $p.moment(o.date).format($p.moment._masks.date_time)},
						"number_internal"
					],
					"Контактная информация": ["partner", "client_of_dealer", "phone",
						{id: "shipping_address", path: "o.shipping_address", synonym: "Адрес доставки", type: "addr", txt: o["shipping_address"]}
					],
					"Дополнительные реквизиты": [
						{id: "obj_delivery_state", path: "o.obj_delivery_state", synonym: "Состояние транспорта", type: "ro", txt: o["obj_delivery_state"].presentation},
						"category"
					]
				}
			});

			/**
			 *	правая колонка шапки документа
			 * TODO: задействовать либо удалить choice_links
			 * var choice_links = {contract: [
				 * {name: ["selection", "owner"], path: ["partner"]},
				 * {name: ["selection", "organization"], path: ["organization"]}
				 * ]};
			 */

			wnd.elmnts.cell_right = wnd.elmnts.layout_header.cells('b');
			wnd.elmnts.cell_right.hideHeader();
			wnd.elmnts.pg_right = wnd.elmnts.cell_right.attachHeadFields({
				obj: o,
				pwnd: wnd,
				read_only: wnd.elmnts.ro,
				oxml: {
					"Налоги": ["vat_consider", "vat_included"],
					"Аналитика": ["project",
						{id: "organization", path: "o.organization", synonym: "Организация", type: "refc", txt: o["organization"].presentation},
						"contract", "organizational_unit", "department"],
					"Итоги": [{id: "doc_currency", path: "o.doc_currency", synonym: "Валюта документа", type: "ro", txt: o["doc_currency"].presentation},
						{id: "doc_amount", path: "o.doc_amount", synonym: "Сумма", type: "ron", txt: o["doc_amount"]},
						{id: "amount_internal", path: "o.amount_internal", synonym: "Сумма внутр", type: "ron", txt: o["amount_internal"]}]
				}
			});

			/**
			 *	редактор комментариев
			 */
			wnd.elmnts.cell_note = wnd.elmnts.layout_header.cells('c');
			wnd.elmnts.cell_note.hideHeader();
			wnd.elmnts.cell_note.setHeight(100);
			wnd.elmnts.cell_note.attachHTMLString("<textarea class='textarea_editor'>" + o.note + "</textarea>");
			// wnd.elmnts.note_editor = wnd.elmnts.cell_note.attachEditor({
			// 	content: o.note,
			// 	onFocusChanged: function(name, ev){
			// 		if(!wnd.elmnts.ro && name == "blur")
			// 			o.note = this.getContent().replace(/&nbsp;/g, " ").replace(/<.*?>/g, "").replace(/&.{2,6};/g, "");
			// 	}
			// });

			//wnd.elmnts.pg_header = wnd.elmnts.tabs.tab_header.attachHeadFields({
			//	obj: o,
			//	pwnd: wnd,
			//	read_only: wnd.elmnts.ro    // TODO: учитывать права для каждой роли на каждый объект
			//});
		};

		attr.toolbar_struct = $p.injected_data["toolbar_calc_order_obj.xml"];

		attr.toolbar_click = toolbar_click;

		attr.on_close = frm_close;

		return this.constructor.prototype.form_obj.call(this, pwnd, attr)
			.then(function (res) {
				if(res){
					o = res.o;
					wnd = res.wnd;
					return res;
				}
			});


		/**
		 * обработчик нажатия кнопок командных панелей
		 */
		function toolbar_click(btn_id){

			switch(btn_id) {

				case 'btn_sent':
					save("sent");
					break;

				case 'btn_save':
					save("save");
					break;

				case 'btn_save_close':
					save("close");
					break;

				case 'btn_retrieve':
					save("retrieve");
					break;

				case 'btn_post':
					save("post");
					break;

				case 'btn_unpost':
					save("unpost");
					break;

				case 'btn_fill_plan':
					o.fill_plan();
					break;

				case 'btn_close':
					wnd.close();
					break;

				case 'btn_add_builder':
					open_builder(true);
					break;

				case 'btn_add_product':
					$p.dp.buyers_order.form_product_list(wnd, process_add_product);
					break;

				case 'btn_add_material':
					add_material();
					break;

				case 'btn_edit':
					open_builder();
					break;

				case 'btn_spec':
					open_spec();
					break;

				case 'btn_discount':

					break;

				case 'btn_calendar':
					calendar_new_event();
					break;

				case 'btn_go_connection':
					go_connection();
					break;
			}

			if(btn_id.substr(0,4)=="prn_")
				_mgr.print(o, btn_id, wnd);
		}

		/**
		 * создаёт событие календаря
		 */
		function calendar_new_event(){
			$p.msg.show_not_implemented();
		}

		/**
		 * показывает список связанных документов
		 */
		function go_connection(){
			$p.msg.show_not_implemented();
		}

		/**
		 * создаёт и показывает диалог групповых скидок
		 */
		function show_discount(){
			if (!wnd.elmnts.discount) {

				wnd.elmnts.discount = wnd.elmnts.discount_pop.attachForm([
					{type: "fieldset",  name: "discounts", label: "Скидки по группам", width:220, list:[
						{type:"settings", position:"label-left", labelWidth:100, inputWidth:50},
						{type:"input", label:"На продукцию", name:"production", numberFormat:["0.0 %", "", "."]},
						{type:"input", label:"На аксессуары", name:"accessories", numberFormat:["0.0 %", "", "."]},
						{type:"input", label:"На услуги", name:"services", numberFormat:["0.0 %", "", "."]}
					]},
					{ type:"button" , name:"btn_discounts", value:"Ок", tooltip:"Установить скидки"  }
				]);
				wnd.elmnts.discount.setItemValue("production", 0);
				wnd.elmnts.discount.setItemValue("accessories", 0);
				wnd.elmnts.discount.setItemValue("services", 0);
				wnd.elmnts.discount.attachEvent("onButtonClick", function(name){
					wnd.progressOn();
					// TODO: _mgr.save
					//_mgr.save({
					//	ref: o.ref,
					//	discounts: {
					//		production: $p.utils.fix_number(wnd.elmnts.discount.getItemValue("production"), true),
					//		accessories: $p.utils.fix_number(wnd.elmnts.discount.getItemValue("accessories"), true),
					//		services: $p.utils.fix_number(wnd.elmnts.discount.getItemValue("services"), true)
					//	},
					//	o: o._obj,
					//	action: "calc",
					//	specify: "discounts"
					//}).then(function(res){
					//	if(!$p.msg.check_soap_result(res))
					//		wnd.reflect_characteristic_change(res); // - перезаполнить шапку и табчасть
					//	wnd.progressOff();
					//	wnd.elmnts.discount_pop.hide();
					//});
				});
			}
		}



		/**
		 * вспомогательные функции
		 */

		function production_new_row(){
			var row = o["production"].add({
				qty: 1,
				quantity: 1,
				discount_percent_internal: $p.wsql.get_user_param("discount", "number")
			});
			o["production"].sync_grid(wnd.elmnts.grids.production);
			wnd.elmnts.grids.production.selectRowById(row.row);
			return row;
		}

		function production_get_sel_index(){
			var selId = wnd.elmnts.grids.production.getSelectedRowId();
			if(selId && !isNaN(Number(selId)))
				return Number(selId)-1;

			$p.msg.show_msg({
				type: "alert-warning",
				text: $p.msg.no_selected_row.replace("%1", "Продукция"),
				title: o.presentation
			});
		}


		function save(action){

			function do_save(post){

				if(!wnd.elmnts.ro){
					o.note = wnd.elmnts.cell_note.cell.querySelector("textarea").value.replace(/&nbsp;/g, " ").replace(/<.*?>/g, "").replace(/&.{2,6};/g, "");
					wnd.elmnts.pg_left.selectRow(0);
				}

				o.save(post)
					.then(function(){

						if(action == "sent" || action == "close")
							wnd.close();
						else{
							wnd.set_text();
							set_editable();
						}

					})
					.catch(function(err){
						$p.record_log(err);
					});
			}

			if(action == "sent"){
				// показать диалог и обработать возврат
				dhtmlx.confirm({
					title: $p.msg.order_sent_title,
					text: $p.msg.order_sent_message,
					cancel: $p.msg.cancel,
					callback: function(btn) {
						if(btn){
							// установить транспорт в "отправлено" и записать
							o.obj_delivery_state = $p.enm.obj_delivery_states.Отправлен;
							do_save();
						}
					}
				});

			} else if(action == "retrieve"){
				// установить транспорт в "отозвано" и записать
				o.obj_delivery_state =  $p.enm.obj_delivery_states.Отозван;
				do_save();

			} else if(action == "save" || action == "close"){
				do_save();

			}else if(action == "post"){
				do_save(true);

			}else if(action == "unpost"){
				do_save(false);
			}
		}

		function frm_close(){

			// выгружаем из памяти всплывающие окна скидки и связанных файлов
			["vault", "vault_pop", "discount", "discount_pop"].forEach(function (elm) {
				if (wnd && wnd.elmnts && wnd.elmnts[elm] && wnd.elmnts[elm].unload)
					wnd.elmnts[elm].unload();
			});

			evts.forEach(function (id) {
				$p.eve.detachEvent(id);
			});

			if(typeof attr_on_close == "function")
				attr_on_close();

			return true;
		}

		function set_editable(){

			// статусы
			var st_draft = $p.enm.obj_delivery_states.Черновик,
				st_retrieve = $p.enm.obj_delivery_states.Отозван,
				retrieve_enabed, detales_toolbar;

			wnd.elmnts.pg_right.cells("vat_consider", 1).setDisabled(true);
			wnd.elmnts.pg_right.cells("vat_included", 1).setDisabled(true);

			wnd.elmnts.ro = false;

			// технолог может изменять шаблоны
			if(o.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон){
				wnd.elmnts.ro = !$p.current_acl.role_available("ИзменениеТехнологическойНСИ");

				// ведущий менеджер может изменять проведенные
			}else if(o.posted || o._deleted){
				wnd.elmnts.ro = !$p.current_acl.role_available("СогласованиеРасчетовЗаказов");

			}else if(!wnd.elmnts.ro && !o.obj_delivery_state.empty())
				wnd.elmnts.ro = o.obj_delivery_state != st_draft && o.obj_delivery_state != st_retrieve;

			retrieve_enabed = !o._deleted &&
				(o.obj_delivery_state == $p.enm.obj_delivery_states.Отправлен || o.obj_delivery_state == $p.enm.obj_delivery_states.Отклонен);

			wnd.elmnts.grids.production.setEditable(!wnd.elmnts.ro);
			wnd.elmnts.grids.planning.setEditable(!wnd.elmnts.ro);
			wnd.elmnts.pg_left.setEditable(!wnd.elmnts.ro);
			wnd.elmnts.pg_right.setEditable(!wnd.elmnts.ro);

			// гасим кнопки проведения, если недоступна роль
			if(!$p.current_acl.role_available("СогласованиеРасчетовЗаказов")){
				wnd.elmnts.frm_toolbar.hideItem("btn_post");
				wnd.elmnts.frm_toolbar.hideItem("btn_unpost");
			}

			// кнопки записи и отправки гасим в зависимости от статуса
			if(wnd.elmnts.ro){
				wnd.elmnts.frm_toolbar.disableItem("btn_sent");
				wnd.elmnts.frm_toolbar.disableItem("btn_save");

				detales_toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
				detales_toolbar.forEachItem(function(itemId){
					detales_toolbar.disableItem(itemId);
				});

				detales_toolbar = wnd.elmnts.tabs.tab_planning.getAttachedToolbar();
				detales_toolbar.forEachItem(function(itemId){
					detales_toolbar.disableItem(itemId);
				});

			}else{
				// шаблоны никогда не надо отправлять
				if(o.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон)
					wnd.elmnts.frm_toolbar.disableItem("btn_sent");
				else
					wnd.elmnts.frm_toolbar.enableItem("btn_sent");

				wnd.elmnts.frm_toolbar.enableItem("btn_save");

				detales_toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
				detales_toolbar.forEachItem(function(itemId){
					detales_toolbar.enableItem(itemId);
				});

				detales_toolbar = wnd.elmnts.tabs.tab_planning.getAttachedToolbar();
				detales_toolbar.forEachItem(function(itemId){
					detales_toolbar.enableItem(itemId);
				});
			}
			if(retrieve_enabed)
				wnd.elmnts.frm_toolbar.enableListOption("bs_more", "btn_retrieve");
			else
				wnd.elmnts.frm_toolbar.disableListOption("bs_more", "btn_retrieve");
		}

		/**
		 * Обработчик события _ЗаписанаХарактеристикаПостроителя_
		 * @param scheme
		 * @param sattr
		 */
		function characteristic_saved(scheme, sattr){

			var ox = scheme.ox,
				dp = scheme._dp,
				row = ox.calc_order_row;

			if(!row || ox.calc_order != o)
				return;

			//nom,characteristic,note,quantity,unit,qty,len,width,s,first_cost,marginality,price,discount_percent,discount_percent_internal,
			//discount,amount,margin,price_internal,amount_internal,vat_rate,vat_amount,ordn,changed

			// т.к. табчасть мы будем перерисовывать в любом случае, отключаем обсерверы
			ox._silent = true;

			row.nom = ox.owner;
			row.note = dp.note;
			row.quantity = dp.quantity || 1;
			row.len = ox.x;
			row.width = ox.y;
			row.s = ox.s;
			row.discount_percent = dp.discount_percent;
			row.discount_percent_internal = dp.discount_percent_internal;
			if(row.unit.owner != row.nom)
				row.unit = row.nom.storage_unit;

			// обновляем табчасть
			wnd.elmnts.grids.production.refresh_row(row);

			// обновляем эскизы
			wnd.elmnts.svgs.reload(o);

		}

		/**
		 * показывает диалог с сообщением "это не продукция"
		 */
		function not_production(){
			$p.msg.show_msg({
				title: $p.msg.bld_title,
				type: "alert-error",
				text: $p.msg.bld_not_product
			});
		}

		/**
		 * ОткрытьПостроитель()
		 * @param create_new {Boolean} - создавать новое изделие или открывать в текущей строке
		 */
		function open_builder(create_new){
			var selId, row;

			if(create_new){

				row = production_new_row();

				// объект продукции создаём, но из базы не читаем и пока не записываем
				$p.cat.characteristics.create({
					ref: $p.utils.generate_guid(),
					calc_order: o,
					product: row.row
				}, true)
					.then(function (ox) {

						// записываем расчет, если не сделали этого ранее
						if(o.is_new())
							return o.save()
								.then(function () {
									return ox;
								});
						else
							return ox;
					})
					.then(function (ox) {
						row.characteristic = ox;
						$p.iface.set_hash("cat.characteristics", row.characteristic.ref, "builder");
					});

			}else if((selId = production_get_sel_index()) != undefined){

				row = o.production.get(selId);
				if(row){
					if(row.characteristic.empty() ||
						row.characteristic.calc_order.empty() ||
						row.characteristic.owner.is_procedure ||
						row.characteristic.owner.is_service ||
						row.characteristic.owner.is_accessory){
						not_production();

					}else if(row.characteristic.coordinates.count() == 0){
						// возможно, это заготовка - проверим номенклатуру системы

					}else
						$p.iface.set_hash("cat.characteristics", row.characteristic.ref, "builder");
				}
			}

			if(!evts.length){
				evts.push($p.eve.attachEvent("characteristic_saved", characteristic_saved));
			}
		}

		function open_spec(){
			var selId, row;

			if((selId = production_get_sel_index()) != undefined){
				row = o.production.get(selId);
				if(row && !$p.utils.is_empty_guid(row.characteristic.ref)){
					row.characteristic.form_obj()
						.then(function (w) {
							w.wnd.maximize();
						});
				}
			}
		}

		/**
		 * добавляет строку материала
		 */
		function add_material(){
			var row = production_new_row(),
				grid = wnd.elmnts.grids.production,
				cell;
			grid.selectCell(row.row-1, grid.getColIndexById("nom"), false, true, true);
			cell = grid.cells();
			cell.edit();
			cell.open_selection();
		}

		/**
		 * ОбработатьДобавитьПродукцию()
		 */
		function process_add_product(ts){

			if(ts && ts.count()){

				ts.clear();
			}
			//wnd.progressOn();
			// TODO: _mgr.save
			//_mgr.save({
			//	ref: o.ref,
			//	row: 0,
			//	o: o._obj,
			//	action: "calc",
			//	specify: "product_list",
			//	new_rows: new_rows
			//}).then(function(res){
			//	if(!$p.msg.check_soap_result(res))
			//		wnd.reflect_characteristic_change(res);
			//	wnd.progressOff();
			//});
		}

	}

})($p);

/**
 * ### Отчеты по документу Расчет
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 23.06.2016
 * 
 * @module doc_calc_order_reports
 * 
 */

$p.doc.calc_order.__define({

	rep_invoice_execution: {
		value: function (rep) {

			var query_options = {
					reduce: true,
					limit: 10000,
					group: true,
					group_level: 3
				},
				res = {
					data: [],
					readOnly: true,
					colWidths: [180, 180, 200, 100, 100, 100, 100, 100],
					colHeaders: ['Контрагент', 'Организация', 'Заказ', 'Сумма', 'Оплачено', 'Долг', 'Отгружено', 'Отгрузить'],
					columns: [
						{type: 'text'},
						{type: 'text'},
						{type: 'text'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'}
					],
					wordWrap: false
					//minSpareRows: 1
				};

			if(!$p.current_acl.role_available("СогласованиеРасчетовЗаказов")){
				//query_options.group_level = 3;
				query_options.startkey = [$p.current_acl.partners_uids[0],""];
				query_options.endkey = [$p.current_acl.partners_uids[0],"\uffff"];
			}

			return $p.wsql.pouch.remote.doc.query("server/invoice_execution", query_options)

				.then(function (data) {

					var total = {
						invoice: 0,
						pay: 0,
						total_pay: 0,
						shipment:0,
						total_shipment:0
					};

					if(data.rows){

						data.rows.forEach(function (row) {

							if(!row.value.total_pay && !row.value.total_shipment)
								return;

							res.data.push([
								$p.cat.partners.get(row.key[0]).presentation,
								$p.cat.organizations.get(row.key[1]).presentation,
								row.key[2],
								row.value.invoice,
								row.value.pay,
								row.value.total_pay,
								row.value.shipment,
								row.value.total_shipment]);

							total.invoice+= row.value.invoice;
							total.pay+=row.value.pay;
							total.total_pay+=row.value.total_pay;
							total.shipment+=row.value.shipment;
							total.total_shipment+=row.value.total_shipment;
						});

						res.data.push([
							"Итого:",
							"",
							"",
							total.invoice,
							total.pay,
							total.total_pay,
							total.shipment,
							total.total_shipment]);

						res.mergeCells= [
							{row: res.data.length-1, col: 0, rowspan: 1, colspan: 3}
						]
					}

					rep.requery(res);

					return res;
				});
		}
	},

	rep_planing: {
		value: function (rep, attr) {

			var date_from = $p.utils.date_add_day(new Date(), -1, true),
				date_till = $p.utils.date_add_day(date_from, 7, true),
				query_options = {
					reduce: true,
					limit: 10000,
					group: true,
					group_level: 5,
					startkey: [date_from.getFullYear(), date_from.getMonth()+1, date_from.getDate(), ""],
					endkey: [date_till.getFullYear(), date_till.getMonth()+1, date_till.getDate(),"\uffff"]
				},
				res = {
					data: [],
					readOnly: true,
					wordWrap: false
					//minSpareRows: 1
				};



			return $p.wsql.pouch.remote.doc.query("server/planning", query_options)

				.then(function (data) {


					if(data.rows){

						var include_detales = $p.current_acl.role_available("СогласованиеРасчетовЗаказов");

						data.rows.forEach(function (row) {

							if(!include_detales){

							}

							res.data.push([
								new Date(row.key[0], row.key[1]-1, row.key[2]),
								$p.cat.planning_keys.get(row.key[3]),
								row.value.debit,
								row.value.credit,
								row.value.total
							]);
						});

					}

					rep.requery(res);

					return res;
				});

		}
	}

});
/**
 * ### Модуль менеджера и документа Установка цен номенклатуры
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module doc_nom_prices_setup
 * Created 28.07.2016
 */


// Переопределяем формирование списка выбора характеристики в табчасти документа установки цен
$p.doc.nom_prices_setup.metadata().tabular_sections.goods.fields.nom_characteristic._option_list_local = true;

// Подписываемся на события
$p.doc.nom_prices_setup.on({

	/**
	 * Обработчик при создании документа
	 */
	after_create: function (attr) {

		//Номер документа
		return this.new_number_doc();

	},

	/**
	 * Обработчик события "при изменении свойства" в шапке или табличной части при редактировании в форме объекта
	 * @this {DataObj} - обработчик вызывается в контексте текущего объекта
	 */
	add_row: function (attr) {

		// установим валюту и тип цен по умолчению при добавлении строки
		if(attr.tabular_section == "goods"){
			attr.row.price_type = this.price_type;
			attr.row.currency = this.price_type.price_currency;
		}

	}
});
/**
 * Дополнительные методы перечисления Типы соединений
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module enm_cnn_types
 */

(function($p){

	var _mgr = $p.enm.cnn_types;

	/**
	 * Массивы Типов соединений
	 * @type {Object}
	 */
	_mgr.acn = {cache :{}};
	_mgr.acn.__define({

		ii: {
			get : function(){
				return this.cache.ii
					|| ( this.cache.ii = [_mgr.Наложение] );
			},
			enumerable : false,
			configurable : false
		},

		i: {
			get : function(){
				return this.cache.i
					|| ( this.cache.i = [_mgr.НезамкнутыйКонтур] );
			},
			enumerable : false,
			configurable : false
		},

		a: {
			get : function(){
				return this.cache.a
					|| ( this.cache.a = [
						_mgr.УгловоеДиагональное,
						_mgr.УгловоеКВертикальной,
						_mgr.УгловоеКГоризонтальной,
						_mgr.КрестВСтык] );
			},
			enumerable : false,
			configurable : false
		},

		t: {
			get : function(){
				return this.cache.t
					|| ( this.cache.t = [_mgr.ТОбразное] );
			},
			enumerable : false,
			configurable : false
		}
	});

	/**
	 * Короткие псевдонимы перечисления "Типы соединений"
	 * @type {Object}
	 */
	_mgr.tcn = {cache :{}};
	_mgr.tcn.__define({
		ad: {
			get : function(){
				return this.cache.ad || ( this.cache.ad = _mgr.УгловоеДиагональное );
			},
			enumerable : false,
			configurable : false
		},

		av: {
			get : function(){
				return this.cache.av || ( this.cache.av = _mgr.УгловоеКВертикальной );
			},
			enumerable : false,
			configurable : false
		},

		ah: {
			get : function(){
				return this.cache.ah || ( this.cache.ah = _mgr.УгловоеКГоризонтальной );
			},
			enumerable : false,
			configurable : false
		},

		t: {
			get : function(){
				return this.cache.t || ( this.cache.t = _mgr.ТОбразное );
			},
			enumerable : false,
			configurable : false
		},

		ii: {
			get : function(){
				return this.cache.ii || ( this.cache.ii = _mgr.Наложение );
			},
			enumerable : false,
			configurable : false
		},

		i: {
			get : function(){
				return this.cache.i || ( this.cache.i = _mgr.НезамкнутыйКонтур );
			},
			enumerable : false,
			configurable : false
		},

		xt: {
			get : function(){
				return this.cache.xt || ( this.cache.xt = _mgr.КрестПересечение );
			},
			enumerable : false,
			configurable : false
		},

		xx: {
			get : function(){
				return this.cache.xx || ( this.cache.xx = _mgr.КрестВСтык );
			},
			enumerable : false,
			configurable : false
		}
	});

})($p);
/**
 * Дополнительные методы перечисления Типы элементов
 * @author Evgeniy Malyarov
 * @module enm_elm_types
 */

(function($p){

	var _mgr = $p.enm.elm_types,

		/**
		 * Массивы Типов элементов
		 * @type {Object}
		 */
		cache = {};

	_mgr.__define({

		profiles: {
			get : function(){
				return cache.profiles
					|| ( cache.profiles = [
						_mgr.Рама,
						_mgr.Створка,
						_mgr.Импост,
						_mgr.Штульп] );
			},
			enumerable : false,
			configurable : false
		},

		profile_items: {
			get : function(){
				return cache.profile_items
					|| ( cache.profile_items = [
						_mgr.Рама,
						_mgr.Створка,
						_mgr.Импост,
						_mgr.Штульп,
						_mgr.Добор,
						_mgr.Соединитель,
						_mgr.Раскладка
					] );
			},
			enumerable : false,
			configurable : false
		},

		rama_impost: {
			get : function(){
				return cache.rama_impost
					|| ( cache.rama_impost = [ _mgr.Рама, _mgr.Импост] );
			},
			enumerable : false,
			configurable : false
		},

		impost_lay: {
			get : function(){
				return cache.impost_lay
					|| ( cache.impost_lay = [ _mgr.Импост, _mgr.Раскладка] );
			},
			enumerable : false,
			configurable : false
		},

		stvs: {
			get : function(){
				return cache.stvs || ( cache.stvs = [_mgr.Створка] );
			},
			enumerable : false,
			configurable : false
		},

		glasses: {
			get : function(){
				return cache.glasses
					|| ( cache.glasses = [ _mgr.Стекло, _mgr.Заполнение] );
			},
			enumerable : false,
			configurable : false
		}

	});


})($p);
/**
 * ### Модификаторы перечислений
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module enmums
 * Created 22.04.2016
 */

(function($p){

	/**
	 * Дополнительные методы перечисления Типы открывания
	 */
	$p.enm.open_types.__define({

		is_opening: {
			value: function (v) {

				if(!v || v.empty() || v == this.Глухое || v == this.Неподвижное)
					return false;

				return true;

			}
		}

		/*
		 ,

		 rotary: {
		 get: function () {
		 return this.Поворотное;
		 }
		 },

		 folding: {
		 get: function () {
		 return this.Откидное;
		 }
		 },

		 rotary_folding: {
		 get: function () {
		 return this.ПоворотноОткидное;
		 }
		 },

		 deaf: {
		 get: function () {
		 return this.Глухое;
		 }
		 },

		 sliding: {
		 get: function () {
		 return this.Раздвижное;
		 }
		 },

		 fixed: {
		 get: function () {
		 return this.Неподвижное;
		 }
		 }
		 */

	});

	/**
	 * Дополнительные методы перечисления Ориентация
	 */
	$p.enm.orientations.__define({

		hor: {
			get: function () {
				return this.Горизонтальная;
			}
		},

		vert: {
			get: function () {
				return this.Вертикальная;
			}
		},

		incline: {
			get: function () {
				return this.Наклонная;
			}
		}
	});

	/**
	 * Дополнительные методы перечисления ПоложениеЭлемента
	 */
	$p.enm.positions.__define({

		left: {
			get: function () {
				return this.Лев;
			}
		},

		right: {
			get: function () {
				return this.Прав;
			}
		},

		top: {
			get: function () {
				return this.Верх;
			}
		},

		bottom: {
			get: function () {
				return this.Низ;
			}
		},

		hor: {
			get: function () {
				return this.ЦентрГоризонталь;
			}
		},

		vert: {
			get: function () {
				return this.ЦентрВертикаль;
			}
		}
	});


})($p);
/**
 * Ячейка грида для отображения картинки svg и компонент,
 * получающий и отображающий галерею эскизов объекта данных
 *
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  widgets
 * @submodule rsvg
 */

/**
 * Конструктор поля картинки svg
 */
function eXcell_rsvg(cell){ //the eXcell name is defined here
	if (cell){                // the default pattern, just copy it
		this.cell = cell;
		this.grid = this.cell.parentNode.grid;
	}
	this.edit = function(){};  //read-only cell doesn't have edit method
	this.isDisabled = function(){ return true; }; // the cell is read-only, so it's always in the disabled state
	this.setValue=function(val){
		this.cell.style.padding = "2px 4px";
		this.setCValue(val ? $p.iface.scale_svg(val, 120, 0) : "нет эскиза");
	}
}
eXcell_rsvg.prototype = new eXcell();
window.eXcell_rsvg = eXcell_rsvg;

/**
 * ### Визуальный компонент OSvgs
 * Получает и отображает галерею эскизов объекта данных
 *
 * @class OSvgs
 * @param manager {DataManager}
 * @param layout {dhtmlXLayoutObject|dhtmlXWindowsCell}
 * @param area {HTMLElement}
 * @constructor
 */
$p.iface.OSvgs = function (manager, layout, area) {

	var t = this,
		minmax = document.createElement('div'),
		pics_area = document.createElement('div'),
		stack = [], reload_id,
		area_hidden = $p.wsql.get_user_param("svgs_area_hidden", "boolean"),
		area_text = area.querySelector(".dhx_cell_statusbar_text");

	if(area_text && area_text.innerHTML == "<div></div>")
		area_text.style.display = "none";

	pics_area.className = 'svgs-area';
	if(area.firstChild)
		area.insertBefore(pics_area, area.firstChild);
	else
		area.appendChild(pics_area);

	minmax.className = 'svgs-minmax';
	minmax.title="Скрыть/показать панель эскизов";
	minmax.onclick = function () {
		area_hidden = !area_hidden;
		$p.wsql.set_user_param("svgs_area_hidden", area_hidden);
		apply_area_hidden();

		if(!area_hidden && stack.length)
			t.reload();

	};
	area.appendChild(minmax);
	apply_area_hidden();

	function apply_area_hidden(){

		pics_area.style.display = area_hidden ? "none" : "";

		if(layout.setSizes)
			layout.setSizes();

		else if(layout.getDimension){
			var dim = layout.getDimension();
			layout.setDimension(dim[0], dim[1]);
			layout.maximize();
		}

		minmax.style.backgroundPositionX = area_hidden ? "-32px" : "0px";
	}

	function draw_svgs(res){

		$p.iface.clear_svgs(pics_area);

		res.forEach(function (svg) {
			if(!svg || svg.substr(0, 1) != "<")
				return;
			var svg_elm = document.createElement("div");
			pics_area.appendChild(svg_elm);
			svg_elm.style.float = "left";
			svg_elm.style.marginLeft = "4px";
			svg_elm.innerHTML = $p.iface.scale_svg(svg, 88, 22);
		});

		if(!res.length){
			// возможно, стоит показать надпись, что нет эскизов
		}
	}

	this.reload = function (ref) {

		if(ref){
			stack.push(ref);
			ref = null;
		}

		if(reload_id)
			clearTimeout(reload_id);

		if(!area_hidden)
			reload_id = setTimeout(function(){
				if(stack.length){

					// Получаем табчасть заказа
					var _obj = stack.pop();

					if (typeof _obj == "string")
						_obj = $p.doc.calc_order.pouch_db.get(manager.class_name + "|" + _obj);
					else
						_obj = Promise.resolve({production: _obj.production._obj});

					_obj.then(function (res) {
							// Для продукций заказа получаем вложения
							var aatt = [];
							res.production.forEach(function (row) {
								if(!$p.utils.is_empty_guid(row.characteristic))
									aatt.push($p.cat.characteristics.get_attachment(row.characteristic, "svg").catch(function (err) {

									}));
							});
							_obj = null;
							return Promise.all(aatt);
						})
						.then(function (res) {
							// Извлекаем из блоба svg-текст эскизов
							var aatt = [];
							res.forEach(function (row) {
								if(row instanceof Blob && row.size)
									aatt.push($p.utils.blob_as_text(row));
							});
							return Promise.all(aatt);
						})
						.then(draw_svgs)
						.catch($p.record_log);

					stack.length = 0;
				}
			}, 300);
	}

};
/**
 * Главное окно интерфейса
 *
 * Created 25.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module wnd_main
 */

$p.on({

	/**
	 * ### При установке параметров сеанса
	 * Процедура устанавливает параметры работы программы, специфичные для текущей сборки
	 *
	 * @param prm {Object} - в свойствах этого объекта определяем параметры работы программы
	 */
	settings: function (prm) {

		prm.__define({

			// разделитель для localStorage
			local_storage_prefix: {
				value: "wb_"
			},

			// скин по умолчанию
			skin: {
				value: "dhx_terrace"
			},

			// фильтр для репликации с CouchDB
			pouch_filter: {
				value: (function () {
					var filter = {};
					filter.__define({
						doc: {
							value: "auth/by_partner",
							writable: false
						}
					});
					return filter;
				})(),
				writable: false
			},

			// гостевые пользователи для демо-режима
			guests: {
				value: [{
					username: "Дилер",
					password: "1gNjzYQKBlcD"
				}]
			},

			// если понадобится обратиться к 1С, будем использовать irest
			irest_enabled: {
				value: true
			},

			// расположение rest-сервиса 1c по умолчанию
			rest_path: {
				value: "/a/zd/%1/odata/standard.odata/"
			},

			// не шевелить hash url при открытии подчиненных форм
			keep_hash: {
				value: true
			},

			// используем геокодер
			use_ip_geo: {
				value: true
			}

		});

		// по умолчанию, обращаемся к зоне 1
		prm.zone = 1;

		// объявляем номер демо-зоны
		prm.zone_demo = 1;

		// расположение couchdb
		prm.couch_path = "/couchdb/wb_";
		//prm.couchdb = "http://i980:5984/wb_";

		// логин гостевого пользователя couchdb
		prm.guest_name = "guest";

		// пароль гостевого пользователя couchdb
		prm.guest_pwd = "meta";

		// разрешаем сохранение пароля
		prm.enable_save_pwd = true;


		// разрешаем покидать страницу без лишних вопросов
		// $p.eve.redirect = true;

	},

	/**
	 * ### При инициализации интерфейса
	 * Вызывается после готовности DOM и установки параметров сеанса, до готовности метаданных
	 * рисуем интерфейс
	 *
	 */
	iface_init: function() {

		// патч параметра couch_path
		if($p.wsql.get_user_param("couch_path") && $p.wsql.get_user_param("couch_path") != $p.job_prm.couch_path)
			$p.wsql.set_user_param("couch_path", $p.job_prm.couch_path);

		// разделы интерфейса
		$p.iface.sidebar_items = [
			{id: "orders", text: "Заказы", icon: "projects_48.png"},
			{id: "events", text: "Планирование", icon: "events_48.png"},
			{id: "settings", text: "Настройки", icon: "settings_48.png"},
			{id: "about", text: "О программе", icon: "about_48.png"}
		];


		// наблюдатель за событиями авторизации и синхронизации
		$p.iface.btn_auth_sync = new $p.iface.OBtnAuthSync();

		$p.iface.btns_nav = function (wrapper) {
			return $p.iface.btn_auth_sync.bind(new $p.iface.OTooolBar({
				wrapper: wrapper,
				class_name: 'md_otbnav',
				width: '260px', height: '28px', top: '3px', right: '3px', name: 'right',
				buttons: [
					{name: 'about', text: '<i class="fa fa-info-circle md-fa-lg"></i>', tooltip: 'О программе', float: 'right'},
					{name: 'settings', text: '<i class="fa fa-cog md-fa-lg"></i>', tooltip: 'Настройки', float: 'right'},
					{name: 'events', text: '<i class="fa fa-calendar-check-o md-fa-lg"></i>', tooltip: 'Планирование', float: 'right'},
					{name: 'orders', text: '<i class="fa fa-suitcase md-fa-lg"></i>', tooltip: 'Заказы', float: 'right'},
					{name: 'sep_0', text: '', float: 'right'},
					{name: 'sync', text: '', float: 'right'},
					{name: 'auth', text: '', width: '80px', float: 'right'}

				], onclick: function (name) {
					$p.iface.main.cells(name).setActive(true);
					return false;
				}
			}))
		};

		// Подписываемся на событие окончания загрузки предопределённых элементов
		var predefined_elmnts_inited = $p.eve.attachEvent("predefined_elmnts_inited", function () {

			$p.iface.main.progressOff();

			// если разрешено сохранение пароля - сразу пытаемся залогиниться
			if(!$p.wsql.pouch.authorized && navigator.onLine &&
				$p.wsql.get_user_param("enable_save_pwd") &&
				$p.wsql.get_user_param("user_name") &&
				$p.wsql.get_user_param("user_pwd")){

				setTimeout(function () {
					$p.iface.frm_auth({
						modal_dialog: true,
						try_auto: true
					});
				}, 100);
			}

			$p.eve.detachEvent(predefined_elmnts_inited);

		});

		// Назначаем обработчик ошибки загрузки локальных данных
		var pouch_load_data_error = $p.eve.attachEvent("pouch_load_data_error", function (err) {

			// если это первый запуск, показываем диалог авторизации
			if(err.db_name && err.hasOwnProperty("doc_count") && err.doc_count < 10 && navigator.onLine){

				// если это демо (zone === zone_demo), устанавливаем логин и пароль
				if($p.wsql.get_user_param("zone") == $p.job_prm.zone_demo && !$p.wsql.get_user_param("user_name")){
					$p.wsql.set_user_param("enable_save_pwd", true);
					$p.wsql.set_user_param("user_name", $p.job_prm.guests[0].username);
					$p.wsql.set_user_param("user_pwd", $p.job_prm.guests[0].password);

					setTimeout(function () {
						$p.iface.frm_auth({
							modal_dialog: true,
							try_auto: true
						});
					}, 100);

				}else{
					$p.iface.frm_auth({
						modal_dialog: true,
						try_auto: $p.wsql.get_user_param("zone") == $p.job_prm.zone_demo && $p.wsql.get_user_param("enable_save_pwd")
					});
				}

			}

			$p.iface.main.progressOff();
			$p.eve.detachEvent(pouch_load_data_error);

		});

		// запрещаем масштабировать колёсиком мыши, т.к. для масштабирования у канваса свой инструмент
		window.onmousewheel = function (e) {
			if(e.ctrlKey){
				e.preventDefault();
				return false;
			}
		};

		// основной сайдбар
		$p.iface.main = new dhtmlXSideBar({
			parent: document.body,
			icons_path: "dist/imgs/",
			width: 180,
			header: true,
			template: "tiles",
			autohide: true,
			items: $p.iface.sidebar_items,
			offsets: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0
			}
		});

		// подписываемся на событие навигации по сайдбару
		$p.iface.main.attachEvent("onSelect", function(id){

			var hprm = $p.job_prm.parse_url();
			if(hprm.view != id)
				$p.iface.set_hash(hprm.obj, hprm.ref, hprm.frm, id);

			$p.iface["view_" + id]($p.iface.main.cells(id));

		});

		// включаем индикатор загрузки
		$p.iface.main.progressOn();

		// активируем страницу
		hprm = $p.job_prm.parse_url();
		if(!hprm.view || $p.iface.main.getAllItems().indexOf(hprm.view) == -1){
			$p.iface.set_hash(hprm.obj, hprm.ref, hprm.frm, "orders");
		} else
			setTimeout($p.iface.hash_route);

	},

	/**
	 * ### Обработчик маршрутизации
	 */
	hash_route: function (hprm) {

		// view отвечает за переключение закладки в SideBar
		if(hprm.view && $p.iface.main.getActiveItem() != hprm.view){
			$p.iface.main.getAllItems().forEach(function(item){
				if(item == hprm.view)
					$p.iface.main.cells(item).setActive(true);
			});
		}

		return false;
	}

});
/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_about
 */

$p.iface.view_about = function (cell) {

	function OViewAbout(){

		cell.attachHTMLString($p.injected_data['view_about.html']);
		cell.cell.querySelector(".dhx_cell_cont_sidebar").style.overflow = "auto";

		this.tb_nav = $p.iface.btns_nav(cell.cell.querySelector(".dhx_cell_sidebar_hdr"));
	}

	return $p.iface._about || ($p.iface._about = new OViewAbout());

};

/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_events
 */

$p.iface.view_events = function (cell) {

	function OViewEvents(){

		var t = this;

		function create_scheduler(){
			//scheduler.config.xml_date="%Y-%m-%d %H:%i";
			scheduler.config.first_hour = 8;
			scheduler.config.last_hour = 22;

			var sTabs = '<div class="dhx_cal_tab" name="day_tab" style="right:204px;"></div>'+
				'<div class="dhx_cal_tab" name="week_tab" style="right:140px;"></div>'+
				'<div class="dhx_cal_tab" name="month_tab" style="right:280px;"></div>'+
				'<div class="dhx_cal_date"></div><div class="dhx_minical_icon">&nbsp;</div>';
			//'<div class="dhx_cal_tab" name="timeline_tab" style="right:76px;"></div>';

			t._scheduler = cell.attachScheduler(null, "week", sTabs);

			t._scheduler.attachEvent("onBeforeViewChange", function(old_mode, old_date, mode, date){
				//if(mode == "timeline"){
				//	$p.msg.show_not_implemented();
				//	return false;
				//}
				return true;
			});
		}

		function show_doc(){

		}
		function show_list(){

		}

		function hash_route(hprm) {

			if(hprm.view == "events"){

				if(hprm.obj != "doc.planning_event")
					setTimeout(function () {
						$p.iface.set_hash("doc.planning_event");
					});
				else{

					if(!$p.utils.is_empty_guid(hprm.ref)){

						//if(hprm.frm != "doc")
						//	setTimeout(function () {
						//		$p.iface.set_hash(undefined, undefined, "doc");
						//	});
						//else
						//	show_doc(hprm.ref);


					} else if($p.utils.is_empty_guid(hprm.ref) || hprm.frm == "list"){

						show_list();
					}
				}

				return false;
			}

			return true;
		}

		if(!window.dhtmlXScheduler){
			$p.load_script("//oknosoft.github.io/metadata.js/lib/dhtmlxscheduler/dhtmlxscheduler.min.js", "script", create_scheduler);
			$p.load_script("//oknosoft.github.io/metadata.js/lib/dhtmlxscheduler/dhtmlxscheduler.css", "link");
		}else
			create_scheduler();

		// Рисуем дополнительные элементы навигации
		t.tb_nav = $p.iface.btns_nav(cell.cell.querySelector(".dhx_cell_sidebar_hdr"));

		/**
		 * Обработчик маршрутизации
		 * @param hprm
		 * @return {boolean}
		 */
		$p.on("hash_route", hash_route);

	}

	return $p.iface._events || ($p.iface._events = new OViewEvents());

};

/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_orders
 */

$p.iface.view_orders = function (cell) {

	function OViewOrders(){

		var t = this;

		function show_list(){
			
			t.carousel.cells("list").setActive();
			cell.setText({text: "Заказы"});

			if(!t.list){
				t.carousel.cells("list").detachObject(true);
				t.list = $p.doc.calc_order.form_list(t.carousel.cells("list"));
			}

		}

		function show_doc(ref){

			var _cell = t.carousel.cells("doc");

			_cell.setActive();

			if(!_cell.ref || _cell.ref != ref)

				$p.doc.calc_order.form_obj(_cell, {
						ref: ref,
						bind_pwnd: true,
						on_close: function () {
							setTimeout(function () {
								$p.iface.set_hash(undefined, "", "list");
							});
						},
						set_text: function (text) {
							if(t.carousel.getActiveCell() == _cell)
								cell.setText({text: "<b>" + text + "</b>"});
						}
					})
					.then(function (wnd) {
						t.doc = wnd;
						setTimeout(t.doc.wnd.set_text.bind(t.doc.wnd, true), 200);
					});

			else if(t.doc && t.doc.wnd){
				setTimeout(t.doc.wnd.set_text.bind(t.doc.wnd, true), 200);
			}

		}

		function show_builder(ref){

			t.carousel.cells("builder").setActive();

			// отвязываем ошибки открытия построителя от текущего контекста
			setTimeout(t.editor.open.bind(t.editor, ref));

		}

		function hash_route(hprm) {

			if(hprm.view == "orders"){

				if(hprm.obj == "doc.calc_order" && !$p.utils.is_empty_guid(hprm.ref)){

					if(hprm.frm != "doc")
						setTimeout(function () {
							$p.iface.set_hash(undefined, undefined, "doc");
						});
					else
						show_doc(hprm.ref);


				} else if(hprm.obj == "cat.characteristics" && !$p.utils.is_empty_guid(hprm.ref)) {

					if(hprm.frm != "builder")
						setTimeout(function () {
							$p.iface.set_hash(undefined, undefined, "builder");
						});
					else
						show_builder(hprm.ref);


				}else{

					if(hprm.obj != "doc.calc_order")
						setTimeout(function () {
							$p.iface.set_hash("doc.calc_order", "", "list");
						});
					else
						show_list();
				}

				return false;
			}

			return true;

		}

		function create_elmnts(){

			$p.off(create_elmnts);

			// создадим экземпляр графического редактора
			var _cell = t.carousel.cells("builder"),
				obj = $p.job_prm.parse_url().obj || "doc.calc_order";

			_cell._on_close = function (confirmed) {

				if(t.editor.project.ox._modified && !confirmed){
					dhtmlx.confirm({
						title: $p.msg.bld_title,
						text: $p.msg.modified_close,
						cancel: $p.msg.cancel,
						callback: function(btn) {
							if(btn){
								// закрыть изменённый без сохранения - значит прочитать его из pouchdb
								t.editor.project.data._loading = true;
								if(t.editor.project.ox.is_new()){
									// если характеристика не была записана - удаляем её вместе со строкой заказа
									var _row = t.editor.project.ox.calc_order_row;
									if(_row)
										_row._owner.del(_row);
									t.editor.project.ox.unload();
									this._on_close(true);
								}else{
									t.editor.project.ox.load()
										.then(this._on_close.bind(this, true));
								}
							}								
						}.bind(this)
					});
					return;
				}

				t.editor.project.data._loading = true;
				t.editor.project.data._opened = false;
				t.editor.project.ox = null;
				t.editor.project._dp.base_block = null;

				var _cell = t.carousel.cells("doc");
				
				$p.eve.callEvent("editor_closed", [t.editor]);

				if(!$p.utils.is_empty_guid(_cell.ref))
					$p.iface.set_hash("doc.calc_order", _cell.ref, "doc");

				else{
					
					var hprm = $p.job_prm.parse_url(),
						obj = $p.cat.characteristics.get(hprm.ref, false, true);
					
					if(obj && !obj.calc_order.empty())
						$p.iface.set_hash("doc.calc_order", obj.calc_order.ref, "doc");
					else
						$p.iface.set_hash("doc.calc_order", "", "list");
				}

			}.bind(_cell);

			// создаём экземпляр графического редактора
			t.editor = new $p.Editor(_cell, {
				set_text: function (text) {
					cell.setText({text: "<b>" + text + "</b>"});
				}
			});

			setTimeout(function () {
				$p.iface.set_hash(obj);
			});
		}

		// Рисуем дополнительные элементы навигации
		t.tb_nav = $p.iface.btns_nav(cell.cell.querySelector(".dhx_cell_sidebar_hdr"));

		// страницы карусели
		t.carousel = cell.attachCarousel({
			keys:           false,
			touch_scroll:   false,
			offset_left:    0,
			offset_top:     0,
			offset_item:    0
		});
		t.carousel.hideControls();
		t.carousel.addCell("list");
		t.carousel.addCell("doc");
		t.carousel.addCell("builder");
		t.carousel.conf.anim_step = 200;
		t.carousel.conf.anim_slide = "left 0.1s";


		// Подписываемся на событие окончания загрузки локальных данных
		// и рисум список заказов и заготовку графического редактора
		if($p.job_prm.builder)
			setTimeout(create_elmnts);
		else
			$p.on({ predefined_elmnts_inited: create_elmnts });

		/**
		 * Обработчик маршрутизации
		 * @param hprm
		 * @return {boolean}
		 */
		$p.on("hash_route", hash_route);

	}

	return $p.iface._orders || ($p.iface._orders = new OViewOrders());

};

/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_settings
 */

$p.iface.view_settings = function (cell) {

	function OViewSettings(){

		var t = this, deferred_id;

		function hash_route(hprm) {

			if(hprm.view == "settings"){

				return false;
			}

			return true;
		}

		function deferred_init(){

			// отписываемся от события
			if(deferred_id)
				$p.eve.detachEvent(deferred_id);

			// разблокируем
			if(t.form2.isLocked())
				t.form2.unlock();

			// устанавливаем значения сокрытия колонок цен
			if($p.wsql.get_user_param("hide_price_dealer")){
				t.form2.checkItem("hide_price", "hide_price_dealer");

			}else if($p.wsql.get_user_param("hide_price_manufacturer")){
				t.form2.checkItem("hide_price", "hide_price_manufacturer");

			}else{
				t.form2.checkItem("hide_price", "hide_price_no");

			}

			if($p.current_acl.partners_uids.length){


				var partner = $p.cat.partners.get($p.current_acl.partners_uids[0]),
					prm = {calc_order_row: {
						nom: $p.cat.nom.get(),
						_owner: {_owner: {partner: partner}}
					}};

				$p.pricing.price_type(prm);

				t.form2.setItemValue("surcharge_internal", prm.price_type.extra_charge_external);


			}else{
				t.form2.disableItem("surcharge_internal");
				t.form2.disableItem("discount_percent_internal");
			}

			// подключаем обработчик изменения значений в форме
			t.form2.attachEvent("onChange", function (name, value, state){
				
				if(name == "hide_price"){
					if(value == "hide_price_dealer"){
						$p.wsql.set_user_param("hide_price_dealer", true);
						$p.wsql.set_user_param("hide_price_manufacturer", "");

					}else if(value == "hide_price_manufacturer"){
						$p.wsql.set_user_param("hide_price_dealer", "");
						$p.wsql.set_user_param("hide_price_manufacturer", true);

					}else{
						$p.wsql.set_user_param("hide_price_dealer", "");
						$p.wsql.set_user_param("hide_price_manufacturer", "");
					}
				}
			});

			t.form2.getInput("modifiers").onchange = function () {
				$p.wsql.set_user_param("modifiers", this.value);
			};

		}
		
		t.tb_nav = $p.iface.btns_nav(cell.cell.querySelector(".dhx_cell_sidebar_hdr"));

		// разделы настроек
		t.tabs = cell.attachTabbar({
			arrows_mode:    "auto",
			tabs: [
				{id: "const", text: '<i class="fa fa-key"></i> Общее', active: true},
				{id: "industry", text: '<i class="fa fa-industry"></i> Технология'},
				{id: "price", text: '<i class="fa fa-money"></i> Учет'},
				{id: "events", text: '<i class="fa fa-calendar-check-o"></i> Планирование'}
			]
		});

		t.tabs.attachEvent("onSelect", function(id){
			if(t[id] && t[id].tree && t[id].tree.getSelectedId()){
				t[id].tree.callEvent("onSelect", [t[id].tree.getSelectedId()]);
			}
			return true;
		});

		// закладка основных настроек
		t.tabs.cells("const").attachHTMLString($p.injected_data['view_settings.html']);
		t.const = t.tabs.cells("const").cell.querySelector(".dhx_cell_cont_tabbar");
		t.const.style.overflow = "auto";

		// форма общих настроек
		t.form1 = t.const.querySelector("[name=form1]");
		t.form1 = new dhtmlXForm(t.form1.firstChild, [

			{ type:"settings", labelWidth:80, position:"label-left"  },

			{type: "label", labelWidth:320, label: "Тип устройства", className: "label_options"},
			{ type:"block", blockOffset: 0, name:"block_device_type", list:[
				{ type:"settings", labelAlign:"left", position:"label-right"  },
				{ type:"radio" , name:"device_type", labelWidth:120, label:'<i class="fa fa-desktop"></i> Компьютер', value:"desktop"},
				{ type:"newcolumn"   },
				{ type:"radio" , name:"device_type", labelWidth:150, label:'<i class="fa fa-mobile fa-lg"></i> Телефон, планшет', value:"phone"}
			]  },
			{type:"template", label:"",value:"", note: {text: "Класс устройства определяется автоматически, но пользователь может задать его явно", width: 320}},

			//{type: "label", labelWidth:320, label: "Адрес http сервиса 1С", className: "label_options"},
			//{type:"input" , inputWidth: 220, name:"rest_path", label:"Путь", validate:"NotEmpty"},
			//{type:"template", label:"",value:"",
			//	note: {text: "Можно указать как относительный, так и абсолютный URL публикации 1С OData. " +
			//	"О настройке кроссдоменных запросов к 1С <a href='#'>см. здесь</a>", width: 320}},

			{type: "label", labelWidth:320, label: "Адрес CouchDB", className: "label_options"},
			{type:"input" , inputWidth: 220, name:"couch_path", label:"Путь:", validate:"NotEmpty"},
			{type:"template", label:"",value:"",
				note: {text: "Можно указать как относительный, так и абсолютный URL публикации CouchDB", width: 320}},

			{type: "label", labelWidth:320, label: "Значение разделителя данных", className: "label_options"},
			{type:"input" , inputWidth: 220, name:"zone", label:"Зона:", numberFormat: ["0", "", ""], validate:"NotEmpty,ValidInteger"},
			{type:"template", label:"",value:"", note: {text: "Для неразделенной публикации, зона = 0", width: 320}},

			{type: "label", labelWidth:320, label: "Суффикс базы пользователя", className: "label_options"},
			{type:"input" , inputWidth: 220, name:"couch_suffix", label:"Суффикс:"},
			{type:"template", label:"",value:"",
				note: {text: "Назначается дилеру при регистрации", width: 320}},

			{type: "label", labelWidth:320, label: "Сохранять пароль пользователя", className: "label_options"},
			{type:"checkbox", name:"enable_save_pwd", label:"Разрешить:", checked: $p.wsql.get_user_param("enable_save_pwd", "boolean")},
			{type:"template", label:"",value:"", note: {text: "Не рекомендуется, если к компьютеру имеют доступ посторонние лица", width: 320}},
			{type:"template", label:"",value:"", note: {text: "", width: 320}},

			{ type:"block", blockOffset: 0, name:"block_buttons", list:[
				{type: "button", name: "save", value: "<i class='fa fa-floppy-o fa-lg'></i>", tooltip: "Применить настройки и перезагрузить программу"},
				{type:"newcolumn"},
				{type: "button", offsetLeft: 20, name: "reset", value: "<i class='fa fa-refresh fa-lg'></i>", tooltip: "Стереть справочники и перезаполнить данными сервера"},
				{type:"newcolumn"},
				{type: "button", offsetLeft: 60, name: "upload", value: "<i class='fa fa-cloud-upload fa-lg'></i>", tooltip: "Выгрузить изменения справочников на сервер"}
			]  }

			]
		);
		t.form1.cont.style.fontSize = "100%";

		t.form1.disableItem("couch_path");
		t.form1.disableItem("couch_suffix");

		// инициализация свойств

		t.form1.checkItem("device_type", $p.job_prm.device_type);

		["zone", "couch_path", "couch_suffix"].forEach(function (prm) {
			if(prm == "zone")
				t.form1.setItemValue(prm, $p.wsql.get_user_param(prm));
			else
				t.form1.setItemValue(prm, $p.wsql.get_user_param(prm) || $p.job_prm[prm]);
		});

		t.form1.attachEvent("onChange", function (name, value, state){
			$p.wsql.set_user_param(name, name == "enable_save_pwd" ? state || "" : value);
		});

		t.form1.attachEvent("onButtonClick", function(name){

			function do_reload(){
				setTimeout(function () {
					$p.eve.redirect = true;
					location.reload(true);
				}, 2000);
			}

			if(name == "save")
				location.reload();

			else if(name == "reset"){
				dhtmlx.confirm({
					title: "Сброс данных",
					text: "Стереть справочники и перезаполнить данными сервера?",
					cancel: $p.msg.cancel,
					callback: function(btn) {
						if(btn)
							$p.wsql.pouch.reset_local_data();
					}
				});
				
			}else if(name == "upload"){
				$p.pricing.cut_upload();
			}
		});

		// форма личных настроек
		t.form2 = t.const.querySelector("[name=form2]");
		t.form2 = new dhtmlXForm(t.form2.firstChild, [
			{ type:"settings", labelWidth:220, position:"label-left"  },

			{type: "label", labelWidth:320, label: "Колонки цен", className: "label_options"},
			{ type:"block", blockOffset: 0, name:"block_hide_price", list:[
				{ type:"settings", labelAlign:"left", position:"label-right"  },
				{ type:"radio" , name:"hide_price", label:'<i class="fa fa-eye fa-fw"></i> Показывать все цены', value:"hide_price_no"},
				{ type:"radio" , name:"hide_price", label:'<i class="fa fa-user-secret fa-fw"></i> Скрыть цены дилера', value:"hide_price_dealer"},
				{ type:"radio" , name:"hide_price", label:'<i class="fa fa-university fa-fw"></i> Скрыть цены завода', value:"hide_price_manufacturer"}
			]  },
			{type:"template", label:"",value:"", note: {text: "Настройка видимости колонок в документе 'Расчет' и графическом построителе", width: 320}},

			{type: "label", labelWidth:320, label: "Наценки и скидки", className: "label_options"},
			{type:"input" , labelWidth:180, inputWidth: 120, name:"surcharge_internal", label:"Наценка дилера, %:", numberFormat: ["0", "", ""], validate:"NotEmpty,ValidInteger"},
			{type:"input" , labelWidth:180, inputWidth: 120, name:"discount_percent_internal", label:"Скидка дилера, %:", numberFormat: ["0", "", ""], validate:"NotEmpty,ValidInteger"},
			{type:"template", label:"",value:"", note: {text: "Значения наценки и скидки по умолчанию, которые дилер предоставляет своим (конечным) покупателям", width: 320}},

			{type: "label", labelWidth:320, label: "Подключаемые модули", className: "label_options"},
			{type:"input" , position:"label-top", inputWidth: 320, name:"modifiers", label:"Модификаторы:", value: $p.wsql.get_user_param("modifiers"), rows: 3, style:"height:80px;"},
			{type:"template", label:"",value:"", note: {text: "Список дополнительных модулей", width: 320}}

		]);
		t.form2.cont.style.fontSize = "100%";

		// если основной контрагент уже в озу, устанавливаем умолчания. иначе, setReadonly и подписываемся на событие окончания загрузки
		if(!$p.cat.partners.alatable.length || !$p.current_acl){
			t.form2.lock();
			deferred_id = $p.eve.attachEvent("predefined_elmnts_inited", deferred_init);
		}else {
			deferred_init();
		}



		// закладка технологии
		t.industry = {
			layout: t.tabs.cells("industry").attachLayout({
				pattern: "2U",
				cells: [{
					id: "a",
					text: "Разделы",
					collapsed_text: "Разделы",
					width: 200
				}, {
					id: "b",
					text: "Раздел",
					header: false
				}],
				offsets: { top: 0, right: 0, bottom: 0, left: 0}
			})
		};
		// дерево технологических справочников
		t.industry.tree = t.industry.layout.cells("a").attachTreeView();
		t.industry.tree.loadStruct($p.injected_data["tree_industry.xml"]);
		t.industry.tree.attachEvent("onSelect", function (name) {
			$p.md.mgr_by_class_name(name).form_list(t.industry.layout.cells("b"), {hide_header: true});
		});

		// закладка ценообразования
		t.price = {
			layout: t.tabs.cells("price").attachLayout({
				pattern: "2U",
				cells: [{
					id: "a",
					text: "Разделы",
					collapsed_text: "Разделы",
					width: 200
				}, {
					id: "b",
					text: "Раздел",
					header: false
				}],
				offsets: { top: 0, right: 0, bottom: 0, left: 0}
			})
		};
		// дерево справочников ценообразования
		t.price.tree = t.price.layout.cells("a").attachTreeView();
		t.price.tree.loadStruct($p.injected_data["tree_price.xml"]);
		t.price.tree.attachEvent("onSelect", function (name) {
			$p.md.mgr_by_class_name(name).form_list(t.price.layout.cells("b"), {hide_header: true});
		});

		// закладка планирования
		t.events = {
			layout: t.tabs.cells("events").attachLayout({
				pattern: "2U",
				cells: [{
					id: "a",
					text: "Разделы",
					collapsed_text: "Разделы",
					width: 200
				}, {
					id: "b",
					text: "Раздел",
					header: false
				}],
				offsets: { top: 0, right: 0, bottom: 0, left: 0}
			})
		};
		// дерево справочников планирования
		t.events.tree = t.events.layout.cells("a").attachTreeView();
		t.events.tree.loadStruct($p.injected_data["tree_events.xml"]);
		t.events.tree.attachEvent("onSelect", function (name) {
			$p.md.mgr_by_class_name(name).form_list(t.events.layout.cells("b"), {hide_header: true});
		});
		
		
		/**
		 * Обработчик маршрутизации
		 * @param hprm
		 * @return {boolean}
		 */
		$p.on("hash_route", hash_route);

	}

	return $p.iface._settings || ($p.iface._settings = new OViewSettings());

};

return undefined;
}));
