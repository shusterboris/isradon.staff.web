export default class ScheduleCreateProxy{
    constructor(orgUnitId, chosenShiftId, chosenEmployeeId, selectedDates, selectedInterval){
        this.orgUnitId = orgUnitId;
        this.chosenShiftId = chosenShiftId;
        this.chosenEmployeeId = chosenEmployeeId;
        this.selectedDates = selectedDates;
        this.selectedInterval = selectedInterval;
    }
}