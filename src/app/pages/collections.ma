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
      ],

      [
        'fill': '#f6f6f6',
        'pad': [10, 10, 10, 0],
        'bold': 'true',
        'round': ['left': 10],
        documents.'ruhi11-001'.'path'.1,
      ],
      [
        'fill': '#f6f6f6',
        'pad': [10, 10, 10, 0],
        'color': colors.'link'.'The Ruhi Institute',
        'underline': hover,
        'link': ['doc', 'ruhi11-001'],
        documents.'ruhi11-001'.'title',
      ],
      ['fill': '#f6f6f6'],
      ['fill': '#f6f6f6', 'round': ['right': 10]],

      [
        'pad': [10, 10, 10, 0],
        'bold': 'true',
        'round': ['left': 10],
        documents.'ruhi12-001'.'path'.1,
      ],
      [
        'pad': [10, 10, 10, 0],
        'color': colors.'link'.'The Ruhi Institute',
        'underline': hover,
        'link': ['doc', 'ruhi12-001'],
        documents.'ruhi12-001'.'title',
      ],
      [],
      ['round': ['right': 10]],

      [
        'fill': '#f6f6f6',
        'pad': [10, 10, 10, 0],
        'bold': 'true',
        'round': ['left': 10],
        documents.'ruhi13-001'.'path'.1,
      ],
      [
        'fill': '#f6f6f6',
        'pad': [10, 10, 10, 0],
        'color': colors.'link'.'The Ruhi Institute',
        'underline': hover,
        'link': ['doc', 'ruhi13-001'],
        documents.'ruhi13-001'.'title',
      ],
      [
        'fill': '#f6f6f6',
        'pad': [10, 10, 10, 0],
        'color': colors.'link'.'The Ruhi Institute',
        'underline': hover,
        'link': ['doc', 'ruhi13-002'],
        documents.'ruhi13-002'.'title',
      ],
      ['fill': '#f6f6f6', 'round': ['right': 10]],

      [
        'pad': [10, 10, 10, 0],
        'bold': 'true',
        'round': ['left': 10],
        documents.'ruhi14-001'.'path'.1,
      ],
      [
        'pad': [10, 10, 10, 0],
        'color': colors.'link'.'The Ruhi Institute',
        'underline': hover,
        'link': ['doc', 'ruhi14-001'],
        documents.'ruhi14-001'.'title',
      ],
      [],
      ['round': ['right': 10]],
    ]
  ],
  [
    'stack': 15,
    [
      'size': 24,
      'bold': 'true',
      'underline': 'true',
      'align': 'center',
      'Junior Youth Texts',
    ],
    [
      'size': 15,
      'grid': [1],
      ...(1..9)->map.[i:
        [
          'fill': (i % 2 = 1) & '#f6f6f6',
          'pad': 10,
          'round': 10,
          'color': colors.'link'.'The Ruhi Institute',
          'underline': hover,
          'link': ['doc', 'ruhi-junior-youth-texts-00{i}'],
          documents.'ruhi-junior-youth-texts-00{i}'.'title',
        ],
      ],
      ...(10..12)->map.[i:
        [
          'fill': (i % 2 = 0) & '#f6f6f6',
          'pad': 10,
          'round': 10,
          'color': colors.'link'.'The Ruhi Institute',
          'underline': hover,
          'link': ['doc', 'ruhi-junior-youth-texts-0{i}'],
          documents.'ruhi-junior-youth-texts-0{i}'.'title',
        ],
      ],
    ]
  ]
]