import { defaultImports, utils } from 'buildo-react-components/src/babel-plugin';

let imports;

export default function ({ Plugin, types: t }) {

  function addImport(file, source, imported, name, isDefaultImport) {
    const _source = file.resolveModuleSource(source);

    let specifiers;
    if (isDefaultImport) {
      specifiers = [t.importDefaultSpecifier(t.identifier(name))];
    } else {
      specifiers = [t.importSpecifier(t.identifier(name), t.identifier(imported))];
    }
    const declar = t.importDeclaration(specifiers, t.literal(_source));
    declar._blockHoist = 3;

    // prepend import to file body
    file.path.unshiftContainer('body', declar);
  }

  return new Plugin('buildo-react-components', {
    visitor: {

      Program: {
        enter() {
          // clear global state
          imports = [];
        },
        exit(node, parent, scope, file) {
          if (!t.isProgram(node)) {
            return;
          }

          imports.forEach(({ local, imported }) => {
            if (!defaultImports[imported] && !utils[imported]) {
              throw new Error(`${imported} is not a valid export of buildo-react-components`);
            }
            const isDefaultImport = !!defaultImports[imported];
            const folder = isDefaultImport ? defaultImports[imported] : utils[imported];
            const path = ['buildo-react-components', 'lib', folder].join('/');
            addImport(file, path, imported, local, isDefaultImport);
          });
        }
      },

      ImportDeclaration: {
        exit(node) {
          if (node.source.value.indexOf('buildo-react-components') === -1) {
            return;
          }

          const importSpecifiers = node.specifiers.filter(t.isImportSpecifier);
          if (importSpecifiers.length) {
            importSpecifiers.forEach(s => imports.unshift({ local: s.local.name, imported: s.imported.name }));
            // remove node -> we'll replace it on Program.exit with the correct one
            this.dangerouslyRemove();
          }

        }
      }

    }
  });
}
