(
  px: v=> type(v) === 'number' ? v + 'px' : v || 0,
  map: x=> x?.type !== 'block' ? x : (
    ...x.values,
    size: size || 20,
    line: line || 1.5,
    lineHeight: line > 3 ? line : line * size,
    gap: (lineHeight - size) * 0.5 + 1,
    style: {
      ...x.values.style,
      font-size: px(size),
      line-height: px(lineHeight),
      font-family: font,
      font-weight: bold && 'bold',
      font-style: italic && 'italic',
      text-decoration: underline && 'underline',
      text-transform: uppercase && 'uppercase',
      text-align: align,
      color: color,
      text-indent: px(indent),
      cursor: cursor || (link && "pointer"),
      padding:
        type(pad) === "array" ?
          px(pad[0]) + ' ' +
          (px(pad[3] ?? pad[1] ?? pad[0])) + ' ' +
          (px(pad[2] ?? pad[0])) + ' ' +
          (px(pad[1] ?? pad[0]))
        : type(pad) === 'object' ?
          px(pad.top) + ' ' +
          px(pad.right) + ' ' +
          px(pad.bottom) + ' ' +
          px(pad.left)
        :
          px(pad),
      background: fill,
      width: width && width <= 1 ? width * 100 + "%" : px(width),
      flex-grow: width ? 0 : 1,
      border-radius:
        type(round) === "array" ?
          px(round[0]) + ' ' +
          (px(round[3] ?? round[1] ?? round[0])) + ' ' +
          (px(round[2] ?? round[0])) + ' ' +
          (px(round[1] ?? round[0]))
        : type(round) === 'object' ?
          px(round.topLeft) + ' ' +
          px(round.topRight) + ' ' +
          px(round.bottomRight) + ' ' +
          px(round.bottomLeft)
        :
          px(round),
      display: span ? 'inline' : bar ? 'flex' : 'block',
    },
    events: <a
      hover::{onmouseenter && true}
      hover::{onmouseleave && false}
      focus::{onfocus && true}
      focus::{onblur && false}
    />,
    nextInline: inline || x.items.some(y=> y && type(y) !== "object" && ("" + y).trim()),
    content:
      nextInline || span ?
        x.items.map(y=> map(
          type(y) === "object" ?
            <a {...y} size={y.size || size} line={y.line || line} span={true}/>
          :
            y
        ))
      :
        x.items.filter(y=> y && (type(y) !== "string" || y.trim())).map(y=> map(
          <a {...y} size={y.size || size} line={y.line || line} {...context} />
        )),
    span ?
      <span id={id} style={style} {...events}>{...content}</span>
    : input ?
      (
        val: value,
        <div id={id} style={style} {...events}>
          <div style={{ padding: "1px 0", min-height: px(size) }}>
            <div style={{ margin-top: px(-gap), margin-bottom: px(-gap) }}>
              <select style={{ height: px(lineHeight) }} val::{oninput && oninput.target.value}>
                <option value={null} selected={val === null ? "selected" : undefined} "- Pick one -" />
                {...options.map(o=> <option value={o} selected={val === o ? "selected" : undefined} {o} />)}
              </select>
            </div>
          </div>
        </div>
      )
    : (
      inner:
        nextInline ?
          [
            <div style={{ padding: "1px 0", min-height: px(size) }}>
              <div style={{ margin-top: px(-gap), margin-bottom: px(-gap) }}>
                {...content}
              </div>
            </div>
          ]
        : stack ?
          content.map((c, i)=> <div style={{ padding-top: px(i !== 0 && stack) }}>{c}</div>)
        :
          content,
      link ?
        <a id={id} style={style} {...events} href={link} {...inner} />
      :
        <div id={id} style={style} {...events} href={link} {...inner} />
    )
  ),
  map,
)