{
  'ids': [
    'the-universal-house-of-justice-messages-476',
    'the-universal-house-of-justice-messages-469',
    'world-centre-20180503-001',
    'world-centre-higher-functioning-001',
    'the-universal-house-of-justice-messages-438',
    'the-universal-house-of-justice-messages-422',
    'world-centre-frontiers-learning-001',
    'the-universal-house-of-justice-messages-418',
    'the-universal-house-of-justice-messages-412',
    'the-universal-house-of-justice-messages-405',
    'the-universal-house-of-justice-messages-403',
    'the-universal-house-of-justice-messages-366',
    'the-universal-house-of-justice-turning-point-006',
    'official-statements-commentaries-one-common-faith-002',
    'the-universal-house-of-justice-messages-362',
    'the-universal-house-of-justice-turning-point-005',
    'the-universal-house-of-justice-messages-358',
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