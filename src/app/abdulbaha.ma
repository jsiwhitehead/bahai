{
  'items': sortIds([
    'abdul-baha-secret-divine-civilization-001',
    'abdul-baha-tablet-august-forel-001',
    'abdul-baha-tablets-hague-abdul-baha-001',
    'abdul-baha-tablets-hague-abdul-baha-002',
    'abdul-baha-travelers-narrative-001',
    'abdul-baha-will-testament-abdul-baha-001'
  ]),
  : [
    'stack': 60,
    [
      'size': 40,
      'bold': 'true',
      'underline': 'true',
      'align': 'center',
      '‘Abdu’l‑Bahá',
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
      'Further ‘Abdu’l‑Bahá',
    ],
    [
      'stack': 15,
      ...findDocuments('‘Abdu’l‑Bahá', items)->map.[(doc, i): [
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