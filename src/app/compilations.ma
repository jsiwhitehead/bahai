{
  'items': sortIds([
    'compilations-bahai-funds-contributions-001',
    'compilations-bahai-meetings-001',
    'compilations-chaste-holy-life-001',
    'compilations-codification-law-huququllah-001',
    'compilations-consultation-001',
    'compilations-excellence-all-things-001',
    'compilations-family-life-001',
    'compilations-fire-and-light-001',
    'compilations-give-me-thy-grace-serve-thy-loved-ones-001',
    'compilations-huququllah-right-god-001',
    'compilations-importance-obligatory-prayer-fasting-001',
    'compilations-importance-prayer-meditation-devotional-attitude-001',
    'compilations-institution-mashriqul-adhkar-001',
    'compilations-issues-related-study-bahai-faith-001',
    'compilations-local-spiritual-assembly-001',
    'compilations-music-001',
    'compilations-peace-001',
    'compilations-power-divine-assistance-001',
    'compilations-prayer-devotional-life-001',
    'compilations-sanctity-nature-bahai-elections-001',
    'compilations-scholarship-001',
    'compilations-significance-formative-age-our-faith-001',
    'compilations-social-action-001',
    'compilations-trustworthiness-001',
    'compilations-universal-house-of-justice-compilation-001',
    'compilations-women-001',
  ]),
  : [
    'stack': 60,
    [
      'size': 40,
      'bold': 'true',
      'underline': 'true',
      'align': 'center',
      'Compilations',
    ],
    [
      'bar': 'true',
      [
        'width': 1 / 2,
        [
          'stack': 15,
          'pad': ['right': 20],
          ['size': 20, 'bold': 'true', 'Ruhi'],
          ...(1..10)->map.[
            i: [
              'bar': 'true',
              ['width': 1 / 4, 'Book {i}:'],
              ...(1..3)->map.[
                j: [
                  'width': 1 / 4,
                  'color': 'blue',
                  'underline': hover,
                  'link': ['doc', 'ruhi{i}-00{j - 1}'],
                  'Unit {j}',
                ],
              ],
            ],
          ],

        ]
      ],
      [
        'width': 1 / 2,
        [
          'stack': 15,
          'pad': ['left': 20],
          ['size': 20, 'bold': 'true', 'Compilations'],
          ...items->map.[key: {
            'k': key->[[x]: x, x: x],
            : [
              'color': 'blue',
              'underline': hover,
              'link': ['doc', k],
              '{key->[
                [k]: join(
                  [
                    documents.k.'path'.(length(documents.k.'path')),
                    documents.k.'title',
                  ],
                  ', '
                ),
                k: documents.k.'title',
              ]}{documents.k.'translated' & ' ({documents.k.'translated'})'} »'
            ],
          }]
        ]
      ],
    ]
  ],
}