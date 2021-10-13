Версия 1.0.4 13.10.2021
1. Работает сортировка по алфавиту списка сотрудников
2. Корректно работает поиск в списке сотрудников, включая частичное совпадение
3. В контекстном меню списка подразделений изменено название пункта на "Отправить"

Версия 1.0.3 12.10.2021
1. Устранена ошибка Bug#01. Manager. "Календарь отпусков". Web page becomes a blank (очистка фильтра в графике отпусков не меняет данных в календаре)
2. Устранен Bug#01 - пункты меню доступны неавторизованным пользователям (хотя ничего и не делают). Также меню очищается при логауте
3. Устранено: панель поиска в меню пользователя в минимализированном экране

Версия 1.0.2 10.11.2021
1. Цветом выделена колонка "Отправлено" в списке подразделений
2. Список подразделений - showGridlines
3. При отправке на утверждение - время утверждения записывается в записи о подразделении
4. Исправлены заголовки таблицы в списке подразделений
5. Добавлены функции загрузки и утверждения расписания в подразделении
6. Сортировка и поиск в списке сотрудников
7. Устранено: для сотрудника можно было ввести неправильное подразделение и должность (только часть слова)
8. Для сотрудника проверяется формат электронной почты
9. Устранена ошибка: создание копии карточки сотрудника при повторном нажатии на кнопку "сохранить", когда вводится новый сотрудник (для редактирования старого не наблюдалось)
10. Добавлен номер версии на страницу логина
11. Изменены места полей: дней недели и продолжительность работы, добавлена единица измерения для пятницы
12. Можно ввести пустое примечания HR
Версия 1.0.1 09.20.2021
1. В список подразделений доавлены колонки с временем утверждения и отправки
Версия 1.0 07.10.2021
1. Исправлена ошибка: при выборе сотрудника в сводке сбой, если сотрудника с указанным фрагментом в имени нет
2. При попытке загрузить больничный из записи, где нет данных об имени файла - выдается сообщение об ошибке
3. Исправлена ошибка при редактировании утвержденного времени
4. При вводе пользователя и пароля используется слово "Вход", а не регистрация
5. Добавлен общий заголовок в сервис ScheduleService, для авторизации и передачи данных в json
Версия 0.9.9.5 05.10.2021
1. Переименован пункт меню; посчитать по плану / факту
2. Для списка подразделений добавлена полоса прокрутки (список сортирован по алфавиту на серверной стороне)
3. Исправлено: не очищается номер смены и доп. информация при сохранении и удалении смены
4. Смены представляются в виде списка(listbox), а не выбором с кнопкой
5. При создании смен есть кнопка для копирования часов на понедельник-четверг из воскресенья
6. Скроллинг списка продаж
7. В итоге за месяц выделены часы и минуты вместо hh:mm
Версия 0.9.9.3 04.10.2021
1. При успешном сохранении фотографии сотрудника, фотография сразу появляетмя на экране, карточка не закрывается
2. Исправлено: менеджер не видит примечания сотрудника
Версия 0.9.9.2 04.10.2021
1. Устранена ошибка при открытии календарей (получение данных из локального хранилища)
2. Если в графике отпусков пустой фильтр (и подразделение, и персона - выборка не осуществляется)
3. Восстановлен показ списка продаж
Версия 0.9.9.1 04.10.2021
1. Выбранная дата не теряется при работе со сводкой
2. Выбранная дата записывается в локальное хранилище, а не сессионное
Версия 0.9.9 04.10.2021
1. employeeId добавлен в тип User
2. Сравнение и определение типа столбца в AppSets позволяет параметр типа RowType (объект)
3. Проверямое расширение при загрузке файлов для сравнения переводится в нижний регистр
4. Добавлено получение сведений о продажах при открытии сведений о рабочем дне из сводки
5. Изменены цвета фона в сводке
6. Отлажено редактирование примечаний сотрудника и HR
Версия 0.9.8 04.10.2021
1. Добавлена кнопка "Создать сотрудника" в список сотрудников, которая открывает форму для создания нового сотрудника
2. Изменения в форме редактирования данных о сотруднике, чтобы иметь возможность ввести нового (без id и working=true by default)
3. Таблица сотрудников ограничена по высоте (скроллируется)
4. Ввести фото нельзя, пока не заполнены ключевые поля
5. Сделаны разные варианты меню для HR и продавцов
6. Исправлена ошибка - запрещалось редактирование дат при создании отпусков и больничных продавцом
Версия 0.9.7 29.09.2021
1. При планировании смен после сохранения очередной - кнопка прячется. Исправлено. Кнопка появляется вновь не только при выборе магазина, работника или очистки смены, но и при вводе времени работы от и до, и выборе новой даты в списке дат
2. Устранено: при изменении плана прихода-ухода, вместо кода подразделения записывался код сотрудника
3. В выгрузку csv добавлены варианты: план-факт, для факта - по человеку и подразделению, план - только по человеку
4. При редактировании подразделений и смен, кнопки "Добавить" видны только если подразделение или смена выбраны.
5. При открытии информации на день более понятные сообщения об ошибках.
6. В данных о сотруднике при вводе проверяется диапазон значений для длительности рабочей недели и смен
7. Добавлена обработка ошибок при загрузке фотографии сотрудника
8. Устранена ошибка: не сохраняется подразделение сотрудника
9. Устранена ошибка: исключение при попытке ввести часть названия подразделения (для подсказки) в форме "Сотрудник"
Версия 0.9.6
1. Удаление отпуска
2. Добавлен значок в подтверждающий диалог
3. Исправлена ошибка - расписание смен открывает неправильный месяц
4. Изменен запрос на получение календаря на месяц
Версия 0.9.5
1. Обновление времени опоздания или переработки в строке после изменения утвержденного времени, обновление summary сводки
2. Сравнение типов записи сделано статическим методом
3. Устранена ошибка при создании расписания для следующего продавца, после того, как создано для одного - в том же самом
   подразделении
