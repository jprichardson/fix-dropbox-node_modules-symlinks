fix-dropbox-node_modules-symlinks
=================================

Fix Dropbox `node_modules/.bin/` symlinks.


Install
-------

    npm install -g fix-dropbox-node_modules-symlinks


What? Why?
----------

If you keep your Node.js projects in Dropbox, you're gonna have issues when it syncs. Particularly,
when any dependency that you install into your `node_modules` has a corresponding `bin` that it places
in `./node_modules/.bin`. Dropbox dereferences symlinks. So on one machine, you have a symlink, and
all the rest, you have actual dereferenced files that don't work.


Usage
-----

```

  fix-dropbox-node_modules-symlinks@0.1.0

    Run on project source directory with package.json and node_modules.

    options:

      --overwrite Overwrite existing symlinks.

```


License
-------

Copyright (c) JP Richardson
