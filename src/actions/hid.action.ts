import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { IHid, IKeyboard, IKeymaps } from '../services/hid/hid';
import { RootState, SetupPhase } from '../store/state';
import { AppActions, KeyboardsActions, NotificationActions } from './actions';
import { storageActionsThunk } from './storage.action';

export const HID_ACTIONS = '@Hid';
export const HID_CONNECT_KEYBOARD = `${HID_ACTIONS}/ConnectDevice`;
export const HID_DISCONNECT_KEYBOARD = `${HID_ACTIONS}/DisconnectDevice`;
export const HID_UPDATE_KEYBOARD = `${HID_ACTIONS}/UpdateKeyboard`;
export const HID_UPDATE_KEYBOARD_LAYER_COUNT = `${HID_ACTIONS}/UpdateKeyboardLayerCount`;
export const HID_UPDATE_KEYBOARD_LIST = `${HID_ACTIONS}/UpdateKeyboardList`;
export const HID_UPDATE_KEYMAPS = `${HID_ACTIONS}/UpdateKeymaps`;
export const HID_OPEN_KEYBOARD = `${HID_ACTIONS}/OpenKeyboard`;
const hidActions = {
  connectKeyboard: (keyboard: IKeyboard) => {
    return {
      type: HID_CONNECT_KEYBOARD,
      value: { keyboard: keyboard },
    };
  },

  disconnectKeyboard: (keyboard: IKeyboard) => {
    return {
      type: HID_DISCONNECT_KEYBOARD,
      value: { keyboard: keyboard },
    };
  },

  updateKeyboard: (keyboard: IKeyboard) => {
    return {
      type: HID_UPDATE_KEYBOARD,
      value: { keyboard: keyboard },
    };
  },

  updateKeyboardLayerCount: (layerCount: number) => {
    return {
      type: HID_UPDATE_KEYBOARD_LAYER_COUNT,
      value: { layerCount: layerCount },
    };
  },

  updateKeyboardList: (keyboards: IKeyboard[]) => {
    return {
      type: HID_UPDATE_KEYBOARD_LIST,
      value: { keyboards: keyboards },
    };
  },

  updateKeymaps: (keymaps: IKeymaps[]) => {
    return {
      type: HID_UPDATE_KEYMAPS,
      value: { keymaps: keymaps },
    };
  },
};

type ActionTypes = ReturnType<
  | typeof hidActions[keyof typeof hidActions]
  | typeof KeyboardsActions[keyof typeof KeyboardsActions]
  | typeof NotificationActions[keyof typeof NotificationActions]
  | typeof AppActions[keyof typeof AppActions]
>;
type ThunkPromiseAction<T> = ThunkAction<
  Promise<T>,
  RootState,
  undefined,
  ActionTypes