4. При выбранный пользователь запоминается в локальное хранилище и используется для значения по умолчанию при переключении экранов сводки, планирования календаря, ввода данных и т.п.
5. Начата работа по управлению доступом к странице создания и редактирования day-off для разных пользователей в режиме создания и редактирования, в зависимости от полномочий, вида отсутствия и сроков
Версия 0.9.4 2021.09.18
1. Исправлена ошибка - при открытии записи календаря из графика работы неправильно отображается тип записи
2. Исправлена ошибка - неправильно сохраняется тип записи при создании ее из планирования отпусков и больничных
3. Исправлена ошибка - не может отобразиться сообщение об ошибке в корне сводки (например, неверный запрос по сводке)
4. Добавлена обработка ошибки 415
5. Добавлена возможность загрузить и получить графический или pdf-файл с больничным в сводке из документа и получить из представления
Версия 0.9.3 2021.09.13
1. Добавлен справочник должностей
2. Добавлен атрибут alt в фотографии сотрудника (чтобы убрать предупреждение компилятора)
Версия 0.9.2 2021.09.12
1. Добавлена процедура утверждения расписания
Версия 0.9.1 2021.09.09
1. Добавлен заголовок для корректной отправки изображения
2. Если в БД есть фотография, отображается фотография сотрудника, если нет, или в случае ошибки - предопределенная картинка
3. Реализована загрузка фото сотрудника с подгонкой по размеру
4. Списки типов столбцов (причин отсутствия) унифицирован и помещен в AppSettings
Версия 0.9.0 2021.09.07
1. Изменен вид контекстного меню сводки 
2. Контекстное меню сводки разрешает подтвердить приходы и уходы по плану, а не по факту
3. Контекстное меню сводки позволяет принять все записи, в которых приход и уход, как по плану в расписании
4. Устранена ошибка: кнопка "Создать" (расписание) не появляется после того, как был создан вариант расписания (эта кнопка уже нажималась), а новое расписание задается не сменой, а списком дат и интервалом времени
5. Реализовано удаление смены.
6. Реализовано удаление подразделения
7. Добавлена возможность показывать все подразделения, включая удаленные. Выбор удаленного подразделения заблокирован.
Версия 0.8 2021.09.04
1. Добавлено имя пользователя на верхней панели приложения
2. Добавлена итоговая информация по сводке
3. В сводке примечания менеджера и сотрудника - в отдельных колонках
4. Добавляется надпись "больничный", "отпуск", "прогул" в сводке к примечанию HR
5. Переход на страницу аутентификации из любого компонента происходит через push, а не location
6. Отдельное представление для уволенных сотрудников в соответствующем пункте меню.
7. Устранена ошибка, связанная с форматами даты в дне рождения сотрудника
8. В планировании расписания сообщения сделаны более читабельными (на весь экран, нет выхода за пределы окна)
Версия 0.7.1 2021.09.01
Устранены ошибки:
1. не считывается поле "Длина смены в пятницу" в карточке сотрудника
2. не отображается номер телефона в карточке сотрудника
3. некорректно отображается проверка пустого номера телефона
4. при изменении даты в форме больничного - при сохранении даты старые
5. не сохраняется пояснение сотрудника в форме day off
. Удалены неиспользуемые файлы (графика из Сапфира) из проекта
Версия 0.7.7 2021.08.31
1. Вставлена проверка при удалении: не пытается ли пользователь удалить данные прошедшего месяца
2. Кнопки создания, удаления и проверки расписания спрятаны от обычных пользователей  
3. Добавлены формирование и загрузка информации о фактически отработанном времени в виде csv 
4. Исправлено: null, если нет фамилии в списке сотрудников
5. Исправлено: не видна кнопка создать, когда выбраны даты и промежуток времени, а не смена
6. Для рядового сотрудника в планировании смен спрятаны все даты
7. При планировании расписания добавлена кнопка очистки выбора смены
8. Перекомпонованы поля планирования расписания
9. Удалены лишние картинки из public assets
Версия 0.7.6 2021.08.31
1. Исправлено: не хватает 1 символа в начале номера телефона
2. Исправлены недочеты в разных компонентах, выданные в предупреждениях
3. При регистрации получаются не только данные пользователя, но и сотрудника - должность и подразделение
4. Продавцы для магазина выбираются из списка, у которых этот магазин указан в качестве подразделения (было), а также и те, у которых подразделение не указано в настройках
5. Форма ввода отпуска: можно выбирать сотрудника из списка дозволеннных данному продавцу; кнопки "Сохранить" и "Удалить" видны, если только обязательные поля заполнены
6. Исправлено: для HR в форме отпуска показывался список подразделения, а не сотрудников
7. График смен включает сотрудников не только закрепленным за магазином, но и назначенных в график (другой запрос на сервер)
8. Исправлена методика определения - не пробуем ли мы составить новый график на прошедший период
9. Добавлена возможность планирования работы не по сменам, а просто в интервале времени и интервале или списке дат
10. Добавлена проверка запланированного расписания на предмет соответствия предпочтениям в настройках пользователя 
11. Добавлено удаление расписаний
Версия 0.7.5 2021.08.26
1. Добавлен механизм аутентификации, любая страница открывается только аутентифицированному пользователю
Версия 0.7.0 2021.08.24
1. Отображение праздников в календаре
2. Значок кнопок создания смены и подразделения изменен на ПЛЮС, изменен хинт кнопок
3. Устранено: нет списка смен, когда подразделением подгружается их хранилища, а не выбирается руками
4. Добавлена возможность вводить комментарий в сводке. В поле note, если HR, reason - если продавец
5. В сводке виден значок "колокольчик", если есть комментарий менеджера. При нажатии, сообщение менеджера всплывает как тост
Версия 0.6.1 2021.08.23
1. Исправлены ошибки при сохранении сотрудника
2. Исправлены ошибки, не позволяющие создать расписание на отдельные дни
3. Календари открываются на том месяце, на котором открывались в последний раз в текущей сессии
4. Из меню удалены не используемые пункты "Настройки приложения" и "Настройки пользователя"
Версия 0.6 2021.08.22
1. Сохраняется новое расписание на месяц
2. Избавились от i18, настройки локали календаря перенесли в настройки приложения
3. Универсальная обработка ошибки обращения к серверу добавлена в AppSettings
4. Выбранный месяц отображается в поле выбора в сводке
5. В карточку сотрудника добавлен чек-бокс "работает"
6. В карточе сотрудника вычисляется признак того, что данные были изменены
7. Исправлена ошибка - конец работы в воскресенье в планировании
8. Изменена работа кнопок в редактировании смен
9. В функции отображения ошибок при передаче данных в сервисе расписаний добавлен необязательный параметр sticky с значением по умолчанию
10. Реализована функциональность - изменение и удаление расписания на отдельный день
Версия 0.5.2.1 16.08.2021
Подправлена работа фильтра в планировании отпусков
Версия 0.5.2 15.08.2021
1. Корректно отображается планирование отпусков и больничных (выборка и заголовок)
2. Подправлены цвета фона в сводке
Версия 0.5.1 11.08.2021
1. Создание расписания на будущий период: валидация введенных данных, возможность ввода интервала дат как кнопкой, так и выбором в календаре, отправка запроса на создание расписания на сервер
2. Скорректирован ввод сведений о подразделении - расстояние и размео полей ввода
3. При выборе смены в окне создания расписания, раскладка часов по дням недели и примечание отображается на экране
4. Исправлены отступы в карточке сотрудников
5. Исправлена ошибка в карточке сотрудников: не показывались списки должностей и подразделений
6. ЗАГЛУШКА! ПОлучается пользователь с правами (по заглушке), но отображение форм в соответствии с полномочиями
7. В планировании отпусков для продавца по умолчанию назначается выбранным его подразделение, а в списке сотрудникво можно выбрать одного из сотрудников того же магазина. Для менеджера - можно выбрать подразделение, а сотрудников - из списка продавцов этого же магазина
8. На страницу календарей добавлены заголовки
Версия 0.5 09.08.2021
1. Миграция на версию 6.0.0 Primereact и Fullcalendar/react
2. Добавлено представление-календарь для планирования отпусков
3. Изменена форма для ввода сведений об отпуске
4. Добавлен мок для получение списка праздников в AppSets
5. Учтены мелкие предупреждения в разных компонентах
6. Начата разработка экрана планирования графика по магазину

Версия 0.4.2 02.08.2021
1. Добавлены поля: длительность смены, дней в неделю, дополнительные условия в карточку сотрудника

Версия 0.4.1
1. Форма для ввода отклонений в расписании (отпуск, больничный и т.д)
2. Кнопка и контекстное меню в планировании графика на будущие периоды
3. Исправлена цветовая маркировка дней с отсутствием
4. Более корректно работает календарь при выборе месяца
5. Создана страница для изображения неустранимых ошибок

Версия 0.1.1 21.06.21
1. Экран продавца, корректно отрабатывающий сведения о приходе и уходе из мока

Для запуска и компиляции sass потребовалась установка windows-tools в конфигурации
choco install python visualcpp-build-tools -y
npm config set msvs_version 2017

