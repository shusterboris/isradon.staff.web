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

