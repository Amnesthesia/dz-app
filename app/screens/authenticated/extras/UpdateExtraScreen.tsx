import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { gql, useMutation } from "@apollo/client";
import { actions, useAppSelector, useAppDispatch } from '../../../redux';

import { View } from '../../../components/Themed';
import { actions as snackbar } from "../../../components/notifications";
import globalSlice from "../../../redux/global";

import slice from "../../../components/forms/extra/slice";
import { Mutation, Extra } from '../../../graphql/schema';
import ExtraForm from '../../../components/forms/extra/ExtraForm';
import { useNavigation, useRoute } from '@react-navigation/core';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useCurrentDropzone from '../../../graphql/hooks/useCurrentDropzone';


const MUTATION_UPDATE_EXTRA = gql`
  mutation UpdateExtra(
    $id: Int!,
    $name: String,
    $ticketTypeIds: [Int!]
    $cost: Float
    $dropzoneId: Int
  ){
    updateExtra(input: {
      id: $id
      attributes: {
        name: $name,
        ticketTypeIds: $ticketTypeIds
        cost: $cost
        dropzoneId: $dropzoneId
      }
    }) {
      extra {
        id
        name

        ticketTypes {
          id
          name
          cost
          altitude
          allowManifestingSelf
        }
      }
    }
  }
`;

export default function UpdateExtraScreen() {
  const currentDropzone = useCurrentDropzone();
  const state = useAppSelector(state => state.forms.extra);
  const dispatch = useAppDispatch();

  const navigation = useNavigation();
  const route = useRoute<{ key: string, name: string, params: { extra: Extra }}>();
  const extra = route.params!.extra;

  React.useEffect(() => {
    dispatch(actions.forms.extra.setOpen(extra));
  }, [extra?.id]);

  const [mutationUpdateExtra, data] = useMutation<Mutation>(MUTATION_UPDATE_EXTRA);

  const validate = React.useCallback((): boolean => {
    let hasError = false;
    if (state.fields.name.value.length < 3) {
      hasError = true;
      dispatch(
        actions.forms.extra.setFieldError(["name", "Name is too short"])
      );
    }

    if (Number(state.fields.cost.value) < 0) {
      hasError = true;
      dispatch(
        actions.forms.extra.setFieldError(["cost", "Price must be a number"])
      );
    }


    return !hasError;

  }, [JSON.stringify(state.fields), dispatch]);

  const onSave = React.useCallback(async () => {
    const { name, cost, ticketTypeIds } = state.fields;


    if (validate()) {
      try {
        const result = await mutationUpdateExtra({
          variables: {
            id: Number(state.original!.id!),
            dropzoneId: Number(currentDropzone?.dropzone?.id),
            name: name.value,
            cost: cost.value,
            ticketTypeIds: ticketTypeIds.value,
          }
        });
        
        if (result.data?.updateExtra?.extra) {
          dispatch(
            snackbar.showSnackbar({ message: `Saved`, variant: "success" })
          );
          navigation.goBack();
        }
      } catch (error) {
        dispatch(
          snackbar.showSnackbar({ message: error.message, variant: "error" })
        );
      }
    }
    
  }, [JSON.stringify(state.fields), dispatch, mutationUpdateExtra]);

  return (
    <ScrollableScreen contentContainerStyle={{ paddingHorizontal: 48 }}>
        <MaterialCommunityIcons name="ticket-percent" size={100} color="#999999" style={{ alignSelf: "center" }} />
        <ExtraForm />
        <View style={styles.fields}>
          <Button mode="contained" disabled={data.loading} onPress={onSave} loading={data.loading}>
            Save
          </Button>
      </View>
    </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  fields: {
    width: "100%",
    marginBottom: 16
  },
  field: {
    marginBottom: 8,
  }
});
