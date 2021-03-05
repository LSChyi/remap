import { connect } from 'react-redux';
import ConfigurationDialog from './ConfigurationDialog';
import { RootState } from '../../../store/state';
import { storageActionsThunk } from '../../../actions/storage.action';
import { KeyboardDefinitionSchema } from '../../../gen/types/KeyboardDefinition';

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state: RootState) => {
  return {};
};
export type ConfigurationDialogStateType = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (_dispatch: any) => {
  return {
    refreshKeyboardDefinition: (
      keyboardDefinition: KeyboardDefinitionSchema
    ) => {
      _dispatch(
        storageActionsThunk.refreshKeyboardDefinition(keyboardDefinition)
      );
    },
  };
};

export type ConfigurationDialogActionsType = ReturnType<
  typeof mapDispatchToProps
>;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfigurationDialog);
