{
  'author':~ 'Bahá’í Era',
  'view':~ 'Documents',
  'docId':~ '',
  'search':~ '',
  'docInfo': docId & documentById(docId),
  'minQuote': {
    ? view = 'Cited': 1,
    ? view = 'Most Cited': docInfo.'maxQuote' * 0.5,
    : 0,
  },
  'view':: { ? docId: 'All', : 'Documents' },
  : [
    'size': 17,
    'font': 'Atkinson Hyperlegible',
    'color': '#333',
    'pad': 50,
    'style': ['height': '100%'],
    'stack': 60,
    [
      'stack': 30,
      !docId & authorSelect(author),
      [
        'grid': ['100px', 1],
        'style': ['align-items': 'center', 'column-gap': '20px', 'row-gap': '20px'],
        ['bold': 'true', 'View:'],
        [
          'input': 'select',
          'fill': '#eee',
          'round': 50,
          'align': 'center',
          'pad': [5, 10],
          'options': {
            ? docId: [
              'All',
              'Cited',
              'Most Cited',
            ],
            : [
              'Documents',
              'Paragraphs',
            ],
          },
          'value': view,
        ],
        ['bold': 'true', 'Search:'],
        [
          'input': 'text',
          'fill': '#eee',
          'round': 50,
          'align': 'center',
          'pad': [5, 10],
          'value': search,
        ],
      ],
    ],
    {
      ? !docId & view = 'Documents': docGrid(author, search, docId),
      : [
        'align': 'justify-left',
        'style': ['max-width': '620px', 'margin': '0 auto'],
        'stack': 60,
        docId & [
          'bold': 'true',
          'align': 'center',
          'stack': 25,
          [
            'color': 'blue',
            'underline': hover,
            'cursor': 'pointer',
            'docId':: click & '',
            '« Back',
          ],
          [
            'size': 34,
            'underline': 'true',
            'stack': 15,
            ...{
              ? docInfo.'title': [[docInfo.'title']],
              : [[docInfo.'path'.1], ['#{docInfo.'item'}']],
            }
          ]
        ],
        [
          'stack': { ? docId: 25, : 60 },
          ...runSearch(author, docId, search, minQuote)->map.[p:
            [
              'stack': 15,
              renderPara(p, [
                'index': docId & p.'paragraph'.'index',
                'highlight': '',
                'minQuote': minQuote,
              ]),
              !docId & [
                'size': 16,
                'italic': 'true',
                'align': 'right',
                'color': colors.'link'.(p.'author'),
                'width': 0.75,
                'style': ['margin': '0 0 0 auto'],
                p.'refPath'->join(', ')
              ]
            ]
          ]
        ]
      ],
    },
  ],
}