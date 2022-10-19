{
  'items': sortIds([
    'abdul-baha-secret-divine-civilization-000',
    'abdul-baha-tablet-august-forel-000',
    'abdul-baha-tablets-hague-abdul-baha-000',
    'abdul-baha-tablets-hague-abdul-baha-001',
    'abdul-baha-travelers-narrative-000',
    'abdul-baha-will-testament-abdul-baha-000'
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
    ]
  ],
}