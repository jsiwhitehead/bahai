<\
  stack={60}
  style={{ max-width: "620px", margin: "0 auto" }}
>
  <\ size={40} bold underline align="center">Quotes</>
  {...topQuotes.map(quote=> (
    doc: documents[quote.id],
    para: doc.paragraphs[quote.paragraph],
    parts: quote.parts,
    <\ stack={15}>
      <\ inline size={17} align="justify">{parts[0].start > 0 ? ". . . " : ""}{...parts.flatMap((part, i)=>
          [
            i && (parts[i - 1]?.end !== part.start) ? " . . . " : "",
            type(part) === "string" ? part :
              <\ fill={`rgb(255, ${240 - part.count * 10}, ${240 - part.count * 10})`} pad={[2.5, 0]}>{para.text.slice(part.start, part.end)}</>,
          ]
        )}{parts[parts.length - 1].end < para.text.length ? " . . ." : ""}</>
      <\
        size={16}
        italic
        align="right"
        color={colors.link[doc.author]}
        underline={hover}
        link={`/doc/${quote.id}#${quote.paragraph}`}
        style={{ width: '75%', margin: '0 0 0 auto' }}
      >
        ({unique(
          [
            doc.author,
            ...doc.path,
            doc.title ||
              (doc.item && `#${doc.item}`),
            para.index && `para ${para.index}`,
          ].filter(x => x)
        ).join(", ")})
      </>
    </>
  ))}
</>