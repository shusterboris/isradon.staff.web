Версия 1.3 2022-05-01

1. Устранены 3 ошибки перевода контекстного меню

Версия 1.2 2022-04-26

1. Устранена ошибка: не открывается справочник должностей.
2. Устранена ошибка: не отображается причина ошибки на странице ошибки
3. Устранена ошибка: неправильный переход при отсутствии полномочий на справочнике должностей
4. При вводе имени пользователя и паролей, после успешной записи эти поля очищаются, что предотвращает ошибку
5. Пока не заполнены имя пользователя и пароли пользователя в справочнике пользователей, кнопка "Сохранить" не видна
6. Устранено: нет заголовка подразделения в таблице с сотрудниками
7. Добавлен фильтр в таблице сотрудников в справочнике пользователей
8. Исправлена ошибка: не открывается сводка

Версия 1.17 2022-04-05

1. Устранена ошибка: данные в сводке появляются только после выбора

Версия 1.16 2022-25-03

1. Добавлен механизм перехода по ссылке из системы "Исрадон"
2. Добавлен режим сохранения пароля

Версия 1.14 2022-01-09

1. Исправлена ошибка (отчет руководителя предоставлялся только за текущий год)
2. Добавлена локаль календаря для GB (с английским флажком)
3. На SummaryReport отработана локализация календаря с учетом выбранной локали i18next

Версия 1.13 2022-01-05

1. Аутентификация перенесена в рутер (в т.ч. и работники склада), а из компонентов проверка убрана
2. Изменена картинка для работы с профилем пользователя и логином

Версия 1.12 2021-12-30

1. При логине работника склада делается несколько попыток
2. Добавлены основы локализации (i18next, определение языка, файлы ресурсов, хуки)
3. Исправлена ошибка открытия главного экрана при пустых сменах

Версия 1.11 2021-12-09

1. Связь с базой Исрадона в списке пользователей отображается вне зависимости от наличия имени пользователя в HR-портале
2. Устранена ошибка - не учитывается год в сводке

Версия 1.9

1. Контекстное меню в сводке: добавлен пункт - отмена утверждения (и в плане, и в факте)
2. Убраны причины всяческих предупреждений
3. План смен корректно показывается при любом сочетании (или отсутствии) сотрудников и магазинов
4. Устранена ошибка - исчезновение сведений о магазине при ручном утверждении времени прихода и ухода
5. Устранена ошибка: при ручной отметке не сохраняется значение, если Enter сразу же подтверждает значение, сделанное по умолчанию

    Версия 1.8

6. Messages в сводке, плане на месяц, сотруднике изменен на toast
7. Массово добавлены id-ы элементов
   Версия 1.7.2 16.11.2021
8. Уменьшен размер заголовка (topbar) на medium
9. Изменен цвет суммарной информации в сводке (стал не виден на фоне уменьшенного заголовка)
10. Исроавлено: связь сотрудника с базой Исрадона не отображалась, если нет имени пользователя
    Версия 1.7.1 15.11.2021
11. Реализовано добавление и удаление связок с пользователями из магазинов
12. При выборе пользователей в списке пользователей (меню Настройки), корректно отображаются данные, прячутся старые, если пользователя нет, а есть только сотрудник и т.д.
13. Если для работника с ручной отметкой нет записи в плане - она создается
    Версия 1.7 14.11.2021
14. Добавлена кнопка "Выход" на экране ввода пользователя
15. При сохранении пользователя первый раз, проверяются все поля; повторном - только равенство паролей
16. В процессе добавления связки с пользователями Исрадон
    Версия 1.6 11.11.2021
17. Исправлена ошибка - не сохраняется подразделение у сотрудника
18. Исправлено: при вводе нового пароля, в одном из полей пароль отображается явно, а не в виде звездочек
19. В календаре отображается подразделение, если выборка только по сотруднику
    Версия 1.5.1 10.11.2021
20. Устранена ошибка - продавец не может создать отпуск
21. Исправлена ошибка - в календаре отпусков не учитывался год
22. Исправлено: нет возможности выйти из режима смены пароля
23. Устранена ошибка: невозможно дважды сохранить данные о сотруднике без перезагрузки
24. Форма сотрудника использует тостер, а не message
25. Корректно обрабатывается ошибка - дублирование ФИО или телефона
    Версия 1.4 04.11.2021
