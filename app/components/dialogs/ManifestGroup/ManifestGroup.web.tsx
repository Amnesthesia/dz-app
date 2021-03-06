import { gql, useMutation } from "@apollo/client";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Dialog, Portal } from "react-native-paper";
import { Tabs, TabScreen, useTabNavigation } from 'react-native-paper-tabs';
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Mutation } from "../../../graphql/schema.d";
import { actions, useAppDispatch, useAppSelector } from "../../../redux";
import ManifestGroupForm from "../../forms/manifest_group/ManifestGroupForm";
import UserListSelect from "./UserListSelect";
interface IManifestUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(): void;
}

const MUTATION_CREATE_SLOTS = gql`
  mutation CreateSlot(
    $jumpTypeId: Int
    $extraIds: [Int!]
    $loadId: Int
    $ticketTypeId: Int
    $userGroup: [SlotUser!]!,
  ) {
    createSlots(
      input: {
        attributes: {
          jumpTypeId: $jumpTypeId
          extraIds: $extraIds
          loadId: $loadId
          ticketTypeId: $ticketTypeId
          userGroup: $userGroup,
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      
      load {
        id
        name
        loadNumber
        createdAt
        dispatchAt
        hasLanded
        maxSlots
        isFull
        isOpen
        plane {
          id
          name
        }
        gca {
          id
          user {
            id
            name
          }
        }
        pilot {
          id
          user {
            id
            name
          }
        }
        loadMaster {
          id
          user {
            id
            name
          }
        }
        slots {
          id
          createdAt
          user {
            id
            name
          }
          passengerName
          passengerExitWeight
          ticketType {
            id
            name
            isTandem
            altitude
          }
          jumpType {
            id
            name
          }
          extras {
            id
            name
          }
        }
      }
    }
  }
`;

function NextStepButton() {
  const setTab = useTabNavigation();

  return (
    <Button
      onPress={() => setTab(1)} 
      style={styles.button}
    >
      Next
    </Button>
  )
}
export default function ManifestUserDialog(props: IManifestUserDialog) {
  const { open } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.forms.manifestGroup);
  const globalState = useAppSelector(state => state.global);
  const [mutationCreateSlots, mutationData] = useMutation<Mutation>(MUTATION_CREATE_SLOTS);
  const [tabIndex, setTabIndex] = React.useState(0);

  const validate = React.useCallback(() => {
    let hasErrors = false;
    if (!state.fields.jumpType.value?.id) {
      hasErrors = true;
      dispatch(
        actions.forms.manifestGroup.setFieldError(["jumpType", "You must specify the type of jump"])
      );
    }

    if (!state.fields.ticketType.value?.id) {
      hasErrors = true;
      dispatch(
        actions.forms.manifestGroup.setFieldError(["ticketType", "You must select a ticket type to manifest"])
      );
    }

    return !hasErrors;
  }, [JSON.stringify(state.fields)]);
  const onManifest = React.useCallback(async () => {

    if (!validate()) {
      return;
    }
    try {
      const result = await mutationCreateSlots({
        variables: {
          jumpTypeId: Number(state.fields.jumpType.value?.id),
          ticketTypeId: Number(state.fields.ticketType.value?.id),
          extraIds: state.fields.extras?.value?.map(({ id }) => Number(id)),
          loadId: Number(state.fields.load.value?.id),
          userGroup: state.fields.users.value,
        }
      });

      result.data?.createSlots?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case "jump_type":
            return dispatch(actions.forms.manifestGroup.setFieldError(["jumpType", message]));
          case "load":
            return dispatch(actions.forms.manifestGroup.setFieldError(["load", message]));
          case "credits":
          case "extras":
          case "extra_ids":
            return dispatch(actions.forms.manifestGroup.setFieldError(["extras", message]));
          case "ticket_type":
            return dispatch(actions.forms.manifestGroup.setFieldError(["ticketType", message]));
        }
      });
      if (result?.data?.createSlots?.errors?.length) {
        return dispatch(actions.notifications.showSnackbar({ message: result?.data?.createSlots?.errors[0], variant: "error" }));
      }
      if (!result.data?.createSlots?.fieldErrors?.length) {
        props.onClose();
      }

    } catch(error) {
      dispatch(actions.notifications.showSnackbar({ message: error.message, variant: "error" }));
    } 
  }, [JSON.stringify(state.fields), mutationCreateSlots, props.onSuccess])
  
  
  const sheetRef = React.useRef<BottomSheet>(null);

  React.useEffect(() => {
    if (state.fields.ticketType?.value?.isTandem) {
      sheetRef?.current?.snapTo(0);
    }
  }, [state.fields.ticketType?.value?.isTandem])

  React.useEffect(() => {
    if (open) {
      sheetRef?.current?.snapTo(1);
    } else {
      sheetRef?.current?.close();
      props.onClose();
    }
  }, [open]);

  const snapPoints = React.useMemo(() => [0, 550], []);

  return (
    <Portal>
      <Dialog
        visible={!!props.open}
        onDismiss={props.onClose}
       >
         <View style={{ backgroundColor: "white"}} testID="manifest-group-sheet">
            <View pointerEvents={(state.fields.users?.value?.length || 0) > 0 ? undefined : "none"}>
              <Tabs defaultIndex={tabIndex} mode="fixed" onChangeIndex={setTabIndex}>
                <TabScreen label="Create group" ><View /></TabScreen>
                <TabScreen label="Configure jump"><View /></TabScreen>
              </Tabs>
            </View>
            
            {
              tabIndex === 0
                ? (
                  <View style={styles.userListContainer}>
                    <UserListSelect onNext={() => setTabIndex(1)} />
                  </View>
                ) : (
                  <ScrollView contentContainerStyle={{ paddingBottom: 200, flexGrow: 1}}>
                    <ManifestGroupForm />
                    <View style={styles.buttonContainer}>
                      <Button onPress={onManifest} loading={mutationData.loading} mode="contained" style={styles.button}>
                        Save
                      </Button>
                    </View>
                  </ScrollView>
                )
            }
          </View>
        </Dialog>
    </Portal>
  )
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: 16,
    padding: 5,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  userListContainer: {
    height: "100%",
    backgroundColor: "white",
    width: "100%",
    padding: 16,
  },
  sheet: {
    elevation: 3,
    backgroundColor: "white",
    flexGrow: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingBottom: 32,
  },
  sheetHeader: {
    elevation: 2,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    height: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    backgroundColor: "white",
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  }

})