/* eslint-disable no-undef */
import React from 'react';
import './CreateDefinition.scss';
import {
  CreateKeyboardActionsType,
  CreateKeyboardStateType,
} from './CreateDefinition.container';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
} from '@material-ui/core';
import {
  IKeyboardDefinitionStatus,
  KeyboardDefinitionStatus,
} from '../../../services/storage/Storage';
import { KeyboardDefinitionFormPart } from '../../common/keyboarddefformpart/KeyboardDefinitionFormPart';
import { KeyboardDefinitionSchema } from '../../../gen/types/KeyboardDefinition';
import { AgreementCheckbox } from '../agreement/AgreementCheckbox';
import { FirmwareCodePlace, IFirmwareCodePlace } from '../../../store/state';
import {
  isForkedQmkFirmwareCode,
  isOtherFirmwareCode,
  isQmkFirmwareCode,
} from '../ValidationUtils';

type CreateKeyboardState = {
  openConfirmDialog: boolean;
  isSaveAsDraft: boolean;
};
type OwnProps = {};
type CreateKeyboardProps = OwnProps &
  Partial<CreateKeyboardActionsType> &
  Partial<CreateKeyboardStateType>;

const statusSteps: IKeyboardDefinitionStatus[] = [
  KeyboardDefinitionStatus.draft,
  KeyboardDefinitionStatus.in_review,
  KeyboardDefinitionStatus.approved,
];

export default class CreateDefinition extends React.Component<
  CreateKeyboardProps,
  CreateKeyboardState
