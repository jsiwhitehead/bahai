{
  'items': sortIds([
    'compilations-bahai-funds-contributions-000',
    'compilations-bahai-meetings-000',
    'compilations-chaste-holy-life-000',
    'compilations-codification-law-huququllah-000',
    'compilations-consultation-000',
    'compilations-excellence-all-things-000',
    'compilations-family-life-000',
    'compilations-fire-and-light-000',
    'compilations-give-me-thy-grace-serve-thy-loved-ones-000',
    'compilations-huququllah-right-god-000',
    'compilations-importance-obligatory-prayer-fasting-000',
    'compilations-importance-prayer-meditation-devotional-attitude-000',
    'compilations-institution-mashriqul-adhkar-000',
    'compilations-issues-related-study-bahai-faith-000',
    'compilations-local-spiritual-assembly-000',
    'compilations-music-000',
    'compilations-peace-000',
    'compilations-power-divine-assistance-000',
    'compilations-prayer-devotional-life-000',
    'compilations-sanctity-nature-bahai-elections-000',
    'compilations-scholarship-000',
    'compilations-significance-formative-age-our-faith-000',
    'compilations-social-action-000',
    'compilations-trustworthiness-000',
    'compilations-universal-house-of-justice-compilation-000',
    'compilations-women-000',
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