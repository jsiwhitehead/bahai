[(doc, index):
  {
    'baseLevel': 1,
    'levelNumbers': '',
    'paraNumbers': '',
    'color': colors.'link'.(doc.'author') | colors.'link'.'The World Centre',
    'allLines': every(doc.'paragraphs', [p: p.'type' | p.'lines']),
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
        ...map(
          doc.'paragraphs',
          [(p, i):
            [
              'id': i,
              'style': ['position': 'relative'],
              paraNumbers & (!index | p.'index' = 1) & [
                'size': 13,
                'color': '#999',
                'align': 'right',
                'width': 50,
                'style': ['position': 'absolute', 'top': '2px', 'left': '-60px'],
                index | p.'index',
              ],
              [
                'stack': 15,
                {
                  'parts': fillParts(quotesMap.(doc.'id')?.(i - 1)?.'parts', p.'text'),
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
                    ...map(
                      parts,
                      [(part, i):
                        {
                          'strength': 240 - part.'count' * 10,
                          'fill': part.'count' > 0 & 'rgb(255, {strength}, {strength})',
                          'text': slice(p.'text', part.'start', part.'end'),
                          : {
                            ? p.'index' = 1 & i = 1: [
                              'fill': fill,
                              'size': 17 * 3,
                              'line': 1,
                              'color': color,
                              'pad': ['right': 8],
                              'style': ['float': 'left', 'width': 'auto'],
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
                    )
                  ],
                },
              ]
            ],
          ],
        ),
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