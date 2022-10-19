{
  'item': [index:
    {
      'id': 'bible-{padStart(index - 1, 3, 0)}',
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
      'The Old Testament',
    ],
    [
      'bar': 'true',
      [
        'width': 1 / 3,
        'stack': 15,
        ...(1..13)->map.item,
      ],
      [
        'width': 1 / 3,
        'stack': 15,
        ...(14..26)->map.item,
      ],
      [
        'width': 1 / 3,
        'stack': 15,
        ...(27..39)->map.item,
      ]
    ]
  ],
}