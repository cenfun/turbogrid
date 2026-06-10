export const sampleData = {
    'columns': [{
        'name': 'Name',
        'title': 'This is header title Name!',
        'id': 'name'
    }, {
        'name': '(resizable: false)',
        'title': 'This is header title Ticker!',
        'id': 'c1',
        'resizable': false
    }, {
        'name': '(sortable: false)',
        'id': 'c2',
        'sortable': false,
        'width': 80
    }, {
        'name': 'Long text Long text (exportable: false)',
        'id': 'c3',
        'exportable': false
    }, {
        'name': 'Long group Long group Long group Long group',
        'subs': [{
            'name': 'Long sub Long sub',
            'id': 'c4'
        }, {
            'name': 'Number',
            'id': 'c5',
            'type': 'number'
        }, {
            'name': 'Date',
            'id': 'c6',
            'type': 'date',
            'width': 90
        }]
    }, {
        'name': 'Level 1',
        'subs': [{
            'name': 'Level 2-1',
            'subs': [{
                'name': 'Level 2-1-3',
                'id': 'c7'
            }]
        }]
    }, {
        'name': 'Number',
        'id': 'c8',
        'type': 'number'
    }, {
        'name': 'Date',
        'id': 'c9',
        'type': 'date'
    }, {
        'name': 'Options',
        'subs': [{
            'name': 'Type',
            'id': 'c10',
            'type': 'number'
        }, {
            'name': 'Status',
            'id': 'c11'
        }]
    }],
    'rows': [{
        'name': 'Name 1',
        'c1': 'Value 1',
        'c2': 'No',
        'c3': 'some text',
        'c4': 'sub value 1',
        'c5': 90,
        'c6': '2024-12-12',
        'c7': 'test',
        'c8': 1.234,
        'c9': '2024-12-13',
        'c10': 1,
        'c11': 'Active'
    }, {
        'name': 'Name 2',
        'c1': 'Value 2',
        'c2': 'No',
        'c3': 'some text some text',
        'c4': 'sub value 2',
        'c5': 100,
        'c6': '2023-12-12',
        'c7': 'test',
        'c8': 2.234,
        'c9': '2023-12-13',
        'c10': 2,
        'c11': 'Inactive'
    }, {
        'name': 'Name 3',
        'c1': 'Value 3',
        'c2': 'Yes',
        'c3': 'some text some text some text',
        'c4': 'sub value 3',
        'c5': 200,
        'c6': '2022-12-12',
        'c7': 'test',
        'c8': 3.234,
        'c9': '2022-12-13',
        'c10': 3,
        'c11': 'Active'
    }, {
        'name': 'Name 4',
        'c1': 'Value 4',
        'c2': 'Yes',
        'c3': 'some text',
        'c4': 'sub value 4',
        'c5': 300,
        'c6': '2021-12-12',
        'c7': 'test',
        'c8': 4.234,
        'c9': '2021-12-13',
        'c10': 4,
        'c11': 'Inactive'
    }, {
        'name': 'Name 5',
        'c1': 'Value 5',
        'c2': 'Yes',
        'c3': 'some text some text',
        'c4': 'sub value 5',
        'c5': 400,
        'c6': '2020-12-12',
        'c7': 'test',
        'c8': 5.234,
        'c9': '2020-12-13',
        'c10': 5,
        'c11': 'Active'
    }, {
        'name': 'Name 6',
        'c1': 'Value 6',
        'c2': 'No',
        'c3': 'some text',
        'c4': 'sub value 6',
        'c5': 500,
        'c6': '2019-12-12',
        'c7': 'test',
        'c8': 6.234,
        'c9': '2019-12-13',
        'c10': 6,
        'c11': 'Inactive'
    }, {
        'name': 'Name 7',
        'c1': 'Value 7',
        'c2': 'No',
        'c3': 'some text some text some text some text',
        'c4': 'sub value 7',
        'c5': 600,
        'c6': '2018-12-12',
        'c7': 'test',
        'c8': 7.234,
        'c9': '2018-12-13',
        'c10': 7,
        'c11': 'Active'
    }, {
        'name': 'Name 8',
        'c1': 'Value 8',
        'c2': 'Yes',
        'c3': 'some text',
        'c4': 'sub value 8',
        'c5': 700,
        'c6': '2017-12-12',
        'c7': 'test',
        'c8': 8.234,
        'c9': '2017-12-13',
        'c10': 8,
        'c11': 'Inactive'
    }, {
        'name': 'Name 9',
        'c1': 'Value 9',
        'c2': 'No',
        'c3': 'some text',
        'c4': 'sub value 9',
        'c5': 800,
        'c6': '2016-12-12',
        'c7': 'test',
        'c8': 9.234,
        'c9': '2016-12-13',
        'c10': 9,
        'c11': 'Active'
    }, {
        'name': 'Name 10',
        'c1': 'Value 10',
        'c2': 'Yes',
        'c3': 'some text some text some text',
        'c4': 'sub value 10',
        'c5': 900,
        'c6': '2015-12-12',
        'c7': 'test',
        'c8': 10.234,
        'c9': '2015-12-13',
        'c10': 10,
        'c11': 'Inactive'
    }, {
        'name': 'Total',
        'c1': 'Total Value',
        'type': 'total'
    }, {
        'name': 'Top',
        'type': 'top'
    }, {
        'name': 'Name 11',
        'c1': 'Value 11',
        'c2': 'Yes',
        'c8': 100.234,
        'c9': '2015-12-13'
    }, {
        'name': 'Name 12',
        'c1': 'Value 12',
        'c2': 'No',
        'c8': 200.234,
        'c9': '2015-12-13'
    }, {
        'name': 'Name 13',
        'c1': 'Value 13',
        'c8': 300.234
    }, {
        'name': 'Name 14',
        'c1': 'Value 14',
        'c8': 400.234
    }, {
        'name': 'Name 15',
        'c1': 'Value 15',
        'c8': 500.234
    }, {
        'name': 'Name 16',
        'c1': 'Value 16',
        'c8': 600.234
    }, {
        'name': 'Name 17',
        'c1': 'Value 17',
        'c8': 700.234
    }, {
        'name': 'Name 18',
        'c1': 'Value 18',
        'c8': 800.234
    }, {
        'name': 'Name 19',
        'c1': 'Value 19',
        'c8': 900.234
    }, {
        'name': 'Name 20',
        'c1': 'Value 20',
        'c8': 1000.234
    }]
};
