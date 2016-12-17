// модификаторы объектов и менеджеров данных

// модификаторы справочников
import catalogs from "./catalogs";

// модификаторы документов
import documents from "./documents";

// модификаторы планов видов характеристик
import chartscharacteristics from "./chartscharacteristics";

// модификаторы отчетов
import reports from "./reports";

// строки интернационализации
import i18n_ru from "./i18n.ru";


export default function ($p) {
	catalogs($p)
	documents($p)
	chartscharacteristics($p)
	reports($p)
	i18n_ru($p)
}
