window.sampleData = {
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
                'name': 'Level 2-1-3'
            }]
        }, {
            'name': 'Level 2-2',
            'subs': [{
                'name': 'Level 2-2-3'
            }]
        }, {
            'name': 'Level 2-3',
            'subs': [{
                'name': 'level_2-3-3'
            }]
        }]
    }, {
        'id': 'end_group',
        'name': 'End Group long text, long group name',
        'subs': [{
            'id': 'end_sub_1',
            'name': 'End sub 1'
        }, {
            'id': 'end_sub_2',
            'name': 'End sub 2'
        }]
    }, {
        name: 'Next column is null'
    }, null, {
        name: 'Next column no name'
    }, {
        name: ''
    }, {
        'id': 'last_column_1',
        'name': 'Last column 1',
        'width': 100
    }, {
        'id': 'last_column_2',
        'name': 'Last column 2'
    }],
    'rows': [{
        'id': 'total',
        'name': 'Total',
        'c1': '0.098213',
        'c2': '0.720773',
        'c3': '-1.942505',
        'c4': '2.663278',
        'c5': '3.662203'
    }, {
        'id': 'top',
        'name': 'Top',
        'c1': '0.098311',
        'c3': '0.000000',
        'c4': '0.098311',
        'c5': '0.101164',
        'c6': '2010-11-1'
    }, {
        'id': 'group',
        'name': 'empty subs: []',
        'c4': '31.5911',
        'c6': '2013-5-6',
        'subs': []
    }, {
        'name': '(collapsed: true)',
        'c4': '31.59',
        'c6': '2013-5-1',
        'collapsed': true,
        'subs': [{
            'name': 'Collapsed Sub Name 1'
        }, {
            'name': 'Collapsed Sub Name 2'
        }]
    }, {
        'id': 'no_name',
        'name': '',
        'c1': 'No Name'
    }, {
        'id': 'no_name_group',
        'name': '',
        'c1': 'No Group Name',
        'subs': [{
            'id': 'no_name_sub',
            'name': '',
            'c1': 'No Sub Name'
        }]
    }, {
        'id': 'level_0',
        'name': 'Level 0',
        'c1': '0.098311',
        'c3': '0.000000',
        'c4': '0.098311',
        'c5': '0.101164',
        'c6': '2010-12-1',
        'subs': [{
            'id': 'level_1_1',
            'name': 'Level 1 - 1',
            'c1': '0.098311',
            'c3': '0.000000',
            'c4': '0.098311',
            'c5': '0.300379',
            'c6': '2011-01-01'
        }, {
            'id': 'level_1_2',
            'name': 'Level 1 - 2',
            'c1': '0.098311',
            'c3': '0.000000',
            'c4': '0.098311',
            'c5': '0.300379',
            'c6': '2011-02-01'
        }, {
            'id': 'level_1_3',
            'name': 'Level 1 - 3',
            'c1': '0.098311',
            'c3': '0.000000',
            'c4': '0.098311',
            'c5': '0.300379',
            'subs': [{
                'id': 'level_2_1',
                'name': 'Level 2 - 1',
                'c1': '0.098311',
                'c3': '0.000000',
                'c4': '0.098311',
                'c5': '0.300379',
                'c6': '2011-02-01'
            }, {
                'id': 'level_2_2',
                'name': 'Level 2 - 2',
                'c1': '0.098311',
                'c3': '0.000000',
                'c4': '0.098311',
                'c5': '0.300379',
                'c6': '2011-02-01'
            }, {
                'id': 'level_2_3',
                'name': 'Level 2 - 3',
                'c1': '0.098311',
                'c3': '0.000000',
                'c4': '0.098311',
                'c5': '0.300379',
                'subs': [{
                    'id': 'level_3_1',
                    'name': 'Level 3 - 1',
                    'c1': '0.098311',
                    'c3': '0.000000',
                    'c4': '0.098311',
                    'c5': '0.300379',
                    'c6': '2011-02-01'
                }, {
                    'id': 'level_3_2',
                    'name': 'Level 3 - 2',
                    'c1': '0.098311',
                    'c3': '0.000000',
                    'c4': '0.098311',
                    'c5': '0.300379',
                    'c6': '2011-02-01'
                }, {
                    'id': 'level_3_3',
                    'name': 'Level 3 - 3',
                    'c1': '0.098311',
                    'c3': '0.000000',
                    'c4': '0.098311',
                    'c5': '0.300379'
                }, {
                    'id': 'level_3_4',
                    'name': 'Level 3 - 4'
                }]
            }]
        }]
    }, {
        'name': 'Next Row is null'
    }, null, {
        'name': '(selectable: false)',
        'selectable': false
    }, {
        'name': 'group (selectable: true)',
        'selectable': true,
        'subs': [{
            'name': '(selectable: false)',
            'selectable': false
        }]
    }, {
        'name': 'Next Two Rows are blank'
    }, {
        'name': 'BlankRow',
        'sortFixed': true,
        'formatter': 'blank'
    }, {
        'name': 'BlankRow',
        'sortFixed': true,
        'formatter': 'blank'
    }, {
        'sortFixed': true,
        'name': '(sortFixed: true)'
    }, {
        'sortFixed': 'top',
        'name': '(sortFixed: top)'
    }, {
        'id': 'last_row',
        'name': 'Last Row'
    }]
};
