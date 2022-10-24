{
  'items': sortIds([
    'bahaullah-call-divine-beloved-002',
    'bahaullah-call-divine-beloved-003',
    'bahaullah-call-divine-beloved-004',
    'bahaullah-call-divine-beloved-008',
    ['bahaullah-hidden-words-001'],
    ['bahaullah-hidden-words-002'],
    'bahaullah-gems-divine-mysteries-002',
    'bahaullah-kitab-i-iqan-003',
    'bahaullah-summons-lord-hosts-002',
    'bahaullah-summons-lord-hosts-003',
    'bahaullah-summons-lord-hosts-004',
    'bahaullah-summons-lord-hosts-005',
    'bahaullah-summons-lord-hosts-006',
    'bahaullah-tabernacle-unity-002',
    'bahaullah-tabernacle-unity-003',
    'bahaullah-tabernacle-unity-004',
    'bahaullah-kitab-i-aqdas-004',
    'bahaullah-epistle-son-wolf-001'
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
    ],
    [
      'size': 40,
      'bold': 'true',
      'underline': 'true',
      'align': 'center',
      'Further Bahá’u’lláh',
    ],
    [
      'stack': 15,
      ...findDocuments('Bahá’u’lláh', items)->map.[(doc, i): [
        'color': 'blue',
        'underline': hover,
        'link': ['doc', doc.'id'],
        '{i}. {[
          ...doc.'path',
          doc.'title' | (doc.'item' & '#{doc.'item'}'),
        ]->filter()->unique->join(', ')}{doc.'translated' & ' ({doc.'translated'})'} ({length(doc.'paragraphs')}) »',
      ]]
    ],
  ],
}