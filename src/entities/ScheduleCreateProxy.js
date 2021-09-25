export default class ScheduleCreateProxy{
    constructor(orgUnitId, chosenShiftId, chosenEmployeeId, selectedDates, selectedInterval, timeFrom, timeTo, onlyWork=true){
        this.orgUnitId = orgUnitId;
        this.chosenShiftId = chosenShiftId;
        this.chosenEmployeeId = chosenEmployeeId;
        this.selectedDates = selectedDates;
        this.selectedInterval = selectedInterval;
        this.timeFrom = timeFrom;
        this.timeTo = timeTo;
        this.onlyWork = onlyWork;
    }
}