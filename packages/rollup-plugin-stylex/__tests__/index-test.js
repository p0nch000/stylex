/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const rollup = require('rollup');
const { createBabelInputPluginFactory } = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const stylexPlugin = require('../src/index');

describe('rollup-plugin-stylex', () => {
  async function runStylex(options) {
    const stylex = stylexPlugin(options);
    // Configure a rollup bundle
    const bundle = await rollup.rollup({
      // Remove stylex runtime from bundle
      external: ['stylex'],
      input: path.resolve(__dirname, '__fixtures__/index.js'),
      plugins: [
        nodeResolve(),
        commonjs(),
        createBabelInputPluginFactory(stylex.babelHook)({
          babelHelpers: 'bundled',
        }),
        stylex,
      ],
    });

    // Generate output specific code in-memory
    // You can call this function multiple times on the same bundle object
    const { output } = await bundle.generate({
      output: {
        file: path.resolve(__dirname, '/__builds__/bundle.js'),
      },
    });

    let css, js;

    for (const chunkOrAsset of output) {
      if (chunkOrAsset.fileName === 'stylex.css') {
        css = chunkOrAsset.source;
      } else if (chunkOrAsset.fileName === 'bundle.js') {
        js = chunkOrAsset.code;
      }
    }

    return { css, js };
  }

  it('extracts CSS and removes stylex.inject calls', async () => {
    const { css, js } = await runStylex({ fileName: 'stylex.css' });

    expect(css).toMatchInlineSnapshot(`
      ".p357zi0d{display:flex}
      html:not([dir='rtl']) .a3oefunm{margin-left:10px}
      html[dir='rtl'] .a3oefunm{margin-right:10px}
      .bjgvxnpl{margin-block-start:99px}
      .cctpw5f5{height:500px}
      .f804f6gw{display:block}
      .ln8gz9je{width:100%}
      .lq9oatf1:hover{background:red}"
    `);

    expect(js).toMatchInlineSnapshot(`
      "import stylex from 'stylex';

      // otherStyles.js
      const styles$2 = {
        bar: {
          display: \\"f804f6gw\\",
          width: \\"ln8gz9je\\"
        }
      };

      // npmStyles.js
      stylex.inject('.rse6dlih{display:inline}', 1);
      stylex.inject('.ezi3dscr{width:50%}', 1);
      const styles$1 = {
        baz: {
          display: 'rse6dlih',
          width: 'ezi3dscr'
        }
      };

      // index.js
      const styles = {
        foo: {
          display: \\"p357zi0d\\",
          marginStart: \\"a3oefunm\\",
          marginBlockStart: \\"bjgvxnpl\\",
          height: \\"cctpw5f5\\",
          ':hover': {
            background: \\"lq9oatf1\\"
          }
        }
      };
      function App() {
        return stylex(styles$2.bar, styles.foo, styles$1.baz);
      }

      export { App as default };
      "
    `);
  });

  describe('when in dev mode', () => {
    it('preserves stylex.inject calls and does not extract CSS', async () => {
      const { css, js } = await runStylex({
        dev: true,
        fileName: 'stylex.css',
      });

      expect(css).toBeUndefined();

      expect(js).toMatchInlineSnapshot(`
        "import stylex from 'stylex';

        // otherStyles.js

        if (__DEV__) {
          stylex.inject(\\".f804f6gw{display:block}\\", 1);
          stylex.inject(\\".ln8gz9je{width:100%}\\", 1);
        }

        const styles$2 = {
          bar: {
            otherStyles__bar: \\"otherStyles__bar\\",
            display: \\"f804f6gw\\",
            width: \\"ln8gz9je\\"
          }
        };

        // npmStyles.js
        stylex.inject('.rse6dlih{display:inline}', 1);
        stylex.inject('.ezi3dscr{width:50%}', 1);
        const styles$1 = {
          baz: {
            display: 'rse6dlih',
            width: 'ezi3dscr'
          }
        };

        // index.js

        if (__DEV__) {
          stylex.inject(\\".p357zi0d{display:flex}\\", 1);
          stylex.inject(\\".a3oefunm{margin-left:10px}\\", 1, \\".a3oefunm{margin-right:10px}\\");
          stylex.inject(\\".bjgvxnpl{margin-block-start:99px}\\", 1);
          stylex.inject(\\".cctpw5f5{height:500px}\\", 1);
          stylex.inject(\\".lq9oatf1:hover{background:red}\\", 7.1);
        }

        const styles = {
          foo: {
            index__foo: \\"index__foo\\",
            display: \\"p357zi0d\\",
            marginStart: \\"a3oefunm\\",
            marginBlockStart: \\"bjgvxnpl\\",
            height: \\"cctpw5f5\\",
            ':hover': {
              index__foo: \\"index__foo\\",
              background: \\"lq9oatf1\\"
            }
          }
        };
        function App() {
          return stylex(styles$2.bar, styles.foo, styles$1.baz);
        }

        export { App as default };
        "
      `);
    });
  });
});