{
  'search':~ '',
  : [
    'stack': 60,
    [
      'size': 34,
      'bold': 'true',
      'underline': 'true',
      'align': 'center',
      'Search',
    ],
    [
      'input': 'text',
      'fill': '#eee',
      'round': 50,
      'align': 'center',
      'pad': [10, 20],
      'value': search,
    ],
    [
      'stack': 60,
      'align': 'justify',
      'style': ['max-width': '620px', 'margin': '0 auto'],
      ...runSearch(search)->map.[p:
        {
          ? p.'section': ['bold': 'true', p.'title' | '* * *'],
          ? p.'id' & p.'parts':
            [
              p.'parts'
                ->map.[
                  [...part]:
                    documents.(p.'id').'paragraphs'.(part.'paragraph').'text'
                      ->slice(part.'start', part.'end'),
                  part: part,
                ]
                ->join(' ')
            ],
          ? p.'id': [documents.(p.'id').'paragraphs'.(p.'paragraphs'.1).'text'],
          : [p.'text'],
        }
      ]
    ],
  ],
}