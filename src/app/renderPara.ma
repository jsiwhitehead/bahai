[(para, config): {
  'p': para.'paragraph',
  'color': colors.'link'.(para.'author') | colors.'link'.'The World Centre',
  'level': p.'section' & p.'title' & (length(p.'section') + config.'baseLevel'),
  'renderPart': [
    [...part]: {
      'fill': config.'highlight' & part.'count' > 0 &
        'rgb(255, {240 - part.'count' * 10}, {240 - part.'count' * 10})',
      : {
        ? part.'first': [
          'size': 17 * 3,
          'line': 1,
          'color': color,
          'fill': fill,
          'bold': part.'quote',
          'pad': ['right': 8],
          'width': 'auto',
          'style': ['float': 'left'],
          part.'text',
        ],
        : [
          'fill': fill,
          'bold': part.'quote',
          'pad': [2.5, 0],
          part.'text',
        ],
      }
    },
    part: part,
  ],
  'renderParts': [parts: [
    parts.1.'start' > 0 & '. . . ',
    ...parts->flatMap.[(part, i): [
      i > 1 & (part.'start' - parts.(i - 1).'end' = 1) &
        para.'text'->slice(part.'start' - 1, part.'start'),
      i > 1 & (part.'start' - parts.(i - 1).'end' > 1) & ' . . . ',
      renderPart(part),
    ]],
    parts.(length(parts)).'end' < length(para.'text') & ' . . .',
  ]],
  : [
    'id': i,
    'style': ['position': 'relative'],
    config.'index' & [
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
      config.'index',
    ],
    [
      'stack': 15,
      [
        'inline': !p.'lines',
        'align': {
          ? p.'section' & !p.'title': 'center',
          ? p.'type': 'justify-center',
          : 'justify-left',
        },
        'size': {
          ? p.'info': 16,
          ? p.'level': 25 - (level * 2)
        },
        'uppercase': level = 1 | p.'type' = 'call',
        'bold': level <= 2 | p.'id',
        'italic': level > 2 | p.'type' = 'info',
        'indent': !p.'type' & (p.'index' ! 1) & 20,
        'pad': {
          ? p.'type': [0, 60],
          ? p.'id': [0, 20],
          ? p.'lines': [0, 40],
          ? level = 1: ['top': 20],
          ? level <= 2: 0,
          : [0, (level - 2) * 20],
        },
        'stack': p.'lines' & (17 / 2),
        ...{
          ? p.'lines': para.'parts'->map.[(chunk, i):
            [
              'inline': 'true',
              'uppercase': i = 1 & para.'path'.1 = 'The Hidden Words',
              ...chunk->filter.[x: x.'count' >= config.'minQuote']->renderParts
            ]
          ],
          : para.'parts'->filter.[x: x.'count' >= config.'minQuote']->renderParts,
        },
        'style': ['clear': 'both', 'white-space': 'pre-wrap'],
      ],
    ],
  ]
}]