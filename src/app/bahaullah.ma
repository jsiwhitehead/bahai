[
  'stack': 60,
  [
    'size': 40,
    'bold': 'true',
    'underline': 'true',
    'align': 'center',
    'Bahá’u’lláh',
  ],
  [
    'grid': ['30px', 2, 3],
    'style': ['column-gap': '25px', 'row-gap': '25px'],
    ...findDocuments('Bahá’u’lláh')->flatMap.[(doc, i): {
      ? doc.'path'.1 = 'Additional' & doc.'title' : [
        [
          '{i}.',
        ],
        [
          'color': colors.'link'.(doc.'author'),
          'underline': hover,
          'link': ['doc', doc.'id'],
          'style': ['grid-column': '2 / 4'],
          doc.'title',
        ],
      ],
      : [
        [
          '{i}.',
        ],
        [
          'color': colors.'link'.(doc.'author'),
          'underline': hover,
          'link': ['doc', doc.'id'],
          {
            ? doc.'translated' : ['stack': 17 / 2, [doc.'title'], ['({doc.'translated'})']],
            ? doc.'title' : doc.'title',
            : '#{doc.'item'}',
          },
        ],
        [
          'stack': 17 / 2,
          ...doc.'path'->map.[p: [p]],
        ],
      ]
    }]
  ],
]