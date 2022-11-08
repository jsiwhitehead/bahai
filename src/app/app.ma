{
  'author':~ 'Bahá’í Era',
  'docId':~ '',
  'search':~ '',
  'view':~ 'Documents',
  'sort':~ 'Relevance',
  : [
    'size': 17,
    'font': 'Atkinson Hyperlegible',
    'color': '#333',
    'pad': 50,
    'style': ['height': '100%'],
    'stack': 60,
    [
      'stack': 30,
      authorSelect(author),
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
            'Cited',
            'Most Cited',
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
      ],
    ],
    {
      ? view = 'Documents': docGrid(author, search),
      : [
        'stack': { ? sort = 'Document': 25, : 60 },
        'align': 'justify-left',
        'style': ['max-width': '620px', 'margin': '0 auto'],
        ...runSearch(author, docId, search, view, sort)->map.[p:
          [
            'stack': 15,
            renderPara(p, [
              'highlight': '',
              'minQuote': {
                ? view = 'Cited': 1,
                ? view = 'Most Cited': p.'maxQuote' * 0.75,
                : 0,
              },
            ]),
            sort ! 'Document' & [
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
      ],
    },
  ],
}