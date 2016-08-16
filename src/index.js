import React from 'react'
import color from 'color-js'
import throttle from 'lodash.throttle'

export default class HoverGlow extends React.Component {
  static defaultProps = {
    width: 300,
    height: 200,
    color: [0,0,0],
    zIndex: 100,
    resist: 0,
    scale: 1,
    opacity: 0.025,
    boundPct: null,
    borderRadius: 100,
    shadowSize: null,
    shadowOffsetTop: 0,
    shadowOffsetLeft: 0,
    clickable: false,
    clickDuration: 150,
    clickScale: 2,
    fadeTime: 100,
  }

  state = {
    track: false,
    position: {},
  }

  center = {}
  bounds = {}

  componentDidMount() {
    setTimeout(() => this.follow())
  }

  follow = () => {
    if (this.root) {
      const target = this.root.parentNode
      this.bounds = target.getBoundingClientRect()
      this.center = {
        x: this.bounds.left + this.bounds.width / 2,
        y: this.bounds.top + this.bounds.height / 2,
      }
      this.addEvent(target, 'mousemove', this.move)
      this.addEvent(target, 'mouseenter', this.trackMouse(true))
      this.addEvent(target, 'mouseleave', this.trackMouse(false))

      if (this.props.clickable) {
        this.addEvent(target, 'click', this.click)
      }
    }
  }

  move = throttle(({ clientX: x, clientY: y }) => {
    this.setState({
      position: {
        x: x - this.center.x,
        y: y - this.center.y,
      },
    })
  }, 16)

  click = () => {
    this.setState({ clicked: true }, () => {
      setTimeout(() => this.setState({ clicked: false }), this.props.clickDuration)
    })
  }

  trackMouse = track => () => {
    setTimeout(() => {
      this.setState({ track })
    })
  }

  render() {
    const {
      boundPct,
      full,
      scale,
      color,
      zIndex,
      resist,
      opacity,
      inverse,
      borderRadius,
      shadowSize,
      shadowOffsetTop,
      shadowOffsetLeft,
      width: propWidth,
      height: propHeight,
      size,
      clickDuration,
      clickScale,
      fadeTime,
      ...props,
    } = this.props
    const {
      position: { x, y },
      track,
      clicked,
    } = this.state

    // find width / height (full == match size of container)
    let width = size || propWidth
    let height = size || propHeight
    if (full) {
      width = this.bounds.width
      height = this.bounds.height
    }

    const shadowAmt = shadowSize === null ? (width + height / 20) : shadowSize
    const inversed = (coord) => !inverse? coord : -coord
    const color$ = color(color)

    // resists being moved (towards center)
    const resisted = (coord) => {
      if (resist === 0) return coord
      const resistAmt = (1 - (resist / 100))
      return coord * resistAmt
    }

    // bounds it within box x% size of parent
    const bounded = (coord, glowSize, parentSize) => {
      if (boundPct === null || boundPct > 100) return coord
      const difference = parentSize - glowSize
      const direction = coord / Math.abs(coord)
      const max = difference * (boundPct / 100) / 2
      const cur = Math.abs(coord)
      return Math.min(max, cur) * direction
    }

    return (
      <glowcontainer
        ref={_ => { this.root = _ }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        {...props}
      >
        {this.root &&
          <glow
            style={{
              transform: `
                translateX(${inversed(bounded(resisted(x), width * scale, this.bounds.width))}px)
                translateY(${inversed(bounded(resisted(y), height * scale, this.bounds.height))}px)
              `,
              pointerEvents: 'none',
              position: 'absolute',
              top: '50%',
              left: '50%',
            }}
          >
            <svg
              height={height}
              width={width}
              style={{
                boxShadow: `${shadowOffsetLeft}px ${shadowOffsetTop}px ${shadowAmt}px ${color$}`,
                transform: `scale(${scale * (clicked ? clickScale : 1)})`,
                opacity: track ? opacity : 0,
                marginLeft: -width / 2,
                marginTop: -height / 2,
                zIndex,
                borderRadius,
                transition: `transform linear ${clickDuration / 2}ms, opacity linear ${fadeTime}ms`,
              }}
            >
              <defs>
                <filter id="f1" x="0" y="0">
                  <feGaussianBlur in="SourceGraphic" stdDeviation={(width + height) / 6} />
                </filter>
              </defs>
              <rect width={width} height={height} fill={color$} filter="url(#f1)" />
            </svg>
          </glow>
        }
      </glowcontainer>
    )
  }
}
