{
  'items': sortIds([
    'bahaullah-call-divine-beloved-001',
    'bahaullah-call-divine-beloved-002',
    'bahaullah-call-divine-beloved-003',
    'bahaullah-call-divine-beloved-007',
    ['bahaullah-hidden-words-000'],
    ['bahaullah-hidden-words-001'],
    'bahaullah-gems-divine-mysteries-001',
    'bahaullah-kitab-i-iqan-002',
    'bahaullah-summons-lord-hosts-001',
    'bahaullah-summons-lord-hosts-002',
    'bahaullah-summons-lord-hosts-003',
    'bahaullah-summons-lord-hosts-004',
    'bahaullah-summons-lord-hosts-005',
    'bahaullah-tabernacle-unity-001',
    'bahaullah-tabernacle-unity-002',
    'bahaullah-tabernacle-unity-003',
    'bahaullah-kitab-i-aqdas-003',
    'bahaullah-epistle-son-wolf-000'
  ]),
  : [
    'stack': 60,
    [
      'size': 40,
      'bold': 'true',
      'underline': 'true',
      'align': 'center',
      'Bahá’u’lláh',
    ],
    [
      'stack': 15,
      ...items->map.[key: {
        'k': key->[[x]: x, x: x],
        : [
          'color': 'blue',
          'underline': hover,
          'link': ['doc', k],
          '{key->[
            [k]: join(
              [
                documents.k.'path'.(length(documents.k.'path')),
                documents.k.'title',
              ],
              ', '
            ),
            k: documents.k.'title',
          ]}{documents.k.'translated' & ' ({documents.k.'translated'})'} »'
        ],
      }]
    ]
  ],
}