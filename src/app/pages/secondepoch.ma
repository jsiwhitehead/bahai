{
  'ids': [
    'shoghi-effendi-citadel-faith-005',
    'shoghi-effendi-decisive-hour-158',
    'shoghi-effendi-citadel-faith-067',
    'shoghi-effendi-citadel-faith-070',
    'shoghi-effendi-citadel-faith-063',
    'shoghi-effendi-citadel-faith-073',
  ],
  : [
    'stack': 60,
    [
      'stack': 15,
      [
        'size': 34,
        'bold': 'true',
        'underline': 'true',
        'align': 'center',
        'Writings of Shoghi Effendi',
      ],
      [
        'size': 24,
        'bold': 'true',
        'align': 'center',
        '(Second Epoch)',
      ]
    ],
    [
      'stack': 15,
      [
        'size': 24,
        'bold': 'true',
        'underline': 'true',
        'align': 'center',
        'Some Longer Writings',
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
        'Other Writings',
      ],
      grid(findDocuments('Second Epoch', ids)),
    ]
  ]
}