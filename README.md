## hoverglow

<img src="https://raw.githubusercontent.com/motion/hoverglow/master/demo.gif" />

Make glows that hover.

```
npm install --save hoverglow
```

#### Props

```js
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
```

#### Usage

```js
class {
  render() {
    render (
      <container>
        <Glow
          full
          inverse
          scale={0.9}
          boundPct={100}
          color="black"
          opacity={0.17}
          resist={80}
          borderRadius={0}
          shadowSize={70}
          shadowOffsetTop={10}
          zIndex={100}
        />
        <card>
          ...
        </card>
      </container>
    )
  }
}
```
