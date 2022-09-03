(
  size: 17,
  map(
    <a
      size={size}
      font="PT Serif"
      color="#333"
      pad={50}
      style={{ max-width: "700px", margin: "0 auto" }}
      {
        url.length === 0 ?
          <a stack={50}>
            <a size={40} bold underline "Bahá’í Library" />
            <a
              stack={40}
              <a color="blue" underline={hover} link="/hidden-words" {"The Hidden Words" + " »"} />
              <a color="blue" underline={hover} link={"/collection/" + "Learning"} {"Learning" + " »"} />
              <a stack={15}
                <a size={20} bold "Praise" />
                {...["Praise and Glorification", "Draw Hearts to Thee"].map(k=>
                  <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Individual" />
                {...["Individual Growth", "Service and Teaching"].map(k=>
                  <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Community" />
                {...["Collective Growth", "Advancing the Cause"].map(k=>
                  <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Assistance" />
                {...["Forgiveness and Healing", "Tests and Difficulties"].map(k=>
                  <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "People" />
                {...["Children and Youth", "Babies and Infants", "Marriage", "Departed"].map(k=>
                  <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Occasion" />
                {...["Gathering", "Morning", "Evening", "Calendar", "The Fast"].map(k=>
                  <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Special" />
                {...["Obligatory Prayers", "Special", "Government", "Narrative"].map(k=>
                  <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Ruhi" />
                {...["Children’s Classes: Prayers for Children", "Children’s Classes: Prayers for Teachers", "Glimmerings of Hope"].map(k=>
                  <a color="blue" underline={hover} link={"/collection/" + k} {k + " »"} />
                )}
              />
            />
          </a>
        : url[0]=== "collection" ?
          (
            name: decodeURIComponent(url[1]),
            collection: collections[name],
            <a
              stack={60}
              <a stack={20}>
                <a size={40} bold underline {name} />
                <a color="blue" underline={hover} link="/" "« Back" />
              </a>
              {...collection.map(renderItem)}
            />
          )
        : url[0] === "iqan" ?
          (
            doc: documents.find(d=> d.id === "bahaullah-kitab-i-iqan-0"),
            <a
              stack={60}
              <a stack={20}>
                <a size={40} bold underline {doc.title} />
                <a color="blue" underline={hover} link="/" "« Back" />
              </a>
              {...doc.items.map((x, i)=>
                doc.sections[i] ?
                  <a stack={60}>
                    <a size={30} bold align="center">{doc.sections[i].title}</a>
                    <a>{renderItem(x, i, doc.author)}</a>
                  </a>
                :
                  renderItem(x, i, doc.author)
              )}
            />
          )
        : url[0] === "hidden-words" ?
          <a
            stack={60}
            <a stack={20}>
              <a size={40} bold underline "The Hidden Words" />
              <a color="blue" underline={hover} link="/" "« Back" />
            </a>
            <a size={30} bold align="center" "Part One: From the Arabic" />
            {renderItem(hiddenWords.items[0], null, hiddenWords.author)}
            <a align="center" "⭑ ⭑ ⭑" />
            {...hiddenWords.items.slice(1, 72).map((x, i)=> renderItem(x, i, hiddenWords.author))}
            <a size={30} bold align="center" "Part Two: From the Persian" />
            {renderItem(hiddenWords.items[72], null, hiddenWords.author)}
            {...hiddenWords.items.slice(73, 155).map((x, i)=> renderItem(x, i, hiddenWords.author))}
            <a align="center" "⭑ ⭑ ⭑" />
            {renderItem(hiddenWords.items[155], null, hiddenWords.author)}
          />
        :
          null
      }
    />
  )
)