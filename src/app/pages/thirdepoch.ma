{
  'ids': [
    'the-universal-house-of-justice-messages-171',
    'the-universal-house-of-justice-messages-120',
    'the-universal-house-of-justice-messages-075',
    'the-universal-house-of-justice-messages-035',
    'the-universal-house-of-justice-messages-022',
    'the-universal-house-of-justice-messages-020',
    'the-universal-house-of-justice-messages-019',
    'the-universal-house-of-justice-messages-016',
    'the-universal-house-of-justice-messages-015',
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
        '(Third Epoch)',
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
      grid(findDocuments('Third Epoch', ids), 'true'),
    ]
  ]
}