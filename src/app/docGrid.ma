[(author, search):
  {
    'sort':~ 'length-desc',
    : [
      'size': 15,
      'grid': ['50px', 1, 1, '90px', '120px', '100px'],
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
        'cursor': 'pointer',
        'underline': hover,
        {
          ? sort = 'cited-desc': 'Cited ▼',
          ? sort = 'cited-asc': 'Cited ▲',
          : 'Cited',
        },
        'sort':: click & {
          ? sort = 'cited-desc': 'cited-asc',
          ? sort = 'cited-asc': 'length-desc',
          : 'cited-desc',
        },
      ],
      [
        'pad': 10,
        'bold': 'true',
        'cursor': 'pointer',
        'underline': hover,
        {
          ? sort = 'year-desc': 'Year ▼',
          ? sort = 'year-asc': 'Year ▲',
          : 'Year',
        },
        'sort':: click & {
          ? sort = 'year-desc': 'year-asc',
          ? sort = 'year-asc': 'length-desc',
          : 'year-desc',
        },
      ],
      [
        'pad': 10,
        'bold': 'true',
        'cursor': 'pointer',
        'underline': hover,
        {
          ? sort = 'length-desc': 'Length ▼',
          ? sort = 'length-asc': 'Length ▲',
          : 'Length',
        },
        'sort':: click & {
          ? sort = 'length-desc': 'length-asc',
          ? sort = 'length-asc': 'length-desc',
          : 'length-desc',
        },
      ],
      ...getDocuments(author, search, sort)->flatMap.[(doc, i): {
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
              'underline': hover,
              'link': ['doc', doc.'id'],
              roundNum(doc.'score', 2),
            ],
            [
              'fill': (i % 2 = 1) & '#f6f6f6',
              'pad': 10,
              'color': colors.'link'.(doc.'author'),
              'hover': hover,
              'underline': hover,
              'link': ['doc', doc.'id'],
              {
                ? roundNum(doc.'years'.1, 0) = roundNum(doc.'years'.2, 0): roundNum(doc.'years'.1, 0),
                : '{roundNum(doc.'years'.1, 0)}-{roundNum(doc.'years'.2, 0)}',
              }
            ],
            [
              'fill': (i % 2 = 1) & '#f6f6f6',
              'pad': 10,
              'color': colors.'link'.(doc.'author'),
              'hover': hover,
              'underline': hover,
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
              'underline': hover,
              'link': ['doc', doc.'id'],
              roundNum(doc.'score', 2),
            ],
            [
              'fill': (i % 2 = 1) & '#f6f6f6',
              'pad': 10,
              'color': colors.'link'.(doc.'author'),
              'hover': hover,
              'underline': hover,
              'link': ['doc', doc.'id'],
              {
                ? roundNum(doc.'years'.1, 0) = roundNum(doc.'years'.2, 0): roundNum(doc.'years'.1, 0),
                : '{roundNum(doc.'years'.1, 0)}-{roundNum(doc.'years'.2, 0)}',
              }
            ],
            [
              'fill': (i % 2 = 1) & '#f6f6f6',
              'pad': 10,
              'color': colors.'link'.(doc.'author'),
              'hover': hover,
              'underline': hover,
              'link': ['doc', doc.'id'],
              'round': ['right': 10],
              doc.'time',
            ],
          ]
        }
      }]
    ]
  }
]