import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText, Checkbox, Divider } from 'react-native-paper';
import { actions, useAppSelector, useAppDispatch } from '../../../redux';

import PlaneSelect from '../../input/dropdown_select/PlaneSelect';
import DropzoneUserSelect from '../../input/dropdown_select/DropzoneUserSelect';

export default function LoadForm() {
  const state = useAppSelector(state => state.forms.load);
  const dispatch = useAppDispatch();
  const globalState = useAppSelector(state => state.global);


  return ( 
    <>
      <TextInput
        style={styles.field}
        mode="outlined"
        label="Name"
        error={!!state.fields.name.error}
        placeholder="Optional"
        value={state.fields.name.value || ""}
        autoFocus
        onChangeText={(newValue) => dispatch(actions.forms.load.setField(["name", newValue]))}
      />
      <HelperText type={!!state.fields.name.error ? "error" : "info"}>
        { state.fields.name.error || "e.g Starcrest load, Tandem load" }
      </HelperText>

      <TextInput
        style={styles.field}
        mode="outlined"
        label="Slots"
        error={!!state.fields.maxSlots.error}
        value={state.fields.maxSlots?.value?.toString()}
        onChangeText={(newValue) => dispatch(actions.forms.load.setField(["maxSlots", Number(newValue)]))}
      />
      <HelperText type={!!state.fields.maxSlots.error ? "error" : "info"}>
        { state.fields.maxSlots.error || "" }
      </HelperText>
      <View style={{ width: "100%"}}>
        <PlaneSelect
          value={state.fields.plane.value}
          required
          onSelect={(value) => {
            dispatch(actions.forms.load.setField(["plane", value]));
            dispatch(actions.forms.load.setField(["maxSlots", value.maxSlots]));
          }}
          dropzoneId={Number(globalState.currentDropzone?.id)}
        />
        <HelperText type={!!state.fields.plane.error ? "error" : "info"}>
          { state.fields.plane.error || "" }
        </HelperText>
        
        <Checkbox.Item
          label="Allow public manifesting"
          status={!!state.fields.isOpen.value
            ? "checked"
            : "unchecked"
          }
          onPress={
            () => dispatch(actions.forms.load.setField(["isOpen", !state.fields.isOpen.value]))
          }
        />

        <Divider style={{ marginVertical: 8 }} />
      
        <DropzoneUserSelect
          label="GCA"
          onSelect={dzUser => dispatch(actions.forms.load.setField(["gca", dzUser]))}
          dropzoneId={Number(globalState.currentDropzone?.id)}
          value={state.fields.gca.value || null}
          requiredPermissions={["actAsGCA"]}
          required
        />
        <HelperText type={!!state.fields.gca.error ? "error" : "info"}>
          { state.fields.gca.error || "" }
        </HelperText>
        
        <DropzoneUserSelect
          label="Pilot"
          onSelect={dzUser => dispatch(actions.forms.load.setField(["pilot", dzUser]))}
          dropzoneId={Number(globalState.currentDropzone?.id)}
          value={state.fields.pilot.value || null}
          requiredPermissions={["actAsPilot"]}
        />
        <HelperText type={!!state.fields.pilot.error ? "error" : "info"}>
          { state.fields.pilot.error || "" }
        </HelperText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    flex: 1,
    width: "100%"
  },
  field: {
    marginBottom: 8,
    width: "100%"
  }
})
