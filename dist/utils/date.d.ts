declare const _default: {
    getDateToString: (date?: Date, format?: string) => string;
    getTimeDifference: (date1?: Date, date2?: Date) => {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        differDays: number;
        differHours: number;
        differMinutes: number;
        differSeconds: number;
    };
    getDateTime: (date?: Date) => string;
    getDate: (date?: Date) => string;
    getTime: (date?: Date) => string;
    getTimestamp: (date?: Date) => number;
    getTimestamp10: (date?: Date) => string;
    getDateShuttle: (shuttle: object, dateOld?: Date) => Date;
};
export default _default;
