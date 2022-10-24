{
  'item': [index:
    {
      'id': 'quran-{padStart(index, 3, 0)}',
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
        ...(1..38)->map.item,
      ],
      [
        'width': 1 / 3,
        'stack': 15,
        ...(39..76)->map.item,
      ],
      [
        'width': 1 / 3,
        'stack': 15,
        ...(77..114)->map.item,
      ]
    ]
  ],
}