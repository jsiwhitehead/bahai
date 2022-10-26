{
  'ids': [
    'bahaullah-kitab-i-iqan-003',
    'bahaullah-epistle-son-wolf-001',
    'bahaullah-summons-lord-hosts-002',
    'bahaullah-kitab-i-aqdas-004',
    'bahaullah-gems-divine-mysteries-002',
    'bahaullah-summons-lord-hosts-006',
    'bahaullah-tablets-bahaullah-008',
    'bahaullah-call-divine-beloved-003',
    'bahaullah-tabernacle-unity-003',
    'bahaullah-tablets-bahaullah-006',
    'bahaullah-tablets-bahaullah-011',
    'bahaullah-hidden-words-002',
    'bahaullah-hidden-words-001',
    'bahaullah-tablets-bahaullah-007',
  ],
  : [
    'stack': 60,
    [
      'size': 34,
      'bold': 'true',
      'underline': 'true',
      'align': 'center',
      'Writings of Bahá’u’lláh',
    ],
    [
      'stack': 15,
      [
        ..."Bahá’u’lláh authored thousands of letters, tablets, and books that, if compiled, would constitute more than 100 volumes."
      ],
      [
        ..."This collection offers the principal works of Bahá’u’lláh that have been translated into English.",
      ],
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
      grid(findDocuments('Bahá’u’lláh', ids)),
    ]
  ]
}