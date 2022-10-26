{
  'ids': [
    'abdul-baha-travelers-narrative-001',
    'abdul-baha-secret-divine-civilization-001',
    'abdul-baha-will-testament-abdul-baha-001',
    'abdul-baha-tablets-hague-abdul-baha-001',
    'abdul-baha-tablet-august-forel-001',
  ],
  : [
    'stack': 60,
    [
      'size': 34,
      'bold': 'true',
      'underline': 'true',
      'align': 'center',
      'Writings and Talks of ‘Abdu’l‑Bahá',
    ],
    [
      'stack': 15,
      [
        ..."As Bahá’u’lláh’s successor and chosen interpreter of His Writings, ‘Abdu’l‑Bahá expounded upon the teachings of His Father’s Faith, amplified its doctrines, and outlined the central features of its administrative institutions."
      ],
    ],
    [
      'stack': 15,
      [
        'size': 24,
        'bold': 'true',
        'underline': 'true',
        'align': 'center',
        'Some Longer Writings and Talks',
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
        'Other Writings and Talks',
      ],
      grid(findDocuments('‘Abdu’l‑Bahá', ids)),
    ]
  ]
}