26. Исправлена ошибка, когда не проверялся доступ к менеджерским функциям при прямом вводе URL рядовым сотрудником
27. Для сотрудника длина имени и фамилии ограничена в интерфейсе 15 символами
28. В списке сотрудников сообщения в виде Тост
29. Добавлен заголовок в списке сотрудников, разный для работающих и уволенных
    Версия 1.3.1 03.11.2021
30. Исправлена ошибка при определении роли "Работник склада"
31. Увеличено расстояние между кнопками в диалоге подтверждения
32. Уменьшена ширина полей для доп.информации для мобильного
33. Добавлена кнопка выбора месяца на директорской сводке
    Версия 1.3 03.11.2021
34. Директорский отчет
    Версия 1.2 31.10.2021
35. Устранено: колонка "Подразделение" в сводке становится пустым при отметке дня как больничный, отпуск и т.д.
36. Пользователь может изменить даты больничного
37. Устранены ошибки при сохранении больничного в форме DayOff, добавлено сообщение об успешном сохранении
38. При переходе на другого пользователя очищаются данные в локальном хранилище данных о пользователе
39. Сделана форма для работников склада (компактная, для мобильного)
40. Исправлено: при подсчете плановых дней в заголовке сводки учитываются больничные, прогулы и отпуска за свой счет
41. Из сводки открывается форма для редактирования планового времени в случае рабочего дня и форма DayOff для всего остального
    Версия 1.1.4 28.10.2021
42. Добавлен таймаут во все запросы
43. Убрано скроллирование из сводки
44. На отметке "работает" в качестве всплывающей подсказки добавлена надпись: удалять в конце месяца
45. В сводке Message изменено на Toast (всплывающее сообщение в правом верхнем углу, без смещения текста на странице)
46. Исправлена ошибка: утверждение приход и уход по плану отмечал их по факту
47. Оптимизирован заголовок сводки
48. Итоговая информация в заголовке сводки сделана, как сказала Татьяна - в 5 строчек
49. В сводке и графике отпусков менеджер может выбрать любого сотрудника, остальные - только работающих в его подразделении
50. В планировании аналогично, плюс продавец может выбирать только свое подразделение.
51. Устранены ошибки при сохранении пользователя
52. При просмотре списка пользователей иногда возникает редкая ошибка, конкретизировано сообщение об ошибке
53. Устранено: не сохраняется примечание пользователя из сводки
    Версия 1.1.3 27.10
54. Отметка прихода и ухода, если должность не продавец и не менеджер
55. Много еще чего...
    Версия 1.1.1.1 22.10.2021
56. На странице логина добавлена еще 1 информационная строка и номер версии из настроек
57. Добавлена возможность смены пароля пользователя на странице логина
58. Изменен порядок полей на справочнике подразделений
59. При редактировании справочника подразделений, добавлено поле для редактирования id подразделения в системе Исрадон
60. Изменен порядок пунктов в главном меню "Настройки", добавлен пункт "Пользователи"
61. Добавлен список продаж на форму, открывающуюся из сводки
62. Добавлено создание нового пользователя (пункт меню "Пользователи")
63. Переработана суммарная информация по сводке
    Версия 1.1.1 18.10.2021
64. Главной (входной) страницей сделан логин, а не сводка
65. Отлажено получение данных о сотруднике при входе в систему
66. При входе в систему сводка корректно отображается для вошедшего пользователя
67. Верхнее меню меняет пункт "Вход в систему" или "Смена пользователя" в зависимости от того, вошел пользователь в систему или нет
68. Исправлена ошибка: сдвиг названий дней недели в сводке
69. Уточнена формулировка ошибки на странице логина
70. Реализована ручная отметка прихода и ухода
71. Исправлена ошибка при создании плана со списком выбранных дат (не интервал)
72. Изменена форма для редактирования записи из сводки. Теперь можно редактировать время
73. Форма для редактирования расписания в сводке и планировании позволяет ввести комментарий менеджера и сотрудника с разделением доступа
    N. Устранены незначительные недочеты в интерфейсе по результатам тестирования

Версия 1.1.0 17.10.2021

1. Приведено в соответствии для работы с зональным временем на сервере
2. Изменена формулировка в сводке "Недоработка" вместо "Опоздания"
3. При выборе подразделения в сводке, отображается список сотрудников, связанных с подразеделением
4. Исправлены ошибки при сохранении сотрудника

Версия 1.0.5 13.10.2021

1. Устранено - нельзя очистить поле "дней в пятницу" или задать нулевым
2. Исправлена ошибка - невозможно создать выгрузку только по сотруднику
3. Окончательно исправлена ошибка с ошибочным сообщением о неправильном подразделении при сохранении сотрудника
4. Исправлена ошибка - неправильный номер телефона диагностировался не всегда

