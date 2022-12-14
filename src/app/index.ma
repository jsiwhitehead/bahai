{
  'px': [n ? +n: '{n}px', x: x | 0],
  *'render': [
    [
      ...:values,
      ...items,
    ]: {
      'size': values.'size' | 20,
      'line': values.'line' | 1.5,
      'lineHeight': { ? line > 3 : line, : line * size },
      'gap': (lineHeight - size) * 0.5 + 1,
      'hover': values.'hover',
      'click': values.'click',
      'filtered': items->filter(),
      'nextInline': values.'inline' | filtered->some.[[...x]: '', x: 'true'],
      'content':
        filtered->map.[
          [...x]: render([
            'size': x.'size' | size,
            'line': x.'line' | line,
            'span': nextInline,
            ...x,
          ]),
          x: render(x),
        ],
      'inner': {
        ? values.'input' = 'text': {
          'v': values.'value',
          : [[:'input', 'type': 'text', 'value': v, 'v':: oninput?.'target'?.'value']]
        },
        ? values.'input' = 'select': {
          'v': values.'value',
          : [[
            :'select',
            'v':: oninput?.'target'?.'value',
            ...values.'options'->map.[o:
              [:'option', 'selected': v = o, 'value': o, o],
            ],
          ]]
        },
        ? !values.'span' & nextInline: {
          ? values.'vertical': [
            [:'div', 'style': ['padding': '0 1px', 'min-width': px(size)],
              [:'div', 'style': ['margin': '0 {px(-gap)}'],
                ...content,
              ],
            ]
          ],
          : [
            [:'div', 'style': ['padding': '1px 0', 'min-height': px(size)],
              [:'div', 'style': ['margin': '{px(-gap)} 0'],
                ...content,
              ],
            ]
          ]
        },
        ? values.'stack': content->map.[
          (x, i): [:'div', 'style': ['padding-top': i ! 1 & px(values.'stack')], x]
        ],
        : content,
      },
      : [
        : { ? values.'span': 'span', ? values.'link': 'a', : 'div' },
        'id': values.'id',
        'style': [
          'font-size': px(size),
          'line-height': px(lineHeight),
          'font-family': values.'font',
          'font-weight': values.'bold' & 'bold',
          'font-style': values.'italic' & 'italic',
          'text-decoration': values.'underline' & 'underline',
          'text-transform': values.'uppercase' & 'uppercase',
          'text-align': {
            ? ['justify-left', 'justify-center', 'justify-right']->includes(values.'align'):
              'justify',
            : values.'align',
          },
          'text-align-last': {
            ? values.'align' = 'justify-left': 'left',
            ? values.'align' = 'justify-center': 'center',
            ? values.'align' = 'justify-right': 'right',
            : values.'align',
          },
          'color': values.'color',
          'background': values.'fill',
          'text-indent': px(values.'indent'),
          'writing-mode': values.'vertical' & 'vertical-rl',
          'transform': values.'vertical' & 'rotate(-180deg)',
          'cursor': values.'cursor' | (values.'link' & 'pointer'),
          'padding': values.'pad'->[
            [...x]: [
              x.'top' | x.1,
              x.'right' | x.4 | x.2 | x.1,
              x.'bottom' | x.3 | x.1,
              x.'left' | x.2 | x.1,
            ]->map(px)->join(' '),
            x: px(x),
          ],
          'border-radius': values.'round'->[
            [...x]: [
              x.'topLeft' | x.'top' | x.'left' | x.1,
              x.'topRight' | x.'top' | x.'right' | x.4 | x.2 | x.1,
              x.'bottomRight' | x.'bottom' | x.'right' | x.3 | x.1,
              x.'bottomLeft' | x.'bottom' | x.'left' | x.2 | x.1,
            ]->map(px)->join(' '),
            x: px(x),
          ],
          'width': values.'width' &
            { ? values.'width' <= 1 : '{values.'width' * 100}%', : px(values.'width') },
          'flex-grow': { ? values.'width': 0, : 1 },
          'display': {
            ? values.'span': 'inline',
            ? values.'bar': 'flex',
            ? values.'grid': 'grid',
            : 'block'
          },
          'grid-template-columns': values.'grid' &
            values.'grid'->map.[v ? +v: '{v}fr', v: v]->join(' '),
          ...values.'style',
        ],
        'href': values.'link'->[
          ['': hash, ...parts]: '/{parts->join('/')}#{hash}',
          [...parts]: '/{parts->join('/')}'
        ],
        'hover':: onmouseenter & 'true',
        'hover':: onmouseleave & '',
        'click':: onclick & 'true',
        ...inner,
      ]
    },
    x: x,
  ],
  : render(app),
}