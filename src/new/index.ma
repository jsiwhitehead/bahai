{
  *'render': [
    [...items,...:values]: [
      :'div',
      'style': ['color': values.'color'],
      'hover': values.'hover',
      'hover':: onmouseenter & 'true',
      'hover':: onmouseleave & '',
      ...items->map.render,
    ],
    x: x,
  ],
  render.app,
}