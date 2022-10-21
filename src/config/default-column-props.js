export default {

    // require for showing header
    name: '',

    // for getting row value
    // id: String

    // expect to be a string, for example: "string", "number", "date" etc.
    // type: String

    // formatter expect to be a function, but also can be a string like type
    // priority is higher than type
    // be used for cell formatting
    // formatter: [String, Function]
    // headerFormatter: [String, Function]

    // comparer function when sort function(a, b, options)
    // comparer: [String, Function]

    // left (default) | center | right
    // align: String

    // customize column style
    // classMap: [String, Array, Object]
    // styleMap: [String, Array, Object]
    // headerClassMap: [String, Array, Object]
    // headerStyleMap: [String, Array, Object]

    // sortable: true
    // resizable: true
    // exportable: true

    // private: false

    // require for column resize
    minWidth: 81,
    maxWidth: 300

    // width: Number
    // height: Number

    // subs: Array
};
