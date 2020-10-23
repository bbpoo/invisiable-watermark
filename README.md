# Description
A plugin to add un-recognizable watermark to web-based application.
# Build
* npm
```sh
npm install
npm run build
```
* yarn
```sh
yarn install
yarn build
```
Compiled file will be generated in dist folder.
# Usage
Construct object and call ".draw()" method, which return the watermark as base64 image/png string.
* Constructor
```sh
new IvWatermark(
  [2d context from canva element], // the size of canvas must not be less than the size of watermark
  [Size of watermark], // size must be powers of 2
  [Scale of watermark], // set the scale of watermark, from 2 to 255
  [Text of watermark],
  [Foreground code of watermark]
)
```
# Example
* As script
```sh
<script src="ivwatermark.js"></script>
...
<script>
  var cavans = document.createElement('canvas');
  cavans.width = 256;
  cavans.height = 256;
  var watermark = new ivWatermark(cavans.getContext('2d'), 256, 32, 'Watermark', 'rgba(0, 0, 0, 1)');
  var img = watermark.draw()
</script>
```
# Result
* Watermark
<p>
  <img alt="Generated watermark" src="https://user-images.githubusercontent.com/3001668/96951777-d2383300-151f-11eb-96b3-1832fbe13ff1.png"/>
</p>
* Processed
<p>
  <img alt="Processed watermark" src="https://user-images.githubusercontent.com/3001668/96951787-d5cbba00-151f-11eb-91e7-f03dbe6082c7.png"/>
</p>