Версия 1.0.4 13.10.2021

1. Работает сортировка по алфавиту списка сотрудников
2. Корректно работает поиск в списке сотрудников, включая частичное совпадение
3. В контекстном меню списка подразделений изменено название пункта на "Отправить"
4. Исправлена ошибка - ложное сообщение об отсутствии подразделения при сохранении сотрудника

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
13. В список подразделений доавлены колонки с временем утверждения и отправки
    Версия 1.0 07.10.2021
14. Исправлена ошибка: при выборе сотрудника в сводке сбой, если сотрудника с указанным фрагментом в имени нет
15. При попытке загрузить больничный из записи, где нет данных об имени файла - выдается сообщение об ошибке
16. Исправлена ошибка при редактировании утвержденного времени
17. При вводе пользователя и пароля используется слово "Вход", а не регистрация
18. Добавлен общий заголовок в сервис ScheduleService, для авторизации и передачи данных в json
    Версия 0.9.9.5 05.10.2021
19. Переименован пункт меню; посчитать по плану / факту
20. Для списка подразделений добавлена полоса прокрутки (список сортирован по алфавиту на серверной стороне)
21. Исправлено: не очищается номер смены и доп. информация при сохранении и удалении смены
22. Смены представляются в виде списка(listbox), а не выбором с кнопкой
23. При создании смен есть кнопка для копирования часов на понедельник-четверг из воскресенья
24. Скроллинг списка продаж
25. В итоге за месяц выделены часы и минуты вместо hh:mm
    Версия 0.9.9.3 04.10.2021
26. При успешном сохранении фотографии сотрудника, фотография сразу появляетмя на экране, карточка не закрывается
27. Исправлено: менеджер не видит примечания сотрудника
    Версия 0.9.9.2 04.10.2021
28. Устранена ошибка при открытии календарей (получение данных из локального хранилища)
29. Если в графике отпусков пустой фильтр (и подразделение, и персона - выборка не осуществляется)
30. Восстановлен показ списка продаж
    Версия 0.9.9.1 04.10.2021
31. Выбранная дата не теряется при работе со сводкой
32. Выбранная дата записывается в локальное хранилище, а не сессионное
    Версия 0.9.9 04.10.2021
33. employeeId добавлен в тип User
34. Сравнение и определение типа столбца в AppSets позволяет параметр типа RowType (объект)
35. Проверямое расширение при загрузке файлов для сравнения переводится в нижний регистр
36. Добавлено получение сведений о продажах при открытии сведений о рабочем дне из сводки
37. Изменены цвета фона в сводке
38. Отлажено редактирование примечаний сотрудника и HR
    Версия 0.9.8 04.10.2021
39. Добавлена кнопка "Создать сотрудника" в список сотрудников, которая открывает форму для создания нового сотрудника
40. Изменения в форме редактирования данных о сотруднике, чтобы иметь возможность ввести нового (без id и working=true by default)
41. Таблица сотрудников ограничена по высоте (скроллируется)
42. Ввести фото нельзя, пока не заполнены ключевые поля
43. Сделаны разные варианты меню для HR и продавцов
44. Исправлена ошибка - запрещалось редактирование дат при создании отпусков и больничных продавцом
    Версия 0.9.7 29.09.2021
45. При планировании смен после сохранения очередной - кнопка прячется. Исправлено. Кнопка появляется вновь не только при выборе магазина, работника или очистки смены, но и при вводе времени работы от и до, и выборе новой даты в списке дат
46. Устранено: при изменении плана прихода-ухода, вместо кода подразделения записывался код сотрудника
47. В выгрузку csv добавлены варианты: план-факт, для факта - по человеку и подразделению, план - только по человеку
48. При редактировании подразделений и смен, кнопки "Добавить" видны только если подразделение или смена выбраны.
49. При открытии информации на день более понятные сообщения об ошибках.
50. В данных о сотруднике при вводе проверяется диапазон значений для длительности рабочей недели и смен
51. Добавлена обработка ошибок при загрузке фотографии сотрудника
52. Устранена ошибка: не сохраняется подразделение сотрудника
53. Устранена ошибка: исключение при попытке ввести часть названия подразделения (для подсказки) в форме "Сотрудник"
    Версия 0.9.6
