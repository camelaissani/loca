module.exports = {
    currentDate: function(month, year) {
        var day,
            now = new Date();

        if (!month || !year) {
            day = now.getDate();
            month = now.getMonth() + 1;
            year = now.getFullYear();
        } else {
            month = Number(month);
            year = Number(year);
            if (month <= 0 || month > 12 || year <= 0) {
                month = now.getMonth() + 1;
                year = now.getFullYear();
            }
        }

        return {
            day: day,
            month: month,
            year: year
        };
    }
};