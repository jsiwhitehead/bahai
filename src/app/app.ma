{
  'size': 17,
  'doc': url->[['doc', id]: documents.id],
  'group': doc & toUrl({
    ? doc.'type' = 'Prayer': 'prayers',
    ? doc.'id'->startsWith('ruhi') | doc.'id'->startsWith('compilations'): 'compilations',
    ? includes(['‘Abdu’l‑Bahá', 'Bahá’u’lláh', 'The Báb'], doc.'author') : doc.'author',
    ? doc.'epoch': toUrl(doc.'epoch'),
    : 'other-documents',
  }),
  'button': [(label, bold): {
    'active': (url.1 = toUrl(label)) | (group = toUrl(label)),
    : [
      'size': 15,
      'pad': 10,
      'fill': { ? active | hover: 'white', : '#ddd' },
      'round': ['left': 10],
      'bold': bold,
      'italic': !bold,
      'underline': active,
      'link': [toUrl(label)],
      'align': 'right',
      'style': ['position': 'relative', 'z-index': 5],
      label,
    ],
  }],
  'timestamp': [(label, close): [
    'size': 11,
    'pad': 2,
    'align': 'center',
    'width': 40,
    'bold': 'true',
    'style': [
      'position': 'absolute',
      'bottom': '-8px',
      'left': { ? close: '-50px', : '-97.5px' },
      'z-index': 10,
    ],
    label,
  ]],
  : [
    'size': size,
    'font': 'Atkinson Hyperlegible',
    'color': '#333',
    'style': ['height': '100%'],
    [
      'width': 215,
      'fill': '#eee',
      'pad': [20, 40, 20, 0],
      'stack': 25,
      'style': ['position': 'fixed', 'height': '100%'],
      [
        'size': 24,
        'bold': 'true',
        'underline': 'true',
        'link': [],
        'Bahá’í Library'
      ],
      button('Prayers', 'true'),
      button('Compilations', 'true'),
      [
        'pad': [10, 0],
        'fill': '#ddd',
        'round': ['left': 10],
        'stack': 3,
        [
          'bar': 'true',
          [
            'stack': 3,
            'width': 10 + 37.5 + 10,
            [
              'pad': [10, 10],
              'size': 15,
              'bold': 'true',
              'align': 'center',
              'vertical': 'true',
              'style': ['height': '149px'],
              'The Universal House of Justice'
            ],
            [
              'pad': [0, 10],
              'size': 15,
              'bold': 'true',
              'align': 'center',
              'vertical': 'true',
              'style': ['height': '73px'],
              'Shoghi Effendi'
            ],
          ],
          [
            'stack': 3,
            [
              'style': ['position': 'relative'],
              button('Sixth Epoch'),
              timestamp('2022'),
            ],
            [
              'style': ['position': 'relative'],
              button('Fifth Epoch'),
              timestamp('2001'),
            ],
            [
              'style': ['position': 'relative'],
              button('Fourth Epoch'),
              timestamp('1986'),
            ],
            [
              'style': ['position': 'relative'],
              button('Third Epoch'),
              timestamp('1963'),
            ],
            [
              'style': ['position': 'relative'],
              button('Second Epoch'),
              timestamp('1946'),
            ],
            [
              'style': ['position': 'relative'],
              button('First Epoch'),
              timestamp('1921'),
            ],
          ],
        ],
        [
          'stack': 3,
          'pad': ['left': 10],
          [
            'style': ['position': 'relative'],
            button('‘Abdu’l‑Bahá', 'true'),
            timestamp('1892', 'true'),
          ],
          [
            'style': ['position': 'relative'],
            button('Bahá’u’lláh', 'true'),
            timestamp('1853', 'true'),
          ],
          [
            'style': ['position': 'relative'],
            button('The Báb', 'true'),
            timestamp('1844', 'true'),
          ],
        ]
      ],
    ],
    [
      'pad': ['left': 215],
      [
        'pad': 50,
        url->[
          ['prayers']: prayers,
          ['prayers', x]: prayers,
          ['compilations']: pages.'compilations',
          ['sixth-epoch']: pages.'sixthepoch',
          ['fifth-epoch']: pages.'fifthepoch',
          ['fourth-epoch']: pages.'fourthepoch',
          ['third-epoch']: pages.'thirdepoch',
          ['second-epoch']: pages.'secondepoch',
          ['first-epoch']: pages.'firstepoch',
          ['abdul-baha']: pages.'abdulbaha',
          ['bahaullah']: pages.'bahaullah',
          ['the-bab']: pages.'thebab',
          ['doc', x]: render(doc),
          []: 'Hello',
        ],
      ]
    ],
  ],
}