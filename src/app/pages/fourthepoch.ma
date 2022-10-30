{
  'ids': [
    'the-universal-house-of-justice-the-institution-of-the-counsellors-001',
    'the-universal-house-of-justice-turning-point-004',
    'the-universal-house-of-justice-messages-221',
    'the-universal-house-of-justice-messages-274',
    'the-universal-house-of-justice-turning-point-003',
    'the-universal-house-of-justice-messages-202',
    'the-universal-house-of-justice-messages-145',
    'the-universal-house-of-justice-messages-213',
    'the-universal-house-of-justice-messages-247',
    'the-universal-house-of-justice-messages-135',
    'official-statements-commentaries-century-light-002',
    'official-statements-commentaries-bahaullah-001',
    'official-statements-commentaries-turning-point-all-nations-001',
    'official-statements-commentaries-prosperity-humankind-001',
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