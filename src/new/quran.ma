{
  'item': [index:
    {
      'id': 'quran-{padStart(index - 1, 3, 0)}',
      : [
        'color': 'blue',
        'underline': hover,
        'link': ['doc', id],
        '{index}. {documents.id.'title'}'
      ],
    }
  ],
  : [
    'stack': 60,
    [
      'size': 40,
      'bold': 'true',
      'underline': 'true',
      'align': 'center',
      'The Qur’án',
    ],
    [
      'bar': 'true',
      [
        'width': 1 / 3,
        'stack': 15,
        ...map(1..38, item),
      ],
      [
        'width': 1 / 3,
        'stack': 15,
        ...map(39..76, item),
      ],
      [
        'width': 1 / 3,
        'stack': 15,
        ...map(77..114, item),
      ]
    ]
  ],
}