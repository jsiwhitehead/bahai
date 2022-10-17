{
  'size': 17,
  'doc': url->[
    ['doc', id]: documents.id,
  ],
  'group': doc & toUrl({
    ? startsWith(doc.'id', 'quran'): 'the-quran',
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
      button('The Qur’án'),
    ],
    [
      'pad': ['left': 235],
      [
        'pad': 50,
        {
          ? length(url) = 0: 'Hello',
          ? url.1 = 'the-quran': quran,
          ? url.1 = 'doc': [
            'stack': 20,
            ['color': 'blue', 'underline': hover, 'link': [group], '« Back'],
            [doc.'id'],
          ],
          : 'Hi',
        }
      ]
    ],
  ],
}