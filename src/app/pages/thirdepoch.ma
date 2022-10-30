{
  'ids': [
    'the-universal-house-of-justice-messages-313',
    'the-universal-house-of-justice-messages-409',
    'the-universal-house-of-justice-messages-468',
    'the-universal-house-of-justice-messages-465',
    'the-universal-house-of-justice-messages-462',
    'the-universal-house-of-justice-messages-364',
    'the-universal-house-of-justice-messages-464',
    'the-universal-house-of-justice-messages-449',
    'the-universal-house-of-justice-messages-469',
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