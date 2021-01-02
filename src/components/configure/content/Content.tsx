import React from 'react';
import './Content.scss';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Keycodes from '../keycodes/Keycodes.container';
import Keymap from '../keymap/Keymap';
import { ContentActionsType, ContentStateType } from './Content.container';
import NoKeyboard from '../nokeyboard/NoKeyboard';
import KeyboardList from '../keyboardlist/KeyboardList.container';
import { IKeyboard } from '../../../services/hid/hid';

type ContentState = {
  selectedLayer: number;
};

type OwnProps = {};

type ContentProps = OwnProps &
  Partial<ContentActionsType> &
  Partial<ContentStateType>;

export default class Content extends React.Component<
  ContentProps,
  ContentState
> {
  constructor(props: ContentProps | Readonly<ContentProps>) {
    super(props);
    this.state = {
      //TODO: redux
      selectedLayer: 1,
    };
  }

  get selectedLayer() {
    return this.state.selectedLayer;
  }

  onClickLayer = (layer: number) => {
    this.setState({ selectedLayer: layer });
  };

  render() {
    return (
      <div className="content">
        {this.props.openedKeyboard ? (
          <div className="controller">
            <div className="switch">
              <Select
                id="keyboard-layout-switch"
                value={'Choc'}
                onChange={() => {}}
              >
                <MenuItem value="MX">MX</MenuItem>
                <MenuItem value="Choc">Choc</MenuItem>
              </Select>
            </div>
          </div>
        ) : (
          ''
        )}
        <div className="keymap">
          <ConnectedKeyboard
            openedKeyboard={this.props.openedKeyboard!}
            keyboards={this.props.keyboards || []}
          />
        </div>
        <div className="keycode">
          <Keycodes />
          {this.props.openedKeyboard ? '' : <div className="disable"></div>}
        </div>
      </div>
    );
  }
}

type ConnectedKeyboardProps = {
  openedKeyboard: IKeyboard;
  keyboards: IKeyboard[];
};
function ConnectedKeyboard(props: ConnectedKeyboardProps) {
  if (props.openedKeyboard) {
    return <Keymap />;
  } else {
    if (0 < props.keyboards.length) {
      return <KeyboardList />;
    } else {
      return <NoKeyboard />;
    }
  }
}
