{
  'px': [+n: '{n}px', x: x | 0],
  *'render': [
    [
      'size':=,
      'line':=,
      'font':=,
      'bold':=,
      'italic':=,
      'underline':=,
      'uppercase':=,
      'align':=,
      'color':=,
      'fill':=,
      'indent':=,
      'cursor':=,
      'pad':=,
      'round':=,
      'stack':=,
      'bar':=,
      'width':=,
      'style':=,
      'link':=,
      'input':=,
      'value':=,
      'hover':=,
      'inline':=,
      'span':=,
      ...:values,
      ...items,
    ]: {
      'size': size | 20,
      'line': line | 1.5,
      'lineHeight': { ? line > 3 : line, : line * size },
      'gap': (lineHeight - size) * 0.5 + 1,
      'nextInline': inline | some(items, [[...x]: '', x: true]),
      'content':
        map(
          items,
          [
            [...x]: render([
              'size': x.'size' | size,
              'line': x.'line' | line,
              'span': nextInline,
              ...x,
            ]),
            x: render(x),
          ]
        ),
      'inner': {
        ? input: {
          'val': value,
          : [[:'input', 'type': 'text', 'value': val, 'val':: oninput?.'target'?.'value']]
        },
        ? !span & nextInline: [
          [:'div', 'style': ['padding': '1px 0', 'min-height': px(size)],
            [:'div', 'style': ['margin-top': px(-gap), 'margin-bottom': px(-gap)],
              ...content,
            ],
          ]
        ],
        ? stack: mapi(
          content,
          [[x, i]: [:'div', 'style': ['padding-top': i ! 1 & px(stack)], x]]
        ),
        : content,
      },
      : [: { ? span: 'span', ? link: 'a', : 'div' },
        'style': [
          'font-size': px(size),
          'line-height': px(lineHeight),
          'font-family': font,
          'font-weight': bold & 'bold',
          'font-style': italic & 'italic',
          'text-decoration': underline & 'underline',
          'text-transform': uppercase & 'uppercase',
          'text-align': align,
          'color': color,
          'background': fill,
          'text-indent': px(indent),
          'cursor': cursor | (link & 'pointer'),
          'padding': pad->[
            [...x]: [
              x.'top' | x.1,
              x.'right' | x.4 | x.2 | x.1,
              x.'bottom' | x.3 | x.1,
              x.'left' | x.2 | x.1,
            ]->map(px)->join(' '),
            x: px(x),
          ],
          'border-radius': round->[
            [...x]: [
              x.'topLeft' | x.'top' | x.'left' | x.1,
              x.'topRight' | x.'top' | x.'right' | x.4 | x.2 | x.1,
              x.'bottomRight' | x.'bottom' | x.'right' | x.3 | x.1,
              x.'bottomLeft' | x.'bottom' | x.'left' | x.2 | x.1,
            ]->map(px)->join(' '),
            x: px(x),
          ],
          'width': width & { ? width <= 1 : '{width * 100}%', : px(width) },
          'flex-grow': { ? width: 0, : 1 },
          'display': { ? span: 'inline', ? bar: 'flex', : 'block' },
          ...style,
        ],
        'href': link & '/{link->join('/')}',
        'hover':: onmouseenter & 'true',
        'hover':: onmouseleave & '',
        ...inner,
      ]
    },
    x: x,
  ],
  : render(app),
}