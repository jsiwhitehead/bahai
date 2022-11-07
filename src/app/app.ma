{
  'author':~ 'Bahá’í Era',
  'search':~ '',
  'view':~ 'Paragraphs',
  'sort':~ 'Relevance',
  'authorGroup': [(auth, column, row, nested): {
    : [
      'fill': {
        ? hover : 'lightgreen',
        ? auth = author : 'lightgreen',
        ? nested->includes(author) : 'lightblue',
        : '#ddd',
      },
      'bold': 'true',
      'pad': { ? row ! 'auto': [20, 5], : 5 },
      'cursor': 'pointer',
      'author':: click & auth,
      'style': ['grid-column': column, 'grid-row': row],
      auth,
    ],
  }],
  : [
    'size': 17,
    'font': 'Atkinson Hyperlegible',
    'color': '#333',
    'pad': 50,
    'style': ['height': '100%'],
    'stack': 60,
    [
      'stack': 30,
      [
        'size': 15,
        'align': 'center',
        'grid': [1, 1, 1, 1, 1, 1, 1, 1, 1],
        'style': ['align-items': 'center', 'column-gap': '5px', 'row-gap': '5px'],
        authorGroup('Bahá’í Era', '1 / 10', 'auto', []),
        authorGroup('Heroic Age', '1 / 4', 'auto', ['Bahá’í Era']),
        authorGroup('Formative Age', '4 / 10', 'auto', ['Bahá’í Era']),
        authorGroup('Word of God', '1 / 3', 'auto', ['Bahá’í Era', 'Heroic Age']),
        authorGroup('‘Abdu’l‑Bahá', '3 / 4', '3 / 5', ['Bahá’í Era', 'Heroic Age']),
        authorGroup('Shoghi Effendi', '4 / 6', 'auto', ['Bahá’í Era', 'Formative Age']),
        authorGroup('The Universal House of Justice', '6 / 10', 'auto', ['Bahá’í Era', 'Formative Age']),
        authorGroup('The Báb', 'auto', 'auto', ['Bahá’í Era', 'Heroic Age', 'Word of God']),
        authorGroup('Bahá’u’lláh', 'auto', 'auto', ['Bahá’í Era', 'Heroic Age', 'Word of God']),
        authorGroup('First Epoch', 'auto', 'auto', ['Bahá’í Era', 'Formative Age', 'Shoghi Effendi']),
        authorGroup('Second Epoch', 'auto', 'auto', ['Bahá’í Era', 'Formative Age', 'Shoghi Effendi']),
        authorGroup('Third Epoch', 'auto', 'auto', ['Bahá’í Era', 'Formative Age', 'The Universal House of Justice']),
        authorGroup('Fourth Epoch', 'auto', 'auto', ['Bahá’í Era', 'Formative Age', 'The Universal House of Justice']),
        authorGroup('Fifth Epoch', 'auto', 'auto', ['Bahá’í Era', 'Formative Age', 'The Universal House of Justice']),
        authorGroup('Sixth Epoch', 'auto', 'auto', ['Bahá’í Era', 'Formative Age', 'The Universal House of Justice']),
      ],
      [
        'grid': ['100px', 1],
        'style': ['align-items': 'center', 'column-gap': '20px', 'row-gap': '20px'],
        ['bold': 'true', 'Search:'],
        [
          'input': 'text',
          'fill': '#eee',
          'round': 50,
          'align': 'center',
          'pad': [5, 10],
          'value': search,
        ],
        ['bold': 'true', 'View:'],
        [
          'input': 'select',
          'fill': '#eee',
          'round': 50,
          'align': 'center',
          'pad': [5, 10],
          'options': [
            'Paragraphs',
            'Cited',
            'Most Cited',
            'Documents',
          ],
          'value': view,
        ],
        ['bold': 'true', 'Sort:'],
        [
          'input': 'select',
          'fill': '#eee',
          'round': 50,
          'align': 'center',
          'pad': [5, 10],
          'options': [
            'Relevance',
            'Date',
            'Length',
            'Document',
          ],
          'value': sort,
        ],
      ],
    ],
    {
      ? view = 'Documents': [
        'size': 15,
        'grid': ['50px', 1, 1, '90px'],
        [
          'pad': [10, 10, 10, 0],
          'bold': 'true',
          '#'
        ],
        [
          'pad': [10, 10, 10, 0],
          'bold': 'true',
          'align': 'center',
          'style': ['grid-column': '2 / 4'],
          'Document',
        ],
        [
          'pad': 10,
          'bold': 'true',
          'Length'
        ],
        ...runSearch(author, search, view, sort)->flatMap.[(doc, i): {
          ? (doc.'path'.1 = 'Additional' & doc.'title')
            | doc.'summary'
            | doc.'path'.1 = 'Selected Messages of the Universal House of Justice': {
            'hover':~ '',
            : [
              [
                'fill': (i % 2 = 1) & '#f6f6f6',
                'pad': [10, 10, 10, 0],
                'color': colors.'link'.(doc.'author'),
                'hover': hover,
                'link': ['doc', doc.'id'],
                'round': ['left': 10],
                '{i}.',
              ],
              [
                'fill': (i % 2 = 1) & '#f6f6f6',
                'pad': [10, 10, 10, 0],
                'color': colors.'link'.(doc.'author'),
                'hover': hover,
                'underline': hover,
                'link': ['doc', doc.'id'],
                'style': ['grid-column': '2 / 4'],
                'stack': 17 / 2,
                [doc.'title'],
                doc.'summary' & ['{doc.'summary'}'],
              ],
              [
                'fill': (i % 2 = 1) & '#f6f6f6',
                'pad': 10,
                'color': colors.'link'.(doc.'author'),
                'hover': hover,
                'link': ['doc', doc.'id'],
                'round': ['right': 10],
                doc.'time',
              ],
            ]
          },
          : {
            'hover':~ '',
            : [
              [
                'fill': (i % 2 = 1) & '#f6f6f6',
                'pad': [10, 10, 10, 0],
                'color': colors.'link'.(doc.'author'),
                'hover': hover,
                'link': ['doc', doc.'id'],
                'round': ['left': 10],
                '{i}.',
              ],
              [
                'fill': (i % 2 = 1) & '#f6f6f6',
                'pad': [10, 10, 10, 0],
                'color': colors.'link'.(doc.'author'),
                'hover': hover,
                'underline': hover,
                'link': ['doc', doc.'id'],
                {
                  ? doc.'translated' : ['stack': 17 / 2, [doc.'title'], ['({doc.'translated'})']],
                  ? doc.'title' : doc.'title',
                  : '#{doc.'item'}',
                },
              ],
              [
                'fill': (i % 2 = 1) & '#f6f6f6',
                'pad': [10, 10, 10, 0],
                'color': colors.'link'.(doc.'author'),
                'hover': hover,
                'underline': hover,
                'link': ['doc', doc.'id'],
                'stack': 17 / 2,
                ...doc.'path'->map.[p: [p]],
              ],
              [
                'fill': (i % 2 = 1) & '#f6f6f6',
                'pad': 10,
                'color': colors.'link'.(doc.'author'),
                'hover': hover,
                'link': ['doc', doc.'id'],
                'round': ['right': 10],
                doc.'time',
              ],
            ]
          }
        }]
      ],
      : [
        'stack': { ? sort = 'Document': 25, : 60 },
        'align': 'justify-left',
        'style': ['max-width': '620px', 'margin': '0 auto'],
        ...runSearch(author, search, view, sort)->map.[p:
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