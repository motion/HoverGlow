import React from 'react'
import throttle from 'lodash.throttle'
import $ from 'color-js'
import resizer from 'element-resize-detector'
import { addEvent, setTimeout } from 'motion-class-helpers'
import { offset } from './helpers'
import gloss from 'gloss'

const style = gloss()

const Resize = resizer({ strategy: 'scroll' })

@style
class HoverGlow extends React.Component {
  static defaultProps = {
    width: 380,
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
    transition: 1000,
  }

  state = {
    track: false,
    position: {},
  }

  bounds = {}

  componentDidMount() {
    this.setTimeout(this.follow)
  }

  follow = () => {
    let node

    if (this.props.parent) {
      node = this.props.parent()
    }
    else if (this.refs.root) {
      node = this.refs.root.parentNode
    }

    if (node) {
      this.node = node
      this.setBounds()
      this.addEvent(node, 'mouseenter', this.trackMouse(true))
      this.addEvent(node, 'mousemove', this.move)
      this.addEvent(node, 'mouseleave', this.trackMouse(false))
      Resize.listenTo(node, this.setBounds)

      if (this.props.clickable) {
        this.addEvent(node, 'click', this.click)
      }
    }
  }

  componentWillUnmount() {
    this.unmounted = true
    if (this.node) {
      Resize.removeAllListeners(this.node)
    }
  }

  setBounds = throttle(() => {
    this.bounds = this.node.getBoundingClientRect()
  }, 100)

  // offset gives us offset without scroll, just based on parent
  move = throttle(e => {
    const [x, y] = offset(e, this.node)
    if (this.unmounted) return
    this.setState({
      position: {
        x: x - this.bounds.width / 2,
        y: y - this.bounds.height / 2,
      },
    })
  }, 32)

  click = () => {
    this.setState({ clicked: true }, () => {
      this.setTimeout(() => {
        this.setState({ clicked: false })
      }, this.props.clickDuration)
    })
  }

  trackMouse = track => () => {
    this.setState({ track })
  }

  render() {
    if (!this.state.track) {
      return <overlay ref="root" style={{ opacity: 0 }} />
    }

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
      transition,
      parent,
      itemProps,
    } = this.props

    // find width / height (full == match size of container)
    let width = size || propWidth
    let height = size || propHeight
    if (full) {
      width = this.bounds.width
      height = this.bounds.height
    }

    const shadowAmt = shadowSize === null ? (width + height / 10) : shadowSize

    const {
      position: { x, y },
      track,
      clicked,
    } = this.state

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

    const inversed = (coord) => {
      if (!inverse) return coord
      return -coord
    }

    const colorRGB = $(color)

    return (
      <overlay ref="root" {...itemProps}>
        <glow
          style={{
            opacity: 1,
            transform: `
              translateX(${inversed(bounded(resisted(x), width * scale, this.bounds.width))}px)
              translateY(${inversed(bounded(resisted(y), height * scale, this.bounds.height))}px)
            `,
          }}
        >
          <svg
            height={height}
            width={width}
            style={{
              boxShadow: `${shadowOffsetLeft}px ${shadowOffsetTop}px ${shadowAmt}px ${colorRGB}`,
              transform: `scale(${scale * (clicked ? clickScale : 1)})`,
              opacity: track ? opacity : 0,
              marginLeft: -width / 2,
              marginTop: -height / 2,
              zIndex,
              borderRadius,
              transition: `
                transform linear ${clickDuration / 2}ms,
                opacity linear ${transition}ms
              `,
            }}
          >
            <defs>
              <filter id="f1" x="0" y="0">
                <feGaussianBlur in="SourceGraphic" stdDeviation={(width + height) / 6} />
              </filter>
            </defs>
            <rect width={width} height={height} fill={colorRGB} filter="url(#f1)" />
          </svg>
        </glow>
      </overlay>
    )
  }

  static style = {
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      // transition: 'opacity ease-in 20ms',
      '&:active': {
        pointerEvents: 'none',
      },
    },
    glow: {
      pointerEvents: 'none',
      position: 'absolute',
      top: '50%',
      left: '50%',
    },
  }
}

HoverGlow.prototype.setTimeout = setTimeout
HoverGlow.prototype.addEvent = addEvent

export default HoverGlow