54. Удаление отпуска
55. Добавлен значок в подтверждающий диалог
56. Исправлена ошибка - расписание смен открывает неправильный месяц
57. Изменен запрос на получение календаря на месяц
    Версия 0.9.5
58. Обновление времени опоздания или переработки в строке после изменения утвержденного времени, обновление summary сводки
59. Сравнение типов записи сделано статическим методом
60. Устранена ошибка при создании расписания для следующего продавца, после того, как создано для одного - в том же самом
    подразделении
61. При выбранный пользователь запоминается в локальное хранилище и используется для значения по умолчанию при переключении экранов сводки, планирования календаря, ввода данных и т.п.
62. Начата работа по управлению доступом к странице создания и редактирования day-off для разных пользователей в режиме создания и редактирования, в зависимости от полномочий, вида отсутствия и сроков
    Версия 0.9.4 2021.09.18
63. Исправлена ошибка - при открытии записи календаря из графика работы неправильно отображается тип записи
64. Исправлена ошибка - неправильно сохраняется тип записи при создании ее из планирования отпусков и больничных
65. Исправлена ошибка - не может отобразиться сообщение об ошибке в корне сводки (например, неверный запрос по сводке)
66. Добавлена обработка ошибки 415
67. Добавлена возможность загрузить и получить графический или pdf-файл с больничным в сводке из документа и получить из представления
    Версия 0.9.3 2021.09.13
68. Добавлен справочник должностей
69. Добавлен атрибут alt в фотографии сотрудника (чтобы убрать предупреждение компилятора)
    Версия 0.9.2 2021.09.12
70. Добавлена процедура утверждения расписания
    Версия 0.9.1 2021.09.09
71. Добавлен заголовок для корректной отправки изображения
72. Если в БД есть фотография, отображается фотография сотрудника, если нет, или в случае ошибки - предопределенная картинка
73. Реализована загрузка фото сотрудника с подгонкой по размеру
74. Списки типов столбцов (причин отсутствия) унифицирован и помещен в AppSettings
    Версия 0.9.0 2021.09.07
75. Изменен вид контекстного меню сводки
76. Контекстное меню сводки разрешает подтвердить приходы и уходы по плану, а не по факту
77. Контекстное меню сводки позволяет принять все записи, в которых приход и уход, как по плану в расписании
78. Устранена ошибка: кнопка "Создать" (расписание) не появляется после того, как был создан вариант расписания (эта кнопка уже нажималась), а новое расписание задается не сменой, а списком дат и интервалом времени
79. Реализовано удаление смены.
80. Реализовано удаление подразделения
81. Добавлена возможность показывать все подразделения, включая удаленные. Выбор удаленного подразделения заблокирован.
    Версия 0.8 2021.09.04
82. Добавлено имя пользователя на верхней панели приложения
83. Добавлена итоговая информация по сводке
84. В сводке примечания менеджера и сотрудника - в отдельных колонках
85. Добавляется надпись "больничный", "отпуск", "прогул" в сводке к примечанию HR
86. Переход на страницу аутентификации из любого компонента происходит через push, а не location
87. Отдельное представление для уволенных сотрудников в соответствующем пункте меню.
88. Устранена ошибка, связанная с форматами даты в дне рождения сотрудника
89. В планировании расписания сообщения сделаны более читабельными (на весь экран, нет выхода за пределы окна)
    Версия 0.7.1 2021.09.01
    Устранены ошибки:
90. не считывается поле "Длина смены в пятницу" в карточке сотрудника
91. не отображается номер телефона в карточке сотрудника
92. некорректно отображается проверка пустого номера телефона
93. при изменении даты в форме больничного - при сохранении даты старые
94. не сохраняется пояснение сотрудника в форме day off
    . Удалены неиспользуемые файлы (графика из Сапфира) из проекта
    Версия 0.7.7 2021.08.31
95. Вставлена проверка при удалении: не пытается ли пользователь удалить данные прошедшего месяца
96. Кнопки создания, удаления и проверки расписания спрятаны от обычных пользователей
97. Добавлены формирование и загрузка информации о фактически отработанном времени в виде csv
98. Исправлено: null, если нет фамилии в списке сотрудников
99. Исправлено: не видна кнопка создать, когда выбраны даты и промежуток времени, а не смена
100. Для рядового сотрудника в планировании смен спрятаны все даты
101. При планировании расписания добавлена кнопка очистки выбора смены
102. Перекомпонованы поля планирования расписания
103. Удалены лишние картинки из public assets
     Версия 0.7.6 2021.08.31
