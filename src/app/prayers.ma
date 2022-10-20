{
  'group': [
    (title, collections): [
      'stack': 15,
      ['size': 20, 'bold': 'true', title],
      ...collections->map.[
        k: [
          'color': 'blue',
          'underline': hover,
          'link': ['prayers', toUrl(k)],
          k,
        ]
      ],
    ],
  ],
  : url->[
    ['prayers', groupName]: {
      'collection': collections.groupName,
      : [
        'stack': 60,
        [
          'stack': 20,
          [
            'color': 'blue',
            'underline': hover,
            'link': ['prayers'],
            '« Back',
          ],
          [
            'size': 34,
            'bold': 'true',
            'underline': 'true',
            'align': 'center',
            collection?.'name',
          ],
        ],
        ...collection.'items'->map.render,
      ]
    },
    ['prayers']: [
      'stack': 60,
      [
        'size': 34,
        'bold': 'true',
        'underline': 'true',
        'align': 'center',
        'Prayers',
      ],
      [
        'bar': 'true',
        [
          'width': 1 / 3,
          'stack': 40,
          group('Praise', ['Praise and Glorification', 'Draw Hearts to Thee']),
          group('Assistance', ['Healing', 'Forgiveness', 'Tests and Difficulties']),
        ],
        [
          'width': 1 / 3,
          'stack': 40,
          group('Individual', ['Individual Growth', 'Service and Teaching']),
          group('Community', ['Collective Growth', 'Advancing the Cause']),
          group('People', ['Children and Youth', 'Babies and Infants', 'Marriage', 'Departed']),
        ],
        [
          'width': 1 / 3,
          'stack': 40,
          group('Occasion', ['Gathering', 'Morning', 'Evening', 'Calendar', 'The Fast']),
          group('Special', ['Obligatory Prayers', 'Special', 'Nations', 'Narrative']),
        ],
      ]
    ],
  ],
}
