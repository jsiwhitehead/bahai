[
  'stack': 60,
  'style': ['max-width': '620px', 'margin': '0 auto'],
  [
    'size': 40,
    'bold': 'true',
    'underline': 'true',
    'align': 'center',
    'Quotes',
  ],
  ...topQuotes->map.[quote: {
    'doc': documents.(quote.'id'),
    'para': doc.'paragraphs'.(quote.'paragraph' + 1),
    'parts': quote.'parts',
    : [
      'stack': 15,
      [
        'inline': 'true',
        'size': 17,
        'align': 'justify',
        parts.1.'start' > 0 & '. . . ',
        ...parts->flatMap.[(part, i): [
          i > 1 & parts.(i - 1).'end' ! part.'start' & ' . . . ',
          part->[
            ['count': count, 'start': start, 'end': end]: [
              'fill': 'rgb(255, {240 - count * 10}, {240 - count * 10})',
              'pad': [2.5, 0],
              para.'text'->slice(start, end),
            ],
            x: x,
          ],
        ]],
        parts.(length(parts)).'end' < length(para.'text') & ' . . .',
      ],
      [
        'size': 16,
        'italic': 'true',
        'align': 'right',
        'color': colors.'link'.(doc.'author'),
        'underline': hover,
        'link': ['doc', quote.'id', : quote.'paragraph'],
        'width': 0.75,
        'style': ['margin': '0 0 0 auto'],
        [
          doc.'author',
          ...doc.'path',
          doc.'title' | (doc.'item' & '#{doc.'item'}'),
          para.'index' & 'para {para.'index'}',
        ]
          ->filter()
          ->unique()
          ->join(', '),
      ]
    ],
  }],
]
