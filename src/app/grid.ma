[(docs, summaries):
  [
    'size': 15,
    'grid': ['50px', 2, 3, '90px'],
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
      {
        ? summaries: 'Message & Summary',
        : 'Document & Source',
      }
    ],
    [
      'pad': 10,
      'bold': 'true',
      'Length'
    ],
    ...docs->flatMap.[(doc, i): {
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
            doc.'summary' & ['({doc.'summary'})'],
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
  ]
]