{
  'item': [index:
    {
      'id': 'bible-{padStart(index + 39, 3, 0)}',
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
      'The New Testament',
    ],
    [
      'bar': 'true',
      [
        'width': 1 / 3,
        'stack': 15,
        ...(1..9)->map.item,
      ],
      [
        'width': 1 / 3,
        'stack': 15,
        ...(10..18)->map.item,
      ],
      [
        'width': 1 / 3,
        'stack': 15,
        ...(19..27)->map.item,
      ]
    ]
  ],
}