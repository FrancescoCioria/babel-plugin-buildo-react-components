> Babel plugin to avoid cherry-pick imports from [buildo-react-components](https://github.com/buildo/react-components)

You can finally import **named exports** from `buildo-react-components` using ES6 destructuring without worrying about your bundle size!

```js
// before
import Popover from 'buildo-react-components/src/popover/Popover';
import FlexView from 'buildo-react-components/src/flex/FlexView';

// now
import { Popover, FlexView } from 'buildo-react-components';
```

## How to use
Install with `npm`

`npm i --save-dev babel-plugin-buildo-react-components`

add "buildo-react-components" in your `.babelrc`
```js
{
  plugins: ["buildo-react-components"]
}
```
or, if you're calling `babel` from the command line
```
babel --plugins=buildo-react-components
```
## Caveats
imports from the `/lib` folder are not supported yet so you must include `/buildo-react-components/` in `webpack`

## How it works

**destructured imports are safely transformed**
```js
// your code
import { FlexView as Flex, Popover } from 'buildo-react-components';

// after transformation
import Flex from 'buildo-react-components/src/flex/FlexView';
import Popover from 'buildo-react-components/src/popover/Popover';
```

**default imports are left untouched**
```js
// your code
import TextOverflow from 'buildo-react-components/src/text-overflow';

// left untouched
import TextOverflow from 'buildo-react-components/src/text-overflow';
```

**you can mix any kind of import together**
```js
// your code
import flex, { FlexView as _FlexView, FlexCell } from 'buildo-react-components/src/flex';

// after transformation
import flex from 'buildo-react-components/src/flex';
import _FlexView from 'buildo-react-components/src/flex/FlexView';
import FlexCell from 'buildo-react-components/src/flex/FlexCell';
```

**link-state functions are safely transformed too**
```js
// your code
import { linkState, getValueLink } from 'buildo-react-components';

// after transformation
import { linkState, getValueLink } from 'buildo-react-components/src/link-state';
```
