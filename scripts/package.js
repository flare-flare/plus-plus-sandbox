const { cpSync, mkdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const esbuild = require('esbuild');

const root = join(__dirname, '..');
const inDir = join(root, 'node_modules');
const outDir = join(root, 'src', 'vendor');

function copy(from, to) {
  mkdirSync(join(outDir, to, '..'), { recursive: true });
  cpSync(join(inDir, from), join(outDir, to));
}

// Video.js 10 ships as ES modules split across many chunks; bundle the
// player, its default skin and the hls.js media element into a single file.
rmSync(join(outDir, 'video.js'), { recursive: true, force: true });
esbuild.buildSync({
  stdin: {
    contents: [
      `import '@videojs/html/video/player';`,
      `import '@videojs/html/video/skin';`,
      `import '@videojs/html/media/hlsjs-video';`,
    ].join('\n'),
    resolveDir: root,
  },
  bundle: true,
  format: 'esm',
  minify: true,
  legalComments: 'none',
  outfile: join(outDir, 'video.js', 'video.min.js'),
});

copy('skeleton-css/css/skeleton.css', 'skeleton.css/skeleton.css');
copy('skeleton-css/css/normalize.css', 'skeleton.css/normalize.css');
