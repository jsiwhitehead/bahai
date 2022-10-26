{
  'ids': [
    'the-universal-house-of-justice-the-institution-of-the-counsellors-001',
    'the-universal-house-of-justice-turning-point-004',
    'the-universal-house-of-justice-messages-220',
    'the-universal-house-of-justice-messages-273',
    'the-universal-house-of-justice-turning-point-003',
    'the-universal-house-of-justice-messages-201',
    'the-universal-house-of-justice-messages-144',
    'the-universal-house-of-justice-messages-212',
    'the-universal-house-of-justice-messages-246',
    'the-universal-house-of-justice-messages-134',
    'official-statements-commentaries-century-light-002',
    'official-statements-commentaries-bahaullah-001',
    'official-statements-commentaries-turning-point-all-nations-001',
    'official-statements-commentaries-prosperity-humankind-001',
    'world-centre-entry-by-troops-001',
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
        '(Fourth Epoch)',
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
      grid(findDocuments('Fourth Epoch', ids), 'true'),
    ]
  ]
}