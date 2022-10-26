[docs:
  [
    'grid': ['60px', 2, 3, '110px'],
    [
      'pad': [15, 15, 15, 0],
      'bold': 'true',
      '#'
    ],
    [
      'pad': [15, 15, 15, 0],
      'bold': 'true',
      'align': 'center',
      'style': ['grid-column': '2 / 4'],
      'Document & Source'
    ],
    [
      'pad': 15,
      'bold': 'true',
      'Length'
    ],
    ...docs->flatMap.[(doc, i): {
      ? doc.'path'.1 = 'Additional' & doc.'title' : {
        'hover':~ '',
        : [
          [
            'fill': (i % 2 = 1) & '#f6f6f6',
            'pad': [15, 15, 15, 0],
            'color': colors.'link'.(doc.'author'),
            'hover': hover,
            'link': ['doc', doc.'id'],
            'round': ['left': 10],
            '{i}.',
          ],
          [
            'fill': (i % 2 = 1) & '#f6f6f6',
            'pad': [15, 15, 15, 0],
            'color': colors.'link'.(doc.'author'),
            'hover': hover,
            'underline': hover,
            'link': ['doc', doc.'id'],
            'style': ['grid-column': '2 / 4'],
            doc.'title',
          ],
          [
            'fill': (i % 2 = 1) & '#f6f6f6',
            'pad': 15,
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
            'pad': [15, 15, 15, 0],
            'color': colors.'link'.(doc.'author'),
            'hover': hover,
            'link': ['doc', doc.'id'],
            'round': ['left': 10],
            '{i}.',
          ],
          [
            'fill': (i % 2 = 1) & '#f6f6f6',
            'pad': [15, 15, 15, 0],
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
            'pad': [15, 15, 15, 0],
            'color': colors.'link'.(doc.'author'),
            'hover': hover,
            'underline': hover,
            'link': ['doc', doc.'id'],
            'stack': 17 / 2,
            ...doc.'path'->map.[p: [p]],
          ],
          [
            'fill': (i % 2 = 1) & '#f6f6f6',
            'pad': 15,
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