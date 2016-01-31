const components = {
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

const imports = [];

export default function ({ Plugin, types: t }) {

  function addImport(file, source, imported, name, isDefault) {
    const _source = file.resolveModuleSource(source);

    let specifiers;
    if (isDefault) {
      specifiers = [t.importDefaultSpecifier(t.identifier(name))];
    } else {
      specifiers = [t.importSpecifier(t.identifier(name), t.identifier(imported))];
    }
    const declar = t.importDeclaration(specifiers, t.literal(_source));
    declar._blockHoist = 3;

    file.path.unshiftContainer('body', declar);
  }

  return new Plugin('buildo-react-components', {
    visitor: {

      Program: {

        exit (node, parent, scope, file) {
          if (!t.isProgram(node)) {
            return;
          }

          imports.forEach(({ local, imported }) => {
            if (!components[imported] && !utils[imported]) {
              throw new Error(`${imported} is not a valid export of buildo-react-components`);
            }
            const isDefault = !!components[imported];
            const folder = isDefault ? components[imported] : utils[imported];
            const path = ['buildo-react-components', 'lib', folder].join('/');
            addImport(file, path, imported, local, isDefault);
          });

        }
      },

      ImportDeclaration: {
        exit (node) {

          if (node.source.value.indexOf('buildo-react-components') === -1) {
            return;
          }

          const importSpecifiers = node.specifiers.filter(t.isImportSpecifier);
          if (importSpecifiers.length) {
            importSpecifiers.forEach(s => imports.unshift({ local: s.local.name, imported: s.imported.name }));
            this.dangerouslyRemove();
          }

        }
      }

    }
  });
}
