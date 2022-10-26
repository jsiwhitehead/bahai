{
  'ids': [
    'shoghi-effendi-god-passes-by-002',
    'shoghi-effendi-promised-day-come-001',
    'shoghi-effendi-advent-divine-justice-001',
    'shoghi-effendi-world-order-bahaullah-011',
    'shoghi-effendi-world-order-bahaullah-010',
    'shoghi-effendi-world-order-bahaullah-009',
    'shoghi-effendi-world-order-bahaullah-008',
    'shoghi-effendi-world-order-bahaullah-007',
    'shoghi-effendi-world-order-bahaullah-006',
    'shoghi-effendi-world-order-bahaullah-005',
    'shoghi-effendi-world-order-bahaullah-004',
    'shoghi-effendi-world-order-bahaullah-003',
    'shoghi-effendi-world-order-bahaullah-002',
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
        'Writings of Shoghi Effendi',
      ],
      [
        'size': 24,
        'bold': 'true',
        'align': 'center',
        '(First Epoch)',
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
      grid(findDocuments('First Epoch', ids)),
    ]
  ]
}