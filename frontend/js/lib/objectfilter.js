class ObjectFilter {

    static filter(schema, data) {
        var self = this;
        var filteredData = {};
        var key;
        var value;
        var childSchema;

        for (key in schema) {
            value = data[key];
            if (value !== undefined) {
                childSchema = schema[key];
                if (Array.isArray(childSchema)) {
                    if (Array.isArray(value)) {
                        filteredData[key] = [];
                        value.forEach(function(data/*, index*/) {
                            filteredData[key].push(self.filter(childSchema[0], data));
                        });
                    }
                }
                else {
                    filteredData[key] = value;
                }
            }
        }
        return filteredData;
    }

}
export default ObjectFilter;
