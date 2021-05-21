import { gql, useMutation } from "@apollo/client";
import React, { useCallback, useRef } from "react";
import BottomSheetBehavior from "reanimated-bottom-sheet";
import { Mutation } from "../../graphql/schema";
import { rigForm, snackbarActions, useAppDispatch, useAppSelector } from "../../redux";
import RigForm from "../forms/rig/RigForm";
import DialogOrSheet from "../layout/DialogOrSheet";
interface IRigDialog {
  open?: boolean;
  dropzoneId?: number;
  userId?: number;
  onClose(): void;
  onSuccess(): void;
}

const MUTATION_CREATE_RIG = gql`
  mutation CreateRig(
    $make: String,
    $model: String,
    $serial: String,
    $rigType: String,
    $canopySize: Int,
    $repackExpiresAt: Int
    $userId: Int
    $dropzoneId: Int
  ) {
    createRig(
      input: {
        attributes: {
          make: $make
          model: $model
          serial: $serial
          repackExpiresAt: $repackExpiresAt
          dropzoneId: $dropzoneId
          userId: $userId
          canopySize: $canopySize
          rigType: $rigType
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      rig {
        id
        make
        model
        serial
        canopySize
        repackExpiresAt
        packValue
        maintainedAt
        rigType

        user {
          id
          rigs {
            id
            make
            model
            serial
            canopySize
            repackExpiresAt
            packValue
            maintainedAt
          }
        }
      }
    }
  }
`;

const MUTATION_UPDATE_RIG = gql`
  mutation UpdateRig(
    $id: Int!
    $make: String,
    $model: String,
    $serial: String,
    $rigType: String,
    $canopySize: Int,
    $repackExpiresAt: Int
    $userId: Int
    $dropzoneId: Int
  ) {
    updateRig(
      input: {
        id: $id,
        attributes: {
          make: $make
          model: $model
          serial: $serial
          repackExpiresAt: $repackExpiresAt
          dropzoneId: $dropzoneId
          userId: $userId
          canopySize: $canopySize
          rigType: $rigType
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      rig {
        id
        make
        model
        serial
        canopySize
        repackExpiresAt
        packValue
        maintainedAt
        rigType

        user {
          id
          rigs {
            id
            make
            model
            serial
            canopySize
            repackExpiresAt
            packValue
            maintainedAt
          }
        }
      }
    }
  }
`;

export default function RigDialog(props: IRigDialog) {
  const { open, onClose, userId, dropzoneId } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.rigForm);
  const globalState = useAppSelector(state => state.global);
  const [mutationCreateRig, createData] = useMutation<Mutation>(MUTATION_CREATE_RIG);
  const [mutationUpdateRig, updateData] = useMutation<Mutation>(MUTATION_UPDATE_RIG);

  const isLoading = createData.loading || updateData.loading;
  const validate = useCallback(() => {
    let hasErrors = false;
    if (!state.fields.make.value) {
      hasErrors = true;
      dispatch(
        rigForm.setFieldError(["make", "Required"])
      );
    }

    if (!state.fields.model.value) {
      hasErrors = true;
      dispatch(
        rigForm.setFieldError(["model", "Required"])
      );
    }

    if (!state.fields.serial.value) {
      hasErrors = true;
      dispatch(
        rigForm.setFieldError(["serial", "Required"])
      );
    }

    if (!state.fields.canopySize.value) {
      hasErrors = true;
      dispatch(
        rigForm.setFieldError(["canopySize", "Required"])
      );
    }

    if (!state.fields.repackExpiresAt.value) {
      hasErrors = true;
      dispatch(
        rigForm.setFieldError(["repackExpiresAt", "You must select a repack date in the future"])
      );
    }

    return !hasErrors;
  }, [JSON.stringify(state.fields)]);
  
  const onSave = useCallback(async () => {

    if (!validate()) {
      return;
    }
    try {
      const mutation = state.original?.id ? mutationUpdateRig : mutationCreateRig;
      const response = await mutation({
        variables: {
          ...state.original?.id ? { id: Number(state.original?.id) } : {},
          make: state.fields.make.value,
          model: state.fields.model.value,
          serial: state.fields.serial.value,
          canopySize: state.fields.canopySize.value,
          rigType: state.fields.rigType.value,
          repackExpiresAt: state.fields.repackExpiresAt.value,
          userId: props.userId ? Number(props.userId) : null,
          dropzoneId: props.dropzoneId ? Number(props.dropzoneId) : null,
        }
      });
      const result = state.original?.id ? response.data?.updateRig : response.data?.createRig;

      result?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case "make":
            return dispatch(rigForm.setFieldError(["make", message]));
          case "model":
            return dispatch(rigForm.setFieldError(["model", message]));
          case "serial":
            return dispatch(rigForm.setFieldError(["serial", message]));
          case "canopy_size":
            return dispatch(rigForm.setFieldError(["canopySize", message]));
          case "repack_expires_at":
            return dispatch(rigForm.setFieldError(["repackExpiresAt", message]));
          case "rig_type":
            return dispatch(rigForm.setFieldError(["rigType", message]));
        }
      });
      if (result?.errors?.length) {
        return dispatch(snackbarActions.showSnackbar({ message: result?.errors[0], variant: "error" }));
      }
      if (!result?.fieldErrors?.length) {
        props.onSuccess();
      }

    } catch(error) {
      dispatch(snackbarActions.showSnackbar({ message: error.message, variant: "error" }));
    } 
  }, [JSON.stringify(state.fields), mutationCreateRig, mutationUpdateRig, props.onSuccess])
  
  const sheetRef = useRef<BottomSheetBehavior>(null);
  React.useEffect(() => {
    if (props.open) {
      sheetRef?.current?.snapTo(0);
    } else if (!props.open) {
      sheetRef?.current?.snapTo(1);
    }
  }, [props.open]);

  return (
    <DialogOrSheet
      title={ state.original?.id ? "Edit rig" : "New rig"}
      open={open}
      snapPoints={[700, 0]}
      onClose={() => {
        props.onClose();
        dispatch(rigForm.reset());
      }}
      buttonAction={onSave}
      buttonLabel="Save"
      loading={isLoading}
    >
      <RigForm showTypeSelect={!!props.dropzoneId} />
    </DialogOrSheet>
  )
}