/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+jsinfra
 * @format
 */

'use strict';

jest.disableAutomock();

const ESLintTester = require('../eslint-tester');
const rule = require('../stylex-valid-styles');
const eslintTester = new ESLintTester();

eslintTester.run('stylex-valid-styles', rule, {
  valid: [
    // test for local static variables
    `
     const start = 'start';
     const styles = stylex.create({
       default: {
         ...stylex.absoluteFill,
         textAlign: start,
         MozOsxFontSmoothing: 'grayscale',
         WebkitFontSmoothing: 'antialiased',
         transitionProperty: 'opacity, transform',
         transitionDuration: '0.3s',
         transitionTimingFunction: 'ease',
       }
     });`,
    // test for nested styles
    `
     const styles = stylex.create({
       default: {
         opacity: 0,
         ':hover': {
           opacity: 1
         },
         ':focus-visible': {
           border: "1px solid blue"
         }
       }
     });`,
    `
     const styles = stylex.create({
       default: {
         width: '50%',
         '@media (max-width: 600px)': {
           width: '100%',
         }
       }
     });`,
    // test for positive numbers
    'stylex.create({default: {marginStart: 5}});',
    // test for literals as namespaces
    'stylex.create({"default-1": {marginStart: 5}});',
    'stylex.create({["default-1"]: {marginStart: 5}});',
    // test for numbers as namespaces
    'stylex.create({0: {marginStart: 5}});',
    // test for computed numbers as namespaces
    'stylex.create({[0]: {marginStart: 5}});',
    // test for negative values.
    'stylex.create({default: {marginStart: -5}});',
    "stylex.create({default: {textAlign: 'start'}});",
    // test for presets
    `stylex.create({
       default: {
         ...stylex.absoluteFill,
         textAlign: 'start',
       }
     });`,
    // test for Math
    `stylex.create({
       default: {
         marginStart: Math.abs(-1),
         marginEnd: \`\${Math.floor(5 / 2)}px\`,
         paddingStart: Math.ceil(5 / 2),
         paddingEnd: Math.round(5 / 2),
       },
     })`,
    `
     const x = 5;
     stylex.create({
       default: {
         marginStart: Math.abs(x),
         marginEnd: \`\${Math.floor(x)}px\`,
         paddingStart: Math.ceil(-x),
         paddingEnd: Math.round(x / 2),
       },
     })`,
    // test for Search
    `
     stylex.create({
       default: {
         'WebkitAppearance': 'textfield',
         '::-webkit-search-decoration': {
           appearance: 'none',
         },
         '::-webkit-search-cancel-button': {
           appearance: 'none',
         },
         '::-webkit-search-results-button': {
           appearance: 'none',
         },
         '::-webkit-search-results-decoration': {
           appearance: 'none',
         },
       },
     })`,
  ],
  invalid: [
    {
      code: "stylex.create({default: {textAlin: 'left'}});",
      errors: [
        {
          message: 'This is not a key that is allowed by stylex',
        },
      ],
    },
    {
      code: "stylex.create({default: {transition: 'all 0.3s ease'}});",
      errors: [
        {
          message: 'This is not a key that is allowed by stylex',
        },
      ],
    },
    {
      code: "stylex.create({default: {textAlign: 'lfet'}});",
      errors: [
        {
          message: 'This is not a valid value that can be used for textAlign',
        },
      ],
    },
    {
      code: "stylex.create({default: {transitionProperty: 'all'}});",
      errors: [
        {
          message:
            'This is not a valid value that can be used for transitionProperty',
        },
      ],
    },
    {
      code: "stylex.create({default: {transitionProperty: 'height'}});",
      errors: [
        {
          message:
            'This is not a valid value that can be used for transitionProperty',
        },
      ],
    },
    {
      code: "stylex.create({default: {':hover': {textAlin: 'left'}}});",
      errors: [
        {
          message: 'This is not a key that is allowed by stylex',
        },
      ],
    },
    {
      code: "stylex.create({default: {':focus': {textAlign: 'lfet'}}});",
      errors: [
        {
          message: 'This is not a valid value that can be used for textAlign',
        },
      ],
    },
    {
      code: `
         stylex.create({
           default: {
             ':focs': {
               textAlign: 'left'
             }
           }
         });
       `,
      errors: [
        {
          message:
            'Nested styles can only be used for the pseudo selectors in the stylex allowlist and for @media queries',
        },
      ],
    },
    {
      code: `
         stylex.create({
           default: {
             ':focus': {
               ':hover': {
                 textAlign: 'left'
               }
             }
           }
         });
       `,
      errors: [
        {
          message: 'You cannot nest styles more than one level deep',
        },
      ],
    },
  ],
});