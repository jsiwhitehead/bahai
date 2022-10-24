{
  'items': sortIds([
    'the-bab-selections-writings-bab-000',
    'the-bab-selections-writings-bab-001',
    'the-bab-selections-writings-bab-002',
    'the-bab-selections-writings-bab-003',
    'the-bab-selections-writings-bab-004',
    'the-bab-selections-writings-bab-005',
    'the-bab-selections-writings-bab-006',
    'the-bab-selections-writings-bab-007',
  ]),
  : [
    'stack': 60,
    [
      'size': 40,
      'bold': 'true',
      'underline': 'true',
      'align': 'center',
      'The Báb',
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
      'Further The Báb',
    ],
    [
      'stack': 15,
      ...findDocuments('The Báb', items)->map.[(doc, i): [
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