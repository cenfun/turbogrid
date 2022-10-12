const create = function() {
    return {
        'options': {
            'sortField': 'name'
        },
        'columns': [{
            'id': 'name',
            'name': 'Name',
            'type': 'tree'
        }, {
            'id': 'value',
            'name': 'Value',
            'type': 'string'
        }, {
            'id': 'subs',
            'name': 'Subs',
            'subs': [{
                'id': 'number',
                'name': 'Number',
                'type': 'number'
            }, {
                'id': 'icon',
                'name': 'Icon',
                'type': 'icon'
            }, {
                'id': 'date',
                'name': 'Date',
                'type': 'date'
            }]
        }, {
            'id': 'c1',
            'name': 'c1',
            'type': 'string'
        }, {
            'id': 'c2',
            'name': 'c2',
            'type': 'string'
        }, {
            'id': 'c3',
            'name': 'c3',
            'type': 'blank'
        }, {
            'id': 'c4',
            'name': 'c4',
            'type': 'string'
        }, {
            'id': 'c5',
            'name': 'c5',
            'type': 'string'
        }],
        'rows': [{
            'id': 'row1',
            'name': 'Name1',
            'value': 'Value1',
            'number': '1',
            'icon': '9',
            'date': '2017-05-20',
            'subs': [{
                'id': 'row11',
                'name': 'Name11',
                'value': 'Value11',
                'number': '1'
            }, {
                'id': 'row12',
                'name': 'Name12',
                'value': 'Value12',
                'number': '2'
            }]
        }, {
            'id': 'row2',
            'name': 'Name2',
            'value': 'Value2',
            'type': 'frozen',
            'number': '2',
            'date': '2017-05-21'
        }, {
            'id': 'row3',
            'name': 'Name3',
            'value': 'Value3',
            'number': '3',
            'date': '2017-05-22'
        }, {
            'id': 'row21',
            'name': 'Name2 value same',
            'value': 'Value2',
            'number': 2,
            'date': '2017-05-21'
        }, {
            'id': 'row22',
            'name': 'Name2 value uppercase/lowercase',
            'value': 'value2',
            'number': 2,
            'date': '2017-05-21'
        }, {
            'id': 'row23',
            'name': 'Name2 value diff type',
            'value': 0,
            'number': 2,
            'date': 'NaN'
        }, {
            'id': 'group',
            'name': 'Group',
            'type': 'group'
        }, {
            'id': 'blank',
            'formatter': 'blank'
        }, {
            'name': '(sortFixed: true)',
            'sortFixed': true
        }, {
            'name': '(sortFixed: top)',
            'sortFixed': 'top'
        }]
    };
};

export default {
    create: create
};