>;
export const hidActionsThunk = {
  connectAnotherKeyboard: (): ThunkPromiseAction<void> => async (
    dispatch: ThunkDispatch<RootState, undefined, ActionTypes>,
    getState: () => RootState
  ) => {
    const { hid, entities } = getState();
    const keyboards: IKeyboard[] = entities.keyboards;

    const result = await hid.instance.connect();
    if (!result.success) {
      // no selected device
      dispatch(AppActions.updateSetupPhase(SetupPhase.keyboardNotSelected));
      return;
    }
    const keyboard: IKeyboard = result.keyboard!;

    // Opened keyboard MUST had been authorized
    if (keyboard.isOpened()) {
      /**
       * If the connected device has opened by this app, do nothing.
       * We should NOT do something except showing a message if another application has opened the device.
       */
      const listedKbd = keyboards.find((kbd) => kbd.isSameDevice(keyboard));
      if (listedKbd) {
        dispatch(AppActions.updateSetupPhase(SetupPhase.openedKeyboard));
        return;
      }

      const msg = 'This device has already opened by another application';
      console.log(msg);
      dispatch(NotificationActions.addWarn(msg));
      return;
    }

    /**
     * If the connected device has already included in state, use the keyboard object in state in order not to effect the keyboard list state.
     * Unless the connected device has included in state, use it and add to the keyboard list in state.
     */

    const listedKbd = keyboards.find((kbd) => kbd.isSameDevice(keyboard));
    const targetKbd = listedKbd ? listedKbd : keyboard;
    if (!listedKbd) {
      dispatch(hidActions.updateKeyboardList([...keyboards, keyboard]));
    }

    dispatch(hidActions.updateKeyboard(targetKbd));
    const keyboardInfo = keyboard.getInformation();
    dispatch(
      AppActions.updateSetupPhase(SetupPhase.fetchingKeyboardDefinition)
    );
    dispatch(
      storageActionsThunk.fetchKeyboardDefinition(
        keyboardInfo.vendorId,
        keyboardInfo.productId
      )
    );
  },

  connectKeyboard: (keyboard: IKeyboard): ThunkPromiseAction<void> => async (
    dispatch: ThunkDispatch<RootState, undefined, ActionTypes>,
    getState: () => RootState
  ) => {
    const { entities, hid, storage } = getState();
    const keyboards: IKeyboard[] = entities.keyboards;

    if (keyboard.isOpened()) {
      /**
       * If this keyboard is opening by this app, do nothing.
       * If this keyboard is NOT opened by this app, show warning message.
       */
      if (entities.keyboard?.isSameDevice(keyboard)) {
        dispatch(AppActions.updateSetupPhase(SetupPhase.openedKeyboard));
        return; // do nothing
      }

      const msg = 'This device has already opened by another application';
      console.log(msg);
      dispatch(NotificationActions.addWarn(msg));
      return;
    }

    const listedKbd = keyboards.find((kbd) => kbd.isSameDevice(keyboard));
    const targetKbd = listedKbd ? listedKbd : keyboard;
    if (!listedKbd) {
      dispatch(hidActions.updateKeyboardList([...keyboards, keyboard]));
    }

    dispatch(hidActions.updateKeyboard(targetKbd));
    const keyboardInfo = keyboard.getInformation();
    dispatch(
      AppActions.updateSetupPhase(SetupPhase.fetchingKeyboardDefinition)
    );
    dispatch(
      storageActionsThunk.fetchKeyboardDefinition(
        keyboardInfo.vendorId,
        keyboardInfo.productId
      )
    );
  },

  openKeyboard: (): ThunkPromiseAction<void> => async (
    dispatch: ThunkDispatch<RootState, undefined, ActionTypes>,
    getState: () => RootState
  ) => {
    const { entities } = getState();
    const keyboard = entities.keyboard!;
    const result = await keyboard.open();
    if (!result.success) {
      console.error('Could not open');
      dispatch(NotificationActions.addError('Could not open'));
      return;
    }
    await initOpenedKeyboard(
      dispatch,
      keyboard,
      entities.keyboardDefinition.matrix.rows,
      entities.keyboardDefinition.matrix.cols
    );
    dispatch(AppActions.updateSetupPhase(SetupPhase.openedKeyboard));
  },

  updateAuthorizedKeyboardList: (): ThunkPromiseAction<void> => async (
    dispatch: ThunkDispatch<RootState, undefined, ActionTypes>,
    getState: () => RootState
  ) => {
    const { hid } = getState();
    const keyboards: IKeyboard[] = await getAuthorizedKeyboard(hid.instance);
    dispatch(hidActions.updateKeyboardList(keyboards));
  },
};

const getAuthorizedKeyboard = async (hid: IHid): Promise<IKeyboard[]> => {
  const keyboards: IKeyboard[] = await hid.detectKeyboards();
  return keyboards;
};

const initOpenedKeyboard = async (
  dispatch: ThunkDispatch<RootState, undefined, ActionTypes>,
  keyboard: IKeyboard,
  rowCount: number,
  columnCount: number
) => {
  const layerResult = await keyboard.fetchLayerCount();
  if (!layerResult.success) {
    // TODO:show error message
    console.log(layerResult);
    return;
  }

  const layerCount = layerResult.layerCount!;
  const keymaps: IKeymaps[] = [];
  for (let i = 0; i < layerCount; i++) {
    const keymapsResult = await keyboard.fetchKeymaps(i, rowCount, columnCount);
    if (!keymapsResult.success) {
      // TODO: show error message
      console.log(keymapsResult);
      return;
    }
    keymaps.push(keymapsResult.keymap!);
  }

  dispatch(hidActions.updateKeyboardLayerCount(layerCount));
  dispatch(hidActions.updateKeymaps(keymaps));
  dispatch(AppActions.remapsInit(layerCount));
  dispatch(KeyboardsActions.updateSelectedLayer(0)); // initial selected layer
  dispatch(hidActions.updateKeyboard(keyboard));
};