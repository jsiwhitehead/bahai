{
  'groups': [
    [
      'title': 'Shoghi Effendi',
      'items': sortIds([
        'shoghi-effendi-advent-divine-justice-001',
        'shoghi-effendi-god-passes-by-002',
        'shoghi-effendi-promised-day-come-001',
        'shoghi-effendi-world-order-bahaullah-002',
        'shoghi-effendi-world-order-bahaullah-003',
        'shoghi-effendi-world-order-bahaullah-004',
        'shoghi-effendi-world-order-bahaullah-005',
        'shoghi-effendi-world-order-bahaullah-006',
        ['shoghi-effendi-world-order-bahaullah-007'],
        ['shoghi-effendi-world-order-bahaullah-008'],
        ['shoghi-effendi-world-order-bahaullah-009'],
        ['shoghi-effendi-world-order-bahaullah-010'],
        'shoghi-effendi-world-order-bahaullah-011'
      ])
    ],
    [
      'title': 'The Universal House of Justice',
      'items': sortIds([
        'the-universal-house-of-justice-the-institution-of-the-counsellors-001',
        'the-universal-house-of-justice-messages-008',
        'the-universal-house-of-justice-messages-017',
        'the-universal-house-of-justice-messages-046',
        'the-universal-house-of-justice-messages-078',
        'the-universal-house-of-justice-messages-117',
        'the-universal-house-of-justice-messages-134',
        'the-universal-house-of-justice-messages-015',
        'the-universal-house-of-justice-messages-080',
        'the-universal-house-of-justice-additional-messages-004',
        'the-universal-house-of-justice-additional-messages-005',
        'the-universal-house-of-justice-additional-messages-013',
        'the-universal-house-of-justice-messages-071',
        'the-universal-house-of-justice-messages-123',
        'the-universal-house-of-justice-additional-messages-019',
        'the-universal-house-of-justice-messages-189',
      ])
    ],
    [
      'title': 'World Centre',
      'items': sortIds([
        'official-statements-commentaries-bahaullah-001',
        'official-statements-commentaries-prosperity-humankind-001',
        'official-statements-commentaries-turning-point-all-nations-001',
        'official-statements-commentaries-century-light-002',
        'official-statements-commentaries-one-common-faith-002',
        'world-centre-higher-functioning-001',
        'world-centre-entry-by-troops-001',
        'world-centre-frontiers-learning-001',
        'the-universal-house-of-justice-turning-point-001',
        'the-universal-house-of-justice-turning-point-003',
        'the-universal-house-of-justice-turning-point-004',
        'the-universal-house-of-justice-turning-point-005',
        'the-universal-house-of-justice-turning-point-006',
        'world-centre-20180503-001'
      ])
    ],
  ],
  'renderGroup': [
    group: [
      'stack': 15,
      ['size': 20, 'bold': 'true', group.'title'],
      ...group.'items'->map.[key: {
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
      }],
    ],
  ],
  : [
    'stack': 60,
    [
      'size': 40,
      'bold': 'true',
      'underline': 'true',
      'align': 'center',
      'The Administrative Order',
    ],
    [
      'bar': 'true',
      [
        'width': 1 / 2,
        ['pad': ['right': 20], renderGroup(groups.1)],
      ],
      [
        'width': 1 / 2,
        ['pad': ['left': 20], renderGroup(groups.2)],
      ],
    ],
    [
      'bar': 'true',
      [
        'width': 1 / 2,
        ['pad': ['right': 20], renderGroup(groups.3)],
      ],
      [
        'width': 1 / 2,
      ],
    ],
  ],
}