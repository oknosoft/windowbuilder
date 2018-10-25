/* eslint-disable */
module.exports = function meta($p) {

$p.wsql.alasql('USE md; CREATE TABLE IF NOT EXISTS `ireg_margin_coefficients` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `price_group` CHAR, `key` CHAR, `condition_formula` CHAR, `marginality` FLOAT, `marginality_min` FLOAT, `marginality_internal` FLOAT, `price_type_first_cost` CHAR, `price_type_sale` CHAR, `price_type_internal` CHAR, `formula` CHAR, `sale_formula` CHAR, `internal_formula` CHAR, `external_formula` CHAR, `extra_charge_external` FLOAT, `discount_external` FLOAT, `discount` FLOAT, `note` CHAR); CREATE TABLE IF NOT EXISTS `ireg_currency_courses` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `currency` CHAR, `period` Date, `course` FLOAT, `multiplicity` INT); CREATE TABLE IF NOT EXISTS `ireg_log_view` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `key` CHAR, `user` CHAR); CREATE TABLE IF NOT EXISTS `ireg_log` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `date` INT, `sequence` INT, `class` CHAR, `note` CHAR, `obj` CHAR, `user` CHAR); CREATE TABLE IF NOT EXISTS `doc_planning_event` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `phase` CHAR, `key` CHAR, `recipient` CHAR, `trans` CHAR, `partner` CHAR, `project` CHAR, `Основание` CHAR, `note` CHAR, `ts_executors` JSON, `ts_planning` JSON); CREATE TABLE IF NOT EXISTS `doc_nom_prices_setup` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `price_type` CHAR, `currency` CHAR, `responsible` CHAR, `note` CHAR, `ts_goods` JSON); CREATE TABLE IF NOT EXISTS `doc_selling` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `warehouse` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_goods` JSON, `ts_services` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `doc_credit_cash_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `cashbox` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `doc_debit_cash_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `cashbox` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `doc_credit_bank_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `doc_debit_bank_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `doc_work_centers_performance` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `start_date` Date, `expiration_date` Date, `responsible` CHAR, `note` CHAR, `ts_planning` JSON); CREATE TABLE IF NOT EXISTS `doc_credit_card_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `doc_calc_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `number_internal` CHAR, `project` CHAR, `organization` CHAR, `partner` CHAR, `client_of_dealer` CHAR, `contract` CHAR, `bank_account` CHAR, `note` CHAR, `manager` CHAR, `leading_manager` CHAR, `department` CHAR, `warehouse` CHAR, `doc_amount` FLOAT, `amount_operation` FLOAT, `amount_internal` FLOAT, `accessory_characteristic` CHAR, `sys_profile` CHAR, `sys_furn` CHAR, `phone` CHAR, `delivery_area` CHAR, `shipping_address` CHAR, `coordinates` CHAR, `address_fields` CHAR, `difficult` BOOLEAN, `vat_consider` BOOLEAN, `vat_included` BOOLEAN, `settlements_course` FLOAT, `settlements_multiplicity` INT, `extra_charge_external` FLOAT, `obj_delivery_state` CHAR, `category` CHAR, `ts_production` JSON, `ts_extra_fields` JSON, `ts_contact_information` JSON, `ts_planning` JSON); CREATE TABLE IF NOT EXISTS `doc_work_centers_task` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `key` CHAR, `recipient` CHAR, `biz_cuts` CHAR, `responsible` CHAR, `note` CHAR, `ts_planning` JSON, `ts_demand` JSON, `ts_cuts` JSON, `ts_cutting` JSON); CREATE TABLE IF NOT EXISTS `doc_purchase` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `warehouse` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_goods` JSON, `ts_services` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `doc_registers_correction` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `original_doc_type` CHAR, `responsible` CHAR, `note` CHAR, `partner` CHAR, `ts_registers_table` JSON); CREATE TABLE IF NOT EXISTS `cat_delivery_directions` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `predefined_name` CHAR, `ts_composition` JSON); CREATE TABLE IF NOT EXISTS `cat_nonstandard_attributes` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `crooked` BOOLEAN, `colored` BOOLEAN, `lay` BOOLEAN, `made_to_order` BOOLEAN, `packing` BOOLEAN, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_insert_bind` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `key` CHAR, `captured` BOOLEAN, `editor` CHAR, `zone` INT, `zones` CHAR, `predefined_name` CHAR, `ts_production` JSON, `ts_inserts` JSON); CREATE TABLE IF NOT EXISTS `cat_nom_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `vat_rate` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_price_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `definition` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_characteristics` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `x` FLOAT, `y` FLOAT, `z` FLOAT, `s` FLOAT, `clr` CHAR, `weight` FLOAT, `calc_order` CHAR, `product` INT, `leading_product` CHAR, `leading_elm` INT, `origin` CHAR, `base_block` CHAR, `sys` CHAR, `note` CHAR, `obj_delivery_state` CHAR, `partner` CHAR, `department` CHAR, `builder_props` CHAR, `svg` CHAR, `predefined_name` CHAR, `owner` CHAR, `ts_constructions` JSON, `ts_coordinates` JSON, `ts_inserts` JSON, `ts_params` JSON, `ts_cnn_elmnts` JSON, `ts_glass_specification` JSON, `ts_extra_fields` JSON, `ts_glasses` JSON, `ts_specification` JSON); CREATE TABLE IF NOT EXISTS `cat_individuals` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `birth_date` Date, `inn` CHAR, `imns_code` CHAR, `note` CHAR, `pfr_number` CHAR, `sex` CHAR, `birth_place` CHAR, `ОсновноеИзображение` CHAR, `Фамилия` CHAR, `Имя` CHAR, `Отчество` CHAR, `ФамилияРП` CHAR, `ИмяРП` CHAR, `ОтчествоРП` CHAR, `ОснованиеРП` CHAR, `ДолжностьРП` CHAR, `Должность` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_contact_information` JSON); CREATE TABLE IF NOT EXISTS `cat_nom_prices_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `price_currency` CHAR, `discount_percent` FLOAT, `vat_price_included` BOOLEAN, `rounding_order` CHAR, `rounding_in_a_big_way` BOOLEAN, `note` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_cash_flow_articles` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `definition` CHAR, `sorting_field` INT, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_stores` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `note` CHAR, `department` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_projects` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `start` Date, `finish` Date, `launch` Date, `readiness` Date, `finished` BOOLEAN, `responsible` CHAR, `note` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_users` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `invalid` BOOLEAN, `department` CHAR, `individual_person` CHAR, `note` CHAR, `ancillary` BOOLEAN, `user_ib_uid` CHAR, `user_fresh_uid` CHAR, `id` CHAR, `prefix` CHAR, `branch` CHAR, `push_only` BOOLEAN, `suffix` CHAR, `direct` BOOLEAN, `ts_extra_fields` JSON, `ts_contact_information` JSON, `ts_acl_objs` JSON); CREATE TABLE IF NOT EXISTS `cat_divisions` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `main_project` CHAR, `sorting_field` INT, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_color_price_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `color_price_group_destination` CHAR, `predefined_name` CHAR, `ts_price_groups` JSON, `ts_clr_conformity` JSON); CREATE TABLE IF NOT EXISTS `cat_cnns` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `priority` INT, `amin` INT, `amax` INT, `sd1` CHAR, `sz` FLOAT, `cnn_type` CHAR, `ahmin` INT, `ahmax` INT, `lmin` INT, `lmax` INT, `tmin` INT, `tmax` INT, `var_layers` BOOLEAN, `for_direct_profile_only` INT, `art1vert` BOOLEAN, `art1glass` BOOLEAN, `art2glass` BOOLEAN, `note` CHAR, `captured` BOOLEAN, `editor` CHAR, `zones` CHAR, `predefined_name` CHAR, `ts_specification` JSON, `ts_cnn_elmnts` JSON, `ts_selection_params` JSON); CREATE TABLE IF NOT EXISTS `cat_delivery_areas` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `country` CHAR, `region` CHAR, `city` CHAR, `latitude` FLOAT, `longitude` FLOAT, `ind` CHAR, `delivery_area` CHAR, `specify_area_by_geocoder` BOOLEAN, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_production_params` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `default_clr` CHAR, `clr_group` CHAR, `tmin` INT, `tmax` INT, `allow_open_cnn` BOOLEAN, `flap_pos_by_impost` BOOLEAN, `captured` BOOLEAN, `editor` CHAR, `zones` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_elmnts` JSON, `ts_production` JSON, `ts_product_params` JSON, `ts_furn_params` JSON, `ts_base_blocks` JSON); CREATE TABLE IF NOT EXISTS `cat_parameters_keys` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `priority` INT, `note` CHAR, `sorting_field` INT, `applying` CHAR, `captured` BOOLEAN, `editor` CHAR, `zones` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_params` JSON); CREATE TABLE IF NOT EXISTS `cat_inserts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `article` CHAR, `insert_type` CHAR, `clr` CHAR, `lmin` INT, `lmax` INT, `hmin` INT, `hmax` INT, `smin` FLOAT, `smax` FLOAT, `for_direct_profile_only` INT, `ahmin` INT, `ahmax` INT, `priority` INT, `mmin` INT, `mmax` INT, `impost_fixation` CHAR, `shtulp_fixation` BOOLEAN, `can_rotate` BOOLEAN, `sizeb` FLOAT, `clr_group` CHAR, `is_order_row` CHAR, `note` CHAR, `insert_glass_type` CHAR, `available` BOOLEAN, `slave` BOOLEAN, `captured` BOOLEAN, `editor` CHAR, `zones` CHAR, `predefined_name` CHAR, `ts_specification` JSON, `ts_selection_params` JSON, `ts_product_params` JSON); CREATE TABLE IF NOT EXISTS `cat_organizations` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `prefix` CHAR, `individual_legal` CHAR, `individual_entrepreneur` CHAR, `inn` CHAR, `kpp` CHAR, `main_bank_account` CHAR, `main_cashbox` CHAR, `certificate_series_number` CHAR, `certificate_date_issue` Date, `certificate_authority_name` CHAR, `certificate_authority_code` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_contact_information` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_nom` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `article` CHAR, `name_full` CHAR, `base_unit` CHAR, `storage_unit` CHAR, `nom_kind` CHAR, `nom_group` CHAR, `vat_rate` CHAR, `note` CHAR, `price_group` CHAR, `elm_type` CHAR, `len` FLOAT, `width` FLOAT, `thickness` FLOAT, `sizefurn` FLOAT, `sizefaltz` FLOAT, `density` FLOAT, `volume` FLOAT, `arc_elongation` FLOAT, `loss_factor` FLOAT, `rounding_quantity` INT, `clr` CHAR, `cutting_optimization_type` CHAR, `crooked` BOOLEAN, `colored` BOOLEAN, `lay` BOOLEAN, `made_to_order` BOOLEAN, `packing` BOOLEAN, `days_to_execution` INT, `days_from_execution` INT, `pricing` CHAR, `visualization` CHAR, `complete_list_sorting` INT, `is_accessory` BOOLEAN, `is_procedure` BOOLEAN, `is_service` BOOLEAN, `is_pieces` BOOLEAN, `captured` BOOLEAN, `editor` CHAR, `zones` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_partners` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `main_bank_account` CHAR, `note` CHAR, `kpp` CHAR, `okpo` CHAR, `inn` CHAR, `individual_legal` CHAR, `main_contract` CHAR, `identification_document` CHAR, `buyer_main_manager` CHAR, `is_buyer` BOOLEAN, `is_supplier` BOOLEAN, `primary_contact` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_contact_information` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_units` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `international_short` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_cashboxes` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `funds_currency` CHAR, `department` CHAR, `current_account` CHAR, `predefined_name` CHAR, `owner` CHAR); CREATE TABLE IF NOT EXISTS `cat_meta_ids` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `full_moniker` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_property_values` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `heft` FLOAT, `ПолноеНаименование` CHAR, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_nom_units` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `qualifier_unit` CHAR, `heft` FLOAT, `volume` FLOAT, `coefficient` FLOAT, `rounding_threshold` INT, `predefined_name` CHAR, `owner` CHAR); CREATE TABLE IF NOT EXISTS `cat_contracts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `settlements_currency` CHAR, `mutual_settlements` CHAR, `contract_kind` CHAR, `date` Date, `check_days_without_pay` BOOLEAN, `allowable_debts_amount` FLOAT, `allowable_debts_days` INT, `note` CHAR, `check_debts_amount` BOOLEAN, `check_debts_days` BOOLEAN, `number_doc` CHAR, `organization` CHAR, `main_cash_flow_article` CHAR, `main_project` CHAR, `accounting_reflect` BOOLEAN, `tax_accounting_reflect` BOOLEAN, `prepayment_percent` FLOAT, `validity` Date, `vat_included` BOOLEAN, `price_type` CHAR, `vat_consider` BOOLEAN, `days_without_pay` INT, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_nom_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `nom_type` CHAR, `dnom` CHAR, `dcharacteristic` CHAR, `captured` BOOLEAN, `zones` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_contact_information_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `mandatory_fields` BOOLEAN, `type` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_currencies` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `extra_charge` FLOAT, `main_currency` CHAR, `parameters_russian_recipe` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_furns` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `flap_weight_max` INT, `left_right` BOOLEAN, `is_set` BOOLEAN, `is_sliding` BOOLEAN, `furn_set` CHAR, `side_count` INT, `handle_side` INT, `open_type` CHAR, `name_short` CHAR, `captured` BOOLEAN, `editor` CHAR, `zones` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_open_tunes` JSON, `ts_specification` JSON, `ts_selection_params` JSON, `ts_specification_restrictions` JSON, `ts_colors` JSON); CREATE TABLE IF NOT EXISTS `cat_branches` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `suffix` CHAR, `direct` BOOLEAN, `use` BOOLEAN, `mode` INT, `parent` CHAR, `ts_organizations` JSON, `ts_partners` JSON, `ts_divisions` JSON, `ts_price_types` JSON, `ts_keys` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_elm_visualization` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `svg_path` CHAR, `note` CHAR, `attributes` CHAR, `rotate` INT, `offset` INT, `side` CHAR, `elm_side` INT, `cx` INT, `cy` INT, `angle_hor` INT, `priority` INT, `mode` INT, `captured` BOOLEAN, `editor` CHAR, `zones` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_formulas` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `formula` CHAR, `leading_formula` CHAR, `condition_formula` BOOLEAN, `definition` CHAR, `template` CHAR, `sorting_field` INT, `async` BOOLEAN, `disabled` BOOLEAN, `zone` INT, `predefined_name` CHAR, `parent` CHAR, `ts_params` JSON); CREATE TABLE IF NOT EXISTS `cat_destinations` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `КоличествоРеквизитов` CHAR, `КоличествоСведений` CHAR, `Используется` BOOLEAN, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON, `ts_extra_properties` JSON); CREATE TABLE IF NOT EXISTS `cat_banks_qualifier` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `correspondent_account` CHAR, `city` CHAR, `address` CHAR, `phone_numbers` CHAR, `activity_ceased` BOOLEAN, `swift` CHAR, `inn` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_property_values_hierarchy` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `heft` FLOAT, `ПолноеНаименование` CHAR, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_organization_bank_accounts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `bank` CHAR, `bank_bic` CHAR, `funds_currency` CHAR, `account_number` CHAR, `settlements_bank` CHAR, `settlements_bank_bic` CHAR, `department` CHAR, `predefined_name` CHAR, `owner` CHAR); CREATE TABLE IF NOT EXISTS `cat_partner_bank_accounts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `account_number` CHAR, `bank` CHAR, `settlements_bank` CHAR, `correspondent_text` CHAR, `appointments_text` CHAR, `funds_currency` CHAR, `bank_bic` CHAR, `bank_name` CHAR, `bank_correspondent_account` CHAR, `bank_city` CHAR, `bank_address` CHAR, `bank_phone_numbers` CHAR, `settlements_bank_bic` CHAR, `settlements_bank_correspondent_account` CHAR, `settlements_bank_city` CHAR, `predefined_name` CHAR, `owner` CHAR); CREATE TABLE IF NOT EXISTS `cat_countries` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `alpha2` CHAR, `alpha3` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_clrs` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `ral` CHAR, `machine_tools_clr` CHAR, `clr_str` CHAR, `clr_out` CHAR, `clr_in` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_params_links` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `master` CHAR, `slave` CHAR, `hide` BOOLEAN, `note` CHAR, `use_master` INT, `captured` BOOLEAN, `editor` CHAR, `zone` INT, `zones` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_leadings` JSON, `ts_values` JSON); CREATE TABLE IF NOT EXISTS `cat_scheme_settings` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `obj` CHAR, `user` CHAR, `order` INT, `query` CHAR, `date_from` Date, `date_till` Date, `standard_period` CHAR, `formula` CHAR, `output` CHAR, `tag` CHAR, `ts_fields` JSON, `ts_sorting` JSON, `ts_dimensions` JSON, `ts_resources` JSON, `ts_selection` JSON, `ts_params` JSON, `ts_composition` JSON, `ts_conditional_appearance` JSON); CREATE TABLE IF NOT EXISTS `cat_meta_fields` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `cat_meta_objs` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `cch_properties` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `shown` BOOLEAN, `sorting_field` INT, `extra_values_owner` CHAR, `available` BOOLEAN, `mandatory` BOOLEAN, `include_to_name` BOOLEAN, `list` INT, `caption` CHAR, `note` CHAR, `destination` CHAR, `tooltip` CHAR, `is_extra_property` BOOLEAN, `include_to_description` BOOLEAN, `predefined_name` CHAR, `type` JSON); CREATE TABLE IF NOT EXISTS `cch_predefined_elmnts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `value` CHAR, `definition` CHAR, `synonym` CHAR, `list` INT, `zone` INT, `predefined_name` CHAR, `parent` CHAR, `type` CHAR, `ts_elmnts` JSON); CREATE TABLE IF NOT EXISTS `enm_individual_legal` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_planning_phases` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_elm_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_specification_order_row_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_cnn_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_sz_line_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_open_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_cutting_optimization_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_nom_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_contact_information_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_lay_split_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_inserts_glass_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_inserts_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_cnn_sides` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_vat_rates` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_specification_installation_methods` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_angle_calculating_ways` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_count_calculating_ways` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_buyers_order_states` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_bind_coordinates` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_parameters_keys_applying` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_gender` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_positions` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_orientations` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_open_directions` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_color_price_group_destinations` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_order_categories` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_use_cut` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_obj_delivery_states` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_planning_detailing` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_text_aligns` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_contract_kinds` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_debit_credit_kinds` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_mutual_contract_settlements` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_align_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_contraction_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_offset_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_transfer_operations_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_impost_mount_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_inset_attrs_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_path_kind` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_report_output` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_quick_access` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_standard_period` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_data_field_kinds` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_label_positions` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_comparison_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_sort_directions` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_accumulation_record_type` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); ', []);

$p.md.init({"enm":{"accumulation_record_type":[{"order":0,"name":"debit","synonym":"Приход"},{"order":1,"name":"credit","synonym":"Расход"}],"sort_directions":[{"order":0,"name":"asc","synonym":"По возрастанию","default":true},{"order":1,"name":"desc","synonym":"По убыванию"}],"comparison_types":[{"order":0,"name":"gt","synonym":"Больше"},{"order":1,"name":"gte","synonym":"Больше или равно"},{"order":2,"name":"lt","synonym":"Меньше"},{"order":3,"name":"lte","synonym":"Меньше или равно "},{"order":4,"name":"eq","synonym":"Равно","default":true},{"order":5,"name":"ne","synonym":"Не равно"},{"order":6,"name":"in","synonym":"В списке"},{"order":7,"name":"nin","synonym":"Не в списке"},{"order":8,"name":"lke","synonym":"Содержит "},{"order":9,"name":"nlk","synonym":"Не содержит"},{"order":10,"name":"filled","synonym":"Заполнено "},{"order":11,"name":"nfilled","synonym":"Не заполнено"}],"label_positions":[{"order":0,"name":"inherit","synonym":"Наследовать","default":true},{"order":1,"name":"hide","synonym":"Скрыть"},{"order":2,"name":"left","synonym":"Лево"},{"order":3,"name":"right","synonym":"Право"},{"order":4,"name":"top","synonym":"Верх"},{"order":5,"name":"bottom","synonym":"Низ"}],"data_field_kinds":[{"order":0,"name":"field","synonym":"Поле ввода","default":true},{"order":1,"name":"input","synonym":"Простой текст"},{"order":2,"name":"text","synonym":"Многострочный текст"},{"order":3,"name":"label","synonym":"Надпись"},{"order":4,"name":"link","synonym":"Гиперссылка"},{"order":5,"name":"cascader","synonym":"Каскадер"},{"order":6,"name":"toggle","synonym":"Переключатель"},{"order":7,"name":"image","synonym":"Картинка"},{"order":8,"name":"type","synonym":"Тип значения"},{"order":9,"name":"path","synonym":"Путь к данным"},{"order":10,"name":"typed_field","synonym":"Поле связи по типу"},{"order":11,"name":"props","synonym":"Свойства объекта"},{"order":12,"name":"star","synonym":"Пометка"}],"standard_period":[{"order":0,"name":"custom","synonym":"Произвольный","default":true},{"order":1,"name":"yesterday","synonym":"Вчера"},{"order":2,"name":"today","synonym":"Сегодня"},{"order":3,"name":"tomorrow","synonym":"Завтра"},{"order":4,"name":"last7days","synonym":"Последние 7 дней"},{"order":5,"name":"last30days","synonym":"Последние 30 дней"},{"order":6,"name":"last3Month","synonym":"Последние 3 месяца"},{"order":7,"name":"lastWeek","synonym":"Прошлая неделя"},{"order":8,"name":"lastTendays","synonym":"Прошлая декада"},{"order":9,"name":"lastMonth","synonym":"Прошлый месяц"},{"order":10,"name":"lastQuarter","synonym":"Прошлый квартал"},{"order":11,"name":"lastHalfYear","synonym":"Прошлое полугодие"},{"order":12,"name":"lastYear","synonym":"Прошлый год"},{"order":13,"name":"next7Days","synonym":"Следующие 7 дней"},{"order":14,"name":"nextTendays","synonym":"Следующая декада"},{"order":15,"name":"nextWeek","synonym":"Следующая неделя"},{"order":16,"name":"nextMonth","synonym":"Следующий месяц"},{"order":17,"name":"nextQuarter","synonym":"Следующий квартал"},{"order":18,"name":"nextHalfYear","synonym":"Следующее полугодие"},{"order":19,"name":"nextYear","synonym":"Следующий год"},{"order":20,"name":"tillEndOfThisYear","synonym":"До конца этого года"},{"order":21,"name":"tillEndOfThisQuarter","synonym":"До конца этого квартала"},{"order":22,"name":"tillEndOfThisMonth","synonym":"До конца этого месяца"},{"order":23,"name":"tillEndOfThisHalfYear","synonym":"До конца этого полугодия"},{"order":24,"name":"tillEndOfThistendays","synonym":"До конца этой декады"},{"order":25,"name":"tillEndOfThisweek","synonym":"До конца этой недели"},{"order":26,"name":"fromBeginningOfThisYear","synonym":"С начала этого года"},{"order":27,"name":"fromBeginningOfThisQuarter","synonym":"С начала этого квартала"},{"order":28,"name":"fromBeginningOfThisMonth","synonym":"С начала этого месяца"},{"order":29,"name":"fromBeginningOfThisHalfYear","synonym":"С начала этого полугодия"},{"order":30,"name":"fromBeginningOfThisTendays","synonym":"С начала этой декады"},{"order":31,"name":"fromBeginningOfThisWeek","synonym":"С начала этой недели"},{"order":32,"name":"thisTenDays","synonym":"Эта декада"},{"order":33,"name":"thisWeek","synonym":"Эта неделя"},{"order":34,"name":"thisHalfYear","synonym":"Это полугодие"},{"order":35,"name":"thisYear","synonym":"Этот год"},{"order":36,"name":"thisQuarter","synonym":"Этот квартал"},{"order":37,"name":"thisMonth","synonym":"Этот месяц"}],"quick_access":[{"order":0,"name":"none","synonym":"Нет","default":true},{"order":1,"name":"toolbar","synonym":"Панель инструментов"},{"order":2,"name":"drawer","synonym":"Панель формы"}],"report_output":[{"order":0,"name":"grid","synonym":"Таблица","default":true},{"order":1,"name":"chart","synonym":"Диаграмма"},{"order":2,"name":"pivot","synonym":"Cводная таблица"},{"order":3,"name":"html","synonym":"Документ HTML"}],"path_kind":[{"order":0,"name":"generatrix","synonym":"Образующая"},{"order":1,"name":"inner","synonym":"Внутренний"},{"order":2,"name":"outer","synonym":"Внешний"}],"inset_attrs_options":[{"order":0,"name":"НеПоперечина","synonym":"Не поперечина"},{"order":1,"name":"ОбаНаправления","synonym":"Оба направления"},{"order":2,"name":"ОтключитьВтороеНаправление","synonym":"Отключить второе направление"},{"order":3,"name":"ОтключитьШагиВторогоНаправления","synonym":"Отключить шаги второго направления"},{"order":4,"name":"ОтключитьПервоеНаправление","synonym":"Отключить первое направление"},{"order":5,"name":"ОтключитьШагиПервогоНаправления","synonym":"Отключить шаги первого направления"}],"impost_mount_options":[{"order":0,"name":"НетКрепленийИмпостовИРам","synonym":"Нет креплений импостов и рам"},{"order":1,"name":"МогутКрепитьсяИмпосты","synonym":"Могут крепиться импосты"},{"order":2,"name":"ДолжныБытьКрепленияИмпостов","synonym":"Должны быть крепления импостов"}],"transfer_operations_options":[{"order":0,"name":"НетПереноса","synonym":"Нет переноса"},{"order":1,"name":"НаПримыкающий","synonym":"На примыкающий"}],"offset_options":[{"order":0,"name":"ОтНачалаСтороны","synonym":"От начала стороны"},{"order":1,"name":"ОтКонцаСтороны","synonym":"От конца стороны"},{"order":2,"name":"ОтСередины","synonym":"От середины"},{"order":3,"name":"ОтРучки","synonym":"От ручки"},{"order":4,"name":"РазмерПоФальцу","synonym":"Размер по фальцу"},{"order":5,"name":"Формула","synonym":"Формула"}],"contraction_options":[{"order":0,"name":"ОтДлиныСтороны","synonym":"От длины стороны"},{"order":1,"name":"ОтВысотыРучки","synonym":"От высоты ручки"},{"order":2,"name":"ОтДлиныСтороныМинусВысотыРучки","synonym":"От длины стороны минус высота ручки"},{"order":3,"name":"ФиксированнаяДлина","synonym":"Фиксированная длина"}],"align_types":[{"order":0,"name":"Геометрически","synonym":"Геометрически"},{"order":1,"name":"ПоЗаполнениям","synonym":"По заполнениям"}],"mutual_contract_settlements":[{"order":0,"name":"ПоДоговоруВЦелом","synonym":"По договору в целом"},{"order":1,"name":"ПоЗаказам","synonym":"По заказам"},{"order":2,"name":"ПоСчетам","synonym":"По счетам"}],"debit_credit_kinds":[{"order":0,"name":"Приход","synonym":"Приход"},{"order":1,"name":"Расход","synonym":"Расход"}],"contract_kinds":[{"order":0,"name":"СПоставщиком","synonym":"С поставщиком"},{"order":1,"name":"СПокупателем","synonym":"С покупателем"},{"order":2,"name":"СКомитентом","synonym":"С комитентом"},{"order":3,"name":"СКомиссионером","synonym":"С комиссионером"},{"order":4,"name":"Прочее","synonym":"Прочее"}],"text_aligns":[{"order":0,"name":"left","synonym":"Лево"},{"order":1,"name":"right","synonym":"Право"},{"order":2,"name":"center","synonym":"Центр"}],"planning_detailing":[{"order":0,"name":"Изделие","synonym":"Изделие"},{"order":1,"name":"Контур","synonym":"Контур"},{"order":2,"name":"РамныйКонтур","synonym":"Рамный контур"},{"order":3,"name":"Элемент","synonym":"Элемент"},{"order":4,"name":"ТипЭлемента","synonym":"Тип элемента"},{"order":5,"name":"РодительскийЭлемент","synonym":"Родительский элемент"}],"obj_delivery_states":[{"order":0,"name":"Черновик","synonym":"Черновик"},{"order":1,"name":"Отправлен","synonym":"Отправлен"},{"order":2,"name":"Подтвержден","synonym":"Подтвержден"},{"order":3,"name":"Отклонен","synonym":"Отклонен"},{"order":4,"name":"Отозван","synonym":"Отозван"},{"order":5,"name":"Архив","synonym":"Перенесён в архив"},{"order":6,"name":"Шаблон","synonym":"Шаблон"}],"use_cut":[{"order":0,"name":"none","synonym":"Не учитывать"},{"order":1,"name":"all","synonym":"Учитывать"},{"order":2,"name":"input","synonym":"Только входящую"},{"order":3,"name":"output","synonym":"Только исходящую"}],"order_categories":[{"order":0,"name":"order","synonym":"Расчет заказ"},{"order":1,"name":"service","synonym":"Сервис"},{"order":2,"name":"complaints","synonym":"Рекламация"}],"color_price_group_destinations":[{"order":0,"name":"ДляЦенообразования","synonym":"Для ценообразования"},{"order":1,"name":"ДляХарактеристик","synonym":"Для характеристик"},{"order":2,"name":"ДляГруппировкиВПараметрах","synonym":"Для группировки в параметрах"},{"order":3,"name":"ДляОграниченияДоступности","synonym":"Для ограничения доступности"}],"open_directions":[{"order":0,"name":"Левое","synonym":"Левое"},{"order":1,"name":"Правое","synonym":"Правое"},{"order":2,"name":"Откидное","synonym":"Откидное"}],"orientations":[{"order":0,"name":"Горизонтальная","synonym":"Горизонтальная"},{"order":1,"name":"Вертикальная","synonym":"Вертикальная"},{"order":2,"name":"Наклонная","synonym":"Наклонная"}],"positions":[{"order":0,"name":"Любое","synonym":"Любое"},{"order":1,"name":"Верх","synonym":"Верх"},{"order":2,"name":"Низ","synonym":"Низ"},{"order":3,"name":"Лев","synonym":"Лев"},{"order":4,"name":"Прав","synonym":"Прав"},{"order":5,"name":"ЦентрВертикаль","synonym":"Центр вертикаль"},{"order":6,"name":"ЦентрГоризонталь","synonym":"Центр горизонталь"},{"order":7,"name":"Центр","synonym":"Центр"},{"order":8,"name":"ЛевВерх","synonym":"Лев верх"},{"order":9,"name":"ЛевНиз","synonym":"Лев низ"},{"order":10,"name":"ПравВерх","synonym":"Прав верх"},{"order":11,"name":"ПравНиз","synonym":"Прав низ"}],"gender":[{"order":0,"name":"Мужской","synonym":"Мужской"},{"order":1,"name":"Женский","synonym":"Женский"}],"parameters_keys_applying":[{"order":0,"name":"НаправлениеДоставки","synonym":"Направление доставки"},{"order":1,"name":"РабочийЦентр","synonym":"Рабочий центр"},{"order":2,"name":"Технология","synonym":"Технология"},{"order":3,"name":"Ценообразование","synonym":"Ценообразование"},{"order":4,"name":"ПараметрВыбора","synonym":"Параметр выбора"}],"bind_coordinates":[{"order":0,"name":"product","synonym":"Изделие"},{"order":1,"name":"contour","synonym":"Слой"},{"order":2,"name":"b","synonym":"Начало пути"},{"order":3,"name":"e","synonym":"Конец пути"}],"buyers_order_states":[{"order":0,"name":"ОжидаетсяСогласование","synonym":"Ожидается согласование"},{"order":1,"name":"ОжидаетсяАвансДоОбеспечения","synonym":"Ожидается аванс (до обеспечения)"},{"order":2,"name":"ГотовКОбеспечению","synonym":"Готов к обеспечению"},{"order":3,"name":"ОжидаетсяПредоплатаДоОтгрузки","synonym":"Ожидается предоплата (до отгрузки)"},{"order":4,"name":"ОжидаетсяОбеспечение","synonym":"Ожидается обеспечение"},{"order":5,"name":"ГотовКОтгрузке","synonym":"Готов к отгрузке"},{"order":6,"name":"ВПроцессеОтгрузки","synonym":"В процессе отгрузки"},{"order":7,"name":"ОжидаетсяОплатаПослеОтгрузки","synonym":"Ожидается оплата (после отгрузки)"},{"order":8,"name":"ГотовКЗакрытию","synonym":"Готов к закрытию"},{"order":9,"name":"Закрыт","synonym":"Закрыт"}],"count_calculating_ways":[{"order":0,"name":"ПоПериметру","synonym":"По периметру"},{"order":1,"name":"ПоПлощади","synonym":"По площади"},{"order":2,"name":"ДляЭлемента","synonym":"Для элемента"},{"order":3,"name":"ПоШагам","synonym":"По шагам"},{"order":4,"name":"ПоФормуле","synonym":"По формуле"}],"angle_calculating_ways":[{"order":0,"name":"Основной","synonym":"Основной"},{"order":1,"name":"СварнойШов","synonym":"Сварной шов"},{"order":2,"name":"СоединениеПополам","synonym":"Соед./2"},{"order":3,"name":"Соединение","synonym":"Соединение"},{"order":4,"name":"_90","synonym":"90"},{"order":5,"name":"НеСчитать","synonym":"Не считать"}],"specification_installation_methods":[{"order":0,"name":"Всегда","synonym":"Всегда"},{"order":1,"name":"САртикулом1","synonym":"с Арт1"},{"order":2,"name":"САртикулом2","synonym":"с Арт2"}],"vat_rates":[{"order":0,"name":"НДС18","synonym":"18%"},{"order":1,"name":"НДС18_118","synonym":"18% / 118%"},{"order":2,"name":"НДС10","synonym":"10%"},{"order":3,"name":"НДС10_110","synonym":"10% / 110%"},{"order":4,"name":"НДС0","synonym":"0%"},{"order":5,"name":"БезНДС","synonym":"Без НДС"},{"order":6,"name":"НДС20","synonym":"20%"},{"order":7,"name":"НДС20_120","synonym":"20% / 120%"}],"cnn_sides":[{"order":0,"name":"Изнутри","synonym":"Изнутри"},{"order":1,"name":"Снаружи","synonym":"Снаружи"},{"order":2,"name":"Любая","synonym":"Любая"}],"inserts_types":[{"order":0,"name":"Профиль","synonym":"Профиль"},{"order":1,"name":"Заполнение","synonym":"Заполнение"},{"order":2,"name":"Элемент","synonym":"Элемент"},{"order":3,"name":"Изделие","synonym":"Изделие"},{"order":4,"name":"Контур","synonym":"Контур"},{"order":5,"name":"МоскитнаяСетка","synonym":"Москитная сетка"},{"order":6,"name":"Подоконник","synonym":"Подоконник"},{"order":7,"name":"Откос","synonym":"Откос"},{"order":8,"name":"Водоотлив","synonym":"Водоотлив"},{"order":9,"name":"Монтаж","synonym":"Монтаж"},{"order":10,"name":"Доставка","synonym":"Доставка"},{"order":11,"name":"Набор","synonym":"Набор"},{"order":12,"name":"Стеклопакет","synonym":"Стеклопакет"},{"order":13,"name":"ТиповойСтеклопакет","synonym":"Типовой стеклопакет"},{"order":14,"name":"Раскладка","synonym":"Раскладка"}],"inserts_glass_types":[{"order":0,"name":"Заполнение","synonym":"Заполнение"},{"order":1,"name":"Рамка","synonym":"Рамка"},{"order":2,"name":"Газ","synonym":"Газ"}],"lay_split_types":[{"order":0,"name":"ДелениеГоризонтальных","synonym":"Деление горизонтальных"},{"order":1,"name":"ДелениеВертикальных","synonym":"Деление вертикальных"},{"order":2,"name":"КрестВСтык","synonym":"Крест в стык"},{"order":3,"name":"КрестПересечение","synonym":"Крест пересечение"}],"contact_information_types":[{"order":0,"name":"Адрес","synonym":"Адрес"},{"order":1,"name":"Телефон","synonym":"Телефон"},{"order":2,"name":"АдресЭлектроннойПочты","synonym":"Адрес электронной почты"},{"order":3,"name":"ВебСтраница","synonym":"Веб страница"},{"order":4,"name":"Факс","synonym":"Факс"},{"order":5,"name":"Другое","synonym":"Другое"},{"order":6,"name":"Skype","synonym":"Skype"}],"nom_types":[{"order":0,"name":"Товар","synonym":"Товар, материал"},{"order":1,"name":"Услуга","synonym":"Услуга"},{"order":2,"name":"Работа","synonym":"Работа, техоперация"}],"cutting_optimization_types":[{"order":0,"name":"Нет","synonym":"Нет"},{"order":1,"name":"РасчетНарезки","synonym":"Расчет нарезки"},{"order":2,"name":"НельзяВращатьПереворачивать","synonym":"Нельзя вращать переворачивать"},{"order":3,"name":"ТолькоНомераЯчеек","synonym":"Только номера ячеек"}],"open_types":[{"order":0,"name":"Глухое","synonym":"Глухое"},{"order":1,"name":"Поворотное","synonym":"Поворотное"},{"order":2,"name":"Откидное","synonym":"Откидное"},{"order":3,"name":"ПоворотноОткидное","synonym":"Поворотно-откидное"},{"order":4,"name":"Раздвижное","synonym":"Раздвижное"},{"order":5,"name":"Неподвижное","synonym":"Неподвижное"}],"sz_line_types":[{"order":0,"name":"Обычные","synonym":"Обычные"},{"order":1,"name":"Габаритные","synonym":"Только габаритные"},{"order":2,"name":"ПоСтворкам","synonym":"По створкам"},{"order":3,"name":"ОтКрая","synonym":"От края"},{"order":4,"name":"БезРазмеров","synonym":"Без размеров"}],"cnn_types":[{"order":0,"name":"УгловоеДиагональное","synonym":"Угловое диагональное"},{"order":1,"name":"УгловоеКВертикальной","synonym":"Угловое к вертикальной"},{"order":2,"name":"УгловоеКГоризонтальной","synonym":"Угловое к горизонтальной"},{"order":3,"name":"ТОбразное","synonym":"Т-образное"},{"order":4,"name":"Наложение","synonym":"Наложение"},{"order":5,"name":"НезамкнутыйКонтур","synonym":"Незамкнутый контур"},{"order":6,"name":"КрестВСтык","synonym":"Крест в стык"},{"order":7,"name":"КрестПересечение","synonym":"Крест пересечение"}],"specification_order_row_types":[{"order":0,"name":"Нет","synonym":"Нет"},{"order":1,"name":"Материал","synonym":"Материал"},{"order":2,"name":"Продукция","synonym":"Продукция"}],"elm_types":[{"order":0,"name":"Рама","synonym":"Рама"},{"order":1,"name":"Створка","synonym":"Створка"},{"order":2,"name":"Импост","synonym":"Импост"},{"order":3,"name":"Штульп","synonym":"Штульп"},{"order":4,"name":"Стекло","synonym":"Стекло - стеклопакет"},{"order":5,"name":"Заполнение","synonym":"Заполнение - сэндвич"},{"order":6,"name":"Раскладка","synonym":"Раскладка - фальшпереплет"},{"order":7,"name":"Текст","synonym":"Текст"},{"order":8,"name":"Линия","synonym":"Линия"},{"order":9,"name":"Размер","synonym":"Размер"},{"order":10,"name":"Радиус","synonym":"Радиус"},{"order":11,"name":"Добор","synonym":"Доборный проф."},{"order":12,"name":"Соединитель","synonym":"Соединит. профиль"},{"order":13,"name":"Водоотлив","synonym":"Водоотлив"},{"order":14,"name":"Москитка","synonym":"Москитн. сетка"},{"order":15,"name":"Фурнитура","synonym":"Фурнитура"},{"order":16,"name":"Макрос","synonym":"Макрос обр центра"},{"order":17,"name":"Подоконник","synonym":"Подоконник"},{"order":18,"name":"ОшибкаКритическая","synonym":"Ошибка критическая"},{"order":19,"name":"ОшибкаИнфо","synonym":"Ошибка инфо"},{"order":20,"name":"Визуализация","synonym":"Визуализация"},{"order":21,"name":"Прочее","synonym":"Прочее"},{"order":22,"name":"Продукция","synonym":"Продукция"},{"order":23,"name":"Доставка","synonym":"Доставка"},{"order":24,"name":"РаботыЦеха","synonym":"Работы цеха"},{"order":25,"name":"РаботыМонтажа","synonym":"Работы монтажа"},{"order":26,"name":"Монтаж","synonym":"Монтаж"},{"order":27,"name":"Уплотнение","synonym":"Уплотнение"},{"order":28,"name":"Арматура","synonym":"Армирование"},{"order":29,"name":"Штапик","synonym":"Штапик"},{"order":30,"name":"Порог","synonym":"Порог"},{"order":31,"name":"Подставочник","synonym":"Подставочн. профиль"}],"planning_phases":[{"order":0,"name":"plan","synonym":"План"},{"order":1,"name":"run","synonym":"Запуск"},{"order":2,"name":"ready","synonym":"Готовность"}],"individual_legal":[{"order":0,"name":"ЮрЛицо","synonym":"Юрлицо"},{"order":1,"name":"ФизЛицо","synonym":"Физлицо"}]},"ireg":{"log":{"name":"log","note":"","synonym":"Журнал событий","dimensions":{"date":{"synonym":"Дата","tooltip":"Время события","type":{"types":["number"],"digits":15,"fraction_figits":0}},"sequence":{"synonym":"Порядок","tooltip":"Порядок следования","type":{"types":["number"],"digits":6,"fraction_figits":0}}},"resources":{"class":{"synonym":"Класс","tooltip":"Класс события","type":{"types":["string"],"str_len":100}},"note":{"synonym":"Комментарий","multiline_mode":true,"tooltip":"Текст события","type":{"types":["string"],"str_len":0}},"obj":{"synonym":"Объект","multiline_mode":true,"tooltip":"Объект, к которому относится событие","type":{"types":["string"],"str_len":0}},"user":{"synonym":"Пользователь","tooltip":"Пользователь, в сеансе которого произошло событие","type":{"types":["string"],"str_len":100}}}},"log_view":{"name":"log_view","note":"","synonym":"Просмотр журнала событий","dimensions":{"key":{"synonym":"Ключ","tooltip":"Ключ события","type":{"types":["string"],"str_len":100}},"user":{"synonym":"Пользователь","tooltip":"Пользователь, отметивыший событие, как просмотренное","type":{"types":["string"],"str_len":100}}}},"currency_courses":{"name":"КурсыВалют","splitted":false,"note":"","synonym":"Курсы валют","dimensions":{"currency":{"synonym":"Валюта","multiline_mode":false,"tooltip":"Ссылка на валюты","choice_groups_elm":"elm","type":{"types":["cat.currencies"],"is_ref":true}},"period":{"synonym":"Дата курса","multiline_mode":false,"tooltip":"Дата курса валюты","mandatory":true,"type":{"types":["date"],"date_part":"date"}}},"resources":{"course":{"synonym":"Курс","multiline_mode":false,"tooltip":"Курс валюты","mandatory":true,"type":{"types":["number"],"digits":10,"fraction_figits":4}},"multiplicity":{"synonym":"Кратность","multiline_mode":false,"tooltip":"Кратность валюты","mandatory":true,"type":{"types":["number"],"digits":10,"fraction_figits":0}}},"attributes":{},"cachable":"ram","form":{"selection":{"fields":["cat_currencies.name as currency","period","course"],"cols":[{"id":"currency","width":"*","type":"ro","align":"left","sort":"server","caption":"Валюта"},{"id":"period","width":"*","type":"ro","align":"left","sort":"server","caption":"Дата курса"},{"id":"course","width":"*","type":"ron","align":"right","sort":"server","caption":"Курс"}]}}},"margin_coefficients":{"name":"пзМаржинальныеКоэффициентыИСкидки","splitted":false,"note":"","synonym":"Маржинальные коэффициенты","dimensions":{"price_group":{"synonym":"Ценовая группа","multiline_mode":false,"tooltip":"Если указано, правило распространяется только на продукцию данной ценовой группы","choice_groups_elm":"elm","type":{"types":["cat.price_groups"],"is_ref":true}},"key":{"synonym":"Ключ","multiline_mode":false,"tooltip":"Если указано, правило распространяется только на продукцию, параметры окружения которой, совпадают с параметрами ключа параметров","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"condition_formula":{"synonym":"Формула условия","multiline_mode":false,"tooltip":"В этом поле можно указать дополнительное условие на языке 1С. Например, применять строку только к аркам или непрямоугольным изделиям","choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}}},"resources":{"marginality":{"synonym":"К марж","multiline_mode":false,"tooltip":"На этот коэффициент будет умножена плановая себестоимость для получения отпускной цены. Имеет смысл, если \"тип цен прайс\" не указан и константа КМАРЖ_В_СПЕЦИФИКАЦИИ сброшена","type":{"types":["number"],"digits":10,"fraction_figits":4}},"marginality_min":{"synonym":"К марж мин.","multiline_mode":false,"tooltip":"Не позволяет установить в документе расчет скидку, при которой маржинальность строки опустится ниже указанного значения","type":{"types":["number"],"digits":10,"fraction_figits":4}},"marginality_internal":{"synonym":"К марж внутр.","multiline_mode":false,"tooltip":"Маржинальный коэффициент внутренней продажи","type":{"types":["number"],"digits":10,"fraction_figits":4}},"price_type_first_cost":{"synonym":"Тип цен плановой себестоимости","multiline_mode":false,"tooltip":"Этот тип цен будет использован для расчета плановой себестоимости продукции","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"price_type_sale":{"synonym":"Тип прайсовых цен","multiline_mode":false,"tooltip":"Этот тип цен будет использован для расчета отпускной цены продукции. Если указано, значения КМарж и КМарж.мин игнорируются","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"price_type_internal":{"synonym":"Тип цен внутренней продажи","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"В этом поле можно указать произвольный код на языке 1С для расчета (корректировки) себестоимости","choice_params":[{"name":"parent","path":["3220e251-ffcd-11e5-8303-e67fda7f6b46","3220e25b-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"sale_formula":{"synonym":"Формула продажа","multiline_mode":false,"tooltip":"В этом поле можно указать произвольный код на языке 1С для расчета (корректировки) цены продажи","choice_params":[{"name":"parent","path":["3220e251-ffcd-11e5-8303-e67fda7f6b46","3220e25b-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"internal_formula":{"synonym":"Формула внутр","multiline_mode":false,"tooltip":"В этом поле можно указать произвольный код на языке 1С для расчета цены внутренней продажи или заказа поставщику","choice_params":[{"name":"parent","path":["3220e251-ffcd-11e5-8303-e67fda7f6b46","3220e25b-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"external_formula":{"synonym":"Формула внешн.","multiline_mode":false,"tooltip":"В этом поле можно указать произвольный код на языке 1С для расчета внешней (дилерской) цены","choice_params":[{"name":"parent","path":["3220e251-ffcd-11e5-8303-e67fda7f6b46","3220e25b-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"extra_charge_external":{"synonym":"Наценка внешн.","multiline_mode":false,"tooltip":"Наценка внешней (дилерской) продажи по отношению к цене производителя, %. Перекрывается, если указан в лёгклм клиенте","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount_external":{"synonym":"Скидка внешн.","multiline_mode":false,"tooltip":"Скидка по умолчанию для внешней (дилерской) продажи по отношению к дилерской цене, %. Перекрывается, если указан в лёгклм клиенте","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount":{"synonym":"Скидка","multiline_mode":false,"tooltip":"Скидка по умолчанию, %","type":{"types":["number"],"digits":5,"fraction_figits":2}}},"attributes":{"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":200}}},"cachable":"doc_ram","form":{"selection":{"fields":["cat_price_groups.name as price_group","cat_parameters_keys.name as key","cat_formulas.name as condition_formula"],"cols":[{"id":"price_group","width":"*","type":"ro","align":"left","sort":"server","caption":"Ценовая группа"},{"id":"key","width":"*","type":"ro","align":"left","sort":"server","caption":"Ключ параметров"},{"id":"condition_formula","width":"*","type":"ro","align":"left","sort":"server","caption":"Формула условия"}]}}}},"cat":{"meta_objs":{"fields":{}},"meta_fields":{"fields":{}},"scheme_settings":{"name":"scheme_settings","synonym":"Настройки отчетов и списков","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"obj":{"synonym":"Объект","tooltip":"Имя класса метаданных","type":{"types":["string"],"str_len":250}},"user":{"synonym":"Пользователь","tooltip":"Если пусто - публичная настройка","type":{"types":["string"],"str_len":50}},"order":{"synonym":"Порядок","tooltip":"Порядок варианта","type":{"types":["number"],"digits":6,"fraction_figits":0}},"query":{"synonym":"Запрос","tooltip":"Индекс CouchDB или текст SQL","type":{"types":["string"],"str_len":0}},"date_from":{"synonym":"Начало периода","tooltip":"","type":{"types":["date"],"date_part":"date"}},"date_till":{"synonym":"Конец периода","tooltip":"","type":{"types":["date"],"date_part":"date"}},"standard_period":{"synonym":"Стандартный период","tooltip":"Использование стандартного периода","type":{"types":["enm.standard_period"],"is_ref":true}},"formula":{"synonym":"Формула","tooltip":"Формула инициализации","type":{"types":["cat.formulas"],"is_ref":true}},"output":{"synonym":"Вывод","tooltip":"Вывод результата","type":{"types":["enm.report_output"],"is_ref":true}},"tag":{"synonym":"Дополнительные свойства","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"fields":{"name":"fields","synonym":"Доступные поля","tooltip":"Состав, порядок и ширина колонок","fields":{"parent":{"synonym":"Родитель","tooltip":"Для плоского списка, родитель пустой","type":{"types":["string"],"str_len":100}},"use":{"synonym":"Использование","tooltip":"","type":{"types":["boolean"]}},"field":{"synonym":"Поле","tooltip":"","type":{"types":["string"],"str_len":100}},"width":{"synonym":"Ширина","tooltip":"","type":{"types":["string"],"str_len":6}},"caption":{"synonym":"Заголовок","tooltip":"","type":{"types":["string"],"str_len":100}},"tooltip":{"synonym":"Подсказка","tooltip":"","type":{"types":["string"],"str_len":100}},"ctrl_type":{"synonym":"Тип","tooltip":"Тип элемента управления","type":{"types":["enm.data_field_kinds"],"is_ref":true}},"formatter":{"synonym":"Формат","tooltip":"Функция форматирования","type":{"types":["cat.formulas"],"is_ref":true}},"editor":{"synonym":"Редактор","tooltip":"Компонент редактирования","type":{"types":["cat.formulas"],"is_ref":true}}}},"sorting":{"name":"sorting","synonym":"Поля сортировки","tooltip":"","fields":{"parent":{"synonym":"Родитель","tooltip":"","type":{"types":["string"],"str_len":100}},"use":{"synonym":"Использование","tooltip":"","type":{"types":["boolean"]}},"field":{"synonym":"Поле","tooltip":"","type":{"types":["string"],"str_len":100}},"direction":{"synonym":"Направление","tooltip":"","type":{"types":["enm.sort_directions"],"is_ref":true}}}},"dimensions":{"name":"dimensions","synonym":"Поля группировки","tooltip":"","fields":{"parent":{"synonym":"Родитель","tooltip":"","type":{"types":["string"],"str_len":100}},"use":{"synonym":"Использование","tooltip":"","type":{"types":["boolean"]}},"field":{"synonym":"Поле","tooltip":"","type":{"types":["string"],"str_len":100}}}},"resources":{"name":"resources","synonym":"Ресурсы","tooltip":"","fields":{"parent":{"synonym":"Родитель","tooltip":"","type":{"types":["string"],"str_len":100}},"use":{"synonym":"Использование","tooltip":"","type":{"types":["boolean"]}},"field":{"synonym":"Поле","tooltip":"","type":{"types":["string"],"str_len":100}},"formula":{"synonym":"Формула","tooltip":"По умолчанию - сумма","type":{"types":["cat.formulas"],"is_ref":true}}}},"selection":{"name":"selection","synonym":"Отбор","tooltip":"","fields":{"parent":{"synonym":"Родитель","tooltip":"","type":{"types":["string"],"str_len":100}},"use":{"synonym":"Использование","tooltip":"","type":{"types":["boolean"]}},"left_value":{"synonym":"Левое значение","tooltip":"Путь к данным","type":{"types":["string"],"str_len":255}},"left_value_type":{"synonym":"Тип слева","tooltip":"Тип значения слева","default":"path","type":{"types":["string"],"str_len":100}},"comparison_type":{"synonym":"Вид сравнения","tooltip":"","type":{"types":["enm.comparison_types"],"is_ref":true}},"right_value":{"synonym":"Правое значение","tooltip":"","type":{"types":["string"],"str_len":100}},"right_value_type":{"synonym":"Тип справа","tooltip":"Тип значения справа","default":"path","type":{"types":["string"],"str_len":100}}}},"params":{"name":"params","synonym":"Параметры","tooltip":"","fields":{"param":{"synonym":"Параметр","tooltip":"","type":{"types":["string"],"str_len":100}},"value_type":{"synonym":"Тип","tooltip":"Тип значения","type":{"types":["string"],"str_len":100}},"value":{"synonym":"Значение","tooltip":"Может иметь примитивный или ссылочный тип или массив","type":{"types":["string","number"],"str_len":0,"digits":15,"fraction_figits":3,"date_part":"date"}},"quick_access":{"synonym":"Быстрый доступ","tooltip":"Размещать на нанели инструментов","type":{"types":["boolean"]}}}},"composition":{"name":"composition","synonym":"Структура","tooltip":"","fields":{"parent":{"synonym":"Родитель","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":10}},"use":{"synonym":"Использование","tooltip":"","type":{"types":["boolean"]}},"field":{"synonym":"Элемент","tooltip":"Элемент структуры отчета","type":{"types":["string"],"str_len":50}},"kind":{"synonym":"Вид раздела отчета","tooltip":"список, таблица, группировка строк, группировка колонок","type":{"types":["string"],"str_len":50}},"definition":{"synonym":"Описание","tooltip":"Описание раздела структуры","type":{"types":["string"],"str_len":50}}}},"conditional_appearance":{"name":"conditional_appearance","synonym":"Условное оформление","tooltip":"","fields":{}}},"cachable":"doc"},"params_links":{"name":"СвязиПараметров","splitted":false,"synonym":"Связи параметров","illustration":"Подчиненные параметры","obj_presentation":"Связь параметров","list_presentation":"Связи параметров","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"master":{"synonym":"Ведущий","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"slave":{"synonym":"Ведомый","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"hide":{"synonym":"Скрыть ведомый","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"use_master":{"synonym":"Использование ведущих","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"captured":{"synonym":"Захвачен","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"editor":{"synonym":"Редактор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"zone":{"synonym":"Область","multiline_mode":false,"tooltip":"Разделитель (префикс) данных","type":{"types":["number"],"digits":6,"fraction_figits":0}},"zones":{"synonym":"Абоненты-получатели","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.params_links"],"is_ref":true}}},"tabular_sections":{"leadings":{"name":"Ведущие","synonym":"Ведущие","tooltip":"","fields":{"key":{"synonym":"Ключ","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}}}},"values":{"name":"Значения","synonym":"Значения","tooltip":"","fields":{"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["slave"]}],"choice_groups_elm":"elm","choice_type":{"path":["slave"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"forcibly":{"synonym":"Принудительно","multiline_mode":false,"tooltip":"Замещать установленное ранее значение при перевыборе ведущего параметра","type":{"types":["boolean"]}}}}},"cachable":"ram"},"clrs":{"name":"пзЦвета","splitted":false,"synonym":"Цвета","illustration":"","obj_presentation":"Цвет","list_presentation":"Цвета","input_by_string":["name","id","ral"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"ral":{"synonym":"Цвет RAL","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"machine_tools_clr":{"synonym":"Код для станка","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"clr_str":{"synonym":"Цвет в построителе","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":36}},"clr_out":{"synonym":"Цвет снаружи","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"clr_in":{"synonym":"Цвет изнутри","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.clrs"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"countries":{"name":"СтраныМира","splitted":false,"synonym":"Страны мира","illustration":"","obj_presentation":"Страна мира","list_presentation":"","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":3,"fields":{"name_full":{"synonym":"Наименование полное","multiline_mode":false,"tooltip":"Полное наименование страны мира","type":{"types":["string"],"str_len":100}},"alpha2":{"synonym":"Код альфа-2","multiline_mode":false,"tooltip":"Двузначный буквенный код альфа-2 страны по ОКСМ","type":{"types":["string"],"str_len":2}},"alpha3":{"synonym":"Код альфа-3","multiline_mode":false,"tooltip":"Трехзначный буквенный код альфа-3 страны по ОКСМ","type":{"types":["string"],"str_len":3}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram"},"partner_bank_accounts":{"name":"БанковскиеСчетаКонтрагентов","splitted":false,"synonym":"Банковские счета","illustration":"Банковские счета сторонних контрагентов и физических лиц.","obj_presentation":"Банковский счет","list_presentation":"Банковские счета","input_by_string":["name","account_number"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"account_number":{"synonym":"Номер счета","multiline_mode":false,"tooltip":"Номер расчетного счета организации","mandatory":true,"type":{"types":["string"],"str_len":20}},"bank":{"synonym":"Банк","multiline_mode":false,"tooltip":"Банк, в котором открыт расчетный счет организации","choice_groups_elm":"elm","type":{"types":["cat.banks_qualifier"],"is_ref":true}},"settlements_bank":{"synonym":"Банк для расчетов","multiline_mode":false,"tooltip":"Банк, в случае непрямых расчетов","choice_groups_elm":"elm","type":{"types":["cat.banks_qualifier"],"is_ref":true}},"correspondent_text":{"synonym":"Текст корреспондента","multiline_mode":false,"tooltip":"Текст \"Плательщик\\Получатель\" в платежных документах","type":{"types":["string"],"str_len":250}},"appointments_text":{"synonym":"Текст назначения","multiline_mode":false,"tooltip":"Текст назначения платежа","type":{"types":["string"],"str_len":250}},"funds_currency":{"synonym":"Валюта","multiline_mode":false,"tooltip":"Валюта учета денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"bank_bic":{"synonym":"БИКБанка","multiline_mode":false,"tooltip":"БИК банка, в котором открыт счет","type":{"types":["string"],"str_len":9}},"bank_name":{"synonym":"Наименование банка","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":100}},"bank_correspondent_account":{"synonym":"Корр. счет банк","multiline_mode":false,"tooltip":"Корр.счет банка","type":{"types":["string"],"str_len":20}},"bank_city":{"synonym":"Город банка","multiline_mode":false,"tooltip":"Город банка","type":{"types":["string"],"str_len":50}},"bank_address":{"synonym":"Адрес банка","multiline_mode":false,"tooltip":"Адрес банка","type":{"types":["string"],"str_len":0}},"bank_phone_numbers":{"synonym":"Телефоны банка","multiline_mode":false,"tooltip":"Телефоны банка","type":{"types":["string"],"str_len":0}},"settlements_bank_bic":{"synonym":"БИК банка для расчетов","multiline_mode":false,"tooltip":"БИК банка, в случае непрямых расчетов","type":{"types":["string"],"str_len":9}},"settlements_bank_correspondent_account":{"synonym":"Корр. счет банка для расчетов","multiline_mode":false,"tooltip":"Корр.счет банка, в случае непрямых расчетов","type":{"types":["string"],"str_len":20}},"settlements_bank_city":{"synonym":"Город банка для расчетов","multiline_mode":false,"tooltip":"Город банка, в случае непрямых расчетов","type":{"types":["string"],"str_len":50}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"Контрагент или физическое лицо, являющиеся владельцем банковского счета","choice_params":[{"name":"is_folder","path":false}],"mandatory":true,"type":{"types":["cat.individuals","cat.partners"],"is_ref":true}}},"tabular_sections":{},"cachable":"doc_ram","form":{"obj":{"head":{" ":["name","owner","account_number","funds_currency","bank_bic","bank","settlements_bank_bic","settlements_bank"]}}}},"organization_bank_accounts":{"name":"БанковскиеСчетаОрганизаций","splitted":false,"synonym":"Банковские счета организаций","illustration":"Банковские счета собственных организаций. ","obj_presentation":"Банковский счет организации","list_presentation":"Банковские счета","input_by_string":["name","account_number"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"bank":{"synonym":"Банк","multiline_mode":false,"tooltip":"Банк, в котором открыт расчетный счет организации","choice_groups_elm":"elm","type":{"types":["cat.banks_qualifier"],"is_ref":true}},"bank_bic":{"synonym":"БИКБанка","multiline_mode":false,"tooltip":"БИК банка, в котором открыт счет","type":{"types":["string"],"str_len":9}},"funds_currency":{"synonym":"Валюта денежных средств","multiline_mode":false,"tooltip":"Валюта учета денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"account_number":{"synonym":"Номер счета","multiline_mode":false,"tooltip":"Номер расчетного счета организации","mandatory":true,"type":{"types":["string"],"str_len":20}},"settlements_bank":{"synonym":"Банк для расчетов","multiline_mode":false,"tooltip":"Банк, в случае непрямых расчетов","choice_groups_elm":"elm","type":{"types":["cat.banks_qualifier"],"is_ref":true}},"settlements_bank_bic":{"synonym":"БИК банка для расчетов","multiline_mode":false,"tooltip":"БИК банка, в случае непрямых расчетов","type":{"types":["string"],"str_len":9}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"Подразделение, отвечающее за банковский счет","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Организация","multiline_mode":false,"tooltip":"Организация, являющиеся владельцем банковского счета","choice_params":[{"name":"is_folder","path":false}],"mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","form":{"obj":{"head":{" ":["name","owner","account_number","funds_currency","bank_bic","bank","settlements_bank_bic","settlements_bank"]}}}},"property_values_hierarchy":{"name":"ЗначенияСвойствОбъектовИерархия","splitted":false,"synonym":"Дополнительные значения (иерархия)","illustration":"","obj_presentation":"Дополнительное значение (иерархия)","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":true,"group_hierarchy":false,"main_presentation_name":true,"code_length":0,"fields":{"heft":{"synonym":"Весовой коэффициент","multiline_mode":false,"tooltip":"Относительный вес дополнительного значения (значимость).","type":{"types":["number"],"digits":10,"fraction_figits":2}},"ПолноеНаименование":{"synonym":"Полное наименование","multiline_mode":true,"tooltip":"Подробное описание значения дополнительного реквизита","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит или сведение.","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"parent":{"synonym":"Входит в группу","multiline_mode":false,"tooltip":"Вышестоящее дополнительное значение свойства.","choice_links":[{"name":["selection","owner"],"path":["owner"]}],"type":{"types":["cat.property_values_hierarchy"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"banks_qualifier":{"name":"КлассификаторБанковРФ","splitted":false,"synonym":"Классификатор банков РФ","illustration":"","obj_presentation":"Банк","list_presentation":"Банки","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"correspondent_account":{"synonym":"Корр. счет","multiline_mode":false,"tooltip":"Корреспондентский счет банка","type":{"types":["string"],"str_len":20}},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город банка","type":{"types":["string"],"str_len":50}},"address":{"synonym":"Адрес","multiline_mode":false,"tooltip":"Адрес банка","type":{"types":["string"],"str_len":500}},"phone_numbers":{"synonym":"Телефоны","multiline_mode":false,"tooltip":"Телефоны банка","type":{"types":["string"],"str_len":250}},"activity_ceased":{"synonym":"Деятельность прекращена","multiline_mode":false,"tooltip":"Банк по каким-либо причинам прекратил свою деятельность","type":{"types":["boolean"]}},"swift":{"synonym":"СВИФТ БИК","multiline_mode":false,"tooltip":"Международный банковский идентификационный код (SWIFT BIC)","type":{"types":["string"],"str_len":11}},"inn":{"synonym":"ИНН","multiline_mode":false,"tooltip":"Идентификационный номер налогоплательщика","type":{"types":["string"],"str_len":12}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа банков","multiline_mode":false,"tooltip":"Группа банков, в которую входит данный банк","type":{"types":["cat.banks_qualifier"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"destinations":{"name":"НаборыДополнительныхРеквизитовИСведений","splitted":false,"synonym":"Наборы дополнительных реквизитов и сведений","illustration":"","obj_presentation":"Набор дополнительных реквизитов и сведений","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"КоличествоРеквизитов":{"synonym":"Количество реквизитов","multiline_mode":false,"tooltip":"Количество реквизитов в наборе не помеченных на удаление.","type":{"types":["string"],"str_len":5}},"КоличествоСведений":{"synonym":"Количество сведений","multiline_mode":false,"tooltip":"Количество сведений в наборе не помеченных на удаление.","type":{"types":["string"],"str_len":5}},"Используется":{"synonym":"Используется","multiline_mode":false,"tooltip":"Набор свойств отображается в форме списка","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Входит в группу","multiline_mode":false,"tooltip":"Группа, к которой относится набор.","type":{"types":["cat.destinations"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Дополнительный реквизит","multiline_mode":false,"tooltip":"Дополнительный реквизит этого набора","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"_deleted":{"synonym":"Пометка удаления","multiline_mode":false,"tooltip":"Устанавливается при исключении дополнительного реквизита из набора,\nчтобы можно было вернуть связь с уникальным дополнительным реквизитом.","type":{"types":["boolean"]}}}},"extra_properties":{"name":"ДополнительныеСведения","synonym":"Дополнительные сведения","tooltip":"","fields":{"property":{"synonym":"Дополнительное сведение","multiline_mode":false,"tooltip":"Дополнительное сведение этого набора","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"_deleted":{"synonym":"Пометка удаления","multiline_mode":false,"tooltip":"Устанавливается при исключении дополнительного сведения из набора,\nчтобы можно было вернуть связь с уникальным дополнительным сведением.","type":{"types":["boolean"]}}}}},"cachable":"ram"},"formulas":{"name":"Формулы","splitted":false,"synonym":"Формулы","illustration":"Формулы пользователя, для выполнения при расчете спецификаций в справочниках Вставки, Соединения, Фурнитура и регистре Корректировки спецификации","obj_presentation":"Формула","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"Текст функции на языке javascript","type":{"types":["string"],"str_len":0}},"leading_formula":{"synonym":"Ведущая формула","multiline_mode":false,"tooltip":"Если указано, выполняется код ведущей формулы с параметрами, заданными для текущей формулы","choice_params":[{"name":"leading_formula","path":"00000000-0000-0000-0000-000000000000"}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"condition_formula":{"synonym":"Это формула условия","multiline_mode":false,"tooltip":"Формула используется, как фильтр, а не как алгоритм расчета количества.\nЕсли возвращает не Истина, строка в спецификацию не добавляется","type":{"types":["boolean"]}},"definition":{"synonym":"Описание","multiline_mode":true,"tooltip":"Описание в формате html","type":{"types":["string"],"str_len":0}},"template":{"synonym":"Шаблон","multiline_mode":true,"tooltip":"html шаблон отчета","type":{"types":["string"],"str_len":0}},"sorting_field":{"synonym":"Порядок","multiline_mode":false,"tooltip":"Используется для упорядочивания (служебный)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"async":{"synonym":"Асинхронный режим","multiline_mode":false,"tooltip":"Создавать асинхронную функцию","type":{"types":["boolean"]}},"disabled":{"synonym":"Отключена","multiline_mode":false,"tooltip":"Имеет смысл только для печатных форм и модификаторов","type":{"types":["boolean"]}},"zone":{"synonym":"Область","multiline_mode":false,"tooltip":"Разделитель (префикс) данных","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"Группа формул","type":{"types":["cat.formulas"],"is_ref":true}}},"tabular_sections":{"params":{"name":"Параметры","synonym":"Параметры","tooltip":"","fields":{"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["param"],"path":["params","param"]}],"choice_type":{"path":["params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}}}}},"cachable":"ram"},"elm_visualization":{"name":"пзВизуализацияЭлементов","splitted":false,"synonym":"Визуализация элементов","illustration":"Строки svg для рисования петель, ручек и графических примитивов","obj_presentation":"Визуализация элемента","list_presentation":"Визуализация элементов","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"svg_path":{"synonym":"Путь svg или текст","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"note":{"synonym":"Комментарий","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"attributes":{"synonym":"Атрибуты","multiline_mode":false,"tooltip":"Дополнительные атрибуты svg path","type":{"types":["string"],"str_len":0}},"rotate":{"synonym":"Поворачивать","multiline_mode":false,"tooltip":"правила поворота эскиза параллельно касательной профиля в точке визуализации\n0 - поворачивать\n1 - ручка","type":{"types":["number"],"digits":1,"fraction_figits":0}},"offset":{"synonym":"Смещение","multiline_mode":false,"tooltip":"Смещение в мм относительно внещнего ребра элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"side":{"synonym":"Сторона соедин.","multiline_mode":false,"tooltip":"имеет смысл только для импостов","choice_groups_elm":"elm","type":{"types":["enm.cnn_sides"],"is_ref":true}},"elm_side":{"synonym":"Сторона элем.","multiline_mode":false,"tooltip":"(0) - изнутри, (1) - снаружи, (-1) - в середине элемента","type":{"types":["number"],"digits":1,"fraction_figits":0}},"cx":{"synonym":"cx","multiline_mode":false,"tooltip":"Координата точки привязки","type":{"types":["number"],"digits":6,"fraction_figits":0}},"cy":{"synonym":"cy","multiline_mode":false,"tooltip":"Координата точки привязки","type":{"types":["number"],"digits":6,"fraction_figits":0}},"angle_hor":{"synonym":"Угол к горизонту","multiline_mode":false,"tooltip":"Угол к к горизонту элемента по умолчанию","type":{"types":["number"],"digits":6,"fraction_figits":0}},"priority":{"synonym":"Приоритет","multiline_mode":false,"tooltip":"Группа визуализаций","type":{"types":["number"],"digits":6,"fraction_figits":0}},"mode":{"synonym":"Режим","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"captured":{"synonym":"Захвачен","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"editor":{"synonym":"Редактор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"zones":{"synonym":"Абоненты-получатели","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram"},"branches":{"name":"ИнтеграцияОтделыАбонентов","splitted":false,"synonym":"Отделы абонентов","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["name","suffix"],"hierarchical":true,"has_owners":true,"group_hierarchy":false,"main_presentation_name":true,"code_length":0,"fields":{"suffix":{"synonym":"Суффикс CouchDB","multiline_mode":false,"tooltip":"Для разделения данных в CouchDB","mandatory":true,"type":{"types":["string"],"str_len":4}},"direct":{"synonym":"Direct","multiline_mode":false,"tooltip":"Для пользователя запрещен режим offline","type":{"types":["boolean"]}},"use":{"synonym":"Используется","multiline_mode":false,"tooltip":"Использовать данный отдел при создании баз и пользователей","type":{"types":["boolean"]}},"mode":{"synonym":"Режим","multiline_mode":false,"tooltip":"Режим репликации текущего отдела","type":{"types":["number"],"digits":1,"fraction_figits":0}},"parent":{"synonym":"Ведущий отдел","multiline_mode":false,"tooltip":"Заполняется в случае иерархической репликации","choice_links":[{"name":["selection","owner"],"path":["owner"]}],"type":{"types":["cat.branches"],"is_ref":true}}},"tabular_sections":{"organizations":{"name":"Организации","synonym":"Организации","tooltip":"Организации, у которых дилер может заказывать продукцию и услуги","fields":{"acl_obj":{"synonym":"Объект доступа","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}},"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"partners":{"name":"Контрагенты","synonym":"Контрагенты","tooltip":"Юридические лица дилера, от имени которых он оформляет заказы","fields":{"acl_obj":{"synonym":"Объект доступа","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["cat.partners"],"is_ref":true}},"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"divisions":{"name":"Подразделения","synonym":"Подразделения","tooltip":"Подразделения, к данным которых, дилеру предоставлен доступ","fields":{"acl_obj":{"synonym":"Объект доступа","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"price_types":{"name":"ТипыЦен","synonym":"Типы цен","tooltip":"Типы цен, привязанные к дилеру","fields":{"acl_obj":{"synonym":"Объект доступа","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["cat.nom_prices_types"],"is_ref":true}}}},"keys":{"name":"Ключи","synonym":"Ключи","tooltip":"Ключи параметров, привязанные к дилеру","fields":{"acl_obj":{"synonym":"Объект доступа","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["cat.parameters_keys"],"is_ref":true}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Дополнительные реквизиты объекта","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc"},"furns":{"name":"пзФурнитура","splitted":false,"synonym":"Фурнитура","illustration":"Описывает ограничения и правила формирования спецификаций фурнитуры","obj_presentation":"Фурнитура","list_presentation":"Фурнитура","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"flap_weight_max":{"synonym":"Масса створки макс","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"left_right":{"synonym":"Левая правая","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_set":{"synonym":"Это набор","multiline_mode":false,"tooltip":"Определяет, является элемент набором для построения спецификации или комплектом фурнитуры для выбора в построителе","type":{"types":["boolean"]}},"is_sliding":{"synonym":"Это раздвижка","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"furn_set":{"synonym":"Набор фурнитуры","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_set","path":true}],"choice_groups_elm":"elm","type":{"types":["cat.furns"],"is_ref":true}},"side_count":{"synonym":"Количество сторон","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"handle_side":{"synonym":"Ручка на стороне","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"open_type":{"synonym":"Тип открывания","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.open_types"],"is_ref":true}},"name_short":{"synonym":"Наименование сокращенное","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":3}},"captured":{"synonym":"Захвачен","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"editor":{"synonym":"Редактор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"zones":{"synonym":"Абоненты-получатели","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"","type":{"types":["cat.furns"],"is_ref":true}}},"tabular_sections":{"open_tunes":{"name":"НастройкиОткрывания","synonym":"Настройки открывания","tooltip":"","fields":{"side":{"synonym":"Сторона","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"lmin":{"synonym":"X min (длина или ширина)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"X max (длина или ширина)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"amin":{"synonym":"α мин","multiline_mode":false,"tooltip":"Минимальный угол к соседнему элементу","type":{"types":["number"],"digits":3,"fraction_figits":0}},"amax":{"synonym":"α макс","multiline_mode":false,"tooltip":"Максимальный угол к соседнему элементу","type":{"types":["number"],"digits":3,"fraction_figits":0}},"arc_available":{"synonym":"Дуга","multiline_mode":false,"tooltip":"Разрешено искривление элемента","type":{"types":["boolean"]}},"shtulp_available":{"synonym":"Штульп безимп соед","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"shtulp_fix_here":{"synonym":"Крепится штульп","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"rotation_axis":{"synonym":"Ось поворота","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"partial_opening":{"synonym":"Неполн. откр.","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"outline":{"synonym":"Эскиз","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}}}},"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"dop":{"synonym":"№ доп","multiline_mode":false,"tooltip":"Элемент дополнительной спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура/Набор","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_set","path":true}],"choice_groups_elm":"elm","type":{"types":["cat.inserts","cat.nom","cat.furns"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"nom_characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["nom"],"path":["specification","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":8}},"handle_height_base":{"synonym":"Выс. ручк.","multiline_mode":false,"tooltip":"Высота ручки по умолчению.\n>0: фиксированная высота\n=0: Высоту задаёт оператор\n<0: Ручка по центру","type":{"types":["number"],"digits":6,"fraction_figits":0}},"fix_ruch":{"synonym":"Высота ручки фиксирована","multiline_mode":false,"tooltip":"Запрещено изменять высоту ручки","type":{"types":["boolean"]}},"handle_height_min":{"synonym":"Выс. ручк. min","multiline_mode":false,"tooltip":"Строка будет добавлена только в том случае, если ручка выше этого значеия","type":{"types":["number"],"digits":6,"fraction_figits":0}},"handle_height_max":{"synonym":"Выс. ручк. max","multiline_mode":false,"tooltip":"Строка будет добавлена только в том случае, если ручка ниже этого значеия","type":{"types":["number"],"digits":6,"fraction_figits":0}},"contraction":{"synonym":"Укорочение","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"contraction_option":{"synonym":"Укороч. от","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.contraction_options"],"is_ref":true}},"coefficient":{"synonym":"Коэффициент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":8}},"flap_weight_min":{"synonym":"Масса створки min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"flap_weight_max":{"synonym":"Масса створки max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"side":{"synonym":"Сторона","multiline_mode":false,"tooltip":"Сторона фурнитуры, на которую устанавливается элемент или выполняется операция","type":{"types":["number"],"digits":1,"fraction_figits":0}},"cnn_side":{"synonym":"Сторона соед.","multiline_mode":false,"tooltip":"Фильтр: выполнять операцию, если примыкающий элемент примыкает с заданной стороны","choice_groups_elm":"elm","type":{"types":["enm.cnn_sides"],"is_ref":true}},"offset_option":{"synonym":"Смещ. от","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.offset_options"],"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","choice_params":[{"name":"parent","path":["3220e25a-ffcd-11e5-8303-e67fda7f6b46","3220e251-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"transfer_option":{"synonym":"Перенос опер.","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.transfer_operations_options"],"is_ref":true}},"overmeasure":{"synonym":"Припуск","multiline_mode":false,"tooltip":"Учитывать припуск длины элемента (например, на сварку)","type":{"types":["boolean"]}},"is_main_specification_row":{"synonym":"Это строка основной спецификации","multiline_mode":false,"tooltip":"Интерфейсное поле (доп=0) для редактирования без кода","type":{"types":["boolean"]}},"is_set_row":{"synonym":"Это строка набора","multiline_mode":false,"tooltip":"Интерфейсное поле (Номенклатура=Фурнитура) для редактирования без кода","type":{"types":["number"],"digits":1,"fraction_figits":0}},"is_procedure_row":{"synonym":"Это строка операции","multiline_mode":false,"tooltip":"Интерфейсное поле (Номенклатура=Номенклатура И ТипНоменклатуры = Техоперация) для редактирования без кода","type":{"types":["number"],"digits":1,"fraction_figits":0}},"is_order_row":{"synonym":"Это строка заказа","multiline_mode":false,"tooltip":"Если \"Истина\", строка будет добавлена в заказ, а не в спецификацию текущей продукции","type":{"types":["boolean"]}}}},"selection_params":{"name":"ПараметрыОтбора","synonym":"Параметры отбора","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"dop":{"synonym":"Доп","multiline_mode":false,"tooltip":"Элемент дополнительной спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"comparison_type":{"synonym":"Вид сравнения","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["gt","gte","lt","lte","eq","ne","in","nin","inh","ninh"]}],"choice_groups_elm":"elm","type":{"types":["enm.comparison_types"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["comparison_type"],"path":["selection_params","comparison_type"]},{"name":["selection","owner"],"path":["selection_params","param"]},{"name":["txt_row"],"path":["selection_params","txt_row"]}],"choice_type":{"path":["selection_params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового реквизита либо сериализация списочного значения","type":{"types":["string"],"str_len":0}}}},"specification_restrictions":{"name":"ОграниченияСпецификации","synonym":"Ограничения спецификации","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"dop":{"synonym":"Доп","multiline_mode":false,"tooltip":"Элемент дополнительной спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"side":{"synonym":"Сторона","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"lmin":{"synonym":"X min (длина или ширина)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"X max (длина или ширина)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"amin":{"synonym":"α мин","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"amax":{"synonym":"α макс","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"for_direct_profile_only":{"synonym":"Для прямых","multiline_mode":false,"tooltip":"Использовать только для прямых профилей (1), только для кривых (-1) или всегда(0)","type":{"types":["number"],"digits":1,"fraction_figits":0}}}},"colors":{"name":"Цвета","synonym":"Цвета","tooltip":"Цаета, доступные для данной фурнитуры","fields":{"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","type":{"types":["cat.clrs"],"is_ref":true}}}}},"cachable":"ram","form":{"selection":{"fields":[],"cols":[{"id":"id","width":"140","type":"ro","align":"left","sort":"server","caption":"Код"},{"id":"open_type","width":"150","type":"ro","align":"left","sort":"server","caption":"Тип открывания"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"}]},"obj":{"head":{" ":["id","name","name_short","parent","open_type","is_set","furn_set"],"Дополнительно":["side_count","left_right","handle_side","is_sliding"]},"tabular_sections":{"open_tunes":{"fields":["side","lmin","lmax","amin","amax","rotation_axis","partial_opening","arc_available","shtulp_available","shtulp_fix_here"],"headers":"Сторона,L min,L max,Угол min,Угол max,Ось поворота,Неполн. откр.,Дуга,Разрешен штульп,Крепится штульп","widths":"*,*,*,*,*,100,100,100,100,100","min_widths":"100,100,100,100,100,100,100,100,100,100","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na","types":"calck,calck,calck,calck,calck,ch,ch,ch,ch,ch"},"specification":{"fields":["elm","dop","nom","clr","quantity","coefficient","side","cnn_side","offset_option","formula","transfer_option"],"headers":"Элемент,Доп,Материал,Цвет,Колич.,Коэфф.,Сторона,Строна соед.,Смещ. от,Формула,Перенос опер.","widths":"80,80,*,140,100,100,100,140,140,140,140","min_widths":"80,80,200,140,100,100,100,140,140,140,140","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na,na","types":"ron,ron,ref,ref,calck,calck,calck,ref,ref,ref,ref"}},"tabular_sections_order":["open_tunes","specification"]}}},"currencies":{"name":"Валюты","splitted":false,"synonym":"Валюты","illustration":"Валюты, используемые при расчетах","obj_presentation":"Валюта","list_presentation":"","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":3,"fields":{"name_full":{"synonym":"Наименование валюты","multiline_mode":false,"tooltip":"Полное наименование валюты","mandatory":true,"type":{"types":["string"],"str_len":50}},"extra_charge":{"synonym":"Наценка","multiline_mode":false,"tooltip":"Коэффициент, который применяется к курсу основной валюты для вычисления курса текущей валюты.","type":{"types":["number"],"digits":10,"fraction_figits":2}},"main_currency":{"synonym":"Основная валюта","multiline_mode":false,"tooltip":"Валюта, на основании курса которой рассчитывается курс текущей валюты","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"parameters_russian_recipe":{"synonym":"Параметры прописи на русском","multiline_mode":false,"tooltip":"Параметры прописи валюты на русском языке","type":{"types":["string"],"str_len":200}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram","form":{"selection":{"fields":["ref","_deleted","id","name as presentation","name_full"],"cols":[{"id":"id","width":"120","type":"ro","align":"left","sort":"server","caption":"Код"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Обозначение"},{"id":"name_full","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"}]},"obj":{"head":{" ":["id","name","name_full","parameters_russian_recipe"],"Дополнительно":["main_currency","extra_charge"]},"tabular_sections":{},"tabular_sections_order":[]}}},"contact_information_kinds":{"name":"ВидыКонтактнойИнформации","splitted":false,"synonym":"Виды контактной информации","illustration":"","obj_presentation":"Вид контактной информации","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"mandatory_fields":{"synonym":"Обязательное заполнение","multiline_mode":false,"tooltip":"Вид контактной информации обязателен к заполнению","type":{"types":["boolean"]}},"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (адрес, телефон и т.д.)","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.contact_information_types"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"Группа вида контактной информации","type":{"types":["cat.contact_information_kinds"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"nom_kinds":{"name":"ВидыНоменклатуры","splitted":false,"synonym":"Виды номенклатуры","illustration":"","obj_presentation":"Вид номенклатуры","list_presentation":"","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"nom_type":{"synonym":"Тип номенклатуры","multiline_mode":false,"tooltip":"Указывается тип, к которому относится номенклатура данного вида.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.nom_types"],"is_ref":true}},"dnom":{"synonym":"Набор свойств номенклатура","multiline_mode":false,"tooltip":"Набор свойств, которым будет обладать номенклатура с этим видом","choice_groups_elm":"elm","type":{"types":["cat.destinations"],"is_ref":true}},"dcharacteristic":{"synonym":"Набор свойств характеристика","multiline_mode":false,"tooltip":"Набор свойств, которым будет обладать характеристика с этим видом","choice_groups_elm":"elm","type":{"types":["cat.destinations"],"is_ref":true}},"captured":{"synonym":"Захвачен","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"zones":{"synonym":"Абоненты-получатели","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"","type":{"types":["cat.nom_kinds"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"contracts":{"name":"ДоговорыКонтрагентов","splitted":false,"synonym":"Договоры контрагентов","illustration":"Перечень договоров, заключенных с контрагентами","obj_presentation":"Договор контрагента","list_presentation":"Договоры контрагентов","input_by_string":["name","id"],"hierarchical":true,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"settlements_currency":{"synonym":"Валюта взаиморасчетов","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"mutual_settlements":{"synonym":"Ведение взаиморасчетов","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.mutual_contract_settlements"],"is_ref":true}},"contract_kind":{"synonym":"Вид договора","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.contract_kinds"],"is_ref":true}},"date":{"synonym":"Дата","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"check_days_without_pay":{"synonym":"Держать резерв без оплаты ограниченное время","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"allowable_debts_amount":{"synonym":"Допустимая сумма дебиторской задолженности","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"allowable_debts_days":{"synonym":"Допустимое число дней дебиторской задолженности","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":0}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"check_debts_amount":{"synonym":"Контролировать сумму дебиторской задолженности","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"check_debts_days":{"synonym":"Контролировать число дней дебиторской задолженности","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"number_doc":{"synonym":"Номер","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}},"main_cash_flow_article":{"synonym":"Основная статья движения денежных средств","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"main_project":{"synonym":"Основной проект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.projects"],"is_ref":true}},"accounting_reflect":{"synonym":"Отражать в бухгалтерском учете","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"tax_accounting_reflect":{"synonym":"Отражать в налоговом учете","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"prepayment_percent":{"synonym":"Процент предоплаты","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"validity":{"synonym":"Срок действия договора","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"vat_included":{"synonym":"Сумма включает НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"price_type":{"synonym":"Тип цен","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"vat_consider":{"synonym":"Учитывать НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"days_without_pay":{"synonym":"Число дней резерва без оплаты","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_folder","path":false}],"mandatory":true,"type":{"types":["cat.partners"],"is_ref":true}},"parent":{"synonym":"Группа договоров","multiline_mode":false,"tooltip":"","type":{"types":["cat.contracts"],"is_ref":true}}},"tabular_sections":{},"cachable":"doc_ram","form":{"selection":{"fields":["is_folder","id","_t_.name as presentation","enm_contract_kinds.synonym as contract_kind","enm_mutual_settlements.synonym as mutual_settlements","cat_organizations.name as organization","cat_partners.name as partner"],"cols":[{"id":"partner","width":"180","type":"ro","align":"left","sort":"server","caption":"Контрагент"},{"id":"organization","width":"180","type":"ro","align":"left","sort":"server","caption":"Организация"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"},{"id":"contract_kind","width":"150","type":"ro","align":"left","sort":"server","caption":"Вид договора"},{"id":"mutual_settlements","width":"150","type":"ro","align":"left","sort":"server","caption":"Ведение расчетов"}]},"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},"parent","name","number_doc","date","validity","owner","organization","contract_kind","mutual_settlements","settlements_currency"],"Дополнительно":["accounting_reflect","tax_accounting_reflect","vat_consider","vat_included","price_type","main_project","main_cash_flow_article","check_debts_amount","check_debts_days","check_days_without_pay","prepayment_percent","allowable_debts_amount","allowable_debts_days","note"]}}}},"nom_units":{"name":"ЕдиницыИзмерения","splitted":false,"synonym":"Единицы измерения","illustration":"Перечень единиц измерения номенклатуры и номенклатурных групп","obj_presentation":"Единица измерения","list_presentation":"Единицы измерения","input_by_string":["name","id"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"qualifier_unit":{"synonym":"Единица по классификатору","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.units"],"is_ref":true}},"heft":{"synonym":"Вес","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":3}},"volume":{"synonym":"Объем","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":3}},"coefficient":{"synonym":"Коэффициент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"rounding_threshold":{"synonym":"Порог округления","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["cat.nom_groups","cat.nom"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"property_values":{"name":"ЗначенияСвойствОбъектов","splitted":false,"synonym":"Дополнительные значения","illustration":"","obj_presentation":"Дополнительное значение","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"heft":{"synonym":"Весовой коэффициент","multiline_mode":false,"tooltip":"Относительный вес дополнительного значения (значимость).","type":{"types":["number"],"digits":10,"fraction_figits":2}},"ПолноеНаименование":{"synonym":"Полное наименование","multiline_mode":true,"tooltip":"Подробное описание значения дополнительного реквизита","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит или сведение.","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"parent":{"synonym":"Входит в группу","multiline_mode":false,"tooltip":"Группа дополнительных значений свойства.","choice_links":[{"name":["selection","owner"],"path":["owner"]}],"type":{"types":["cat.property_values"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"meta_ids":{"name":"ИдентификаторыОбъектовМетаданных","splitted":false,"synonym":"Идентификаторы объектов метаданных","illustration":"Идентификаторы объектов метаданных для использования в базе данных.","obj_presentation":"Идентификатор объекта метаданных","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":false,"main_presentation_name":true,"code_length":0,"fields":{"full_moniker":{"synonym":"Полное имя","multiline_mode":false,"tooltip":"Полное имя объекта метаданных","type":{"types":["string"],"str_len":430}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа объектов","multiline_mode":false,"tooltip":"Группа объектов метаданных.","type":{"types":["cat.meta_ids"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"cashboxes":{"name":"Кассы","splitted":false,"synonym":"Кассы","illustration":"Список мест фактического хранения и движения наличных денежных средств предприятия. Кассы разделены по организациям и валютам денежных средств. ","obj_presentation":"Касса","list_presentation":"Кассы предприятия","input_by_string":["name","id"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"funds_currency":{"synonym":"Валюта денежных средств","multiline_mode":false,"tooltip":"Валюта учета денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"Подразделение, отвечающее за кассу.","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"current_account":{"synonym":"Расчетный счет","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["owner"]}],"choice_groups_elm":"elm","type":{"types":["cat.organization_bank_accounts"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_folder","path":false}],"mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}}},"tabular_sections":{},"cachable":"doc_ram","form":{"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},"name","owner","funds_currency"]}}}},"units":{"name":"КлассификаторЕдиницИзмерения","splitted":false,"synonym":"Классификатор единиц измерения","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":3,"fields":{"name_full":{"synonym":"Полное наименование","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":100}},"international_short":{"synonym":"Международное сокращение","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":3}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram"},"partners":{"name":"Контрагенты","splitted":false,"synonym":"Контрагенты","illustration":"Список юридических или физических лиц клиентов (поставщиков, покупателей).","obj_presentation":"Контрагент","list_presentation":"Контрагенты","input_by_string":["name","id","inn"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"name_full":{"synonym":"Полное наименование","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"main_bank_account":{"synonym":"Основной банковский счет","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.partner_bank_accounts"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"kpp":{"synonym":"КПП","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":9}},"okpo":{"synonym":"Код по ОКПО","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":10}},"inn":{"synonym":"ИНН","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":12}},"individual_legal":{"synonym":"Юр. / физ. лицо","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.individual_legal"],"is_ref":true}},"main_contract":{"synonym":"Основной договор контрагента","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.contracts"],"is_ref":true}},"identification_document":{"synonym":"Документ, удостоверяющий личность","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"buyer_main_manager":{"synonym":"Основной менеджер покупателя","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"is_buyer":{"synonym":"Покупатель","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_supplier":{"synonym":"Поставщик","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"primary_contact":{"synonym":"Основное контактное лицо","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа контрагентов","multiline_mode":false,"tooltip":"","type":{"types":["cat.partners"],"is_ref":true}}},"tabular_sections":{"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_params":[{"name":"parent","path":"139d49b9-5301-45f3-b851-4488420d7d15"}],"choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0},"hide":true},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100},"hide":true},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50},"hide":true},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50},"hide":true},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100},"hide":true},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100},"hide":true},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20},"hide":true},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20},"hide":true}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0},"hide":true}}}},"cachable":"doc_ram","form":{"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},"parent","name","name_full","is_buyer","is_supplier","individual_legal","inn","kpp","okpo","main_bank_account","main_contract","primary_contact","buyer_main_manager"],"Дополнительные реквизиты":[]},"tabular_sections":{"contact_information":{"fields":["kind","presentation"],"headers":"Вид,Представление","widths":"200,*","min_widths":"100,200","aligns":"","sortings":"na,na","types":"ref,txt"}},"tabular_sections_order":["contact_information"]}}},"nom":{"name":"Номенклатура","splitted":false,"synonym":"Номенклатура","illustration":"Перечень товаров, продукции, материалов, полуфабрикатов, тары, услуг","obj_presentation":"Позиция номенклатуры","list_presentation":"","input_by_string":["name","id","article"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":11,"fields":{"article":{"synonym":"Артикул ","multiline_mode":false,"tooltip":"Артикул номенклатуры.","type":{"types":["string"],"str_len":25}},"name_full":{"synonym":"Наименование для печати","multiline_mode":true,"tooltip":"Наименование номенклатуры, которое будет печататься во всех документах.","type":{"types":["string"],"str_len":1024}},"base_unit":{"synonym":"Базовая единица измерения","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.units"],"is_ref":true}},"storage_unit":{"synonym":"Единица хранения остатков","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.nom_units"],"is_ref":true}},"nom_kind":{"synonym":"Вид номенклатуры","multiline_mode":false,"tooltip":"Указывается вид, к которому следует отнести данную позицию номенклатуры.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_kinds"],"is_ref":true}},"nom_group":{"synonym":"Номенклатурная группа","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_groups"],"is_ref":true}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"Определяется ставка НДС товара или услуги","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.vat_rates"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"price_group":{"synonym":"Ценовая группа","multiline_mode":false,"tooltip":"Определяет ценовую группу, к которой относится номенклатурная позиция.","choice_groups_elm":"elm","type":{"types":["cat.price_groups"],"is_ref":true}},"elm_type":{"synonym":"Тип элемента: рама, створка и т.п.","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}},"len":{"synonym":"Длина","multiline_mode":false,"tooltip":"Длина стандартной загатовки, мм","type":{"types":["number"],"digits":8,"fraction_figits":1}},"width":{"synonym":"Ширина - A","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"thickness":{"synonym":"Толщина - T","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"sizefurn":{"synonym":"Размер фурн. паза - D","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"sizefaltz":{"synonym":"Размер фальца - F","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"density":{"synonym":"Плотность, кг / ед. хранения","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"volume":{"synonym":"Объем, м³ / ед. хранения","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"arc_elongation":{"synonym":"Удлинение арки","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"loss_factor":{"synonym":"Коэффициент потерь","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":4}},"rounding_quantity":{"synonym":"Округлять количество","multiline_mode":false,"tooltip":"При расчете спецификации построителя, как в функции Окр(). 1: до десятых долей,  0: до целых, -1: до десятков","type":{"types":["number"],"digits":1,"fraction_figits":0}},"clr":{"synonym":"Цвет по умолчанию","multiline_mode":false,"tooltip":"Цвет материала по умолчанию. Актуально для заполнений, которые берём НЕ из системы","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"cutting_optimization_type":{"synonym":"Тип оптимизации","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.cutting_optimization_types"],"is_ref":true}},"crooked":{"synonym":"Кривой","multiline_mode":false,"tooltip":"Если эта номенклатура есть в спецификации - изделие кривое","type":{"types":["boolean"]}},"colored":{"synonym":"Цветной","multiline_mode":false,"tooltip":"Если эта номенклатура есть в спецификации - изделие цветное","type":{"types":["boolean"]}},"lay":{"synonym":"Раскладка","multiline_mode":false,"tooltip":"Если эта номенклатура есть в спецификации - изделие имеет раскладку","type":{"types":["boolean"]}},"made_to_order":{"synonym":"Заказной","multiline_mode":false,"tooltip":"Если эта номенклатура есть в спецификации - изделие имеет заказные материалы, на которые должен обратить внимание ОМТС","type":{"types":["boolean"]}},"packing":{"synonym":"Упаковка","multiline_mode":false,"tooltip":"Если эта номенклатура есть в спецификации - изделию требуется упаковка","type":{"types":["boolean"]}},"days_to_execution":{"synonym":"Дней до готовности","multiline_mode":false,"tooltip":"Если номенклатура есть в спецификации, плановая готовность отодвигается на N дней","type":{"types":["number"],"digits":6,"fraction_figits":0}},"days_from_execution":{"synonym":"Дней от готовности","multiline_mode":false,"tooltip":"Обратный отсчет. Когда надо запустить в работу в цехе. Должно иметь значение <= ДнейДоГотовности","type":{"types":["number"],"digits":6,"fraction_figits":0}},"pricing":{"synonym":"","multiline_mode":false,"tooltip":"Дополнительная формула расчета цены на случай, когда не хватает возможностей стандартной подисистемы","choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"visualization":{"synonym":"Визуализация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.elm_visualization"],"is_ref":true}},"complete_list_sorting":{"synonym":"Сортировка в листе комплектации","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":2,"fraction_figits":0}},"is_accessory":{"synonym":"Это аксессуар","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_procedure":{"synonym":"Это техоперация","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_service":{"synonym":"Это услуга","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_pieces":{"synonym":"Штуки","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"captured":{"synonym":"Захвачен","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"editor":{"synonym":"Редактор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"zones":{"synonym":"Абоненты-получатели","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"Группа, в которую входит данная позиция номенклатуры.","type":{"types":["cat.nom"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0},"hide":true}}}},"cachable":"ram","form":{"selection":{"fields":[],"cols":[{"id":"id","width":"140","type":"ro","align":"left","sort":"server","caption":"Код"},{"id":"article","width":"150","type":"ro","align":"left","sort":"server","caption":"Артикул"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"},{"id":"nom_unit","width":"70","type":"ro","align":"left","sort":"server","caption":"Ед"},{"id":"thickness","width":"70","type":"ro","align":"left","sort":"server","caption":"Толщина"}]}}},"organizations":{"name":"Организации","splitted":false,"synonym":"Организации","illustration":"","obj_presentation":"Организация","list_presentation":"","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"prefix":{"synonym":"Префикс","multiline_mode":false,"tooltip":"Используется при нумерации документов. В начало каждого номера документов данной организации добавляется символы префикса.","type":{"types":["string"],"str_len":3}},"individual_legal":{"synonym":"Юр. / физ. лицо","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.individual_legal"],"is_ref":true}},"individual_entrepreneur":{"synonym":"Индивидуальный предприниматель","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals"],"is_ref":true}},"inn":{"synonym":"ИНН","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":12}},"kpp":{"synonym":"КПП","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":9}},"main_bank_account":{"synonym":"Основной банковский счет","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.organization_bank_accounts"],"is_ref":true}},"main_cashbox":{"synonym":"Основноая касса","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.cashboxes"],"is_ref":true}},"certificate_series_number":{"synonym":"Серия и номер свидетельства о постановке на учет","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":25}},"certificate_date_issue":{"synonym":"Дата выдачи свидетельства о постановке на учет","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"certificate_authority_name":{"synonym":"Наименование налогового органа, выдавшего свидетельство","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":254}},"certificate_authority_code":{"synonym":"Код налогового органа, выдавшего свидетельство","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":4}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.organizations"],"is_ref":true}}},"tabular_sections":{"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"Хранение контактной информации (адреса, веб-страницы, номера телефонов и др.)","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_params":[{"name":"parent","path":"c34c4e9d-c7c5-42bb-8def-93ecfe7b1977"}],"choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0},"hide":true},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100},"hide":true},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50},"hide":true},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50},"hide":true},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100},"hide":true},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100},"hide":true},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20},"hide":true},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20},"hide":true},"ВидДляСписка":{"synonym":"Вид для списка","multiline_mode":false,"tooltip":"Вид контактной информации для списка","choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"ДействуетС":{"synonym":"Действует С","multiline_mode":false,"tooltip":"Дата актуальности контактная информация","type":{"types":["date"],"date_part":"date"}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0},"hide":true}}}},"cachable":"ram","form":{"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},{"id":"prefix","path":"o.prefix","synonym":"Префикс","type":"ro"},"name","individual_legal","individual_entrepreneur","main_bank_account","main_cashbox"],"Коды":["inn","kpp","certificate_series_number","certificate_date_issue","certificate_authority_name","certificate_authority_code"]},"tabular_sections":{"contact_information":{"fields":["kind","presentation"],"headers":"Вид,Представление","widths":"200,*","min_widths":"100,200","aligns":"","sortings":"na,na","types":"ref,txt"}},"tabular_sections_order":["contact_information"]}}},"inserts":{"name":"Вставки","splitted":false,"synonym":"Вставки","illustration":"Армирование, пленки, вставки - дополнение спецификации, которое зависит от одного элемента","obj_presentation":"Вставка","list_presentation":"Вставки","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"article":{"synonym":"Артикул ","multiline_mode":false,"tooltip":"Для формулы","type":{"types":["string"],"str_len":100}},"insert_type":{"synonym":"Тип вставки","multiline_mode":false,"tooltip":"Используется, как фильтр в интерфейсе, плюс, от типа вставки могут зависеть алгоритмы расчета количеств и углов","choice_params":[{"name":"ref","path":["Профиль","Заполнение","МоскитнаяСетка","Элемент","Контур","Изделие","Подоконник","Откос","Водоотлив","Монтаж","Доставка","Набор"]}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.inserts_types"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"Вставку можно использовать для элементов с этим цветом","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.clrs"],"is_ref":true}},"lmin":{"synonym":"X min","multiline_mode":false,"tooltip":"X min (длина или ширина)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"X max","multiline_mode":false,"tooltip":"X max (длина или ширина)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"hmin":{"synonym":"Y min","multiline_mode":false,"tooltip":"Y min (высота)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"hmax":{"synonym":"Y max","multiline_mode":false,"tooltip":"Y max (высота)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"smin":{"synonym":"S min","multiline_mode":false,"tooltip":"Площадь min","type":{"types":["number"],"digits":8,"fraction_figits":3}},"smax":{"synonym":"S max","multiline_mode":false,"tooltip":"Площадь max","type":{"types":["number"],"digits":8,"fraction_figits":3}},"for_direct_profile_only":{"synonym":"Для прямых","multiline_mode":false,"tooltip":"Использовать только для прямых профилей (1), только для кривых (-1) или всегда(0)","type":{"types":["number"],"digits":1,"fraction_figits":0}},"ahmin":{"synonym":"α min","multiline_mode":false,"tooltip":"AH min (угол к горизонтали)","type":{"types":["number"],"digits":3,"fraction_figits":0}},"ahmax":{"synonym":"α max","multiline_mode":false,"tooltip":"AH max (угол к горизонтали)","type":{"types":["number"],"digits":3,"fraction_figits":0}},"priority":{"synonym":"Приоритет","multiline_mode":false,"tooltip":"Не используется","type":{"types":["number"],"digits":6,"fraction_figits":0}},"mmin":{"synonym":"Масса min","multiline_mode":false,"tooltip":"M min (масса)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"mmax":{"synonym":"Масса max","multiline_mode":false,"tooltip":"M max (масса)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"impost_fixation":{"synonym":"Крепление импостов","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.impost_mount_options"],"is_ref":true}},"shtulp_fixation":{"synonym":"Крепление штульпа","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"can_rotate":{"synonym":"Можно поворачивать","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"sizeb":{"synonym":"Размер \"B\"","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"clr_group":{"synonym":"Доступность цветов","multiline_mode":false,"tooltip":"Если указано, выбор цветов будет ограничен этой группой","choice_params":[{"name":"color_price_group_destination","path":"ДляОграниченияДоступности"}],"choice_groups_elm":"elm","type":{"types":["cat.color_price_groups"],"is_ref":true}},"is_order_row":{"synonym":"Это строка заказа","multiline_mode":false,"tooltip":"Если заполнено, строка будет добавлена в заказ, а не в спецификацию текущей продукции","choice_groups_elm":"elm","type":{"types":["enm.specification_order_row_types"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"insert_glass_type":{"synonym":"Тип вставки стп","multiline_mode":false,"tooltip":"Тип вставки стеклопакета","choice_groups_elm":"elm","type":{"types":["enm.inserts_glass_types"],"is_ref":true}},"available":{"synonym":"Доступна в интерфейсе","multiline_mode":false,"tooltip":"Показывать эту вставку в списках допвставок в элемент, изделие и контур","type":{"types":["boolean"]}},"slave":{"synonym":"Ведомая","multiline_mode":false,"tooltip":"Выполнять пересчет спецификации этой вставки при изменении других строк заказа (например, спецификация монтажа)","type":{"types":["boolean"]}},"captured":{"synonym":"Захвачен","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"editor":{"synonym":"Редактор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"zones":{"synonym":"Абоненты-получатели","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.inserts","cat.nom"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"nom_characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["specification","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":8}},"sz":{"synonym":"Размер","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"coefficient":{"synonym":"Коэфф.","multiline_mode":false,"tooltip":"коэффициент (кол-во комплектующего на 1мм профиля или 1м² заполнения)","type":{"types":["number"],"digits":14,"fraction_figits":8}},"angle_calc_method":{"synonym":"Расчет угла","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.angle_calculating_ways"],"is_ref":true}},"count_calc_method":{"synonym":"Расчет колич.","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.count_calculating_ways"],"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","choice_params":[{"name":"parent","path":["3220e24b-ffcd-11e5-8303-e67fda7f6b46","3220e251-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"lmin":{"synonym":"Длина min","multiline_mode":false,"tooltip":"Минимальная длина или ширина","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"Длина max","multiline_mode":false,"tooltip":"Максимальная длина или ширина","type":{"types":["number"],"digits":6,"fraction_figits":0}},"ahmin":{"synonym":"Угол min","multiline_mode":false,"tooltip":"Минимальный угол к горизонтали","type":{"types":["number"],"digits":3,"fraction_figits":0}},"ahmax":{"synonym":"Угол max","multiline_mode":false,"tooltip":"Максимальный угол к горизонтали","type":{"types":["number"],"digits":3,"fraction_figits":0}},"smin":{"synonym":"S min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"smax":{"synonym":"S max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"for_direct_profile_only":{"synonym":"Для прямых","multiline_mode":false,"tooltip":"Использовать только для прямых профилей (1), только для кривых (-1) или всегда(0)","type":{"types":["number"],"digits":1,"fraction_figits":0}},"step":{"synonym":"Шаг","multiline_mode":false,"tooltip":"Шаг (расчет по точкам)","type":{"types":["number"],"digits":10,"fraction_figits":3}},"step_angle":{"synonym":"Угол шага","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"offsets":{"synonym":"Отступы шага","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"do_center":{"synonym":"↔","multiline_mode":false,"tooltip":"Положение от края или от центра","type":{"types":["boolean"]}},"attrs_option":{"synonym":"Направления","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.inset_attrs_options"],"is_ref":true}},"end_mount":{"synonym":"Концевые крепления","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_order_row":{"synonym":"Это строка заказа","multiline_mode":false,"tooltip":"Если заполнено, строка будет добавлена в заказ, а не в спецификацию текущей продукции","choice_groups_elm":"elm","type":{"types":["enm.specification_order_row_types"],"is_ref":true}},"is_main_elm":{"synonym":"Это основной элемент","multiline_mode":false,"tooltip":"Для профильных вставок определяет номенклатуру, размеры которой будут использованы при построении эскиза","type":{"types":["boolean"]}}}},"selection_params":{"name":"ПараметрыОтбора","synonym":"Параметры отбора","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"comparison_type":{"synonym":"Вид сравнения","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["gt","gte","lt","lte","eq","ne","in","nin","inh","ninh"]}],"choice_groups_elm":"elm","type":{"types":["enm.comparison_types"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["comparison_type"],"path":["selection_params","comparison_type"]},{"name":["selection","owner"],"path":["selection_params","param"]},{"name":["txt_row"],"path":["selection_params","txt_row"]}],"choice_type":{"path":["selection_params","param"],"elm":0},"mandatory":true,"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового реквизита либо сериализация списочного значения","type":{"types":["string"],"str_len":0}}}},"product_params":{"name":"ПараметрыИзделия","synonym":"Параметры изделия","tooltip":"Значения по умолчанию (для параметрических изделий)","fields":{"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["product_params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["product_params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"hide":{"synonym":"Скрыть","multiline_mode":false,"tooltip":"Не показывать строку параметра в диалоге свойств изделия","type":{"types":["boolean"]}},"forcibly":{"synonym":"Принудительно","multiline_mode":false,"tooltip":"Замещать установленное ранее значение при перевыборе системы","type":{"types":["boolean"]}}}}},"cachable":"ram","form":{"selection":{"fields":[],"cols":[{"id":"id","width":"140","type":"ro","align":"left","sort":"server","caption":"Код"},{"id":"insert_type","width":"200","type":"ro","align":"left","sort":"server","caption":"Тип вставки"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"}]},"obj":{"head":{" ":["id","name","insert_type","sizeb","clr","clr_group","is_order_row","priority"],"Дополнительно":["lmin","lmax","hmin","hmax","smin","smax","ahmin","ahmax","mmin","mmax","for_direct_profile_only","impost_fixation","shtulp_fixation","can_rotate"]},"tabular_sections":{"specification":{"fields":["nom","clr","quantity","sz","coefficient","angle_calc_method","count_calc_method","formula","is_order_row","is_main_elm","lmin","lmax","ahmin","ahmax","smin","smax"],"headers":"Номенклатура,Цвет,Колич.,Размер,Коэфф.,Расч.угла,Расч.колич.,Формула,↑ В заказ,Осн. мат.,Длина min,Длина max,Угол min,Угол max,S min, S max","widths":"*,160,100,100,100,140,140,160,80,80,100,100,100,100,100,100","min_widths":"200,160,100,100,100,140,140,160,140,80,100,100,100,100,100,100","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na,na,na,na,na,na,na","types":"ref,ref,calck,calck,calck,ref,ref,ref,ref,ch,calck,calck,calck,calck,calck,calck"}},"tabular_sections_order":["specification"]}}},"parameters_keys":{"name":"КлючиПараметров","splitted":false,"synonym":"Ключи параметров","illustration":"Списки пар {Параметр:Значение} для фильтрации в подсистемах формирования спецификаций, планировании и ценообразовании\n","obj_presentation":"Ключ параметров","list_presentation":"Ключи параметров","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"priority":{"synonym":"Приоритет","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"sorting_field":{"synonym":"Порядок","multiline_mode":false,"tooltip":"Используется для упорядочивания","type":{"types":["number"],"digits":5,"fraction_figits":0}},"applying":{"synonym":"Применение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.parameters_keys_applying"],"is_ref":true}},"captured":{"synonym":"Захвачен","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"editor":{"synonym":"Редактор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"zones":{"synonym":"Абоненты-получатели","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.parameters_keys"],"is_ref":true}}},"tabular_sections":{"params":{"name":"Параметры","synonym":"Параметры","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"comparison_type":{"synonym":"Вид сравнения","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["gt","gte","lt","lte","eq","ne","in","nin","inh","ninh"]}],"choice_groups_elm":"elm","type":{"types":["enm.comparison_types"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["comparison_type"],"path":["params","comparison_type"]},{"name":["selection","owner"],"path":["params","property"]},{"name":["txt_row"],"path":["params","txt_row"]}],"choice_type":{"path":["params","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового реквизита либо сериализация списочного значения","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc_ram"},"production_params":{"name":"пзПараметрыПродукции","splitted":false,"synonym":"Параметры продукции","illustration":"Настройки системы профилей и фурнитуры","obj_presentation":"Система","list_presentation":"Параметры продукции","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"default_clr":{"synonym":"Осн цвет","multiline_mode":false,"tooltip":"Основной цвет изделия","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"clr_group":{"synonym":"Доступность цветов","multiline_mode":false,"tooltip":"","choice_params":[{"name":"color_price_group_destination","path":"ДляОграниченияДоступности"}],"choice_groups_elm":"elm","type":{"types":["cat.color_price_groups"],"is_ref":true}},"tmin":{"synonym":"Толщина заполнения min ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"tmax":{"synonym":"Толщина заполнения max ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"allow_open_cnn":{"synonym":"Незамкн. контуры","multiline_mode":false,"tooltip":"Допускаются незамкнутые контуры","type":{"types":["boolean"]}},"flap_pos_by_impost":{"synonym":"Положение ств. по имп.","multiline_mode":false,"tooltip":"Использовать положения Центр, Центр вертикаль и Центр горизонталь для створок","type":{"types":["boolean"]}},"captured":{"synonym":"Захвачен","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"editor":{"synonym":"Редактор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"zones":{"synonym":"Абоненты-получатели","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"","type":{"types":["cat.production_params"],"is_ref":true}}},"tabular_sections":{"elmnts":{"name":"Элементы","synonym":"Элементы","tooltip":"Типовые рама, створка, импост и заполнение для данной системы","fields":{"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"elm_type":{"synonym":"Тип элемента","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Рама","Створка","Импост","Штульп","Заполнение","Раскладка","Добор","Соединитель","Москитка","Водоотлив","Стекло"]}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.elm_types"],"is_ref":true}},"nom":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.inserts"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"pos":{"synonym":"Положение","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Лев","Прав","Верх","Низ","ЦентрВертикаль","ЦентрГоризонталь","Центр","Любое"]}],"choice_groups_elm":"elm","type":{"types":["enm.positions"],"is_ref":true}}}},"production":{"name":"Продукция","synonym":"Продукция","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["production","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["production","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}}}},"product_params":{"name":"ПараметрыИзделия","synonym":"Параметры изделия","tooltip":"Значения параметров изделия по умолчанию","fields":{"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["product_params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["product_params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"hide":{"synonym":"Скрыть","multiline_mode":false,"tooltip":"Не показывать строку параметра в диалоге свойств изделия","type":{"types":["boolean"]}},"forcibly":{"synonym":"Принудительно","multiline_mode":false,"tooltip":"Замещать установленное ранее значение при перевыборе системы","type":{"types":["boolean"]}}}},"furn_params":{"name":"ПараметрыФурнитуры","synonym":"Параметры фурнитуры","tooltip":"Значения параметров фурнитуры по умолчанию","fields":{"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["furn_params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["furn_params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"hide":{"synonym":"Скрыть","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"forcibly":{"synonym":"Принудительно","multiline_mode":false,"tooltip":"Замещать установленное ранее значение при перевыборе системы","type":{"types":["boolean"]}}}},"base_blocks":{"name":"ТиповыеБлоки","synonym":"Шаблоны","tooltip":"","fields":{"calc_order":{"synonym":"Расчет","multiline_mode":false,"tooltip":"","choice_params":[{"name":"obj_delivery_state","path":"Шаблон"}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["doc.calc_order"],"is_ref":true}}}}},"cachable":"ram","form":{"obj":{"head":{" ":["id","name","parent","clr_group","tmin","tmax","allow_open_cnn"]},"tabular_sections":{"elmnts":{"fields":["by_default","elm_type","nom","clr","pos"],"headers":"√,Тип,Номенклатура,Цвет,Положение","widths":"70,160,*,160,160","min_widths":"70,160,200,160,160","aligns":"","sortings":"na,na,na,na,na","types":"ch,ref,ref,ref,ref"},"production":{"fields":["nom","param","value"],"headers":"Номенклатура,Параметр,Значение","widths":"*,160,160","min_widths":"200,160,160","aligns":"","sortings":"na,na,na","types":"ref,ro,ro"},"product_params":{"fields":["param","value","hide","forcibly"],"headers":"Параметр,Значение,Скрыть,Принудительно","widths":"*,*,80,80","min_widths":"200,200,80,80","aligns":"","sortings":"na,na,na,na","types":"ro,ro,ch,ch"},"furn_params":{"fields":["param","value","hide","forcibly"],"headers":"Параметр,Значение,Скрыть,Принудительно","widths":"*,*,80,80","min_widths":"200,200,80,80","aligns":"","sortings":"na,na,na,na","types":"ro,ro,ch,ch"},"base_blocks":{"fields":["calc_order"],"headers":"Расчет","widths":"*","min_widths":"200","aligns":"","sortings":"na","types":"ref"}},"tabular_sections_order":["elmnts","production","product_params","furn_params","base_blocks"]}}},"delivery_areas":{"name":"РайоныДоставки","splitted":false,"synonym":"Районы доставки","illustration":"","obj_presentation":"Район доставки","list_presentation":"Районы доставки","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.countries"],"is_ref":true}},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион, край, область","mandatory":true,"type":{"types":["string"],"str_len":50}},"city":{"synonym":"Город (населенный пункт)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"latitude":{"synonym":"Гео. коорд. Широта","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":12}},"longitude":{"synonym":"Гео. коорд. Долгота","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":12}},"ind":{"synonym":"Индекс","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":6}},"delivery_area":{"synonym":"Район (внутри города)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"specify_area_by_geocoder":{"synonym":"Уточнять район геокодером","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram"},"cnns":{"name":"пзСоединения","splitted":false,"synonym":"Соединения элементов","illustration":"Спецификации соединений элементов","obj_presentation":"Соединение","list_presentation":"Соединения","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"priority":{"synonym":"Приоритет","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"amin":{"synonym":"Угол минимальный","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"amax":{"synonym":"Угол максимальный","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"sd1":{"synonym":"Сторона","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.cnn_sides"],"is_ref":true}},"sz":{"synonym":"Размер","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"cnn_type":{"synonym":"Тип соединения","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.cnn_types"],"is_ref":true}},"ahmin":{"synonym":"AH min (угол к горизонтали)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"ahmax":{"synonym":"AH max (угол к горизонтали)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"lmin":{"synonym":"Длина шва min ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"Длина шва max ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"tmin":{"synonym":"Толщина min ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"tmax":{"synonym":"Толщина max ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"var_layers":{"synonym":"Разн. плоск. створок","multiline_mode":false,"tooltip":"Створки в разных плоскостях","type":{"types":["boolean"]}},"for_direct_profile_only":{"synonym":"Для прямых","multiline_mode":false,"tooltip":"Использовать только для прямых профилей (1), только для кривых (-1) или всегда(0)","type":{"types":["number"],"digits":1,"fraction_figits":0}},"art1vert":{"synonym":"Арт1 верт.","multiline_mode":false,"tooltip":"Соединение используется только в том случае, если Артикул1 - вертикальный","type":{"types":["boolean"]}},"art1glass":{"synonym":"Арт1 - стеклопакет","multiline_mode":false,"tooltip":"Артикул1 может быть составным стеклопакетом","type":{"types":["boolean"]}},"art2glass":{"synonym":"Арт2 - стеклопакет","multiline_mode":false,"tooltip":"Артикул2 может быть составным стеклопакетом","type":{"types":["boolean"]}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"captured":{"synonym":"Захвачен","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"editor":{"synonym":"Редактор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"zones":{"synonym":"Абоненты-получатели","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.inserts","cat.nom"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"nom_characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["specification","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"coefficient":{"synonym":"Коэффициент","multiline_mode":false,"tooltip":"коэффициент (кол-во комплектующего на 1мм профиля)","type":{"types":["number"],"digits":14,"fraction_figits":8}},"sz":{"synonym":"Размер","multiline_mode":false,"tooltip":"размер (в мм, на которое компл. заходит на Артикул 2)","type":{"types":["number"],"digits":8,"fraction_figits":1}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":8}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","choice_params":[{"name":"parent","path":["3220e259-ffcd-11e5-8303-e67fda7f6b46","3220e251-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"sz_min":{"synonym":"Размер min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"sz_max":{"synonym":"Размер max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"amin":{"synonym":"Угол min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"amax":{"synonym":"Угол max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"set_specification":{"synonym":"Устанавливать","multiline_mode":false,"tooltip":"Устанавливать спецификацию","choice_groups_elm":"elm","type":{"types":["enm.specification_installation_methods"],"is_ref":true}},"for_direct_profile_only":{"synonym":"Для прямых","multiline_mode":false,"tooltip":"Использовать только для прямых профилей (1), только для кривых (-1) или всегда(0)","type":{"types":["number"],"digits":1,"fraction_figits":0}},"by_contour":{"synonym":"По контуру","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"contraction_by_contour":{"synonym":"Укорочение по контуру","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"on_aperture":{"synonym":"На проем","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"angle_calc_method":{"synonym":"Расчет угла","multiline_mode":false,"tooltip":"Способ расчета угла","choice_groups_elm":"elm","type":{"types":["enm.angle_calculating_ways"],"is_ref":true}},"contour_number":{"synonym":"Контур №","multiline_mode":false,"tooltip":"Номер контура (доп)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"is_order_row":{"synonym":"Это строка заказа","multiline_mode":false,"tooltip":"Если \"Истина\", строка будет добавлена в заказ, а не в спецификацию текущей продукции","type":{"types":["boolean"]}}}},"cnn_elmnts":{"name":"СоединяемыеЭлементы","synonym":"Соединяемые элементы","tooltip":"","fields":{"nom1":{"synonym":"Номенклатура1","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"clr1":{"synonym":"Цвет1","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"nom2":{"synonym":"Номенклатура2","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"clr2":{"synonym":"Цвет2","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"varclr":{"synonym":"Разные цвета","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_nom_combinations_row":{"synonym":"Это строка сочетания номенклатур","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"selection_params":{"name":"ПараметрыОтбора","synonym":"Параметры отбора","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"comparison_type":{"synonym":"Вид сравнения","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["gt","gte","lt","lte","eq","ne","in","nin","inh","ninh"]}],"choice_groups_elm":"elm","type":{"types":["enm.comparison_types"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["comparison_type"],"path":["selection_params","comparison_type"]},{"name":["selection","owner"],"path":["selection_params","param"]},{"name":["txt_row"],"path":["selection_params","txt_row"]}],"choice_type":{"path":["selection_params","param"],"elm":0},"mandatory":true,"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового реквизита либо сериализация списочного значения","type":{"types":["string"],"str_len":0}}}}},"cachable":"ram","form":{"selection":{"fields":[],"cols":[{"id":"id","width":"140","type":"ro","align":"left","sort":"server","caption":"Код"},{"id":"cnn_type","width":"200","type":"ro","align":"left","sort":"server","caption":"Тип"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"}]},"obj":{"head":{" ":["id","name","cnn_type","sz","priority"],"Дополнительно":["sd1","amin","amax","ahmin","ahmax","lmin","lmax","tmin","tmax","var_layers","for_direct_profile_only","art1vert","art1glass","art2glass"]},"tabular_sections":{"specification":{"fields":["nom","clr","quantity","sz","coefficient","angle_calc_method","formula","is_order_row","sz_min","sz_max","amin","amax","set_specification","for_direct_profile_only"],"headers":"Номенклатура,Цвет,Колич.,Размер,Коэфф.,Расч.угла,Формула,↑ В заказ,Размер min,Размер max,Угол min,Угол max,Устанавливать,Для прямых","widths":"*,160,100,100,100,140,160,140,100,100,100,100,140,140","min_widths":"200,160,100,100,100,140,160,140,100,100,100,100,140,140","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na,na,na,na,na","types":"ref,ref,calck,calck,calck,ref,ref,ref,calck,calck,calck,calck,ref,calck"},"cnn_elmnts":{"fields":["nom1","clr1","nom2","clr2","varclr","is_nom_combinations_row"],"headers":"Номенклатура1,Цвет1,Номенклатура2,Цвет2,Разные цвета","widths":"*,*,*,*,100","min_widths":"160,160,160,160,100","aligns":"","sortings":"na,na,na,na,na","types":"ref,ref,ref,ref,ch"}},"tabular_sections_order":["specification","cnn_elmnts"]}}},"color_price_groups":{"name":"ЦветоЦеновыеГруппы","splitted":false,"synonym":"Цвето-ценовые группы","illustration":"","obj_presentation":"Цвето-ценовая группа","list_presentation":"Цвето-ценовые группы","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"color_price_group_destination":{"synonym":"Назначение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.color_price_group_destinations"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"price_groups":{"name":"ЦеновыеГруппы","synonym":"Ценовые группы","tooltip":"","fields":{"price_group":{"synonym":"Ценовая гр. или номенклатура","multiline_mode":false,"tooltip":"Ссылка на ценовую группу или номенклатуру или папку (родитель - первый уровень иерархии) номенклатуры, для которой действует соответствие цветов","type":{"types":["cat.price_groups","cat.nom"],"is_ref":true}}}},"clr_conformity":{"name":"СоответствиеЦветов","synonym":"Соответствие цветов","tooltip":"","fields":{"clr1":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","type":{"types":["cat.color_price_groups","cat.clrs"],"is_ref":true}},"clr2":{"synonym":"Соответствие","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}}}}},"cachable":"ram"},"divisions":{"name":"Подразделения","splitted":false,"synonym":"Подразделения","illustration":"Перечень подразделений предприятия","obj_presentation":"Подразделение","list_presentation":"Подразделения","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":false,"main_presentation_name":true,"code_length":9,"fields":{"main_project":{"synonym":"Основной проект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.projects"],"is_ref":true}},"sorting_field":{"synonym":"Порядок","multiline_mode":false,"tooltip":"Используется для упорядочивания (служебный)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Входит в подразделение","multiline_mode":false,"tooltip":"","type":{"types":["cat.divisions"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc_ram"},"users":{"name":"Пользователи","splitted":false,"synonym":"Пользователи","illustration":"","obj_presentation":"Пользователь","list_presentation":"","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"invalid":{"synonym":"Недействителен","multiline_mode":false,"tooltip":"Пользователь больше не работает в программе, но сведения о нем сохранены.\nНедействительные пользователи скрываются из всех списков\nпри выборе или подборе в документах и других местах программы.","type":{"types":["boolean"]}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"Подразделение, в котором работает пользователь","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"individual_person":{"synonym":"Физическое лицо","multiline_mode":false,"tooltip":"Физическое лицо, с которым связан пользователь","choice_groups_elm":"elm","type":{"types":["cat.individuals"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":true,"tooltip":"Произвольная строка","type":{"types":["string"],"str_len":0}},"ancillary":{"synonym":"Служебный","multiline_mode":false,"tooltip":"Неразделенный или разделенный служебный пользователь, права к которому устанавливаются непосредственно и программно.","type":{"types":["boolean"]}},"user_ib_uid":{"synonym":"Идентификатор пользователя ИБ","multiline_mode":false,"tooltip":"Уникальный идентификатор пользователя информационной базы, с которым сопоставлен этот элемент справочника.","choice_groups_elm":"elm","type":{"types":["string"],"str_len":36,"str_fix":true}},"user_fresh_uid":{"synonym":"Идентификатор пользователя сервиса","multiline_mode":false,"tooltip":"Уникальный идентификатор пользователя сервиса, с которым сопоставлен этот элемент справочника.","choice_groups_elm":"elm","type":{"types":["string"],"str_len":36,"str_fix":true}},"id":{"synonym":"Логин","multiline_mode":true,"tooltip":"Произвольная строка","type":{"types":["string"],"str_len":50}},"prefix":{"synonym":"Префикс нумерации документов","multiline_mode":false,"tooltip":"Префикс номеров документов текущего пользователя","mandatory":true,"type":{"types":["string"],"str_len":2}},"branch":{"synonym":"Отдел","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.branches"],"is_ref":true}},"push_only":{"synonym":"Только push репликация","multiline_mode":false,"tooltip":"Для пользователя установлен режим push-only (изменения мигрируют в одну сторону - от пользователя на сервер)","type":{"types":["boolean"]}},"suffix":{"synonym":"Суффикс CouchDB","multiline_mode":false,"tooltip":"Для разделения данных в CouchDB","mandatory":true,"type":{"types":["string"],"str_len":4}},"direct":{"synonym":"Direct","multiline_mode":false,"tooltip":"Для пользователя запрещен режим offline","type":{"types":["boolean"]}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Дополнительные реквизиты объекта","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}},"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"Хранение контактной информации (адреса, веб-страницы, номера телефонов и др.)","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_params":[{"name":"parent","path":"8cbaa30d-faab-45ad-880e-84f8b421f448"}],"choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0}},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100}},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100}},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100}},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20}},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20}},"ВидДляСписка":{"synonym":"Вид для списка","multiline_mode":false,"tooltip":"Вид контактной информации для списка","choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}}}},"acl_objs":{"name":"ОбъектыДоступа","synonym":"Объекты доступа","tooltip":"","fields":{"acl_obj":{"synonym":"Объект доступа","multiline_mode":false,"tooltip":"","type":{"types":["cat.individuals","cat.users","cat.nom_prices_types","cat.divisions","cat.parameters_keys","cat.partners","cat.organizations","cat.cashboxes","cat.meta_ids","cat.stores"],"is_ref":true}},"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}}},"cachable":"ram","form":{"obj":{"head":{" ":["id","name","individual_person"],"Дополнительно":["ancillary","invalid",{"id":"user_ib_uid","path":"o.user_ib_uid","synonym":"Идентификатор пользователя ИБ","type":"ro"},{"id":"user_fresh_uid","path":"o.user_fresh_uid","synonym":"Идентификатор пользователя сервиса","type":"ro"},"note"]},"tabular_sections":{"contact_information":{"fields":["kind","presentation"],"headers":"Вид,Представление","widths":"200,*","min_widths":"100,200","aligns":"","sortings":"na,na","types":"ref,txt"}},"tabular_sections_order":["contact_information"]}}},"projects":{"name":"Проекты","splitted":false,"synonym":"Проекты","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":11,"fields":{"start":{"synonym":"Старт","multiline_mode":false,"tooltip":"Плановая дата начала работ по проекту.","type":{"types":["date"],"date_part":"date"}},"finish":{"synonym":"Финиш","multiline_mode":false,"tooltip":"Плановая дата окончания работ по проекту.","type":{"types":["date"],"date_part":"date"}},"launch":{"synonym":"Запуск","multiline_mode":false,"tooltip":"Фактическая дата начала работ по проекту.","type":{"types":["date"],"date_part":"date_time"}},"readiness":{"synonym":"Готовность","multiline_mode":false,"tooltip":"Фактическая дата окончания  работ по проекту.","type":{"types":["date"],"date_part":"date_time"}},"finished":{"synonym":"Завершен","multiline_mode":false,"tooltip":"Признак, указывающий на то, что работы по проекту завершены.","type":{"types":["boolean"]}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Ответственный за реализацию проекта.","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"Любые комментарии по проекту","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.projects"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc"},"stores":{"name":"Склады","splitted":false,"synonym":"Склады (места хранения)","illustration":"Сведения о местах хранения товаров (складах), их структуре и физических лицах, назначенных материально ответственными (МОЛ) за тот или иной склад","obj_presentation":"Склад","list_presentation":"Склады","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"","type":{"types":["cat.stores"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc_ram"},"cash_flow_articles":{"name":"СтатьиДвиженияДенежныхСредств","splitted":false,"synonym":"Статьи движения денежных средств","illustration":"Перечень статей движения денежных средств (ДДС), используемых в предприятии для проведения анализа поступлений и расходов в разрезе статей движения денежных средств. ","obj_presentation":"Статья движения денежных средств","list_presentation":"Статьи движения денежных средств","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"definition":{"synonym":"Описание","multiline_mode":true,"tooltip":"Рекомендации по выбору статьи движения денежных средств в документах","type":{"types":["string"],"str_len":1024}},"sorting_field":{"synonym":"Порядок","multiline_mode":false,"tooltip":"Определяет порядок вывода вариантов анализа в мониторе целевых показателей при группировке по категориям целей.","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"В группе статей","multiline_mode":false,"tooltip":"Группа статей движения денежных средств","type":{"types":["cat.cash_flow_articles"],"is_ref":true}}},"tabular_sections":{},"cachable":"doc"},"nom_prices_types":{"name":"ТипыЦенНоменклатуры","splitted":false,"synonym":"Типы цен номенклатуры","illustration":"Перечень типов отпускных цен предприятия","obj_presentation":"Тип цен номенклатуры","list_presentation":"Типы цен номенклатуры","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"price_currency":{"synonym":"Валюта цены по умолчанию","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.currencies"],"is_ref":true}},"discount_percent":{"synonym":"Процент скидки или наценки по умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"vat_price_included":{"synonym":"Цена включает НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"rounding_order":{"synonym":"Порядок округления","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":10}},"rounding_in_a_big_way":{"synonym":"Округлять в большую сторону","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"doc_ram"},"individuals":{"name":"ФизическиеЛица","splitted":false,"synonym":"Физические лица","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":10,"fields":{"birth_date":{"synonym":"Дата рождения","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"inn":{"synonym":"ИНН","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":12}},"imns_code":{"synonym":"Код ИФНС","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":4}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"pfr_number":{"synonym":"Страховой номер ПФР","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":14}},"sex":{"synonym":"Пол","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.gender"],"is_ref":true}},"birth_place":{"synonym":"Место рождения","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":240}},"ОсновноеИзображение":{"synonym":"Основное изображение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.Файлы"],"is_ref":true}},"Фамилия":{"synonym":"Фамилия","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"Имя":{"synonym":"Имя","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"Отчество":{"synonym":"Отчество","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ФамилияРП":{"synonym":"Фамилия (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ИмяРП":{"synonym":"Имя (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ОтчествоРП":{"synonym":"Отчество (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ОснованиеРП":{"synonym":"Основание (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ДолжностьРП":{"synonym":"Должность (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"Должность":{"synonym":"Должность","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.individuals"],"is_ref":true}}},"tabular_sections":{"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"Хранение контактной информации (адреса, веб-страницы, номера телефонов и др.)","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_params":[{"name":"parent","path":"822f19bc-09ab-4913-b283-b5461382a75d"}],"choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0}},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100}},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100}},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100}},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20}},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20}},"ВидДляСписка":{"synonym":"Вид для списка","multiline_mode":false,"tooltip":"Вид контактной информации для списка","choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}}}}},"cachable":"ram","form":{"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},"name","sex","birth_date",{"id":"parent","path":"o.parent","synonym":"Группа","type":"ref"}],"Коды":["inn","imns_code","pfr_number"],"Для печатных форм":["Фамилия","Имя","Отчество","ФамилияРП","ИмяРП","ОтчествоРП","Должность","ДолжностьРП","ОснованиеРП"]},"tabular_sections":{"contact_information":{"fields":["kind","presentation"],"headers":"Вид,Представление","widths":"200,*","min_widths":"100,200","aligns":"","sortings":"na,na","types":"ref,txt"}},"tabular_sections_order":["contact_information"]}}},"characteristics":{"name":"ХарактеристикиНоменклатуры","splitted":false,"synonym":"Характеристики номенклатуры","illustration":"Дополнительные характеристики элементов номенклатуры: цвет, размер и т.п.","obj_presentation":"Характеристика номенклатуры","list_presentation":"Характеристики номенклатуры","input_by_string":["name"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"x":{"synonym":"Длина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"y":{"synonym":"Высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"z":{"synonym":"Толщина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"weight":{"synonym":"Масса, кг","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"calc_order":{"synonym":"Расчет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"product":{"synonym":"Изделие","multiline_mode":false,"tooltip":"Для продукции - номер строки заказа, для характеристики стеклопакета - номер элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"leading_product":{"synonym":"Ведущая продукция","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"leading_elm":{"synonym":"Ведущий элемент","multiline_mode":false,"tooltip":"Для москиток и стеклопакетов - номер элемента ведущей продукции","type":{"types":["number"],"digits":6,"fraction_figits":0}},"origin":{"synonym":"Происхождение","multiline_mode":false,"tooltip":"Используется в связке с ведущей продукцией и ведущим элементом","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"base_block":{"synonym":"Типовой блок","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"sys":{"synonym":"Система","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.production_params"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":512}},"obj_delivery_state":{"synonym":"Этап согласования","multiline_mode":false,"tooltip":"Для целей RLS","choice_params":[{"name":"ref","path":["Подтвержден","Отклонен","Архив","Шаблон","Черновик"]}],"choice_groups_elm":"elm","type":{"types":["enm.obj_delivery_states"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"Для целей RLS","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Офис продаж","multiline_mode":false,"tooltip":"Для целей RLS","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"builder_props":{"synonym":"Доп. свойства построителя","multiline_mode":false,"tooltip":"Объект JSON-строкой","type":{"types":["string"],"str_len":1000}},"svg":{"synonym":"Миниэскиз","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0},"compress":true},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}}},"tabular_sections":{"constructions":{"name":"Конструкции","synonym":"Конструкции","tooltip":"Конструкции изделия. Они же - слои или контуры","fields":{"cnstr":{"synonym":"№ Конструкции","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"parent":{"synonym":"Внешн. констр.","multiline_mode":false,"tooltip":"№ внешней конструкции","type":{"types":["number"],"digits":6,"fraction_figits":0}},"x":{"synonym":"Ширина, м","multiline_mode":false,"tooltip":"Габаритная ширина контура","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y":{"synonym":"Высота, м","multiline_mode":false,"tooltip":"Габаритная высота контура","type":{"types":["number"],"digits":8,"fraction_figits":1}},"z":{"synonym":"Глубина","multiline_mode":false,"tooltip":"Z-координата плоскости (z-index) длч многослойных конструкций","type":{"types":["number"],"digits":8,"fraction_figits":1}},"w":{"synonym":"Ширина фурн","multiline_mode":false,"tooltip":"Ширина фурнитуры (по фальцу)","type":{"types":["number"],"digits":8,"fraction_figits":1}},"h":{"synonym":"Высота фурн","multiline_mode":false,"tooltip":"Высота фурнитуры (по фальцу)","type":{"types":["number"],"digits":8,"fraction_figits":1}},"furn":{"synonym":"Фурнитура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_folder","path":false},{"name":"is_set","path":false}],"choice_groups_elm":"elm","type":{"types":["cat.furns"],"is_ref":true}},"clr_furn":{"synonym":"Цвет фурнитуры","multiline_mode":false,"tooltip":"Цвет москитной сетки","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"direction":{"synonym":"Направл. откр.","multiline_mode":false,"tooltip":"Направление открывания","choice_params":[{"name":"ref","path":["Левое","Правое"]}],"choice_groups_elm":"elm","type":{"types":["enm.open_directions"],"is_ref":true}},"h_ruch":{"synonym":"Высота ручки","multiline_mode":false,"tooltip":"Высота ручки в координатах контура (от габарита створки)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"fix_ruch":{"synonym":"Высота ручки фиксирована","multiline_mode":false,"tooltip":"Вычисляется по свойствам фурнитуры","type":{"types":["number"],"digits":6,"fraction_figits":0}},"is_rectangular":{"synonym":"Есть кривые","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"coordinates":{"name":"Координаты","synonym":"Координаты","tooltip":"Координаты элементов","fields":{"cnstr":{"synonym":"Конструкция","multiline_mode":false,"tooltip":"Номер конструкции (слоя)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"parent":{"synonym":"Родитель","multiline_mode":false,"tooltip":"Дополнительная иерархия. Например, номер стеклопакета для раскладки или внешняя примыкающая палка для створки или доборного профиля","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Номер элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm_type":{"synonym":"Тип элемента","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"path_data":{"synonym":"Путь SVG","multiline_mode":false,"tooltip":"Данные пути образующей в терминах svg или json элемента","type":{"types":["string"],"str_len":1000}},"x1":{"synonym":"X1","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y1":{"synonym":"Y1","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"x2":{"synonym":"X2","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y2":{"synonym":"Y2","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"r":{"synonym":"Радиус","multiline_mode":false,"tooltip":"Вспомогательное поле - частный случай криволинейного элемента","type":{"types":["number"],"digits":8,"fraction_figits":1}},"arc_ccw":{"synonym":"Против часов.","multiline_mode":false,"tooltip":"Вспомогательное поле - частный случай криволинейного элемента - дуга против часовой стрелки","type":{"types":["boolean"]}},"s":{"synonym":"Площадь","multiline_mode":false,"tooltip":"Вычисляемое","type":{"types":["number"],"digits":14,"fraction_figits":6}},"angle_hor":{"synonym":"Угол к горизонту","multiline_mode":false,"tooltip":"Вычисляется для прямой, проходящей через узлы","type":{"types":["number"],"digits":8,"fraction_figits":1}},"alp1":{"synonym":"Угол 1, °","multiline_mode":false,"tooltip":"Вычисляемое - угол реза в первом узле","type":{"types":["number"],"digits":8,"fraction_figits":1}},"alp2":{"synonym":"Угол 2, °","multiline_mode":false,"tooltip":"Вычисляемое - угол реза во втором узле","type":{"types":["number"],"digits":8,"fraction_figits":1}},"len":{"synonym":"Длина, м","multiline_mode":false,"tooltip":"Вычисляется по координатам и соединениям","type":{"types":["number"],"digits":8,"fraction_figits":1}},"pos":{"synonym":"Положение","multiline_mode":false,"tooltip":"Вычисляется во соседним элементам","choice_groups_elm":"elm","type":{"types":["enm.positions"],"is_ref":true}},"orientation":{"synonym":"Ориентация","multiline_mode":false,"tooltip":"Вычисляется по углу к горизонту","choice_groups_elm":"elm","type":{"types":["enm.orientations"],"is_ref":true}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"Вычисляется по вставке, геометрии и параметрам","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}}}},"inserts":{"name":"Вставки","synonym":"Вставки","tooltip":"Дополнительные вставки в изделие и контуры","fields":{"cnstr":{"synonym":"Конструкция","multiline_mode":false,"tooltip":"Номер конструкции (слоя)\nЕсли 0, вставка относится к изделию.\nЕсли >0 - к контуру\nЕсли <0 - к элементу","type":{"types":["number"],"digits":6,"fraction_figits":0}},"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_params":[{"name":"insert_type","path":["МоскитнаяСетка","Контур","Изделие"]},{"name":"available","path":true}],"choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}}}},"params":{"name":"Параметры","synonym":"Параметры","tooltip":"Параметры изделий и фурнитуры","fields":{"cnstr":{"synonym":"Конструкция","multiline_mode":false,"tooltip":"Если 0, параметр относится к изделию.\nЕсли >0 - к фурнитуре створки или контуру\nЕсли <0 - к элементу","type":{"types":["number"],"digits":6,"fraction_figits":0}},"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"Фильтр для дополнительных вставок","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"hide":{"synonym":"Скрыть","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"cnn_elmnts":{"name":"СоединяемыеЭлементы","synonym":"Соединяемые элементы","tooltip":"Соединения элементов","fields":{"elm1":{"synonym":"Элем 1","multiline_mode":false,"tooltip":"Номер первого элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"node1":{"synonym":"Узел 1","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":1}},"elm2":{"synonym":"Элем 2","multiline_mode":false,"tooltip":"Номер второго элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"node2":{"synonym":"Узел 2","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":1}},"cnn":{"synonym":"Соединение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.cnns"],"is_ref":true}},"aperture_len":{"synonym":"Длина шва/проема","multiline_mode":false,"tooltip":"Для соединений с заполнениями: длина светового проема примыкающего элемента","type":{"types":["number"],"digits":8,"fraction_figits":1}}}},"glass_specification":{"name":"СпецификацияЗаполнений","synonym":"Спецификация заполнений (ORDGLP)","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"gno":{"synonym":"Порядок","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_params":[{"name":"insert_type","path":["Заполнение","Элемент"]}],"choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}},"glasses":{"name":"Заполнения","synonym":"Заполнения","tooltip":"Стеклопакеты и сэндвичи - вычисляемая табличная часть (кеш) для упрощения отчетов","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"№ элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["string","cat.nom"],"str_len":50,"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics","string"],"is_ref":true,"str_len":50}},"width":{"synonym":"Ширина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"height":{"synonym":"Высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"s":{"synonym":"Площадь, м ²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"is_rectangular":{"synonym":"Прямоуг.","multiline_mode":false,"tooltip":"Прямоугольное заполнение","type":{"types":["boolean"]}},"is_sandwich":{"synonym":"Листовые","multiline_mode":false,"tooltip":"Непрозрачное заполнение - сэндвич","type":{"types":["boolean"]}},"thickness":{"synonym":"Толщина","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":2,"fraction_figits":0}},"coffer":{"synonym":"Камеры","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}}}},"specification":{"name":"Спецификация","compress":true,"synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Номер элемента, если значение > 0, либо номер конструкции, если значение < 0","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["specification","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"qty":{"synonym":"Количество (шт)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"len":{"synonym":"Длина/высота, м","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"width":{"synonym":"Ширина, м","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"alp1":{"synonym":"Угол 1, °","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"alp2":{"synonym":"Угол 2, °","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"totqty":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":4}},"totqty1":{"synonym":"Количество (+%)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":4}},"price":{"synonym":"Себест.план","multiline_mode":false,"tooltip":"Цена плановой себестоимости строки спецификации","type":{"types":["number"],"digits":15,"fraction_figits":4}},"amount":{"synonym":"Сумма себест.","multiline_mode":false,"tooltip":"Сумма плановой себестоимости строки спецификации","type":{"types":["number"],"digits":15,"fraction_figits":4}},"amount_marged":{"synonym":"Сумма с наценкой","multiline_mode":false,"tooltip":"Вклад строки спецификации в стоимость изделия для сценария КМАРЖ_В_СПЕЦИФИКАЦИИ","type":{"types":["number"],"digits":15,"fraction_figits":4}},"origin":{"synonym":"Происхождение","multiline_mode":false,"tooltip":"Ссылка на настройки построителя, из которых возникла строка спецификации","choice_groups_elm":"elm","type":{"types":["cat.inserts","number","cat.cnns","cat.furns"],"is_ref":true,"digits":6,"fraction_figits":0}},"changed":{"synonym":"Запись изменена","multiline_mode":false,"tooltip":"Запись изменена оператором (1) или добавлена корректировкой спецификации (-1)","type":{"types":["number"],"digits":1,"fraction_figits":0}},"dop":{"synonym":"Это акс. или визуализ.","multiline_mode":false,"tooltip":"Содержит (1) для строк аксессуаров и (-1) для строк с визуализацией","type":{"types":["number"],"digits":1,"fraction_figits":0}}}}},"cachable":"doc","form":{"obj":{"head":{" ":["name","owner","calc_order","product","leading_product","leading_elm"],"Дополнительно":["x","y","z","s","clr","weight","condition_products"]},"tabular_sections":{"specification":{"fields":["elm","nom","clr","characteristic","qty","len","width","s","alp1","alp2","totqty1","price","amount","amount_marged"],"headers":"Эл.,Номенклатура,Цвет,Характеристика,Колич.,Длина&nbsp;выс.,Ширина,Площадь,Угол1,Угол2,Колич++,Цена,Сумма,Сумма++","widths":"50,*,70,*,50,70,70,80,70,70,70,70,70,80","min_widths":"50,180,70,180,50,80,70,70,70,70,70,70,70,70","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na,na,na,na,na","types":"ron,ref,ref,ref,calck,calck,calck,calck,calck,calck,ron,ron,ron,ron"},"constructions":{"fields":["cnstr","parent","x","y","w","h","furn","clr_furn","direction","h_ruch"],"headers":"Констр.,Внешн.,Ширина,Высота,Ширина фурн.,Высота фурн.,Фурнитура,Цвет фурн.,Открывание,Высота ручки","widths":"50,50,70,70,70,70,*,80,80,70","min_widths":"50,50,70,70,70,70,120,80,80,70","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na","types":"ron,ron,ron,ron,ron,ron,ref,ro,ro,ro"},"coordinates":{"fields":["cnstr","parent","elm","elm_type","clr","inset","path_data","x1","y1","x2","y2","len","alp1","alp2","angle_hor","s","pos","orientation"],"headers":"Констр.,Внешн.,Эл.,Тип,Цвет,Вставка,Путь,x1,y1,x2,y2,Длина,Угол1,Угол2,Горизонт,Площадь,Положение,Ориентация","widths":"50,50,50,70,80,*,70,70,70,70,70,70,70,70,70,70,70,70","min_widths":"50,50,50,70,80,120,70,70,70,70,70,70,70,70,70,70,70,70","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na,na,na,na,na,na,na,na,na","types":"ron,ron,ron,ref,ref,ref,ro,ron,ron,ron,ron,ron,ron,ron,ron,ron,ro,ro"},"inserts":{"fields":["cnstr","inset","clr"],"headers":"Констр.,Вставка,Цвет","widths":"50,*,*","min_widths":"50,100,100","aligns":"","sortings":"na,na,na","types":"calck,ref,ref"},"cnn_elmnts":{"fields":["elm1","elm2","node1","node2","aperture_len","cnn"],"headers":"Эл1,Эл2,Узел1,Узел2,Длина,Соединение","widths":"50,50,50,50,160,*","min_widths":"50,50,50,50,100,200","aligns":"","sortings":"na,na,na,na,na,na","types":"calck,calck,ed,ed,calck,ref"},"params":{"fields":["cnstr","inset","param","value","hide"],"headers":"Констр.,Вставка,Параметр,Значение,Скрыть","widths":"50,80,*,*,50","min_widths":"50,70,200,200,50","aligns":"","sortings":"na,na,na,na,na","types":"ron,ro,ro,ro,ch"}},"tabular_sections_order":["specification","constructions","coordinates","inserts","cnn_elmnts","params"]}}},"price_groups":{"name":"ЦеновыеГруппы","splitted":false,"synonym":"Ценовые группы","illustration":"","obj_presentation":"Ценовая группа","list_presentation":"Ценовые группы","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"definition":{"synonym":"Описание","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":1024}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram"},"nom_groups":{"name":"ГруппыФинансовогоУчетаНоменклатуры","splitted":false,"synonym":"Группы фин. учета номенклатуры","illustration":"Перечень номенклатурных групп для учета затрат и укрупненного планирования продаж, закупок и производства","obj_presentation":"Номенклатурная группа","list_presentation":"Номенклатурные группы","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Раздел","multiline_mode":false,"tooltip":"","type":{"types":["cat.nom_groups"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"insert_bind":{"name":"ПривязкиВставок","splitted":false,"synonym":"Привязки вставок","illustration":"Замена регистра \"Корректировка спецификации\"","obj_presentation":"Привязка вставки","list_presentation":"Привязки вставок","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"key":{"synonym":"Ключ","multiline_mode":false,"tooltip":"Если указано, привязка распространяется только на продукцию, параметры окружения которой, совпадают с параметрами ключа параметров","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"captured":{"synonym":"Захвачен","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"editor":{"synonym":"Редактор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"zone":{"synonym":"Область","multiline_mode":false,"tooltip":"Разделитель (префикс) данных","type":{"types":["number"],"digits":6,"fraction_figits":0}},"zones":{"synonym":"Абоненты-получатели","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"production":{"name":"Продукция","synonym":"Продукция","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["cat.production_params","cat.nom"],"is_ref":true}}}},"inserts":{"name":"Вставки","synonym":"Вставки","tooltip":"Дополнительные вставки в изделие и контуры","fields":{"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_params":[{"name":"insert_type","path":["МоскитнаяСетка","Контур","Изделие","Водоотлив","Откос","Подоконник"]}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.inserts"],"is_ref":true}},"elm_type":{"synonym":"Контур","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Рама","Створка","Продукция"]}],"choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}}}}},"cachable":"ram"},"nonstandard_attributes":{"name":"ПризнакиНестандартов","splitted":false,"synonym":"Признаки нестандартов","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"crooked":{"synonym":"Кривой","multiline_mode":false,"tooltip":"Есть гнутые или наклонные элементы","type":{"types":["boolean"]}},"colored":{"synonym":"Цветной","multiline_mode":false,"tooltip":"Есть покраска или ламинация","type":{"types":["boolean"]}},"lay":{"synonym":"Раскладка","multiline_mode":false,"tooltip":"Содержит стеклопакеты с раскладкой","type":{"types":["boolean"]}},"made_to_order":{"synonym":"Заказной","multiline_mode":false,"tooltip":"Специальный материал под заказ","type":{"types":["boolean"]}},"packing":{"synonym":"Упаковка","multiline_mode":false,"tooltip":"Дополнительная услуга","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"doc"},"delivery_directions":{"name":"НаправленияДоставки","splitted":false,"synonym":"Направления доставки","illustration":"Объединяет районы, территории или подразделения продаж","obj_presentation":"Направление доставки","list_presentation":"Направления доставки","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"composition":{"name":"Состав","synonym":"Состав","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.delivery_areas","cat.divisions"],"is_ref":true}}}}},"cachable":"doc"}},"dp":{"scheme_settings":{"name":"scheme_settings","synonym":"Варианты настроек","fields":{"scheme":{"synonym":"Текущая настройка","tooltip":"Текущий вариант настроек","mandatory":true,"type":{"types":["cat.scheme_settings"],"is_ref":true}}}},"builder_price":{"name":"builder_price","splitted":false,"synonym":"Цены номенклатуры","illustration":"Метаданные карточки цен номенклатуры","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"department":{"synonym":"Офис продаж","multiline_mode":false,"tooltip":"Подразделение продаж","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}}},"tabular_sections":{"goods":{"name":"Товары","synonym":"Цены","tooltip":"","fields":{"price_type":{"synonym":"Тип Цен","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"date":{"synonym":"Дата","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"nom_characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"currency":{"synonym":"Валюта","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.currencies"],"is_ref":true}}}}}},"builder_size":{"name":"builder_size","splitted":false,"synonym":"Размерная линия","illustration":"Метаданные инструмента ruler","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"offset":{"synonym":"Отступ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"angle":{"synonym":"Поворот","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"fix_angle":{"synonym":"Фикс. угол","multiline_mode":false,"tooltip":"Направлять размерную линию под заданным углом, вместо кратчайшего пути между точками","type":{"types":["boolean"]}},"align":{"synonym":"Выравнивание","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.text_aligns"],"is_ref":true}},"hide_c1":{"synonym":"Скрыть выноску1","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"hide_c2":{"synonym":"Скрыть выноску2","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"hide_line":{"synonym":"Скрыть линию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"text":{"synonym":"Текст","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"font_family":{"synonym":"Шрифт","multiline_mode":true,"tooltip":"Имя шрифта","type":{"types":["string"],"str_len":50}},"bold":{"synonym":"Жирный","multiline_mode":true,"tooltip":"","type":{"types":["boolean"]}},"font_size":{"synonym":"Размер","multiline_mode":true,"tooltip":"Размер шрифта","type":{"types":["number"],"digits":3,"fraction_figits":0}}},"tabular_sections":{}},"buyers_order":{"name":"ЗаказПокупателя","splitted":false,"synonym":"Рисовалка","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"sys":{"synonym":"Система","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.production_params"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"len":{"synonym":"Длина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"height":{"synonym":"Высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"depth":{"synonym":"Глубина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"quantity":{"synonym":"Колич., шт","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":150}},"first_cost":{"synonym":"Себест. ед.","multiline_mode":false,"tooltip":"Плановая себестоимость единицы продукции","type":{"types":["number"],"digits":15,"fraction_figits":2}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Скидка %","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount_percent_internal":{"synonym":"Скидка внутр. %","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount":{"synonym":"Скидка","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"shipping_date":{"synonym":"Дата доставки","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"client_number":{"synonym":"Номер клиента","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"inn":{"synonym":"ИНН Клиента","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"shipping_address":{"synonym":"Адрес доставки","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"phone":{"synonym":"Телефон","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":100}},"price_internal":{"synonym":"Цена внутр.","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_internal":{"synonym":"Сумма внутр.","multiline_mode":false,"tooltip":"Сумма внутренней реализации (холдинг) или внешней (от дилера конечному клиенту)","type":{"types":["number"],"digits":15,"fraction_figits":2}},"base_block":{"synonym":"Типовой блок","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}}},"tabular_sections":{"product_params":{"name":"ПараметрыИзделия","synonym":"Параметры продукции","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["product_params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["product_params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"hide":{"synonym":"Скрыть","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"production":{"name":"Продукция","synonym":"Продукция","tooltip":"","fields":{"inset":{"synonym":"Продукция","multiline_mode":false,"tooltip":"","choice_params":[{"name":"insert_type","path":["Изделие","МоскитнаяСетка","Подоконник","Откос","Заполнение","Монтаж","Доставка"]},{"name":"available","path":true}],"choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["production","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"len":{"synonym":"Длина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"height":{"synonym":"Высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"depth":{"synonym":"Глубина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"Площадь изделия","type":{"types":["number"],"digits":10,"fraction_figits":4}},"quantity":{"synonym":"Количество, шт","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":150}},"first_cost":{"synonym":"Себест. ед.","multiline_mode":false,"tooltip":"Плановая себестоимость единицы продукции","type":{"types":["number"],"digits":15,"fraction_figits":2}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Скидка %","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"ordn":{"synonym":"Ведущая продукция","multiline_mode":false,"tooltip":"ссылка на продукциию, к которой относится материал","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"qty":{"synonym":"Количество, шт","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}}}},"glass_specification":{"name":"СпецификацияЗаполнений","synonym":"Спецификация заполнений (ORDGLP)","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"sorting":{"synonym":"Порядок","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}}}},"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"dop":{"synonym":"Доп","multiline_mode":false,"tooltip":"Элемент дополнительной спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура/Набор","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_set","path":true}],"choice_groups_elm":"elm","type":{"types":["cat.inserts","cat.nom","cat.furns"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"handle_height_base":{"synonym":"Выс. ручк.","multiline_mode":false,"tooltip":"Стандартная высота ручки","type":{"types":["number"],"digits":6,"fraction_figits":0}},"handle_height_min":{"synonym":"Выс. ручк. min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"handle_height_max":{"synonym":"Выс. ручк. max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"contraction":{"synonym":"Укорочение","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"contraction_option":{"synonym":"Укороч. от","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.contraction_options"],"is_ref":true}},"coefficient":{"synonym":"Коэффициент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"flap_weight_min":{"synonym":"Масса створки min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"flap_weight_max":{"synonym":"Масса створки max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"side":{"synonym":"Сторона","multiline_mode":false,"tooltip":"Сторона фурнитуры, на которую устанавливается элемент или на которой выполняется операция","type":{"types":["number"],"digits":1,"fraction_figits":0}},"cnn_side":{"synonym":"Сторона соед.","multiline_mode":false,"tooltip":"Фильтр: выполнять операцию, если примыкающий элемент примыкает с заданной стороны","choice_groups_elm":"elm","type":{"types":["enm.cnn_sides"],"is_ref":true}},"offset_option":{"synonym":"Смещ. от","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.offset_options"],"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"transfer_option":{"synonym":"Перенос опер.","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.transfer_operations_options"],"is_ref":true}},"is_main_specification_row":{"synonym":"Это строка основной спецификации","multiline_mode":false,"tooltip":"Интерфейсное поле (доп=0) для редактирования без кода","type":{"types":["boolean"]}},"is_set_row":{"synonym":"Это строка набора","multiline_mode":false,"tooltip":"Интерфейсное поле (Номенклатура=Фурнитура) для редактирования без кода","type":{"types":["number"],"digits":1,"fraction_figits":0}},"is_procedure_row":{"synonym":"Это строка операции","multiline_mode":false,"tooltip":"Интерфейсное поле (Номенклатура=Номенклатура И ТипНоменклатуры = Техоперация) для редактирования без кода","type":{"types":["number"],"digits":1,"fraction_figits":0}},"is_order_row":{"synonym":"Это строка заказа","multiline_mode":false,"tooltip":"Если \"Истина\", строка будет добавлена в заказ, а не в спецификацию текущей продукции","type":{"types":["boolean"]}},"origin":{"synonym":"Происхождение","multiline_mode":false,"tooltip":"Ссылка на настройки построителя, из которых возникла строка спецификации","choice_groups_elm":"elm","type":{"types":["cat.inserts","number","cat.cnns","cat.furns"],"is_ref":true,"digits":6,"fraction_figits":0}}}},"charges_discounts":{"name":"СкидкиНаценки","synonym":"Скидки наценки","tooltip":"","fields":{"nom_kind":{"synonym":"Группа","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_kinds"],"is_ref":true}},"discount_percent":{"synonym":"Скидка %","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}}}}},"form":{"obj":{"head":{" ":["calc_order"]},"tabular_sections":{"production":{"fields":["row","inset","clr","len","height","depth","s","quantity","note"],"headers":"№,Продукция,Цвет,Длина,Высота,Глубина,Площадь,Колич.,Комментарий","widths":"40,*,120,80,75,75,75,75,*","min_widths":"30,200,100,70,70,70,70,70,80","aligns":"center,left,left,right,right,right,right,right,left","sortings":"na,na,na,na,na,na,na,na,na","types":"cntr,ref,ref,calck,calck,calck,calck,calck,txt"},"inserts":{"fields":["inset","clr"],"headers":"Вставка,Цвет","widths":"*,*","min_widths":"90,90","aligns":"","sortings":"na,na","types":"ref,ref"}}}}},"builder_lay_impost":{"name":"builder_lay_impost","splitted":false,"synonym":"Импосты и раскладки","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"elm_type":{"synonym":"Тип элемента","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Импост","Раскладка","Рама"]}],"choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"split":{"synonym":"Тип деления","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["ДелениеГоризонтальных","ДелениеВертикальных","КрестВСтык","КрестПересечение"]}],"choice_groups_elm":"elm","type":{"types":["enm.lay_split_types"],"is_ref":true}},"elm_by_y":{"synonym":"Элементов","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":2,"fraction_figits":0}},"step_by_y":{"synonym":"Шаг","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":4,"fraction_figits":0}},"align_by_y":{"synonym":"Опора","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Низ","Верх","Центр"]}],"choice_groups_elm":"elm","type":{"types":["enm.positions"],"is_ref":true}},"inset_by_y":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"elm_by_x":{"synonym":"Элементов","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":2,"fraction_figits":0}},"step_by_x":{"synonym":"Шаг","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":4,"fraction_figits":0}},"align_by_x":{"synonym":"Опора","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Лев","Прав","Центр"]}],"choice_groups_elm":"elm","type":{"types":["enm.positions"],"is_ref":true}},"inset_by_x":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"w":{"synonym":"Ширина","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"h":{"synonym":"Высота","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}}},"tabular_sections":{},"form":{"obj":{"head":{" ":["elm_type","clr","split"],"Деление Y":["inset_by_y","elm_by_y","step_by_y","align_by_y"],"Деление X":["inset_by_x","elm_by_x","step_by_x","align_by_x"],"Габариты":["w","h"]}}}},"builder_pen":{"name":"builder_pen","splitted":false,"synonym":"Рисование","illustration":"Метаданные инструмента pen (рисование профилей)","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"elm_type":{"synonym":"Тип элемента","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Рама","Импост","Раскладка","Добор","Соединитель","Водоотлив","Линия"]}],"choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}},"inset":{"synonym":"Материал профиля","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"bind_generatrix":{"synonym":"Магнит к профилю","multiline_mode":true,"tooltip":"","type":{"types":["boolean"]}},"bind_node":{"synonym":"Магнит к узлам","multiline_mode":true,"tooltip":"","type":{"types":["boolean"]}}},"tabular_sections":{}},"builder_text":{"name":"builder_text","splitted":false,"synonym":"Произвольный текст","illustration":"Метаданные инструмента text","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"text":{"synonym":"Текст","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"font_family":{"synonym":"Шрифт","multiline_mode":true,"tooltip":"Имя шрифта","type":{"types":["string"],"str_len":50}},"bold":{"synonym":"Жирный","multiline_mode":true,"tooltip":"","type":{"types":["boolean"]}},"font_size":{"synonym":"Размер","multiline_mode":true,"tooltip":"Размер шрифта","type":{"types":["number"],"digits":3,"fraction_figits":0}},"angle":{"synonym":"Поворот","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"align":{"synonym":"Выравнивание","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.text_aligns"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"x":{"synonym":"X коорд.","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y":{"synonym":"Y коорд.","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}}},"tabular_sections":{}},"builder_coordinates":{"name":"builder_coordinates","splitted":false,"synonym":"Таблица координат","illustration":"Метаданные инструмента coordinates","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"bind":{"synonym":"Приязка координат","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["b","e"]}],"choice_groups_elm":"elm","type":{"types":["enm.bind_coordinates"],"is_ref":true}},"path":{"synonym":"Путь","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["generatrix","inner","outer"]}],"choice_groups_elm":"elm","type":{"types":["enm.path_kind"],"is_ref":true}},"offset":{"synonym":"Отступ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"step":{"synonym":"Шаг","multiline_mode":false,"tooltip":"Шаг (расчет по точкам)","type":{"types":["number"],"digits":10,"fraction_figits":3}},"step_angle":{"synonym":"Угол","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}}},"tabular_sections":{"coordinates":{"name":"Координаты","synonym":"Координаты","tooltip":"","fields":{"x":{"synonym":"X","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y":{"synonym":"Y","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}}}}}}},"doc":{"registers_correction":{"name":"КорректировкаРегистров","splitted":false,"synonym":"Корректировка регистров","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"original_doc_type":{"synonym":"Тип исходного документа","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"Произвольный комментарий. ","type":{"types":["string"],"str_len":0}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"Для целей RLS","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}}},"tabular_sections":{"registers_table":{"name":"ТаблицаРегистров","synonym":"Таблица регистров","tooltip":"","fields":{"Имя":{"synonym":"Имя","multiline_mode":false,"tooltip":"Имя регистра, которому скорректированы записи.","mandatory":true,"type":{"types":["string"],"str_len":255}}}}},"cachable":"doc"},"purchase":{"name":"ПоступлениеТоваровУслуг","splitted":false,"synonym":"Поступление товаров и услуг","illustration":"Документы отражают поступление товаров и услуг","obj_presentation":"Поступление товаров и услуг","list_presentation":"Поступление товаров и услуг","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_supplier","path":true}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"warehouse":{"synonym":"Склад","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.stores"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"goods":{"name":"Товары","synonym":"Товары","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"Услуга","path":false},{"name":"set","path":false}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"unit":{"synonym":"Единица измерения","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["goods","nom"]}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_units"],"is_ref":true}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"trans":{"synonym":"Заказ резерв","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}}}},"services":{"name":"Услуги","synonym":"Услуги","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"Услуга","path":true},{"name":"set","path":false}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"content":{"synonym":"Содержание услуги, доп. сведения","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["string"],"str_len":0}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"nom_group":{"synonym":"Номенклатурная группа","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_groups"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"cost_item":{"synonym":"Статья затрат","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":10}},"project":{"synonym":"Проект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.projects"],"is_ref":true}},"buyers_order":{"synonym":"Заказ затрат","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc"},"work_centers_task":{"name":"НарядРЦ","splitted":false,"synonym":"Задание рабочему центру","illustration":"","obj_presentation":"Наряд","list_presentation":"Задания рабочим центрам","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"key":{"synonym":"Ключ","multiline_mode":false,"tooltip":"Участок производства","choice_params":[{"name":"applying","path":"РабочийЦентр"}],"choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"recipient":{"synonym":"Получатель","multiline_mode":false,"tooltip":"СГП или след. передел","choice_params":[{"name":"applying","path":"РабочийЦентр"}],"choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"biz_cuts":{"synonym":"Деловая обрезь","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.use_cut"],"is_ref":true}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"planning":{"name":"Планирование","synonym":"Планирование","tooltip":"","fields":{"obj":{"synonym":"Объект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"specimen":{"synonym":"Экземпляр","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"power":{"synonym":"Мощность","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}}}},"demand":{"name":"Потребность","synonym":"Материалы","tooltip":"Потребность в материалах","fields":{"production":{"synonym":"Продукция","multiline_mode":false,"tooltip":"Ссылка на характеристику продукции или объект планирования. Указывает, к чему относится материал текущей строки","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"specimen":{"synonym":"Экземпляр","multiline_mode":false,"tooltip":"Номер экземпляра","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Номер элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"Номенклатура потребности. По умолчанию, совпадает с номенклатурой спецификации, но может содержать аналог","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"Характеристика потребности. По умолчанию, совпадает с характеристикой спецификации, но может содержать аналог","choice_links":[{"name":["selection","owner"],"path":["demand","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"final_balance":{"synonym":"Остаток потребности","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":3}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":3}},"from_cut":{"synonym":"Из обрези","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":3}},"close":{"synonym":"Закрыть","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"cuts":{"name":"Обрезь","synonym":"Обрезь","tooltip":"Приход и расход деловой обрези","fields":{"record_kind":{"synonym":"Вид движения","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.debit_credit_kinds"],"is_ref":true}},"stick":{"synonym":"№ хлыста","multiline_mode":false,"tooltip":"№ листа (хлыста, заготовки)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"pair":{"synonym":"№ пары","multiline_mode":false,"tooltip":"№ парной заготовки","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["cuts","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"len":{"synonym":"Длина","multiline_mode":false,"tooltip":"длина в мм","type":{"types":["number"],"digits":8,"fraction_figits":1}},"width":{"synonym":"Ширина","multiline_mode":false,"tooltip":"ширина в мм","type":{"types":["number"],"digits":8,"fraction_figits":1}},"x":{"synonym":"Координата X","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y":{"synonym":"Координата Y","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"Количество в единицах хранения","type":{"types":["number"],"digits":8,"fraction_figits":1}},"cell":{"synonym":"Ячейка","multiline_mode":false,"tooltip":"№ ячейки (откуда брать заготовку или куда помещать деловой обрезок)","type":{"types":["string"],"str_len":9}}}},"cutting":{"name":"Раскрой","synonym":"Раскрой","tooltip":"","fields":{"production":{"synonym":"Продукция","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"specimen":{"synonym":"Экземпляр","multiline_mode":false,"tooltip":"Номер экземпляра","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Номер элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["cutting","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"len":{"synonym":"Длина","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"width":{"synonym":"Ширина","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"stick":{"synonym":"№ хлыста","multiline_mode":false,"tooltip":"№ листа (заготовки), на котором размещать изделие","type":{"types":["number"],"digits":6,"fraction_figits":0}},"pair":{"synonym":"№ пары","multiline_mode":false,"tooltip":"№ парного изделия","type":{"types":["number"],"digits":6,"fraction_figits":0}},"orientation":{"synonym":"Ориентация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.orientations"],"is_ref":true}},"elm_type":{"synonym":"Тип элемента","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}},"alp1":{"synonym":"Угол реза1","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":2}},"alp2":{"synonym":"Угол реза2","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":2}},"cell":{"synonym":"Ячейка","multiline_mode":false,"tooltip":"№ ячейки (куда помещать изделие)","type":{"types":["string"],"str_len":9}},"part":{"synonym":"Партия","multiline_mode":false,"tooltip":"Партия (такт, группа раскроя)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"x":{"synonym":"Координата X","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y":{"synonym":"Y","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"rotated":{"synonym":"Поворот","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"nonstandard":{"synonym":"Это нестандарт","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}}},"cachable":"doc"},"calc_order":{"name":"Расчет","splitted":false,"synonym":"Расчет-заказ","illustration":"Аналог заказа покупателя типовых конфигураций.\nСодержит инструменты для формирования спецификаций и подготовки данных производства и диспетчеризации","obj_presentation":"Расчет-заказ","list_presentation":"Расчеты-заказы","input_by_string":["number_doc","number_internal"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"number_internal":{"synonym":"Номер внутр","multiline_mode":false,"tooltip":"Дополнительный (внутренний) номер документа","type":{"types":["string"],"str_len":20}},"project":{"synonym":"Проект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.projects"],"is_ref":true}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_folder","path":false}],"choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_buyer","path":true},{"name":"is_folder","path":false}],"choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"client_of_dealer":{"synonym":"Клиент дилера","multiline_mode":false,"tooltip":"Наименование конечного клиента в дилерских заказах","type":{"types":["string"],"str_len":255}},"contract":{"synonym":"Договор контрагента","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["cat.contracts"],"is_ref":true}},"bank_account":{"synonym":"Банковский счет","multiline_mode":false,"tooltip":"Банковский счет организации, на который планируется поступление денежных средств","choice_links":[{"name":["selection","owner"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["cat.organization_bank_accounts"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"Дополнительная информация","type":{"types":["string"],"str_len":255}},"manager":{"synonym":"Менеджер","multiline_mode":false,"tooltip":"Менеджер, оформивший заказ","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"leading_manager":{"synonym":"Ведущий менеджер","multiline_mode":false,"tooltip":"Куратор, ведущий менеджер","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"department":{"synonym":"Офис продаж","multiline_mode":false,"tooltip":"Подразделение продаж","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"warehouse":{"synonym":"Склад","multiline_mode":false,"tooltip":"Склад отгрузки товаров по заказу","type":{"types":["cat.stores"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_operation":{"synonym":"Сумма упр","multiline_mode":false,"tooltip":"Сумма в валюте управленческого учета","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_internal":{"synonym":"Сумма внутр.","multiline_mode":false,"tooltip":"Сумма внутренней реализации","type":{"types":["number"],"digits":15,"fraction_figits":2}},"accessory_characteristic":{"synonym":"Характеристика аксессуаров","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"sys_profile":{"synonym":"Профиль","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"sys_furn":{"synonym":"Фурнитура","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"phone":{"synonym":"Телефон","multiline_mode":false,"tooltip":"Телефон по адресу доставки","type":{"types":["string"],"str_len":100}},"delivery_area":{"synonym":"Район","multiline_mode":false,"tooltip":"Район (зона, направление) доставки для группировки при планировании и оптимизации маршрута геокодером","choice_groups_elm":"elm","type":{"types":["cat.delivery_areas"],"is_ref":true}},"shipping_address":{"synonym":"Адрес доставки","multiline_mode":false,"tooltip":"Адрес доставки изделий заказа","type":{"types":["string"],"str_len":255}},"coordinates":{"synonym":"Координаты","multiline_mode":false,"tooltip":"Гео - координаты адреса доставки","type":{"types":["string"],"str_len":50}},"address_fields":{"synonym":"Значения полей адреса","multiline_mode":false,"tooltip":"Служебный реквизит","type":{"types":["string"],"str_len":0}},"difficult":{"synonym":"Сложный","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"vat_consider":{"synonym":"Учитывать НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"vat_included":{"synonym":"Сумма включает НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"settlements_course":{"synonym":"Курс взаиморасчетов","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"settlements_multiplicity":{"synonym":"Кратность взаиморасчетов","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":0}},"extra_charge_external":{"synonym":"Наценка внешн.","multiline_mode":false,"tooltip":"Наценка внешней (дилерской) продажи по отношению к цене производителя, %.","type":{"types":["number"],"digits":5,"fraction_figits":2}},"obj_delivery_state":{"synonym":"Этап согласования","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Подтвержден","Отклонен","Архив","Шаблон","Черновик"]}],"choice_groups_elm":"elm","type":{"types":["enm.obj_delivery_states"],"is_ref":true}},"category":{"synonym":"Категория заказа","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.order_categories"],"is_ref":true}}},"tabular_sections":{"production":{"name":"Продукция","synonym":"Продукция","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["production","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"unit":{"synonym":"Ед.","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["production","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.nom_units"],"is_ref":true}},"qty":{"synonym":"Количество, шт","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"len":{"synonym":"Длина/высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"width":{"synonym":"Ширина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"Площадь изделия","type":{"types":["number"],"digits":10,"fraction_figits":6}},"first_cost":{"synonym":"Себест. ед.","multiline_mode":false,"tooltip":"Плановая себестоимость единицы продукции","type":{"types":["number"],"digits":15,"fraction_figits":4}},"marginality":{"synonym":"К. марж","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":3}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Скидка %","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount_percent_internal":{"synonym":"Скидка внутр. %","multiline_mode":false,"tooltip":"Процент скидки для внутренней перепродажи (холдинг) или внешней (дилеры)","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount":{"synonym":"Скидка","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"margin":{"synonym":"Маржа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"price_internal":{"synonym":"Цена внутр.","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_internal":{"synonym":"Сумма внутр.","multiline_mode":false,"tooltip":"Сумма внутренней реализации (холдинг) или внешней (от дилера конечному клиенту)","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"ordn":{"synonym":"Ведущая продукция","multiline_mode":false,"tooltip":"ссылка на продукциию, к которой относится материал","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"changed":{"synonym":"Запись изменена","multiline_mode":false,"tooltip":"Запись изменена оператором (1, -2) или добавлена корректировкой спецификации (-1)","type":{"types":["number"],"digits":1,"fraction_figits":0}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}},"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"Хранение контактной информации (адреса, веб-страницы, номера телефонов и др.)","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0}},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100}},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100}},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100}},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20}},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20}}}},"planning":{"name":"Планирование","synonym":"Планирование","tooltip":"","fields":{"phase":{"synonym":"Фаза","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.planning_phases"],"is_ref":true}},"date":{"synonym":"Дата","multiline_mode":false,"tooltip":"Плановая дата доставки или начала операции","type":{"types":["date"],"date_part":"date"}},"key":{"synonym":"Ключ","multiline_mode":false,"tooltip":"Ключ по графику доставок","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"obj":{"synonym":"Объект","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","calc_order"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"specimen":{"synonym":"Экземпляр","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"power":{"synonym":"Мощность","multiline_mode":false,"tooltip":"Трудоемкость или время операции","type":{"types":["number"],"digits":8,"fraction_figits":1}}}}},"cachable":"doc","form":{"selection":{"fields":["posted","date","number_doc","number_internal","partner","client_of_dealer","manager","doc_amount","obj_delivery_state","note"],"cols":[{"id":"date","width":"160","type":"ro","align":"left","sort":"server","caption":"Дата"},{"id":"number_doc","width":"120","type":"ro","align":"left","sort":"na","caption":"№"},{"id":"number_internal","width":"160","type":"ro","align":"left","sort":"na","caption":"№ внутр"},{"id":"partner","width":"180","type":"ro","align":"left","sort":"na","caption":"Контрагент"},{"id":"client_of_dealer","width":"*","type":"ro","align":"left","sort":"na","caption":"Клиент"},{"id":"manager","width":"180","type":"ro","align":"left","sort":"na","caption":"Автор"},{"id":"doc_amount","width":"120","type":"ron","align":"right","sort":"na","caption":"Сумма"},{"id":"obj_delivery_state","width":"120","type":"ro","align":"left","sort":"na","caption":"Статус"},{"id":"note","width":"*","type":"ro","align":"left","sort":"na","caption":"Комментарий"}]},"obj":{"head":{" ":["name","owner","calc_order","product","leading_product","leading_elm"]},"tabular_sections":{"production":{"fields":["row","nom","characteristic","note","qty","len","width","s","quantity","unit","discount_percent","price","amount","discount_percent_internal","price_internal","amount_internal"],"aligns":"center,left,left,left,right,right,right,right,right,left,right,right,right,right,right,right","sortings":"na,na,na,na,na,na,na,na,na,na,na,na,na,na,na,na","types":""},"planning":{"fields":["obj","elm","specimen","key","date","performance"],"aligns":"left,right,right,left,left,right","sortings":"na,na,na,na,na,na","headers":"Продукция,Элемент,Экземпляр,Ключ,Дата,Мощность","widths":"*,70,70,*,120,90","min_widths":"180,60,60,180,110,80","types":"ref,calck,calck,ref,dhxCalendar,calck"}},"tabular_sections_order":["production","planning"]}}},"credit_card_order":{"name":"ОплатаОтПокупателяПлатежнойКартой","splitted":false,"synonym":"Оплата от покупателя платежной картой","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент, подотчетник, касса ККМ","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc","form":{"selection":{"fields":["posted","date","number_doc","organization","partner","doc_amount","note"],"cols":[{"id":"date","width":"160","type":"ro","align":"left","sort":"server","caption":"Дата"},{"id":"number_doc","width":"120","type":"ro","align":"left","sort":"na","caption":"№"},{"id":"organization","width":"*","type":"ro","align":"left","sort":"na","caption":"Организация"},{"id":"partner","width":"*","type":"ro","align":"left","sort":"na","caption":"Контрагент"},{"id":"doc_amount","width":"160","type":"ro","align":"left","sort":"na","caption":"Сумма"},{"id":"note","width":"*","type":"ro","align":"left","sort":"na","caption":"Комментарий"}]},"obj":{"head":{" ":[{"id":"number_doc","path":"o.number_doc","type":"ro","synonym":"Номер"},"date","organization","partner","department","responsible","note",{"id":"doc_amount","path":"o.doc_amount","type":"ro","synonym":"Сумма документа"}]},"tabular_sections":{"payment_details":{"fields":["row","cash_flow_article","trans","amount"],"headers":"№,Статья,Заказ,Сумма","aligns":"center,left,left,right","sortings":"na,na,na,na","types":"cntr,ref,ref,calck","widths":"50,*,*,120","min_widths":"40,140,140,80"}}}}},"work_centers_performance":{"name":"МощностиРЦ","splitted":false,"synonym":"Мощности рабочих центров","illustration":"","obj_presentation":"Мощность рабочих центров","list_presentation":"Мощности рабочих центров","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"start_date":{"synonym":"Дата начала","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"expiration_date":{"synonym":"Дата окончания","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"planning":{"name":"Планирование","synonym":"Планирование","tooltip":"","fields":{"date":{"synonym":"Дата","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"key":{"synonym":"Ключ","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"power":{"synonym":"Мощность","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}}}}},"cachable":"doc"},"debit_bank_order":{"name":"ПлатежноеПоручениеВходящее","splitted":false,"synonym":"Платежное поручение входящее","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Плательщик","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc","form":{"selection":{"fields":["posted","date","number_doc","organization","partner","doc_amount","note"],"cols":[{"id":"date","width":"160","type":"ro","align":"left","sort":"server","caption":"Дата"},{"id":"number_doc","width":"120","type":"ro","align":"left","sort":"na","caption":"№"},{"id":"organization","width":"*","type":"ro","align":"left","sort":"na","caption":"Организация"},{"id":"partner","width":"*","type":"ro","align":"left","sort":"na","caption":"Контрагент"},{"id":"doc_amount","width":"160","type":"ro","align":"left","sort":"na","caption":"Сумма"},{"id":"note","width":"*","type":"ro","align":"left","sort":"na","caption":"Комментарий"}]},"obj":{"head":{" ":[{"id":"number_doc","path":"o.number_doc","type":"ro","synonym":"Номер"},"date","organization","partner","department","responsible","note",{"id":"doc_amount","path":"o.doc_amount","type":"ro","synonym":"Сумма документа"}]},"tabular_sections":{"payment_details":{"fields":["row","cash_flow_article","trans","amount"],"headers":"№,Статья,Заказ,Сумма","aligns":"center,left,left,right","sortings":"na,na,na,na","types":"cntr,ref,ref,calck","widths":"50,*,*,120","min_widths":"40,140,140,80"}}}}},"credit_bank_order":{"name":"ПлатежноеПоручениеИсходящее","splitted":false,"synonym":"Платежное поручение исходящее","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Получатель","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc"},"debit_cash_order":{"name":"ПриходныйКассовыйОрдер","splitted":false,"synonym":"Приходный кассовый ордер","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент, подотчетник, касса ККМ","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals","cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"cashbox":{"synonym":"Касса","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["cat.cashboxes"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc","form":{"selection":{"fields":["posted","date","number_doc","organization","partner","doc_amount","note"],"cols":[{"id":"date","width":"160","type":"ro","align":"left","sort":"server","caption":"Дата"},{"id":"number_doc","width":"120","type":"ro","align":"left","sort":"na","caption":"№"},{"id":"organization","width":"*","type":"ro","align":"left","sort":"na","caption":"Организация"},{"id":"partner","width":"*","type":"ro","align":"left","sort":"na","caption":"Контрагент"},{"id":"doc_amount","width":"160","type":"ro","align":"left","sort":"na","caption":"Сумма"},{"id":"note","width":"*","type":"ro","align":"left","sort":"na","caption":"Комментарий"}]},"obj":{"head":{" ":[{"id":"number_doc","path":"o.number_doc","type":"ro","synonym":"Номер"},"date","organization","partner","department","cashbox","responsible","note",{"id":"doc_amount","path":"o.doc_amount","type":"ro","synonym":"Сумма документа"}]},"tabular_sections":{"payment_details":{"fields":["row","cash_flow_article","trans","amount"],"headers":"№,Статья,Заказ,Сумма","aligns":"center,left,left,right","sortings":"na,na,na,na","types":"cntr,ref,ref,calck","widths":"50,*,*,120","min_widths":"40,140,140,80"}}}}},"credit_cash_order":{"name":"РасходныйКассовыйОрдер","splitted":false,"synonym":"Расходный кассовый ордер","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент, подотчетник, Касса ККМ","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals","cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"cashbox":{"synonym":"Касса","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["cat.cashboxes"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc"},"selling":{"name":"РеализацияТоваровУслуг","splitted":false,"synonym":"Реализация товаров и услуг","illustration":"Документы отражают факт реализации (отгрузки) товаров","obj_presentation":"Реализация товаров и услуг","list_presentation":"Реализация товаров и услуг","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_buyer","path":true}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"warehouse":{"synonym":"Склад","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.stores"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"goods":{"name":"Товары","synonym":"Товары","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"Услуга","path":false},{"name":"set","path":false}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"unit":{"synonym":"Единица измерения","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["goods","nom"]}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_units"],"is_ref":true}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Процент скидки или наценки","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}}}},"services":{"name":"Услуги","synonym":"Услуги","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"Услуга","path":true},{"name":"set","path":false}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"content":{"synonym":"Содержание услуги, доп. сведения","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["string"],"str_len":0}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Процент скидки или наценки","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc","form":{"selection":{"fields":["posted","date","number_doc","organization","partner","doc_amount","note"],"cols":[{"id":"date","width":"160","type":"ro","align":"left","sort":"server","caption":"Дата"},{"id":"number_doc","width":"120","type":"ro","align":"left","sort":"na","caption":"№"},{"id":"organization","width":"*","type":"ro","align":"left","sort":"na","caption":"Организация"},{"id":"partner","width":"*","type":"ro","align":"left","sort":"na","caption":"Контрагент"},{"id":"doc_amount","width":"160","type":"ro","align":"left","sort":"na","caption":"Сумма"},{"id":"note","width":"*","type":"ro","align":"left","sort":"na","caption":"Комментарий"}]},"obj":{"head":{" ":[{"id":"number_doc","path":"o.number_doc","type":"ro","synonym":"Номер"},"date","organization","partner","department","warehouse","responsible","note",{"id":"doc_amount","path":"o.doc_amount","type":"ro","synonym":"Сумма документа"}]},"tabular_sections":{"goods":{"fields":["row","nom","quantity","unit","price","discount_percent","vat_rate","amount","vat_amount","trans"],"headers":"№,Номенклатура,Количество,Ед.,Цена,Скидка,Ставка НДС,Сумма,Сумма НДС,Заказ","aligns":"center,left,right,left,right,right,left,right,right,left","sortings":"na,na,na,na,na,na,na,na,na,na","types":"cntr,ref,calck,ref,calck,calck,ref,calck,ron,ref","widths":"50,*,100,100,100,100,100,100,100,*","min_widths":"40,160,80,80,80,80,80,80,80,80,160"}}}}},"nom_prices_setup":{"name":"УстановкаЦенНоменклатуры","splitted":false,"synonym":"Установка цен номенклатуры","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"price_type":{"synonym":"Тип Цен","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"currency":{"synonym":"Валюта","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"goods":{"name":"Товары","synonym":"Товары","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"nom_characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["goods","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"price_type":{"synonym":"Тип Цен","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_prices_types"],"is_ref":true}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":4}}}}},"cachable":"doc","form":{"selection":{"fields":["posted","date","number_doc","price_type","currency","note"],"cols":[{"id":"date","width":"160","type":"ro","align":"left","sort":"server","caption":"Дата"},{"id":"number_doc","width":"120","type":"ro","align":"left","sort":"na","caption":"№"},{"id":"price_type","width":"*","type":"ro","align":"left","sort":"na","caption":"Тип цен"},{"id":"currency","width":"120","type":"ro","align":"left","sort":"na","caption":"Валюта"},{"id":"note","width":"*","type":"ro","align":"left","sort":"na","caption":"Комментарий"}]},"obj":{"head":{" ":[{"id":"number_doc","path":"o.number_doc","type":"ro","synonym":"Номер"},"date","responsible","note","price_type","currency"]},"tabular_sections":{"goods":{"fields":["row","nom","nom_characteristic","price_type","price"],"headers":"№,Номенклатура,Характеристика,Тип цен,Цена","aligns":"center,left,left,left,right","sortings":"na,na,na,na,na","types":"cntr,ref,ref,ref,calck","widths":"50,*,*,80,90","min_widths":"40,200,140,0,80"}}}}},"planning_event":{"name":"СобытиеПланирования","splitted":false,"synonym":"Событие планирования","illustration":"","obj_presentation":"Событие планирования","list_presentation":"События планирования","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"phase":{"synonym":"Фаза","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.planning_phases"],"is_ref":true}},"key":{"synonym":"Ключ","multiline_mode":false,"tooltip":"","choice_params":[{"name":"applying","path":["НаправлениеДоставки","РабочийЦентр"]}],"choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"recipient":{"synonym":"Получатель","multiline_mode":false,"tooltip":"СГП или следующий передел","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_folder","path":false}],"choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"project":{"synonym":"Проект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.projects"],"is_ref":true}},"Основание":{"synonym":"Основание","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.planning_event"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"executors":{"name":"Исполнители","synonym":"Исполнители","tooltip":"","fields":{"executor":{"synonym":"Исполнитель","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals","cat.partners"],"is_ref":true}},"coefficient":{"synonym":"Коэффициент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}}}},"planning":{"name":"Планирование","synonym":"Планирование","tooltip":"","fields":{"obj":{"synonym":"Объект","multiline_mode":false,"tooltip":"Если указано - изделие, если пусто - Расчет из шапки","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"specimen":{"synonym":"Экземпляр","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"power":{"synonym":"Мощность","multiline_mode":false,"tooltip":"Трудоемкость или время операции","type":{"types":["number"],"digits":8,"fraction_figits":1}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"Номенклатура работы или услуги события","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"begin_time":{"synonym":"Время начала","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date_time"}},"end_time":{"synonym":"Время окончания","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date_time"}}}}},"cachable":"doc"}},"areg":{},"rep":{"materials_demand":{"name":"materials_demand","splitted":false,"synonym":"Потребность в материалах","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"calc_order":{"synonym":"Расчет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","choice_params":[{"name":"parent","path":["3220e252-ffcd-11e5-8303-e67fda7f6b46","3220e251-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"scheme":{"synonym":"Вариант настроек","multiline_mode":false,"tooltip":"","choice_params":[{"name":"obj","path":"rep.materials_demand.specification"}],"choice_groups_elm":"elm","type":{"types":["cat.scheme_settings"],"is_ref":true}}},"tabular_sections":{"production":{"name":"Продукция","synonym":"Продукция","tooltip":"","fields":{"use":{"synonym":"Использование","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true},"choice_params":[{"name":"calc_order","path":{"not":"00000000-0000-0000-0000-000000000000"}}]},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"№ элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"qty":{"synonym":"Количество, шт","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}}}},"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"calc_order":{"synonym":"Расчет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"product":{"synonym":"Изделие","multiline_mode":false,"tooltip":"Для продукции - номер строки заказа, для характеристики стеклопакета - номер элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"cnstr":{"synonym":"№ Конструкции","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Номер элемента, если значение > 0, либо номер конструкции, если значение < 0","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"article":{"synonym":"Артикул","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["specification","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"nom_kind":{"synonym":"Вид номенклатуры","multiline_mode":false,"tooltip":"Указывается вид, к которому следует отнести данную позицию номенклатуры.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_kinds"],"is_ref":true}},"qty":{"synonym":"Количество (шт)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"len":{"synonym":"Длина, м","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"width":{"synonym":"Ширина, м","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"material":{"synonym":"Материал","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"grouping":{"synonym":"Группировка","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"totqty":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":4}},"totqty1":{"synonym":"Количество (+%)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":4}},"alp1":{"synonym":"Угол 1, °","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"alp2":{"synonym":"Угол 2, °","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"sz":{"synonym":"Размер","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"price":{"synonym":"Себест.план","multiline_mode":false,"tooltip":"Цена плановой себестоимости строки спецификации","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма себест.","multiline_mode":false,"tooltip":"Сумма плановой себестоимости строки спецификации","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_marged":{"synonym":"Сумма с наценкой","multiline_mode":false,"tooltip":"Вклад строки спецификации в стоимость изделия для сценария КМАРЖ_В_СПЕЦИФИКАЦИИ","type":{"types":["number"],"digits":15,"fraction_figits":2}}}}}},"cash":{"name":"cash","splitted":false,"synonym":"Денежные средства","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{},"tabular_sections":{"data":{"name":"data","synonym":"Данные","tooltip":"","fields":{"period":{"synonym":"Период","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"register":{"synonym":"Регистратор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.credit_card_order","doc.debit_bank_order","doc.registers_correction","doc.credit_cash_order","doc.debit_cash_order","doc.credit_bank_order"],"is_ref":true}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"bank_account_cashbox":{"synonym":"Касса или банковский счет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organization_bank_accounts","cat.cashboxes"],"is_ref":true}},"initial_balance":{"synonym":"Начальный остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"debit":{"synonym":"Приход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"credit":{"synonym":"Расход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"final_balance":{"synonym":"Конечный остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}}}}}},"goods":{"name":"goods","splitted":false,"synonym":"Товары на складах","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{},"tabular_sections":{"data":{"name":"data","synonym":"Данные","tooltip":"","fields":{"period":{"synonym":"Период","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"register":{"synonym":"Регистратор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.registers_correction","doc.selling","doc.purchase"],"is_ref":true}},"warehouse":{"synonym":"Склад","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.stores"],"is_ref":true}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["data","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"initial_balance":{"synonym":"Начальный остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"debit":{"synonym":"Приход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"credit":{"synonym":"Расход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"final_balance":{"synonym":"Конечный остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_initial_balance":{"synonym":"Сумма начальный остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_debit":{"synonym":"Сумма приход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_credit":{"synonym":"Сумма расход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_final_balance":{"synonym":"Сумма конечный остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}}}}}},"invoice_execution":{"name":"invoice_execution","splitted":false,"synonym":"Исполнение заказов","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{},"tabular_sections":{"data":{"name":"data","synonym":"Данные","tooltip":"","fields":{"period":{"synonym":"Период","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"invoice":{"synonym":"Сумма заказа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"pay":{"synonym":"Оплачено","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"pay_total":{"synonym":"Оплатить","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"pay_percent":{"synonym":"% Оплаты","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"shipment":{"synonym":"Отгружено","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"shipment_total":{"synonym":"Отгрузить","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"shipment_percent":{"synonym":"% Отгрузки","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}}}}}},"mutual_settlements":{"name":"mutual_settlements","splitted":false,"synonym":"Взаиморасчеты","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{},"tabular_sections":{"data":{"name":"data","synonym":"Данные","tooltip":"","fields":{"period":{"synonym":"Период","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"register":{"synonym":"Регистратор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.credit_card_order","doc.debit_bank_order","doc.registers_correction","doc.credit_cash_order","doc.selling","doc.purchase","doc.debit_cash_order","doc.credit_bank_order"],"is_ref":true}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"initial_balance":{"synonym":"Нач. остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"debit":{"synonym":"Приход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"credit":{"synonym":"Расход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"final_balance":{"synonym":"Кон. остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}}}}}},"selling":{"name":"selling","splitted":false,"synonym":"Продажи","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{},"tabular_sections":{"data":{"name":"data","synonym":"Данные","tooltip":"","fields":{"period":{"synonym":"Период","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"register":{"synonym":"Регистратор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.registers_correction","doc.selling","doc.purchase"],"is_ref":true}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["data","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount":{"synonym":"Сумма скидки","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}}}}}}},"cch":{"predefined_elmnts":{"name":"ПредопределенныеЭлементы","splitted":false,"synonym":"Константы и списки","illustration":"Хранит значения настроек и параметров подсистем","obj_presentation":"Значение настроек","list_presentation":"","input_by_string":["name","synonym"],"hierarchical":true,"has_owners":false,"group_hierarchy":false,"main_presentation_name":true,"code_length":0,"fields":{"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_type":{"path":["ТипЗначения"],"elm":0},"type":{"types":["cat.production_params","cat.currencies","cat.color_price_groups","cat.formulas","boolean","cat.nom_prices_types","cat.divisions","enm.elm_types","cat.parameters_keys","string","cat.nom_kinds","date","number","enm.planning_detailing","doc.calc_order","cat.nom","cat.furns","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date","digits":8,"fraction_figits":1}},"definition":{"synonym":"Описание","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"synonym":{"synonym":"Синоним","multiline_mode":false,"tooltip":"Синоним предопределенного элемента","mandatory":true,"type":{"types":["string"],"str_len":50}},"list":{"synonym":"Список","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"zone":{"synonym":"Область","multiline_mode":false,"tooltip":"Разделитель (префикс) данных","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cch.predefined_elmnts"],"is_ref":true}},"type":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.production_params","cat.currencies","cat.color_price_groups","cat.formulas","boolean","cat.nom_prices_types","cat.divisions","enm.elm_types","cat.parameters_keys","string","cat.nom_kinds","date","number","enm.planning_detailing","doc.calc_order","cat.nom","cat.furns","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date","digits":8,"fraction_figits":1}}},"tabular_sections":{"elmnts":{"name":"Элементы","synonym":"Элементы","tooltip":"","fields":{"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_type":{"path":["ТипЗначения"],"elm":0},"type":{"types":["cat.production_params","cat.currencies","cat.color_price_groups","cat.formulas","boolean","cat.nom_prices_types","cat.divisions","enm.elm_types","cat.parameters_keys","string","cat.nom_kinds","date","number","enm.planning_detailing","doc.calc_order","cat.nom","cat.furns","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date","digits":8,"fraction_figits":1}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["cat.production_params","cat.currencies","cat.color_price_groups","cat.formulas","boolean","cat.nom_prices_types","cat.divisions","enm.elm_types","cat.parameters_keys","string","cat.nom_kinds","date","number","enm.planning_detailing","doc.calc_order","cat.nom","cat.furns","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date","digits":8,"fraction_figits":1}}}}},"cachable":"ram","form":{"obj":{"head":{" ":[{"id":"name","path":"o.name","synonym":"Наименование","type":"ro"},{"id":"synonym","path":"o.synonym","synonym":"Синоним","type":"ro"},"list","zone","value"]},"tabular_sections":{"elmnts":{"fields":["elm","value"],"headers":"Элемент,Значение","widths":"*,*","min_widths":"150,150","aligns":"","sortings":"na,na","types":"ref,ref"}}}}},"properties":{"name":"ДополнительныеРеквизитыИСведения","splitted":false,"synonym":"Дополнительные реквизиты и сведения","illustration":"","obj_presentation":"Дополнительный реквизит / сведение","list_presentation":"","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":true,"code_length":0,"fields":{"shown":{"synonym":"Виден","multiline_mode":false,"tooltip":"Настройка видимости дополнительного реквизита","type":{"types":["boolean"]}},"sorting_field":{"synonym":"Порядок","multiline_mode":false,"tooltip":"Используется для упорядочивания (служебный)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"extra_values_owner":{"synonym":"Владелец дополнительных значений","multiline_mode":false,"tooltip":"Свойство-образец, с которым у этого свойства одинаковый список дополнительных значений","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"available":{"synonym":"Доступен","multiline_mode":false,"tooltip":"Настройка доступности дополнительного реквизита","type":{"types":["boolean"]}},"mandatory":{"synonym":"Заполнять обязательно","multiline_mode":false,"tooltip":"Настройка проверки заполненности дополнительного реквизита","type":{"types":["boolean"]}},"include_to_name":{"synonym":"Включать в наименование","multiline_mode":false,"tooltip":"Добавлять значение параметра в наименование продукции","type":{"types":["boolean"]}},"list":{"synonym":"Список","multiline_mode":false,"tooltip":"Реквизит подсистемы интеграции metadata.js - реализует функциональность списка опций","type":{"types":["number"],"digits":1,"fraction_figits":0}},"caption":{"synonym":"Наименование","multiline_mode":false,"tooltip":"Краткое представление свойства, которое\nвыводится в формах редактирования его значения","mandatory":true,"type":{"types":["string"],"str_len":75}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"Поясняет назначение свойства","type":{"types":["string"],"str_len":0}},"destination":{"synonym":"Набор свойств","multiline_mode":false,"tooltip":"Набор свойств, которому принадлежит уникальное свойство. Если не задан, значит свойство общее.","choice_groups_elm":"elm","type":{"types":["cat.destinations"],"is_ref":true}},"tooltip":{"synonym":"Подсказка","multiline_mode":false,"tooltip":"Показывается пользователю при редактировании свойства в форме объекта","type":{"types":["string"],"str_len":0}},"is_extra_property":{"synonym":"Это дополнительное сведение","multiline_mode":false,"tooltip":"Свойство является дополнительным сведением, а не дополнительным реквизитом","type":{"types":["boolean"]}},"include_to_description":{"synonym":"Включать в описание","multiline_mode":false,"tooltip":"Добавлять имя и значение параметра в строку описания продукции","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"type":{"synonym":"","multiline_mode":false,"tooltip":"Типы значения, которое можно ввести при заполнении свойства.","mandatory":true,"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}}},"tabular_sections":{},"cachable":"ram"}},"cacc":{},"bp":{},"tsk":{},"syns_1с":["arcCCW","CH","RADIUS","Автор","Адрес","АдресБанка","АдресДоставки","АдресЭП","Аксессуар","Активная","Арт1Стеклопакет","Арт1ТолькоВертикальный","Арт2Стеклопакет","Арт2ТолькоВертикальный","Артикул","Атрибуты","БазоваяЕдиницаИзмерения","Банк","БанкДляРасчетов","Банки","БанковскиеСчета","БанковскиеСчетаКонтрагентов","БанковскиеСчетаОрганизаций","БанковскийСчет","БизнесПроцесс","БИКБанка","БИКБанкаДляРасчетов","Булево","Валюта","ВалютаВзаиморасчетов","ВалютаДенежныхСредств","ВалютаДокумента","ВалютаЦены","Валюты","ВариантАтрибутов","ВариантПереноса","ВариантПути","ВариантСмещения","ВариантУкорочения","ВариантыАтрибутовВставок","ВариантыКрепленияИмпостов","ВариантыПереносаОпераций","ВариантыСмещений","ВариантыУкорочений","ВариантыУравнивания","ВводПоСтроке","ВедениеВзаиморасчетов","ВедениеВзаиморасчетовПоДоговорам","Ведомый","ВедущаяПродукция","ВедущаяФормула","Ведущие","Ведущий","ВедущийМенеджер","ВедущийЭлемент","ВерсияДанных","Вес","Вид","ВидДвижения","ВидДоговора","Виден","ВидЗатрат","ВидНоменклатуры","ВидОперации","ВидРабот","ВидРабочегоЦентра","ВидСкидкиНаценки","ВидСравнения","ВидСчета","ВидыДвиженийПриходРасход","ВидыДоговоровКонтрагентов","ВидыЗатрат","ВидыКонтактнойИнформации","ВидыНоменклатуры","ВидыПолейФормы","ВидыРабочихЦентров","ВидыТранспортныхСредств","Визуализация","ВключатьВНаименование","ВключатьВОписание","Владелец","ВладелецДополнительныхЗначений","Владельцы","ВнутренниеЗаказы","ВремяИзменения","ВремяНачала","ВремяОкончания","ВремяСобытия","Всего","Вставка","Вставки","ВходящееИсходящееСобытие","ВыборГруппИЭлементов","Выполнена","ВыпуклаяДуга","ВыравниваниеТекста","Высота","ВысотаМакс","ВысотаМин","ВысотаРучки","ВысотаРучкиМакс","ВысотаРучкиМин","ВысотаРучкиФиксирована","Глубина","Город","ГородБанка","ГородБанкаДляРасчетов","Готовность","ГрафикРаботы","Группировка","ГруппыФинансовогоУчетаНоменклатуры","ДаНет","Дата","ДатаДоставки","ДатаИзменения","ДатаНачала","ДатаОкончания","ДатаРождения","ДатаСобытия","Действие","ДеловаяОбрезь","ДержатьРезервБезОплатыОграниченноеВремя","ДетализацияПланирования","ДеятельностьПрекращена","Длина","ДлинаКода","ДлинаМакс","ДлинаМин","ДлинаНомера","ДлинаПроема","ДнейДоГотовности","ДнейОтГотовности","ДниНедели","ДоговорКонтрагента","ДоговорыКонтрагентов","Документ.Расчет","ДокументУдостоверяющийЛичность","Долгота","ДоменноеИмяСервера","Доп","ДополнительныеРеквизиты","ДополнительныеРеквизитыИСведения","ДополнительныеСведения","ДопускаютсяНезамкнутыеКонтуры","ДопустимаяСуммаЗадолженности","ДопустимоеЧислоДнейЗадолженности","Доступен","ЕдиницаИзмерения","ЕдиницаПоКлассификатору","ЕдиницаХраненияОстатков","ЕдиницыИзмерения","Завершен","Завершение","ЗависимостиДополнительныхРеквизитов","Заголовок","Заказ","Заказной","ЗаказПокупателя","ЗаказПоставщику","Закрыт","Закрыть","Запасы","Заполнения","ЗаполнятьОбязательно","Запуск","Значение","ЗначениеЗаполнения","Значения","ЗначенияПолей","ЗначенияПолейАдреса","ЗначенияСвойствОбъектов","ЗначенияСвойствОбъектовИерархия","Идентификатор","ИдентификаторПользователяИБ","ИдентификаторПользователяСервиса","ИдентификаторыОбъектовМетаданных","Иерархический","ИерархияГруппИЭлементов","Изделие","ИзОбрези","ИмяПредопределенныхДанных","Инд","Индекс","ИндивидуальныйПредприниматель","ИНН","ИнтеграцияВидыСравнений","ИнтеграцияКешСсылок","ИнтеграцияНастройкиОтчетовИСписков","ИнтеграцияОтделыАбонентов","ИнтеграцияСостоянияТранспорта","ИнтеграцияТипВыгрузки","ИнтеграцияТипКеширования","ИнтеграцияТипСвёртки","Исполнители","Исполнитель","ИспользованиеВедущих","ИспользованиеОбрези","ИтогСебестоимость","Календари","КалендариGoogle","Календарь","Камеры","Касса","Кассы","КатегорииЗаказов","Категория","КлассификаторБанковРФ","КлассификаторЕдиницИзмерения","КлиентДилера","Ключ","Ключи","КлючиПараметров","КМарж","КМаржВнутр","КМаржМин","Код","КодАльфа2","КодАльфа3","КодИМНС","КодПоОКПО","КодЦветаДляСтанка","Количество","КоличествоСторон","Комментарий","КонечныйОстаток","Конструкции","Конструкция","КонтактнаяИнформация","КонтактныеЛица","КонтактныеЛицаКонтрагентов","Контрагент","Контрагенты","КонтролироватьСуммуЗадолженности","КонтролироватьЧислоДнейЗадолженности","КонцевыеКрепления","Координата","Координаты","КоординатыЗаполнений","КорректировкаРегистров","КоррСчет","КоррСчетБанка","КоррСчетБанкаДляРасчетов","Коэффициент","КоэффициентПотерь","КПП","Кратность","КратностьВзаиморасчетов","КрепитсяШтульп","КреплениеИмпостов","КреплениеШтульпа","Кривой","Курс","КурсВзаиморасчетов","КурсыВалют","ЛеваяПравая","Листовые","Маржа","Марка","Масса","МассаМакс","МассаМин","МассаСтворкиМакс","МассаСтворкиМин","Материал","МатериалОперация","Материалы","МеждународноеСокращение","Менеджер","МестоРождения","МногострочныйРежим","МожноПоворачивать","Москитка","Москитки","МощностиРЦ","Мощность","Набор","НаборСвойств","НаборСвойствНоменклатура","НаборСвойствХарактеристика","НаборФурнитуры","НаборыДополнительныхРеквизитовИСведений","НазначениеЦветовойГруппы","НазначенияЦветовыхГрупп","Наименование","НаименованиеБанка","НаименованиеПолное","НаименованиеСокращенное","НалогообложениеНДС","Направление","НаправлениеОткрывания","НаправленияДоставки","НаправленияСортировки","НаПроем","НарядРЦ","НастройкиОткрывания","Наценка","НаценкаВнешн","НачальныйОстаток","Недействителен","НеполноеОткрывание","Нестандарт","Номенклатура","Номенклатура1","Номенклатура2","НоменклатурнаяГруппа","Номер","НомерВнутр","НомерКлиента","НомерКонтура","НомерОтдела","НомерСтроки","НомерСчета","НомерТелефона","НомерТелефонаБезКодов","ОбластиДоступаGoogle","Область","Обрезь","Объект","ОбъектДоступа","ОбъектыДоступа","Объем","ОбязательноеЗаполнение","ОграниченияСпецификации","ОкруглятьВБольшуюСторону","ОкруглятьКоличество","Описание","ОплатаОтПокупателяПлатежнойКартой","Организации","Организация","Ориентация","ОриентацияЭлемента","ОсновнаяВалюта","ОсновнаяСтатьяДвиженияДенежныхСредств","ОсновноаяКасса","ОсновноеКонтактноеЛицо","ОсновноеПредставлениеИмя","ОсновнойБанковскийСчет","ОсновнойДоговорКонтрагента","ОсновнойМенеджерПокупателя","ОсновнойПроект","ОснЦвет","ОсьПоворота","Отбор","Ответственный","Отдел","ОтражатьВБухгалтерскомУчете","ОтражатьВНалоговомУчете","Отступы","Пара","Параметр","Параметры","ПараметрыВыбора","ПараметрыИзделия","ПараметрыОтбора","ПараметрыПрописиНаРусском","ПараметрыФурнитуры","ПарныйРаскрой","Партия","Период","ПериодыСмены","пзВизуализацияЭлементов","пзМаржинальныеКоэффициентыИСкидки","пзПараметрыПродукции","пзСоединения","пзФурнитура","пзЦвета","Планирование","ПлатежноеПоручениеВходящее","ПлатежноеПоручениеИсходящее","ПлатежныйКалендарь","Плотность","Площадь","ПлощадьМакс","ПлощадьМин","ПлощадьППМ","Поворачивать","Поворот","ПоДоговоруВЦелом","Подразделение","ПодразделениеПроизводства","Подразделения","Подсказка","Подчиненый","ПоЗаказам","ПоКонтуру","Покупатель","Пол","ПолноеИмя","Положение","ПоложениеСтворокПоИмпостам","ПоложениеЭлемента","ПоложенияЗаголовка","Получатель","ПолФизическихЛиц","Пользователи","ПометкаУдаления","ПорогОкругления","Порядок","ПорядокОкругления","Поставщик","ПоступлениеТоваровУслуг","ПоСчетам","Потребность","ПоУмолчанию","Пояснение","Предоплата","ПредопределенныеЭлементы","Предопределенный","Представление","ПредставлениеИдентификатора","ПредставлениеОбъекта","ПредставлениеСписка","Префикс","Привязки","ПривязкиВставок","ПризнакиНестандартов","Применение","ПримененияКлючейПараметров","Принудительно","Приоритет","Припуск","Приход","ПриходныйКассовыйОрдер","ПриязкаКоординат","Проведен","Продукция","Проект","Проекты","Происхождение","Пропорции","Процент","ПроцентПредоплаты","ПроцентСкидкиНаценки","ПроцентСкидкиНаценкиВнутр","Прочее","Прямоугольный","ПутьSVG","РаботаетВремяНачала","РаботаетВремяОкончания","Работники","Работы","РабочиеЦентры","Разделитель","Размер","Размер_B","РазмерМакс","РазмерМин","РазмерФальца","РазмерФурнПаза","РазныеЦвета","Район","РайоныДоставки","Раскладка","Раскрой","Расход","РасходныйКассовыйОрдер","Расценка","Расчет","РасчетныйСчет","РасчетыСКонтрагентами","РасширенныйРежим","РасшифровкаПлатежа","РеализацияТоваровУслуг","Регион","Реквизит","РеквизитДопУпорядочивания","Реквизиты","Родитель","РучкаНаСтороне","СвидетельствоДатаВыдачи","СвидетельствоКодОргана","СвидетельствоНаименованиеОргана","СвидетельствоСерияНомер","СВИФТБИК","Свойство","Связи","СвязиПараметров","СвязиПараметровВыбора","СвязьПоТипу","Сделка","Себестоимость","Синоним","Система","СистемыПрофилей","СистемыФурнитуры","Скидка","СкидкаВнешн","СкидкиНаценки","Склад","Склады","СКомиссионером","СКомитентом","Скрыть","Сложный","Служебный","Смена","Смены","Смещение","Событие","СобытиеПланирования","Содержание","Соедин","СоединяемыеЭлементы","Соответствие","СоответствиеЦветов","СортировкаВЛистеКомплектации","Состав","Состояние","СостояниеТранспорта","СостоянияЗаданий","СостоянияЗаказовКлиентов","Сотрудник","Сотрудники","Спецификации","Спецификация","СпецификацияЗаполнений","Список","СПокупателем","СпособРасчетаКоличества","СпособРасчетаУгла","СпособУстановкиКурса","СпособыРасчетаКоличества","СпособыРасчетаУгла","СпособыУстановкиКурсаВалюты","СпособыУстановкиСпецификации","СПоставщиком","СрокДействия","Ссылка","СтавкаНДС","СтавкиНДС","СтандартнаяВысотаРучки","СтандартныйПериод","Старт","Стартован","СтатусыЗаказов","СтатьиДвиженияДенежныхСредств","СтатьиЗатрат","СтатьяДвиженияДенежныхСредств","СтатьяЗатрат","Створка","СтворкиВРазныхПлоскостях","Стоимость","Сторона","Сторона1","Сторона2","СторонаСоединения","СторонаЭлемента","СтороныСоединений","Страна","СтраныМира","СтраховойНомерПФР","стрНомер","Строка","СтрокаПодключения","СтруктурнаяЕдиница","Сумма","СуммаАвтоматическойСкидки","СуммаВзаиморасчетов","СуммаВключаетНДС","СуммаВнутр","СуммаДокумента","СуммаКонечныйОстаток","СуммаНачальныйОстаток","СуммаНДС","СуммаПриход","СуммаРасход","СуммаСНаценкой","СуммаУпр","Суффикс","СчетУчета","ТаблицаРегистров","ТабличнаяЧасть","ТабличныеЧасти","ТекстКорреспондента","ТекстНазначения","ТекстоваяСтрока","Телефон","Телефоны","ТелефоныБанка","Тип","ТипВставки","ТипВставкиСтеклопакета","ТипДеления","ТипДенежныхСредств","ТипИсходногоДокумента","ТипНоменклатуры","ТиповойБлок","ТиповыеБлоки","ТипОптимизации","ТипОткрывания","ТипСоединения","ТипСчета","ТипЦен","ТипЦенВнутр","ТипЦенПрайс","ТипЦенСебестоимость","ТипыВставок","ТипыВставокСтеклопакета","ТипыДеленияРаскладки","ТипыДенежныхСредств","ТипыКонтактнойИнформации","ТипыНалогообложенияНДС","ТипыНоменклатуры","ТипыОптимизацийРаскроя","ТипыОткрывания","ТипыРазмерныхЛиний","ТипыСобытий","ТипыСоединений","ТипыСтрокВЗаказ","ТипыСтруктурныхЕдиниц","ТипыСчетов","ТипыЦен","ТипыЦенНоменклатуры","ТипыЭлементов","ТипЭлемента","Товары","Толщина","ТолщинаМакс","ТолщинаМин","ТолькоДляПрямыхПрофилей","ТолькоДляЦенообразования","ТочкаМаршрута","ТранспортныеСредства","УголКГоризонту","УголКГоризонтуМакс","УголКГоризонтуМин","УголМакс","УголМин","УголРеза1","УголРеза2","УголШага","УдлинениеАрки","Узел1","Узел2","Укорочение","УкорочениеПоКонтуру","Упаковка","Управленческий","Условие","УсловныхИзделий","Услуги","УстанавливатьСпецификацию","УстановкаЦенНоменклатуры","УточнятьРайонГеокодером","УчитыватьНДС","Фаза","ФазыПланирования","ФизическиеЛица","ФизическоеЛицо","Финиш","Формула","ФормулаВнешн","ФормулаВнутр","ФормулаПродажа","ФормулаРасчетаКурса","ФормулаУсловия","Формулы","Фурнитура","ФурнитураЦвет","Характеристика","ХарактеристикаАксессуаров","ХарактеристикаНоменклатуры","ХарактеристикаПродукции","ХарактеристикиНоменклатуры","Хлыст","Цвет","Цвет1","Цвет2","ЦветRAL","Цвета","ЦветВРисовалке","ЦветИзнутри","Цветной","ЦветоваяГруппа","ЦветоЦеновыеГруппы","ЦветСнаружи","Цена","ЦенаВключаетНДС","ЦенаВнутр","ЦеноваяГруппа","ЦеновыеГруппы","Центрировать","ЦеныНоменклатуры","Число","ЧислоДнейРезерваБезОплаты","Шаблон","Шаг","Ширина","ШиринаПилы","Широта","Шкала","Штуки","ШтульпБезимпСоед","Экземпляр","Элемент","Элемент1","Элемент2","Элементы","Эскиз","ЭтоАксессуар","ЭтоГруппа","ЭтоДополнительноеСведение","ЭтоНабор","ЭтоОсновнойЭлемент","ЭтоРаздвижка","ЭтоСоединение","ЭтоСтрокаЗаказа","ЭтоСтрокаНабора","ЭтоСтрокаОперации","ЭтоСтрокаОсновнойСпецификации","ЭтоСтрокаСочетанияНоменклатур","ЭтоТехоперация","ЭтоУслуга","ЮрЛицо","ЮрФизЛицо","Ячейка","Ячейки"],"syns_js":["arc_ccw","changed","arc_r","author","address","bank_address","shipping_address","email_address","accessory","active","art1glass","art1vert","art2glass","art2vert","article","attributes","base_unit","bank","settlements_bank","banks","bank_accounts","partner_bank_accounts","organization_bank_accounts","bank_account","buisness_process","bank_bic","settlements_bank_bic","boolean","currency","settlements_currency","funds_currency","doc_currency","price_currency","currencies","attrs_option","transfer_option","path_kind","offset_option","contraction_option","inset_attrs_options","impost_mount_options","transfer_operations_options","offset_options","contraction_options","align_types","input_by_string","mutual_settlements","mutual_contract_settlements","slave","leading_product","leading_formula","leadings","master","leading_manager","leading_elm","data_version","heft","kind","record_kind","contract_kind","shown","cost_kind","nom_kind","transactions_kind","work_kind","work_center_kind","charges_discounts_kind","comparison_type","account_kind","debit_credit_kinds","contract_kinds","costs_kinds","contact_information_kinds","nom_kinds","data_field_kinds","work_center_kinds","motor_vehicle_kinds","visualization","include_to_name","include_to_description","owner","extra_values_owner","owners","internal_orders","change_time","begin_time","end_time","event_time","altogether","inset","inserts","inbound_outbound","choice_groups_elm","completed","arc_available","text_aligns","height","hmax","hmin","h_ruch","handle_height_max","handle_height_min","fix_ruch","depth","city","bank_city","settlements_bank_city","readiness","worker_schedule","grouping","nom_groups","yes_no","date","shipping_date","change_date","start_date","expiration_date","birth_date","event_date","action","biz_cuts","check_days_without_pay","planning_detailing","activity_ceased","len","code_length","lmax","lmin","number_doc_len","aperture_len","days_to_execution","days_from_execution","week_days","contract","contracts","Документ.итРасчет","identification_document","longitude","server_domain_name","dop","extra_fields","properties","extra_properties","allow_open_cnn","allowable_debts_amount","allowable_debts_days","available","unit","qualifier_unit","storage_unit","nom_units","finished","completion","extra_fields_dependencies","caption","invoice","made_to_order","buyers_order","purchase_order","closed","close","inventories","glasses","mandatory","launch","value","fill_value","values","values_fields","address_fields","property_values","property_values_hierarchy","identifier","user_ib_uid","user_fresh_uid","meta_ids","hierarchical","group_hierarchy","product","from_cut","predefined_name","icounter","ind","individual_entrepreneur","inn","comparison_types","integration_links_cache","scheme_settings","branches","obj_delivery_states","unload_type","caching_type","reduce_type","executors","executor","use_master","use_cut","first_cost_total","calendars","calendars_google","calendar","coffer","cashbox","cashboxes","order_categories","category","banks_qualifier","units","client_of_dealer","key","keys","parameters_keys","marginality","marginality_internal","marginality_min","id","alpha2","alpha3","imns_code","okpo","machine_tools_clr","quantity","side_count","note","final_balance","constructions","cnstr","contact_information","contact_persons","contact_persons_partners","partner","partners","check_debts_amount","check_debts_days","end_mount","coordinate","coordinates","glass_coordinates","registers_correction","correspondent_account","bank_correspondent_account","settlements_bank_correspondent_account","coefficient","loss_factor","kpp","multiplicity","settlements_multiplicity","shtulp_fix_here","impost_fixation","shtulp_fixation","crooked","course","settlements_course","currency_courses","left_right","is_sandwich","margin","brand","weight","mmax","mmin","flap_weight_max","flap_weight_min","material","material_operation","materials","international_short","manager","birth_place","multiline_mode","can_rotate","mskt","mosquito","work_centers_performance","power","set","destination","dnom","dcharacteristic","furn_set","destinations","color_price_group_destination","color_price_group_destinations","name","bank_name","name_full","name_short","vat","direction","open_directions","delivery_directions","sort_directions","on_aperture","work_centers_task","open_tunes","extra_charge","extra_charge_external","initial_balance","invalid","partial_opening","nonstandard","nom","nom1","nom2","nom_group","number_doc","number_internal","client_number","contour_number","number_division","row","account_number","phone_number","phone_without_codes","google_access_areas","area","cuts","obj","acl_obj","acl_objs","volume","mandatory_fields","specification_restrictions","rounding_in_a_big_way","rounding_quantity","definition","credit_card_order","organizations","organization","orientation","orientations","main_currency","main_cash_flow_article","main_cashbox","primary_contact","main_presentation_name","main_bank_account","main_contract","buyer_main_manager","main_project","default_clr","rotation_axis","selection","responsible","branch","accounting_reflect","tax_accounting_reflect","offsets","pair","param","params","choice_params","product_params","selection_params","parameters_russian_recipe","furn_params","double_cut","part","period","work_shift_periodes","elm_visualization","margin_coefficients","production_params","cnns","furns","clrs","planning","debit_bank_order","credit_bank_order","calendar_payments","density","s","smax","smin","coloration_area","rotate","rotated","by_entire_contract","department","department_manufactory","divisions","tooltip","has_owners","by_orders","by_contour","is_buyer","sex","full_moniker","pos","flap_pos_by_impost","positions","label_positions","recipient","gender","users","_deleted","rounding_threshold","sorting","rounding_order","is_supplier","purchase","by_invoices","demand","by_default","illustration","prepayment","predefined_elmnts","predefined","presentation","identifier_presentation","obj_presentation","list_presentation","prefix","bindings","insert_bind","nonstandard_attributes","applying","parameters_keys_applying","forcibly","priority","overmeasure","debit","debit_cash_order","bind_coordinates","posted","production","project","projects","origin","proportions","rate","prepayment_percent","discount_percent","discount_percent_internal","others","is_rectangular","svg_path","work_begin_time","work_end_time","workers","jobs","work_centers","delimiter","sz","sizeb","sz_max","sz_min","sizefaltz","sizefurn","varclr","delivery_area","delivery_areas","lay","cutting","credit","credit_cash_order","pricing","calc_order","current_account","invoice_payments","extended_mode","payment_details","selling","region","field","sorting_field","fields","parent","handle_side","certificate_date_issue","certificate_authority_code","certificate_authority_name","certificate_series_number","swift","property","links","params_links","choice_links","choice_type","trans","first_cost","synonym","sys","sys_profile","sys_furn","discount","discount_external","charges_discounts","warehouse","stores","with_commission_agent","with_committent","hide","difficult","ancillary","work_shift","work_shifts","offset","event","planning_event","content","cnn","cnn_elmnts","conformity","clr_conformity","complete_list_sorting","composition","state","obj_delivery_state","task_states","buyers_order_states","employee","staff","specifications","specification","glass_specification","list","with_buyer","count_calc_method","angle_calc_method","course_installation_method","count_calculating_ways","angle_calculating_ways","course_installation_methods","specification_installation_methods","with_supplier","validity","ref","vat_rate","vat_rates","handle_height_base","standard_period","start","started","invoice_conditions","cash_flow_articles","cost_items","cash_flow_article","cost_item","flap","var_layers","cost","side","sd1","sd2","cnn_side","elm_side","cnn_sides","country","countries","pfr_number","number_str","string","connection_str","organizational_unit","amount","discount_amount_automatic","amount_mutual","vat_included","amount_internal","doc_amount","amount_final_balance","amount_initial_balance","vat_amount","amount_debit","amount_credit","amount_marged","amount_operation","suffix","account_accounting","registers_table","tabular_section","tabular_sections","correspondent_text","appointments_text","txt_row","phone","phone_numbers","bank_phone_numbers","type","insert_type","insert_glass_type","split_type","cash_flow_type","original_doc_type","nom_type","base_block","base_blocks","cutting_optimization_type","open_type","cnn_type","account_type","price_type","price_type_internal","price_type_sale","price_type_first_cost","inserts_types","inserts_glass_types","lay_split_types","cash_flow_types","contact_information_types","vat_types","nom_types","cutting_optimization_types","open_types","sz_line_types","event_types","cnn_types","specification_order_row_types","structural_unit_types","account_types","price_types","nom_prices_types","elm_types","elm_type","goods","thickness","tmax","tmin","for_direct_profile_only","for_pricing_only","buisness_process_point","transport_means","angle_hor","ahmax","ahmin","amax","amin","alp1","alp2","step_angle","arc_elongation","node1","node2","contraction","contraction_by_contour","packing","managerial","condition","condition_products","services","set_specification","nom_prices_setup","specify_area_by_geocoder","vat_consider","phase","planning_phases","individuals","individual_person","finish","formula","external_formula","internal_formula","sale_formula","course_calc_formula","condition_formula","formulas","furn","clr_furn","characteristic","accessory_characteristic","nom_characteristic","product_characteristic","characteristics","stick","clr","clr1","clr2","ral","colors","clr_str","clr_in","colored","clr_group","color_price_groups","clr_out","price","vat_price_included","price_internal","price_group","price_groups","do_center","nom_prices","number","days_without_pay","template","step","width","saw_width","latitude","scale","is_pieces","shtulp_available","specimen","elm","elm1","elm2","elmnts","outline","is_accessory","is_folder","is_extra_property","is_set","is_main_elm","is_sliding","is_cnn","is_order_row","is_set_row","is_procedure_row","is_main_specification_row","is_nom_combinations_row","is_procedure","is_service","legal_person","individual_legal","cell","cells"]});

(function(){
  const {EnumManager,CatManager,DocManager,DataProcessorsManager,ChartOfCharacteristicManager,ChartOfAccountManager,
    InfoRegManager,AccumRegManager,BusinessProcessManager,TaskManager,CatObj, DocObj, TabularSectionRow, DataProcessorObj,
    RegisterRow, BusinessProcessObj, TaskObj} = $p.constructor.classes;
    
  const _define = Object.defineProperties;

$p.enm.create('accumulation_record_type');
$p.enm.create('sort_directions');
$p.enm.create('comparison_types');
$p.enm.create('label_positions');
$p.enm.create('data_field_kinds');
$p.enm.create('standard_period');
$p.enm.create('quick_access');
$p.enm.create('report_output');
$p.enm.create('path_kind');
$p.enm.create('inset_attrs_options');
$p.enm.create('impost_mount_options');
$p.enm.create('transfer_operations_options');
$p.enm.create('offset_options');
$p.enm.create('contraction_options');
$p.enm.create('align_types');
$p.enm.create('mutual_contract_settlements');
$p.enm.create('debit_credit_kinds');
$p.enm.create('contract_kinds');
$p.enm.create('text_aligns');
$p.enm.create('planning_detailing');
$p.enm.create('obj_delivery_states');
$p.enm.create('use_cut');
$p.enm.create('order_categories');
$p.enm.create('color_price_group_destinations');
$p.enm.create('open_directions');
$p.enm.create('orientations');
$p.enm.create('positions');
$p.enm.create('gender');
$p.enm.create('parameters_keys_applying');
$p.enm.create('bind_coordinates');
$p.enm.create('buyers_order_states');
$p.enm.create('count_calculating_ways');
$p.enm.create('angle_calculating_ways');
$p.enm.create('specification_installation_methods');
$p.enm.create('vat_rates');
$p.enm.create('cnn_sides');
$p.enm.create('inserts_types');
$p.enm.create('inserts_glass_types');
$p.enm.create('lay_split_types');
$p.enm.create('contact_information_types');
$p.enm.create('nom_types');
$p.enm.create('cutting_optimization_types');
$p.enm.create('open_types');
$p.enm.create('sz_line_types');
$p.enm.create('cnn_types');
$p.enm.create('specification_order_row_types');
$p.enm.create('elm_types');
$p.enm.create('planning_phases');
$p.enm.create('individual_legal');

/**
* ### План видов характеристик ПредопределенныеЭлементы
* Хранит значения настроек и параметров подсистем
* @class CchPredefined_elmnts
* @extends CatObj
* @constructor 
*/
class CchPredefined_elmnts extends CatObj{

  get value() {
    const {_obj, type, _manager} = this;
    const {utils} = _manager._owner.$p;
    const res = _obj ? _obj.value : '';

    if(_obj.is_folder) {
      return '';
    }
    if(typeof res == 'object') {
      return res;
    }
    else if(type.is_ref) {
      if(type.digits && typeof res === 'number') {
        return res;
      }
      if(type.hasOwnProperty('str_len') && !utils.is_guid(res)) {
        return res;
      }
      const mgr = _manager.value_mgr(_obj, 'value', type);
      if(mgr) {
        if(utils.is_data_mgr(mgr)) {
          return mgr.get(res, false);
        }
        else {
          return utils.fetch_type(res, mgr);
        }
      }
      if(res) {
        _manager._owner.$p.record_log(['value', type, _obj]);
        return null;
      }
    }
    else if(type.date_part) {
      return utils.fix_date(_obj.value, true);
    }
    else if(type.digits) {
      return utils.fix_number(_obj.value, !type.hasOwnProperty('str_len'));
    }
    else if(type.types[0] == 'boolean') {
      return utils.fix_boolean(_obj.value);
    }
    else {
      return _obj.value || '';
    }

    return this.characteristic.clr;
  }
  set value(v) {
    const {_obj, _data, _manager} = this;
    if(_obj.value !== v) {
      _manager.emit_async('update', this, {value: _obj.value});
      _obj.value = v.valueOf();
      _data._modified = true;
    }
  }
  get definition(){return this._getter('definition')}
  set definition(v){this._setter('definition',v)}
  get synonym(){return this._getter('synonym')}
  set synonym(v){this._setter('synonym',v)}
  get list(){return this._getter('list')}
  set list(v){this._setter('list',v)}
  get zone(){return this._getter('zone')}
  set zone(v){this._setter('zone',v)}
  get predefined_name(){return this._getter('predefined_name')}
  set predefined_name(v){this._setter('predefined_name',v)}
  get parent(){return this._getter('parent')}
  set parent(v){this._setter('parent',v)}
  get type(){const {type} = this._obj; return typeof type === 'object' ? type : {types: []}}
  set type(v){this._obj.type = typeof v === 'object' ? v : {types: []}}
  get elmnts(){return this._getter_ts('elmnts')}
  set elmnts(v){this._setter_ts('elmnts',v)}}
$p.CchPredefined_elmnts = CchPredefined_elmnts;
class CchPredefined_elmntsElmntsRow extends TabularSectionRow{
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
}
$p.CchPredefined_elmntsElmntsRow = CchPredefined_elmntsElmntsRow;
class CchPredefined_elmntsManager extends ChartOfCharacteristicManager {

  constructor(owner, class_name) {
    super(owner, class_name);
    Object.defineProperty(this, 'parents', {
      value: {}
    });

    const {md, doc, adapters} = this._owner.$p;

    adapters.pouch.once('pouch_doc_ram_loaded', () => {
      // загружаем предопределенные элементы
      this.job_prms();
      // рассчеты, помеченные, как шаблоны, загрузим в память заранее
      doc.calc_order.load_templates && setTimeout(doc.calc_order.load_templates.bind(doc.calc_order), 1000);
      // даём возможность завершиться другим обработчикам, подписанным на _pouch_load_data_loaded_
      setTimeout(() => md.emit('predefined_elmnts_inited'), 100);
    });
  }

  // этот метод адаптер вызывает перед загрузкой doc_ram
  job_prms() {

    // создаём константы из alatable
    this.forEach((row) => this.job_prm(row));

    // дополним автовычисляемыми свойствами
    const {job_prm: {properties}} = this._owner.$p;
    if(properties) {
      const {calculated, width, length} = properties;
      if(width && calculated.indexOf(width) == -1) {
        calculated.push(width);
        width._calculated_value = {execute: (obj) => obj && obj.calc_order_row && obj.calc_order_row.width || 0};
      }
      if(length && calculated.indexOf(length) == -1) {
        calculated.push(length);
        length._calculated_value = {execute: (obj) => obj && obj.calc_order_row && obj.calc_order_row.len || 0};
      }
    }
  }

  // создаёт константу
  job_prm(row) {
    const {job_prm, md, utils} = this._owner.$p;
    const {parents} = this;
    const parent = job_prm[parents[row.parent.valueOf()]];
    const _mgr = row.type.is_ref && md.mgr_by_class_name(row.type.types[0]);

    if(parent) {
      if(parent.hasOwnProperty(row.synonym)) {
        delete parent[row.synonym];
      }

      if(row.list == -1) {
        parent.__define(row.synonym, {
          value: (() => {
            const res = {};
            row.elmnts.forEach((row) => {
              res[row.elm.valueOf()] = _mgr ? _mgr.get(row.value, false, false) : row.value;
            });
            return res;
          })(),
          configurable: true,
          enumerable: true
        });
      }
      else if(row.list) {
        parent.__define(row.synonym, {
          value: (row.elmnts._obj || row.elmnts).map((row) => {
            if(_mgr) {
              const value = _mgr.get(row.value, false, false);
              if(!utils.is_empty_guid(row.elm)) {
                value._formula = row.elm;
              }
              return value;
            }
            else {
              return row.value;
            }
          }),
          configurable: true,
          enumerable: true
        });
      }
      else {
        parent.__define(row.synonym, {
          value: _mgr ? _mgr.get(row.value, false, false) : row.value,
          configurable: true,
          enumerable: true
        });
      }
    }
    else {
      $p.record_log({
        class: 'error',
        note: `no parent for ${row.synonym}`,
      });
    }
  }

  // переопределяем load_array
  load_array(aattr, forse) {
    const {job_prm} = this._owner.$p;
    const {parents} = this;
    const elmnts = [];
    for (const row of aattr) {
      // если элемент является папкой, создаём раздел в job_prm
      if(row.is_folder && row.synonym) {
        parents[row.ref] = row.synonym;
        !job_prm[row.synonym] && job_prm.__define(row.synonym, {value: {}});
      }
      // если не задан синоним - пропускаем
      else if(row.synonym) {
        // если есть подходящая папка, стразу делаем константу
        if(parents[row.parent]) {
          !job_prm[parents[row.parent]][row.synonym] && this.job_prm(row);
        }
        // если папки нет - сохраним элемент в alatable
        else {
          elmnts.push(row);
        }
      }
    }
    // метод по умолчанию
    elmnts.length && super.load_array(elmnts, forse);
  }

}
$p.cch.create('predefined_elmnts', CchPredefined_elmntsManager, false);

/**
* ### План видов характеристик ДополнительныеРеквизитыИСведения
* Дополнительные реквизиты и сведения
* @class CchProperties
* @extends CatObj
* @constructor 
*/
class CchProperties extends CatObj{
get shown(){return this._getter('shown')}
set shown(v){this._setter('shown',v)}
get sorting_field(){return this._getter('sorting_field')}
set sorting_field(v){this._setter('sorting_field',v)}
get extra_values_owner(){return this._getter('extra_values_owner')}
set extra_values_owner(v){this._setter('extra_values_owner',v)}
get available(){return this._getter('available')}
set available(v){this._setter('available',v)}
get mandatory(){return this._getter('mandatory')}
set mandatory(v){this._setter('mandatory',v)}
get include_to_name(){return this._getter('include_to_name')}
set include_to_name(v){this._setter('include_to_name',v)}
get list(){return this._getter('list')}
set list(v){this._setter('list',v)}
get caption(){return this._getter('caption')}
set caption(v){this._setter('caption',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get destination(){return this._getter('destination')}
set destination(v){this._setter('destination',v)}
get tooltip(){return this._getter('tooltip')}
set tooltip(v){this._setter('tooltip',v)}
get is_extra_property(){return this._getter('is_extra_property')}
set is_extra_property(v){this._setter('is_extra_property',v)}
get include_to_description(){return this._getter('include_to_description')}
set include_to_description(v){this._setter('include_to_description',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get type(){const {type} = this._obj; return typeof type === 'object' ? type : {types: []}}
        set type(v){this._obj.type = typeof v === 'object' ? v : {types: []}}


  /**
   * ### Является ли значение параметра вычисляемым
   *
   * @property is_calculated
   * @type Boolean
   */
  get is_calculated() {
    return ($p.job_prm.properties.calculated || []).indexOf(this) != -1;
  }

  get show_calculated() {
    return ($p.job_prm.properties.show_calculated || []).indexOf(this) != -1;
  }

  /**
   * ### Рассчитывает значение вычисляемого параметра
   * @param obj {Object}
   * @param [obj.row]
   * @param [obj.elm]
   * @param [obj.ox]
   */
  calculated_value(obj) {
    if(!this._calculated_value) {
      if(this._formula) {
        this._calculated_value = $p.cat.formulas.get(this._formula);
      }
      else {
        return;
      }
    }
    return this._calculated_value.execute(obj);
  }

  /**
   * ### Проверяет условие в строке отбора
   */
  check_condition({row_spec, prm_row, elm, cnstr, origin, ox, calc_order}) {

    const {is_calculated} = this;
    const {utils, enm: {comparison_types}} = $p;

    // значение параметра
    const val = is_calculated ? this.calculated_value({
      row: row_spec,
      cnstr: cnstr || 0,
      elm,
      ox,
      calc_order
    }) : this.extract_value(prm_row);

    let ok = false;

    // если сравнение на равенство - решаем в лоб, если вычисляемый параметр типа массив - выясняем вхождение значения в параметр
    if(ox && !Array.isArray(val) && (prm_row.comparison_type.empty() || prm_row.comparison_type == comparison_types.eq)) {
      if(is_calculated) {
        ok = val == prm_row.value;
      }
      else {
        if(ox.params) {
          ox.params.find_rows({
            cnstr: cnstr || 0,
            inset: (typeof origin !== 'number' && origin) || utils.blank.guid,
            param: this,
            value: val
          }, () => {
            ok = true;
            return false;
          });
        }
        else if(ox.product_params) {
          ox.product_params.find_rows({
            elm: elm.elm || 0,
            param: this,
            value: val
          }, () => {
            ok = true;
            return false;
          });
        }
      }
    }
    // вычисляемый параметр - его значение уже рассчитано формулой (val) - сравниваем со значением в строке ограничений
    else if(is_calculated) {
      const value = this.extract_value(prm_row);
      ok = utils.check_compare(val, value, prm_row.comparison_type, comparison_types);
    }
    // параметр явно указан в табчасти параметров изделия
    else {
      if(ox.params) {
        ox.params.find_rows({
          cnstr: cnstr || 0,
          inset: (typeof origin !== 'number' && origin) || utils.blank.guid,
          param: this
        }, ({value}) => {
          // value - значение из строки параметра текущей продукции, val - знаяение из параметров отбора
          ok = utils.check_compare(value, val, prm_row.comparison_type, comparison_types);
          return false;
        });
      }
      else if(ox.product_params) {
        ox.product_params.find_rows({
          elm: elm.elm || 0,
          param: this
        }, ({value}) => {
          // value - значение из строки параметра текущей продукции, val - знаяение из параметров отбора
          ok = utils.check_compare(value, val, prm_row.comparison_type, comparison_types);
          return false;
        });
      }
    }
    return ok;
  }

  /**
   * Извлекает значение параметра с учетом вычисляемости
   */
  extract_value({comparison_type, txt_row, value}) {

    switch (comparison_type) {

    case $p.enm.comparison_types.in:
    case $p.enm.comparison_types.nin:

      if(!txt_row) {
        return value;
      }
      try {
        const arr = JSON.parse(txt_row);
        const {types} = this.type;
        if(types && types.length == 1) {
          const mgr = $p.md.mgr_by_class_name(types[0]);
          return arr.map((ref) => mgr.get(ref, false));
        }
        return arr;
      }
      catch (err) {
        return value;
      }

    default:
      return value;
    }
  }

  /**
   * Возвращает массив связей текущего параметра
   */
  params_links(attr) {

    // первым делом, выясняем, есть ли ограничитель на текущий параметр
    if(!this.hasOwnProperty('_params_links')) {
      this._params_links = $p.cat.params_links.find_rows({slave: this});
    }

    return this._params_links.filter((link) => {
      //use_master бывает 0 - один ведущий, 1 - несколько ведущих через И, 2 - несколько ведущих через ИЛИ
      const use_master = link.use_master || 0;
      let ok = true && use_master < 2;
      //в зависимости от use_master у нас массив либо из одного, либо из нескольких ключей ведущиъ для проверки
      const arr = !use_master ? [{key:link.master}] : link.leadings;

      arr.forEach((row_key) => {
        let ok_key = true;
        // для всех записей ключа параметров
        row_key.key.params.forEach((row) => {
          // выполнение условия рассчитывает объект CchProperties
          ok_key = row.property.check_condition({
            cnstr: attr.grid.selection.cnstr,
            ox: attr.obj._owner._owner,
            prm_row: row,
            elm: attr.obj,
          });
          //Если строка условия в ключе не выполняется, то дальше проверять его условия смысла нет
          if (!ok_key) {
            return false;
          }
        });
        //Для проверки через ИЛИ логика накопительная - надо проверить все ключи до единого
        if (use_master == 2){
          ok = ok || ok_key;
        }
        //Для проверки через И достаточно найти один неподходящий ключ, чтобы остановиться и признать связь неподходящей
        else if (!ok_key){
          ok = false;
          return false;
        }
      });
      //Конечный возврат в функцию фильтрации массива связей
      return ok;
    });
  }

  /**
   * Проверяет и при необходимости перезаполняет или устанваливает умолчание value в prow
   */
  linked_values(links, prow) {
    const values = [];
    let changed;
    // собираем все доступные значения в одном массиве
    links.forEach((link) => link.values.forEach((row) => values.push(row)));
    // если значение доступно в списке - спокойно уходим
    if(values.some((row) => row._obj.value == prow.value)) {
      return;
    }
    // если есть явный default - устанавливаем
    if(values.some((row) => {
      if(row.forcibly) {
        prow.value = row._obj.value;
        return true;
      }
      if(row.by_default && (!prow.value || prow.value.empty && prow.value.empty())) {
        prow.value = row._obj.value;
        changed = true;
      }
    })) {
      return true;
    }
    // если не нашли лучшего, установим первый попавшийся
    if(changed) {
      return true;
    }
    if(values.length) {
      prow.value = values[0]._obj.value;
      return true;
    }
  }

  /**
   * ### Дополняет отбор фильтром по параметрам выбора
   * Используется в полях ввода экранных форм
   * @param filter {Object} - дополняемый фильтр
   * @param attr {Object} - атрибуты OCombo
   */
  filter_params_links(filter, attr, links) {
    // для всех отфильтрованных связей параметров
    if(!links) {
      links = this.params_links(attr);
    }
    links.forEach((link) => {
      // если ключ найден в параметрах, добавляем фильтр
      if(!filter.ref) {
        filter.ref = {in: []};
      }
      if(filter.ref.in) {
        link.values._obj.forEach((row) => {
          if(filter.ref.in.indexOf(row.value) == -1) {
            filter.ref.in.push(row.value);
          }
        });
      }
    });
  }}
$p.CchProperties = CchProperties;
class CchPropertiesManager extends ChartOfCharacteristicManager {

  /**
   * ### Проверяет заполненность обязательных полей
   *
   * @method check_mandatory
   * @override
   * @param prms {Array}
   * @param title {String}
   * @return {Boolean}
   */
  check_mandatory(prms, title) {

    var t, row;

    // проверяем заполненность полей
    for (t in prms) {
      row = prms[t];
      if(row.param.mandatory && (!row.value || row.value.empty())) {
        $p.msg.show_msg({
          type: 'alert-error',
          text: $p.msg.bld_empty_param + row.param.presentation,
          title: title || $p.msg.bld_title
        });
        return true;
      }
    }
  }

  /**
   * ### Возвращает массив доступных для данного свойства значений
   *
   * @method slist
   * @override
   * @param prop {CatObj} - планвидовхарактеристик ссылка или объект
   * @param ret_mgr {Object} - установить в этом объекте указатель на менеджера объекта
   * @return {Array}
   */
  slist(prop, ret_mgr) {

    var res = [], rt, at, pmgr, op = this.get(prop);

    if(op && op.type.is_ref) {
      // параметры получаем из локального кеша
      for (rt in op.type.types)
        if(op.type.types[rt].indexOf('.') > -1) {
          at = op.type.types[rt].split('.');
          pmgr = $p[at[0]][at[1]];
          if(pmgr) {

            if(ret_mgr) {
              ret_mgr.mgr = pmgr;
            }

            if(pmgr.class_name == 'enm.open_directions') {
              pmgr.get_option_list().forEach((v) => v.value && v.value != $p.enm.tso.folding && res.push(v));
            }
            else if(pmgr.class_name.indexOf('enm.') != -1 || !pmgr.metadata().has_owners) {
              res = pmgr.get_option_list();
            }
            else {
              pmgr.find_rows({owner: prop}, (v) => res.push({value: v.ref, text: v.presentation}));
            }
          }
        }
    }
    return res;
  }

}
$p.cch.create('properties', CchPropertiesManager, false);

/**
* ### Справочник СвязиПараметров
* Подчиненные параметры
* @class CatParams_links
* @extends CatObj
* @constructor 
*/
class CatParams_links extends CatObj{
get master(){return this._getter('master')}
set master(v){this._setter('master',v)}
get slave(){return this._getter('slave')}
set slave(v){this._setter('slave',v)}
get hide(){return this._getter('hide')}
set hide(v){this._setter('hide',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get use_master(){return this._getter('use_master')}
set use_master(v){this._setter('use_master',v)}
get captured(){return this._getter('captured')}
set captured(v){this._setter('captured',v)}
get editor(){return this._getter('editor')}
set editor(v){this._setter('editor',v)}
get zone(){return this._getter('zone')}
set zone(v){this._setter('zone',v)}
get zones(){return this._getter('zones')}
set zones(v){this._setter('zones',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get leadings(){return this._getter_ts('leadings')}
set leadings(v){this._setter_ts('leadings',v)}
get values(){return this._getter_ts('values')}
set values(v){this._setter_ts('values',v)}
}
$p.CatParams_links = CatParams_links;
class CatParams_linksLeadingsRow extends TabularSectionRow{
get key(){return this._getter('key')}
set key(v){this._setter('key',v)}
}
$p.CatParams_linksLeadingsRow = CatParams_linksLeadingsRow;
class CatParams_linksValuesRow extends TabularSectionRow{
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get by_default(){return this._getter('by_default')}
set by_default(v){this._setter('by_default',v)}
get forcibly(){return this._getter('forcibly')}
set forcibly(v){this._setter('forcibly',v)}
}
$p.CatParams_linksValuesRow = CatParams_linksValuesRow;
$p.cat.create('params_links');

/**
* ### Справочник пзЦвета
* Цвета
* @class CatClrs
* @extends CatObj
* @constructor 
*/
class CatClrs extends CatObj{
get ral(){return this._getter('ral')}
set ral(v){this._setter('ral',v)}
get machine_tools_clr(){return this._getter('machine_tools_clr')}
set machine_tools_clr(v){this._setter('machine_tools_clr',v)}
get clr_str(){return this._getter('clr_str')}
set clr_str(v){this._setter('clr_str',v)}
get clr_out(){return this._getter('clr_out')}
set clr_out(v){this._setter('clr_out',v)}
get clr_in(){return this._getter('clr_in')}
set clr_in(v){this._setter('clr_in',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
}
$p.CatClrs = CatClrs;
$p.cat.create('clrs');

/**
* ### Справочник СтраныМира
* Страны мира
* @class CatCountries
* @extends CatObj
* @constructor 
*/
class CatCountries extends CatObj{
get name_full(){return this._getter('name_full')}
set name_full(v){this._setter('name_full',v)}
get alpha2(){return this._getter('alpha2')}
set alpha2(v){this._setter('alpha2',v)}
get alpha3(){return this._getter('alpha3')}
set alpha3(v){this._setter('alpha3',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
}
$p.CatCountries = CatCountries;
$p.cat.create('countries');

/**
* ### Справочник БанковскиеСчетаКонтрагентов
* Банковские счета сторонних контрагентов и физических лиц.
* @class CatPartner_bank_accounts
* @extends CatObj
* @constructor 
*/
class CatPartner_bank_accounts extends CatObj{
get account_number(){return this._getter('account_number')}
set account_number(v){this._setter('account_number',v)}
get bank(){return this._getter('bank')}
set bank(v){this._setter('bank',v)}
get settlements_bank(){return this._getter('settlements_bank')}
set settlements_bank(v){this._setter('settlements_bank',v)}
get correspondent_text(){return this._getter('correspondent_text')}
set correspondent_text(v){this._setter('correspondent_text',v)}
get appointments_text(){return this._getter('appointments_text')}
set appointments_text(v){this._setter('appointments_text',v)}
get funds_currency(){return this._getter('funds_currency')}
set funds_currency(v){this._setter('funds_currency',v)}
get bank_bic(){return this._getter('bank_bic')}
set bank_bic(v){this._setter('bank_bic',v)}
get bank_name(){return this._getter('bank_name')}
set bank_name(v){this._setter('bank_name',v)}
get bank_correspondent_account(){return this._getter('bank_correspondent_account')}
set bank_correspondent_account(v){this._setter('bank_correspondent_account',v)}
get bank_city(){return this._getter('bank_city')}
set bank_city(v){this._setter('bank_city',v)}
get bank_address(){return this._getter('bank_address')}
set bank_address(v){this._setter('bank_address',v)}
get bank_phone_numbers(){return this._getter('bank_phone_numbers')}
set bank_phone_numbers(v){this._setter('bank_phone_numbers',v)}
get settlements_bank_bic(){return this._getter('settlements_bank_bic')}
set settlements_bank_bic(v){this._setter('settlements_bank_bic',v)}
get settlements_bank_correspondent_account(){return this._getter('settlements_bank_correspondent_account')}
set settlements_bank_correspondent_account(v){this._setter('settlements_bank_correspondent_account',v)}
get settlements_bank_city(){return this._getter('settlements_bank_city')}
set settlements_bank_city(v){this._setter('settlements_bank_city',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get owner(){return this._getter('owner')}
set owner(v){this._setter('owner',v)}
}
$p.CatPartner_bank_accounts = CatPartner_bank_accounts;
$p.cat.create('partner_bank_accounts');

/**
* ### Справочник БанковскиеСчетаОрганизаций
* Банковские счета собственных организаций. 
* @class CatOrganization_bank_accounts
* @extends CatObj
* @constructor 
*/
class CatOrganization_bank_accounts extends CatObj{
get bank(){return this._getter('bank')}
set bank(v){this._setter('bank',v)}
get bank_bic(){return this._getter('bank_bic')}
set bank_bic(v){this._setter('bank_bic',v)}
get funds_currency(){return this._getter('funds_currency')}
set funds_currency(v){this._setter('funds_currency',v)}
get account_number(){return this._getter('account_number')}
set account_number(v){this._setter('account_number',v)}
get settlements_bank(){return this._getter('settlements_bank')}
set settlements_bank(v){this._setter('settlements_bank',v)}
get settlements_bank_bic(){return this._getter('settlements_bank_bic')}
set settlements_bank_bic(v){this._setter('settlements_bank_bic',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get owner(){return this._getter('owner')}
set owner(v){this._setter('owner',v)}
}
$p.CatOrganization_bank_accounts = CatOrganization_bank_accounts;
$p.cat.create('organization_bank_accounts');

/**
* ### Справочник ЗначенияСвойствОбъектовИерархия
* Дополнительные значения (иерархия)
* @class CatProperty_values_hierarchy
* @extends CatObj
* @constructor 
*/
class CatProperty_values_hierarchy extends CatObj{
get heft(){return this._getter('heft')}
set heft(v){this._setter('heft',v)}
get ПолноеНаименование(){return this._getter('ПолноеНаименование')}
set ПолноеНаименование(v){this._setter('ПолноеНаименование',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get owner(){return this._getter('owner')}
set owner(v){this._setter('owner',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
}
$p.CatProperty_values_hierarchy = CatProperty_values_hierarchy;
$p.cat.create('property_values_hierarchy');

/**
* ### Справочник КлассификаторБанковРФ
* Классификатор банков РФ
* @class CatBanks_qualifier
* @extends CatObj
* @constructor 
*/
class CatBanks_qualifier extends CatObj{
get correspondent_account(){return this._getter('correspondent_account')}
set correspondent_account(v){this._setter('correspondent_account',v)}
get city(){return this._getter('city')}
set city(v){this._setter('city',v)}
get address(){return this._getter('address')}
set address(v){this._setter('address',v)}
get phone_numbers(){return this._getter('phone_numbers')}
set phone_numbers(v){this._setter('phone_numbers',v)}
get activity_ceased(){return this._getter('activity_ceased')}
set activity_ceased(v){this._setter('activity_ceased',v)}
get swift(){return this._getter('swift')}
set swift(v){this._setter('swift',v)}
get inn(){return this._getter('inn')}
set inn(v){this._setter('inn',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
}
$p.CatBanks_qualifier = CatBanks_qualifier;
$p.cat.create('banks_qualifier');

/**
* ### Справочник НаборыДополнительныхРеквизитовИСведений
* Наборы дополнительных реквизитов и сведений
* @class CatDestinations
* @extends CatObj
* @constructor 
*/
class CatDestinations extends CatObj{
get КоличествоРеквизитов(){return this._getter('КоличествоРеквизитов')}
set КоличествоРеквизитов(v){this._setter('КоличествоРеквизитов',v)}
get КоличествоСведений(){return this._getter('КоличествоСведений')}
set КоличествоСведений(v){this._setter('КоличествоСведений',v)}
get Используется(){return this._getter('Используется')}
set Используется(v){this._setter('Используется',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
get extra_properties(){return this._getter_ts('extra_properties')}
set extra_properties(v){this._setter_ts('extra_properties',v)}
}
$p.CatDestinations = CatDestinations;
class CatDestinationsExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get _deleted(){return this._getter('_deleted')}
set _deleted(v){this._setter('_deleted',v)}
}
$p.CatDestinationsExtra_fieldsRow = CatDestinationsExtra_fieldsRow;
class CatDestinationsExtra_propertiesRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get _deleted(){return this._getter('_deleted')}
set _deleted(v){this._setter('_deleted',v)}
}
$p.CatDestinationsExtra_propertiesRow = CatDestinationsExtra_propertiesRow;
$p.cat.create('destinations');

/**
* ### Справочник Формулы
* Формулы пользователя, для выполнения при расчете спецификаций в справочниках Вставки, Соединения, Фурнитура и регистре Корректировки спецификации
* @class CatFormulas
* @extends CatObj
* @constructor 
*/
class CatFormulas extends CatObj{
get formula(){return this._getter('formula')}
set formula(v){this._setter('formula',v)}
get leading_formula(){return this._getter('leading_formula')}
set leading_formula(v){this._setter('leading_formula',v)}
get condition_formula(){return this._getter('condition_formula')}
set condition_formula(v){this._setter('condition_formula',v)}
get definition(){return this._getter('definition')}
set definition(v){this._setter('definition',v)}
get template(){return this._getter('template')}
set template(v){this._setter('template',v)}
get sorting_field(){return this._getter('sorting_field')}
set sorting_field(v){this._setter('sorting_field',v)}
get async(){return this._getter('async')}
set async(v){this._setter('async',v)}
get disabled(){return this._getter('disabled')}
set disabled(v){this._setter('disabled',v)}
get zone(){return this._getter('zone')}
set zone(v){this._setter('zone',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get params(){return this._getter_ts('params')}
set params(v){this._setter_ts('params',v)}


  execute(obj, attr) {

    const {_manager, _data} = this;
    const {$p} = _manager._owner;

    // создаём функцию из текста формулы
    if(!_data._formula && this.formula){
      try{
        if(this.async){
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          _data._formula = (new AsyncFunction("obj,$p,attr", this.formula)).bind(this);
        }
        else{
          _data._formula = (new Function("obj,$p,attr", this.formula)).bind(this);
        }
      }
      catch(err){
        _data._formula = () => false;
        $p.record_log(err);
      }
    }

    const {_formula} = _data;

    if(this.parent == _manager.predefined("printing_plates")){

      if(!_formula){
        $p.msg.show_msg({
          title: $p.msg.bld_title,
          type: "alert-error",
          text: `Ошибка в формуле<br /><b>${this.name}</b>`
        });
        return Promise.resolve();
      }

      // получаем HTMLDivElement с отчетом
      return _formula(obj, $p, attr)

      // показываем отчет в отдельном окне
        .then((doc) => doc instanceof $p.SpreadsheetDocument && doc.print());

    }
    else{
      return _formula && _formula(obj, $p, attr)
    }

  }

  get _template() {
    const {_data} = this;
    if(!_data._template){
      _data._template = new this._manager._owner.$p.SpreadsheetDocument(this.template);
    }
    return _data._template;
  }
}
$p.CatFormulas = CatFormulas;
class CatFormulasParamsRow extends TabularSectionRow{
get param(){return this._getter('param')}
set param(v){this._setter('param',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
}
$p.CatFormulasParamsRow = CatFormulasParamsRow;
class CatFormulasManager extends CatManager {

  constructor(owner, class_name) {
    super(owner, class_name);
    this._owner.$p.adapters.pouch.once('pouch_doc_ram_start', () => this.load_formulas());
  }

  load_formulas() {
    const {md, utils} = this._owner.$p;
    const parents = [this.predefined('printing_plates'), this.predefined('modifiers')];
    const filtered = [];
    this.forEach((v) => {
      !v.disabled && parents.indexOf(v.parent) !== -1 && filtered.push(v)
    });
    filtered.sort((a, b) => a.sorting_field - b.sorting_field).forEach((formula) => {
      // формируем списки печатных форм и внешних обработок
      if(formula.parent == parents[0]) {
        formula.params.find_rows({param: 'destination'}, (dest) => {
          const dmgr = md.mgr_by_class_name(dest.value);
          if(dmgr) {
            if(!dmgr._printing_plates) {
              dmgr._printing_plates = {};
            }
            dmgr._printing_plates[`prn_${formula.ref}`] = formula;
          }
        });
      }
      else {
        // выполняем модификаторы
        try {
          utils.cron ? utils.cron(formula.execute()) : formula.execute();
        }
        catch (err) {
        }
      }
    });
  }

  // переопределяем load_array - не грузим неактивные формулы
  load_array(aattr, forse) {
    super.load_array(aattr.filter((v) => {
      return !v.disabled || v.is_folder;
    }), forse);
  }

}
$p.cat.create('formulas', CatFormulasManager, false);

/**
* ### Справочник пзВизуализацияЭлементов
* Строки svg для рисования петель, ручек и графических примитивов
* @class CatElm_visualization
* @extends CatObj
* @constructor 
*/
class CatElm_visualization extends CatObj{
get svg_path(){return this._getter('svg_path')}
set svg_path(v){this._setter('svg_path',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get attributes(){return this._getter('attributes')}
set attributes(v){this._setter('attributes',v)}
get rotate(){return this._getter('rotate')}
set rotate(v){this._setter('rotate',v)}
get offset(){return this._getter('offset')}
set offset(v){this._setter('offset',v)}
get side(){return this._getter('side')}
set side(v){this._setter('side',v)}
get elm_side(){return this._getter('elm_side')}
set elm_side(v){this._setter('elm_side',v)}
get cx(){return this._getter('cx')}
set cx(v){this._setter('cx',v)}
get cy(){return this._getter('cy')}
set cy(v){this._setter('cy',v)}
get angle_hor(){return this._getter('angle_hor')}
set angle_hor(v){this._setter('angle_hor',v)}
get priority(){return this._getter('priority')}
set priority(v){this._setter('priority',v)}
get mode(){return this._getter('mode')}
set mode(v){this._setter('mode',v)}
get captured(){return this._getter('captured')}
set captured(v){this._setter('captured',v)}
get editor(){return this._getter('editor')}
set editor(v){this._setter('editor',v)}
get zones(){return this._getter('zones')}
set zones(v){this._setter('zones',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
}
$p.CatElm_visualization = CatElm_visualization;
$p.cat.create('elm_visualization');

/**
* ### Справочник ИнтеграцияОтделыАбонентов
* Отделы абонентов
* @class CatBranches
* @extends CatObj
* @constructor 
*/
class CatBranches extends CatObj{
get suffix(){return this._getter('suffix')}
set suffix(v){this._setter('suffix',v)}
get direct(){return this._getter('direct')}
set direct(v){this._setter('direct',v)}
get use(){return this._getter('use')}
set use(v){this._setter('use',v)}
get mode(){return this._getter('mode')}
set mode(v){this._setter('mode',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get organizations(){return this._getter_ts('organizations')}
set organizations(v){this._setter_ts('organizations',v)}
get partners(){return this._getter_ts('partners')}
set partners(v){this._setter_ts('partners',v)}
get divisions(){return this._getter_ts('divisions')}
set divisions(v){this._setter_ts('divisions',v)}
get price_types(){return this._getter_ts('price_types')}
set price_types(v){this._setter_ts('price_types',v)}
get keys(){return this._getter_ts('keys')}
set keys(v){this._setter_ts('keys',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
}
$p.CatBranches = CatBranches;
class CatBranchesOrganizationsRow extends TabularSectionRow{
get acl_obj(){return this._getter('acl_obj')}
set acl_obj(v){this._setter('acl_obj',v)}
get by_default(){return this._getter('by_default')}
set by_default(v){this._setter('by_default',v)}
}
$p.CatBranchesOrganizationsRow = CatBranchesOrganizationsRow;
class CatBranchesPartnersRow extends TabularSectionRow{
get acl_obj(){return this._getter('acl_obj')}
set acl_obj(v){this._setter('acl_obj',v)}
get by_default(){return this._getter('by_default')}
set by_default(v){this._setter('by_default',v)}
}
$p.CatBranchesPartnersRow = CatBranchesPartnersRow;
class CatBranchesDivisionsRow extends TabularSectionRow{
get acl_obj(){return this._getter('acl_obj')}
set acl_obj(v){this._setter('acl_obj',v)}
get by_default(){return this._getter('by_default')}
set by_default(v){this._setter('by_default',v)}
}
$p.CatBranchesDivisionsRow = CatBranchesDivisionsRow;
class CatBranchesPrice_typesRow extends TabularSectionRow{
get acl_obj(){return this._getter('acl_obj')}
set acl_obj(v){this._setter('acl_obj',v)}
}
$p.CatBranchesPrice_typesRow = CatBranchesPrice_typesRow;
class CatBranchesKeysRow extends TabularSectionRow{
get acl_obj(){return this._getter('acl_obj')}
set acl_obj(v){this._setter('acl_obj',v)}
}
$p.CatBranchesKeysRow = CatBranchesKeysRow;
class CatBranchesExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.CatBranchesExtra_fieldsRow = CatBranchesExtra_fieldsRow;
class CatBranchesManager extends CatManager {

  constructor (owner, class_name) {
    super(owner, class_name);

    // после загрузки данных, надо настроить отборы в метаданных полей рисовалки
    $p.adapters.pouch.once("pouch_complete_loaded", () => {
      if($p.job_prm.properties && $p.current_user && !$p.current_user.branch.empty() && $p.job_prm.builder) {

        const {ПараметрВыбора} = $p.enm.parameters_keys_applying;
        const {furn, sys} = $p.job_prm.properties;

        // накапливаем
        $p.current_user.branch.load()
          .then(({keys}) => {
            const branch_filter = $p.job_prm.builder.branch_filter = {furn: [], sys: []};
            keys.forEach(({acl_obj}) => {
              if(acl_obj.applying == ПараметрВыбора) {
                acl_obj.params.forEach(({property, value}) => {
                  if(property === furn) {
                    branch_filter.furn.push(value);
                  }
                  else if(property === sys) {
                    branch_filter.sys.push(value);
                  }
                });
              }
            });
            return branch_filter;
          })
          .then((branch_filter) => {

            // применяем
            if(branch_filter.furn.length) {
              const mf = $p.cat.characteristics.metadata('constructions').fields.furn;
              mf.choice_params.push({
                name: "ref",
                path: {inh: branch_filter.furn}
              });
            }
            if(branch_filter.sys.length) {
              const mf = $p.dp.buyers_order.metadata().fields.sys;
              mf.choice_params = [{
                name: "ref",
                path: {inh: branch_filter.sys}
              }];
            }

          });

      }
    });
  }

}
$p.cat.create('branches', CatBranchesManager, false);

/**
* ### Справочник пзФурнитура
* Описывает ограничения и правила формирования спецификаций фурнитуры
* @class CatFurns
* @extends CatObj
* @constructor 
*/
class CatFurns extends CatObj{
get flap_weight_max(){return this._getter('flap_weight_max')}
set flap_weight_max(v){this._setter('flap_weight_max',v)}
get left_right(){return this._getter('left_right')}
set left_right(v){this._setter('left_right',v)}
get is_set(){return this._getter('is_set')}
set is_set(v){this._setter('is_set',v)}
get is_sliding(){return this._getter('is_sliding')}
set is_sliding(v){this._setter('is_sliding',v)}
get furn_set(){return this._getter('furn_set')}
set furn_set(v){this._setter('furn_set',v)}
get side_count(){return this._getter('side_count')}
set side_count(v){this._setter('side_count',v)}
get handle_side(){return this._getter('handle_side')}
set handle_side(v){this._setter('handle_side',v)}
get open_type(){return this._getter('open_type')}
set open_type(v){this._setter('open_type',v)}
get name_short(){return this._getter('name_short')}
set name_short(v){this._setter('name_short',v)}
get captured(){return this._getter('captured')}
set captured(v){this._setter('captured',v)}
get editor(){return this._getter('editor')}
set editor(v){this._setter('editor',v)}
get zones(){return this._getter('zones')}
set zones(v){this._setter('zones',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get open_tunes(){return this._getter_ts('open_tunes')}
set open_tunes(v){this._setter_ts('open_tunes',v)}
get specification(){return this._getter_ts('specification')}
set specification(v){this._setter_ts('specification',v)}
get selection_params(){return this._getter_ts('selection_params')}
set selection_params(v){this._setter_ts('selection_params',v)}
get specification_restrictions(){return this._getter_ts('specification_restrictions')}
set specification_restrictions(v){this._setter_ts('specification_restrictions',v)}
get colors(){return this._getter_ts('colors')}
set colors(v){this._setter_ts('colors',v)}
}
$p.CatFurns = CatFurns;
class CatFurnsOpen_tunesRow extends TabularSectionRow{
get side(){return this._getter('side')}
set side(v){this._setter('side',v)}
get lmin(){return this._getter('lmin')}
set lmin(v){this._setter('lmin',v)}
get lmax(){return this._getter('lmax')}
set lmax(v){this._setter('lmax',v)}
get amin(){return this._getter('amin')}
set amin(v){this._setter('amin',v)}
get amax(){return this._getter('amax')}
set amax(v){this._setter('amax',v)}
get arc_available(){return this._getter('arc_available')}
set arc_available(v){this._setter('arc_available',v)}
get shtulp_available(){return this._getter('shtulp_available')}
set shtulp_available(v){this._setter('shtulp_available',v)}
get shtulp_fix_here(){return this._getter('shtulp_fix_here')}
set shtulp_fix_here(v){this._setter('shtulp_fix_here',v)}
get rotation_axis(){return this._getter('rotation_axis')}
set rotation_axis(v){this._setter('rotation_axis',v)}
get partial_opening(){return this._getter('partial_opening')}
set partial_opening(v){this._setter('partial_opening',v)}
get outline(){return this._getter('outline')}
set outline(v){this._setter('outline',v)}
}
$p.CatFurnsOpen_tunesRow = CatFurnsOpen_tunesRow;
class CatFurnsSpecificationRow extends TabularSectionRow{
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get dop(){return this._getter('dop')}
set dop(v){this._setter('dop',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get nom_characteristic(){return this._getter('nom_characteristic')}
set nom_characteristic(v){this._setter('nom_characteristic',v)}
get quantity(){return this._getter('quantity')}
set quantity(v){this._setter('quantity',v)}
get handle_height_base(){return this._getter('handle_height_base')}
set handle_height_base(v){this._setter('handle_height_base',v)}
get fix_ruch(){return this._getter('fix_ruch')}
set fix_ruch(v){this._setter('fix_ruch',v)}
get handle_height_min(){return this._getter('handle_height_min')}
set handle_height_min(v){this._setter('handle_height_min',v)}
get handle_height_max(){return this._getter('handle_height_max')}
set handle_height_max(v){this._setter('handle_height_max',v)}
get contraction(){return this._getter('contraction')}
set contraction(v){this._setter('contraction',v)}
get contraction_option(){return this._getter('contraction_option')}
set contraction_option(v){this._setter('contraction_option',v)}
get coefficient(){return this._getter('coefficient')}
set coefficient(v){this._setter('coefficient',v)}
get flap_weight_min(){return this._getter('flap_weight_min')}
set flap_weight_min(v){this._setter('flap_weight_min',v)}
get flap_weight_max(){return this._getter('flap_weight_max')}
set flap_weight_max(v){this._setter('flap_weight_max',v)}
get side(){return this._getter('side')}
set side(v){this._setter('side',v)}
get cnn_side(){return this._getter('cnn_side')}
set cnn_side(v){this._setter('cnn_side',v)}
get offset_option(){return this._getter('offset_option')}
set offset_option(v){this._setter('offset_option',v)}
get formula(){return this._getter('formula')}
set formula(v){this._setter('formula',v)}
get transfer_option(){return this._getter('transfer_option')}
set transfer_option(v){this._setter('transfer_option',v)}
get overmeasure(){return this._getter('overmeasure')}
set overmeasure(v){this._setter('overmeasure',v)}
get is_main_specification_row(){return this._getter('is_main_specification_row')}
set is_main_specification_row(v){this._setter('is_main_specification_row',v)}
get is_set_row(){return this._getter('is_set_row')}
set is_set_row(v){this._setter('is_set_row',v)}
get is_procedure_row(){return this._getter('is_procedure_row')}
set is_procedure_row(v){this._setter('is_procedure_row',v)}
get is_order_row(){return this._getter('is_order_row')}
set is_order_row(v){this._setter('is_order_row',v)}
}
$p.CatFurnsSpecificationRow = CatFurnsSpecificationRow;
class CatFurnsSelection_paramsRow extends TabularSectionRow{
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get dop(){return this._getter('dop')}
set dop(v){this._setter('dop',v)}
get param(){return this._getter('param')}
set param(v){this._setter('param',v)}
get comparison_type(){return this._getter('comparison_type')}
set comparison_type(v){this._setter('comparison_type',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.CatFurnsSelection_paramsRow = CatFurnsSelection_paramsRow;
class CatFurnsSpecification_restrictionsRow extends TabularSectionRow{
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get dop(){return this._getter('dop')}
set dop(v){this._setter('dop',v)}
get side(){return this._getter('side')}
set side(v){this._setter('side',v)}
get lmin(){return this._getter('lmin')}
set lmin(v){this._setter('lmin',v)}
get lmax(){return this._getter('lmax')}
set lmax(v){this._setter('lmax',v)}
get amin(){return this._getter('amin')}
set amin(v){this._setter('amin',v)}
get amax(){return this._getter('amax')}
set amax(v){this._setter('amax',v)}
get for_direct_profile_only(){return this._getter('for_direct_profile_only')}
set for_direct_profile_only(v){this._setter('for_direct_profile_only',v)}
}
$p.CatFurnsSpecification_restrictionsRow = CatFurnsSpecification_restrictionsRow;
class CatFurnsColorsRow extends TabularSectionRow{
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
}
$p.CatFurnsColorsRow = CatFurnsColorsRow;
$p.cat.create('furns');

/**
* ### Справочник Валюты
* Валюты, используемые при расчетах
* @class CatCurrencies
* @extends CatObj
* @constructor 
*/
class CatCurrencies extends CatObj{
get name_full(){return this._getter('name_full')}
set name_full(v){this._setter('name_full',v)}
get extra_charge(){return this._getter('extra_charge')}
set extra_charge(v){this._setter('extra_charge',v)}
get main_currency(){return this._getter('main_currency')}
set main_currency(v){this._setter('main_currency',v)}
get parameters_russian_recipe(){return this._getter('parameters_russian_recipe')}
set parameters_russian_recipe(v){this._setter('parameters_russian_recipe',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
}
$p.CatCurrencies = CatCurrencies;
$p.cat.create('currencies');

/**
* ### Справочник ВидыКонтактнойИнформации
* Виды контактной информации
* @class CatContact_information_kinds
* @extends CatObj
* @constructor 
*/
class CatContact_information_kinds extends CatObj{
get mandatory_fields(){return this._getter('mandatory_fields')}
set mandatory_fields(v){this._setter('mandatory_fields',v)}
get type(){return this._getter('type')}
set type(v){this._setter('type',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
}
$p.CatContact_information_kinds = CatContact_information_kinds;
$p.cat.create('contact_information_kinds');

/**
* ### Справочник ВидыНоменклатуры
* Виды номенклатуры
* @class CatNom_kinds
* @extends CatObj
* @constructor 
*/
class CatNom_kinds extends CatObj{
get nom_type(){return this._getter('nom_type')}
set nom_type(v){this._setter('nom_type',v)}
get dnom(){return this._getter('dnom')}
set dnom(v){this._setter('dnom',v)}
get dcharacteristic(){return this._getter('dcharacteristic')}
set dcharacteristic(v){this._setter('dcharacteristic',v)}
get captured(){return this._getter('captured')}
set captured(v){this._setter('captured',v)}
get zones(){return this._getter('zones')}
set zones(v){this._setter('zones',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
}
$p.CatNom_kinds = CatNom_kinds;
$p.cat.create('nom_kinds');

/**
* ### Справочник ДоговорыКонтрагентов
* Перечень договоров, заключенных с контрагентами
* @class CatContracts
* @extends CatObj
* @constructor 
*/
class CatContracts extends CatObj{
get settlements_currency(){return this._getter('settlements_currency')}
set settlements_currency(v){this._setter('settlements_currency',v)}
get mutual_settlements(){return this._getter('mutual_settlements')}
set mutual_settlements(v){this._setter('mutual_settlements',v)}
get contract_kind(){return this._getter('contract_kind')}
set contract_kind(v){this._setter('contract_kind',v)}
get date(){return this._getter('date')}
set date(v){this._setter('date',v)}
get check_days_without_pay(){return this._getter('check_days_without_pay')}
set check_days_without_pay(v){this._setter('check_days_without_pay',v)}
get allowable_debts_amount(){return this._getter('allowable_debts_amount')}
set allowable_debts_amount(v){this._setter('allowable_debts_amount',v)}
get allowable_debts_days(){return this._getter('allowable_debts_days')}
set allowable_debts_days(v){this._setter('allowable_debts_days',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get check_debts_amount(){return this._getter('check_debts_amount')}
set check_debts_amount(v){this._setter('check_debts_amount',v)}
get check_debts_days(){return this._getter('check_debts_days')}
set check_debts_days(v){this._setter('check_debts_days',v)}
get number_doc(){return this._getter('number_doc')}
set number_doc(v){this._setter('number_doc',v)}
get organization(){return this._getter('organization')}
set organization(v){this._setter('organization',v)}
get main_cash_flow_article(){return this._getter('main_cash_flow_article')}
set main_cash_flow_article(v){this._setter('main_cash_flow_article',v)}
get main_project(){return this._getter('main_project')}
set main_project(v){this._setter('main_project',v)}
get accounting_reflect(){return this._getter('accounting_reflect')}
set accounting_reflect(v){this._setter('accounting_reflect',v)}
get tax_accounting_reflect(){return this._getter('tax_accounting_reflect')}
set tax_accounting_reflect(v){this._setter('tax_accounting_reflect',v)}
get prepayment_percent(){return this._getter('prepayment_percent')}
set prepayment_percent(v){this._setter('prepayment_percent',v)}
get validity(){return this._getter('validity')}
set validity(v){this._setter('validity',v)}
get vat_included(){return this._getter('vat_included')}
set vat_included(v){this._setter('vat_included',v)}
get price_type(){return this._getter('price_type')}
set price_type(v){this._setter('price_type',v)}
get vat_consider(){return this._getter('vat_consider')}
set vat_consider(v){this._setter('vat_consider',v)}
get days_without_pay(){return this._getter('days_without_pay')}
set days_without_pay(v){this._setter('days_without_pay',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get owner(){return this._getter('owner')}
set owner(v){this._setter('owner',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
}
$p.CatContracts = CatContracts;
$p.cat.create('contracts');

/**
* ### Справочник ЕдиницыИзмерения
* Перечень единиц измерения номенклатуры и номенклатурных групп
* @class CatNom_units
* @extends CatObj
* @constructor 
*/
class CatNom_units extends CatObj{
get qualifier_unit(){return this._getter('qualifier_unit')}
set qualifier_unit(v){this._setter('qualifier_unit',v)}
get heft(){return this._getter('heft')}
set heft(v){this._setter('heft',v)}
get volume(){return this._getter('volume')}
set volume(v){this._setter('volume',v)}
get coefficient(){return this._getter('coefficient')}
set coefficient(v){this._setter('coefficient',v)}
get rounding_threshold(){return this._getter('rounding_threshold')}
set rounding_threshold(v){this._setter('rounding_threshold',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get owner(){return this._getter('owner')}
set owner(v){this._setter('owner',v)}
}
$p.CatNom_units = CatNom_units;
$p.cat.create('nom_units');

/**
* ### Справочник ЗначенияСвойствОбъектов
* Дополнительные значения
* @class CatProperty_values
* @extends CatObj
* @constructor 
*/
class CatProperty_values extends CatObj{
get heft(){return this._getter('heft')}
set heft(v){this._setter('heft',v)}
get ПолноеНаименование(){return this._getter('ПолноеНаименование')}
set ПолноеНаименование(v){this._setter('ПолноеНаименование',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get owner(){return this._getter('owner')}
set owner(v){this._setter('owner',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
}
$p.CatProperty_values = CatProperty_values;
$p.cat.create('property_values');

/**
* ### Справочник ИдентификаторыОбъектовМетаданных
* Идентификаторы объектов метаданных для использования в базе данных.
* @class CatMeta_ids
* @extends CatObj
* @constructor 
*/
class CatMeta_ids extends CatObj{
get full_moniker(){return this._getter('full_moniker')}
set full_moniker(v){this._setter('full_moniker',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
}
$p.CatMeta_ids = CatMeta_ids;
$p.cat.create('meta_ids');

/**
* ### Справочник Кассы
* Список мест фактического хранения и движения наличных денежных средств предприятия. Кассы разделены по организациям и валютам денежных средств. 
* @class CatCashboxes
* @extends CatObj
* @constructor 
*/
class CatCashboxes extends CatObj{
get funds_currency(){return this._getter('funds_currency')}
set funds_currency(v){this._setter('funds_currency',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get current_account(){return this._getter('current_account')}
set current_account(v){this._setter('current_account',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get owner(){return this._getter('owner')}
set owner(v){this._setter('owner',v)}
}
$p.CatCashboxes = CatCashboxes;
$p.cat.create('cashboxes');

/**
* ### Справочник КлассификаторЕдиницИзмерения
* Классификатор единиц измерения
* @class CatUnits
* @extends CatObj
* @constructor 
*/
class CatUnits extends CatObj{
get name_full(){return this._getter('name_full')}
set name_full(v){this._setter('name_full',v)}
get international_short(){return this._getter('international_short')}
set international_short(v){this._setter('international_short',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
}
$p.CatUnits = CatUnits;
$p.cat.create('units');

/**
* ### Справочник Контрагенты
* Список юридических или физических лиц клиентов (поставщиков, покупателей).
* @class CatPartners
* @extends CatObj
* @constructor 
*/
class CatPartners extends CatObj{
get name_full(){return this._getter('name_full')}
set name_full(v){this._setter('name_full',v)}
get main_bank_account(){return this._getter('main_bank_account')}
set main_bank_account(v){this._setter('main_bank_account',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get kpp(){return this._getter('kpp')}
set kpp(v){this._setter('kpp',v)}
get okpo(){return this._getter('okpo')}
set okpo(v){this._setter('okpo',v)}
get inn(){return this._getter('inn')}
set inn(v){this._setter('inn',v)}
get individual_legal(){return this._getter('individual_legal')}
set individual_legal(v){this._setter('individual_legal',v)}
get main_contract(){return this._getter('main_contract')}
set main_contract(v){this._setter('main_contract',v)}
get identification_document(){return this._getter('identification_document')}
set identification_document(v){this._setter('identification_document',v)}
get buyer_main_manager(){return this._getter('buyer_main_manager')}
set buyer_main_manager(v){this._setter('buyer_main_manager',v)}
get is_buyer(){return this._getter('is_buyer')}
set is_buyer(v){this._setter('is_buyer',v)}
get is_supplier(){return this._getter('is_supplier')}
set is_supplier(v){this._setter('is_supplier',v)}
get primary_contact(){return this._getter('primary_contact')}
set primary_contact(v){this._setter('primary_contact',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get contact_information(){return this._getter_ts('contact_information')}
set contact_information(v){this._setter_ts('contact_information',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
}
$p.CatPartners = CatPartners;
class CatPartnersContact_informationRow extends TabularSectionRow{
get type(){return this._getter('type')}
set type(v){this._setter('type',v)}
get kind(){return this._getter('kind')}
set kind(v){this._setter('kind',v)}
get presentation(){return this._getter('presentation')}
set presentation(v){this._setter('presentation',v)}
get values_fields(){return this._getter('values_fields')}
set values_fields(v){this._setter('values_fields',v)}
get country(){return this._getter('country')}
set country(v){this._setter('country',v)}
get region(){return this._getter('region')}
set region(v){this._setter('region',v)}
get city(){return this._getter('city')}
set city(v){this._setter('city',v)}
get email_address(){return this._getter('email_address')}
set email_address(v){this._setter('email_address',v)}
get server_domain_name(){return this._getter('server_domain_name')}
set server_domain_name(v){this._setter('server_domain_name',v)}
get phone_number(){return this._getter('phone_number')}
set phone_number(v){this._setter('phone_number',v)}
get phone_without_codes(){return this._getter('phone_without_codes')}
set phone_without_codes(v){this._setter('phone_without_codes',v)}
}
$p.CatPartnersContact_informationRow = CatPartnersContact_informationRow;
class CatPartnersExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.CatPartnersExtra_fieldsRow = CatPartnersExtra_fieldsRow;
$p.cat.create('partners');

/**
* ### Справочник Номенклатура
* Перечень товаров, продукции, материалов, полуфабрикатов, тары, услуг
* @class CatNom
* @extends CatObj
* @constructor 
*/
class CatNom extends CatObj{
get article(){return this._getter('article')}
set article(v){this._setter('article',v)}
get name_full(){return this._getter('name_full')}
set name_full(v){this._setter('name_full',v)}
get base_unit(){return this._getter('base_unit')}
set base_unit(v){this._setter('base_unit',v)}
get storage_unit(){return this._getter('storage_unit')}
set storage_unit(v){this._setter('storage_unit',v)}
get nom_kind(){return this._getter('nom_kind')}
set nom_kind(v){this._setter('nom_kind',v)}
get nom_group(){return this._getter('nom_group')}
set nom_group(v){this._setter('nom_group',v)}
get vat_rate(){return this._getter('vat_rate')}
set vat_rate(v){this._setter('vat_rate',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get price_group(){return this._getter('price_group')}
set price_group(v){this._setter('price_group',v)}
get elm_type(){return this._getter('elm_type')}
set elm_type(v){this._setter('elm_type',v)}
get len(){return this._getter('len')}
set len(v){this._setter('len',v)}
get width(){return this._getter('width')}
set width(v){this._setter('width',v)}
get thickness(){return this._getter('thickness')}
set thickness(v){this._setter('thickness',v)}
get sizefurn(){return this._getter('sizefurn')}
set sizefurn(v){this._setter('sizefurn',v)}
get sizefaltz(){return this._getter('sizefaltz')}
set sizefaltz(v){this._setter('sizefaltz',v)}
get density(){return this._getter('density')}
set density(v){this._setter('density',v)}
get volume(){return this._getter('volume')}
set volume(v){this._setter('volume',v)}
get arc_elongation(){return this._getter('arc_elongation')}
set arc_elongation(v){this._setter('arc_elongation',v)}
get loss_factor(){return this._getter('loss_factor')}
set loss_factor(v){this._setter('loss_factor',v)}
get rounding_quantity(){return this._getter('rounding_quantity')}
set rounding_quantity(v){this._setter('rounding_quantity',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get cutting_optimization_type(){return this._getter('cutting_optimization_type')}
set cutting_optimization_type(v){this._setter('cutting_optimization_type',v)}
get crooked(){return this._getter('crooked')}
set crooked(v){this._setter('crooked',v)}
get colored(){return this._getter('colored')}
set colored(v){this._setter('colored',v)}
get lay(){return this._getter('lay')}
set lay(v){this._setter('lay',v)}
get made_to_order(){return this._getter('made_to_order')}
set made_to_order(v){this._setter('made_to_order',v)}
get packing(){return this._getter('packing')}
set packing(v){this._setter('packing',v)}
get days_to_execution(){return this._getter('days_to_execution')}
set days_to_execution(v){this._setter('days_to_execution',v)}
get days_from_execution(){return this._getter('days_from_execution')}
set days_from_execution(v){this._setter('days_from_execution',v)}
get pricing(){return this._getter('pricing')}
set pricing(v){this._setter('pricing',v)}
get visualization(){return this._getter('visualization')}
set visualization(v){this._setter('visualization',v)}
get complete_list_sorting(){return this._getter('complete_list_sorting')}
set complete_list_sorting(v){this._setter('complete_list_sorting',v)}
get is_accessory(){return this._getter('is_accessory')}
set is_accessory(v){this._setter('is_accessory',v)}
get is_procedure(){return this._getter('is_procedure')}
set is_procedure(v){this._setter('is_procedure',v)}
get is_service(){return this._getter('is_service')}
set is_service(v){this._setter('is_service',v)}
get is_pieces(){return this._getter('is_pieces')}
set is_pieces(v){this._setter('is_pieces',v)}
get captured(){return this._getter('captured')}
set captured(v){this._setter('captured',v)}
get editor(){return this._getter('editor')}
set editor(v){this._setter('editor',v)}
get zones(){return this._getter('zones')}
set zones(v){this._setter('zones',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
}
$p.CatNom = CatNom;
class CatNomExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.CatNomExtra_fieldsRow = CatNomExtra_fieldsRow;
$p.cat.create('nom');

/**
* ### Справочник Организации
* Организации
* @class CatOrganizations
* @extends CatObj
* @constructor 
*/
class CatOrganizations extends CatObj{
get prefix(){return this._getter('prefix')}
set prefix(v){this._setter('prefix',v)}
get individual_legal(){return this._getter('individual_legal')}
set individual_legal(v){this._setter('individual_legal',v)}
get individual_entrepreneur(){return this._getter('individual_entrepreneur')}
set individual_entrepreneur(v){this._setter('individual_entrepreneur',v)}
get inn(){return this._getter('inn')}
set inn(v){this._setter('inn',v)}
get kpp(){return this._getter('kpp')}
set kpp(v){this._setter('kpp',v)}
get main_bank_account(){return this._getter('main_bank_account')}
set main_bank_account(v){this._setter('main_bank_account',v)}
get main_cashbox(){return this._getter('main_cashbox')}
set main_cashbox(v){this._setter('main_cashbox',v)}
get certificate_series_number(){return this._getter('certificate_series_number')}
set certificate_series_number(v){this._setter('certificate_series_number',v)}
get certificate_date_issue(){return this._getter('certificate_date_issue')}
set certificate_date_issue(v){this._setter('certificate_date_issue',v)}
get certificate_authority_name(){return this._getter('certificate_authority_name')}
set certificate_authority_name(v){this._setter('certificate_authority_name',v)}
get certificate_authority_code(){return this._getter('certificate_authority_code')}
set certificate_authority_code(v){this._setter('certificate_authority_code',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get contact_information(){return this._getter_ts('contact_information')}
set contact_information(v){this._setter_ts('contact_information',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
}
$p.CatOrganizations = CatOrganizations;
class CatOrganizationsContact_informationRow extends TabularSectionRow{
get type(){return this._getter('type')}
set type(v){this._setter('type',v)}
get kind(){return this._getter('kind')}
set kind(v){this._setter('kind',v)}
get presentation(){return this._getter('presentation')}
set presentation(v){this._setter('presentation',v)}
get values_fields(){return this._getter('values_fields')}
set values_fields(v){this._setter('values_fields',v)}
get country(){return this._getter('country')}
set country(v){this._setter('country',v)}
get region(){return this._getter('region')}
set region(v){this._setter('region',v)}
get city(){return this._getter('city')}
set city(v){this._setter('city',v)}
get email_address(){return this._getter('email_address')}
set email_address(v){this._setter('email_address',v)}
get server_domain_name(){return this._getter('server_domain_name')}
set server_domain_name(v){this._setter('server_domain_name',v)}
get phone_number(){return this._getter('phone_number')}
set phone_number(v){this._setter('phone_number',v)}
get phone_without_codes(){return this._getter('phone_without_codes')}
set phone_without_codes(v){this._setter('phone_without_codes',v)}
get ВидДляСписка(){return this._getter('ВидДляСписка')}
set ВидДляСписка(v){this._setter('ВидДляСписка',v)}
get ДействуетС(){return this._getter('ДействуетС')}
set ДействуетС(v){this._setter('ДействуетС',v)}
}
$p.CatOrganizationsContact_informationRow = CatOrganizationsContact_informationRow;
class CatOrganizationsExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.CatOrganizationsExtra_fieldsRow = CatOrganizationsExtra_fieldsRow;
$p.cat.create('organizations');

/**
* ### Справочник Вставки
* Армирование, пленки, вставки - дополнение спецификации, которое зависит от одного элемента
* @class CatInserts
* @extends CatObj
* @constructor 
*/
class CatInserts extends CatObj{
get article(){return this._getter('article')}
set article(v){this._setter('article',v)}
get insert_type(){return this._getter('insert_type')}
set insert_type(v){this._setter('insert_type',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get lmin(){return this._getter('lmin')}
set lmin(v){this._setter('lmin',v)}
get lmax(){return this._getter('lmax')}
set lmax(v){this._setter('lmax',v)}
get hmin(){return this._getter('hmin')}
set hmin(v){this._setter('hmin',v)}
get hmax(){return this._getter('hmax')}
set hmax(v){this._setter('hmax',v)}
get smin(){return this._getter('smin')}
set smin(v){this._setter('smin',v)}
get smax(){return this._getter('smax')}
set smax(v){this._setter('smax',v)}
get for_direct_profile_only(){return this._getter('for_direct_profile_only')}
set for_direct_profile_only(v){this._setter('for_direct_profile_only',v)}
get ahmin(){return this._getter('ahmin')}
set ahmin(v){this._setter('ahmin',v)}
get ahmax(){return this._getter('ahmax')}
set ahmax(v){this._setter('ahmax',v)}
get priority(){return this._getter('priority')}
set priority(v){this._setter('priority',v)}
get mmin(){return this._getter('mmin')}
set mmin(v){this._setter('mmin',v)}
get mmax(){return this._getter('mmax')}
set mmax(v){this._setter('mmax',v)}
get impost_fixation(){return this._getter('impost_fixation')}
set impost_fixation(v){this._setter('impost_fixation',v)}
get shtulp_fixation(){return this._getter('shtulp_fixation')}
set shtulp_fixation(v){this._setter('shtulp_fixation',v)}
get can_rotate(){return this._getter('can_rotate')}
set can_rotate(v){this._setter('can_rotate',v)}
get sizeb(){return this._getter('sizeb')}
set sizeb(v){this._setter('sizeb',v)}
get clr_group(){return this._getter('clr_group')}
set clr_group(v){this._setter('clr_group',v)}
get is_order_row(){return this._getter('is_order_row')}
set is_order_row(v){this._setter('is_order_row',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get insert_glass_type(){return this._getter('insert_glass_type')}
set insert_glass_type(v){this._setter('insert_glass_type',v)}
get available(){return this._getter('available')}
set available(v){this._setter('available',v)}
get slave(){return this._getter('slave')}
set slave(v){this._setter('slave',v)}
get captured(){return this._getter('captured')}
set captured(v){this._setter('captured',v)}
get editor(){return this._getter('editor')}
set editor(v){this._setter('editor',v)}
get zones(){return this._getter('zones')}
set zones(v){this._setter('zones',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get specification(){return this._getter_ts('specification')}
set specification(v){this._setter_ts('specification',v)}
get selection_params(){return this._getter_ts('selection_params')}
set selection_params(v){this._setter_ts('selection_params',v)}
get product_params(){return this._getter_ts('product_params')}
set product_params(v){this._setter_ts('product_params',v)}
}
$p.CatInserts = CatInserts;
class CatInsertsSpecificationRow extends TabularSectionRow{
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get nom_characteristic(){return this._getter('nom_characteristic')}
set nom_characteristic(v){this._setter('nom_characteristic',v)}
get quantity(){return this._getter('quantity')}
set quantity(v){this._setter('quantity',v)}
get sz(){return this._getter('sz')}
set sz(v){this._setter('sz',v)}
get coefficient(){return this._getter('coefficient')}
set coefficient(v){this._setter('coefficient',v)}
get angle_calc_method(){return this._getter('angle_calc_method')}
set angle_calc_method(v){this._setter('angle_calc_method',v)}
get count_calc_method(){return this._getter('count_calc_method')}
set count_calc_method(v){this._setter('count_calc_method',v)}
get formula(){return this._getter('formula')}
set formula(v){this._setter('formula',v)}
get lmin(){return this._getter('lmin')}
set lmin(v){this._setter('lmin',v)}
get lmax(){return this._getter('lmax')}
set lmax(v){this._setter('lmax',v)}
get ahmin(){return this._getter('ahmin')}
set ahmin(v){this._setter('ahmin',v)}
get ahmax(){return this._getter('ahmax')}
set ahmax(v){this._setter('ahmax',v)}
get smin(){return this._getter('smin')}
set smin(v){this._setter('smin',v)}
get smax(){return this._getter('smax')}
set smax(v){this._setter('smax',v)}
get for_direct_profile_only(){return this._getter('for_direct_profile_only')}
set for_direct_profile_only(v){this._setter('for_direct_profile_only',v)}
get step(){return this._getter('step')}
set step(v){this._setter('step',v)}
get step_angle(){return this._getter('step_angle')}
set step_angle(v){this._setter('step_angle',v)}
get offsets(){return this._getter('offsets')}
set offsets(v){this._setter('offsets',v)}
get do_center(){return this._getter('do_center')}
set do_center(v){this._setter('do_center',v)}
get attrs_option(){return this._getter('attrs_option')}
set attrs_option(v){this._setter('attrs_option',v)}
get end_mount(){return this._getter('end_mount')}
set end_mount(v){this._setter('end_mount',v)}
get is_order_row(){return this._getter('is_order_row')}
set is_order_row(v){this._setter('is_order_row',v)}
get is_main_elm(){return this._getter('is_main_elm')}
set is_main_elm(v){this._setter('is_main_elm',v)}
}
$p.CatInsertsSpecificationRow = CatInsertsSpecificationRow;
class CatInsertsSelection_paramsRow extends TabularSectionRow{
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get param(){return this._getter('param')}
set param(v){this._setter('param',v)}
get comparison_type(){return this._getter('comparison_type')}
set comparison_type(v){this._setter('comparison_type',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.CatInsertsSelection_paramsRow = CatInsertsSelection_paramsRow;
class CatInsertsProduct_paramsRow extends TabularSectionRow{
get param(){return this._getter('param')}
set param(v){this._setter('param',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get hide(){return this._getter('hide')}
set hide(v){this._setter('hide',v)}
get forcibly(){return this._getter('forcibly')}
set forcibly(v){this._setter('forcibly',v)}
}
$p.CatInsertsProduct_paramsRow = CatInsertsProduct_paramsRow;
$p.cat.create('inserts');

/**
* ### Справочник КлючиПараметров
* Списки пар {Параметр:Значение} для фильтрации в подсистемах формирования спецификаций, планировании и ценообразовании

* @class CatParameters_keys
* @extends CatObj
* @constructor 
*/
class CatParameters_keys extends CatObj{
get priority(){return this._getter('priority')}
set priority(v){this._setter('priority',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get sorting_field(){return this._getter('sorting_field')}
set sorting_field(v){this._setter('sorting_field',v)}
get applying(){return this._getter('applying')}
set applying(v){this._setter('applying',v)}
get captured(){return this._getter('captured')}
set captured(v){this._setter('captured',v)}
get editor(){return this._getter('editor')}
set editor(v){this._setter('editor',v)}
get zones(){return this._getter('zones')}
set zones(v){this._setter('zones',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get params(){return this._getter_ts('params')}
set params(v){this._setter_ts('params',v)}
}
$p.CatParameters_keys = CatParameters_keys;
class CatParameters_keysParamsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get comparison_type(){return this._getter('comparison_type')}
set comparison_type(v){this._setter('comparison_type',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.CatParameters_keysParamsRow = CatParameters_keysParamsRow;
$p.cat.create('parameters_keys');

/**
* ### Справочник пзПараметрыПродукции
* Настройки системы профилей и фурнитуры
* @class CatProduction_params
* @extends CatObj
* @constructor 
*/
class CatProduction_params extends CatObj{
get default_clr(){return this._getter('default_clr')}
set default_clr(v){this._setter('default_clr',v)}
get clr_group(){return this._getter('clr_group')}
set clr_group(v){this._setter('clr_group',v)}
get tmin(){return this._getter('tmin')}
set tmin(v){this._setter('tmin',v)}
get tmax(){return this._getter('tmax')}
set tmax(v){this._setter('tmax',v)}
get allow_open_cnn(){return this._getter('allow_open_cnn')}
set allow_open_cnn(v){this._setter('allow_open_cnn',v)}
get flap_pos_by_impost(){return this._getter('flap_pos_by_impost')}
set flap_pos_by_impost(v){this._setter('flap_pos_by_impost',v)}
get captured(){return this._getter('captured')}
set captured(v){this._setter('captured',v)}
get editor(){return this._getter('editor')}
set editor(v){this._setter('editor',v)}
get zones(){return this._getter('zones')}
set zones(v){this._setter('zones',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get elmnts(){return this._getter_ts('elmnts')}
set elmnts(v){this._setter_ts('elmnts',v)}
get production(){return this._getter_ts('production')}
set production(v){this._setter_ts('production',v)}
get product_params(){return this._getter_ts('product_params')}
set product_params(v){this._setter_ts('product_params',v)}
get furn_params(){return this._getter_ts('furn_params')}
set furn_params(v){this._setter_ts('furn_params',v)}
get base_blocks(){return this._getter_ts('base_blocks')}
set base_blocks(v){this._setter_ts('base_blocks',v)}
}
$p.CatProduction_params = CatProduction_params;
class CatProduction_paramsElmntsRow extends TabularSectionRow{
get by_default(){return this._getter('by_default')}
set by_default(v){this._setter('by_default',v)}
get elm_type(){return this._getter('elm_type')}
set elm_type(v){this._setter('elm_type',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get pos(){return this._getter('pos')}
set pos(v){this._setter('pos',v)}
}
$p.CatProduction_paramsElmntsRow = CatProduction_paramsElmntsRow;
class CatProduction_paramsProductionRow extends TabularSectionRow{
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get param(){return this._getter('param')}
set param(v){this._setter('param',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
}
$p.CatProduction_paramsProductionRow = CatProduction_paramsProductionRow;
class CatProduction_paramsProduct_paramsRow extends TabularSectionRow{
get param(){return this._getter('param')}
set param(v){this._setter('param',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get hide(){return this._getter('hide')}
set hide(v){this._setter('hide',v)}
get forcibly(){return this._getter('forcibly')}
set forcibly(v){this._setter('forcibly',v)}
}
$p.CatProduction_paramsProduct_paramsRow = CatProduction_paramsProduct_paramsRow;
class CatProduction_paramsFurn_paramsRow extends TabularSectionRow{
get param(){return this._getter('param')}
set param(v){this._setter('param',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get hide(){return this._getter('hide')}
set hide(v){this._setter('hide',v)}
get forcibly(){return this._getter('forcibly')}
set forcibly(v){this._setter('forcibly',v)}
}
$p.CatProduction_paramsFurn_paramsRow = CatProduction_paramsFurn_paramsRow;
class CatProduction_paramsBase_blocksRow extends TabularSectionRow{
get calc_order(){return this._getter('calc_order')}
set calc_order(v){this._setter('calc_order',v)}
}
$p.CatProduction_paramsBase_blocksRow = CatProduction_paramsBase_blocksRow;
$p.cat.create('production_params');

/**
* ### Справочник РайоныДоставки
* Районы доставки
* @class CatDelivery_areas
* @extends CatObj
* @constructor 
*/
class CatDelivery_areas extends CatObj{
get country(){return this._getter('country')}
set country(v){this._setter('country',v)}
get region(){return this._getter('region')}
set region(v){this._setter('region',v)}
get city(){return this._getter('city')}
set city(v){this._setter('city',v)}
get latitude(){return this._getter('latitude')}
set latitude(v){this._setter('latitude',v)}
get longitude(){return this._getter('longitude')}
set longitude(v){this._setter('longitude',v)}
get ind(){return this._getter('ind')}
set ind(v){this._setter('ind',v)}
get delivery_area(){return this._getter('delivery_area')}
set delivery_area(v){this._setter('delivery_area',v)}
get specify_area_by_geocoder(){return this._getter('specify_area_by_geocoder')}
set specify_area_by_geocoder(v){this._setter('specify_area_by_geocoder',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
}
$p.CatDelivery_areas = CatDelivery_areas;
$p.cat.create('delivery_areas');

/**
* ### Справочник пзСоединения
* Спецификации соединений элементов
* @class CatCnns
* @extends CatObj
* @constructor 
*/
class CatCnns extends CatObj{
get priority(){return this._getter('priority')}
set priority(v){this._setter('priority',v)}
get amin(){return this._getter('amin')}
set amin(v){this._setter('amin',v)}
get amax(){return this._getter('amax')}
set amax(v){this._setter('amax',v)}
get sd1(){return this._getter('sd1')}
set sd1(v){this._setter('sd1',v)}
get sz(){return this._getter('sz')}
set sz(v){this._setter('sz',v)}
get cnn_type(){return this._getter('cnn_type')}
set cnn_type(v){this._setter('cnn_type',v)}
get ahmin(){return this._getter('ahmin')}
set ahmin(v){this._setter('ahmin',v)}
get ahmax(){return this._getter('ahmax')}
set ahmax(v){this._setter('ahmax',v)}
get lmin(){return this._getter('lmin')}
set lmin(v){this._setter('lmin',v)}
get lmax(){return this._getter('lmax')}
set lmax(v){this._setter('lmax',v)}
get tmin(){return this._getter('tmin')}
set tmin(v){this._setter('tmin',v)}
get tmax(){return this._getter('tmax')}
set tmax(v){this._setter('tmax',v)}
get var_layers(){return this._getter('var_layers')}
set var_layers(v){this._setter('var_layers',v)}
get for_direct_profile_only(){return this._getter('for_direct_profile_only')}
set for_direct_profile_only(v){this._setter('for_direct_profile_only',v)}
get art1vert(){return this._getter('art1vert')}
set art1vert(v){this._setter('art1vert',v)}
get art1glass(){return this._getter('art1glass')}
set art1glass(v){this._setter('art1glass',v)}
get art2glass(){return this._getter('art2glass')}
set art2glass(v){this._setter('art2glass',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get captured(){return this._getter('captured')}
set captured(v){this._setter('captured',v)}
get editor(){return this._getter('editor')}
set editor(v){this._setter('editor',v)}
get zones(){return this._getter('zones')}
set zones(v){this._setter('zones',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get specification(){return this._getter_ts('specification')}
set specification(v){this._setter_ts('specification',v)}
get cnn_elmnts(){return this._getter_ts('cnn_elmnts')}
set cnn_elmnts(v){this._setter_ts('cnn_elmnts',v)}
get selection_params(){return this._getter_ts('selection_params')}
set selection_params(v){this._setter_ts('selection_params',v)}
}
$p.CatCnns = CatCnns;
class CatCnnsSpecificationRow extends TabularSectionRow{
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get nom_characteristic(){return this._getter('nom_characteristic')}
set nom_characteristic(v){this._setter('nom_characteristic',v)}
get coefficient(){return this._getter('coefficient')}
set coefficient(v){this._setter('coefficient',v)}
get sz(){return this._getter('sz')}
set sz(v){this._setter('sz',v)}
get quantity(){return this._getter('quantity')}
set quantity(v){this._setter('quantity',v)}
get formula(){return this._getter('formula')}
set formula(v){this._setter('formula',v)}
get sz_min(){return this._getter('sz_min')}
set sz_min(v){this._setter('sz_min',v)}
get sz_max(){return this._getter('sz_max')}
set sz_max(v){this._setter('sz_max',v)}
get amin(){return this._getter('amin')}
set amin(v){this._setter('amin',v)}
get amax(){return this._getter('amax')}
set amax(v){this._setter('amax',v)}
get set_specification(){return this._getter('set_specification')}
set set_specification(v){this._setter('set_specification',v)}
get for_direct_profile_only(){return this._getter('for_direct_profile_only')}
set for_direct_profile_only(v){this._setter('for_direct_profile_only',v)}
get by_contour(){return this._getter('by_contour')}
set by_contour(v){this._setter('by_contour',v)}
get contraction_by_contour(){return this._getter('contraction_by_contour')}
set contraction_by_contour(v){this._setter('contraction_by_contour',v)}
get on_aperture(){return this._getter('on_aperture')}
set on_aperture(v){this._setter('on_aperture',v)}
get angle_calc_method(){return this._getter('angle_calc_method')}
set angle_calc_method(v){this._setter('angle_calc_method',v)}
get contour_number(){return this._getter('contour_number')}
set contour_number(v){this._setter('contour_number',v)}
get is_order_row(){return this._getter('is_order_row')}
set is_order_row(v){this._setter('is_order_row',v)}
}
$p.CatCnnsSpecificationRow = CatCnnsSpecificationRow;
class CatCnnsCnn_elmntsRow extends TabularSectionRow{
get nom1(){return this._getter('nom1')}
set nom1(v){this._setter('nom1',v)}
get clr1(){return this._getter('clr1')}
set clr1(v){this._setter('clr1',v)}
get nom2(){return this._getter('nom2')}
set nom2(v){this._setter('nom2',v)}
get clr2(){return this._getter('clr2')}
set clr2(v){this._setter('clr2',v)}
get varclr(){return this._getter('varclr')}
set varclr(v){this._setter('varclr',v)}
get is_nom_combinations_row(){return this._getter('is_nom_combinations_row')}
set is_nom_combinations_row(v){this._setter('is_nom_combinations_row',v)}
}
$p.CatCnnsCnn_elmntsRow = CatCnnsCnn_elmntsRow;
class CatCnnsSelection_paramsRow extends TabularSectionRow{
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get param(){return this._getter('param')}
set param(v){this._setter('param',v)}
get comparison_type(){return this._getter('comparison_type')}
set comparison_type(v){this._setter('comparison_type',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.CatCnnsSelection_paramsRow = CatCnnsSelection_paramsRow;
$p.cat.create('cnns');

/**
* ### Справочник ЦветоЦеновыеГруппы
* Цвето-ценовые группы
* @class CatColor_price_groups
* @extends CatObj
* @constructor 
*/
class CatColor_price_groups extends CatObj{
get color_price_group_destination(){return this._getter('color_price_group_destination')}
set color_price_group_destination(v){this._setter('color_price_group_destination',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get price_groups(){return this._getter_ts('price_groups')}
set price_groups(v){this._setter_ts('price_groups',v)}
get clr_conformity(){return this._getter_ts('clr_conformity')}
set clr_conformity(v){this._setter_ts('clr_conformity',v)}
}
$p.CatColor_price_groups = CatColor_price_groups;
class CatColor_price_groupsPrice_groupsRow extends TabularSectionRow{
get price_group(){return this._getter('price_group')}
set price_group(v){this._setter('price_group',v)}
}
$p.CatColor_price_groupsPrice_groupsRow = CatColor_price_groupsPrice_groupsRow;
class CatColor_price_groupsClr_conformityRow extends TabularSectionRow{
get clr1(){return this._getter('clr1')}
set clr1(v){this._setter('clr1',v)}
get clr2(){return this._getter('clr2')}
set clr2(v){this._setter('clr2',v)}
}
$p.CatColor_price_groupsClr_conformityRow = CatColor_price_groupsClr_conformityRow;
$p.cat.create('color_price_groups');

/**
* ### Справочник Подразделения
* Перечень подразделений предприятия
* @class CatDivisions
* @extends CatObj
* @constructor 
*/
class CatDivisions extends CatObj{
get main_project(){return this._getter('main_project')}
set main_project(v){this._setter('main_project',v)}
get sorting_field(){return this._getter('sorting_field')}
set sorting_field(v){this._setter('sorting_field',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
}
$p.CatDivisions = CatDivisions;
class CatDivisionsExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.CatDivisionsExtra_fieldsRow = CatDivisionsExtra_fieldsRow;
$p.cat.create('divisions');

/**
* ### Справочник Пользователи
* Пользователи
* @class CatUsers
* @extends CatObj
* @constructor 
*/
class CatUsers extends CatObj{
get invalid(){return this._getter('invalid')}
set invalid(v){this._setter('invalid',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get individual_person(){return this._getter('individual_person')}
set individual_person(v){this._setter('individual_person',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get ancillary(){return this._getter('ancillary')}
set ancillary(v){this._setter('ancillary',v)}
get user_ib_uid(){return this._getter('user_ib_uid')}
set user_ib_uid(v){this._setter('user_ib_uid',v)}
get user_fresh_uid(){return this._getter('user_fresh_uid')}
set user_fresh_uid(v){this._setter('user_fresh_uid',v)}
get id(){return this._getter('id')}
set id(v){this._setter('id',v)}
get prefix(){return this._getter('prefix')}
set prefix(v){this._setter('prefix',v)}
get branch(){return this._getter('branch')}
set branch(v){this._setter('branch',v)}
get push_only(){return this._getter('push_only')}
set push_only(v){this._setter('push_only',v)}
get suffix(){return this._getter('suffix')}
set suffix(v){this._setter('suffix',v)}
get direct(){return this._getter('direct')}
set direct(v){this._setter('direct',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
get contact_information(){return this._getter_ts('contact_information')}
set contact_information(v){this._setter_ts('contact_information',v)}
get acl_objs(){return this._getter_ts('acl_objs')}
set acl_objs(v){this._setter_ts('acl_objs',v)}
}
$p.CatUsers = CatUsers;
class CatUsersExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.CatUsersExtra_fieldsRow = CatUsersExtra_fieldsRow;
class CatUsersContact_informationRow extends TabularSectionRow{
get type(){return this._getter('type')}
set type(v){this._setter('type',v)}
get kind(){return this._getter('kind')}
set kind(v){this._setter('kind',v)}
get presentation(){return this._getter('presentation')}
set presentation(v){this._setter('presentation',v)}
get values_fields(){return this._getter('values_fields')}
set values_fields(v){this._setter('values_fields',v)}
get country(){return this._getter('country')}
set country(v){this._setter('country',v)}
get region(){return this._getter('region')}
set region(v){this._setter('region',v)}
get city(){return this._getter('city')}
set city(v){this._setter('city',v)}
get email_address(){return this._getter('email_address')}
set email_address(v){this._setter('email_address',v)}
get server_domain_name(){return this._getter('server_domain_name')}
set server_domain_name(v){this._setter('server_domain_name',v)}
get phone_number(){return this._getter('phone_number')}
set phone_number(v){this._setter('phone_number',v)}
get phone_without_codes(){return this._getter('phone_without_codes')}
set phone_without_codes(v){this._setter('phone_without_codes',v)}
get ВидДляСписка(){return this._getter('ВидДляСписка')}
set ВидДляСписка(v){this._setter('ВидДляСписка',v)}
}
$p.CatUsersContact_informationRow = CatUsersContact_informationRow;
class CatUsersAcl_objsRow extends TabularSectionRow{
get acl_obj(){return this._getter('acl_obj')}
set acl_obj(v){this._setter('acl_obj',v)}
get type(){return this._getter('type')}
set type(v){this._setter('type',v)}
get by_default(){return this._getter('by_default')}
set by_default(v){this._setter('by_default',v)}
}
$p.CatUsersAcl_objsRow = CatUsersAcl_objsRow;
class CatUsersManager extends CatManager {

  // при загрузке пользователей, морозим объект, чтобы его невозможно было изменить из интерфейса
  load_array(aattr, forse) {
    const res = [];
    for (let aobj of aattr) {
      if(this.by_ref[aobj.ref]) {
        continue;
      }
      if(!aobj.acl_objs) {
        aobj.acl_objs = [];
      }
      const {acl} = aobj;
      delete aobj.acl;
      const obj = new $p.CatUsers(aobj, this, true);
      const {_obj} = obj;
      if(_obj && !_obj._acl) {
        _obj._acl = acl;
        obj._set_loaded();
        Object.freeze(obj);
        Object.freeze(_obj);
        for (let j in _obj) {
          if(typeof _obj[j] == 'object') {
            Object.freeze(_obj[j]);
            for (let k in _obj[j]) {
              typeof _obj[j][k] == 'object' && Object.freeze(_obj[j][k]);
            }
          }
        }
        res.push(obj);
      }
    }
    return res;
  }

  // пользователей не выгружаем
  unload_obj() {	}

}
$p.cat.create('users', CatUsersManager, true);

/**
* ### Справочник Проекты
* Проекты
* @class CatProjects
* @extends CatObj
* @constructor 
*/
class CatProjects extends CatObj{
get start(){return this._getter('start')}
set start(v){this._setter('start',v)}
get finish(){return this._getter('finish')}
set finish(v){this._setter('finish',v)}
get launch(){return this._getter('launch')}
set launch(v){this._setter('launch',v)}
get readiness(){return this._getter('readiness')}
set readiness(v){this._setter('readiness',v)}
get finished(){return this._getter('finished')}
set finished(v){this._setter('finished',v)}
get responsible(){return this._getter('responsible')}
set responsible(v){this._setter('responsible',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
}
$p.CatProjects = CatProjects;
class CatProjectsExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.CatProjectsExtra_fieldsRow = CatProjectsExtra_fieldsRow;
$p.cat.create('projects');

/**
* ### Справочник Склады
* Сведения о местах хранения товаров (складах), их структуре и физических лицах, назначенных материально ответственными (МОЛ) за тот или иной склад
* @class CatStores
* @extends CatObj
* @constructor 
*/
class CatStores extends CatObj{
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
}
$p.CatStores = CatStores;
class CatStoresExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.CatStoresExtra_fieldsRow = CatStoresExtra_fieldsRow;
$p.cat.create('stores');

/**
* ### Справочник СтатьиДвиженияДенежныхСредств
* Перечень статей движения денежных средств (ДДС), используемых в предприятии для проведения анализа поступлений и расходов в разрезе статей движения денежных средств. 
* @class CatCash_flow_articles
* @extends CatObj
* @constructor 
*/
class CatCash_flow_articles extends CatObj{
get definition(){return this._getter('definition')}
set definition(v){this._setter('definition',v)}
get sorting_field(){return this._getter('sorting_field')}
set sorting_field(v){this._setter('sorting_field',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
}
$p.CatCash_flow_articles = CatCash_flow_articles;
$p.cat.create('cash_flow_articles');

/**
* ### Справочник ТипыЦенНоменклатуры
* Перечень типов отпускных цен предприятия
* @class CatNom_prices_types
* @extends CatObj
* @constructor 
*/
class CatNom_prices_types extends CatObj{
get price_currency(){return this._getter('price_currency')}
set price_currency(v){this._setter('price_currency',v)}
get discount_percent(){return this._getter('discount_percent')}
set discount_percent(v){this._setter('discount_percent',v)}
get vat_price_included(){return this._getter('vat_price_included')}
set vat_price_included(v){this._setter('vat_price_included',v)}
get rounding_order(){return this._getter('rounding_order')}
set rounding_order(v){this._setter('rounding_order',v)}
get rounding_in_a_big_way(){return this._getter('rounding_in_a_big_way')}
set rounding_in_a_big_way(v){this._setter('rounding_in_a_big_way',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
}
$p.CatNom_prices_types = CatNom_prices_types;
$p.cat.create('nom_prices_types');

/**
* ### Справочник ФизическиеЛица
* Физические лица
* @class CatIndividuals
* @extends CatObj
* @constructor 
*/
class CatIndividuals extends CatObj{
get birth_date(){return this._getter('birth_date')}
set birth_date(v){this._setter('birth_date',v)}
get inn(){return this._getter('inn')}
set inn(v){this._setter('inn',v)}
get imns_code(){return this._getter('imns_code')}
set imns_code(v){this._setter('imns_code',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get pfr_number(){return this._getter('pfr_number')}
set pfr_number(v){this._setter('pfr_number',v)}
get sex(){return this._getter('sex')}
set sex(v){this._setter('sex',v)}
get birth_place(){return this._getter('birth_place')}
set birth_place(v){this._setter('birth_place',v)}
get ОсновноеИзображение(){return this._getter('ОсновноеИзображение')}
set ОсновноеИзображение(v){this._setter('ОсновноеИзображение',v)}
get Фамилия(){return this._getter('Фамилия')}
set Фамилия(v){this._setter('Фамилия',v)}
get Имя(){return this._getter('Имя')}
set Имя(v){this._setter('Имя',v)}
get Отчество(){return this._getter('Отчество')}
set Отчество(v){this._setter('Отчество',v)}
get ФамилияРП(){return this._getter('ФамилияРП')}
set ФамилияРП(v){this._setter('ФамилияРП',v)}
get ИмяРП(){return this._getter('ИмяРП')}
set ИмяРП(v){this._setter('ИмяРП',v)}
get ОтчествоРП(){return this._getter('ОтчествоРП')}
set ОтчествоРП(v){this._setter('ОтчествоРП',v)}
get ОснованиеРП(){return this._getter('ОснованиеРП')}
set ОснованиеРП(v){this._setter('ОснованиеРП',v)}
get ДолжностьРП(){return this._getter('ДолжностьРП')}
set ДолжностьРП(v){this._setter('ДолжностьРП',v)}
get Должность(){return this._getter('Должность')}
set Должность(v){this._setter('Должность',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get contact_information(){return this._getter_ts('contact_information')}
set contact_information(v){this._setter_ts('contact_information',v)}
}
$p.CatIndividuals = CatIndividuals;
class CatIndividualsContact_informationRow extends TabularSectionRow{
get type(){return this._getter('type')}
set type(v){this._setter('type',v)}
get kind(){return this._getter('kind')}
set kind(v){this._setter('kind',v)}
get presentation(){return this._getter('presentation')}
set presentation(v){this._setter('presentation',v)}
get values_fields(){return this._getter('values_fields')}
set values_fields(v){this._setter('values_fields',v)}
get country(){return this._getter('country')}
set country(v){this._setter('country',v)}
get region(){return this._getter('region')}
set region(v){this._setter('region',v)}
get city(){return this._getter('city')}
set city(v){this._setter('city',v)}
get email_address(){return this._getter('email_address')}
set email_address(v){this._setter('email_address',v)}
get server_domain_name(){return this._getter('server_domain_name')}
set server_domain_name(v){this._setter('server_domain_name',v)}
get phone_number(){return this._getter('phone_number')}
set phone_number(v){this._setter('phone_number',v)}
get phone_without_codes(){return this._getter('phone_without_codes')}
set phone_without_codes(v){this._setter('phone_without_codes',v)}
get ВидДляСписка(){return this._getter('ВидДляСписка')}
set ВидДляСписка(v){this._setter('ВидДляСписка',v)}
}
$p.CatIndividualsContact_informationRow = CatIndividualsContact_informationRow;
$p.cat.create('individuals');

/**
* ### Справочник ХарактеристикиНоменклатуры
* Дополнительные характеристики элементов номенклатуры: цвет, размер и т.п.
* @class CatCharacteristics
* @extends CatObj
* @constructor 
*/
class CatCharacteristics extends CatObj{
get x(){return this._getter('x')}
set x(v){this._setter('x',v)}
get y(){return this._getter('y')}
set y(v){this._setter('y',v)}
get z(){return this._getter('z')}
set z(v){this._setter('z',v)}
get s(){return this._getter('s')}
set s(v){this._setter('s',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get weight(){return this._getter('weight')}
set weight(v){this._setter('weight',v)}
get calc_order(){return this._getter('calc_order')}
set calc_order(v){this._setter('calc_order',v)}
get product(){return this._getter('product')}
set product(v){this._setter('product',v)}
get leading_product(){return this._getter('leading_product')}
set leading_product(v){this._setter('leading_product',v)}
get leading_elm(){return this._getter('leading_elm')}
set leading_elm(v){this._setter('leading_elm',v)}
get origin(){return this._getter('origin')}
set origin(v){this._setter('origin',v)}
get base_block(){return this._getter('base_block')}
set base_block(v){this._setter('base_block',v)}
get sys(){return this._getter('sys')}
set sys(v){this._setter('sys',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get obj_delivery_state(){return this._getter('obj_delivery_state')}
set obj_delivery_state(v){this._setter('obj_delivery_state',v)}
get partner(){return this._getter('partner')}
set partner(v){this._setter('partner',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get builder_props(){return this._getter('builder_props')}
set builder_props(v){this._setter('builder_props',v)}
get svg(){return this._getter('svg')}
set svg(v){this._setter('svg',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get owner(){return this._getter('owner')}
set owner(v){this._setter('owner',v)}
get constructions(){return this._getter_ts('constructions')}
set constructions(v){this._setter_ts('constructions',v)}
get coordinates(){return this._getter_ts('coordinates')}
set coordinates(v){this._setter_ts('coordinates',v)}
get inserts(){return this._getter_ts('inserts')}
set inserts(v){this._setter_ts('inserts',v)}
get params(){return this._getter_ts('params')}
set params(v){this._setter_ts('params',v)}
get cnn_elmnts(){return this._getter_ts('cnn_elmnts')}
set cnn_elmnts(v){this._setter_ts('cnn_elmnts',v)}
get glass_specification(){return this._getter_ts('glass_specification')}
set glass_specification(v){this._setter_ts('glass_specification',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
get glasses(){return this._getter_ts('glasses')}
set glasses(v){this._setter_ts('glasses',v)}
get specification(){return this._getter_ts('specification')}
set specification(v){this._setter_ts('specification',v)}
}
$p.CatCharacteristics = CatCharacteristics;
class CatCharacteristicsConstructionsRow extends TabularSectionRow{
get cnstr(){return this._getter('cnstr')}
set cnstr(v){this._setter('cnstr',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get x(){return this._getter('x')}
set x(v){this._setter('x',v)}
get y(){return this._getter('y')}
set y(v){this._setter('y',v)}
get z(){return this._getter('z')}
set z(v){this._setter('z',v)}
get w(){return this._getter('w')}
set w(v){this._setter('w',v)}
get h(){return this._getter('h')}
set h(v){this._setter('h',v)}
get furn(){return this._getter('furn')}
set furn(v){this._setter('furn',v)}
get clr_furn(){return this._getter('clr_furn')}
set clr_furn(v){this._setter('clr_furn',v)}
get direction(){return this._getter('direction')}
set direction(v){this._setter('direction',v)}
get h_ruch(){return this._getter('h_ruch')}
set h_ruch(v){this._setter('h_ruch',v)}
get fix_ruch(){return this._getter('fix_ruch')}
set fix_ruch(v){this._setter('fix_ruch',v)}
get is_rectangular(){return this._getter('is_rectangular')}
set is_rectangular(v){this._setter('is_rectangular',v)}
}
$p.CatCharacteristicsConstructionsRow = CatCharacteristicsConstructionsRow;
class CatCharacteristicsCoordinatesRow extends TabularSectionRow{
get cnstr(){return this._getter('cnstr')}
set cnstr(v){this._setter('cnstr',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get elm_type(){return this._getter('elm_type')}
set elm_type(v){this._setter('elm_type',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get inset(){return this._getter('inset')}
set inset(v){this._setter('inset',v)}
get path_data(){return this._getter('path_data')}
set path_data(v){this._setter('path_data',v)}
get x1(){return this._getter('x1')}
set x1(v){this._setter('x1',v)}
get y1(){return this._getter('y1')}
set y1(v){this._setter('y1',v)}
get x2(){return this._getter('x2')}
set x2(v){this._setter('x2',v)}
get y2(){return this._getter('y2')}
set y2(v){this._setter('y2',v)}
get r(){return this._getter('r')}
set r(v){this._setter('r',v)}
get arc_ccw(){return this._getter('arc_ccw')}
set arc_ccw(v){this._setter('arc_ccw',v)}
get s(){return this._getter('s')}
set s(v){this._setter('s',v)}
get angle_hor(){return this._getter('angle_hor')}
set angle_hor(v){this._setter('angle_hor',v)}
get alp1(){return this._getter('alp1')}
set alp1(v){this._setter('alp1',v)}
get alp2(){return this._getter('alp2')}
set alp2(v){this._setter('alp2',v)}
get len(){return this._getter('len')}
set len(v){this._setter('len',v)}
get pos(){return this._getter('pos')}
set pos(v){this._setter('pos',v)}
get orientation(){return this._getter('orientation')}
set orientation(v){this._setter('orientation',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
}
$p.CatCharacteristicsCoordinatesRow = CatCharacteristicsCoordinatesRow;
class CatCharacteristicsInsertsRow extends TabularSectionRow{
get cnstr(){return this._getter('cnstr')}
set cnstr(v){this._setter('cnstr',v)}
get inset(){return this._getter('inset')}
set inset(v){this._setter('inset',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
}
$p.CatCharacteristicsInsertsRow = CatCharacteristicsInsertsRow;
class CatCharacteristicsParamsRow extends TabularSectionRow{
get cnstr(){return this._getter('cnstr')}
set cnstr(v){this._setter('cnstr',v)}
get inset(){return this._getter('inset')}
set inset(v){this._setter('inset',v)}
get param(){return this._getter('param')}
set param(v){this._setter('param',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get hide(){return this._getter('hide')}
set hide(v){this._setter('hide',v)}
}
$p.CatCharacteristicsParamsRow = CatCharacteristicsParamsRow;
class CatCharacteristicsCnn_elmntsRow extends TabularSectionRow{
get elm1(){return this._getter('elm1')}
set elm1(v){this._setter('elm1',v)}
get node1(){return this._getter('node1')}
set node1(v){this._setter('node1',v)}
get elm2(){return this._getter('elm2')}
set elm2(v){this._setter('elm2',v)}
get node2(){return this._getter('node2')}
set node2(v){this._setter('node2',v)}
get cnn(){return this._getter('cnn')}
set cnn(v){this._setter('cnn',v)}
get aperture_len(){return this._getter('aperture_len')}
set aperture_len(v){this._setter('aperture_len',v)}
}
$p.CatCharacteristicsCnn_elmntsRow = CatCharacteristicsCnn_elmntsRow;
class CatCharacteristicsGlass_specificationRow extends TabularSectionRow{
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get gno(){return this._getter('gno')}
set gno(v){this._setter('gno',v)}
get inset(){return this._getter('inset')}
set inset(v){this._setter('inset',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
}
$p.CatCharacteristicsGlass_specificationRow = CatCharacteristicsGlass_specificationRow;
class CatCharacteristicsExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.CatCharacteristicsExtra_fieldsRow = CatCharacteristicsExtra_fieldsRow;
class CatCharacteristicsGlassesRow extends TabularSectionRow{
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get formula(){return this._getter('formula')}
set formula(v){this._setter('formula',v)}
get width(){return this._getter('width')}
set width(v){this._setter('width',v)}
get height(){return this._getter('height')}
set height(v){this._setter('height',v)}
get s(){return this._getter('s')}
set s(v){this._setter('s',v)}
get is_rectangular(){return this._getter('is_rectangular')}
set is_rectangular(v){this._setter('is_rectangular',v)}
get is_sandwich(){return this._getter('is_sandwich')}
set is_sandwich(v){this._setter('is_sandwich',v)}
get thickness(){return this._getter('thickness')}
set thickness(v){this._setter('thickness',v)}
get coffer(){return this._getter('coffer')}
set coffer(v){this._setter('coffer',v)}
}
$p.CatCharacteristicsGlassesRow = CatCharacteristicsGlassesRow;
class CatCharacteristicsSpecificationRow extends TabularSectionRow{
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get characteristic(){return this._getter('characteristic')}
set characteristic(v){this._setter('characteristic',v)}
get qty(){return this._getter('qty')}
set qty(v){this._setter('qty',v)}
get len(){return this._getter('len')}
set len(v){this._setter('len',v)}
get width(){return this._getter('width')}
set width(v){this._setter('width',v)}
get s(){return this._getter('s')}
set s(v){this._setter('s',v)}
get alp1(){return this._getter('alp1')}
set alp1(v){this._setter('alp1',v)}
get alp2(){return this._getter('alp2')}
set alp2(v){this._setter('alp2',v)}
get totqty(){return this._getter('totqty')}
set totqty(v){this._setter('totqty',v)}
get totqty1(){return this._getter('totqty1')}
set totqty1(v){this._setter('totqty1',v)}
get price(){return this._getter('price')}
set price(v){this._setter('price',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
get amount_marged(){return this._getter('amount_marged')}
set amount_marged(v){this._setter('amount_marged',v)}
get origin(){return this._getter('origin')}
set origin(v){this._setter('origin',v)}
get changed(){return this._getter('changed')}
set changed(v){this._setter('changed',v)}
get dop(){return this._getter('dop')}
set dop(v){this._setter('dop',v)}
}
$p.CatCharacteristicsSpecificationRow = CatCharacteristicsSpecificationRow;
$p.cat.create('characteristics');

/**
* ### Справочник ЦеновыеГруппы
* Ценовые группы
* @class CatPrice_groups
* @extends CatObj
* @constructor 
*/
class CatPrice_groups extends CatObj{
get definition(){return this._getter('definition')}
set definition(v){this._setter('definition',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
}
$p.CatPrice_groups = CatPrice_groups;
$p.cat.create('price_groups');

/**
* ### Справочник ГруппыФинансовогоУчетаНоменклатуры
* Перечень номенклатурных групп для учета затрат и укрупненного планирования продаж, закупок и производства
* @class CatNom_groups
* @extends CatObj
* @constructor 
*/
class CatNom_groups extends CatObj{
get vat_rate(){return this._getter('vat_rate')}
set vat_rate(v){this._setter('vat_rate',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get parent(){return this._getter('parent')}
set parent(v){this._setter('parent',v)}
}
$p.CatNom_groups = CatNom_groups;
$p.cat.create('nom_groups');

/**
* ### Справочник ПривязкиВставок
* Замена регистра "Корректировка спецификации"
* @class CatInsert_bind
* @extends CatObj
* @constructor 
*/
class CatInsert_bind extends CatObj{
get key(){return this._getter('key')}
set key(v){this._setter('key',v)}
get captured(){return this._getter('captured')}
set captured(v){this._setter('captured',v)}
get editor(){return this._getter('editor')}
set editor(v){this._setter('editor',v)}
get zone(){return this._getter('zone')}
set zone(v){this._setter('zone',v)}
get zones(){return this._getter('zones')}
set zones(v){this._setter('zones',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get production(){return this._getter_ts('production')}
set production(v){this._setter_ts('production',v)}
get inserts(){return this._getter_ts('inserts')}
set inserts(v){this._setter_ts('inserts',v)}
}
$p.CatInsert_bind = CatInsert_bind;
class CatInsert_bindProductionRow extends TabularSectionRow{
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
}
$p.CatInsert_bindProductionRow = CatInsert_bindProductionRow;
class CatInsert_bindInsertsRow extends TabularSectionRow{
get inset(){return this._getter('inset')}
set inset(v){this._setter('inset',v)}
get elm_type(){return this._getter('elm_type')}
set elm_type(v){this._setter('elm_type',v)}
}
$p.CatInsert_bindInsertsRow = CatInsert_bindInsertsRow;
$p.cat.create('insert_bind');

/**
* ### Справочник ПризнакиНестандартов
* Признаки нестандартов
* @class CatNonstandard_attributes
* @extends CatObj
* @constructor 
*/
class CatNonstandard_attributes extends CatObj{
get crooked(){return this._getter('crooked')}
set crooked(v){this._setter('crooked',v)}
get colored(){return this._getter('colored')}
set colored(v){this._setter('colored',v)}
get lay(){return this._getter('lay')}
set lay(v){this._setter('lay',v)}
get made_to_order(){return this._getter('made_to_order')}
set made_to_order(v){this._setter('made_to_order',v)}
get packing(){return this._getter('packing')}
set packing(v){this._setter('packing',v)}
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
}
$p.CatNonstandard_attributes = CatNonstandard_attributes;
$p.cat.create('nonstandard_attributes');

/**
* ### Справочник НаправленияДоставки
* Объединяет районы, территории или подразделения продаж
* @class CatDelivery_directions
* @extends CatObj
* @constructor 
*/
class CatDelivery_directions extends CatObj{
get predefined_name(){return this._getter('predefined_name')}
set predefined_name(v){this._setter('predefined_name',v)}
get composition(){return this._getter_ts('composition')}
set composition(v){this._setter_ts('composition',v)}
}
$p.CatDelivery_directions = CatDelivery_directions;
class CatDelivery_directionsCompositionRow extends TabularSectionRow{
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
}
$p.CatDelivery_directionsCompositionRow = CatDelivery_directionsCompositionRow;
$p.cat.create('delivery_directions');

/**
* ### Документ КорректировкаРегистров
* Корректировка регистров
* @class DocRegisters_correction
* @extends DocObj
* @constructor 
*/
class DocRegisters_correction extends DocObj{
get original_doc_type(){return this._getter('original_doc_type')}
set original_doc_type(v){this._setter('original_doc_type',v)}
get responsible(){return this._getter('responsible')}
set responsible(v){this._setter('responsible',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get partner(){return this._getter('partner')}
set partner(v){this._setter('partner',v)}
get registers_table(){return this._getter_ts('registers_table')}
set registers_table(v){this._setter_ts('registers_table',v)}
}
$p.DocRegisters_correction = DocRegisters_correction;
class DocRegisters_correctionRegisters_tableRow extends TabularSectionRow{
get Имя(){return this._getter('Имя')}
set Имя(v){this._setter('Имя',v)}
}
$p.DocRegisters_correctionRegisters_tableRow = DocRegisters_correctionRegisters_tableRow;
$p.doc.create('registers_correction');

/**
* ### Документ ПоступлениеТоваровУслуг
* Документы отражают поступление товаров и услуг
* @class DocPurchase
* @extends DocObj
* @constructor 
*/
class DocPurchase extends DocObj{
get organization(){return this._getter('organization')}
set organization(v){this._setter('organization',v)}
get partner(){return this._getter('partner')}
set partner(v){this._setter('partner',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get warehouse(){return this._getter('warehouse')}
set warehouse(v){this._setter('warehouse',v)}
get doc_amount(){return this._getter('doc_amount')}
set doc_amount(v){this._setter('doc_amount',v)}
get responsible(){return this._getter('responsible')}
set responsible(v){this._setter('responsible',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get goods(){return this._getter_ts('goods')}
set goods(v){this._setter_ts('goods',v)}
get services(){return this._getter_ts('services')}
set services(v){this._setter_ts('services',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
}
$p.DocPurchase = DocPurchase;
class DocPurchaseGoodsRow extends TabularSectionRow{
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get quantity(){return this._getter('quantity')}
set quantity(v){this._setter('quantity',v)}
get unit(){return this._getter('unit')}
set unit(v){this._setter('unit',v)}
get price(){return this._getter('price')}
set price(v){this._setter('price',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
get vat_rate(){return this._getter('vat_rate')}
set vat_rate(v){this._setter('vat_rate',v)}
get vat_amount(){return this._getter('vat_amount')}
set vat_amount(v){this._setter('vat_amount',v)}
get trans(){return this._getter('trans')}
set trans(v){this._setter('trans',v)}
}
$p.DocPurchaseGoodsRow = DocPurchaseGoodsRow;
class DocPurchaseServicesRow extends TabularSectionRow{
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get content(){return this._getter('content')}
set content(v){this._setter('content',v)}
get quantity(){return this._getter('quantity')}
set quantity(v){this._setter('quantity',v)}
get price(){return this._getter('price')}
set price(v){this._setter('price',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
get vat_rate(){return this._getter('vat_rate')}
set vat_rate(v){this._setter('vat_rate',v)}
get vat_amount(){return this._getter('vat_amount')}
set vat_amount(v){this._setter('vat_amount',v)}
get nom_group(){return this._getter('nom_group')}
set nom_group(v){this._setter('nom_group',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get cost_item(){return this._getter('cost_item')}
set cost_item(v){this._setter('cost_item',v)}
get project(){return this._getter('project')}
set project(v){this._setter('project',v)}
get buyers_order(){return this._getter('buyers_order')}
set buyers_order(v){this._setter('buyers_order',v)}
}
$p.DocPurchaseServicesRow = DocPurchaseServicesRow;
class DocPurchaseExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.DocPurchaseExtra_fieldsRow = DocPurchaseExtra_fieldsRow;
$p.doc.create('purchase');

/**
* ### Документ НарядРЦ
* Задание рабочему центру
* @class DocWork_centers_task
* @extends DocObj
* @constructor 
*/
class DocWork_centers_task extends DocObj{
get key(){return this._getter('key')}
set key(v){this._setter('key',v)}
get recipient(){return this._getter('recipient')}
set recipient(v){this._setter('recipient',v)}
get biz_cuts(){return this._getter('biz_cuts')}
set biz_cuts(v){this._setter('biz_cuts',v)}
get responsible(){return this._getter('responsible')}
set responsible(v){this._setter('responsible',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get planning(){return this._getter_ts('planning')}
set planning(v){this._setter_ts('planning',v)}
get demand(){return this._getter_ts('demand')}
set demand(v){this._setter_ts('demand',v)}
get cuts(){return this._getter_ts('cuts')}
set cuts(v){this._setter_ts('cuts',v)}
get cutting(){return this._getter_ts('cutting')}
set cutting(v){this._setter_ts('cutting',v)}
}
$p.DocWork_centers_task = DocWork_centers_task;
class DocWork_centers_taskPlanningRow extends TabularSectionRow{
get obj(){return this._getter('obj')}
set obj(v){this._setter('obj',v)}
get specimen(){return this._getter('specimen')}
set specimen(v){this._setter('specimen',v)}
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get power(){return this._getter('power')}
set power(v){this._setter('power',v)}
}
$p.DocWork_centers_taskPlanningRow = DocWork_centers_taskPlanningRow;
class DocWork_centers_taskDemandRow extends TabularSectionRow{
get production(){return this._getter('production')}
set production(v){this._setter('production',v)}
get specimen(){return this._getter('specimen')}
set specimen(v){this._setter('specimen',v)}
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get characteristic(){return this._getter('characteristic')}
set characteristic(v){this._setter('characteristic',v)}
get final_balance(){return this._getter('final_balance')}
set final_balance(v){this._setter('final_balance',v)}
get quantity(){return this._getter('quantity')}
set quantity(v){this._setter('quantity',v)}
get from_cut(){return this._getter('from_cut')}
set from_cut(v){this._setter('from_cut',v)}
get close(){return this._getter('close')}
set close(v){this._setter('close',v)}
}
$p.DocWork_centers_taskDemandRow = DocWork_centers_taskDemandRow;
class DocWork_centers_taskCutsRow extends TabularSectionRow{
get record_kind(){return this._getter('record_kind')}
set record_kind(v){this._setter('record_kind',v)}
get stick(){return this._getter('stick')}
set stick(v){this._setter('stick',v)}
get pair(){return this._getter('pair')}
set pair(v){this._setter('pair',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get characteristic(){return this._getter('characteristic')}
set characteristic(v){this._setter('characteristic',v)}
get len(){return this._getter('len')}
set len(v){this._setter('len',v)}
get width(){return this._getter('width')}
set width(v){this._setter('width',v)}
get x(){return this._getter('x')}
set x(v){this._setter('x',v)}
get y(){return this._getter('y')}
set y(v){this._setter('y',v)}
get quantity(){return this._getter('quantity')}
set quantity(v){this._setter('quantity',v)}
get cell(){return this._getter('cell')}
set cell(v){this._setter('cell',v)}
}
$p.DocWork_centers_taskCutsRow = DocWork_centers_taskCutsRow;
class DocWork_centers_taskCuttingRow extends TabularSectionRow{
get production(){return this._getter('production')}
set production(v){this._setter('production',v)}
get specimen(){return this._getter('specimen')}
set specimen(v){this._setter('specimen',v)}
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get characteristic(){return this._getter('characteristic')}
set characteristic(v){this._setter('characteristic',v)}
get len(){return this._getter('len')}
set len(v){this._setter('len',v)}
get width(){return this._getter('width')}
set width(v){this._setter('width',v)}
get stick(){return this._getter('stick')}
set stick(v){this._setter('stick',v)}
get pair(){return this._getter('pair')}
set pair(v){this._setter('pair',v)}
get orientation(){return this._getter('orientation')}
set orientation(v){this._setter('orientation',v)}
get elm_type(){return this._getter('elm_type')}
set elm_type(v){this._setter('elm_type',v)}
get alp1(){return this._getter('alp1')}
set alp1(v){this._setter('alp1',v)}
get alp2(){return this._getter('alp2')}
set alp2(v){this._setter('alp2',v)}
get cell(){return this._getter('cell')}
set cell(v){this._setter('cell',v)}
get part(){return this._getter('part')}
set part(v){this._setter('part',v)}
get x(){return this._getter('x')}
set x(v){this._setter('x',v)}
get y(){return this._getter('y')}
set y(v){this._setter('y',v)}
get rotated(){return this._getter('rotated')}
set rotated(v){this._setter('rotated',v)}
get nonstandard(){return this._getter('nonstandard')}
set nonstandard(v){this._setter('nonstandard',v)}
}
$p.DocWork_centers_taskCuttingRow = DocWork_centers_taskCuttingRow;
$p.doc.create('work_centers_task');

/**
* ### Документ Расчет
* Аналог заказа покупателя типовых конфигураций.
Содержит инструменты для формирования спецификаций и подготовки данных производства и диспетчеризации
* @class DocCalc_order
* @extends DocObj
* @constructor 
*/
class DocCalc_order extends DocObj{
get number_internal(){return this._getter('number_internal')}
set number_internal(v){this._setter('number_internal',v)}
get project(){return this._getter('project')}
set project(v){this._setter('project',v)}
get organization(){return this._getter('organization')}
set organization(v){this._setter('organization',v)}
get partner(){return this._getter('partner')}
set partner(v){this._setter('partner',v)}
get client_of_dealer(){return this._getter('client_of_dealer')}
set client_of_dealer(v){this._setter('client_of_dealer',v)}
get contract(){return this._getter('contract')}
set contract(v){this._setter('contract',v)}
get bank_account(){return this._getter('bank_account')}
set bank_account(v){this._setter('bank_account',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get manager(){return this._getter('manager')}
set manager(v){this._setter('manager',v)}
get leading_manager(){return this._getter('leading_manager')}
set leading_manager(v){this._setter('leading_manager',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get warehouse(){return this._getter('warehouse')}
set warehouse(v){this._setter('warehouse',v)}
get doc_amount(){return this._getter('doc_amount')}
set doc_amount(v){this._setter('doc_amount',v)}
get amount_operation(){return this._getter('amount_operation')}
set amount_operation(v){this._setter('amount_operation',v)}
get amount_internal(){return this._getter('amount_internal')}
set amount_internal(v){this._setter('amount_internal',v)}
get accessory_characteristic(){return this._getter('accessory_characteristic')}
set accessory_characteristic(v){this._setter('accessory_characteristic',v)}
get sys_profile(){return this._getter('sys_profile')}
set sys_profile(v){this._setter('sys_profile',v)}
get sys_furn(){return this._getter('sys_furn')}
set sys_furn(v){this._setter('sys_furn',v)}
get phone(){return this._getter('phone')}
set phone(v){this._setter('phone',v)}
get delivery_area(){return this._getter('delivery_area')}
set delivery_area(v){this._setter('delivery_area',v)}
get shipping_address(){return this._getter('shipping_address')}
set shipping_address(v){this._setter('shipping_address',v)}
get coordinates(){return this._getter('coordinates')}
set coordinates(v){this._setter('coordinates',v)}
get address_fields(){return this._getter('address_fields')}
set address_fields(v){this._setter('address_fields',v)}
get difficult(){return this._getter('difficult')}
set difficult(v){this._setter('difficult',v)}
get vat_consider(){return this._getter('vat_consider')}
set vat_consider(v){this._setter('vat_consider',v)}
get vat_included(){return this._getter('vat_included')}
set vat_included(v){this._setter('vat_included',v)}
get settlements_course(){return this._getter('settlements_course')}
set settlements_course(v){this._setter('settlements_course',v)}
get settlements_multiplicity(){return this._getter('settlements_multiplicity')}
set settlements_multiplicity(v){this._setter('settlements_multiplicity',v)}
get extra_charge_external(){return this._getter('extra_charge_external')}
set extra_charge_external(v){this._setter('extra_charge_external',v)}
get obj_delivery_state(){return this._getter('obj_delivery_state')}
set obj_delivery_state(v){this._setter('obj_delivery_state',v)}
get category(){return this._getter('category')}
set category(v){this._setter('category',v)}
get production(){return this._getter_ts('production')}
set production(v){this._setter_ts('production',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
get contact_information(){return this._getter_ts('contact_information')}
set contact_information(v){this._setter_ts('contact_information',v)}
get planning(){return this._getter_ts('planning')}
set planning(v){this._setter_ts('planning',v)}
}
$p.DocCalc_order = DocCalc_order;
class DocCalc_orderProductionRow extends TabularSectionRow{
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get characteristic(){return this._getter('characteristic')}
set characteristic(v){this._setter('characteristic',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get quantity(){return this._getter('quantity')}
set quantity(v){this._setter('quantity',v)}
get unit(){return this._getter('unit')}
set unit(v){this._setter('unit',v)}
get qty(){return this._getter('qty')}
set qty(v){this._setter('qty',v)}
get len(){return this._getter('len')}
set len(v){this._setter('len',v)}
get width(){return this._getter('width')}
set width(v){this._setter('width',v)}
get s(){return this._getter('s')}
set s(v){this._setter('s',v)}
get first_cost(){return this._getter('first_cost')}
set first_cost(v){this._setter('first_cost',v)}
get marginality(){return this._getter('marginality')}
set marginality(v){this._setter('marginality',v)}
get price(){return this._getter('price')}
set price(v){this._setter('price',v)}
get discount_percent(){return this._getter('discount_percent')}
set discount_percent(v){this._setter('discount_percent',v)}
get discount_percent_internal(){return this._getter('discount_percent_internal')}
set discount_percent_internal(v){this._setter('discount_percent_internal',v)}
get discount(){return this._getter('discount')}
set discount(v){this._setter('discount',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
get margin(){return this._getter('margin')}
set margin(v){this._setter('margin',v)}
get price_internal(){return this._getter('price_internal')}
set price_internal(v){this._setter('price_internal',v)}
get amount_internal(){return this._getter('amount_internal')}
set amount_internal(v){this._setter('amount_internal',v)}
get vat_rate(){return this._getter('vat_rate')}
set vat_rate(v){this._setter('vat_rate',v)}
get vat_amount(){return this._getter('vat_amount')}
set vat_amount(v){this._setter('vat_amount',v)}
get ordn(){return this._getter('ordn')}
set ordn(v){this._setter('ordn',v)}
get changed(){return this._getter('changed')}
set changed(v){this._setter('changed',v)}
}
$p.DocCalc_orderProductionRow = DocCalc_orderProductionRow;
class DocCalc_orderExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.DocCalc_orderExtra_fieldsRow = DocCalc_orderExtra_fieldsRow;
class DocCalc_orderContact_informationRow extends TabularSectionRow{
get type(){return this._getter('type')}
set type(v){this._setter('type',v)}
get kind(){return this._getter('kind')}
set kind(v){this._setter('kind',v)}
get presentation(){return this._getter('presentation')}
set presentation(v){this._setter('presentation',v)}
get values_fields(){return this._getter('values_fields')}
set values_fields(v){this._setter('values_fields',v)}
get country(){return this._getter('country')}
set country(v){this._setter('country',v)}
get region(){return this._getter('region')}
set region(v){this._setter('region',v)}
get city(){return this._getter('city')}
set city(v){this._setter('city',v)}
get email_address(){return this._getter('email_address')}
set email_address(v){this._setter('email_address',v)}
get server_domain_name(){return this._getter('server_domain_name')}
set server_domain_name(v){this._setter('server_domain_name',v)}
get phone_number(){return this._getter('phone_number')}
set phone_number(v){this._setter('phone_number',v)}
get phone_without_codes(){return this._getter('phone_without_codes')}
set phone_without_codes(v){this._setter('phone_without_codes',v)}
}
$p.DocCalc_orderContact_informationRow = DocCalc_orderContact_informationRow;
class DocCalc_orderPlanningRow extends TabularSectionRow{
get phase(){return this._getter('phase')}
set phase(v){this._setter('phase',v)}
get date(){return this._getter('date')}
set date(v){this._setter('date',v)}
get key(){return this._getter('key')}
set key(v){this._setter('key',v)}
get obj(){return this._getter('obj')}
set obj(v){this._setter('obj',v)}
get specimen(){return this._getter('specimen')}
set specimen(v){this._setter('specimen',v)}
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get power(){return this._getter('power')}
set power(v){this._setter('power',v)}
}
$p.DocCalc_orderPlanningRow = DocCalc_orderPlanningRow;
$p.doc.create('calc_order');

/**
* ### Документ ОплатаОтПокупателяПлатежнойКартой
* Оплата от покупателя платежной картой
* @class DocCredit_card_order
* @extends DocObj
* @constructor 
*/
class DocCredit_card_order extends DocObj{
get organization(){return this._getter('organization')}
set organization(v){this._setter('organization',v)}
get partner(){return this._getter('partner')}
set partner(v){this._setter('partner',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get doc_amount(){return this._getter('doc_amount')}
set doc_amount(v){this._setter('doc_amount',v)}
get responsible(){return this._getter('responsible')}
set responsible(v){this._setter('responsible',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get payment_details(){return this._getter_ts('payment_details')}
set payment_details(v){this._setter_ts('payment_details',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
}
$p.DocCredit_card_order = DocCredit_card_order;
class DocCredit_card_orderPayment_detailsRow extends TabularSectionRow{
get cash_flow_article(){return this._getter('cash_flow_article')}
set cash_flow_article(v){this._setter('cash_flow_article',v)}
get trans(){return this._getter('trans')}
set trans(v){this._setter('trans',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
}
$p.DocCredit_card_orderPayment_detailsRow = DocCredit_card_orderPayment_detailsRow;
class DocCredit_card_orderExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.DocCredit_card_orderExtra_fieldsRow = DocCredit_card_orderExtra_fieldsRow;
$p.doc.create('credit_card_order');

/**
* ### Документ МощностиРЦ
* Мощности рабочих центров
* @class DocWork_centers_performance
* @extends DocObj
* @constructor 
*/
class DocWork_centers_performance extends DocObj{
get start_date(){return this._getter('start_date')}
set start_date(v){this._setter('start_date',v)}
get expiration_date(){return this._getter('expiration_date')}
set expiration_date(v){this._setter('expiration_date',v)}
get responsible(){return this._getter('responsible')}
set responsible(v){this._setter('responsible',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get planning(){return this._getter_ts('planning')}
set planning(v){this._setter_ts('planning',v)}
}
$p.DocWork_centers_performance = DocWork_centers_performance;
class DocWork_centers_performancePlanningRow extends TabularSectionRow{
get date(){return this._getter('date')}
set date(v){this._setter('date',v)}
get key(){return this._getter('key')}
set key(v){this._setter('key',v)}
get power(){return this._getter('power')}
set power(v){this._setter('power',v)}
}
$p.DocWork_centers_performancePlanningRow = DocWork_centers_performancePlanningRow;
$p.doc.create('work_centers_performance');

/**
* ### Документ ПлатежноеПоручениеВходящее
* Платежное поручение входящее
* @class DocDebit_bank_order
* @extends DocObj
* @constructor 
*/
class DocDebit_bank_order extends DocObj{
get organization(){return this._getter('organization')}
set organization(v){this._setter('organization',v)}
get partner(){return this._getter('partner')}
set partner(v){this._setter('partner',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get doc_amount(){return this._getter('doc_amount')}
set doc_amount(v){this._setter('doc_amount',v)}
get responsible(){return this._getter('responsible')}
set responsible(v){this._setter('responsible',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get payment_details(){return this._getter_ts('payment_details')}
set payment_details(v){this._setter_ts('payment_details',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
}
$p.DocDebit_bank_order = DocDebit_bank_order;
class DocDebit_bank_orderPayment_detailsRow extends TabularSectionRow{
get cash_flow_article(){return this._getter('cash_flow_article')}
set cash_flow_article(v){this._setter('cash_flow_article',v)}
get trans(){return this._getter('trans')}
set trans(v){this._setter('trans',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
}
$p.DocDebit_bank_orderPayment_detailsRow = DocDebit_bank_orderPayment_detailsRow;
class DocDebit_bank_orderExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.DocDebit_bank_orderExtra_fieldsRow = DocDebit_bank_orderExtra_fieldsRow;
$p.doc.create('debit_bank_order');

/**
* ### Документ ПлатежноеПоручениеИсходящее
* Платежное поручение исходящее
* @class DocCredit_bank_order
* @extends DocObj
* @constructor 
*/
class DocCredit_bank_order extends DocObj{
get organization(){return this._getter('organization')}
set organization(v){this._setter('organization',v)}
get partner(){return this._getter('partner')}
set partner(v){this._setter('partner',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get doc_amount(){return this._getter('doc_amount')}
set doc_amount(v){this._setter('doc_amount',v)}
get responsible(){return this._getter('responsible')}
set responsible(v){this._setter('responsible',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get payment_details(){return this._getter_ts('payment_details')}
set payment_details(v){this._setter_ts('payment_details',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
}
$p.DocCredit_bank_order = DocCredit_bank_order;
class DocCredit_bank_orderPayment_detailsRow extends TabularSectionRow{
get cash_flow_article(){return this._getter('cash_flow_article')}
set cash_flow_article(v){this._setter('cash_flow_article',v)}
get trans(){return this._getter('trans')}
set trans(v){this._setter('trans',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
}
$p.DocCredit_bank_orderPayment_detailsRow = DocCredit_bank_orderPayment_detailsRow;
class DocCredit_bank_orderExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.DocCredit_bank_orderExtra_fieldsRow = DocCredit_bank_orderExtra_fieldsRow;
$p.doc.create('credit_bank_order');

/**
* ### Документ ПриходныйКассовыйОрдер
* Приходный кассовый ордер
* @class DocDebit_cash_order
* @extends DocObj
* @constructor 
*/
class DocDebit_cash_order extends DocObj{
get organization(){return this._getter('organization')}
set organization(v){this._setter('organization',v)}
get partner(){return this._getter('partner')}
set partner(v){this._setter('partner',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get cashbox(){return this._getter('cashbox')}
set cashbox(v){this._setter('cashbox',v)}
get doc_amount(){return this._getter('doc_amount')}
set doc_amount(v){this._setter('doc_amount',v)}
get responsible(){return this._getter('responsible')}
set responsible(v){this._setter('responsible',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get payment_details(){return this._getter_ts('payment_details')}
set payment_details(v){this._setter_ts('payment_details',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
}
$p.DocDebit_cash_order = DocDebit_cash_order;
class DocDebit_cash_orderPayment_detailsRow extends TabularSectionRow{
get cash_flow_article(){return this._getter('cash_flow_article')}
set cash_flow_article(v){this._setter('cash_flow_article',v)}
get trans(){return this._getter('trans')}
set trans(v){this._setter('trans',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
}
$p.DocDebit_cash_orderPayment_detailsRow = DocDebit_cash_orderPayment_detailsRow;
class DocDebit_cash_orderExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.DocDebit_cash_orderExtra_fieldsRow = DocDebit_cash_orderExtra_fieldsRow;
$p.doc.create('debit_cash_order');

/**
* ### Документ РасходныйКассовыйОрдер
* Расходный кассовый ордер
* @class DocCredit_cash_order
* @extends DocObj
* @constructor 
*/
class DocCredit_cash_order extends DocObj{
get organization(){return this._getter('organization')}
set organization(v){this._setter('organization',v)}
get partner(){return this._getter('partner')}
set partner(v){this._setter('partner',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get cashbox(){return this._getter('cashbox')}
set cashbox(v){this._setter('cashbox',v)}
get doc_amount(){return this._getter('doc_amount')}
set doc_amount(v){this._setter('doc_amount',v)}
get responsible(){return this._getter('responsible')}
set responsible(v){this._setter('responsible',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get payment_details(){return this._getter_ts('payment_details')}
set payment_details(v){this._setter_ts('payment_details',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
}
$p.DocCredit_cash_order = DocCredit_cash_order;
class DocCredit_cash_orderPayment_detailsRow extends TabularSectionRow{
get cash_flow_article(){return this._getter('cash_flow_article')}
set cash_flow_article(v){this._setter('cash_flow_article',v)}
get trans(){return this._getter('trans')}
set trans(v){this._setter('trans',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
}
$p.DocCredit_cash_orderPayment_detailsRow = DocCredit_cash_orderPayment_detailsRow;
class DocCredit_cash_orderExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.DocCredit_cash_orderExtra_fieldsRow = DocCredit_cash_orderExtra_fieldsRow;
$p.doc.create('credit_cash_order');

/**
* ### Документ РеализацияТоваровУслуг
* Документы отражают факт реализации (отгрузки) товаров
* @class DocSelling
* @extends DocObj
* @constructor 
*/
class DocSelling extends DocObj{
get organization(){return this._getter('organization')}
set organization(v){this._setter('organization',v)}
get partner(){return this._getter('partner')}
set partner(v){this._setter('partner',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get warehouse(){return this._getter('warehouse')}
set warehouse(v){this._setter('warehouse',v)}
get doc_amount(){return this._getter('doc_amount')}
set doc_amount(v){this._setter('doc_amount',v)}
get responsible(){return this._getter('responsible')}
set responsible(v){this._setter('responsible',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get goods(){return this._getter_ts('goods')}
set goods(v){this._setter_ts('goods',v)}
get services(){return this._getter_ts('services')}
set services(v){this._setter_ts('services',v)}
get extra_fields(){return this._getter_ts('extra_fields')}
set extra_fields(v){this._setter_ts('extra_fields',v)}
}
$p.DocSelling = DocSelling;
class DocSellingGoodsRow extends TabularSectionRow{
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get quantity(){return this._getter('quantity')}
set quantity(v){this._setter('quantity',v)}
get unit(){return this._getter('unit')}
set unit(v){this._setter('unit',v)}
get price(){return this._getter('price')}
set price(v){this._setter('price',v)}
get discount_percent(){return this._getter('discount_percent')}
set discount_percent(v){this._setter('discount_percent',v)}
get vat_rate(){return this._getter('vat_rate')}
set vat_rate(v){this._setter('vat_rate',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
get vat_amount(){return this._getter('vat_amount')}
set vat_amount(v){this._setter('vat_amount',v)}
get trans(){return this._getter('trans')}
set trans(v){this._setter('trans',v)}
}
$p.DocSellingGoodsRow = DocSellingGoodsRow;
class DocSellingServicesRow extends TabularSectionRow{
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get content(){return this._getter('content')}
set content(v){this._setter('content',v)}
get quantity(){return this._getter('quantity')}
set quantity(v){this._setter('quantity',v)}
get price(){return this._getter('price')}
set price(v){this._setter('price',v)}
get discount_percent(){return this._getter('discount_percent')}
set discount_percent(v){this._setter('discount_percent',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
get vat_rate(){return this._getter('vat_rate')}
set vat_rate(v){this._setter('vat_rate',v)}
get vat_amount(){return this._getter('vat_amount')}
set vat_amount(v){this._setter('vat_amount',v)}
get trans(){return this._getter('trans')}
set trans(v){this._setter('trans',v)}
}
$p.DocSellingServicesRow = DocSellingServicesRow;
class DocSellingExtra_fieldsRow extends TabularSectionRow{
get property(){return this._getter('property')}
set property(v){this._setter('property',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get txt_row(){return this._getter('txt_row')}
set txt_row(v){this._setter('txt_row',v)}
}
$p.DocSellingExtra_fieldsRow = DocSellingExtra_fieldsRow;
$p.doc.create('selling');

/**
* ### Документ УстановкаЦенНоменклатуры
* Установка цен номенклатуры
* @class DocNom_prices_setup
* @extends DocObj
* @constructor 
*/
class DocNom_prices_setup extends DocObj{
get price_type(){return this._getter('price_type')}
set price_type(v){this._setter('price_type',v)}
get currency(){return this._getter('currency')}
set currency(v){this._setter('currency',v)}
get responsible(){return this._getter('responsible')}
set responsible(v){this._setter('responsible',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get goods(){return this._getter_ts('goods')}
set goods(v){this._setter_ts('goods',v)}
}
$p.DocNom_prices_setup = DocNom_prices_setup;
class DocNom_prices_setupGoodsRow extends TabularSectionRow{
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get nom_characteristic(){return this._getter('nom_characteristic')}
set nom_characteristic(v){this._setter('nom_characteristic',v)}
get price_type(){return this._getter('price_type')}
set price_type(v){this._setter('price_type',v)}
get price(){return this._getter('price')}
set price(v){this._setter('price',v)}
}
$p.DocNom_prices_setupGoodsRow = DocNom_prices_setupGoodsRow;
$p.doc.create('nom_prices_setup');

/**
* ### Документ СобытиеПланирования
* Событие планирования
* @class DocPlanning_event
* @extends DocObj
* @constructor 
*/
class DocPlanning_event extends DocObj{
get phase(){return this._getter('phase')}
set phase(v){this._setter('phase',v)}
get key(){return this._getter('key')}
set key(v){this._setter('key',v)}
get recipient(){return this._getter('recipient')}
set recipient(v){this._setter('recipient',v)}
get trans(){return this._getter('trans')}
set trans(v){this._setter('trans',v)}
get partner(){return this._getter('partner')}
set partner(v){this._setter('partner',v)}
get project(){return this._getter('project')}
set project(v){this._setter('project',v)}
get Основание(){return this._getter('Основание')}
set Основание(v){this._setter('Основание',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get executors(){return this._getter_ts('executors')}
set executors(v){this._setter_ts('executors',v)}
get planning(){return this._getter_ts('planning')}
set planning(v){this._setter_ts('planning',v)}
}
$p.DocPlanning_event = DocPlanning_event;
class DocPlanning_eventExecutorsRow extends TabularSectionRow{
get executor(){return this._getter('executor')}
set executor(v){this._setter('executor',v)}
get coefficient(){return this._getter('coefficient')}
set coefficient(v){this._setter('coefficient',v)}
}
$p.DocPlanning_eventExecutorsRow = DocPlanning_eventExecutorsRow;
class DocPlanning_eventPlanningRow extends TabularSectionRow{
get obj(){return this._getter('obj')}
set obj(v){this._setter('obj',v)}
get specimen(){return this._getter('specimen')}
set specimen(v){this._setter('specimen',v)}
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get power(){return this._getter('power')}
set power(v){this._setter('power',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get begin_time(){return this._getter('begin_time')}
set begin_time(v){this._setter('begin_time',v)}
get end_time(){return this._getter('end_time')}
set end_time(v){this._setter('end_time',v)}
}
$p.DocPlanning_eventPlanningRow = DocPlanning_eventPlanningRow;
$p.doc.create('planning_event');

/**
* ### Регистр сведений log_view
* Просмотр журнала событий
* @class IregLog_view
* @extends RegisterRow
* @constructor 
*/
class IregLog_view extends RegisterRow{
get key(){return this._getter('key')}
set key(v){this._setter('key',v)}
get user(){return this._getter('user')}
set user(v){this._setter('user',v)}
}
$p.IregLog_view = IregLog_view;
$p.ireg.create('log_view');

/**
* ### Регистр сведений КурсыВалют
* Курсы валют
* @class IregCurrency_courses
* @extends RegisterRow
* @constructor 
*/
class IregCurrency_courses extends RegisterRow{
get currency(){return this._getter('currency')}
set currency(v){this._setter('currency',v)}
get period(){return this._getter('period')}
set period(v){this._setter('period',v)}
get course(){return this._getter('course')}
set course(v){this._setter('course',v)}
get multiplicity(){return this._getter('multiplicity')}
set multiplicity(v){this._setter('multiplicity',v)}
}
$p.IregCurrency_courses = IregCurrency_courses;
$p.ireg.create('currency_courses');

/**
* ### Регистр сведений пзМаржинальныеКоэффициентыИСкидки
* Маржинальные коэффициенты
* @class IregMargin_coefficients
* @extends RegisterRow
* @constructor 
*/
class IregMargin_coefficients extends RegisterRow{
get price_group(){return this._getter('price_group')}
set price_group(v){this._setter('price_group',v)}
get key(){return this._getter('key')}
set key(v){this._setter('key',v)}
get condition_formula(){return this._getter('condition_formula')}
set condition_formula(v){this._setter('condition_formula',v)}
get marginality(){return this._getter('marginality')}
set marginality(v){this._setter('marginality',v)}
get marginality_min(){return this._getter('marginality_min')}
set marginality_min(v){this._setter('marginality_min',v)}
get marginality_internal(){return this._getter('marginality_internal')}
set marginality_internal(v){this._setter('marginality_internal',v)}
get price_type_first_cost(){return this._getter('price_type_first_cost')}
set price_type_first_cost(v){this._setter('price_type_first_cost',v)}
get price_type_sale(){return this._getter('price_type_sale')}
set price_type_sale(v){this._setter('price_type_sale',v)}
get price_type_internal(){return this._getter('price_type_internal')}
set price_type_internal(v){this._setter('price_type_internal',v)}
get formula(){return this._getter('formula')}
set formula(v){this._setter('formula',v)}
get sale_formula(){return this._getter('sale_formula')}
set sale_formula(v){this._setter('sale_formula',v)}
get internal_formula(){return this._getter('internal_formula')}
set internal_formula(v){this._setter('internal_formula',v)}
get external_formula(){return this._getter('external_formula')}
set external_formula(v){this._setter('external_formula',v)}
get extra_charge_external(){return this._getter('extra_charge_external')}
set extra_charge_external(v){this._setter('extra_charge_external',v)}
get discount_external(){return this._getter('discount_external')}
set discount_external(v){this._setter('discount_external',v)}
get discount(){return this._getter('discount')}
set discount(v){this._setter('discount',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
}
$p.IregMargin_coefficients = IregMargin_coefficients;
$p.ireg.create('margin_coefficients');

/**
* ### Обработка builder_price
* Метаданные карточки цен номенклатуры
* @class DpBuilder_price
* @extends DataProcessorObj
* @constructor 
*/
class DpBuilder_price extends DataProcessorObj{
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get goods(){return this._getter_ts('goods')}
set goods(v){this._setter_ts('goods',v)}
}
$p.DpBuilder_price = DpBuilder_price;
class DpBuilder_priceGoodsRow extends TabularSectionRow{
get price_type(){return this._getter('price_type')}
set price_type(v){this._setter('price_type',v)}
get date(){return this._getter('date')}
set date(v){this._setter('date',v)}
get nom_characteristic(){return this._getter('nom_characteristic')}
set nom_characteristic(v){this._setter('nom_characteristic',v)}
get price(){return this._getter('price')}
set price(v){this._setter('price',v)}
get currency(){return this._getter('currency')}
set currency(v){this._setter('currency',v)}
}
$p.DpBuilder_priceGoodsRow = DpBuilder_priceGoodsRow;
$p.dp.create('builder_price');

/**
* ### Обработка builder_size
* Метаданные инструмента ruler
* @class DpBuilder_size
* @extends DataProcessorObj
* @constructor 
*/
class DpBuilder_size extends DataProcessorObj{
get offset(){return this._getter('offset')}
set offset(v){this._setter('offset',v)}
get angle(){return this._getter('angle')}
set angle(v){this._setter('angle',v)}
get fix_angle(){return this._getter('fix_angle')}
set fix_angle(v){this._setter('fix_angle',v)}
get align(){return this._getter('align')}
set align(v){this._setter('align',v)}
get hide_c1(){return this._getter('hide_c1')}
set hide_c1(v){this._setter('hide_c1',v)}
get hide_c2(){return this._getter('hide_c2')}
set hide_c2(v){this._setter('hide_c2',v)}
get hide_line(){return this._getter('hide_line')}
set hide_line(v){this._setter('hide_line',v)}
get text(){return this._getter('text')}
set text(v){this._setter('text',v)}
get font_family(){return this._getter('font_family')}
set font_family(v){this._setter('font_family',v)}
get bold(){return this._getter('bold')}
set bold(v){this._setter('bold',v)}
get font_size(){return this._getter('font_size')}
set font_size(v){this._setter('font_size',v)}
}
$p.DpBuilder_size = DpBuilder_size;
$p.dp.create('builder_size');

/**
* ### Обработка ЗаказПокупателя
* Рисовалка
* @class DpBuyers_order
* @extends DataProcessorObj
* @constructor 
*/
class DpBuyers_order extends DataProcessorObj{
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get characteristic(){return this._getter('characteristic')}
set characteristic(v){this._setter('characteristic',v)}
get sys(){return this._getter('sys')}
set sys(v){this._setter('sys',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get len(){return this._getter('len')}
set len(v){this._setter('len',v)}
get height(){return this._getter('height')}
set height(v){this._setter('height',v)}
get depth(){return this._getter('depth')}
set depth(v){this._setter('depth',v)}
get s(){return this._getter('s')}
set s(v){this._setter('s',v)}
get quantity(){return this._getter('quantity')}
set quantity(v){this._setter('quantity',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get first_cost(){return this._getter('first_cost')}
set first_cost(v){this._setter('first_cost',v)}
get price(){return this._getter('price')}
set price(v){this._setter('price',v)}
get discount_percent(){return this._getter('discount_percent')}
set discount_percent(v){this._setter('discount_percent',v)}
get discount_percent_internal(){return this._getter('discount_percent_internal')}
set discount_percent_internal(v){this._setter('discount_percent_internal',v)}
get discount(){return this._getter('discount')}
set discount(v){this._setter('discount',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
get shipping_date(){return this._getter('shipping_date')}
set shipping_date(v){this._setter('shipping_date',v)}
get client_number(){return this._getter('client_number')}
set client_number(v){this._setter('client_number',v)}
get inn(){return this._getter('inn')}
set inn(v){this._setter('inn',v)}
get shipping_address(){return this._getter('shipping_address')}
set shipping_address(v){this._setter('shipping_address',v)}
get phone(){return this._getter('phone')}
set phone(v){this._setter('phone',v)}
get price_internal(){return this._getter('price_internal')}
set price_internal(v){this._setter('price_internal',v)}
get amount_internal(){return this._getter('amount_internal')}
set amount_internal(v){this._setter('amount_internal',v)}
get base_block(){return this._getter('base_block')}
set base_block(v){this._setter('base_block',v)}
get product_params(){return this._getter_ts('product_params')}
set product_params(v){this._setter_ts('product_params',v)}
get production(){return this._getter_ts('production')}
set production(v){this._setter_ts('production',v)}
get glass_specification(){return this._getter_ts('glass_specification')}
set glass_specification(v){this._setter_ts('glass_specification',v)}
get specification(){return this._getter_ts('specification')}
set specification(v){this._setter_ts('specification',v)}
get charges_discounts(){return this._getter_ts('charges_discounts')}
set charges_discounts(v){this._setter_ts('charges_discounts',v)}
}
$p.DpBuyers_order = DpBuyers_order;
class DpBuyers_orderProduct_paramsRow extends TabularSectionRow{
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get param(){return this._getter('param')}
set param(v){this._setter('param',v)}
get value(){return this._getter('value')}
set value(v){this._setter('value',v)}
get hide(){return this._getter('hide')}
set hide(v){this._setter('hide',v)}
}
$p.DpBuyers_orderProduct_paramsRow = DpBuyers_orderProduct_paramsRow;
class DpBuyers_orderProductionRow extends TabularSectionRow{
get inset(){return this._getter('inset')}
set inset(v){this._setter('inset',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get characteristic(){return this._getter('characteristic')}
set characteristic(v){this._setter('characteristic',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get len(){return this._getter('len')}
set len(v){this._setter('len',v)}
get height(){return this._getter('height')}
set height(v){this._setter('height',v)}
get depth(){return this._getter('depth')}
set depth(v){this._setter('depth',v)}
get s(){return this._getter('s')}
set s(v){this._setter('s',v)}
get quantity(){return this._getter('quantity')}
set quantity(v){this._setter('quantity',v)}
get note(){return this._getter('note')}
set note(v){this._setter('note',v)}
get first_cost(){return this._getter('first_cost')}
set first_cost(v){this._setter('first_cost',v)}
get price(){return this._getter('price')}
set price(v){this._setter('price',v)}
get discount_percent(){return this._getter('discount_percent')}
set discount_percent(v){this._setter('discount_percent',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
get ordn(){return this._getter('ordn')}
set ordn(v){this._setter('ordn',v)}
get qty(){return this._getter('qty')}
set qty(v){this._setter('qty',v)}
}
$p.DpBuyers_orderProductionRow = DpBuyers_orderProductionRow;
class DpBuyers_orderGlass_specificationRow extends TabularSectionRow{
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get sorting(){return this._getter('sorting')}
set sorting(v){this._setter('sorting',v)}
get inset(){return this._getter('inset')}
set inset(v){this._setter('inset',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
}
$p.DpBuyers_orderGlass_specificationRow = DpBuyers_orderGlass_specificationRow;
class DpBuyers_orderSpecificationRow extends TabularSectionRow{
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get dop(){return this._getter('dop')}
set dop(v){this._setter('dop',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get quantity(){return this._getter('quantity')}
set quantity(v){this._setter('quantity',v)}
get handle_height_base(){return this._getter('handle_height_base')}
set handle_height_base(v){this._setter('handle_height_base',v)}
get handle_height_min(){return this._getter('handle_height_min')}
set handle_height_min(v){this._setter('handle_height_min',v)}
get handle_height_max(){return this._getter('handle_height_max')}
set handle_height_max(v){this._setter('handle_height_max',v)}
get contraction(){return this._getter('contraction')}
set contraction(v){this._setter('contraction',v)}
get contraction_option(){return this._getter('contraction_option')}
set contraction_option(v){this._setter('contraction_option',v)}
get coefficient(){return this._getter('coefficient')}
set coefficient(v){this._setter('coefficient',v)}
get flap_weight_min(){return this._getter('flap_weight_min')}
set flap_weight_min(v){this._setter('flap_weight_min',v)}
get flap_weight_max(){return this._getter('flap_weight_max')}
set flap_weight_max(v){this._setter('flap_weight_max',v)}
get side(){return this._getter('side')}
set side(v){this._setter('side',v)}
get cnn_side(){return this._getter('cnn_side')}
set cnn_side(v){this._setter('cnn_side',v)}
get offset_option(){return this._getter('offset_option')}
set offset_option(v){this._setter('offset_option',v)}
get formula(){return this._getter('formula')}
set formula(v){this._setter('formula',v)}
get transfer_option(){return this._getter('transfer_option')}
set transfer_option(v){this._setter('transfer_option',v)}
get is_main_specification_row(){return this._getter('is_main_specification_row')}
set is_main_specification_row(v){this._setter('is_main_specification_row',v)}
get is_set_row(){return this._getter('is_set_row')}
set is_set_row(v){this._setter('is_set_row',v)}
get is_procedure_row(){return this._getter('is_procedure_row')}
set is_procedure_row(v){this._setter('is_procedure_row',v)}
get is_order_row(){return this._getter('is_order_row')}
set is_order_row(v){this._setter('is_order_row',v)}
get origin(){return this._getter('origin')}
set origin(v){this._setter('origin',v)}
}
$p.DpBuyers_orderSpecificationRow = DpBuyers_orderSpecificationRow;
class DpBuyers_orderCharges_discountsRow extends TabularSectionRow{
get nom_kind(){return this._getter('nom_kind')}
set nom_kind(v){this._setter('nom_kind',v)}
get discount_percent(){return this._getter('discount_percent')}
set discount_percent(v){this._setter('discount_percent',v)}
}
$p.DpBuyers_orderCharges_discountsRow = DpBuyers_orderCharges_discountsRow;
$p.dp.create('buyers_order');

/**
* ### Обработка builder_lay_impost
* Импосты и раскладки
* @class DpBuilder_lay_impost
* @extends DataProcessorObj
* @constructor 
*/
class DpBuilder_lay_impost extends DataProcessorObj{
get elm_type(){return this._getter('elm_type')}
set elm_type(v){this._setter('elm_type',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get split(){return this._getter('split')}
set split(v){this._setter('split',v)}
get elm_by_y(){return this._getter('elm_by_y')}
set elm_by_y(v){this._setter('elm_by_y',v)}
get step_by_y(){return this._getter('step_by_y')}
set step_by_y(v){this._setter('step_by_y',v)}
get align_by_y(){return this._getter('align_by_y')}
set align_by_y(v){this._setter('align_by_y',v)}
get inset_by_y(){return this._getter('inset_by_y')}
set inset_by_y(v){this._setter('inset_by_y',v)}
get elm_by_x(){return this._getter('elm_by_x')}
set elm_by_x(v){this._setter('elm_by_x',v)}
get step_by_x(){return this._getter('step_by_x')}
set step_by_x(v){this._setter('step_by_x',v)}
get align_by_x(){return this._getter('align_by_x')}
set align_by_x(v){this._setter('align_by_x',v)}
get inset_by_x(){return this._getter('inset_by_x')}
set inset_by_x(v){this._setter('inset_by_x',v)}
get w(){return this._getter('w')}
set w(v){this._setter('w',v)}
get h(){return this._getter('h')}
set h(v){this._setter('h',v)}
}
$p.DpBuilder_lay_impost = DpBuilder_lay_impost;
$p.dp.create('builder_lay_impost');

/**
* ### Обработка builder_pen
* Метаданные инструмента pen (рисование профилей)
* @class DpBuilder_pen
* @extends DataProcessorObj
* @constructor 
*/
class DpBuilder_pen extends DataProcessorObj{
get elm_type(){return this._getter('elm_type')}
set elm_type(v){this._setter('elm_type',v)}
get inset(){return this._getter('inset')}
set inset(v){this._setter('inset',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get bind_generatrix(){return this._getter('bind_generatrix')}
set bind_generatrix(v){this._setter('bind_generatrix',v)}
get bind_node(){return this._getter('bind_node')}
set bind_node(v){this._setter('bind_node',v)}
}
$p.DpBuilder_pen = DpBuilder_pen;
$p.dp.create('builder_pen');

/**
* ### Обработка builder_text
* Метаданные инструмента text
* @class DpBuilder_text
* @extends DataProcessorObj
* @constructor 
*/
class DpBuilder_text extends DataProcessorObj{
get text(){return this._getter('text')}
set text(v){this._setter('text',v)}
get font_family(){return this._getter('font_family')}
set font_family(v){this._setter('font_family',v)}
get bold(){return this._getter('bold')}
set bold(v){this._setter('bold',v)}
get font_size(){return this._getter('font_size')}
set font_size(v){this._setter('font_size',v)}
get angle(){return this._getter('angle')}
set angle(v){this._setter('angle',v)}
get align(){return this._getter('align')}
set align(v){this._setter('align',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get x(){return this._getter('x')}
set x(v){this._setter('x',v)}
get y(){return this._getter('y')}
set y(v){this._setter('y',v)}
}
$p.DpBuilder_text = DpBuilder_text;
$p.dp.create('builder_text');

/**
* ### Обработка builder_coordinates
* Метаданные инструмента coordinates
* @class DpBuilder_coordinates
* @extends DataProcessorObj
* @constructor 
*/
class DpBuilder_coordinates extends DataProcessorObj{
get bind(){return this._getter('bind')}
set bind(v){this._setter('bind',v)}
get path(){return this._getter('path')}
set path(v){this._setter('path',v)}
get offset(){return this._getter('offset')}
set offset(v){this._setter('offset',v)}
get step(){return this._getter('step')}
set step(v){this._setter('step',v)}
get step_angle(){return this._getter('step_angle')}
set step_angle(v){this._setter('step_angle',v)}
get coordinates(){return this._getter_ts('coordinates')}
set coordinates(v){this._setter_ts('coordinates',v)}
}
$p.DpBuilder_coordinates = DpBuilder_coordinates;
class DpBuilder_coordinatesCoordinatesRow extends TabularSectionRow{
get x(){return this._getter('x')}
set x(v){this._setter('x',v)}
get y(){return this._getter('y')}
set y(v){this._setter('y',v)}
}
$p.DpBuilder_coordinatesCoordinatesRow = DpBuilder_coordinatesCoordinatesRow;
$p.dp.create('builder_coordinates');

/**
* ### Отчет materials_demand
* Потребность в материалах
* @class RepMaterials_demand
* @extends DataProcessorObj
* @constructor 
*/
class RepMaterials_demand extends DataProcessorObj{
get calc_order(){return this._getter('calc_order')}
set calc_order(v){this._setter('calc_order',v)}
get formula(){return this._getter('formula')}
set formula(v){this._setter('formula',v)}
get scheme(){return this._getter('scheme')}
set scheme(v){this._setter('scheme',v)}
get production(){return this._getter_ts('production')}
set production(v){this._setter_ts('production',v)}
get specification(){return this._getter_ts('specification')}
set specification(v){this._setter_ts('specification',v)}
}
$p.RepMaterials_demand = RepMaterials_demand;
class RepMaterials_demandProductionRow extends TabularSectionRow{
get use(){return this._getter('use')}
set use(v){this._setter('use',v)}
get characteristic(){return this._getter('characteristic')}
set characteristic(v){this._setter('characteristic',v)}
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get qty(){return this._getter('qty')}
set qty(v){this._setter('qty',v)}
}
$p.RepMaterials_demandProductionRow = RepMaterials_demandProductionRow;
class RepMaterials_demandSpecificationRow extends TabularSectionRow{
get calc_order(){return this._getter('calc_order')}
set calc_order(v){this._setter('calc_order',v)}
get product(){return this._getter('product')}
set product(v){this._setter('product',v)}
get cnstr(){return this._getter('cnstr')}
set cnstr(v){this._setter('cnstr',v)}
get elm(){return this._getter('elm')}
set elm(v){this._setter('elm',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get article(){return this._getter('article')}
set article(v){this._setter('article',v)}
get clr(){return this._getter('clr')}
set clr(v){this._setter('clr',v)}
get characteristic(){return this._getter('characteristic')}
set characteristic(v){this._setter('characteristic',v)}
get nom_kind(){return this._getter('nom_kind')}
set nom_kind(v){this._setter('nom_kind',v)}
get qty(){return this._getter('qty')}
set qty(v){this._setter('qty',v)}
get len(){return this._getter('len')}
set len(v){this._setter('len',v)}
get width(){return this._getter('width')}
set width(v){this._setter('width',v)}
get s(){return this._getter('s')}
set s(v){this._setter('s',v)}
get material(){return this._getter('material')}
set material(v){this._setter('material',v)}
get grouping(){return this._getter('grouping')}
set grouping(v){this._setter('grouping',v)}
get totqty(){return this._getter('totqty')}
set totqty(v){this._setter('totqty',v)}
get totqty1(){return this._getter('totqty1')}
set totqty1(v){this._setter('totqty1',v)}
get alp1(){return this._getter('alp1')}
set alp1(v){this._setter('alp1',v)}
get alp2(){return this._getter('alp2')}
set alp2(v){this._setter('alp2',v)}
get sz(){return this._getter('sz')}
set sz(v){this._setter('sz',v)}
get price(){return this._getter('price')}
set price(v){this._setter('price',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
get amount_marged(){return this._getter('amount_marged')}
set amount_marged(v){this._setter('amount_marged',v)}
}
$p.RepMaterials_demandSpecificationRow = RepMaterials_demandSpecificationRow;
$p.rep.create('materials_demand');

/**
* ### Отчет cash
* Денежные средства
* @class RepCash
* @extends DataProcessorObj
* @constructor 
*/
class RepCash extends DataProcessorObj{
get data(){return this._getter_ts('data')}
set data(v){this._setter_ts('data',v)}
}
$p.RepCash = RepCash;
class RepCashDataRow extends TabularSectionRow{
get period(){return this._getter('period')}
set period(v){this._setter('period',v)}
get register(){return this._getter('register')}
set register(v){this._setter('register',v)}
get organization(){return this._getter('organization')}
set organization(v){this._setter('organization',v)}
get bank_account_cashbox(){return this._getter('bank_account_cashbox')}
set bank_account_cashbox(v){this._setter('bank_account_cashbox',v)}
get initial_balance(){return this._getter('initial_balance')}
set initial_balance(v){this._setter('initial_balance',v)}
get debit(){return this._getter('debit')}
set debit(v){this._setter('debit',v)}
get credit(){return this._getter('credit')}
set credit(v){this._setter('credit',v)}
get final_balance(){return this._getter('final_balance')}
set final_balance(v){this._setter('final_balance',v)}
}
$p.RepCashDataRow = RepCashDataRow;
$p.rep.create('cash');

/**
* ### Отчет goods
* Товары на складах
* @class RepGoods
* @extends DataProcessorObj
* @constructor 
*/
class RepGoods extends DataProcessorObj{
get data(){return this._getter_ts('data')}
set data(v){this._setter_ts('data',v)}
}
$p.RepGoods = RepGoods;
class RepGoodsDataRow extends TabularSectionRow{
get period(){return this._getter('period')}
set period(v){this._setter('period',v)}
get register(){return this._getter('register')}
set register(v){this._setter('register',v)}
get warehouse(){return this._getter('warehouse')}
set warehouse(v){this._setter('warehouse',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get characteristic(){return this._getter('characteristic')}
set characteristic(v){this._setter('characteristic',v)}
get initial_balance(){return this._getter('initial_balance')}
set initial_balance(v){this._setter('initial_balance',v)}
get debit(){return this._getter('debit')}
set debit(v){this._setter('debit',v)}
get credit(){return this._getter('credit')}
set credit(v){this._setter('credit',v)}
get final_balance(){return this._getter('final_balance')}
set final_balance(v){this._setter('final_balance',v)}
get amount_initial_balance(){return this._getter('amount_initial_balance')}
set amount_initial_balance(v){this._setter('amount_initial_balance',v)}
get amount_debit(){return this._getter('amount_debit')}
set amount_debit(v){this._setter('amount_debit',v)}
get amount_credit(){return this._getter('amount_credit')}
set amount_credit(v){this._setter('amount_credit',v)}
get amount_final_balance(){return this._getter('amount_final_balance')}
set amount_final_balance(v){this._setter('amount_final_balance',v)}
}
$p.RepGoodsDataRow = RepGoodsDataRow;
$p.rep.create('goods');

/**
* ### Отчет invoice_execution
* Исполнение заказов
* @class RepInvoice_execution
* @extends DataProcessorObj
* @constructor 
*/
class RepInvoice_execution extends DataProcessorObj{
get data(){return this._getter_ts('data')}
set data(v){this._setter_ts('data',v)}
}
$p.RepInvoice_execution = RepInvoice_execution;
class RepInvoice_executionDataRow extends TabularSectionRow{
get period(){return this._getter('period')}
set period(v){this._setter('period',v)}
get organization(){return this._getter('organization')}
set organization(v){this._setter('organization',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get partner(){return this._getter('partner')}
set partner(v){this._setter('partner',v)}
get trans(){return this._getter('trans')}
set trans(v){this._setter('trans',v)}
get invoice(){return this._getter('invoice')}
set invoice(v){this._setter('invoice',v)}
get pay(){return this._getter('pay')}
set pay(v){this._setter('pay',v)}
get pay_total(){return this._getter('pay_total')}
set pay_total(v){this._setter('pay_total',v)}
get pay_percent(){return this._getter('pay_percent')}
set pay_percent(v){this._setter('pay_percent',v)}
get shipment(){return this._getter('shipment')}
set shipment(v){this._setter('shipment',v)}
get shipment_total(){return this._getter('shipment_total')}
set shipment_total(v){this._setter('shipment_total',v)}
get shipment_percent(){return this._getter('shipment_percent')}
set shipment_percent(v){this._setter('shipment_percent',v)}
}
$p.RepInvoice_executionDataRow = RepInvoice_executionDataRow;
$p.rep.create('invoice_execution');

/**
* ### Отчет mutual_settlements
* Взаиморасчеты
* @class RepMutual_settlements
* @extends DataProcessorObj
* @constructor 
*/
class RepMutual_settlements extends DataProcessorObj{
get data(){return this._getter_ts('data')}
set data(v){this._setter_ts('data',v)}
}
$p.RepMutual_settlements = RepMutual_settlements;
class RepMutual_settlementsDataRow extends TabularSectionRow{
get period(){return this._getter('period')}
set period(v){this._setter('period',v)}
get register(){return this._getter('register')}
set register(v){this._setter('register',v)}
get organization(){return this._getter('organization')}
set organization(v){this._setter('organization',v)}
get trans(){return this._getter('trans')}
set trans(v){this._setter('trans',v)}
get partner(){return this._getter('partner')}
set partner(v){this._setter('partner',v)}
get initial_balance(){return this._getter('initial_balance')}
set initial_balance(v){this._setter('initial_balance',v)}
get debit(){return this._getter('debit')}
set debit(v){this._setter('debit',v)}
get credit(){return this._getter('credit')}
set credit(v){this._setter('credit',v)}
get final_balance(){return this._getter('final_balance')}
set final_balance(v){this._setter('final_balance',v)}
}
$p.RepMutual_settlementsDataRow = RepMutual_settlementsDataRow;
$p.rep.create('mutual_settlements');

/**
* ### Отчет selling
* Продажи
* @class RepSelling
* @extends DataProcessorObj
* @constructor 
*/
class RepSelling extends DataProcessorObj{
get data(){return this._getter_ts('data')}
set data(v){this._setter_ts('data',v)}
}
$p.RepSelling = RepSelling;
class RepSellingDataRow extends TabularSectionRow{
get period(){return this._getter('period')}
set period(v){this._setter('period',v)}
get register(){return this._getter('register')}
set register(v){this._setter('register',v)}
get organization(){return this._getter('organization')}
set organization(v){this._setter('organization',v)}
get department(){return this._getter('department')}
set department(v){this._setter('department',v)}
get partner(){return this._getter('partner')}
set partner(v){this._setter('partner',v)}
get trans(){return this._getter('trans')}
set trans(v){this._setter('trans',v)}
get nom(){return this._getter('nom')}
set nom(v){this._setter('nom',v)}
get characteristic(){return this._getter('characteristic')}
set characteristic(v){this._setter('characteristic',v)}
get quantity(){return this._getter('quantity')}
set quantity(v){this._setter('quantity',v)}
get amount(){return this._getter('amount')}
set amount(v){this._setter('amount',v)}
get vat_amount(){return this._getter('vat_amount')}
set vat_amount(v){this._setter('vat_amount',v)}
get discount(){return this._getter('discount')}
set discount(v){this._setter('discount',v)}
}
$p.RepSellingDataRow = RepSellingDataRow;
$p.rep.create('selling');
})();
};