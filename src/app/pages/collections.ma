[
  'stack': 40,
  [
    'size': 34,
    'bold': 'true',
    'underline': 'true',
    'align': 'center',
    'Collections',
  ],
  grid(findDocuments('Collections')),
  [
    'stack': 15,
    [
      'size': 24,
      'bold': 'true',
      'underline': 'true',
      'align': 'center',
      'Ruhi',
    ],
    [
      'size': 15,
      'grid': [1, 1, 1, 1],
      ...(1..10)->flatMap.[i:
        [
          [
            'fill': (i % 2 = 1) & '#f6f6f6',
            'pad': [10, 10, 10, 0],
            'bold': 'true',
            'round': ['left': 10],
            documents.'ruhi{i}-001'.'path'.1,
          ],
          [
            'fill': (i % 2 = 1) & '#f6f6f6',
            'pad': [10, 10, 10, 0],
            'color': colors.'link'.'The Ruhi Institute',
            'underline': hover,
            'link': ['doc', 'ruhi{i}-001'],
            documents.'ruhi{i}-001'.'title',
          ],
          [
            'fill': (i % 2 = 1) & '#f6f6f6',
            'pad': [10, 10, 10, 0],
            'color': colors.'link'.'The Ruhi Institute',
            'underline': hover,
            'link': ['doc', 'ruhi{i}-002'],
            documents.'ruhi{i}-002'.'title',
          ],
          [
            'fill': (i % 2 = 1) & '#f6f6f6',
            'pad': [10, 10, 10, 0],
            'color': colors.'link'.'The Ruhi Institute',
            'underline': hover,
            'round': ['right': 10],
            'link': ['doc', 'ruhi{i}-003'],
            documents.'ruhi{i}-003'.'title',
          ],
        ]
      ]
    ]
  ]
]