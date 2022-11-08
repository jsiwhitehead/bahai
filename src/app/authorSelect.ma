[author:
  {
    'authorGroup': [(auth, column, row, nested): {
      : [
        'fill': {
          ? hover : 'lightgreen',
          ? auth = author : 'lightgreen',
          ? nested->includes(author) : 'lightblue',
          : '#ddd',
        },
        'bold': 'true',
        'pad': { ? row ! 'auto': [20, 5], : 5 },
        'cursor': 'pointer',
        'author':: click & auth,
        'style': ['grid-column': column, 'grid-row': row],
        auth,
      ],
    }],
    : [
      'size': 15,
      'align': 'center',
      'grid': [1, 1, 1, 1, 1, 1, 1, 1, 1],
      'style': ['align-items': 'center', 'column-gap': '5px', 'row-gap': '5px'],
      authorGroup('Bahá’í Era', '1 / 10', 'auto', []),
      authorGroup('Heroic Age', '1 / 4', 'auto', ['Bahá’í Era']),
      authorGroup('Formative Age', '4 / 10', 'auto', ['Bahá’í Era']),
      authorGroup('Word of God', '1 / 3', 'auto', ['Bahá’í Era', 'Heroic Age']),
      authorGroup('‘Abdu’l‑Bahá', '3 / 4', '3 / 5', ['Bahá’í Era', 'Heroic Age']),
      authorGroup('Shoghi Effendi', '4 / 6', 'auto', ['Bahá’í Era', 'Formative Age']),
      authorGroup('The Universal House of Justice', '6 / 10', 'auto', ['Bahá’í Era', 'Formative Age']),
      authorGroup('The Báb', 'auto', 'auto', ['Bahá’í Era', 'Heroic Age', 'Word of God']),
      authorGroup('Bahá’u’lláh', 'auto', 'auto', ['Bahá’í Era', 'Heroic Age', 'Word of God']),
      authorGroup('First Epoch', 'auto', 'auto', ['Bahá’í Era', 'Formative Age', 'Shoghi Effendi']),
      authorGroup('Second Epoch', 'auto', 'auto', ['Bahá’í Era', 'Formative Age', 'Shoghi Effendi']),
      authorGroup('Third Epoch', 'auto', 'auto', ['Bahá’í Era', 'Formative Age', 'The Universal House of Justice']),
      authorGroup('Fourth Epoch', 'auto', 'auto', ['Bahá’í Era', 'Formative Age', 'The Universal House of Justice']),
      authorGroup('Fifth Epoch', 'auto', 'auto', ['Bahá’í Era', 'Formative Age', 'The Universal House of Justice']),
      authorGroup('Sixth Epoch', 'auto', 'auto', ['Bahá’í Era', 'Formative Age', 'The Universal House of Justice']),
    ]
  }
]