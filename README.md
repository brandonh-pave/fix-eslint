Helper script thingy to fix eslint issues.

Install:

```
git clone git@github.com:brandonh-pave/fix-eslint.git
cd fix-eslint
npm i
```

Add to .bashrc:

```bash
# change these
export FIX_ESLINT_FRONTEND_PATH='/Users/brandonhsiao/frontend'
export FIX_ESLINT_PATH='/Users/brandonhsiao/fix-eslint'

pave-fix-eslint() {
    pushd $FIX_ESLINT_PATH
    npm start
    popd
}
```

Run `pave-fix-eslint` any time after a rebase, `git checkout .`, etc.
