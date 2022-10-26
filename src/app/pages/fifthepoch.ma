{
  'ids': [
    'the-universal-house-of-justice-turning-point-001',
    'the-universal-house-of-justice-turning-point-005',
    'the-universal-house-of-justice-messages-046',
    'the-universal-house-of-justice-messages-078',
    'the-universal-house-of-justice-messages-065',
    'the-universal-house-of-justice-messages-008',
    'the-universal-house-of-justice-messages-080',
    'the-universal-house-of-justice-messages-117',
    'the-universal-house-of-justice-messages-015',
    'the-universal-house-of-justice-messages-062',
    'the-universal-house-of-justice-messages-071',
    'the-universal-house-of-justice-messages-125',
    'the-universal-house-of-justice-additional-messages-024',
    'official-statements-commentaries-one-common-faith-002',
    'world-centre-higher-functioning-001',
    'world-centre-frontiers-learning-001',
    'world-centre-20180503-001',
    'the-universal-house-of-justice-turning-point-006',
    'the-universal-house-of-justice-messages-121',
  ],
  : [
    'stack': 40,
    [
      'stack': 15,
      [
        'size': 34,
        'bold': 'true',
        'underline': 'true',
        'align': 'center',
        'Messages of the Universal House of Justice',
      ],
      [
        'size': 24,
        'bold': 'true',
        'align': 'center',
        '(Fifth Epoch)',
      ]
    ],
    [
      'stack': 15,
      [
        'size': 24,
        'bold': 'true',
        'underline': 'true',
        'align': 'center',
        'Some Longer Messages',
      ],
      grid(documentsByIds(ids), 'true'),
    ],
    [
      'stack': 15,
      [
        'size': 24,
        'bold': 'true',
        'underline': 'true',
        'align': 'center',
        'Other Messages',
      ],
      grid(findDocuments('Fifth Epoch', ids), 'true'),
    ]
  ]
}