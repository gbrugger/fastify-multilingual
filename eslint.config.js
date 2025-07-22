'use strict';

import neostandard from 'neostandard';

export default neostandard({
  ts: true,
  env: ['node',],
  semi: true,
  ignores: neostandard.resolveIgnoresFromGitignore(),
});
