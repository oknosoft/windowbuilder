/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module main.js
 * Created 04.07.2016
 */

const electron = require('src/utils/electron')
// Модуль, контролирующий основное: сам Electron.
const app = electron.app
// Модуль, создающий окно приложения.
const BrowserWindow = electron.BrowserWindow

// Удерживайте глобальное обращение к объекту окна, если Вы так не сделаете, то
// окно само закроется после того, как объект будет собран сборщиком мусора.
let mainWindow

function createWindow () {
	// Создаём окно браузера
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		icon:	'dist/imgs/fav-wnd.ico'
	})

	// и загружаем index.html приложения.
	mainWindow.loadURL('file://' + __dirname + '/debug.electron.html')

	// Открываем DevTools.
	mainWindow.webContents.openDevTools()

	// Будет выполнено, когда пользователь закроет окно
	mainWindow.on('closed', function () {
		// Убрать обращение на объект окна, обычно стоит хранить окна в массиве,
		// если ваше приложение поддерживает несколько, сейчас стоит удалить
		// соответствующий элемент.
		mainWindow = null
	})
}

//Этот метод будет вызван, когда Electron закончит инициализацию
//и будет готов создавать окна браузера.
//Некоторые API возможно использовать только после того, как
//это произойдёт.
app.on('ready', createWindow)

// Выйти, если все окна закрыты
app.on('window-all-closed', function () {
	//На macOS приложение и его строка меню обычно остаются активными,
	//пока пользователь не завершит их с помощью `Cmd + Q`.
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', function () {
	//На macOS приложение обычно пересоздаёт окно, когда
	//пользователь кликает на его иконку в доке, если не открыто
	//других окон.
	if (mainWindow === null) {
		createWindow()
	}
})
