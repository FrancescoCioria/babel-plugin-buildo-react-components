const defaultImports = {
  BackgroundDimmer: 'background-dimmer/BackgroundDimmer',
  Badge: 'badge/Badge',
  BasicModal: 'modal-manager/BasicModal',
  Button: 'button/Button',
  ConfirmationInput: 'confirmation-input/ConfirmationInput',
  Divider: 'Divider/Divider',
  Dropdown: 'dropdown/Dropdown',
  DropdownMenu: 'DropdownMenu/DropdownMenu',
  FlexView: 'flex/FlexView',
  FlexCell: 'flex/FlexCell',
  Icon: 'Icon/Icon',
  LoadingSpinner: 'loading-spinner/LoadingSpinner',
  Menu: 'DropdownMenu/Menu',
  MobileDetector: 'mobile-detector/MobileDetector',
  ModalManager: 'modal-manager/ModalManager',
  MoreOrLess: 'more-or-less/MoreOrLess',
  NavBar: 'nav-bar/NavBar',
  Panel: 'Panel/Panel',
  PanelHeader: 'Panel/PanelHeader',
  PanelMenu: 'Panel/PanelMenu',
  Popover: 'popover/Popover',
  ScrollView: 'scroll/ScrollView',
  TabbedPanel: 'Panel/TabbedPanel',
  TextOverflow: 'text-overflow/TextOverflow',
  TimerToast: 'toaster/TimerToast',
  Toaster: 'toaster/Toaster',
  Toggle: 'toggle/Toggle',
  Tooltip: 'Tooltip/Tooltip',
  TransitionWrapper: 'transition-wrapper/TransitionWrapper'
};
const utils = {
  linkState: 'link-state',
  getValueLink: 'link-state',
  LinkedStateMixin: 'link-state',
  ValueLinkMixin: 'link-state'
};

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
            const path = ['buildo-react-components', 'src', folder].join('/');
            addImport(file, path, imported, local, isDefaultImport);
          });
        }
      },

      ImportDeclaration: {
        exit(node) {
          const value = node.source.value;
          if (value.indexOf('buildo-react-components') === -1) {
            return;
          }

          const _imports = node.specifiers.reduce((acc, s) => (
            {
              ...acc,
              importDefaultSpecifiers: acc.importDefaultSpecifiers.concat(t.isImportDefaultSpecifier(s) ? s : []),
              importSpecifiers: acc.importSpecifiers.concat(t.isImportSpecifier(s) ? s : [])
            }),
            { importDefaultSpecifiers: [], importSpecifiers: [] }
          );

          const { importDefaultSpecifiers, importSpecifiers } = _imports;
          if (importDefaultSpecifiers.length && (value === 'buildo-react-components' || value === 'buildo-react-components/lib' || value === 'buildo-react-components/src')) {
            throw new Error(`the import of whole buildo-react-components is forbidden`);
          }

          if (importSpecifiers.length) {
            importSpecifiers.forEach(s => imports.unshift({ local: s.local.name, imported: s.imported.name }));
          }

          // return
          if (importSpecifiers.length && importDefaultSpecifiers.length) {
            // remove non-default imports -> we'll replace them on Program.exit
            return {
              ...node,
              specifiers: importDefaultSpecifiers
            };
          } else if (!importDefaultSpecifiers.length) {
            // remove node -> we'll replace it on Program.exit
            this.dangerouslyRemove();
          }

        }
      }

    }
  });
}
