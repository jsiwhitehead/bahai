(
  size: 17,
  map(
    <a
      size={size}
      font="Atkinson Hyperlegible"
      color="#333"
      pad={50}
      style={{ max-width: "720px", margin: "0 auto" }}
      {
        url.length === 0 ?
          <a stack={60}>
            <a size={40} bold underline "Bahá’í Library" />
            <a color="blue" underline={hover} link="/prayers" "Prayers »" />
            {...library.map(group=>
              <a stack={15}>
                <a size={20} bold {group.title} />
                {...group.items.map(k=>
                  <a color="blue" underline={hover} link={"/doc/" + k}>
                    {documents[k].title}{documents[k].translated && (" (" + documents[k].translated + ")")} »
                  </a>
                )}
              </a>
            )}
          </a>
        : url[0]=== "prayers" && !url[1] ?
          <a stack={60}>
            <a stack={20}>
              <a color="blue" underline={hover} link="/" "« Back" />
              <a size={40} bold underline align="center" "Bahá’í Prayers" />
            </a>
            <a
              stack={40}
              <a stack={15}
                <a size={20} bold "Praise" />
                {...["Praise and Glorification", "Draw Hearts to Thee"].map(k=>
                  <a color="blue" underline={hover} link={"/prayers/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Individual" />
                {...["Individual Growth", "Service and Teaching"].map(k=>
                  <a color="blue" underline={hover} link={"/prayers/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Community" />
                {...["Collective Growth", "Advancing the Cause"].map(k=>
                  <a color="blue" underline={hover} link={"/prayers/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Assistance" />
                {...["Forgiveness and Healing", "Tests and Difficulties"].map(k=>
                  <a color="blue" underline={hover} link={"/prayers/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "People" />
                {...["Children and Youth", "Babies and Infants", "Marriage", "Departed"].map(k=>
                  <a color="blue" underline={hover} link={"/prayers/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Occasion" />
                {...["Gathering", "Morning", "Evening", "Calendar", "The Fast"].map(k=>
                  <a color="blue" underline={hover} link={"/prayers/" + k} {k + " »"} />
                )}
              />
              <a stack={15}
                <a size={20} bold "Special" />
                {...["Obligatory Prayers", "Special", "Government", "Narrative"].map(k=>
                  <a color="blue" underline={hover} link={"/prayers/" + k} {k + " »"} />
                )}
              />
            />
          </a>
        : url[0]=== "prayers" && url[1] ?
          (
            name: decodeURIComponent(url[1]),
            collection: collections[name],
            <a
              stack={60}
              <a stack={20}>
                <a color="blue" underline={hover} link="/prayers" "« Back" />
                <a size={40} bold underline align="center" {name} />
              </a>
              {...collection.map(render)}
            />
          )
        :
          <a
            stack={60}
            <a stack={20}>
              <a color="blue" underline={hover} link="/" "« Back" />
              <a size={34} bold underline align="center" {documents[url[1]].title} />
              {documents[url[1]].translated &&
                <a size={24} bold align="center" {"(" + documents[url[1]].translated + ")"} />
              }
            </a>
            {render(documents[url[1]])}
          />
      }
    />
  )
)