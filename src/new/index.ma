{
  'px': [v: type.v = 'number' ? '{v}px' : v | 0],
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
      'hover':=,
      'span':=,
      ...:values,
      ...items
    ]: {
      'size': size | 20,
      'line': line | 1.5,
      'lineHeight': line > 3 ? line : line * size,
      'gap': (lineHeight - size) * 0.5 + 1,
      'hasInline': items->some.[x: type.x ! 'object'],
      'content':
        items->map.[
          [...x]: render.[
            'size': x.'size' | size,
            'line': x.'line' | line,
            'span': hasInline,
            ...x,
          ],
          x: render.x,
        ],
      'inner': !span & hasInline ?
        [
          [:'div', 'style': ['padding': '1px 0', 'min-height': px.size],
            [:'div', 'style': ['margin-top': px.(-gap), 'margin-bottom': px.(-gap)],
              ...content,
            ],
          ]
        ]
      : stack ?
        content->map.[x: [:'div', 'style': ['padding-top': px.stack], x]]
      :
        content,
      [:span ? 'span' : 'div',
        'style': [
          'font-size': px.size,
          'line-height': px.lineHeight,
          'font-family': font,
          'font-weight': bold & 'bold',
          'font-style': italic & 'italic',
          'text-decoration': underline & 'underline',
          'text-transform': uppercase & 'uppercase',
          'text-align': align,
          'color': color,
          'background': fill,
          'text-indent': px.indent,
          'cursor': cursor | (link & 'pointer'),
          'padding': pad->[
            [...x]: [
              x.'top' | x.1,
              x.'right' | x.4 | x.2 | x.1,
              x.'bottom' | x.3 | x.1,
              x.'left' | x.2 | x.1,
            ]->map.px->join.' ',
            x: px.x,
          ],
          'border-radius': round->[
            [...x]: [
              x.'topLeft' | x.'top' | x.'left' | x.1,
              x.'topRight' | x.'top' | x.'right' | x.4 | x.2 | x.1,
              x.'bottomRight' | x.'bottom' | x.'right' | x.3 | x.1,
              x.'bottomLeft' | x.'bottom' | x.'left' | x.2 | x.1,
            ]->map.px->join.' ',
            x: px.x,
          ],
        ],
        'hover':: onmouseenter & 'true',
        'hover':: onmouseleave & '',
        ...inner,
      ]
    },
    x: x,
  ],
  render.app,
}