> {
  private refInputProductName: React.RefObject<HTMLInputElement>;
  constructor(props: CreateKeyboardProps | Readonly<CreateKeyboardProps>) {
    super(props);
    this.state = {
      openConfirmDialog: false,
      isSaveAsDraft: true,
    };
    this.refInputProductName = React.createRef<HTMLInputElement>();
  }

  private onLoadFile(
    keyboardDefinition: KeyboardDefinitionSchema,
    jsonFilename: string,
    jsonStr: string
  ) {
    this.props.updateJsonFilename!(jsonFilename);
    this.props.updateKeyboardDefinition!(keyboardDefinition);
    this.props.updateJsonString!(jsonStr);
    // TextField(Product Name) is the only editable field.
    this.refInputProductName.current &&
      (this.refInputProductName.current as any).focus();
  }

  private isFilledInAllField(): boolean {
    return !!this.props.productName && !!this.props.keyboardDefinition;
  }

  private isFilledInAllFieldAndAgreed(): boolean {
    let isFilledEvidence: boolean = false;
    if (isQmkFirmwareCode(this.props.firmwareCodePlace)) {
      isFilledEvidence = !!this.props.qmkRepositoryFirstPullRequestUrl;
    } else if (isForkedQmkFirmwareCode(this.props.firmwareCodePlace)) {
      isFilledEvidence =
        !!this.props.forkedRepositoryUrl &&
        !!this.props.forkedRepositoryEvidence;
    } else if (isOtherFirmwareCode(this.props.firmwareCodePlace)) {
      isFilledEvidence =
        !!this.props.otherPlaceHowToGet &&
        !!this.props.otherPlaceSourceCodeEvidence &&
        !!this.props.otherPlacePublisherEvidence;
    }
    return (
      !!this.props.productName &&
      !!this.props.keyboardDefinition &&
      !!this.props.contactInformation &&
      this.props.agreement! &&
      isFilledEvidence
    );
  }

  handleBackButtonClick = () => {
    this.props.backToList!();
  };

  handleSaveAsDraftButtonClick = () => {
    this.setState({
      openConfirmDialog: true,
      isSaveAsDraft: true,
    });
  };

  handleSubmitForReviewButtonClick = () => {
    this.setState({
      openConfirmDialog: true,
      isSaveAsDraft: false,
    });
  };

  handleConfirmYesClick = () => {
    this.setState({
      openConfirmDialog: false,
      isSaveAsDraft: this.state.isSaveAsDraft,
    });
    if (this.state.isSaveAsDraft) {
      this.props.saveAsDraft!();
    } else {
      this.props.submitForReview!();
    }
  };

  handleConfirmNoClick = () => {
    this.setState({
      openConfirmDialog: false,
      isSaveAsDraft: this.state.isSaveAsDraft,
    });
  };

  render() {
    return (
      <React.Fragment>
        <div className="create-definition-wrapper">
          <div className="create-definition-container">
            <div className="create-definition-card">
              <Card>
                <CardContent>
                  <Button
                    style={{ marginRight: '16px' }}
                    onClick={this.handleBackButtonClick}
                  >
                    &lt; Keyboard List
                  </Button>
                  <Stepper>
                    {statusSteps.map((label) => {
                      const stepProps = {};
                      const labelProps = {};
                      return (
                        <Step key={label} {...stepProps}>
                          <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                      );
                    })}
                  </Stepper>
                  <div className="create-definition-form-container">
                    <div className="create-definition-upload-form">
                      <KeyboardDefinitionFormPart
                        messageHtml={`<span class="create-definition-upload-msg">Please import your file (.json)</b>`}
                        validateDeviceIds={false}
                        size="small"
                        onLoadFile={(kd, name, jsonStr) => {
                          this.onLoadFile(kd, name, jsonStr);
                        }}
                      />
                    </div>
                    <div className="create-definition-form">
                      <div className="create-definition-form-row">
                        <TextField
                          id="create-definition-json-filename"
                          label="JSON Filename"
                          variant="outlined"
                          value={this.props.jsonFilename}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </div>
                      <div className="create-definition-form-row">
                        <TextField
                          id="create-definition-name"
                          label="Name"
                          variant="outlined"
                          value={this.props.keyboardDefinition?.name || ''}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </div>
                      <div className="create-definition-form-row">
                        <TextField
                          id="create-definition-vendor_id"
                          label="Vendor ID"
                          variant="outlined"
                          value={this.props.keyboardDefinition?.vendorId || ''}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </div>
                      <div className="create-definition-form-row">
                        <TextField
                          id="create-definition-product_id"
                          label="Product ID"
                          variant="outlined"
                          value={this.props.keyboardDefinition?.productId || ''}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </div>
                      <div className="create-definition-form-row">
                        <TextField
                          inputRef={this.refInputProductName}
                          id="create-definition-product-name"
                          label="Product Name"
                          helperText="This is a Product Name specified by `#define PRODUCT [Product Name]` in the config.h file."
                          variant="outlined"
                          required={true}
                          value={this.props.productName}
                          onChange={(event) => {
                            this.props.updateProductName!(event.target.value);
                          }}
                          onFocus={(event) => {
                            event.target.select();
                          }}
                        />
                      </div>
                      <FirmwareCodePlaceForm
                        firmwareCodePlace={this.props.firmwareCodePlace}
                        updateFirmwareCodePlace={
                          this.props.updateFirmwareCodePlace!
                        }
                      />
                      <EvidenceForQmkRepositoryForm
                        firmwareCodePlace={this.props.firmwareCodePlace}
                        qmkRepositoryFirstPullRequestUrl={
                          this.props.qmkRepositoryFirstPullRequestUrl
                        }
                        updateQmkRepositoryFirstPullRequestUrl={
                          this.props.updateQmkRepositoryFirstPullRequestUrl!
                        }
                      />
                      <EvidenceForForkedRepositoryForm
                        firmwareCodePlace={this.props.firmwareCodePlace}
                        forkedRepositoryUrl={this.props.forkedRepositoryUrl}
                        updateForkedRepositoryUrl={
                          this.props.updateForkedRepositoryUrl!
                        }
                        forkedRepositoryEvidence={
                          this.props.forkedRepositoryEvidence
                        }
                        updateForkedRepositoryEvidence={
                          this.props.updateForkedRepositoryEvidence!
                        }
                      />
                      <EvidenceForOtherPlaceForm
                        firmwareCodePlace={this.props.firmwareCodePlace}
                        otherPlaceHowToGet={this.props.otherPlaceHowToGet}
                        updateOtherPlaceHowToGet={
                          this.props.updateOtherPlaceHowToGet!
                        }
                        otherPlaceSourceCodeEvidence={
                          this.props.otherPlaceSourceCodeEvidence
                        }
                        updateOtherPlaceSourceCodeEvidence={
                          this.props.updateOtherPlaceSourceCodeEvidence!
                        }
                        otherPlacePublisherEvidence={
                          this.props.otherPlacePublisherEvidence
                        }
                        updateOtherPlacePublisherEvidence={
                          this.props.updateOtherPlacePublisherEvidence!
                        }
                      />
                      <div className="create-definition-form-row">
                        <AgreementCheckbox
                          agreement={this.props.agreement!}
                          updateAgreement={this.props.updateAgreement!}
                        />
                      </div>
                      <div className="create-definition-form-row">
                        <TextField
                          id="create-definition-contact-information"
                          label="Contact Information"
                          variant="outlined"
                          multiline
                          rows={4}
                          helperText="Fill in your contact information. For example, your email address, Twitter ID, Facebook ID or such information which we can contact you certainly."
                          value={this.props.contactInformation || ''}
                          onChange={(e) =>
                            this.props.updateContactInformation!(e.target.value)
                          }
                        />
                      </div>
                      <div className="create-definition-form-buttons">
                        <Button
                          color="primary"
                          onClick={this.handleSaveAsDraftButtonClick}
                          disabled={!this.isFilledInAllField()}
                        >
                          Save as Draft
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={this.handleSubmitForReviewButtonClick}
                          disabled={!this.isFilledInAllFieldAndAgreed()}
                        >
                          Submit for Review
                        </Button>
                      </div>
                      <div className="create-definition-form-notice">
                        <p>
                          * You can submit the JSON file written by you only. Do
                          NOT infringe of the right of person who created the
                          original JSON file. We check whether you are valid
                          author of the keyboard you request in our review
                          process, but notice that we can&quot;t insure the
                          validity completely.
                        </p>
                        <p>
                          * We check whether the keyboard you request has a
                          unique combination of the Vendor ID, Product ID and
                          Product Name in our review process.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Dialog
          open={this.state.openConfirmDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {'Keyboard Registration'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {this.state.isSaveAsDraft
                ? 'Are you sure to save this new keyboard as draft?'
                : 'Are you sure to register and submit this new keyboard for review?'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.handleConfirmNoClick}>
              No
            </Button>
            <Button
              color="primary"
              autoFocus
              onClick={this.handleConfirmYesClick}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

type FirmwareCodePlaceFormProps = {
  firmwareCodePlace?: IFirmwareCodePlace;
  // eslint-disable-next-line no-unused-vars
  updateFirmwareCodePlace: (firmwareCodePlace: IFirmwareCodePlace) => void;
};

function FirmwareCodePlaceForm(props: FirmwareCodePlaceFormProps) {
  return (
    <div className="create-definition-form-row">
      <FormControl>
        <InputLabel id="create-definition-firmware-code-place">
          Where is the source code of this keyboard&apos;s firmware?
        </InputLabel>
        <Select
          labelId="create-definition-firmware-code-place"
          value={props.firmwareCodePlace}
          onChange={(e) =>
            props.updateFirmwareCodePlace(e.target.value as IFirmwareCodePlace)
          }
        >
          <MenuItem value={FirmwareCodePlace.qmk}>
            GitHub: qmk/qmk_firmware
          </MenuItem>
          <MenuItem value={FirmwareCodePlace.forked}>
            GitHub: Your forked repository from qmk/qmk_firmware
          </MenuItem>
          <MenuItem value={FirmwareCodePlace.other}>Other</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}

type EvidenceForQmkRepositoryFormProps = {
  firmwareCodePlace?: IFirmwareCodePlace;
  qmkRepositoryFirstPullRequestUrl?: string;
  updateQmkRepositoryFirstPullRequestUrl: (
    // eslint-disable-next-line no-unused-vars
    qmkRepositoryFirstPullRequest: string
  ) => void;
};

function EvidenceForQmkRepositoryForm(
  props: EvidenceForQmkRepositoryFormProps
) {
  if (props.firmwareCodePlace === FirmwareCodePlace.qmk) {
    return (
      <div className="create-definition-form-row">
        <TextField
          id="create-definition-qmk-repository-pull-request-url"
          label="1st Pull Request URL"
          variant="outlined"
          helperText="Fill in the URL of 1st Pull Request to the QMK Firmware repository which you submitted for this keyboard. This information will be confirmed by reviewers."
          value={props.qmkRepositoryFirstPullRequestUrl || ''}
          onChange={(e) =>
            props.updateQmkRepositoryFirstPullRequestUrl(e.target.value)
          }
        />
      </div>
    );
  } else {
    return null;
  }
}

type EvidenceForForkedRepositoryFormProps = {
  firmwareCodePlace?: IFirmwareCodePlace;
  forkedRepositoryUrl?: string;
  // eslint-disable-next-line no-unused-vars
  updateForkedRepositoryUrl: (forkedRepositoryUrl: string) => void;
  forkedRepositoryEvidence?: string;
  // eslint-disable-next-line no-unused-vars
  updateForkedRepositoryEvidence: (forkedRepositoryEvidence: string) => void;
};

function EvidenceForForkedRepositoryForm(
  props: EvidenceForForkedRepositoryFormProps
) {
  if (props.firmwareCodePlace === FirmwareCodePlace.forked) {
    return (
      <React.Fragment>
        <div className="create-definition-form-row">
          <TextField
            id="create-definition-forked-repository-url"
            label="Forked Repository URL"
            variant="outlined"
            value={props.forkedRepositoryUrl || ''}
            onChange={(e) => props.updateForkedRepositoryUrl(e.target.value)}
          />
        </div>
        <div className="create-definition-form-row">
          <TextField
            id="create-definition-forked-repository-evidence"
            label="Evidence Information"
            variant="outlined"
            multiline
            rows={4}
            helperText="Fill in the information to evidence whether the forked repository is the original and authentic firmware. This information will be confirmed by reviewers."
            value={props.forkedRepositoryEvidence || ''}
            onChange={(e) =>
              props.updateForkedRepositoryEvidence(e.target.value)
            }
          />
        </div>
      </React.Fragment>
    );
  } else {
    return null;
  }
}

type EvidenceForOtherPlaceFormProps = {
  firmwareCodePlace?: IFirmwareCodePlace;
  otherPlaceHowToGet?: string;
  // eslint-disable-next-line no-unused-vars
  updateOtherPlaceHowToGet: (otherPlaceHowToGet: string) => void;
  otherPlaceSourceCodeEvidence?: string;
  updateOtherPlaceSourceCodeEvidence: (
    // eslint-disable-next-line no-unused-vars
    otherPlaceSourceCodeEvidence: string
  ) => void;
  otherPlacePublisherEvidence?: string;
  updateOtherPlacePublisherEvidence: (
    // eslint-disable-next-line no-unused-vars
    otherPlacePublisherEvidence: string
  ) => void;
};

function EvidenceForOtherPlaceForm(props: EvidenceForOtherPlaceFormProps) {
  if (props.firmwareCodePlace === FirmwareCodePlace.other) {
    return (
      <React.Fragment>
        <div className="create-definition-form-row">
          <TextField
            id="create-definition-other-place-how-to-get"
            label="How to Get the Source Code"
            variant="outlined"
            multiline
            rows={4}
            helperText="Fill in how to get the source code of this keyboard's firmware."
            value={props.otherPlaceHowToGet || ''}
            onChange={(e) => props.updateOtherPlaceHowToGet(e.target.value)}
          />
        </div>
        <div className="create-definition-form-row">
          <TextField
            id="create-definition-other-place-source-code-evidence"
            label="Evidence Information for Source Code"
            variant="outlined"
            multiline
            rows={4}
            helperText="Fill in the information to evidence whether the source code is the original and authentic firmware. This information will be confirmed by reviewers."
            value={props.otherPlaceSourceCodeEvidence || ''}
            onChange={(e) =>
              props.updateOtherPlaceSourceCodeEvidence(e.target.value)
            }
          />
        </div>
        <div className="create-definition-form-row">
          <TextField
            id="create-definition-other-place-publisher-evidence"
            label="Evidence Information for Publisher"
            variant="outlined"
            multiline
            rows={4}
            helperText="Fill in the information to evidence whether you are the publisher of the source code of the keyboard's firmware. This information will be confirmed by reviewers."
            value={props.otherPlacePublisherEvidence || ''}
            onChange={(e) =>
              props.updateOtherPlacePublisherEvidence(e.target.value)
            }
          />
        </div>
      </React.Fragment>
    );
  } else {
    return null;
  }
}
