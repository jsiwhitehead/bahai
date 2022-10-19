{
  'size': 17,
  'doc': url->[['doc', id]: documents.id],
  'group': doc & toUrl({
    ? doc.'type' = 'Prayer': 'prayers',
    ? doc.'id'->startsWith('ruhi') | doc.'id'->startsWith('compilations'): 'compilations',
    ? includes(['‘Abdu’l‑Bahá', 'Bahá’u’lláh', 'The Báb'], doc.'author') : doc.'author',
    ? doc.'id'->startsWith('quran'): 'the-quran',
    ? doc.'id'->startsWith('bible') & doc.'id'->slice(-3)->toInt() < 39: 'the-old-testament',
    ? doc.'id'->startsWith('bible'): 'the-new-testament',
    : 'the-administrative-order',
  }),
  'button': [label: {
    'active': (url.1 = toUrl(label)) | (group = toUrl(label)),
    : [
      'pad': 10,
      'fill': { ? active | hover: 'white', : '#ddd' },
      'round': ['left': 10],
      'bold': 'true',
      'underline': active,
      'link': [toUrl(label)],
      label,
    ],
  }],
  : [
    'size': size,
    'font': 'Atkinson Hyperlegible',
    'color': '#333',
    'style': ['height': '100%'],
    [
      'width': 235,
      'fill': '#eee',
      'pad': [20, 20, 20, 0],
      'stack': 25,
      'style': ['position': 'fixed', 'height': '100%'],
      [
        'size': 24,
        'bold': 'true',
        'underline': 'true',
        'link': [],
        'Bahá’í Library'
      ],
      button('Prayers'),
      button('Compilations'),
      button('Quotes'),
      [
        'stack': 5,
        ...[
          'The Administrative Order',
          '‘Abdu’l‑Bahá',
          'Bahá’u’lláh',
          'The Báb'
        ]->map.button,
      ],
      button('The Qur’án'),
      button('The New Testament'),
      button('The Old Testament'),
    ],
    [
      'pad': ['left': 235],
      [
        'pad': 50,
        url->[
          ['prayers']: prayers,
          ['prayers', x]: prayers,
          ['compilations']: compilations,
          ['quotes']: quotes,
          ['the-administrative-order']: administrative,
          ['abdul-baha']: abdulbaha,
          ['bahaullah']: bahaullah,
          ['the-bab']: thebab,
          ['the-new-testament']: newtestament,
          ['the-old-testament']: oldtestament,
          ['the-quran']: quran,
          ['doc', x]: [
            'stack': 20,
            ['color': 'blue', 'underline': hover, 'link': [group], '« Back'],
            render(doc),
          ],
          []: 'Hello',
        ],
      ]
    ],
  ],
}