104. Исправлено: не хватает 1 символа в начале номера телефона
105. Исправлены недочеты в разных компонентах, выданные в предупреждениях
106. При регистрации получаются не только данные пользователя, но и сотрудника - должность и подразделение
107. Продавцы для магазина выбираются из списка, у которых этот магазин указан в качестве подразделения (было), а также и те, у которых подразделение не указано в настройках
108. Форма ввода отпуска: можно выбирать сотрудника из списка дозволеннных данному продавцу; кнопки "Сохранить" и "Удалить" видны, если только обязательные поля заполнены
109. Исправлено: для HR в форме отпуска показывался список подразделения, а не сотрудников
110. График смен включает сотрудников не только закрепленным за магазином, но и назначенных в график (другой запрос на сервер)
111. Исправлена методика определения - не пробуем ли мы составить новый график на прошедший период
112. Добавлена возможность планирования работы не по сменам, а просто в интервале времени и интервале или списке дат
113. Добавлена проверка запланированного расписания на предмет соответствия предпочтениям в настройках пользователя
114. Добавлено удаление расписаний
     Версия 0.7.5 2021.08.26
115. Добавлен механизм аутентификации, любая страница открывается только аутентифицированному пользователю
     Версия 0.7.0 2021.08.24
116. Отображение праздников в календаре
117. Значок кнопок создания смены и подразделения изменен на ПЛЮС, изменен хинт кнопок
118. Устранено: нет списка смен, когда подразделением подгружается их хранилища, а не выбирается руками
119. Добавлена возможность вводить комментарий в сводке. В поле note, если HR, reason - если продавец
120. В сводке виден значок "колокольчик", если есть комментарий менеджера. При нажатии, сообщение менеджера всплывает как тост
     Версия 0.6.1 2021.08.23
121. Исправлены ошибки при сохранении сотрудника
122. Исправлены ошибки, не позволяющие создать расписание на отдельные дни
123. Календари открываются на том месяце, на котором открывались в последний раз в текущей сессии
124. Из меню удалены не используемые пункты "Настройки приложения" и "Настройки пользователя"
     Версия 0.6 2021.08.22
125. Сохраняется новое расписание на месяц
126. Избавились от i18, настройки локали календаря перенесли в настройки приложения
127. Универсальная обработка ошибки обращения к серверу добавлена в AppSettings
128. Выбранный месяц отображается в поле выбора в сводке
129. В карточку сотрудника добавлен чек-бокс "работает"
130. В карточе сотрудника вычисляется признак того, что данные были изменены
131. Исправлена ошибка - конец работы в воскресенье в планировании
132. Изменена работа кнопок в редактировании смен
133. В функции отображения ошибок при передаче данных в сервисе расписаний добавлен необязательный параметр sticky с значением по умолчанию
134. Реализована функциональность - изменение и удаление расписания на отдельный день
     Версия 0.5.2.1 16.08.2021
     Подправлена работа фильтра в планировании отпусков
     Версия 0.5.2 15.08.2021
135. Корректно отображается планирование отпусков и больничных (выборка и заголовок)
136. Подправлены цвета фона в сводке
     Версия 0.5.1 11.08.2021
137. Создание расписания на будущий период: валидация введенных данных, возможность ввода интервала дат как кнопкой, так и выбором в календаре, отправка запроса на создание расписания на сервер
138. Скорректирован ввод сведений о подразделении - расстояние и размео полей ввода
139. При выборе смены в окне создания расписания, раскладка часов по дням недели и примечание отображается на экране
140. Исправлены отступы в карточке сотрудников
141. Исправлена ошибка в карточке сотрудников: не показывались списки должностей и подразделений
142. ЗАГЛУШКА! ПОлучается пользователь с правами (по заглушке), но отображение форм в соответствии с полномочиями
143. В планировании отпусков для продавца по умолчанию назначается выбранным его подразделение, а в списке сотрудникво можно выбрать одного из сотрудников того же магазина. Для менеджера - можно выбрать подразделение, а сотрудников - из списка продавцов этого же магазина
144. На страницу календарей добавлены заголовки
     Версия 0.5 09.08.2021
145. Миграция на версию 6.0.0 Primereact и Fullcalendar/react
146. Добавлено представление-календарь для планирования отпусков
147. Изменена форма для ввода сведений об отпуске
148. Добавлен мок для получение списка праздников в AppSets
149. Учтены мелкие предупреждения в разных компонентах
150. Начата разработка экрана планирования графика по магазину

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
