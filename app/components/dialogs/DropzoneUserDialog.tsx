import { gql, useMutation } from "@apollo/client";
import * as React from "react";
import { Button, Dialog, Portal, ProgressBar } from "react-native-paper";
import { DropzoneUser, Mutation } from "../../graphql/schema.d";
import { actions, useAppDispatch, useAppSelector } from "../../redux";
import DropzoneUserForm from "../forms/dropzone_user/DropzoneUserForm";
interface IDropzoneUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(user: DropzoneUser): void;
}

const MUTATION_EDIT_DROPZONE_USER = gql`
  mutation UpdateDropzoneUser(
    $userRoleId: Int,
    $expiresAt: Int,
    $dropzoneUserId: Int
  ) {
    updateDropzoneUser(
      input: {
        id: $dropzoneUserId,
        attributes: {
          userRoleId: $userRoleId,
          expiresAt: $expiresAt,
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      dropzoneUser {
        id
        credits
        expiresAt
        role {
          id
          name
        }

        user {
          id
          name
        }
      }
    }
  }
`;

export default function DropzoneUserDialog(props: IDropzoneUserDialog) {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.forms.dropzoneUser);
  const globalState = useAppSelector(state => state.global);
  const [mutationUpdateDropzoneUser, createData] = useMutation<Mutation>(MUTATION_EDIT_DROPZONE_USER);

  const validate = React.useCallback(() => {
    let hasErrors = false;
    
    if (!state.fields.role.value) {
      hasErrors = true;
      dispatch(
        actions.forms.dropzoneUser.setFieldError(["role", "User must have an access level"])
      );
    }

    if (!state.fields.expiresAt.value) {
      hasErrors = true;
      dispatch(
        actions.forms.dropzoneUser.setFieldError(["expiresAt", "Membership expiry must be set"])
      );
    }

    return !hasErrors;
  }, [JSON.stringify(state.fields)]);
  
  const onSave = React.useCallback(async () => {

    if (!validate()) {
      return;
    }
    try {
      const response = await mutationUpdateDropzoneUser({
        variables: {
          ...state.original?.id ? { id: state.original?.id } : {},
          userRoleId: Number(state.fields.role.value?.id),
          expiresAt: state.fields.expiresAt.value,
          dropzoneUserId: Number(state.original?.id),
        }
      });
      const result = response.data?.updateDropzoneUser;

      result?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case "user_role":
            return dispatch(actions.forms.dropzoneUser.setFieldError(["role", message]));
          case "expires_at":
            return dispatch(actions.forms.dropzoneUser.setFieldError(["expiresAt", message]));
        }
      });
      if (result?.errors?.length) {
        return dispatch(actions.notifications.showSnackbar({ message: result?.errors[0], variant: "error" }));
      }
      if (!result?.fieldErrors?.length) {
        props.onSuccess(result.dropzoneUser);
      } else {
        console.error(result.fieldErrors);
      }

    } catch(error) {
      dispatch(actions.notifications.showSnackbar({ message: error.message, variant: "error" }));
    } 
  }, [JSON.stringify(state.fields), mutationUpdateDropzoneUser, props.onSuccess])
  
  return (
    <Portal>
      <Dialog visible={!!props.open}>
        <ProgressBar indeterminate visible={createData.loading} color={globalState.theme.colors.accent} />
        <Dialog.Title>
          {`${state?.original?.id ? "Edit" : "New"} dropzone user`}
        </Dialog.Title>
        <Dialog.Content>
          <DropzoneUserForm />
        </Dialog.Content>
        <Dialog.Actions style={{ justifyContent: "flex-end"}}>
          <Button
            onPress={() => {
              dispatch(actions.forms.dropzoneUser.reset());
              props.onClose();
            }}
          >
            Cancel
          </Button>
          
          <Button onPress={onSave}>
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}