/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

jest.autoMockOff();

import { transformSync } from '@babel/core';
import { messages } from '@stylexjs/shared';
import stylexPlugin from '../src/index';

function transform(source: string, opts: { [key: string]: any } = {}) {
  return transformSync(source, {
    filename: opts.filename || 'TestTheme.stylex.js',
    parserOpts: {
      flow: {
        all: true,
      },
    } as any,
    plugins: [
      [
        stylexPlugin,
        {
          stylexSheetName: '<>',
          unstable_moduleResolution: { type: 'haste' },
          ...opts,
        },
      ],
    ],
  });
}

describe('@stylexjs/babel-plugin', () => {
  /**
   * stylex.unstable_overrideVars
   */

  describe('[validation] stylex.unstable_overrideVars()', () => {
    test('must be bound to a variable', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          stylex.unstable_overrideVars({__themeName__: 'x568ih9'}, {});
          `);
      }).toThrow(messages.UNBOUND_STYLEX_CALL_VALUE);
    });

    test('it must have two arguments', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const variables = stylex.unstable_overrideVars();
          `);
      }).toThrow(messages.ILLEGAL_ARGUMENT_LENGTH);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const variables = stylex.unstable_overrideVars({});
          `);
      }).toThrow(messages.ILLEGAL_ARGUMENT_LENGTH);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const variables = stylex.unstable_overrideVars(genStyles(), {});
          `);
      }).toThrow(messages.NON_STATIC_VALUE);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const variables = stylex.unstable_overrideVars({}, {});
          `);
      }).toThrow(
        'Can only override variables theme created with stylex.unstable_createVars().'
      );
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const variables = stylex.unstable_overrideVars({__themeName__: 'x568ih9'}, genStyles());
          `);
      }).toThrow(messages.NON_OBJECT_FOR_STYLEX_CALL);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const variables = stylex.unstable_overrideVars({__themeName__: 'x568ih9'}, {});
          `);
      }).not.toThrow();
    });

    /* Properties */

    test('variable keys must be a static value', () => {
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const variables = stylex.unstable_overrideVars(
            {__themeName__: 'x568ih9', labelColor: 'var(--labelColorHash)'},
            {[labelColor]: 'red',});
          `);
      }).toThrow(messages.NON_STATIC_VALUE);
    });

    /* Values */

    test('values must be static number or string in stylex.unstable_overrideVars()', () => {
      // number
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const variables = stylex.unstable_overrideVars(
            {__themeName__: 'x568ih9', cornerRadius: 'var(--cornerRadiusHash)'},
            {cornerRadius: 5,}
          );
          `);
      }).not.toThrow();
      // string
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const variables = stylex.unstable_overrideVars(
            {__themeName__: 'x568ih9', labelColor: 'var(--labelColorHash)'},
            {labelColor: 'red',}
          );
          `);
      }).not.toThrow();
      // not static
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const variables = stylex.unstable_overrideVars(
            {__themeName__: 'x568ih9', labelColor: 'var(--labelColorHash)'},
            {labelColor: labelColor,}
          );
          `);
      }).toThrow(messages.NON_STATIC_VALUE);
      expect(() => {
        transform(`
          import stylex from 'stylex';
          const variables = stylex.unstable_overrideVars(
            {__themeName__: 'x568ih9', labelColor: 'var(--labelColorHash)'},
            {labelColor: labelColor(),}
          );
          `);
      }).toThrow(messages.NON_STATIC_VALUE);
    });
  });
});