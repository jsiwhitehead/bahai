[(doc, index):
  {
    'baseLevel': '1',
    'levelNumbers': '',
    'paraNumbers': '1',
    'color': colors.'link'.(doc.'author') | colors.'link'.'The World Centre',
    'allLines': doc.'paragraphs'->every.[p: p.'type' | p.'lines'],
    : [
      'stack': { ? index: 35, : 60 },
      'style': ['max-width': '620px', 'margin': '0 auto'],
      [
        'size': { ? index: 26, : 34 },
        'bold': 'true',
        'underline': !index,
        'align': 'center',
        doc.'title',
      ],
      [
        'stack': 25,
        'align': 'justify',
        doc.'reader' & [
          'size': 16,
          'italic': 'true',
          'pad': [0, 60],
          'color': '#999',
          'style': ['text-align-last': 'center'],
          doc.'reader',
        ],
        ...doc.'paragraphs'->map.[
          (p, i): [
            'id': i,
            'style': ['position': 'relative'],
            paraNumbers & (!index | p.'index' = 1) & [
              'size': 13,
              'color': '#999',
              'align': 'right',
              'width': 50,
              'style': [
                'position': 'absolute',
                'top': '2px',
                'left': '-60px',
                'user-select': 'none',
              ],
              index | p.'index',
            ],
            [
              'stack': 15,
              {
                ? p.'section' & !p.'title': [
                  'align': 'center',
                  '* * *'
                ],
                ? p.'section': {
                  'level': length(p.'section') + baseLevel,
                  : [
                    'size': 25 - (level * 2),
                    'uppercase': level = 1,
                    'bold': level <= 2,
                    'color': 'black',
                    'italic': level > 2,
                    'align': 'left',
                    'pad': {
                      ? level = 1: ['top': 20],
                      ? level <= 2: 0,
                      : [0, (level - 2) * 20],
                    },
                    '{
                      level < 4 & levelNumbers &
                      '{p.'section'->join('.')}{length(p.'section') = 1 & '.'}'
                    } {p.'title'}'
                  ],
                },
                ? p.'lines': [
                  'stack': 17 / 2,
                  ...p.'lines'->slice(0, -1)->map.[
                    (start, i): [
                      'pad': !allLines & [0, 40],
                      'uppercase': i = 1 & doc.'path'->includes('The Hidden Words'),
                      'size': 17,
                      p.'text'->slice(start, p.'lines'.(i + 1) - 1),
                    ]
                  ]
                ],
                ? p.'id': [
                  'stack': 15,
                  [
                    'size': 17,
                    'color': 'black',
                    'pad': [0, 20],
                    'bold': 'true',
                    {
                      ? p.'parts':
                        p.'parts'
                          ->map.[
                            [...part]:
                              documents.(p.'id').'paragraphs'.(part.'paragraph' + 1).'text'
                                ->slice(part.'start', part.'end'),
                            part: part,
                          ]
                          ->join(' '),
                      : documents.(p.'id').'paragraphs'.(p.'paragraphs'.1 + 1).'text'
                    }
                  ],
                  {
                    'refText': getRef(doc.'paragraphs', i - 1),
                    : refText & [
                      'size': 16, 
                      'italic': 'true',
                      'align': 'right',
                      'color':
                        colors.'link'.(documents.(p.'id').'author') |
                        colors.'link'.'The World Centre',
                      'underline': hover,
                      'link': ['doc', p.'id', : p.'paragraphs'.1 + 1],
                      'style': ['width': '75%', 'margin': '0 20px 0 auto'],
                      refText,
                    ],
                  },
                ],
                : [
                  'inline': 'true',
                  'size': p.'type' = 'info' & 16 | 17,
                  'italic': p.'type' = 'info',
                  'uppercase': p.'type' = 'call',
                  'indent': !(p.'index'= 1 | p.'type') & 20,
                  'pad': p.'type' & [0, 60],
                  'color': doc.'type' = 'Prayer' & p.'type' & '#999',
                  'style': [
                    'clear': 'both',
                    'text-align-last': p.'type' & 'center',
                  ],
                  ...fillParts(quotesMap.(doc.'id')?.(i - 1)?.'parts', p.'text')->map.[
                    (part, i): {
                      'strength': 240 - part.'count' * 10,
                      'fill': part.'count' > 0 & 'rgb(255, {strength}, {strength})',
                      'text': p.'text'->slice(part.'start', part.'end'),
                      : {
                        ? p.'index' = 1 & i = 1: [
                          'fill': fill,
                          'size': 17 * 3,
                          'line': 1,
                          'color': color,
                          'pad': ['right': 8],
                          'width': 'auto',
                          'style': ['float': 'left'],
                          text,
                        ],
                        : [
                          'fill': fill,
                          'pad': [2.5, 0],
                          text,
                        ],
                      },
                    }
                  ]
                ]
              },
              ...(quotesMap.(doc.'id')?.(i - 1)?.'refs' | [])->map.[
                r: [
                  'size': 16,
                  'italic': 'true',
                  'align': 'left',
                  'color':
                    colors.'link'.(documents.(r.'id').'author') |
                    colors.'link'.'The World Centre',
                  'underline': hover,
                  'link': ['doc', r.'id', : r.'paragraph' + 1],
                  'style': ['width': '75%', 'margin': '0 auto 0 0'],
                  [
                    documents.(r.'id').'author',
                    ...documents.(r.'id').'path',
                    documents.(r.'id').'title' |
                      (documents.(r.'id').'item' & '#{documents.(r.'id').'item'}'),
                  ]
                    ->filter()
                    ->unique()
                    ->join(', ')
                ]
              ],
            ],
          ],
        ],
        doc.'type' = 'Prayer' & [
          'align': 'right',
          'italic': 'true',
          'color': color,
          'style': ['clear': 'both'],
          '— {doc.'author'}',
        ],
      ],
    ]
  }
]