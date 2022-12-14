{
  'author':~ 'Bahá’í Era',
  'view':~ 'Documents',
  'docId':~ '',
  'search':~ '',
  'show':~ 'All',
  'page':~ 1,
  'docInfo': docId & documentById(docId),
  'search':: docId & '',
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
          'options': [
            'Documents',
            'Paragraphs',
          ],
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
        (docId | view = 'Paragraphs') & ['bold': 'true', 'Show:'],
        (docId | view = 'Paragraphs') & [
          'input': 'select',
          'fill': '#eee',
          'round': 50,
          'align': 'center',
          'pad': [5, 10],
          'options': [
            'All',
            'Cited',
            'Most Cited',
          ],
          'value': show,
        ],
        (view = 'Paragraphs') & ['bold': 'true', 'Page:'],
        (view = 'Paragraphs') & [
          'input': 'select',
          'fill': '#eee',
          'round': 50,
          'align': 'center',
          'pad': [5, 10],
          'options': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          'value': page,
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
          ...runSearch(author, docId, search, show, page)->map.[p:
            [
              'stack': 15,
              renderPara(p, [
                'index': docId & p.'paragraph'.'index',
                'highlight': '',
                'partial': show ! 'All',
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