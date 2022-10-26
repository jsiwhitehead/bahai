{
  'ids': [
    'a',
  ],
  : [
    'stack': 40,
    [
      'size': 34,
      'bold': 'true',
      'underline': 'true',
      'align': 'center',
      'Other Documents',
    ],
    [
      'stack': 15,
      [
        'size': 24,
        'bold': 'true',
        'underline': 'true',
        'align': 'center',
        'Some Longer Documents',
      ],
      grid(documentsByIds(ids)),
    ],
    [
      'stack': 15,
      [
        'size': 24,
        'bold': 'true',
        'underline': 'true',
        'align': 'center',
        'Other Documents',
      ],
      grid(findDocuments('Other', ids)),
    ]
  ]
}